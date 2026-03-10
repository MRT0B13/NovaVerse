import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

function getIsMobile() {
  try { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }
  catch { return false; }
}

function handleDeepLink(type) {
  const dappUrl = window.location.href;
  const host = window.location.host;
  const path = window.location.pathname + window.location.search;

  if (type === 'evm') {
    // MetaMask deep link — opens the dapp URL inside MetaMask's in-app browser
    window.location.href = `https://metamask.app.link/dapp/${host}${path}`;
  } else {
    // Phantom deep link — opens the dapp URL inside Phantom's in-app browser
    window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(dappUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
  }
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
  { id: 'phantom',  label: 'Phantom',  icon: '👻', desc: 'Solana',                             type: 'solana' },
];

export default function ConnectWalletScreen() {
  const { connectEvm, connectSolana, connecting, error } = useAuth();

  const isMobile = getIsMobile();

  const handleClick = (wallet) => {
    if (isInjected(wallet.type)) {
      wallet.type === 'evm' ? connectEvm() : connectSolana();
    } else if (isMobile) {
      handleDeepLink(wallet.type);
    } else {
      const installUrls = {
        evm: 'https://metamask.io/download/',
        solana: 'https://phantom.app/',
      };
      window.open(installUrls[wallet.type], '_blank');
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
          className="mb-7 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
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

        {/* Wallet buttons */}
        <div className="w-full space-y-3">
          {WALLETS.map((w) => {
            const busy = connecting === w.type;
            const injected = isInjected(w.type);
            const actionLabel = injected ? 'Connect' : isMobile ? `Open in ${w.label}` : `Install ${w.label}`;

            return (
              <button
                key={w.id}
                onClick={() => handleClick(w)}
                disabled={!!connecting}
                className="w-full flex items-center gap-4 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                style={{
                  background: '#0d0d0d',
                  border: '1px solid #1e1e1e',
                  padding: '16px',
                  cursor: connecting ? 'default' : 'pointer',
                }}
              >
                <span className="text-3xl shrink-0">{w.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <span className="font-syne font-semibold text-base text-white block">{w.label}</span>
                  <span className="font-mono text-[11px] block" style={{ color: '#555' }}>{w.desc}</span>
                </div>
                <div className="shrink-0 flex items-center">
                  {busy
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#00ff88' }} />
                    : (
                      <span
                        className="font-mono text-[11px] px-2 py-1 rounded"
                        style={{
                          background: injected ? '#00ff8815' : '#1a1a1a',
                          color: injected ? '#00ff88' : '#555',
                          border: `1px solid ${injected ? '#00ff8830' : '#222'}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {actionLabel}
                      </span>
                    )
                  }
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-5 text-xs font-mono text-center leading-relaxed px-2" style={{ color: '#ff4444' }}>
            {error}
          </p>
        )}

        {isMobile && (
          <p className="mt-5 font-mono text-[10px] text-center leading-relaxed" style={{ color: '#333' }}>
            On mobile, tap to open this page inside your wallet's browser.
          </p>
        )}

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#2a2a2a' }}>
          Powered by NovaOS
        </p>
      </div>
    </div>
  );
}