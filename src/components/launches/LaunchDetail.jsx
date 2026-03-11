import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatUSD, formatSOL, truncateAddress } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

const STATUS_COLORS = { DRAFT: '#555', READY: '#ff9500', LAUNCHED: '#00c8ff', FAILED: '#ff4444' };

export default function LaunchDetail({ launchId, onBack }) {
  const apiFetch = useApi();
  const [data, setData] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const priceHistory = useRef([]);

  useEffect(() => {
    apiFetch(`/launches/${launchId}`).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [launchId, apiFetch]);

  useEffect(() => {
    const fetchPrice = () => apiFetch(`/launches/${launchId}/price`).then(p => {
      setPrice(p);
      priceHistory.current = [...priceHistory.current, { t: Date.now(), p: Number(p?.price_usd || 0) }].slice(-60);
    }).catch(() => {});
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [launchId, apiFetch]);

  if (loading) return <div className="space-y-4"><SkeletonRect h={200} /><SkeletonRect h={100} /></div>;
  if (!data) return <p className="font-mono text-xs text-[#555]">Launch not found</p>;

  const brand = data.brand || {};
  const launch = data.launch || {};
  const sellState = data.sell_state || {};
  const mascot = data.mascot || launch.mascot;
  const auditLog = (data.ops?.audit_log || []).slice(-5);
  const status = (data.launch_status || 'DRAFT').toUpperCase();
  const gradProgress = Number(price?.graduation_progress || sellState.graduation_progress || 0);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="font-mono text-xs cursor-pointer hover:opacity-80" style={{ background: 'none', border: 'none', color: '#00ff88' }}>← Back to Launches</button>

      {/* Header */}
      <div className="nova-card p-6">
        <div className="flex items-start gap-4">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg flex items-center justify-center font-syne font-bold text-xl text-white" style={{ background: 'linear-gradient(135deg, #00ff88, #00c8ff)' }}>
              {(brand.ticker || '?').slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="font-syne font-bold text-xl text-white">{brand.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <NovaPill text={`$${brand.ticker || '???'}`} color="#00c8ff" />
              <NovaPill text={status} color={STATUS_COLORS[status] || '#555'} />
              {price?.is_graduated && <NovaPill text="GRADUATED 🎓" color="#00ff88" />}
            </div>
            {brand.tagline && <p className="font-mono text-[11px] text-[#888] mt-2">{brand.tagline}</p>}
          </div>
        </div>
      </div>

      {/* Price + Graduation */}
      {price && (
        <div className="nova-card p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs text-[#888]">Market Cap</span>
            <span className="font-syne font-bold text-lg text-white">{formatUSD(price.market_cap)}</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div className="h-full rounded-full" style={{
              width: `${Math.min(gradProgress, 100)}%`,
              background: gradProgress >= 90 ? 'linear-gradient(90deg, #00ff88, #ffd700, #c084fc)' : 'linear-gradient(90deg, #00ff88, #ffd700)',
            }} />
          </div>
          <p className="font-mono text-[10px] text-[#555]">{gradProgress.toFixed(1)}% of $69k graduation</p>
          {sellState.current_price_sol && (
            <p className="font-mono text-[11px] text-[#bbb]">Price: {formatSOL(sellState.current_price_sol)} {sellState.peak_price_sol ? `(Peak: ${formatSOL(sellState.peak_price_sol)})` : ''}</p>
          )}
        </div>
      )}

      {/* Burn eligible badge */}
      <div className="nova-card p-3 flex items-center gap-2">
        <span className="font-mono text-[11px]" style={{ color: '#ff9500' }}>🔥 Burnable</span>
        <Link to={createPageUrl('Burn')} className="font-mono text-[10px] no-underline" style={{ color: '#ff4444' }}>→ Burn page</Link>
      </div>

      {/* Links */}
      <div className="nova-card p-4 flex flex-wrap gap-3">
        {launch.pump_fun_url && <a href={launch.pump_fun_url} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#00c8ff' }}>pump.fun ↗</a>}
        {launch.mint_address && <a href={`https://solscan.io/token/${launch.mint_address}`} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#c084fc' }}>{truncateAddress(launch.mint_address)} ↗</a>}
        {launch.telegram_url && <a href={launch.telegram_url} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#00c8ff' }}>Telegram ↗</a>}
        {launch.x_url && <a href={launch.x_url} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#bbb' }}>X/Twitter ↗</a>}
      </div>

      {/* Mascot */}
      {mascot && (
        <div className="nova-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Mascot</p>
          <p className="font-syne font-bold text-sm text-white">{mascot.name || 'Unknown'}</p>
          {mascot.personality && <p className="font-mono text-[11px] text-[#888] mt-1">{mascot.personality}</p>}
          {mascot.catchphrases?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {mascot.catchphrases.map((c, i) => <NovaPill key={i} text={`"${c}"`} color="#ffd700" />)}
            </div>
          )}
        </div>
      )}

      {/* Auto-sell Ladder */}
      {sellState.tp_levels?.length > 0 && (
        <div className="nova-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Auto-Sell Ladder</p>
          <div className="space-y-1">
            {sellState.tp_levels.map((tp, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5" style={{ borderBottom: '1px solid #111' }}>
                <span className="font-mono text-[11px] text-[#bbb]">{Number(tp.threshold_x || 0)}x</span>
                <span className="font-mono text-[11px] text-[#555]">Sell {Number(tp.sell_percent || 0)}%</span>
                <span className="ml-auto">{tp.executed ? <NovaPill text="✓ EXECUTED" color="#00ff88" /> : <NovaPill text="PENDING" color="#555" />}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div className="nova-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Audit Log</p>
          <div className="space-y-1">
            {auditLog.map((entry, i) => (
              <p key={i} className="font-mono text-[10px] text-[#888]">{typeof entry === 'string' ? entry : JSON.stringify(entry)}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}