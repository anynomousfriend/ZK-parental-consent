
/**
 * Direct Contract Service - Client-Side Signing
 * 
 * Interacts with the Midnight contract directly from the browser.
 * This triggers wallet popups for transactions (Grant Consent).
 */

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Buffer } from 'buffer';
// Import Midnight SDK
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import * as deployedContract from '../contract-artifacts/contract';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { MIDNIGHT_CONFIG } from './config';

export interface GrantConsentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

class DirectContractService {
  /**
   * Grant consent by calling the contract in the browser.
   * This WILL trigger a wallet popup.
   */
  async grantConsent(childIdHash: bigint, connectedAPI: ConnectedAPI): Promise<GrantConsentResult> {
    try {
      console.log('🔵 [DirectContract] Initializing providers...');

      // 1. ZK Config Provider 
      // (Mock/Empty for now if we don't need local proving keys, or if proof server handles it)
      // Actually httpClientProofProvider needs it.
      const zkConfigProvider = {
        getZkConfig: async () => {
          return Buffer.alloc(0);
        }
      };

      // 2. Initialize Providers with correct signatures
      const providers = {
        privateStateProvider: levelPrivateStateProvider({
          privateStateStoreName: 'consent-private-state',
        }),
        publicDataProvider: indexerPublicDataProvider(
          MIDNIGHT_CONFIG.indexer,
          MIDNIGHT_CONFIG.indexerWS
        ),
        zkConfigProvider: zkConfigProvider,
        proofProvider: httpClientProofProvider(
          MIDNIGHT_CONFIG.proofServer,
          zkConfigProvider
        ),
        walletProvider: connectedAPI, // LACE WALLET
        midnightProvider: connectedAPI, // Required by MidnightProviders type
      };

      console.log('🔵 [DirectContract] Connecting to contract...');

      const contract = await findDeployedContract(providers, {
        compiledContract: deployedContract,
        contractAddress: MIDNIGHT_CONFIG.contractAddress,
      });

      console.log('🟡 [DirectContract] Submitting transaction (Popup expected)...');

      // Call the circuit!
      const tx = await contract.callTx.grant_consent(childIdHash);

      console.log('✅ [DirectContract] Transaction submitted!', tx.public.txHash);

      return {
        success: true,
        txHash: tx.public.txHash,
      };

    } catch (error: any) {
      console.error('🔴 [DirectContract] Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during signing',
      };
    }
  }

  // Verification helper
  async verifyConsent(childIdHash: bigint): Promise<boolean> {
    return false;
  }
}

export const directContractService = new DirectContractService();
