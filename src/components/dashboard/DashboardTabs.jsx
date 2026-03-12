import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DashboardTabs({ activeTab, onChange }) {
  const tabs = [
    { key: 'feed', label: 'Live Feed' },
    { key: 'agent', label: 'My Agent' },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-all"
          style={{
            background: activeTab === t.key ? '#1a1a1a' : 'transparent',
            color: activeTab === t.key ? '#fff' : '#555',
            border: 'none',
          }}
        >
          {t.label}
        </button>
      ))}
      <Link
        to={createPageUrl('Transactions')}
        className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-all text-center no-underline"
        style={{
          background: 'transparent',
          color: '#00c8ff',
          border: 'none',
        }}
      >
        Transactions →
      </Link>
    </div>
  );
}