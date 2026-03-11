import React, { useState, useEffect } from 'react';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatSOL, relativeTime } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

const STATUS_COLORS = { pending: '#ff9500', swapping: '#00c8ff', distributing: '#c084fc', completed: '#00ff88', failed: '#ff4444' };

export default function BurnHistory() {
  const apiFetch = useApi();
  const [burns, setBurns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/burn/history?limit=10').then(r => { setBurns(r?.burns || r || []); setLoading(false); }).catch(() => setLoading(false));
  }, [apiFetch]);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <SkeletonRect key={i} h={40} />)}</div>;

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Burn History</span>
      </div>
      {burns.length === 0 ? (
        <div className="p-6 text-center"><p className="font-mono text-xs text-[#555]">No burn history yet</p></div>
      ) : (
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
                  <td className="py-2 px-3 font-mono text-[10px] text-[#555] whitespace-nowrap">{relativeTime(b.created_at || b.timestamp)}</td>
                  <td className="py-2 px-3 whitespace-nowrap"><NovaPill text={b.token_ticker || b.mint?.slice(0,6) || '?'} color="#00c8ff" /></td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#bbb] whitespace-nowrap">{Number(b.amount_tokens || 0).toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#00ff88' }}>{formatSOL(b.sol_value || b.amount_sol)}</td>
                  <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#ffd700' }}>{Number(b.credits || 0)}</td>
                  <td className="py-2 px-3"><NovaPill text={(b.status || 'pending').toUpperCase()} color={STATUS_COLORS[b.status] || '#555'} /></td>
                  <td className="py-2 px-3">
                    {b.tx_hash ? <a href={`https://solscan.io/tx/${b.tx_hash}`} target="_blank" rel="noreferrer" className="font-mono text-[10px] no-underline" style={{ color: '#00c8ff' }}>↗</a> : <span className="text-[#333]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}