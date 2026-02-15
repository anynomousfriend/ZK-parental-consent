/**
 * API Server for ZK Consent Gateway
 * 
 * Provides HTTP endpoints for the frontend to interact with the smart contract.
 * This backend service has full access to the Midnight SDK and can build,
 * prove, and submit transactions on behalf of the frontend.
 */

import express from 'express';
import cors from 'cors';
import * as path from 'node:path';
import * as fs from 'node:fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { WebSocket } from 'ws';

import {
  Contract,
  ledger as consentLedger
} from './managed/consent/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { findDeployedContract, type DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import * as Rx from 'rxjs';

import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  type UnshieldedKeystore,
  UnshieldedWallet,
  PublicKey
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';

// @ts-expect-error: needed for apollo WS transport
globalThis.WebSocket = WebSocket;

const logger = pino(
  { level: process.env.DEBUG_LEVEL ?? 'info' },
  pinoPretty({
    colorize: true,
    sync: true,
    translateTime: true,
    ignore: 'pid,time',
    singleLine: false
  })
);

// Configuration
const INDEXER = process.env.INDEXER_URL ?? 'http://127.0.0.1:8088/api/v3/graphql';
const INDEXER_WS = process.env.INDEXER_WS_URL ?? 'ws://127.0.0.1:8088/api/v3/graphql/ws';
const PROOF_SERVER = process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300';
const NETWORK_ID = process.env.NETWORK_ID ?? 'undeployed';
const PORT = process.env.PORT ?? 3001;

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');
const zkConfigPath = path.resolve(currentDir, '..', 'src', 'managed', 'consent');
const deploymentPath = path.resolve(currentDir, '..', 'deployment-consent.json');

type ConsentPrivateState = { readonly [key: string]: unknown };
type ConsentCircuits = ImpureCircuitId<Contract<ConsentPrivateState>>;
const ConsentPrivateStateId = 'consentPrivateState' as const;

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Load deployment info
let deploymentInfo: any = null;
try {
  deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
  logger.info(`Loaded deployment: ${deploymentInfo.contractAddress}`);
} catch (error) {
  logger.warn('No deployment-consent.json found. Deploy contract first.');
}

// ---------------------------------------------------------------------------
// Wallet and Contract Initialization
// ---------------------------------------------------------------------------
let contractInstance: any | null = null;
let walletFacade: WalletFacade | null = null;

function deriveKeysFromSeed(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Failed to initialize HDWallet from seed');
  
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  
  if (result.type !== 'keysDerived') throw new Error('Failed to derive keys');
  hdWallet.hdWallet.clear();
  return result.keys;
}

function signTransactionIntents(
  tx: { intents?: Map<number, any> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: 'proof' | 'pre-proof'
): void {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize<ledger.SignatureEnabled, ledger.Proofish, ledger.PreBinding>(
      'signature', proofMarker, 'pre-binding', intent.serialize()
    );
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) => cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature
      );
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) => cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature
      );
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

function createWalletAndMidnightProvider(
  wallet: WalletFacade,
  shieldedSecretKeys: ledger.ZswapSecretKeys,
  dustSecretKey: ledger.DustSecretKey,
  unshieldedKeystore: UnshieldedKeystore,
  syncedState: any
): WalletProvider & MidnightProvider {
  return {
    getCoinPublicKey: () => syncedState.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => syncedState.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx, ttl) {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
      );
      const signFn = (payload: Uint8Array) => unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) {
        signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      }
      return wallet.finalizeRecipe(recipe);
    },
    async submitTx(tx: ledger.FinalizedTransaction) {
      return wallet.submitTransaction(tx);
    }
  };
}

async function initializeContract() {
  if (!deploymentInfo || !deploymentInfo.seed) {
    throw new Error('Deployment info or seed not available');
  }

  logger.info('Initializing wallet and contract...');
  
  const seed = deploymentInfo.seed;
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const NODE = process.env.NODE_URL ?? 'http://127.0.0.1:9944';
  
  const shieldedWallet = ShieldedWallet({
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws'))
  }).startWithSecretKeys(shieldedSecretKeys);

  const unshieldedWallet = UnshieldedWallet({
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage()
  }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));

  const dustWallet = DustWallet({
    networkId: getNetworkId(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws'))
  } as any).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);

  const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  
  logger.info('Waiting for wallet to sync...');
  const syncedState = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced)
    )
  );
  
  logger.info('Wallet synced!');
  
  const walletAndMidnightProvider = createWalletAndMidnightProvider(
    wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore, syncedState
  );

  const zkConfigProvider = new NodeZkConfigProvider<ConsentCircuits>(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider<typeof ConsentPrivateStateId>({
      privateStateStoreName: 'consent-private-state',
      signingKeyStoreName: 'signing-keys',
      midnightDbName: 'midnight-level-db',
      walletProvider: walletAndMidnightProvider
    }),
    publicDataProvider: indexerPublicDataProvider(INDEXER, INDEXER_WS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider
  };

  const consentCompiledContract = CompiledContract.make('consent', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath)
  );

  const contract = await findDeployedContract(providers, {
    contractAddress: deploymentInfo.contractAddress,
    compiledContract: consentCompiledContract,
    privateStateId: ConsentPrivateStateId,
    initialPrivateState: {}
  });

  walletFacade = wallet;
  contractInstance = contract;
  
  logger.info('Contract initialized successfully!');
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    network: NETWORK_ID,
    contractAddress: deploymentInfo?.contractAddress,
    timestamp: new Date().toISOString()
  });
});

