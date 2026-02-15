/**
 * Lace Wallet Connection Service
 * 
 * Connects to the Midnight Lace wallet extension via the DApp Connector API v4.
 * The Lace extension injects `window.midnight` containing InitialAPI instances.
 */

import type { InitialAPI, ConnectedAPI, WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { MIDNIGHT_CONFIG } from './config';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: bigint | null;
  networkId: string | null;
  walletName: string | null;
}

class WalletService {
  private state: WalletState = {
    isConnected: false,
    address: null,
    balance: null,
    networkId: null,
    walletName: null,
  };
  private listeners: Set<(state: WalletState) => void> = new Set();
  private _connectedAPI: ConnectedAPI | null = null;

  /**
   * Get the connected wallet API instance (for use by contract service)
   */
  get connectedAPI(): ConnectedAPI | null {
    return this._connectedAPI;
  }

  /**
   * Wait for window.midnight to be injected by Lace extension
   */
  private async waitForMidnight(maxWaitMs: number = 5000): Promise<void> {
    const startTime = Date.now();
    let attempts = 0;

    console.log('🔵 [Wallet] Checking for window.midnight...');
    console.log('🔵 [Wallet] window.midnight exists?', !!window.midnight);
    console.log('🔵 [Wallet] typeof window.midnight:', typeof window.midnight);

    while (!window.midnight || Object.keys(window.midnight).length === 0) {
      attempts++;
      const elapsed = Date.now() - startTime;

      if (elapsed > maxWaitMs) {
        console.error('🔴 [Wallet] Timeout after', attempts, 'attempts');
        console.error('🔴 [Wallet] window.midnight:', window.midnight);
        throw new Error(
          'Midnight Lace wallet not detected. Please install the Lace extension and refresh the page.'
        );
      }

      if (attempts % 10 === 0) {
        console.log(`🟡 [Wallet] Still waiting... attempt ${attempts}, elapsed ${elapsed}ms`);
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🟢 [Wallet] Lace wallet extension detected!');
    console.log('🟢 [Wallet] Available wallets:', Object.keys(window.midnight));
  }

  /**
   * Detect available Midnight wallets from window.midnight
   */
  getAvailableWallets(): InitialAPI[] {
    if (!window.midnight) return [];
    return Object.values(window.midnight);
  }

  /**
   * Connect to the Lace Wallet via DApp Connector API v4
   */
  async connect(): Promise<WalletState> {
    try {
      console.log('🔵 [Wallet] Starting connection process...');

      // Wait for window.midnight to be injected (Lace may inject it lazily)
      console.log('🔵 [Wallet] Waiting for Lace wallet extension...');
      await this.waitForMidnight();

      // Get the first available wallet
      const walletKeys = Object.keys(window.midnight);
      console.log('🔵 [Wallet] Available wallets:', walletKeys);

      const initialAPI: InitialAPI = window.midnight[walletKeys[0]];
      console.log(`🔵 [Wallet] Connecting to wallet: ${initialAPI.name} (API v${initialAPI.apiVersion})`);

      // Connect to the undeployed local network
      console.log(`🔵 [Wallet] Calling initialAPI.connect('${MIDNIGHT_CONFIG.networkId}')...`);
      const connectedAPI = await initialAPI.connect(MIDNIGHT_CONFIG.networkId);
      console.log('🟢 [Wallet] Connection successful!');

      this._connectedAPI = connectedAPI;



      // Get wallet address
      const { unshieldedAddress } = await connectedAPI.getUnshieldedAddress();

      // Get balances
      let balance = 0n;
      try {
        const balances = await connectedAPI.getUnshieldedBalances();
        // Sum all token balances
        for (const val of Object.values(balances)) {
          balance += val;
        }
      } catch {
        // Balance may not be available immediately
        console.warn('Could not fetch balance, continuing...');
      }

      // Get configuration to verify network
      const config = await connectedAPI.getConfiguration();

      this.state = {
        isConnected: true,
        address: unshieldedAddress,
        balance,
        networkId: config.networkId,
        walletName: initialAPI.name,
      };

      this.notifyListeners();
      console.log('Wallet connected:', this.state);
      return this.state;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Check if it's a DApp Connector API error
      if (error && typeof error === 'object' && 'type' in error && (error as any).type === 'DAppConnectorAPIError') {
        const apiError = error as any;
        throw new Error(`Wallet error (${apiError.code}): ${apiError.reason}`);
      }
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this._connectedAPI = null;
    this.state = {
      isConnected: false,
      address: null,
      balance: null,
      networkId: null,
      walletName: null,
    };
    this.notifyListeners();
    console.log('Wallet disconnected');
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// Export singleton instance
export const walletService = new WalletService();
