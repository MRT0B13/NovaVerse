import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useApi } from '../components/nova/AuthContext';
import BurnStats from '../components/burn/BurnStats';
import DistributionPools from '../components/burn/DistributionPools';
import BurnInterface from '../components/burn/BurnInterface';
import BurnHistory from '../components/burn/BurnHistory';
import BurnLeaderboard from '../components/burn/BurnLeaderboard';

export default function Burn() {
  const { address } = useAuth();
  const apiFetch = useApi();
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    const [s, c, e, w] = await Promise.allSettled([
      apiFetch('/burn/stats'),
      apiFetch('/burn/config'),
      apiFetch('/burn/eligible'),
      address ? apiFetch(`/burn/wallet/${address}`) : Promise.resolve(null),
    ]);
    if (s.status === 'fulfilled') setStats(s.value);
    if (c.status === 'fulfilled') setConfig(c.value);
    if (e.status === 'fulfilled') setEligible(e.value || []);
    if (w.status === 'fulfilled') setCredits(w.value?.credits?.available || 0);
    setLoading(false);
  }, [apiFetch, address]);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      <h1 className="font-syne font-bold text-lg text-white">BURN</h1>

      <BurnStats stats={stats} credits={credits} loading={loading} />
      <DistributionPools config={config} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <BurnInterface eligible={eligible} onBurnComplete={() => setRefreshKey(k => k + 1)} />
          <BurnHistory key={refreshKey} />
        </div>
        <div className="w-full lg:w-[400px] shrink-0">
          <BurnLeaderboard />
        </div>
      </div>
    </div>
  );
}