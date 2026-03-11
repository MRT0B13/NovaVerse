import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import StatCard from '../components/nova/StatCard';
import ProposalCard from '../components/governance/ProposalCard';
import SubmitProposalModal from '../components/governance/SubmitProposalModal';
import { SkeletonRect } from '../components/nova/Skeleton';

export default function Governance() {
  const apiFetch = useApi();
  const [proposals, setProposals] = useState([]);
  const [novaBalance, setNovaBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    const [p, port] = await Promise.allSettled([
      apiFetch('/governance/proposals'),
      apiFetch('/portfolio'),
    ]);
    if (p.status === 'fulfilled') setProposals(p.value || []);
    if (port.status === 'fulfilled') setNovaBalance(port.value?.nova?.balance || 0);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const votedCount = proposals.filter(p => p.your_vote != null).length;
  const activeCount = proposals.filter(p => p.status === 'active').length;

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="nova-card p-4 space-y-2">
              <SkeletonRect w="60%" h={10} />
              <SkeletonRect w="40%" h={24} />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Your NOVA" value={novaBalance.toLocaleString()} color="#c084fc" />
            <StatCard label="Proposals Voted" value={votedCount} color="#00ff88" />
            <StatCard label="Active Now" value={activeCount} color="#00c8ff" />
          </>
        )}
      </div>

      {/* Proposals list */}
      <div className="nova-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">All Proposals</span>
          <button
            onClick={() => setShowModal(true)}
            className="font-mono text-[10px] px-3 py-1 rounded cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: '#c084fc18', border: '1px solid #c084fc40', color: '#c084fc' }}
          >
            + Submit Proposal
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            [1,2,3].map(i => <SkeletonRect key={i} h={80} />)
          ) : proposals.length === 0 ? (
            <div className="py-12 text-center text-[#555] font-mono text-xs">
              No proposals yet
            </div>
          ) : (
            proposals.map(p => <ProposalCard key={p.id} proposal={p} />)
          )}
        </div>
      </div>

      {showModal && (
        <SubmitProposalModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}