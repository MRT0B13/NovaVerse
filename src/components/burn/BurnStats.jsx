import React from 'react';
import StatCard from '../nova/StatCard';
import { SkeletonRect } from '../nova/Skeleton';

export default function BurnStats({ stats, credits, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="nova-card p-4 space-y-2"><SkeletonRect w="60%" h={10} /><SkeletonRect w="40%" h={24} /></div>)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total SOL Burned" value={`${Number(stats?.totalSolBurned || 0).toFixed(2)} SOL`} color="#ff9500" />
      <StatCard label="Total Burns" value={Number(stats?.totalBurns || 0)} color="#ff4444" />
      <StatCard label="Unique Burners" value={Number(stats?.uniqueWallets || 0)} color="#00c8ff" />
      <StatCard label="Your Credits" value={Number(credits || 0).toLocaleString()} color="#00ff88" />
    </div>
  );
}