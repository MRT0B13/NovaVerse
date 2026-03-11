import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../nova/AuthContext';
import { truncateAddress, formatSOL, relativeTime } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

export default function BurnLeaderboard() {
  const { address } = useAuth();
  const apiFetch = useApi();
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('credits');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/burn/leaderboard?limit=25&sortBy=${sortBy}`).then(r => { setData(r); setLoading(false); }).catch(() => setLoading(false));
  }, [apiFetch, sortBy]);

  const btnStyle = (active) => ({
    background: active ? '#1a1a1a' : 'transparent',
    border: 'none',
    color: active ? '#fff' : '#555',
    cursor: 'pointer',
  });

  if (loading) return <div className="space-y-2">{[1,2,3,4,5].map(i => <SkeletonRect key={i} h={30} />)}</div>;

  const leaderboard = data?.leaderboard || [];
  const ecosystem = data?.ecosystem;

  return (
    <div className="nova-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Leaderboard</span>
        <div className="flex gap-1 p-1 rounded" style={{ background: '#0a0a0a' }}>
          {['credits', 'sol', 'burns'].map(s => (
            <button key={s} onClick={() => setSortBy(s)} className="font-mono text-[10px] px-2 py-1 rounded" style={btnStyle(sortBy === s)}>By {s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="p-6 text-center"><p className="font-mono text-xs text-[#555]">No leaderboard data</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['#', 'Wallet', 'Credits', 'Burns', 'Total SOL', 'Last Active'].map(h => (
                  <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const isMe = address && (row.wallet || row.address || '').toLowerCase() === address.toLowerCase();
                return (
                  <tr key={row.wallet || i} style={{ borderBottom: '1px solid #111', background: isMe ? '#00ff8808' : 'transparent' }}>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#888]">{i + 1}</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: isMe ? '#00ff88' : '#bbb' }}>{truncateAddress(row.wallet || row.address)}</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: '#ffd700' }}>{Number(row.credits || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#bbb]">{Number(row.burns || row.total_burns || 0)}</td>
                    <td className="py-2 px-3 font-mono text-[11px]" style={{ color: '#ff9500' }}>{Number(row.total_sol || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#555]">{relativeTime(row.last_active || row.last_burn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ecosystem && (
        <div className="px-4 py-3 flex gap-4 flex-wrap" style={{ borderTop: '1px solid #1a1a1a' }}>
          <span className="font-mono text-[10px] text-[#555]">Total: {Number(ecosystem.total_sol || 0).toFixed(2)} SOL</span>
          <span className="font-mono text-[10px] text-[#555]">Burns: {Number(ecosystem.total_burns || 0)}</span>
          <span className="font-mono text-[10px] text-[#555]">Wallets: {Number(ecosystem.unique_wallets || 0)}</span>
        </div>
      )}
    </div>
  );
}