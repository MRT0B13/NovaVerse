import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import { formatUSD } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const PERIODS = ['1d', '7d', '30d'];

export default function PortfolioChart() {
  const apiFetch = useApi();
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  const fetchPnl = useCallback(() => {
    setLoading(true);
    apiFetch(`/portfolio/pnl?period=${period}`)
      .then(d => setData(Array.isArray(d) ? d : (d?.snapshots || [])))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [period, apiFetch]);

  useEffect(() => { fetchPnl(); }, [fetchPnl]);

  return (
    <div className="nova-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
          Portfolio Value
        </span>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="font-mono text-[10px] px-2.5 py-1 rounded-[4px] cursor-pointer transition-all"
              style={{
                background: period === p ? '#1a1a1a' : 'transparent',
                border: `1px solid ${period === p ? '#333' : '#1a1a1a'}`,
                color: period === p ? '#fff' : '#555',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonRect h={160} />
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 160 }}>
          <p className="font-mono text-[11px] text-[#555]">No portfolio data yet — PnL chart will appear once trades are recorded.</p>
        </div>
      ) : (
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="ts" tick={false} stroke="#1a1a1a" />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 9, fill: '#555' }}
                width={60}
                tickFormatter={v => `$${Number(v).toFixed(0)}`}
                stroke="#1a1a1a"
              />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: 10 }}
                labelFormatter={() => ''}
                formatter={(v) => [formatUSD(v), 'Value']}
              />
              <Area
                type="monotone"
                dataKey="total_value_usd"
                stroke="#00ff88"
                fill="url(#pnlGrad)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
