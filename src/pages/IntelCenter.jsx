import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import StatCard from '../components/nova/StatCard';
import LiveDot from '../components/nova/LiveDot';
import NovaPill from '../components/nova/NovaPill';
import { SkeletonRect } from '../components/nova/Skeleton';
import { relativeTime } from '../components/nova/formatters';
import IntelFeed from '../components/intel/IntelFeed';

const TABS = [
  { key: 'scout', label: '🔭 Scout Intel', agent: 'Nova Scout', color: '#00c8ff' },
  { key: 'analyst', label: '📊 Analyst', agent: 'Nova Analyst', color: '#00c8ff' },
];

export default function IntelCenter() {
  const apiFetch = useApi();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scout');

  const fetchFeed = useCallback(async () => {
    try {
      const res = await apiFetch('/feed?limit=100');
      const items = Array.isArray(res) ? res : (res?.items || res?.feed || []);
      setFeed(items);
    } catch { /* silent */ }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const tab = TABS.find(t => t.key === activeTab);
  const filtered = feed.filter(item => item.agent === tab.agent);

  // Derive stats from filtered items
  const scoutStats = {
    signals: feed.filter(i => i.agent === 'Nova Scout' && (i.type || '').toLowerCase().includes('intel')).length,
    total: feed.filter(i => i.agent === 'Nova Scout').length,
    lastTime: feed.find(i => i.agent === 'Nova Scout')?.time,
  };
  const analystStats = {
    tokens: new Set(
      feed.filter(i => i.agent === 'Nova Analyst')
        .map(i => i.raw?.token || i.raw?.asset)
        .filter(Boolean)
    ).size,
    total: feed.filter(i => i.agent === 'Nova Analyst').length,
    lastTime: feed.find(i => i.agent === 'Nova Analyst')?.time,
  };

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LiveDot color="#00c8ff" />
        <h1 className="font-syne font-bold text-lg text-white">INTEL CENTER</h1>
        <NovaPill text="LIVE" color="#00c8ff" />
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-all"
            style={{
              background: activeTab === t.key ? '#1a1a1a' : 'transparent',
              color: activeTab === t.key ? '#fff' : '#555',
              border: 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <SkeletonRect key={i} h={70} />)}
        </div>
      ) : activeTab === 'scout' ? (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Signals" value={scoutStats.signals} color="#00c8ff" />
          <StatCard label="Total Messages" value={scoutStats.total} color="#00c8ff" />
          <StatCard
            label="Last Research"
            value={scoutStats.lastTime ? relativeTime(scoutStats.lastTime) : '—'}
            color="#888"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Tokens Tracked" value={analystStats.tokens} color="#00c8ff" />
          <StatCard label="Total Messages" value={analystStats.total} color="#00c8ff" />
          <StatCard
            label="Last Analysis"
            value={analystStats.lastTime ? relativeTime(analystStats.lastTime) : '—'}
            color="#888"
          />
        </div>
      )}

      {/* Feed */}
      <IntelFeed
        items={filtered}
        loading={loading}
        emptyMessage={`No ${tab.agent.replace('Nova ', '')} intel yet`}
      />
    </div>
  );
}
