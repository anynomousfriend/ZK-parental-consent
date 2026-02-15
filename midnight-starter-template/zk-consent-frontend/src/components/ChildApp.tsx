
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { hashIdentifier } from '../lib/hash';
// Import TikTok Feed Logic
import { TikTokFeed } from './TikTokFeed';

export const ChildApp: React.FC = () => {
  const { isConnected, connect } = useWallet();
  const [identifier, setIdentifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!identifier) return;
    setIsVerifying(true);
    setError(null);

    try {
      // 1. Hash Identity
      const hash = await hashIdentifier(identifier);
      const hexHash = hash.toString(16).padStart(64, '0'); // Ensure padding for API

      // 2. Call Proof Verification API (No Wallet Needed for Reading Public State)
      // We use the backend API to query the indexer without gas fees
      const response = await fetch(`/api/consent/verify/${hexHash}`);
      const result = await response.json();

      if (result.error) throw new Error(result.error);

      if (result.isAuthorized) {
        setAccessGranted(true);
      } else {
        throw new Error('ACCESS_DENIED: No consent record found on ledger.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification Failed');
      setAccessGranted(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (accessGranted) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6 glass-panel p-4 rounded-lg border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-mono text-sm tracking-wider">ACCESS_LEVEL: UNRESTRICTED</span>
          </div>
          <button
            onClick={() => setAccessGranted(false)}
            className="text-gray-500 hover:text-white text-xs font-mono"
          >
            [LOCK_SESSION]
          </button>
        </div>
        <TikTokFeed />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-[rgba(6,182,212,0.1)] mb-4 border border-[var(--color-neon-cyan)]">
            <svg className="w-8 h-8 text-[var(--color-neon-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">Restricted Access</h2>
          <p className="text-gray-400 text-sm font-mono">Authentication Required via ZK Proof</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Identity Hash / Username"
            className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-center text-white focus:border-[var(--color-neon-cyan)] focus:outline-none transition-colors font-mono tracking-widest"
          />

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs font-mono text-center">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || !identifier}
            className={`w-full py-4 rounded-lg font-bold tracking-widest uppercase transition-all duration-300 ${isVerifying
                ? 'bg-gray-800 text-gray-500 cursor-wait'
                : 'bg-white text-black hover:bg-[var(--color-neon-cyan)] hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
          >
            {isVerifying ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE'}
          </button>
        </div>

        {!isConnected && (
          <p className="mt-6 text-center text-xs text-gray-600 font-mono">
            Note: Verification relies on public ledger state.<br />Wallet connection optional for viewing.
          </p>
        )}
      </div>
    </div>
  );
};
