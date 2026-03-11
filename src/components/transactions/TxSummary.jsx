import React from 'react';
import StatCard from '../nova/StatCard';
import NovaPill from '../nova/NovaPill';
import { formatUSD, strategyColor } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

export default function TxSummary({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="nova-card p-4 space-y-2"><SkeletonRect w="60%" h={10} /><SkeletonRect w="40%" h={24} /></div>)}
      </div>
    );
  }
  if (!summary) return null;

  const topStrategies = Object.entries(summary.tx_count_by_strategy || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Volume (30d)" value={formatUSD(summary.total_volume_usd)} color="#00ff88" />
        <StatCard label="Fees (30d)" value={formatUSD(summary.total_fees_usd)} color="#ff9500" />
        <StatCard label="Tx Count" value={Object.values(summary.tx_count_by_strategy || {}).reduce((a, b) => a + Number(b || 0), 0)} color="#00c8ff" />
      </div>
      {topStrategies.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-[#555]">Top:</span>
          {topStrategies.map(([k, v]) => (
            <NovaPill key={k} text={`${k} (${v})`} color={strategyColor(k)} />
          ))}
        </div>
      )}
    </div>
  );
}