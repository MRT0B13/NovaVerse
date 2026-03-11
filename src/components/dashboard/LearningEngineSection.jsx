import React, { useState, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import { SkeletonRect } from '../nova/Skeleton';
import NovaPill from '../nova/NovaPill';
import CollapsibleSection from './CollapsibleSection';

const STRATEGY_COLORS = {
  polymarket: '#c084fc',
  hyperliquid: '#00c8ff',
  orca_lp: '#00ff88',
  krystal_lp: '#00e5cc',
  kamino: '#ff9500',
  jito: '#ffd700',
  jupiter_swap: '#6366f1',
  evm_flash_arb: '#f472b6',
};

function getStrategyColor(key) {
  if (STRATEGY_COLORS[key]) return STRATEGY_COLORS[key];
  if (key.startsWith('hl_')) return '#00c8ff';
  if (key.startsWith('kamino_') || key.startsWith('kamino')) return '#ff9500';
  return '#555';
}

const REGIME_STYLES = {
  bull: { label: 'BULL MARKET', color: '#00ff88' },
  bear: { label: 'BEAR MARKET', color: '#ff4444' },
  neutral: { label: 'NEUTRAL', color: '#888' },
  volatile: { label: 'VOLATILE', color: '#ff9500' },
};

export default function LearningEngineSection() {
  const apiFetch = useApi();
  const [params, setParams] = useState(null);
  const [regime, setRegime] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleFirstOpen = useCallback(async () => {
    setStarted(true);
    setLoading(true);
    const [p, r, s] = await Promise.allSettled([
      apiFetch('/learning/params'),
      apiFetch('/learning/regime'),
      apiFetch('/learning/stats'),
    ]);
    if (p.status === 'fulfilled') setParams(p.value);
    if (r.status === 'fulfilled') setRegime(r.value);
    if (s.status === 'fulfilled') setStats(s.value);
    setLoading(false);
  }, [apiFetch]);

  // Summary for collapsed state
  const summary = (() => {
    if (!started) return null;
    if (loading) return 'Loading…';
    if (!params || params.status === 'no-data') return 'No data yet';
    const rs = regime?.regimeSignal || 'neutral';
    const conf = regime?.confidenceLevel != null ? (regime.confidenceLevel * 100).toFixed(0) + '%' : '?';
    const label = REGIME_STYLES[rs]?.label || rs.toUpperCase();
    return `${label} · ${conf} confidence`;
  })();

  const summaryColor = (() => {
    if (!regime) return '#555';
    return REGIME_STYLES[regime.regimeSignal]?.color || '#888';
  })();

  return (
    <CollapsibleSection title="Learning Engine" icon="🧠" accentColor="#00c8ff" summary={summary} summaryColor={summaryColor} onFirstOpen={handleFirstOpen}>
      {loading ? (
        <div className="space-y-3">
          <SkeletonRect h={20} />
          <SkeletonRect h={60} />
          <SkeletonRect h={100} />
        </div>
      ) : !params || params.status === 'no-data' ? (
        <div className="py-6 text-center">
          <p className="font-mono text-xs text-[#555]">
            Learning engine is accumulating data. Needs closed positions to compute parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Regime + Confidence */}
          <div className="flex items-center gap-3 flex-wrap">
            <NovaPill
              text={REGIME_STYLES[regime?.regimeSignal]?.label || (regime?.regimeSignal || 'UNKNOWN').toUpperCase()}
              color={REGIME_STYLES[regime?.regimeSignal]?.color || '#888'}
            />
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <span className="font-mono text-[10px] text-[#555]">Confidence</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(regime?.confidenceLevel ?? 0) * 100}%`,
                    background: '#00c8ff',
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-[#00c8ff]">
                {regime?.confidenceLevel != null ? `${(regime.confidenceLevel * 100).toFixed(0)}%` : '?'}
              </span>
            </div>
          </div>

          {/* Global Risk Multiplier */}
          <div className="p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-1">Global Risk Multiplier</p>
            <p className="font-mono text-2xl font-bold" style={{
              color: (params.globalRiskMultiplier ?? 1) > 1 ? '#00ff88' : (params.globalRiskMultiplier ?? 1) < 1 ? '#ff4444' : '#888'
            }}>
              {params.globalRiskMultiplier ?? '—'}x
            </p>
            <p className="font-mono text-[9px] text-[#444] mt-1">Global risk multiplier applied to all strategies.</p>
          </div>

          {/* Strategy Performance Table */}
          {stats && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Strategy Performance</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                      {['Strategy', 'Win Rate', 'Avg PnL', 'Kelly Mult'].map(h => (
                        <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(stats) ? stats : Object.entries(stats).map(([k, v]) => ({ strategy: k, ...v }))).map(row => {
                      const key = row.strategy || row.name;
                      const color = getStrategyColor(key);
                      const wr = row.winRate ?? row.win_rate;
                      const wrColor = wr > 55 ? '#00ff88' : wr < 45 ? '#ff4444' : '#888';
                      const kelly = params.strategies?.[key]?.kellyMultiplier;
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px]" style={{ color }}>{key}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px]" style={{ color: wrColor }}>
                              {wr != null ? `${Number(wr).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px]" style={{
                              color: (row.avgPnl ?? row.avg_pnl ?? 0) > 0 ? '#00ff88' : (row.avgPnl ?? row.avg_pnl ?? 0) < 0 ? '#ff4444' : '#888'
                            }}>
                              {(row.avgPnl ?? row.avg_pnl) != null ? `$${Number(row.avgPnl ?? row.avg_pnl).toFixed(2)}` : '—'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px] text-[#bbb]">
                              {kelly != null ? `${Number(kelly).toFixed(2)}x` : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts */}
          {params.alerts && params.alerts.length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Alerts</p>
              <div className="space-y-1">
                {params.alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: '#ff950010', border: '1px solid #ff950020' }}>
                    <span className="font-mono text-[11px]" style={{ color: '#ff9500' }}>⚠ {typeof alert === 'string' ? alert : alert.message || JSON.stringify(alert)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capital Weights */}
          {params.capitalWeights && Object.keys(params.capitalWeights).length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Capital Weights</p>
              <div className="space-y-2">
                {Object.entries(params.capitalWeights).map(([key, weight]) => {
                  const pct = (weight * 100).toFixed(1);
                  const color = getStrategyColor(key);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-[10px]" style={{ color }}>{key}</span>
                        <span className="font-mono text-[10px] text-[#555]">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}