import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthProvider, { useAuth, useApi } from './components/nova/AuthContext';
import ConnectWalletScreen from './components/nova/ConnectWalletScreen';
import NovaPill from './components/nova/NovaPill';

const NAV_ITEMS = [
  { label: '◈ Dashboard', page: 'Dashboard' },
  { label: '⬡ Debate Chamber', page: 'DebateChamber' },
  { label: '◉ Governance', page: 'Governance' },
  { label: '⊕ Agent Factory', page: 'AgentFactory' },
];

function NavBar({ currentPageName }) {
  const { token, truncatedAddress, disconnect } = useAuth();
  const apiFetch = useApi();
  const [novaBalance, setNovaBalance] = useState(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/portfolio')
      .then(d => setNovaBalance(d?.nova?.balance ?? 0))
      .catch(() => {});
  }, [token]);

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
      <div className="hidden md:flex items-center gap-6 mx-auto">
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
          <button
            onClick={disconnect}
            className="font-mono text-[11px] px-3 py-1 rounded cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: '#1a1a1a', color: '#bbb', border: '1px solid #222' }}
          >
            {truncatedAddress}
          </button>
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-14"
      style={{ background: '#060606', borderTop: '1px solid #111' }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = currentPageName === item.page;
        return (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className="font-mono text-[10px] text-center no-underline transition-colors py-2"
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

function InnerLayout({ children, currentPageName }) {
  const { token } = useAuth();

  if (!token) {
    return <ConnectWalletScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#060606' }}>
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