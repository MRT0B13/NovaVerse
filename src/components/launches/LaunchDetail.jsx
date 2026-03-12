import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatUSD, formatSOL, truncateAddress } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = { DRAFT: '#555', READY: '#ff9500', LAUNCHED: '#00c8ff', FAILED: '#ff4444' };

export default function LaunchDetail({ launchId, onBack }) {
  const apiFetch = useApi();
  const [data, setData] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceHist, setPriceHist] = useState([]);
  const [isBurnable, setIsBurnable] = useState(false);

  useEffect(() => {
    apiFetch(`/launches/${launchId}`).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [launchId, apiFetch]);

  useEffect(() => {
    if (!data) return;
    const dd = data.data || data;
    const burnMint = dd.launch?.mint;
    if (!burnMint) return;
    apiFetch('/burn/eligible')
      .then(tokens => setIsBurnable((tokens || []).some(t => t.mint === burnMint)))
      .catch(() => {});
  }, [data, apiFetch]);

  useEffect(() => {
    const fetchPrice = () => apiFetch(`/launches/${launchId}/price`).then(p => {
      setPrice(p);
      setPriceHist(prev => [...prev, { t: Date.now(), p: Number(p?.price_usd || 0) }].slice(-60));
    }).catch(() => {});
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [launchId, apiFetch]);

  if (loading) return <div className="space-y-4"><SkeletonRect h={200} /><SkeletonRect h={100} /></div>;
  if (!data) return <p className="font-mono text-xs text-[#555]">Launch not found</p>;

  // Normalize: GET /launches/:id returns { id, data: { brand, launch, assets, ops, links, mascot, ... }, launch_status }
  const d = data.data || data;
  const brand = d.brand || {};
  const launch = d.launch || {};
  const links = d.links || {};
  const assets = d.assets || {};
  const ops = d.ops || {};
  const sellState = ops.sell_state || {};
  const sellPolicy = ops.sell_policy || {};
  const tpLevels = sellPolicy.take_profit_levels || [];
  const mascot = d.mascot || {};
  const auditLog = (ops.audit_log || []).slice(-5);
  const status = (data.launch_status || launch.status || 'DRAFT').toUpperCase();
  const logoUrl = assets.logo_url || null;
  const mint = launch.mint || null;
  const gradProgress = Number(price?.graduation_progress || sellState.graduation_progress || 0);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="font-mono text-xs cursor-pointer hover:opacity-80" style={{ background: 'none', border: 'none', color: '#00ff88' }}>← Back to Launches</button>

      {/* Header */}
      <div className="nova-card p-6">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
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
            {brand.description && <p className="font-mono text-[10px] text-[#666] mt-1">{brand.description}</p>}
          </div>
        </div>
      </div>

      {/* Price chart */}
      {priceHist.length > 1 && (
        <div className="nova-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Price History</span>
          <div className="mt-2" style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHist}>
                <XAxis dataKey="t" tick={false} stroke="#1a1a1a" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#555' }} width={50} tickFormatter={v => `$${v.toFixed(4)}`} stroke="#1a1a1a" />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 10 }} labelFormatter={() => ''} formatter={(v) => [`$${Number(v).toFixed(6)}`, 'Price']} />
                <Line type="monotone" dataKey="p" stroke="#00ff88" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
      {isBurnable && (
        <div className="nova-card p-3 flex items-center gap-2">
          <span className="font-mono text-[11px]" style={{ color: '#ff9500' }}>🔥 Burnable</span>
          <Link to={createPageUrl('Burn')} className="font-mono text-[10px] no-underline" style={{ color: '#ff4444' }}>→ Burn page</Link>
        </div>
      )}

      {/* Links */}
      <div className="nova-card p-4 flex flex-wrap gap-3">
        {launch.pump_url && <a href={launch.pump_url} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#00c8ff' }}>pump.fun ↗</a>}
        {mint && <a href={`https://solscan.io/token/${mint}`} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#c084fc' }}>{truncateAddress(mint)} ↗</a>}
        {links.telegram && <a href={links.telegram} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#00c8ff' }}>Telegram ↗</a>}
        {links.x && <a href={links.x} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#bbb' }}>X/Twitter ↗</a>}
      </div>

      {/* Mascot */}
      {mascot.name && (
        <div className="nova-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Mascot</p>
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
      {tpLevels.length > 0 && (
        <div className="nova-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Auto-Sell Ladder</p>
          <div className="space-y-1">
            {tpLevels.map((tp, i) => (
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
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Audit Log</p>
          <div className="space-y-2">
            {auditLog.map((entry, i) => {
              if (typeof entry === 'string') return <p key={i} className="font-mono text-[10px] text-[#888]">{entry}</p>;
              return (
                <div key={i} className="flex items-start gap-2 py-1" style={{ borderBottom: '1px solid #111' }}>
                  {entry.at && <span className="font-mono text-[9px] text-[#555] shrink-0">{new Date(entry.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                  <span className="font-mono text-[10px] text-[#888]">{entry.message || JSON.stringify(entry)}</span>
                  {entry.actor && <span className="font-mono text-[9px] text-[#555] shrink-0 ml-auto">{entry.actor}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}