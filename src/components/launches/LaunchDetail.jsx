import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import LaunchEditModal from './LaunchEditModal';
import { formatUSD, formatSOL, truncateAddress, relativeTime } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = { DRAFT: '#555', READY: '#ff9500', LAUNCHED: '#00c8ff', FAILED: '#ff4444' };

export default function LaunchDetail({ launchId, onBack, onRefresh }) {
  const apiFetch = useApi();
  const [data, setData] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceHist, setPriceHist] = useState([]);
  const [isBurnable, setIsBurnable] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
  const auditLog = (ops.audit_log || []).slice(-10);
  const status = (data.launch_status || launch.status || 'DRAFT').toUpperCase();
  const logoUrl = assets.logo_url || null;
  const mint = launch.mint || null;
  const gradProgress = Number(price?.graduation_progress || sellState.graduation_progress || 0);
  const createdAt = data.created_at || d.created_at;

  // Collect all key-value details for the info grid
  const details = [];
  if (mint) details.push({ label: 'Mint', value: truncateAddress(mint), href: `https://solscan.io/token/${mint}` });
  if (launch.pump_url) details.push({ label: 'Pump', value: 'pump.fun', href: launch.pump_url });
  if (data.owner_wallet) details.push({ label: 'Owner', value: truncateAddress(data.owner_wallet) });
  if (data.agent_id) details.push({ label: 'Agent', value: data.agent_id });
  if (createdAt) details.push({ label: 'Created', value: relativeTime(createdAt) });
  if (launch.sol_amount) details.push({ label: 'Dev Buy', value: formatSOL(launch.sol_amount) });
  if (data.treasury_sol != null) details.push({ label: 'Treasury', value: formatSOL(data.treasury_sol) });
  if (sellState.total_sold_pct != null) details.push({ label: 'Sold', value: `${Number(sellState.total_sold_pct).toFixed(1)}%` });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="font-mono text-xs cursor-pointer hover:opacity-80" style={{ background: 'none', border: 'none', color: '#00ff88' }}>← Back to Launches</button>
        <button
          onClick={() => setShowEdit(true)}
          className="font-mono text-[11px] px-3 py-1.5 rounded cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: '#00c8ff18', border: '1px solid #00c8ff40', color: '#00c8ff' }}
        >
          ✏ Edit
        </button>
      </div>

      {/* Header — larger with description prominent */}
      <div className="nova-card p-6">
        <div className="flex items-start gap-5">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl flex items-center justify-center font-syne font-bold text-2xl text-white shrink-0" style={{ background: 'linear-gradient(135deg, #00ff88, #00c8ff)' }}>
              {(brand.ticker || '?').slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-syne font-bold text-2xl text-white">{brand.name || 'Unnamed'}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <NovaPill text={`$${brand.ticker || '???'}`} color="#00c8ff" />
              <NovaPill text={status} color={STATUS_COLORS[status] || '#555'} />
              {price?.is_graduated && <NovaPill text="GRADUATED 🎓" color="#00ff88" />}
              {isBurnable && <NovaPill text="🔥 BURNABLE" color="#ff9500" />}
            </div>
            {brand.tagline && (
              <p className="font-mono text-sm text-[#aaa] mt-3">{brand.tagline}</p>
            )}
            {brand.description && (
              <p className="font-mono text-xs text-[#777] mt-2 leading-relaxed max-w-[600px]">{brand.description}</p>
            )}
            {!brand.description && !brand.tagline && (
              <p className="font-mono text-xs text-[#444] mt-3 italic">No description yet — <button onClick={() => setShowEdit(true)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#00c8ff' }}>add one</button></p>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column — main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Price chart */}
          {priceHist.length > 1 && (
            <div className="nova-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Price History</span>
              <div className="mt-2" style={{ height: 140 }}>
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
              {price.price_usd != null && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs text-[#888]">Token Price</span>
                  <span className="font-mono text-sm text-[#00ff88]">${Number(price.price_usd).toFixed(6)}</span>
                </div>
              )}
              {price.volume_24h != null && Number(price.volume_24h) > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs text-[#888]">24h Volume</span>
                  <span className="font-mono text-sm text-[#bbb]">{formatUSD(price.volume_24h)}</span>
                </div>
              )}
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

          {/* Audit Log — show more entries */}
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

          {/* Status message for FAILED launches */}
          {status === 'FAILED' && (
            <div className="nova-card p-4" style={{ borderLeft: '3px solid #ff4444' }}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#ff4444] mb-2">Launch Failed</p>
              <p className="font-mono text-xs text-[#888] leading-relaxed">
                {ops.error || ops.failure_reason || launch.error ||
                  'This launch encountered an error during the pump.fun launch process. Check the audit log for details or try relaunching.'}
              </p>
              {(ops.error_at || ops.failed_at) && (
                <p className="font-mono text-[10px] text-[#555] mt-2">
                  Failed {relativeTime(ops.error_at || ops.failed_at)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar — details + links */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-4">
          {/* Details grid */}
          <div className="nova-card p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-3">Details</p>
            <div className="space-y-2.5">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#555] shrink-0">{d.label}</span>
                  {d.href ? (
                    <a href={d.href} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline truncate" style={{ color: '#00c8ff' }}>{d.value} ↗</a>
                  ) : (
                    <span className="font-mono text-[11px] text-[#bbb] truncate">{d.value}</span>
                  )}
                </div>
              ))}
              {details.length === 0 && (
                <p className="font-mono text-[10px] text-[#444] italic">No details available</p>
              )}
            </div>
          </div>

          {/* Links card */}
          <div className="nova-card p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-3">Links</p>
            <div className="space-y-2">
              {launch.pump_url && (
                <a href={launch.pump_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#00c8ff' }}>
                  🚀 pump.fun ↗
                </a>
              )}
              {mint && (
                <a href={`https://solscan.io/token/${mint}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#c084fc' }}>
                  🔗 Solscan ↗
                </a>
              )}
              {links.telegram && (
                <a href={links.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#00c8ff' }}>
                  💬 Telegram ↗
                </a>
              )}
              {links.x && (
                <a href={links.x} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#bbb' }}>
                  🐦 X/Twitter ↗
                </a>
              )}
              {links.website && (
                <a href={links.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#888' }}>
                  🌐 Website ↗
                </a>
              )}
              {!launch.pump_url && !mint && !links.telegram && !links.x && !links.website && (
                <p className="font-mono text-[10px] text-[#444] italic">No links — <button onClick={() => setShowEdit(true)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#00c8ff' }}>add some</button></p>
              )}
            </div>
          </div>

          {/* Mascot card */}
          {mascot.name ? (
            <div className="nova-card p-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Mascot</p>
              <p className="font-syne font-bold text-sm text-white">{mascot.name}</p>
              {mascot.personality && <p className="font-mono text-[11px] text-[#888] mt-1">{mascot.personality}</p>}
              {mascot.catchphrases?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mascot.catchphrases.map((c, i) => <NovaPill key={i} text={`"${c}"`} color="#ffd700" />)}
                </div>
              )}
            </div>
          ) : (
            <div className="nova-card p-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Mascot</p>
              <p className="font-mono text-[10px] text-[#444] italic">No mascot set — <button onClick={() => setShowEdit(true)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#00c8ff' }}>add one</button></p>
            </div>
          )}

          {/* Burn eligible */}
          {isBurnable && (
            <div className="nova-card p-4" style={{ borderLeft: '3px solid #ff9500' }}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#ff9500] mb-2">🔥 Burnable</p>
              <p className="font-mono text-[10px] text-[#888] mb-2">This token is eligible for the burn program.</p>
              <Link to={createPageUrl('Burn')} className="font-mono text-[11px] no-underline hover:opacity-80" style={{ color: '#ff4444' }}>
                Go to Burn page →
              </Link>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <LaunchEditModal
          launchId={launchId}
          initialData={d}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            apiFetch(`/launches/${launchId}`).then(dd => { setData(dd); }).catch(() => {});
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
