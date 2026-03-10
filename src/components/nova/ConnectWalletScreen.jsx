import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

const CURRENT_URL = encodeURIComponent(window.location.href);

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    label: 'MetaMask',
    icon: '🦊',
    desc: 'EVM · Ethereum, Solana (Snap)',
    type: 'evm',
    deepLink: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`,
  },
  {
    id: 'phantom',
    label: 'Phantom',
    icon: '👻',
    desc: 'Solana · Multi-chain wallet',
    type: 'solana',
    deepLink: `https://phantom.app/ul/browse/${CURRENT_URL}?ref=${CURRENT_URL}`,
  },
];

export default function ConnectWalletScreen() {
  const { connectEvm, connectSolana, connecting, error } = useAuth();

  const handleClick = (wallet) => {
    const hasEvm = !!(window.ethereum || window.web3?.currentProvider);
    const hasSolana = !!(window.phantom?.solana || window.solana);

    if (wallet.type === 'evm') {
      if (hasEvm) {
        connectEvm();
      } else {
        window.location.href = wallet.deepLink;
      }
    } else {
      if (hasSolana) {
        connectSolana();
      } else {
        window.location.href = wallet.deepLink;
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060606' }}>
      <div className="text-center max-w-sm px-6 w-full">
        {/* Logo */}
        <div
          className="mx-auto mb-8 w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 40px #00ff8830, 0 0 80px #00c8ff20',
          }}
        >
          ⚡
        </div>

        <h1
          className="font-syne font-extrabold text-4xl tracking-tight mb-3"
          style={{ letterSpacing: '-0.02em' }}
        >
          NovaVerse
        </h1>
        <p className="text-[#888] font-syne text-base mb-2">Autonomous DeFi Agent Platform</p>
        <p className="text-[#555] font-mono text-xs mb-10 leading-relaxed">
          Connect your wallet to access your agent dashboard,
          <br />
          governance voting, and real-time DeFi intelligence.
        </p>

        {/* Wallet buttons */}
        <div className="space-y-3">
          {WALLET_OPTIONS.map((w) => {
            const isLoading = connecting === w.type || (w.type === 'evm' && connecting === 'evm') || (w.type === 'solana' && connecting === 'solana');
            return (
              <button
                key={w.id}
                onClick={() => handleClick(w)}
                disabled={!!connecting}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
              >
                <span className="text-2xl shrink-0">{w.icon}</span>
                <div className="text-left flex-1">
                  <span className="font-syne font-semibold text-sm text-white block">{w.label}</span>
                  <span className="font-mono text-[10px] text-[#555]">{w.desc}</span>
                </div>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: '#00ff88' }} />
                ) : (
                  <span className="font-mono text-[10px] shrink-0" style={{ color: '#333' }}>→</span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 text-xs font-mono leading-relaxed" style={{ color: '#ff4444' }}>
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