import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatSOL, relativeTime } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

const STATUS_COLORS = { pending: '#ff9500', swapping: '#00c8ff', distributing: '#c084fc', completed: '#00ff88', failed: '#ff4444' };
const STATUS_OPTIONS = ['all', 'pending', 'swapping', 'completed', 'failed'];
const PAGE_SIZE = 25;

export default function BurnHistory() {
  const apiFetch = useApi();
  const [burns, setBurns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mintFilter, setMintFilter] = useState('');

  const fetchBurns = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/burn/history?limit=${PAGE_SIZE}&offset=${offset}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (mintFilter.trim()) url += `&mint=${mintFilter.trim()}`;
      const r = await apiFetch(url);
      setBurns(r?.burns || r || []);
      setTotal(r?.total || 0);
    } catch { setBurns([]); setTotal(0); }
    setLoading(false);
  }, [apiFetch, offset, statusFilter, mintFilter]);

  useEffect(() => { fetchBurns(); }, [fetchBurns]);

  // Reset offset when filters change
  useEffect(() => { setOffset(0); }, [statusFilter, mintFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
          Burn History {total > 0 && `(${total})`}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="font-mono text-[10px] px-2 py-1 rounded cursor-pointer"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            value={mintFilter}
            onChange={e => setMintFilter(e.target.value)}
            placeholder="Filter by mint..."
            className="font-mono text-[10px] px-2 py-1 rounded w-32"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">{[1,2,3].map(i => <SkeletonRect key={i} h={40} />)}</div>
      ) : burns.length === 0 ? (
        <div className="p-6 text-center"><p className="font-mono text-xs text-[#555]">No burn history yet</p></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Time', 'Token', 'Amount', 'SOL', 'Credits', 'Status', 'TX'].map(h => (
                    <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {burns.map((b, i) => (
                  <tr key={b.id || i} style={{ borderBottom: '1px solid #111' }}>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#555] whitespace-nowrap">{relativeTime(b.created_at || b.createdAt || b.timestamp)}</td>
                    <td className="py-2 px-3 whitespace-nowrap"><NovaPill text={b.tokenTicker || b.token_ticker || b.mint?.slice(0,6) || '?'} color="#00c8ff" /></td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#bbb] whitespace-nowrap">{Number(b.amountTokens || b.amount_tokens || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#00ff88' }}>{formatSOL(b.amountSol || b.sol_value || b.amount_sol)}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#ffd700' }}>{Number(b.creditsEarned || b.credits || 0)}</td>
                    <td className="py-2 px-3"><NovaPill text={(b.status || 'pending').toUpperCase()} color={STATUS_COLORS[b.status] || '#555'} /></td>
                    <td className="py-2 px-3">
                      {(b.swapTx || b.tx_hash || b.burnTx) ? (
                        <a href={`https://solscan.io/tx/${b.swapTx || b.tx_hash || b.burnTx}`} target="_blank" rel="noreferrer" className="font-mono text-[10px] no-underline" style={{ color: '#00c8ff' }}>↗</a>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #1a1a1a' }}>
              <span className="font-mono text-[10px] text-[#555]">
                {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="font-mono text-[10px] px-3 py-1 rounded cursor-pointer disabled:opacity-30"
                  style={{ background: '#1a1a1a', border: '1px solid #222', color: '#bbb' }}
                >
                  ← Prev
                </button>
                <span className="font-mono text-[10px] text-[#555] self-center">{currentPage}/{totalPages}</span>
                <button
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= total}
                  className="font-mono text-[10px] px-3 py-1 rounded cursor-pointer disabled:opacity-30"
                  style={{ background: '#1a1a1a', border: '1px solid #222', color: '#bbb' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
