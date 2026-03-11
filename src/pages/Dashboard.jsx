import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useApi } from '../components/nova/AuthContext';
import StatsRow from '../components/dashboard/StatsRow';
import LiveFeed from '../components/dashboard/LiveFeed';
import OpenPositions from '../components/dashboard/OpenPositions';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import MyAgentTab from '../components/dashboard/MyAgentTab';
import ErrorBanner from '../components/nova/ErrorBanner';

export default function Dashboard() {
  const { token } = useAuth();
  const apiFetch = useApi();

  const [portfolio, setPortfolio] = useState(null);
  const [feed, setFeed] = useState([]);
  const [skills, setSkills] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionLost, setConnectionLost] = useState(false);
  const [tab, setTab] = useState('feed');
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      apiFetch('/portfolio'),
      apiFetch('/feed?limit=20'),
      apiFetch('/skills'),
      apiFetch('/agents/me'),
    ]);

    console.log('[Dashboard] fetch results:', results.map((r, i) => ({ i, status: r.status, hasValue: r.status === 'fulfilled' ? !!r.value : false, reason: r.reason?.message })));
    
    if (results[0].status === 'fulfilled') setPortfolio(results[0].value);
    if (results[1].status === 'fulfilled') {
      const feedData = results[1].value;
      console.log('[Dashboard] feed raw:', Array.isArray(feedData) ? `array(${feedData.length})` : typeof feedData, feedData);
      // Handle both array and object with items/feed key
      const items = Array.isArray(feedData) ? feedData : (feedData?.items || feedData?.feed || []);
      setFeed(items);
    }
    if (results[2].status === 'fulfilled') setSkills(results[2].value || []);
    if (results[3].status === 'fulfilled') setAgent(results[3].value);
    setLoading(false);
  }, [apiFetch]);

  // Initial load + 30s refresh for portfolio/agent
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // WebSocket for live feed
  useEffect(() => {
    if (!token) return;

    let ws;
    let reconnectTimeout;
    let isMounted = true;

    function connect() {
      ws = new WebSocket(`wss://enthusiastic-respect-production-3521.up.railway.app/api/ws/live?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) setConnectionLost(false);
        // Stop polling if WS is open
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        console.log('[WS] message:', event.data?.slice?.(0, 200));
        const parsed = JSON.parse(event.data);
        const { type, data } = parsed;
        if (type === 'feed_event' && data) {
          setFeed(prev => [data, ...(Array.isArray(prev) ? prev : [])].slice(0, 50));
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionLost(true);
        // Start polling fallback
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            const res = await apiFetch('/feed?limit=20').catch(() => null);
            if (res) {
              const items = Array.isArray(res) ? res : (res?.items || res?.feed || []);
              setFeed(items);
            }
          }, 5000);
        }
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, apiFetch]);

  const handleRefresh = () => fetchData();

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto space-y-4">
      {connectionLost && <ErrorBanner />}

      <StatsRow portfolio={portfolio} skills={skills} agent={agent} loading={loading} />
      <DashboardTabs active={tab} onChange={setTab} />

      {tab === 'feed' && (
        <div className="space-y-4">
          <LiveFeed items={feed} loading={loading} />
          <OpenPositions positions={portfolio?.positions} loading={loading} />
        </div>
      )}

      {tab === 'agent' && (
        <MyAgentTab
          agent={agent}
          skills={skills}
          nova={portfolio?.nova}
          loading={loading}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}