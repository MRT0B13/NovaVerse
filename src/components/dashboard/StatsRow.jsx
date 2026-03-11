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

  const noAgent = !agent;
  const totalValue = portfolio?.positions?.reduce((s, p) => s + (p.amount_usd || 0), 0) || 0;
  const novaBalance = portfolio?.nova?.balance || 0;
  const novaEarned = portfolio?.nova?.earned_month || 0;
  const enabledSkills = skills?.filter(s => s.enabled)?.length || 0;
  const totalSkills = skills?.length || 0;

  const STATUS_COLORS = { running: '#00ff88', paused: '#ff9500', deploying: '#00c8ff', error: '#ff9500' };
  const agentStatus = agent?.status;
  const statusColor = noAgent ? '#555' : (STATUS_COLORS[agentStatus] || '#555');
  const statusLabel = noAgent ? 'Not Deployed' : agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1);
  const sub = noAgent ? 'Deploy an agent to see live data' : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Portfolio Total" value={noAgent ? '—' : formatUSD(totalValue)} color={noAgent ? '#555' : '#00ff88'} sub={noAgent ? sub : undefined} />
      <StatCard
        label="NOVA Tokens"
        value={noAgent ? '—' : novaBalance.toLocaleString()}
        sub={noAgent ? sub : `+${novaEarned} this month`}
        color={noAgent ? '#555' : '#c084fc'}
      />
      <StatCard
        label="Active Skills"
        value={noAgent ? '—' : `${enabledSkills} / ${totalSkills}`}
        color={noAgent ? '#555' : '#00c8ff'}
        sub={noAgent ? sub : (totalSkills === 0 ? 'No skills loaded — deploy an agent to activate skills' : undefined)}
      />
      <StatCard
        label="Agent Status"
        value={statusLabel}
        color={statusColor}
        sub={noAgent ? sub : undefined}
      />
    </div>
  );
}