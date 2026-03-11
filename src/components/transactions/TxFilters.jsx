import React from 'react';

const inputStyle = { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 6, padding: '8px 10px', outline: 'none' };

export default function TxFilters({ filters, onChange, strategies, chains }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });

  return (
    <div className="flex gap-3 flex-wrap">
      <select value={filters.strategy || ''} onChange={e => set('strategy', e.target.value)} className="font-mono text-[11px]" style={inputStyle}>
        <option value="">All Strategies</option>
        {strategies.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={filters.chain || ''} onChange={e => set('chain', e.target.value)} className="font-mono text-[11px]" style={inputStyle}>
        <option value="">All Chains</option>
        {chains.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filters.status || ''} onChange={e => set('status', e.target.value)} className="font-mono text-[11px]" style={inputStyle}>
        <option value="">All Status</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}