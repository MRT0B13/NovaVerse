import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

function getIsMobile() {
  try { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }
  catch { return false; }
}

// Detect if we're already inside a wallet's in-app browser
function isInsideWalletBrowser() {
  const ua = navigator.userAgent || '';
  // MetaMask injects "MetaMaskMobile" into the UA on its in-app browser
  if (/MetaMaskMobile/i.test(ua)) return 'metamask';
  // Phantom injects "Phantom" into the UA
  if (/Phantom/i.test(ua)) return 'phantom';
  return null;
}

// Get the correct EVM provider — handles multiple wallets injecting window.ethereum
function getEvmProvider() {
  if (window.ethereum?.providers?.length) {
    const mm = window.ethereum.providers.find(p => p.isMetaMask);
    if (mm) return mm;
  }
  if (window.ethereum?.isMetaMask) return window.ethereum;
  if (window.ethereum) return window.ethereum;
  return null;
}

// Get the Phantom Solana provider
function getPhantomProvider() {
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
  if (window.solana?.isPhantom) return window.solana;
  return null;
}

export default function ConnectWalletScreen() {
  const { connectEvm, connectSolana, connecting, error } = useAuth();
  const [detected, setDetected] = useState({ evm: false, solana: false });
  const [debugMsg, setDebugMsg] = useState('');
  const isMobile = getIsMobile();
  const walletBrowser = isInsideWalletBrowser();

  // Re-check providers after mount (wallets inject late, especially on mobile)
  useEffect(() => {
    const check = () => {
      setDetected({
        evm: !!getEvmProvider(),
        solana: !!getPhantomProvider(),
      });
    };
    check();
    // Wallets on mobile can inject very late — check multiple times
    const t1 = setTimeout(check, 300);
    const t2 = setTimeout(check, 800);
    const t3 = setTimeout(check, 1500);
    const t4 = setTimeout(check, 3000);
    window.addEventListener('eip6963:announceProvider', check);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      window.removeEventListener('eip6963:announceProvider', check);
    };
  }, []);

  const handleClick = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'evm') {
      if (detected.evm) {
        setDebugMsg('Requesting accounts…');
        connectEvm().then(() => {
          setDebugMsg('Connected!');
        }).catch((err) => {
          setDebugMsg(`EVM error: ${err?.message || err}`);
        });
      } else if (isMobile) {
        const host = window.location.host;
        const path = window.location.pathname + window.location.search;
        window.location.href = `https://metamask.app.link/dapp/${host}${path}`;
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
    } else {
      if (detected.solana) {
        setDebugMsg('Connecting Phantom…');
        connectSolana().then(() => {
          setDebugMsg('Connected!');
        }).catch((err) => {
          setDebugMsg(`Solana error: ${err?.message || err}`);
        });
      } else if (isMobile) {
        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`;
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    }
  };

  const wallets = [
    {
      id: 'metamask', type: 'evm', label: 'MetaMask', icon: '🦊',
      desc: 'EVM — Ethereum & compatible chains',
      available: detected.evm,
    },
    {
      id: 'phantom', type: 'solana', label: 'Phantom', icon: '👻',
      desc: 'Solana',
      available: detected.solana,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: '#060606' }}>
      <div className="w-full max-w-sm flex flex-col items-center">
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
        <p className="font-syne text-sm mb-2" style={{ color: '#888' }}>Autonomous DeFi Agent Platform</p>
        <p className="font-mono text-xs text-center leading-relaxed mb-8" style={{ color: '#444' }}>
          Connect your wallet to access your agent dashboard, governance voting, and real-time DeFi intelligence.
        </p>

        <div className="w-full space-y-3">
          {wallets.map((w) => {
            const busy = connecting === w.type;
            const actionLabel = w.available ? 'Connect' : isMobile ? `Open in ${w.label}` : `Install ${w.label}`;

            return (
              <button
                key={w.id}
                onClick={(e) => handleClick(e, w.type)}
                disabled={!!connecting}
                className="w-full flex items-center gap-4 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                style={{
                  background: '#0d0d0d',
                  border: `1px solid ${w.available ? '#1a2a1a' : '#1e1e1e'}`,
                  padding: '16px',
                  cursor: connecting ? 'default' : 'pointer',
                }}
              >
                <span className="text-3xl shrink-0">{w.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <span className="font-syne font-semibold text-base text-white block">{w.label}</span>
                  <span className="font-mono text-[11px] block" style={{ color: '#555' }}>{w.desc}</span>
                  {w.available && (
                    <span className="font-mono text-[10px] block mt-0.5" style={{ color: '#00ff8888' }}>
                      ● Detected
                    </span>
                  )}
                </div>
                <div className="shrink-0 flex items-center">
                  {busy ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#00ff88' }} />
                  ) : (
                    <span
                      className="font-mono text-[11px] px-2.5 py-1 rounded"
                      style={{
                        background: w.available ? '#00ff8815' : '#1a1a1a',
                        color: w.available ? '#00ff88' : '#555',
                        border: `1px solid ${w.available ? '#00ff8830' : '#222'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {actionLabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {(error || debugMsg) && (
          <p className="mt-5 text-xs font-mono text-center leading-relaxed px-2" style={{ color: error ? '#ff4444' : '#00ff88' }}>
            {error || debugMsg}
          </p>
        )}

        {!detected.evm && !detected.solana && !isMobile && (
          <div className="mt-5 w-full rounded-lg p-3" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <p className="font-mono text-[11px] text-center leading-relaxed" style={{ color: '#666' }}>
              No wallets detected. If you have MetaMask or Phantom installed, try opening the <strong style={{ color: '#aaa' }}>published app URL</strong> directly — wallet extensions cannot connect inside preview iframes.
            </p>
          </div>
        )}

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#2a2a2a' }}>
          Powered by NovaOS
        </p>
      </div>
    </div>
  );
}