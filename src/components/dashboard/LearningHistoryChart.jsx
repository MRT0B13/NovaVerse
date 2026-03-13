import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import { SkeletonRect } from '../nova/Skeleton';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea } from 'recharts';

const REGIME_COLORS = { bullish: '#00ff8830', neutral: '#88888820', bearish: '#ff444430' };
const PERIODS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
];

export default function LearningHistoryChart() {
  const apiFetch = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/learning/history?days=${days}`);
      setData(res?.snapshots || []);
    } catch { setData([]); }
    setLoading(false);
  }, [apiFetch, days]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) return <SkeletonRect h={180} />;
  if (!data || data.length === 0) {
    return (
      <div className="mt-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-2">Regime History</p>
        <div className="flex items-center justify-center rounded" style={{ height: 120, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          <p className="font-mono text-[10px] text-[#555]">No regime history yet — data accumulates over time.</p>
        </div>
      </div>
    );
  }

  // Build regime bands for background coloring
  const regimeBands = [];
  let bandStart = 0;
  let currentRegime = data[0]?.regime;
  for (let i = 1; i <= data.length; i++) {
    const regime = i < data.length ? data[i].regime : null;
    if (regime !== currentRegime) {
      regimeBands.push({ start: bandStart, end: i - 1, regime: currentRegime });
      bandStart = i;
      currentRegime = regime;
    }
  }

  const chartData = data.map((s, i) => ({
    idx: i,
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    confidence: Number((s.confidence * 100).toFixed(1)),
    risk: Number((s.globalRisk || 1).toFixed(2)),
    sharpe: s.portfolioSharpe != null ? Number(Number(s.portfolioSharpe).toFixed(2)) : null,
  }));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Regime History</p>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className="font-mono text-[9px] px-2 py-0.5 rounded cursor-pointer"
              style={{
                background: days === p.days ? '#1a1a1a' : 'transparent',
                color: days === p.days ? '#fff' : '#555',
                border: days === p.days ? '1px solid #333' : '1px solid transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            {regimeBands.map((band, i) => (
              <ReferenceArea
                key={i}
                x1={band.start}
                x2={band.end}
                fill={REGIME_COLORS[band.regime] || '#88888810'}
                fillOpacity={1}
              />
            ))}
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#555' }} stroke="#1a1a1a" interval="preserveStartEnd" />
            <YAxis yAxisId="pct" domain={[0, 100]} tick={{ fontSize: 9, fill: '#555' }} width={32} stroke="#1a1a1a" tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="val" orientation="right" tick={{ fontSize: 9, fill: '#555' }} width={32} stroke="#1a1a1a" />
            <Tooltip
              contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 10, fontFamily: 'monospace' }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
            />
            <Line yAxisId="pct" type="monotone" dataKey="confidence" stroke="#00c8ff" dot={false} strokeWidth={1.5} name="Confidence %" />
            <Line yAxisId="val" type="monotone" dataKey="risk" stroke="#ff9500" dot={false} strokeWidth={1.5} name="Risk Mult" />
            <Line yAxisId="val" type="monotone" dataKey="sharpe" stroke="#c084fc" dot={false} strokeWidth={1.5} name="Sharpe" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-1">
        <span className="font-mono text-[9px] text-[#555]">Background: <span style={{ color: '#00ff88' }}>Bullish</span> / <span style={{ color: '#888' }}>Neutral</span> / <span style={{ color: '#ff4444' }}>Bearish</span></span>
      </div>
    </div>
  );
}
