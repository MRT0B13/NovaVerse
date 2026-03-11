import React, { useState, useEffect } from 'react';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatUSD, formatSOL } from '../nova/formatters';

const STATUS_COLORS = {
  DRAFT: '#555',
  READY: '#ff9500',
  LAUNCHED: '#00c8ff',
  FAILED: '#ff4444',
};

export default function LaunchCard({ launch, onClick }) {
  const apiFetch = useApi();
  const [price, setPrice] = useState(null);
  const brand = launch.brand || {};
  const status = (launch.launch_status || 'DRAFT').toUpperCase();
  const color = STATUS_COLORS[status] || '#555';
  const isGraduated = price?.is_graduated || launch.sell_state?.is_graduated;

  useEffect(() => {
    if (status !== 'LAUNCHED') return;
    const fetchPrice = () => apiFetch(`/launches/${launch.id}/price`).then(setPrice).catch(() => {});
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [launch.id, status, apiFetch]);

  return (
    <button
      onClick={() => onClick(launch)}
      className="nova-card p-4 text-left w-full cursor-pointer transition-all hover:border-[#2a2a2a]"
      style={{ border: '1px solid #1a1a1a', background: '#0a0a0a' }}
    >
      <div className="flex items-start gap-3">
        {launch.logo_url ? (
          <img src={launch.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <div
            className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center font-syne font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #00ff88, #00c8ff)' }}
          >
            {(brand.ticker || '?').slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne font-bold text-sm text-white truncate">{brand.name || 'Untitled'}</span>
            <NovaPill text={`$${brand.ticker || '???'}`} color="#00c8ff" />
            <NovaPill text={status} color={color} />
            {isGraduated && <NovaPill text="GRADUATED 🎓" color="#00ff88" />}
          </div>

          {status === 'LAUNCHED' && (() => {
            const gradProgress = Number(price?.graduation_progress || launch.sell_state?.graduation_progress || 0);
            return (
              <div className="mt-2 space-y-1">
                {price && (
                  <p className="font-mono text-[11px] text-[#bbb]">
                    MCap: {formatUSD(price.market_cap)}
                  </p>
                )}
                {(launch.sell_state?.current_price_sol || price?.price_usd) && (
                  <p className="font-mono text-[10px] text-[#888]">
                    {launch.sell_state?.current_price_sol ? `${formatSOL(launch.sell_state.current_price_sol)}` : ''}
                    {launch.sell_state?.peak_price_sol ? ` · Peak: ${formatSOL(launch.sell_state.peak_price_sol)}` : ''}
                  </p>
                )}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(gradProgress, 100)}%`,
                      background: gradProgress >= 90 ? 'linear-gradient(90deg, #00ff88, #ffd700, #c084fc)' : 'linear-gradient(90deg, #00ff88, #ffd700)',
                    }}
                  />
                </div>
                <p className="font-mono text-[9px] text-[#555]">{gradProgress.toFixed(1)}% of $69k graduation</p>
              </div>
            );
          })()}

          {Number(launch.treasury_sol || 0) > 0 && (
            <p className="font-mono text-[10px] text-[#555] mt-1">Treasury: {formatSOL(launch.treasury_sol)}</p>
          )}
        </div>
      </div>
    </button>
  );
}