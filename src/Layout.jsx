import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthProvider, { useAuth, useApi } from './components/nova/AuthContext';
import ConnectWalletScreen from './components/nova/ConnectWalletScreen';
import NovaPill from './components/nova/NovaPill';
import PageLoadBar from './components/nova/PageLoadBar';

const NAV_ITEMS = [
  { label: '◈ Dashboard', page: 'Dashboard' },
  { label: '⬡ Debate Chamber', page: 'DebateChamber' },
  { label: '◉ Governance', page: 'Governance' },
  { label: '⊕ Agent Factory', page: 'AgentFactory' },
];

function NavBar({ currentPageName }) {
  const { token, address, truncatedAddress, disconnect } = useAuth();
  const apiFetch = useApi();
  const [novaBalance, setNovaBalance] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchBal = () => apiFetch('/portfolio').then(d => setNovaBalance(d?.nova?.balance ?? 0)).catch(() => {});
    fetchBal();
    const interval = setInterval(fetchBal, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCopyAddress = async () => {
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
      {/* Logo */}
      <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 shrink-0 no-underline">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 12px #00ff8830',
          }}
        >⚡</div>
        <span className="font-syne font-extrabold text-base text-white hidden sm:inline" style={{ letterSpacing: '-0.02em' }}>
          NovaVerse
        </span>
      </Link>

      {/* Center nav */}
      <div className="hidden md:flex items-center gap-6 mx-auto overflow-x-auto" style={{ whiteSpace: 'nowrap' }}>
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

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {novaBalance != null && (
          <NovaPill text={`${Number(novaBalance).toLocaleString()} NOVA`} />
        )}
        
        {truncatedAddress ? (
          <div className="relative">
            <button
              onClick={() => setShowWalletMenu(prev => !prev)}
              className="font-mono text-[11px] px-3 py-1 rounded cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: '#1a1a1a', color: copied ? '#00ff88' : '#bbb', border: '1px solid #222' }}
            >
              {copied ? '✓ Copied!' : truncatedAddress}
            </button>
            {showWalletMenu && (
              <div
                className="absolute right-0 mt-1 w-56 rounded-lg p-3 space-y-2 z-50 animate-fade-in"
                style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
              >
                <p className="font-mono text-[10px] text-[#555] break-all">{address}</p>
                <button
                  onClick={() => { handleCopyAddress(); setShowWalletMenu(false); }}
                  className="w-full font-mono text-[11px] py-1.5 rounded cursor-pointer"
                  style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #222' }}
                >
                  📋 Copy Address
                </button>
                <button
                  onClick={() => { disconnect(); setShowWalletMenu(false); }}
                  className="w-full font-mono text-[11px] py-1.5 rounded cursor-pointer"
                  style={{ background: '#ff444418', color: '#ff4444', border: '1px solid #ff444440' }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 12px #00ff8830',
          }}
        >💹</div>
      </div>
    </nav>
  );
}

function MobileNav({ currentPageName }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center h-14 overflow-x-auto"
      style={{ background: '#060606', borderTop: '1px solid #111', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = currentPageName === item.page;
        return (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className="font-mono text-[10px] text-center no-underline transition-colors py-2 flex-1 min-w-[80px]"
            style={{ color: isActive ? '#00ff88' : '#444' }}
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

  if (!token) {
    return <ConnectWalletScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#060606' }}>
      <PageLoadBar />
      <OpenInBrowserBanner />
      <NavBar currentPageName={currentPageName} />
      <main className="pb-20 md:pb-6">
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