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

  const STATUS_MAP = {
    running:   { label: 'Running',      color: '#00ff88' },
    paused:    { label: 'Paused',       color: '#ff9500' },
    deploying: { label: 'Deploying',    color: '#00c8ff' },
    error:     { label: 'Error',        color: '#ff4444' },
  };
  const agentStatusInfo = agent ? (STATUS_MAP[agent.status] || { label: agent.status, color: '#ff4444' })
    : { label: 'Not Deployed', color: '#555' };

  const dim = noAgent ? '#555' : undefined;
  const placeholder = noAgent ? '—' : undefined;
  const sub = noAgent ? 'Deploy an agent to see live data' : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Portfolio Total" value={placeholder || formatUSD(totalValue)} color={dim || '#00ff88'} sub={sub} />
      <StatCard
        label="NOVA Tokens"
        value={placeholder || novaBalance.toLocaleString()}
        sub={sub || `+${novaEarned} this month`}
        color={dim || '#c084fc'}
      />
      <StatCard
        label="Active Skills"
        value={placeholder || `${enabledSkills} / ${totalSkills}`}
        color={dim || '#00c8ff'}
        sub={sub}
      />
      <StatCard
        label="Agent Status"
        value={agentStatusInfo.label}
        color={agentStatusInfo.color}
        sub={sub}
      />
    </div>
  );
}