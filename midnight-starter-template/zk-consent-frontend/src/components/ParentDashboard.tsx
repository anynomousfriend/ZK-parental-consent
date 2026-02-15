import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { hashIdentifier, formatHash, isValidIdentifier } from '../lib/hash';
import { contractService } from '../lib/contract';


export function ParentDashboard() {
  const { isConnected, address, connect, disconnect, isConnecting, error: walletError, getConnectedAPI } = useWallet();
  const [childIdentifier, setChildIdentifier] = useState('');
  const [generatedHash, setGeneratedHash] = useState<bigint | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerateHash = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!isValidIdentifier(childIdentifier)) {
      setErrorMessage('Invalid identifier. Must be at least 3 characters (letters, numbers, @, ., -, _)');
      return;
    }

    try {
      const hash = await hashIdentifier(childIdentifier);
      setGeneratedHash(hash);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate hash');
    }
  };

  const handleGrantConsent = async () => {
    if (!generatedHash) return;

    // We still check for wallet connection to ensure the user is "authenticated" in the UI sense,
    // even though the actual transaction is handled by the backend CLI wallet.
    const connectedAPI = getConnectedAPI();
    if (!connectedAPI) {
      setErrorMessage('Wallet not connected. Please connect your Lace wallet first.');
      return;
    }

    setIsGranting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Call the contract service to grant consent
      const result = await contractService.grantConsent(generatedHash, connectedAPI);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to grant consent on-chain');
      }

      setSuccessMessage(
        `✅ Consent granted successfully on Midnight Chain!\n\n` +
        `Child: ${childIdentifier}\n` +
        `Hash: ${formatHash(generatedHash)}\n` +
        `Transaction: ${result.txHash || 'Submitted'}\n\n` +
        `You can now switch to "Child Mode" and verify access immediately.`
      );

      // Reset form
      setChildIdentifier('');
      setGeneratedHash(null);
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to grant consent');
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl transition-all hover:shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-left">
          <h3 className="font-display font-bold text-2xl text-gray-800">Parent Dashboard</h3>
          <p className="text-sm text-gray-500 font-medium">Manage your child's platform access</p>
        </div>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <div className="mb-6">
          <button
            onClick={connect}
            disabled={isConnecting}
            className="wallet-btn w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-display font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-3">
              {isConnecting ? (
                <>
                  <div className="loader w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Connect Lace Wallet
                </>
              )}
            </span>
          </button>

          <p className="mt-3 text-xs text-center text-gray-500">
            Requires Midnight Lace wallet extension. Connect to "Undeployed" network.
          </p>

          {walletError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
              {walletError}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-yellow to-pastel-gold flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Grant Consent Form */}
      {isConnected && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Child's Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                value={childIdentifier}
                onChange={(e) => setChildIdentifier(e.target.value)}
                placeholder="e.g., child@example.com"
                className="w-full px-5 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl font-medium text-gray-800 focus:ring-4 focus:ring-sky-100 focus:border-sky-400 focus:outline-none transition-all placeholder:text-gray-400"
                disabled={isGranting}
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              This can be an email, username, or any unique identifier.
            </p>
          </div>

          {!generatedHash ? (
            <button
              onClick={handleGenerateHash}
              disabled={!childIdentifier.trim() || isGranting}
              className="w-full bg-gray-900 hover:bg-black text-white font-display font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                Generate Secure Hash
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wide">Generated ZK Hash</p>
                </div>
                <p className="font-mono text-sm text-gray-700 break-all bg-white/50 p-2 rounded-lg border border-blue-100/50">
                  {formatHash(generatedHash)}
                </p>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                  This cryptographic hash will be stored on-chain. The original email remains explicitly private and is never exposed.
                </p>
              </div>

              <button
                onClick={handleGrantConsent}
                disabled={isGranting}
                className="w-full bg-gradient-to-r from-pastel-yellow to-pastel-gold hover:from-yellow-200 hover:to-yellow-300 text-amber-900 font-display font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="flex items-center justify-center gap-2">
                  {isGranting ? (
                    <>
                      <div className="loader w-5 h-5 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin"></div>
                      Storing on Midnight Chain...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm & Grant Consent
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200 animate-fade-in shadow-sm">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-5 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200 animate-fade-in shadow-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-sm mb-1">Success! Consent Granted</h4>
                  <p className="text-sm text-green-700 whitespace-pre-line leading-relaxed">
                    The proof has been verified and stored on the Midnight blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
