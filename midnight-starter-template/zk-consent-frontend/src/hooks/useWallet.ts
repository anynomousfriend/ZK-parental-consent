/**
 * React Hook for Wallet Integration
 * 
 * Provides easy-to-use wallet functionality in React components.
 * Uses the DApp Connector API v4 via the wallet service.
 */

import { useState, useEffect, useCallback } from 'react';
import { walletService, type WalletState } from '../lib/wallet';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export function useWallet() {
  const [state, setState] = useState<WalletState>(walletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = walletService.subscribe(setState);
    return unsubscribe;
  }, []);

  // Connect wallet via Lace DApp Connector
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await walletService.connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
      setError(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
    }
  }, []);

  // Get the connected API instance for contract interactions
  const getConnectedAPI = useCallback((): ConnectedAPI | null => {
    return walletService.connectedAPI;
  }, []);

  return {
    ...state,
    isConnecting,
    error,
    connect,
    disconnect,
    getConnectedAPI,
  };
}
