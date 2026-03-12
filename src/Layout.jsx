import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthProvider, { useAuth, useApi } from './components/nova/AuthContext';
import ConnectWalletScreen from './components/nova/ConnectWalletScreen';
import NovaPill from './components/nova/NovaPill';
import InboxBell from './components/nav/InboxBell';

const NAV_ITEMS = [
  { label: '◈ Dashboard', page: 'Dashboard' },
  { label: '🌌 Universe', page: 'Universe' },
  { label: '🔭 Intel', page: 'IntelCenter' },
  { label: '🛡 Swarm Ops', page: 'SwarmOps' },
  { label: '⬡ Debate', page: 'DebateChamber' },
  { label: '◉ Governance', page: 'Governance' },
  { label: '⊕ Factory', page: 'AgentFactory' },
  { label: '🚀 Launches', page: 'Launches' },
  { label: '🔥 Burn', page: 'Burn' },
  { label: '↔ Transactions', page: 'Transactions' },
];

function NavBar({ currentPageName }) {
  const { token, address, truncatedAddress, disconnect } = useAuth();
  const apiFetch = useApi();
  const [novaBalance, setNovaBalance] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchBalance = () => apiFetch('/portfolio').then(d => setNovaBalance(Number(d?.nova?.balance ?? 0))).catch(() => {});
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <nav
      className="sticky top-0 z-40 flex items-center h-14 px-4 md:px-6"
      style={{ background: '#060606', borderBottom: '1px solid #111' }}
    >
      <Link to={createPageUrl('Dashboard')} className="flex items-center gap-1.5 sm:gap-2 shrink-0 no-underline">
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs sm:text-sm"
          style={{ background: 'linear-gradient(135deg, #00ff88, #00c8ff)', boxShadow: '0 0 12px #00ff8830' }}
        >⚡</div>
        <span className="font-syne font-extrabold text-base text-white hidden sm:inline" style={{ letterSpacing: '-0.02em' }}>
          NovaVerse
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6 mx-auto nav-scroll" style={{ overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="font-mono text-[13px] py-4 no-underline transition-colors"
              style={{
                color: isActive ? '#fff' : '#444',
                borderBottom: isActive ? '2px solid #00ff88' : '2px solid transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {token && <InboxBell />}
        {novaBalance != null && (
          <NovaPill text={`${Number(novaBalance).toLocaleString()} NOVA`} />
        )}

        {truncatedAddress ? (
          <div className="relative">
            <button
              onClick={() => setWalletOpen(!walletOpen)}
              className="font-mono text-[11px] px-3 py-1 rounded cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #222' }}
            >
              {copied ? '✓ Copied!' : truncatedAddress}
            </button>
            {walletOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-lg p-3 space-y-2 z-50 animate-fade-in"
                style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
              >
                <p className="font-mono text-[10px] text-[#555] break-all">{address}</p>
                <button
                  onClick={() => { copyAddress(); setWalletOpen(false); }}
                  className="w-full font-mono text-[11px] py-1.5 rounded cursor-pointer"
                  style={{ background: '#1a1a1a', border: '1px solid #222', color: '#bbb' }}
                >📋 Copy Address</button>
                <button
                  onClick={() => { disconnect(); setWalletOpen(false); }}
                  className="w-full font-mono text-[11px] py-1.5 rounded cursor-pointer"
                  style={{ background: '#ff444418', border: '1px solid #ff444440', color: '#ff4444' }}
                >Disconnect</button>
              </div>
            )}
          </div>
        ) : null}

        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #00ff88, #00c8ff)', boxShadow: '0 0 12px #00ff8830' }}
        >💹</div>
      </div>
    </nav>
  );
}

function MobileNav({ currentPageName }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center h-14 nav-scroll safe-bottom"
      style={{ background: '#060606', borderTop: '1px solid #111', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = currentPageName === item.page;
        return (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className="font-mono text-[10px] text-center no-underline transition-colors py-2 flex-none px-3"
            style={{ color: isActive ? '#00ff88' : '#444', minWidth: 'fit-content' }}
          >
            {item.label.split(' ')[0]}<br />
            <span className="text-[9px]">{item.label.split(' ').slice(1).join(' ')}</span>
          </Link>
        );
      })}
    </div>
  );
}

function OpenInBrowserBanner() {
  const { token, address } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  // Only show inside wallet in-app browsers
  const ua = navigator.userAgent || '';
  const isWalletBrowser = /MetaMaskMobile|Phantom/i.test(ua);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

  if (!isWalletBrowser || !isMobile || !token || !address || dismissed) return null;

  const url = new URL(window.location.origin);
  url.searchParams.set('nova_token', token);
  url.searchParams.set('nova_address', address);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for mobile
      const input = document.createElement('input');
      input.value = url.toString();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 px-4 py-2.5"
      style={{ background: '#0d1a0d', borderBottom: '1px solid #1a2a1a' }}
    >
      <p className="font-mono text-[11px]" style={{ color: '#888' }}>
        Want to use your <strong style={{ color: '#ccc' }}>regular browser</strong> instead?
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="font-mono text-[11px] px-3 py-1 rounded transition-all"
          style={{
            background: copied ? '#00ff8820' : '#00ff8810',
            color: '#00ff88',
            border: '1px solid #00ff8830',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Link'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="font-mono text-[11px] px-1.5 py-1"
          style={{ color: '#444' }}
        >✕</button>
      </div>
    </div>
  );
}

function InnerLayout({ children, currentPageName }) {
  const { token } = useAuth();
  const [showProgress, setShowProgress] = useState(false);
  const prevPage = React.useRef(currentPageName);

  React.useEffect(() => {
    if (prevPage.current !== currentPageName) {
      setShowProgress(true);
      const timer = setTimeout(() => setShowProgress(false), 450);
      prevPage.current = currentPageName;
      return () => clearTimeout(timer);
    }
  }, [currentPageName]);

  if (!token) {
    return <ConnectWalletScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#060606' }}>
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: '#111' }}>
          <div className="h-full animate-progress" style={{ background: '#00ff88' }} />
        </div>
      )}
      <OpenInBrowserBanner />
      <NavBar currentPageName={currentPageName} />
      <main className="pb-16 md:pb-6">
        {children}
      </main>
      <MobileNav currentPageName={currentPageName} />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <InnerLayout currentPageName={currentPageName}>{children}</InnerLayout>
    </AuthProvider>
  );
}