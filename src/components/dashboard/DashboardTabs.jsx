import React from 'react';

const TABS = [
  { key: 'feed', label: 'Live Feed' },
  { key: 'agent', label: 'My Agent' },
];

export default function DashboardTabs({ active, onChange }) {
  return (
    <div className="flex gap-6" style={{ borderBottom: '1px solid #111' }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="font-mono text-[11px] uppercase tracking-wider py-3 cursor-pointer transition-colors"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: active === tab.key ? '2px solid #00ff88' : '2px solid transparent',
            color: active === tab.key ? '#fff' : '#444',
            marginBottom: '-1px',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}