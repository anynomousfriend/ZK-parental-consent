/**
 * CLI script to grant consent for a child identifier.
 *
 * Usage:
 *   npm run build && npm run grant-consent <child-id>
 *
 * If <child-id> is not provided as an argument, prompts for it.
 * Uses the seed from deployment-consent.json if available.
 */
import * as readline from "node:readline/promises";
import * as fs from "node:fs";
import * as path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import * as Rx from "rxjs";
import { WebSocket } from "ws";
import pino from "pino";
import pinoPretty from "pino-pretty";
import { Contract } from "./managed/consent/contract/index.js";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { setNetworkId, getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import * as ledger from "@midnight-ntwrk/ledger-v7";
import { createKeystore, InMemoryTransactionHistoryStorage, UnshieldedWallet, PublicKey } from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";
import { webcrypto } from "node:crypto";
// @ts-expect-error: needed for apollo WS transport
globalThis.WebSocket = WebSocket;
// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const INDEXER = process.env.INDEXER_URL ?? "http://127.0.0.1:8088/api/v3/graphql";
const INDEXER_WS = process.env.INDEXER_WS_URL ?? "ws://127.0.0.1:8088/api/v3/graphql/ws";
const NODE = process.env.NODE_URL ?? "http://127.0.0.1:9944";
const PROOF_SERVER = process.env.PROOF_SERVER_URL ?? "http://127.0.0.1:6300";
const NETWORK_ID = process.env.NETWORK_ID ?? "undeployed";
const currentDir = path.resolve(new URL(import.meta.url).pathname, "..");
const zkConfigPath = path.resolve(currentDir, "..", "src", "managed", "consent");
const deploymentPath = path.resolve(currentDir, "..", "deployment-consent.json");
// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------
const logger = pino({ level: process.env.DEBUG_LEVEL ?? "info" }, pinoPretty({
    colorize: true,
    sync: true,
    translateTime: true,
    ignore: "pid,time",
    singleLine: false
}));
const ConsentPrivateStateId = "consentPrivateState";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
async function withStatus(message, fn) {
    let i = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
    }, 80);
    try {
        const result = await fn();
        clearInterval(interval);
        process.stdout.write(`\r  ✓ ${message}\n`);
        return result;
    }
    catch (e) {
        clearInterval(interval);
        process.stdout.write(`\r  ✗ ${message}\n`);
        throw e;
    }
}
function deriveKeysFromSeed(seed) {
    const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
    if (hdWallet.type !== "seedOk")
        throw new Error("Failed to initialize HDWallet from seed");
    const result = hdWallet.hdWallet
        .selectAccount(0)
        .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
        .deriveKeysAt(0);
    if (result.type !== "keysDerived")
        throw new Error("Failed to derive keys");
    hdWallet.hdWallet.clear();
    return result.keys;
}
/**
 * Generate a SHA-256 hash of an identifier, truncated to a Field-compatible bigint.
 * Matches Frontend logic in hash.ts
 */
