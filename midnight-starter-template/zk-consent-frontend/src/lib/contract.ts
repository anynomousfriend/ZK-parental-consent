/**
 * Contract Service
 * 
 * Handles interaction with the deployed ZK Consent Gateway smart contract.
 * 
 * - grant_consent: Parent calls this to store a child's hashed ID on-chain.
 *   Uses the Lace wallet's proving + balancing + submission pipeline.
 * 
 * - verify_minor_access: Child reads the public consent_registry ledger via 
 *   the indexer (no transaction needed — it's a public ledger read).
 */

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { MIDNIGHT_CONFIG, APP_CONFIG } from './config';

export interface ContractState {
  contractAddress: string;
  networkId: string;
  isInitialized: boolean;
}

export interface GrantConsentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface VerifyConsentResult {
  isAuthorized: boolean;
  error?: string;
}

class ContractService {
  private state: ContractState = {
    contractAddress: MIDNIGHT_CONFIG.contractAddress,
    networkId: MIDNIGHT_CONFIG.networkId,
    isInitialized: false,
  };

  /**
   * Initialize the contract service
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) return;
    this.state.isInitialized = true;
    console.log('Contract service initialized');
    console.log('Contract address:', this.state.contractAddress);
  }

  /**
   * Grant consent for a child by calling the grant_consent circuit on-chain.
   * 
   * This builds a transaction that calls grant_consent(child_id_hash),
   * then uses the Lace wallet to prove, balance, and submit it.
   * 
   * @param childIdHash - The SHA-256 hash of the child's identifier (as bigint)
   * @param connectedAPI - The connected Lace wallet API
   */
  async grantConsent(childIdHash: bigint, connectedAPI: ConnectedAPI): Promise<GrantConsentResult> {
    await this.initialize();

    try {
      console.log('Calling grant_consent circuit with hash:', childIdHash.toString(16));

      // Get the wallet configuration to confirm we're on the right network
      const config = await connectedAPI.getConfiguration();
      console.log('Wallet network:', config.networkId);

      // Call the backend API server to handle contract interaction
      console.log('Calling backend API to grant consent...');
      
      const response = await fetch(`${APP_CONFIG.apiUrl}/api/consent/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childIdHash: childIdHash.toString(16).padStart(64, '0')
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const result = await response.json();

      console.log('✅ Consent hash recorded!');
      console.log('Hash:', childIdHash.toString(16));
      console.log('Transaction:', result.txHash);

      return {
        success: result.success,
        txHash: result.txHash,
      };
    } catch (error) {
      console.error('Failed to grant consent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Revoke consent for a child
   * 
   * @param childIdHash - The hash of the child's identifier
   * @param connectedAPI - The connected Lace wallet API
   */
  async revokeConsent(childIdHash: bigint, connectedAPI: ConnectedAPI): Promise<GrantConsentResult> {
    await this.initialize();

    try {
      console.log('Calling revoke_consent circuit with hash:', childIdHash.toString(16));

      // Call the backend API server to revoke consent
      const response = await fetch(`${APP_CONFIG.apiUrl}/api/consent/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childIdHash: childIdHash.toString(16).padStart(64, '0')
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const result = await response.json();

      console.log('✅ Consent revoked!');
      return { 
        success: result.success,
        txHash: result.txHash 
      };
    } catch (error) {
      console.error('Failed to revoke consent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify if a child has consent by reading the public consent_registry from the indexer.
   * 
   * Since consent_registry is an `export ledger` (public state), we can read it
   * directly via the indexer's GraphQL API without needing a ZK proof or transaction.
   * 
   * @param childIdHash - The SHA-256 hash of the child's identifier (as bigint)
   */
  async verifyConsent(childIdHash: bigint): Promise<VerifyConsentResult> {
    await this.initialize();

    try {
      console.log('Verifying consent for hash:', childIdHash.toString(16));
      
      // Call the backend API server to verify consent
      const hashHex = childIdHash.toString(16).padStart(64, '0');
      const response = await fetch(`${APP_CONFIG.apiUrl}/api/consent/verify/${hashHex}`);

      if (!response.ok) {
        console.warn('API verification failed, falling back to direct indexer query');
        return this.verifyConsentFallback(childIdHash);
      }

      const result = await response.json();
      console.log(result.isAuthorized ? '✅ Consent verified on-chain!' : '❌ No consent found on-chain');
      
      return { isAuthorized: result.isAuthorized };
    } catch (error) {
      console.error('Failed to verify consent via API:', error);
      return this.verifyConsentFallback(childIdHash);
    }
  }

  /**
   * Fallback verification when indexer is unavailable.
   * Uses the connected wallet's configuration to try alternative endpoints.
   */
  private async verifyConsentFallback(childIdHash: bigint): Promise<VerifyConsentResult> {
    console.log('Using fallback verification for hash:', childIdHash.toString(16));

    // Try the alternative indexer endpoint format
    const altIndexerUrl = MIDNIGHT_CONFIG.indexer.replace('/api/v3/', '/api/v1/');

    try {
      const query = `
        query ContractState($address: HexEncodedBytes!) {
          contractState(contractAddress: $address) {
            state
          }
        }
      `;

      const response = await fetch(altIndexerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { address: MIDNIGHT_CONFIG.contractAddress },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data?.contractState?.state) {
          const hashHex = childIdHash.toString(16).padStart(64, '0');
          const stateStr = typeof result.data.contractState.state === 'string'
            ? result.data.contractState.state
            : JSON.stringify(result.data.contractState.state);
          const isAuthorized = stateStr.includes(hashHex);
          return { isAuthorized };
        }
      }
    } catch {
      console.warn('Fallback indexer also unavailable');
    }

    // Final fallback: return not authorized
    return {
      isAuthorized: false,
      error: 'Could not reach the indexer to verify consent. Ensure Docker containers are running.',
    };
  }

  /**
   * Get current contract state
   */
  getState(): ContractState {
    return { ...this.state };
  }
}

// Export singleton instance
export const contractService = new ContractService();
