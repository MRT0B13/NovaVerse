import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import LaunchCard from '../components/launches/LaunchCard';
import LaunchDetail from '../components/launches/LaunchDetail';
import NewLaunchModal from '../components/launches/NewLaunchModal';
import { SkeletonRect } from '../components/nova/Skeleton';

export default function Launches() {
  const apiFetch = useApi();
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const fetchLaunches = useCallback(async () => {
    const res = await apiFetch('/launches').catch(() => []);
    setLaunches(res || []);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { fetchLaunches(); }, [fetchLaunches]);

  if (selectedId) {
    return (
      <div className="p-4 md:p-6 max-w-[900px] mx-auto">
        <LaunchDetail launchId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-bold text-lg text-white">LAUNCHED PACKS</h1>
        <button
          onClick={() => setShowNew(true)}
          className="font-mono text-[11px] px-4 py-2 rounded-md cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
        >
          New Launch +
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonRect key={i} h={120} />)}
        </div>
      ) : launches.length === 0 ? (
        <div className="nova-card p-12 text-center">
          <p className="font-mono text-xs text-[#555]">No launch packs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {launches.map(l => (
            <LaunchCard key={l.id} launch={l} onClick={() => setSelectedId(l.id)} />
          ))}
        </div>
      )}

      {showNew && (
        <NewLaunchModal
          onClose={() => setShowNew(false)}
          onCreated={(res) => { setShowNew(false); fetchLaunches(); if (res?.id) setSelectedId(res.id); }}
        />
      )}
    </div>
  );
}