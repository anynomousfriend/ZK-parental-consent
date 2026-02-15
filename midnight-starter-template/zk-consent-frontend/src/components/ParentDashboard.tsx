
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { hashIdentifier } from '../lib/hash';
import { directContractService } from '../lib/contract-direct';

export const ParentDashboard: React.FC = () => {
  const { isConnected, connect, disconnect, address, getConnectedAPI } = useWallet();
  const [childId, setChildId] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [status, setStatus] = useState<string>('READY_TO_INITIALIZE');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleGrant = async () => {
    if (!childId) return;
    setIsGranting(true);
    setStatus('INITIATING_PROTOCOL');
    addLog('Initiating Consent Protocol...');
    setTxHash(null);

    try {
      const walletAPI = getConnectedAPI();
      if (!walletAPI) throw new Error('Wallet not connected');

      // 1. Generate Hash
      addLog('Hashing Identity...');
      const childIdHash = await hashIdentifier(childId);
      addLog(`Identity Hash: ${childIdHash.toString(16).substring(0, 12)}...`);

      // 2. Grant Consent via Service (Triggers Popup)
      addLog('⚠️ WAITING FOR USER SIGNATURE (CHECK WALLET POPUP)...');
      setStatus('AWAITING_SIGNATURE');

      const result = await directContractService.grantConsent(childIdHash, walletAPI);

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      addLog('✅ Transaction Signed! Submitting to Network...');
      setStatus('SUBMITTING_PROOF');

      // 5. Success
      addLog(`✅ SUCCESS! Transaction Confirmed.`);
      addLog(`TX: ${result.txHash}`);
      setTxHash(result.txHash || null);
      setStatus('ACCESS_GRANTED');
      setChildId('');



    } catch (err: any) {
      console.error(err);
      addLog(`❌ ERROR: ${err.message}`);
      setStatus('PROTOCOL_FAILED');
    } finally {
      setIsGranting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 mb-6 rounded-full bg-[var(--color-neon-purple)] animate-pulse shadow-[0_0_30px_var(--color-neon-purple)]" />
        <h2 className="text-3xl font-bold mb-4 font-display">Identity Control Center</h2>
        <p className="text-gray-400 mb-8 max-w-md">Securely manage parental consent on the Midnight Network using Zero-Knowledge proofs.</p>
        <button
          onClick={connect}
          className="px-8 py-4 bg-[rgba(139,92,246,0.2)] border border-[var(--color-neon-purple)] text-[var(--color-neon-purple)] font-bold tracking-widest uppercase hover:bg-[var(--color-neon-purple)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          Initialize Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Control Panel */}
      <div className="glass-panel p-8 rounded-xl border-t-2 border-[var(--color-neon-cyan)]">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--color-neon-cyan)]">
          <span className="w-2 h-2 bg-[var(--color-neon-cyan)] rounded-full animate-ping" />
          GRANT NEW CONSENT
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Child Identifier</label>
            <input
              type="text"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              placeholder="Enter Child's Unique ID"
              className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] p-4 text-white focus:border-[var(--color-neon-cyan)] focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all font-mono"
            />
          </div>

          <button
            onClick={handleGrant}
            disabled={!childId || isGranting}
            className={`w-full py-4 font-bold tracking-widest uppercase transition-all duration-300 ${isGranting
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-[var(--color-neon-cyan)] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]'
              }`}
          >
            {isGranting ? status : 'AUTHORIZE IDENTITY'}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-mono">CONNECTED WALLET</p>
              <p className="text-sm font-mono text-[var(--color-neon-purple)] truncate w-48">{address}</p>
            </div>
            <button
              onClick={disconnect}
              className="text-xs text-red-400 hover:text-red-300 underline font-mono"
            >
              TERMINATE_SESSION
            </button>
          </div>
        </div>
      </div>

      {/* Terminal / Logs */}
      <div className="glass-panel p-6 rounded-xl border-t-2 border-[var(--color-neon-purple)] flex flex-col h-[500px]">
        <h3 className="text-sm font-bold mb-4 font-mono text-[var(--color-neon-purple)] flex justify-between">
          <span>SYSTEM_LOGS</span>
          <span className="text-[10px] opacity-50">v1.4.0-RC</span>
        </h3>
        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2" id="console-logs">
          {logs.length === 0 && <span className="text-gray-600 italic">No activity recorded...</span>}
          {logs.map((log, i) => (
            <div key={i} className="text-green-400 border-l-2 border-green-500/20 pl-2">
              <span className="opacity-50 mr-2">{log.split(']')[0]}]</span>
              {log.split(']')[1]}
            </div>
          ))}
          {txHash && (
            <div className="mt-4 p-4 bg-[rgba(6,182,212,0.1)] border border-[var(--color-neon-cyan)] rounded">
              <p className="text-[var(--color-neon-cyan)] font-bold mb-1">PROOF VERIFIED</p>
              <a
                href={`https://explorer.midnight.network/transaction/${txHash}`} // Mock URL
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-[10px] hover:underline"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
