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
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Leaderboard</span>
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
                  <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const isMe = address && (row.wallet || row.address || '').toLowerCase() === address.toLowerCase();
                return (
                  <tr key={row.wallet || i} style={{ borderBottom: '1px solid #111', background: isMe ? '#00ff8808' : 'transparent' }}>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#888] whitespace-nowrap">{i + 1}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: isMe ? '#00ff88' : '#bbb' }}>{truncateAddress(row.wallet || row.address)}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#ffd700' }}>{Number(row.credits || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#bbb] whitespace-nowrap">{Number(row.burns || row.total_burns || 0)}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap" style={{ color: '#ff9500' }}>{Number(row.totalSol || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#555] whitespace-nowrap">{relativeTime(row.lastActive)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.yourRank && !leaderboard.some(r => r.wallet?.toLowerCase() === address?.toLowerCase()) && (
        <div className="px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 flex-wrap" style={{ borderTop: '1px solid #1a1a1a', background: '#00ff8808' }}>
          <span className="font-mono text-[10px] text-[#555]">YOUR RANK</span>
          <span className="font-mono text-[11px]" style={{ color: '#00ff88' }}>#{data.yourRank.rank}</span>
          <span className="font-mono text-[10px] text-[#555] ml-auto">{Number(data.yourRank.credits || 0).toLocaleString()} credits</span>
          <span className="font-mono text-[10px] text-[#555]">{Number(data.yourRank.totalSol || 0).toFixed(2)} SOL</span>
        </div>
      )}

      {ecosystem && (
        <div className="px-4 py-3 flex gap-4 flex-wrap" style={{ borderTop: '1px solid #1a1a1a' }}>
          <span className="font-mono text-[10px] text-[#555]">Total: {Number(ecosystem.totalSolBurned || 0).toFixed(2)} SOL</span>
          <span className="font-mono text-[10px] text-[#555]">Burns: {Number(ecosystem.totalBurns || 0)}</span>
          <span className="font-mono text-[10px] text-[#555]">Wallets: {Number(ecosystem.uniqueBurners || 0)}</span>
        </div>
      )}
    </div>
  );
}