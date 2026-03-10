import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useApi } from '../components/nova/AuthContext';
import StatsRow from '../components/dashboard/StatsRow';
import LiveFeed from '../components/dashboard/LiveFeed';
import OpenPositions from '../components/dashboard/OpenPositions';
import AgentSidebar from '../components/dashboard/AgentSidebar';
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
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      apiFetch('/portfolio'),
      apiFetch('/feed?limit=20'),
      apiFetch('/skills'),
      apiFetch('/agents/me'),
    ]);

    if (results[0].status === 'fulfilled') setPortfolio(results[0].value);
    if (results[1].status === 'fulfilled') setFeed(results[1].value || []);
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
      ws = new WebSocket(`wss://api.novaverse.xyz/api/ws/live?token=${token}`);
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
        const { type, data } = JSON.parse(event.data);
        if (type === 'feed_event' && data) {
          setFeed(prev => [data, ...prev].slice(0, 50));
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionLost(true);
        // Start polling fallback
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            const res = await apiFetch('/feed?limit=20').catch(() => null);
            if (res) setFeed(res);
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
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
      {connectionLost && <ErrorBanner />}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <StatsRow portfolio={portfolio} skills={skills} agent={agent} loading={loading} />
          <LiveFeed items={feed} loading={loading} />
          <OpenPositions positions={portfolio?.positions} loading={loading} />
        </div>

        {/* Sidebar */}
        <AgentSidebar
          agent={agent}
          skills={skills}
          nova={portfolio?.nova}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}