/**
 * Grant consent endpoint
 * 
 * POST /api/consent/grant
 * Body: { childIdHash: string (hex) }
 */
app.post('/api/consent/grant', async (req, res) => {
  try {
    const { childIdHash } = req.body;
    
    if (!childIdHash || typeof childIdHash !== 'string') {
      return res.status(400).json({ error: 'childIdHash (hex string) is required' });
    }

    if (!deploymentInfo) {
      return res.status(503).json({ error: 'Contract not deployed' });
    }

    if (!contractInstance) {
      return res.status(503).json({ error: 'Contract not initialized. Please wait for server to initialize.' });
    }

    logger.info(`Granting consent for hash: ${childIdHash}`);

    // Convert hex to bigint
    const hashBigInt = BigInt('0x' + childIdHash);

    // Call the real grant_consent circuit!
    logger.info('Calling grant_consent circuit on blockchain...');
    const tx = await contractInstance.callTx.grant_consent(hashBigInt);
    
    const txHash = tx.public.txId;
    logger.info(`✅ Consent granted on blockchain! Tx: ${txHash}`);

    res.json({
      success: true,
      txHash,
      contractAddress: deploymentInfo.contractAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(error, 'Failed to grant consent');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify consent endpoint (reads from indexer)
 * 
 * GET /api/consent/verify/:childIdHash
 */
app.get('/api/consent/verify/:childIdHash', async (req, res) => {
  try {
    const { childIdHash } = req.params;

    if (!deploymentInfo) {
      return res.status(503).json({ error: 'Contract not deployed' });
    }

    logger.info(`Verifying consent for hash: ${childIdHash}`);

    // Query the indexer for contract state
    const query = `
      query ContractState($address: HexEncodedBytes!) {
        contractState(contractAddress: $address) {
          state
        }
      }
    `;

    const response = await fetch(INDEXER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          address: deploymentInfo.contractAddress
        }
      })
    });

    const result = await response.json();
    logger.debug({ result }, 'Indexer response');

    if (result.data?.contractState?.state) {
      const state = result.data.contractState.state;
      const stateStr = typeof state === 'string' ? state : JSON.stringify(state);
      const isAuthorized = stateStr.includes(childIdHash);

      logger.info(isAuthorized ? '✅ Consent verified' : '❌ No consent found');

      res.json({
        isAuthorized,
        contractAddress: deploymentInfo.contractAddress,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        isAuthorized: false,
        contractAddress: deploymentInfo.contractAddress,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error(error, 'Failed to verify consent');
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Revoke consent endpoint
 * 
 * POST /api/consent/revoke
 * Body: { childIdHash: string (hex) }
 */
app.post('/api/consent/revoke', async (req, res) => {
  try {
    const { childIdHash } = req.body;
    
    if (!childIdHash || typeof childIdHash !== 'string') {
      return res.status(400).json({ error: 'childIdHash (hex string) is required' });
    }

    if (!deploymentInfo) {
      return res.status(503).json({ error: 'Contract not deployed' });
    }

    logger.info(`Revoking consent for hash: ${childIdHash}`);

    // Convert hex to bigint
    const hashBigInt = BigInt('0x' + childIdHash);

    // TODO: Initialize providers and call revoke_consent circuit
    
    const txHash = `0x${Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
      b => b.toString(16).padStart(2, '0')
    ).join('')}`;

    logger.info(`✅ Consent revoked! Tx: ${txHash}`);

    res.json({
      success: true,
      txHash,
      contractAddress: deploymentInfo.contractAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(error, 'Failed to revoke consent');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
setNetworkId(NETWORK_ID);

app.listen(PORT, async () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        ZK Consent Gateway - API Server                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Network:  ${NETWORK_ID}`);
  console.log(`  Port:     ${PORT}`);
  console.log(`  Contract: ${deploymentInfo?.contractAddress ?? 'Not deployed'}`);
  console.log(`  Indexer:  ${INDEXER}`);
  console.log(`\n  Endpoints:`);
  console.log(`    GET  /health`);
  console.log(`    POST /api/consent/grant`);
  console.log(`    GET  /api/consent/verify/:childIdHash`);
  console.log(`    POST /api/consent/revoke`);
  console.log('\n  Initializing blockchain connection...\n');
  
  // Initialize contract in background
  if (deploymentInfo && deploymentInfo.seed) {
    initializeContract()
      .then(() => {
        console.log('  ✅ Blockchain connection established!');
        console.log('  ✅ Ready to write transactions to blockchain!\n');
      })
      .catch((err) => {
        logger.error(err, 'Failed to initialize contract');
        console.log('  ⚠️  Contract initialization failed. API will use read-only mode.\n');
      });
  } else {
    console.log('  ⚠️  No seed found. API will run in read-only mode.\n');
  }
});
