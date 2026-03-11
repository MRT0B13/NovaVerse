import React from 'react';

const POOLS = [
  { key: 'treasury', label: 'Treasury', pct: 40, color: '#ffd700', desc: 'Infrastructure, development, liquidity' },
  { key: 'staking', label: 'Staking Rewards', pct: 30, color: '#c084fc', desc: 'Distributed to NOVA stakers' },
  { key: 'community', label: 'Community Rewards', pct: 20, color: '#00c8ff', desc: 'Airdrops, contests, community incentives' },
  { key: 'buyback', label: 'NOVA Buyback', pct: 10, color: '#00ff88', desc: 'Buy NOVA from market and burn for deflation' },
];

export default function DistributionPools({ config }) {
  const configSplits = config?.splits || {};
  const displayPools = POOLS.map(p => ({
    ...p,
    pct: configSplits[p.key] != null ? Number(configSplits[p.key]) : p.pct,
  }));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {displayPools.map(p => (
        <div key={p.key} className="nova-card p-4" style={{ borderLeft: `3px solid ${p.color}` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-syne font-bold text-xs text-white">{p.label}</span>
            <span className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.pct}%</span>
          </div>
          <p className="font-mono text-[10px] text-[#555]">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}