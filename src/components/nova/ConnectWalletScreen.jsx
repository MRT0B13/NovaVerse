import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export default function ConnectWalletScreen() {
  const { connect, connecting, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060606' }}>
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <div className="mx-auto mb-8 w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 40px #00ff8830, 0 0 80px #00c8ff20',
          }}
        >
          ⚡
        </div>

        <h1 className="font-syne font-extrabold text-4xl tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>
          NovaVerse
        </h1>
        <p className="text-[#888] font-syne text-base mb-2">
          Autonomous DeFi Agent Platform
        </p>
        <p className="text-[#555] font-mono text-xs mb-10 leading-relaxed">
          Connect your wallet to access your agent dashboard,<br />
          governance voting, and real-time DeFi intelligence.
        </p>

        <button
          onClick={connect}
          disabled={connecting}
          className="font-mono text-sm px-8 py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            color: '#060606',
            fontWeight: 700,
            boxShadow: '0 0 20px #00ff8830',
          }}
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting…
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>

        {error && (
          <p className="mt-4 text-xs font-mono" style={{ color: '#ff4444' }}>
            {error}
          </p>
        )}

        <p className="mt-8 text-[#333] font-mono text-[10px] uppercase tracking-wider">
          Powered by NovaOS
        </p>
      </div>
    </div>
  );
}