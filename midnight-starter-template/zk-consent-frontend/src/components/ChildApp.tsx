import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { hashIdentifier, formatHash, isValidIdentifier } from '../lib/hash';
import { contractService } from '../lib/contract';
import { TikTokFeed } from './TikTokFeed';

export function ChildApp() {
  const { isConnected, address, walletName, connect, disconnect, isConnecting, error: walletError } = useWallet();
  const [childIdentifier, setChildIdentifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerifyConsent = async () => {
    setErrorMessage('');

    if (!isValidIdentifier(childIdentifier)) {
      setErrorMessage('Invalid identifier. Must be at least 3 characters (letters, numbers, @, ., -, _)');
      return;
    }

    setIsVerifying(true);

    try {
      // Generate hash from identifier (same SHA-256 hash as parent side)
      const hash = await hashIdentifier(childIdentifier);
      console.log('Verifying hash:', formatHash(hash));

      // Query the indexer to check if hash exists in the on-chain consent_registry
      const result = await contractService.verifyConsent(hash);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.isAuthorized) {
        setErrorMessage(
          'No parental consent found for this identifier.\n\n' +
          'Please ask your parent to grant consent first using the Parent Dashboard.'
        );
        return;
      }

      // Consent verified! Grant access to the interface
      setIsAuthorized(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to verify consent');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setChildIdentifier('');
    setErrorMessage('');
  };

  // If authorized, show TikTok feed
  if (isAuthorized) {
    return <TikTokFeed onLogout={handleLogout} />;
  }

  return (
    <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl transition-all hover:shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-yellow to-pastel-gold flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-left">
          <h3 className="font-display font-bold text-2xl text-gray-800">Child Verification</h3>
          <p className="text-sm text-gray-500 font-medium">Verify parental consent</p>
        </div>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <div className="mb-6">
          <button
            onClick={connect}
            disabled={isConnecting}
            className="wallet-btn w-full bg-gradient-to-r from-pastel-yellow to-pastel-gold hover:from-yellow-200 hover:to-yellow-300 text-amber-900 font-display font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-3">
              {isConnecting ? (
                <>
                  <div className="loader w-5 h-5 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Connect Wallet
                </>
              )}
            </span>
          </button>

          <p className="mt-3 text-xs text-center text-gray-500">
            Connect your own Lace wallet (different from parent's). Use "Undeployed" network.
          </p>

          {walletError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
              {walletError}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Wallet Connected</p>
                <p className="font-mono text-xs text-gray-500 truncate max-w-[150px]">
                  {address ? `${address.substring(0, 10)}...${address.substring(address.length - 4)}` : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active
              </span>
              <button
                onClick={disconnect}
                className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      {isConnected && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Your Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                value={childIdentifier}
                onChange={(e) => setChildIdentifier(e.target.value)}
                placeholder="Enter the identifier your parent gave you"
                className="w-full px-5 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-medium text-gray-800 focus:ring-4 focus:ring-sky-100 focus:border-sky-400 focus:outline-none transition-all placeholder:text-gray-400"
                disabled={isVerifying}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && childIdentifier.trim()) {
                    handleVerifyConsent();
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              This will be hashed and verified against the blockchain.
            </p>
          </div>

          <button
            onClick={handleVerifyConsent}
            disabled={!childIdentifier.trim() || isVerifying}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-display font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center justify-center gap-2">
              {isVerifying ? (
                <>
                  <div className="loader w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Checking on-chain registry...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Consent & Login
                </>
              )}
            </span>
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200 animate-fade-in shadow-sm">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 font-medium whitespace-pre-line">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Privacy Note:</strong> Your actual identifier is never stored on the blockchain. Only a cryptographic hash is used for verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
