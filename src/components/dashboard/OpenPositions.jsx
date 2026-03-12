import React, { useState, useMemo } from 'react';
import { formatUSD, formatPnlSigned, strategyColor, CHAIN_COLORS, relativeTime } from '../nova/formatters';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';

const SORT_KEYS = ['amount_usd', 'pnl_usd', 'pnl_pct', 'entry_price', 'current_price'];

export default function OpenPositions({ positions, loading }) {
  const [sortKey, setSortKey] = useState('amount_usd');
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState(null);

  const sorted = useMemo(() => {
    if (!positions || positions.length === 0) return [];
    return [...positions].sort((a, b) => {
      const av = Number(a[sortKey] || 0);
      const bv = Number(b[sortKey] || 0);
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [positions, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (loading) {
    return (
      <div className="nova-card p-4 space-y-3">
        <SkeletonRect w="40%" h={12} />
        {[1,2,3].map(i => <SkeletonRect key={i} h={40} />)}
      </div>
    );
  }

  const SortHeader = ({ label, k }) => (
    <th
      onClick={() => toggleSort(k)}
      className="font-mono text-[9px] uppercase text-left py-2 px-2 whitespace-nowrap cursor-pointer select-none"
      style={{ color: sortKey === k ? '#00ff88' : '#555' }}
    >
      {label} {sortKey === k ? (sortDir === 'desc' ? '▼' : '▲') : ''}
    </th>
  );

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
          Open Positions {sorted.length > 0 && `(${sorted.length})`}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="p-8 text-center text-[#555] font-mono text-xs">
          Your agent hasn't opened any positions yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                <th className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-2">Asset</th>
                <th className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-2">Strategy</th>
                <th className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-2">Chain</th>
                <SortHeader label="Entry" k="entry_price" />
                <SortHeader label="Current" k="current_price" />
                <SortHeader label="Size" k="amount_usd" />
                <SortHeader label="PnL $" k="pnl_usd" />
                <SortHeader label="PnL %" k="pnl_pct" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((pos) => {
                const pnlColor = (pos.pnl_usd || 0) > 0 ? '#00ff88' : (pos.pnl_usd || 0) < 0 ? '#ff4444' : '#555';
                const pctColor = (pos.pnl_pct || 0) > 0 ? '#00ff88' : (pos.pnl_pct || 0) < 0 ? '#ff4444' : '#555';
                const isExpanded = expanded === pos.id;
                return (
                  <React.Fragment key={pos.id}>
                    <tr
                      onClick={() => setExpanded(isExpanded ? null : pos.id)}
                      className="cursor-pointer hover:bg-[#0d0d0d] transition-colors"
                      style={{ borderBottom: '1px solid #111' }}
                    >
                      <td className="py-2 px-2">
                        <span className="font-syne font-semibold text-xs text-white">{pos.pool_name || pos.asset}</span>
                      </td>
                      <td className="py-2 px-2">
                        <NovaPill text={pos.strategy} color={strategyColor(pos.strategy)} />
                      </td>
                      <td className="py-2 px-2">
                        <NovaPill text={pos.chain} color={CHAIN_COLORS[(pos.chain || '').toLowerCase()] || '#888'} />
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] text-[#888] whitespace-nowrap">
                        {pos.entry_price != null ? formatUSD(pos.entry_price) : '—'}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] text-white whitespace-nowrap">
                        {pos.current_price != null ? formatUSD(pos.current_price) : '—'}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] text-white whitespace-nowrap">
                        {formatUSD(pos.amount_usd)}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] whitespace-nowrap" style={{ color: pnlColor }}>
                        {formatPnlSigned(pos.pnl_usd)}
                      </td>
                      <td className="py-2 px-2 font-mono text-[11px] whitespace-nowrap" style={{ color: pctColor }}>
                        {pos.pnl_pct != null ? `${pos.pnl_pct > 0 ? '+' : ''}${Number(pos.pnl_pct).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderBottom: '1px solid #111' }}>
                        <td colSpan={8} className="px-4 py-3" style={{ background: '#080808' }}>
                          <div className="flex flex-wrap gap-4 font-mono text-[10px]">
                            {pos.cost_basis != null && (
                              <div><span className="text-[#555]">Cost Basis:</span> <span className="text-[#bbb]">{formatUSD(pos.cost_basis)}</span></div>
                            )}
                            {pos.status && (
                              <div><span className="text-[#555]">Status:</span> <span className="text-[#bbb]">{pos.status}</span></div>
                            )}
                            {pos.opened_at && (
                              <div><span className="text-[#555]">Opened:</span> <span className="text-[#bbb]">{relativeTime(pos.opened_at)}</span></div>
                            )}
                            {pos.description && (
                              <div><span className="text-[#555]">Note:</span> <span className="text-[#bbb]">{pos.description}</span></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
