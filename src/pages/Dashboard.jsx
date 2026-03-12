import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth, useApi } from '../components/nova/AuthContext';
import StatsRow from '../components/dashboard/StatsRow';
import LiveFeed from '../components/dashboard/LiveFeed';
import OpenPositions from '../components/dashboard/OpenPositions';
import AgentSidebarCard from '../components/dashboard/AgentSidebarCard';
import SidebarSkills from '../components/dashboard/SidebarSkills';
import SidebarNetwork from '../components/dashboard/SidebarNetwork';
import SwarmHealthSection from '../components/dashboard/SwarmHealthSection';
import LearningEngineSection from '../components/dashboard/LearningEngineSection';
import SupervisorSection from '../components/dashboard/SupervisorSection';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import MyAgentTab from '../components/dashboard/MyAgentTab';
import ErrorBanner from '../components/nova/ErrorBanner';
import PortfolioChart from '../components/dashboard/PortfolioChart';

export default function Dashboard() {
  const { token } = useAuth();
  const apiFetch = useApi();

  const [portfolio, setPortfolio] = useState(null);
  const [feed, setFeed] = useState([]);
  const [skills, setSkills] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionLost, setConnectionLost] = useState(false);
  const [dashTab, setDashTab] = useState('feed');
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
    if (results[1].status === 'fulfilled') {
      const feedData = results[1].value;
      const items = Array.isArray(feedData) ? feedData : (feedData?.items || feedData?.feed || []);
      setFeed(items);
    }
    if (results[2].status === 'fulfilled') setSkills(results[2].value || []);
    if (results[3].status === 'fulfilled') setAgent(results[3].value);
    setLoading(false);
  }, [apiFetch]);

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
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      };

      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'feed_event' && parsed.data) {
          setFeed(prev => [parsed.data, ...(Array.isArray(prev) ? prev : [])].slice(0, 50));
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionLost(true);
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

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
      {connectionLost && <ErrorBanner />}

      <StatsRow portfolio={portfolio} skills={skills} agent={agent} loading={loading} />

      <div className="mt-4">
        <PortfolioChart />
      </div>

      <div className="mt-4">
        <DashboardTabs activeTab={dashTab} onChange={setDashTab} />
      </div>

      {dashTab === 'feed' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <LiveFeed items={feed} loading={loading} />
            <OpenPositions positions={portfolio?.positions} loading={loading} />
          </div>
          <div className="w-full lg:w-[340px] shrink-0 space-y-4">
            {agent ? (
              <>
                <AgentSidebarCard agent={agent} onRefresh={fetchData} />
                <SidebarSkills skills={skills} onRefresh={fetchData} />
                <SidebarNetwork agent={agent} nova={portfolio?.nova} />
                <SwarmHealthSection />
                <LearningEngineSection />
                <SupervisorSection />
              </>
            ) : (
              <div className="nova-card p-8 text-center">
                <p className="font-mono text-xs text-[#555] mb-3">No agent deployed</p>
                <Link to={createPageUrl('AgentFactory')} className="font-mono text-xs no-underline" style={{ color: '#00ff88' }}>→ Deploy one</Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <MyAgentTab agent={agent} skills={skills} nova={portfolio?.nova} loading={loading} onRefresh={fetchData} />
      )}
    </div>
  );
}