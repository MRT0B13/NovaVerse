import React from 'react';
import StatCard from '../nova/StatCard';
import { formatUSD } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

function SkeletonCard() {
  return (
    <div className="nova-card p-4 space-y-3">
      <SkeletonRect w="60%" h={10} />
      <SkeletonRect w="80%" h={24} />
    </div>
  );
}

export default function StatsRow({ portfolio, skills, agent, loadingPortfolio, loadingSkills, loadingAgent }) {
  const noAgent = !agent && !loadingAgent;
  const totalValue = Number(portfolio?.summary?.total_value_usd || 0);
  const novaBalance = Number(portfolio?.nova?.balance || 0);
  const novaEarned = Number(portfolio?.nova?.earned_month || 0);
  const enabledSkills = skills?.filter(s => s.enabled)?.length || 0;
  const totalSkills = skills?.length || 0;

  const STATUS_COLORS = { running: '#00ff88', paused: '#ff9500', deploying: '#00c8ff', error: '#ff4444' };
  const agentStatus = agent?.status;
  const statusColor = noAgent ? '#555' : (STATUS_COLORS[agentStatus] || '#555');
  const statusLabel = noAgent ? 'Not Deployed' : agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1);
  const sub = noAgent ? 'Deploy an agent to see live data' : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {loadingPortfolio ? <SkeletonCard /> : (
        <StatCard label="Portfolio Total" value={noAgent ? '—' : formatUSD(totalValue)} color={noAgent ? '#555' : '#00ff88'} sub={noAgent ? sub : undefined} />
      )}
      {loadingPortfolio ? <SkeletonCard /> : (
        <StatCard
          label="NOVA Tokens"
          value={noAgent ? '—' : novaBalance.toLocaleString()}
          sub={noAgent ? sub : `+${novaEarned} this month`}
          color={noAgent ? '#555' : '#c084fc'}
        />
      )}
      {loadingSkills ? <SkeletonCard /> : (
        <StatCard
          label="Active Skills"
          value={noAgent ? '—' : `${enabledSkills} / ${totalSkills}`}
          color={noAgent ? '#555' : '#00c8ff'}
          sub={noAgent ? sub : (totalSkills === 0 ? 'No skills loaded — deploy an agent to activate skills' : undefined)}
        />
      )}
      {loadingAgent ? <SkeletonCard /> : (
        <StatCard
          label="Agent Status"
          value={statusLabel}
          color={statusColor}
          sub={noAgent ? sub : undefined}
        />
      )}
    </div>
  );
}
