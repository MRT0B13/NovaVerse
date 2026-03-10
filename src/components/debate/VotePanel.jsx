import React, { useState } from 'react';
import NovaPill from '../nova/NovaPill';
import LiveDot from '../nova/LiveDot';
import { useApi } from '../nova/AuthContext';

function VoteTally({ proposal }) {
  const yes = proposal?.votes_yes || 0;
  const no = proposal?.votes_no || 0;
  const abstain = proposal?.votes_abstain || 0;
  const total = yes + no + abstain || 1;

  const bars = [
    { label: 'YES', value: yes, pct: (yes / total * 100).toFixed(1), color: '#00ff88' },
    { label: 'NO', value: no, pct: (no / total * 100).toFixed(1), color: '#ff4444' },
    { label: 'ABSTAIN', value: abstain, pct: (abstain / total * 100).toFixed(1), color: '#888' },
  ];

  return (
    <div className="nova-card p-4 space-y-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Live Tally</span>
      {bars.map(b => (
        <div key={b.label}>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px]" style={{ color: b.color }}>{b.label}</span>
            <span className="font-mono text-[10px] text-[#555]">{b.pct}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: '#1a1a1a' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${b.pct}%`, background: b.color }}
            />
          </div>
          <span className="font-mono text-[10px] text-[#333]">{b.value} votes</span>
        </div>
      ))}
    </div>
  );
}

function AgentRecommendation({ proposal, novaBalance, onVote, voting }) {
  const hasVoted = proposal?.your_vote != null;

  return (
    <div className="nova-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">💹</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Agent Recommendation</span>
      </div>
      <p className="font-syne text-sm text-[#bbb]">
        Based on your risk profile, your agent recommends <span style={{ color: '#00ff88' }}>YES</span>.
      </p>
      <p className="font-mono text-[10px] text-[#555]">
        Your {novaBalance || 0} NOVA = {novaBalance || 0} votes
      </p>

      {hasVoted ? (
        <NovaPill
          text={`You voted: ${proposal.your_vote}`}
          color={proposal.your_vote === 'YES' ? '#00ff88' : proposal.your_vote === 'NO' ? '#ff4444' : '#888'}
        />
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onVote('YES')}
            disabled={voting}
            className="flex-1 font-mono text-xs py-2 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
          >
            ✓ Vote YES
          </button>
          <button
            onClick={() => onVote('NO')}
            disabled={voting}
            className="flex-1 font-mono text-xs py-2 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888' }}
          >
            Override
          </button>
        </div>
      )}
    </div>
  );
}

function DebatingNow({ agents }) {
  return (
    <div className="nova-card p-4 space-y-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Debating Now</span>
      {(!agents || agents.length === 0) ? (
        <p className="font-mono text-xs text-[#555]">No agents debating</p>
      ) : (
        <div className="space-y-2">
          {[...new Map(agents.map(a => [a.role, a])).values()].map(agent => (
            <div key={agent.role} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: (agent.color || '#888') + '20' }}
              >
                {agent.avatar || '🤖'}
              </div>
              <span className="font-syne text-xs" style={{ color: agent.color }}>{agent.agent}</span>
              <LiveDot color={agent.color || '#888'} size={4} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VotePanel({ proposal, debateMessages, novaBalance, onVoted }) {
  const apiFetch = useApi();
  const [voting, setVoting] = useState(false);

  const handleVote = async (choice) => {
    setVoting(true);
    await apiFetch(`/governance/proposals/${proposal.id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ choice, agentRecommended: choice === 'YES' }),
    });
    setVoting(false);
    onVoted?.();
  };

  return (
    <div className="space-y-4 w-full lg:w-[280px] shrink-0">
      <AgentRecommendation
        proposal={proposal}
        novaBalance={novaBalance}
        onVote={handleVote}
        voting={voting}
      />
      <VoteTally proposal={proposal} />
      <DebatingNow agents={debateMessages} />
    </div>
  );
}