async function hashIdentifier(identifier) {
    const normalized = identifier.trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await webcrypto.subtle.digest("SHA-256", data);
    const hashBytes = new Uint8Array(hashBuffer);
    let hashBigint = 0n;
    for (const byte of hashBytes) {
        hashBigint = (hashBigint << 8n) | BigInt(byte);
    }
    // Truncate to fit within the BN254 scalar field (252 bits)
    const FIELD_MASK = (1n << 252n) - 1n;
    return hashBigint & FIELD_MASK;
}
// ---------------------------------------------------------------------------
// Wallet build
// ---------------------------------------------------------------------------
async function buildWallet(seed) {
    const keys = deriveKeysFromSeed(seed);
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
    const shieldedWallet = ShieldedWallet({
        networkId: getNetworkId(),
        indexerClientConnection: {
            indexerHttpUrl: INDEXER,
            indexerWsUrl: INDEXER_WS
        },
        provingServerUrl: new URL(PROOF_SERVER),
        relayURL: new URL(NODE.replace(/^http/, "ws"))
    }).startWithSecretKeys(shieldedSecretKeys);
    const unshieldedWallet = UnshieldedWallet({
        networkId: getNetworkId(),
        indexerClientConnection: {
            indexerHttpUrl: INDEXER,
            indexerWsUrl: INDEXER_WS
        },
        txHistoryStorage: new InMemoryTransactionHistoryStorage()
    }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    const dustWallet = DustWallet({
        networkId: getNetworkId(),
        costParameters: {
            additionalFeeOverhead: 300000000000000n,
            feeBlocksMargin: 5
        },
        indexerClientConnection: {
            indexerHttpUrl: INDEXER,
            indexerWsUrl: INDEXER_WS
        },
        provingServerUrl: new URL(PROOF_SERVER),
        relayURL: new URL(NODE.replace(/^http/, "ws"))
    }).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
    const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}
// ---------------------------------------------------------------------------
// Sign transaction intents
// ---------------------------------------------------------------------------
function signTransactionIntents(tx, signFn, proofMarker) {
    if (!tx.intents || tx.intents.size === 0)
        return;
    for (const segment of tx.intents.keys()) {
        const intent = tx.intents.get(segment);
        if (!intent)
            continue;
        const cloned = ledger.Intent.deserialize("signature", proofMarker, "pre-binding", intent.serialize());
        const sigData = cloned.signatureData(segment);
        const signature = signFn(sigData);
        if (cloned.fallibleUnshieldedOffer) {
            const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_, i) => cloned.fallibleUnshieldedOffer.signatures.at(i) ?? signature);
            cloned.fallibleUnshieldedOffer =
                cloned.fallibleUnshieldedOffer.addSignatures(sigs);
        }
        if (cloned.guaranteedUnshieldedOffer) {
            const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_, i) => cloned.guaranteedUnshieldedOffer.signatures.at(i) ?? signature);
            cloned.guaranteedUnshieldedOffer =
                cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
        }
        tx.intents.set(segment, cloned);
    }
}
// ---------------------------------------------------------------------------
// Provider creation
// ---------------------------------------------------------------------------
function createWalletAndMidnightProvider(wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore, syncedState) {
    return {
        getCoinPublicKey: () => syncedState.shielded.coinPublicKey.toHexString(),
        getEncryptionPublicKey: () => syncedState.shielded.encryptionPublicKey.toHexString(),
        async balanceTx(tx, ttl) {
            const recipe = await wallet.balanceUnboundTransaction(tx, { shieldedSecretKeys, dustSecretKey }, { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) });
            const signFn = (payload) => unshieldedKeystore.signData(payload);
            signTransactionIntents(recipe.baseTransaction, signFn, "proof");
            if (recipe.balancingTransaction) {
                signTransactionIntents(recipe.balancingTransaction, signFn, "pre-proof");
            }
            return wallet.finalizeRecipe(recipe);
        },
        async submitTx(tx) {
            return wallet.submitTransaction(tx);
        }
    };
}
// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    setNetworkId(NETWORK_ID);
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║           ZK Consent Gateway — Grant Consent           ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
    // --- Load Deployment config ---
    let deploymentConfig;
    try {
        const data = fs.readFileSync(deploymentPath, "utf-8");
        deploymentConfig = JSON.parse(data);
    }
    catch (e) {
        console.error("Error reading deployment-consent.json. Have you deployed the contract?");
        process.exit(1);
    }
    const { contractAddress, seed } = deploymentConfig;
    if (!contractAddress || !seed) {
        console.error("Invalid deployment config. Missing contractAddress or seed.");
        process.exit(1);
    }
    console.log(`  Contract Address: ${contractAddress}`);
    console.log(`  Wallet Seed:      ${seed.slice(0, 8)}... (from deployment)\n`);
    // --- Child ID Prompt ---
    const rl = readline.createInterface({ input, output });
    const args = process.argv.slice(2);
    let childId = args[0];
    if (!childId) {
        childId = await rl.question("Enter Child Identifier (e.g. email): ");
    }
    rl.close();
    if (!childId) {
        console.error("Child identifier is required.");
        process.exit(1);
    }
    const childHash = await hashIdentifier(childId);
    console.log(`\n  Granting consent for: "${childId}"`);
    console.log(`  Hash (truncated):     ${childHash.toString(16).substring(0, 16)}...\n`);
    // --- Build wallet ---
    const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } = await withStatus("Restoring wallet", () => buildWallet(seed));
    // --- Wait for sync ---
    const syncedState = await withStatus("Syncing wallet", () => Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5_000), Rx.filter((s) => s.isSynced))));
    // --- Build providers ---
    const walletAndMidnightProvider = createWalletAndMidnightProvider(wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore, syncedState);
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const providers = {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: "consent-private-state",
            signingKeyStoreName: "signing-keys",
            midnightDbName: "midnight-level-db",
            walletProvider: walletAndMidnightProvider
        }),
        publicDataProvider: indexerPublicDataProvider(INDEXER, INDEXER_WS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider
    };
    const consentCompiledContract = CompiledContract.make("consent", Contract).pipe(CompiledContract.withVacantWitnesses, CompiledContract.withCompiledFileAssets(zkConfigPath));
    // --- Find Contract ---
    const contract = await withStatus("Finding deployed contract", () => findDeployedContract(providers, {
        contractAddress,
        compiledContract: consentCompiledContract,
        privateStateId: ConsentPrivateStateId,
        initialPrivateState: {}
    }));
    // --- Call Grant Consent ---
    console.log("\n  Proving and submitting transaction...");
    try {
        const tx = await contract.callTx.grant_consent(childHash);
        console.log(`\n  ✅ SUCCESS! Consent granted.`);
        console.log(`  Transaction ID: ${tx.public.txId}`);
        console.log(`  Child ID:       ${childId}`);
        console.log(`  Hash:           0x${childHash.toString(16)}`);
        console.log(`\n  You can now verify this in the Frontend Child App!\n`);
    }
    catch (e) {
        console.error(`\n  ❌ Failed to grant consent: ${e.message}`);
        if (e.cause)
            console.error(e.cause);
    }
    // Cleanup
    try {
        await wallet.stop();
    }
    catch { }
    process.exit(0);
}
main().catch((err) => {
    logger.error(err, "Grant failed");
    process.exit(1);
});
//# sourceMappingURL=grant-consent.js.map