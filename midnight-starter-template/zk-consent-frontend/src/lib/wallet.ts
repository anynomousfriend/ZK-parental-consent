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
      // Check if Lace extension is installed
      if (!window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error(
          'Midnight Lace wallet not detected. Please install the Lace extension and refresh the page.'
        );
      }

      // Get the first available wallet
      const walletKeys = Object.keys(window.midnight);
      const initialAPI: InitialAPI = window.midnight[walletKeys[0]];

      console.log(`Connecting to wallet: ${initialAPI.name} (API v${initialAPI.apiVersion})`);

      // Connect to the undeployed local network
      const connectedAPI = await initialAPI.connect(MIDNIGHT_CONFIG.networkId);
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
