import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import LiveDot from '../components/nova/LiveDot';
import NovaPill from '../components/nova/NovaPill';
import DebateMessage from '../components/debate/DebateMessage';
import VotePanel from '../components/debate/VotePanel';
import { timeRemaining } from '../components/nova/formatters';
import { SkeletonRect } from '../components/nova/Skeleton';

export default function DebateChamber() {
  const apiFetch = useApi();
  const [proposals, setProposals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [debateMessages, setDebateMessages] = useState([]);
  const [novaBalance, setNovaBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Parse URL for proposalId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('proposalId');
    if (pid) setSelectedId(Number(pid));
  }, []);

  // Fetch proposals
  const fetchProposals = useCallback(async () => {
    const [proposalsData, portfolioData] = await Promise.allSettled([
      apiFetch('/governance/proposals'),
      apiFetch('/portfolio'),
    ]);
    if (proposalsData.status === 'fulfilled') {
      const p = proposalsData.value || [];
      setProposals(p);
      if (!selectedId && p.length > 0) {
        const active = p.find(x => x.status === 'active');
        setSelectedId(active?.id || p[0].id);
      }
    }
    if (portfolioData.status === 'fulfilled') {
      setNovaBalance(portfolioData.value?.nova?.balance || 0);
    }
    setLoading(false);
  }, [apiFetch, selectedId]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  // Fetch debate messages for selected proposal
  const fetchDebate = useCallback(async () => {
    if (!selectedId) return;
    const msgs = await apiFetch(`/governance/debate/${selectedId}`).catch(() => []);
    setDebateMessages(msgs || []);
  }, [apiFetch, selectedId]);

  useEffect(() => {
    fetchDebate();
    const interval = setInterval(fetchDebate, 5000);
    return () => clearInterval(interval);
  }, [fetchDebate]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [debateMessages]);

  const selectedProposal = proposals.find(p => p.id === selectedId);
  const activeProposals = proposals.filter(p => p.status === 'active');

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1440px] mx-auto space-y-4">
        <SkeletonRect h={40} />
        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            {[1,2,3,4].map(i => <SkeletonRect key={i} h={60} />)}
          </div>
          <div className="w-[280px] space-y-4">
            {[1,2,3].map(i => <SkeletonRect key={i} h={100} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <LiveDot color="#c084fc" size={6} />
        <h1 className="font-syne font-bold text-lg text-white">
          DEBATE CHAMBER {selectedProposal ? `— PROPOSAL #${selectedProposal.id}` : ''}
        </h1>
        <NovaPill text="LIVE" color="#c084fc" />
      </div>

      {/* Proposal selector */}
      <div className="mb-4">
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(Number(e.target.value))}
          className="font-mono text-xs px-3 py-2 rounded cursor-pointer"
          style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
        >
          {activeProposals.map(p => (
            <option key={p.id} value={p.id}>#{p.id} — {p.title}</option>
          ))}
        </select>
      </div>

      {/* Proposal context */}
      {selectedProposal && (
        <div
          className="mb-4 p-4 rounded-lg"
          style={{ background: '#0d0d1a', border: '1px solid #c084fc30' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-[#555]">#{selectedProposal.id}</span>
            <h2 className="font-syne font-semibold text-sm text-white">{selectedProposal.title}</h2>
          </div>
          <p className="font-mono text-[10px] text-[#555]">
            Ends {timeRemaining(selectedProposal.ends_at)} · {selectedProposal.total_votes || 0} agents deliberating
          </p>
        </div>
      )}

      {/* Two columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Debate thread */}
        <div className="flex-1 min-w-0 nova-card">
          <div
            ref={scrollRef}
            className="overflow-y-auto px-4 divide-y divide-[#111]"
            style={{ maxHeight: 'calc(100vh - 320px)' }}
          >
            {debateMessages.length === 0 ? (
              <div className="py-16 text-center text-[#555] font-mono text-xs">
                No debate messages yet for this proposal
              </div>
            ) : (
              debateMessages.map((msg, idx) => (
                <DebateMessage key={msg.id || idx} message={msg} />
              ))
            )}
          </div>
        </div>

        {/* Vote panel */}
        {selectedProposal && (
          <VotePanel
            proposal={selectedProposal}
            debateMessages={debateMessages}
            novaBalance={novaBalance}
            onVoted={fetchProposals}
          />
        )}
      </div>
    </div>
  );
}