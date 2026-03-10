import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NovaPill from '../nova/NovaPill';
import { timeRemaining } from '../nova/formatters';

const STATUS_COLORS = {
  active: '#c084fc',
  passed: '#888',
  rejected: '#888',
  expired: '#555',
};

export default function ProposalCard({ proposal }) {
  const statusColor = STATUS_COLORS[proposal.status] || '#888';
  const yes = proposal.votes_yes || 0;
  const no = proposal.votes_no || 0;
  const abstain = proposal.votes_abstain || 0;
  const total = yes + no + abstain || 1;

  const yesPct = (yes / total * 100).toFixed(1);
  const noPct = (no / total * 100).toFixed(1);
  const abstainPct = (abstain / total * 100).toFixed(1);

  const inner = (
    <div className="nova-card p-4 transition-all hover:border-[#222]" style={{ cursor: proposal.status === 'active' ? 'pointer' : 'default' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-[#555]">#{proposal.id}</span>
          <NovaPill text={proposal.status} color={statusColor} />
          {proposal.your_vote && (
            <NovaPill
              text={`You: ${proposal.your_vote}`}
              color={proposal.your_vote === 'YES' ? '#00ff88' : proposal.your_vote === 'NO' ? '#ff4444' : '#888'}
            />
          )}
        </div>
        <span className="font-mono text-[10px] text-[#555] shrink-0">
          {timeRemaining(proposal.ends_at)}
        </span>
      </div>

      <h3 className="font-syne font-semibold text-sm text-white mb-3">{proposal.title}</h3>

      {/* Vote bar */}
      <div className="h-1 rounded-full flex overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${yesPct}%`, background: '#00ff88' }} />
        <div className="h-full transition-all duration-500" style={{ width: `${noPct}%`, background: '#ff4444' }} />
        <div className="h-full transition-all duration-500" style={{ width: `${abstainPct}%`, background: '#888' }} />
      </div>

      <div className="flex gap-4 mt-2">
        <span className="font-mono text-[10px]" style={{ color: '#00ff88' }}>{yesPct}% YES</span>
        <span className="font-mono text-[10px]" style={{ color: '#ff4444' }}>{noPct}% NO</span>
        <span className="font-mono text-[10px]" style={{ color: '#888' }}>{abstainPct}% ABSTAIN</span>
      </div>
    </div>
  );

  if (proposal.status === 'active') {
    return (
      <Link to={createPageUrl(`DebateChamber?proposalId=${proposal.id}`)} className="no-underline block">
        {inner}
      </Link>
    );
  }

  return inner;
}