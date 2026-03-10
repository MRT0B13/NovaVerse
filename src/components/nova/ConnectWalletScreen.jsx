import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

function getDeepLink(type) {
  const url = window.location.href;
  const host = window.location.host;
  const path = window.location.pathname;
  if (type === 'evm') {
    // MetaMask mobile: open dapp directly inside MM browser
    return `https://metamask.app.link/dapp/${host}${path}`;
  }
  if (type === 'solana') {
    // Phantom mobile: browse to the dapp URL inside Phantom browser
    return `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(window.location.origin)}`;
  }
  return null;
}

function isInjected(type) {
  if (type === 'evm') return !!(window.ethereum || window.web3?.currentProvider);
  if (type === 'solana') {
    const s = window.phantom?.solana || window.solana;
    return !!(s?.isPhantom || s?.connect);
  }
  return false;
}

const WALLETS = [
  { id: 'metamask', label: 'MetaMask', icon: '🦊', desc: 'EVM — Ethereum & compatible chains', type: 'evm' },
  { id: 'phantom',  label: 'Phantom',  icon: '👻', desc: 'Solana — Phantom wallet',            type: 'solana' },
];

export default function ConnectWalletScreen() {
  const { connectEvm, connectSolana, connecting, error } = useAuth();

  const handleClick = (wallet) => {
    if (isInjected(wallet.type)) {
      if (wallet.type === 'evm') connectEvm();
      else connectSolana();
    } else {
      // Redirect into the wallet's in-app browser
      window.location.href = getDeepLink(wallet.type);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: '#060606' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div
          className="mb-7 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 40px #00ff8830, 0 0 80px #00c8ff20',
          }}
        >⚡</div>

        <h1 className="font-syne font-extrabold text-3xl text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
          NovaVerse
        </h1>
        <p className="font-syne text-sm mb-2" style={{ color: '#888' }}>
          Autonomous DeFi Agent Platform
        </p>
        <p className="font-mono text-xs text-center leading-relaxed mb-8" style={{ color: '#444' }}>
          Connect your wallet to access your agent dashboard, governance voting, and real-time DeFi intelligence.
        </p>

        {/* Wallet options */}
        <div className="w-full space-y-3">
          {WALLETS.map((w) => {
            const busy = connecting === w.type;
            const injected = isInjected(w.type);
            return (
              <button
                key={w.id}
                onClick={() => handleClick(w)}
                disabled={!!connecting}
                className="w-full flex items-center gap-4 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                style={{
                  background: '#0d0d0d',
                  border: '1px solid #1e1e1e',
                  padding: '14px 16px',
                  minHeight: 64,
                  cursor: connecting ? 'default' : 'pointer',
                }}
              >
                <span className="text-3xl shrink-0">{w.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <span className="font-syne font-semibold text-base text-white block">{w.label}</span>
                  <span className="font-mono text-[11px] block truncate" style={{ color: '#555' }}>{w.desc}</span>
                  {!injected && (
                    <span className="font-mono text-[10px] mt-0.5 block" style={{ color: '#333' }}>
                      Tap to open in {w.label}
                    </span>
                  )}
                </div>
                {busy
                  ? <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: '#00ff88' }} />
                  : <span className="font-mono text-lg shrink-0" style={{ color: '#2a2a2a' }}>›</span>
                }
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-5 text-xs font-mono text-center leading-relaxed px-2" style={{ color: '#ff4444' }}>
            {error}
          </p>
        )}

        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#2a2a2a' }}>
          Powered by NovaOS
        </p>
      </div>
    </div>
  );
}