import { useState } from 'react';
import { contractService } from '../lib/contract';
import { formatHash } from '../lib/hash';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [manualHash, setManualHash] = useState('');
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckHash = async () => {
    if (!manualHash) return;
    setIsChecking(true);
    setCheckResult(null);
    try {
      // Process manual hash input (handle 0x prefix or raw hex)
      let hashBigint: bigint;
      try {
        hashBigint = BigInt(manualHash.startsWith('0x') ? manualHash : `0x${manualHash}`);
      } catch {
        setCheckResult('Invalid hex format');
        return;
      }

      const result = await contractService.verifyConsent(hashBigint);
      setCheckResult(result.isAuthorized ? '✅ Authorized (Found on-chain)' : '❌ Not Authorized (Not found)');
    } catch (err) {
      setCheckResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 text-sm z-50 transition-transform transform hover:scale-105"
      >
        🐛 Debug Contract
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white border-2 border-gray-800 rounded-lg shadow-2xl p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">🐛 Contract Debugger</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Check Hash On-Chain
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualHash}
              onChange={(e) => setManualHash(e.target.value)}
              placeholder="0x123abc..."
              className="flex-1 text-xs px-2 py-1 border rounded font-mono"
            />
            <button
              onClick={handleCheckHash}
              disabled={!manualHash || isChecking}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Check
            </button>
          </div>
        </div>

        {checkResult && (
          <div className={`p-2 rounded text-xs ${checkResult.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
            {checkResult}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
          <p>Contract Address:</p>
          <p className="font-mono text-[10px] break-all">
            {contractService.getState().contractAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
