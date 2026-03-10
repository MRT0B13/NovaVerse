import React from 'react';
import StatCard from '../nova/StatCard';
import { formatUSD } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

export default function StatsRow({ portfolio, skills, agent, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="nova-card p-4 space-y-3">
            <SkeletonRect w="60%" h={10} />
            <SkeletonRect w="80%" h={24} />
          </div>
        ))}
      </div>
    );
  }

  const totalValue = portfolio?.positions?.reduce((s, p) => s + (p.amount_usd || 0), 0) || 0;
  const novaBalance = portfolio?.nova?.balance || 0;
  const novaEarned = portfolio?.nova?.earned_month || 0;
  const enabledSkills = skills?.filter(s => s.enabled)?.length || 0;
  const totalSkills = skills?.length || 0;
  const agentStatus = agent?.status || 'offline';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Portfolio Total" value={formatUSD(totalValue)} color="#00ff88" />
      <StatCard
        label="NOVA Tokens"
        value={novaBalance.toLocaleString()}
        sub={`+${novaEarned} this month`}
        color="#c084fc"
      />
      <StatCard
        label="Active Skills"
        value={`${enabledSkills} / ${totalSkills}`}
        color="#00c8ff"
      />
      <StatCard
        label="Agent Status"
        value={agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
        color="#ff9500"
      />
    </div>
  );
}