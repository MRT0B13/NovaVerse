import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth, API } from '../components/nova/AuthContext';
import useNovaQuery from '../hooks/useNovaQuery';
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
import { useQueryClient } from '@tanstack/react-query';

const WS_BACKOFF_BASE = 1000;
const WS_BACKOFF_MAX = 30000;
const WS_HEARTBEAT_TIMEOUT = 45000; // consider stale if no message for 45s

export default function Dashboard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [connectionLost, setConnectionLost] = useState(false);
  const [dashTab, setDashTab] = useState('feed');
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  // ── React Query data fetching ──────────────────────────────────────
  const { data: portfolio, isLoading: loadingPortfolio, refetch: refetchPortfolio } =
    useNovaQuery('portfolio', '/portfolio', { staleTime: 20_000, refetchInterval: 30_000 });

  const { data: feedRaw, isLoading: loadingFeed } =
    useNovaQuery('feed', '/feed?limit=20', {
      staleTime: 10_000,
      refetchInterval: wsConnected ? false : 30_000,
    });

  const { data: skills, isLoading: loadingSkills, refetch: refetchSkills } =
    useNovaQuery('skills', '/skills', { staleTime: 60_000, refetchInterval: 60_000 });

  const { data: agent, isLoading: loadingAgent, refetch: refetchAgent } =
    useNovaQuery('agent-me', '/agents/me', { staleTime: 30_000, refetchInterval: 30_000 });

  const feed = Array.isArray(feedRaw) ? feedRaw : (feedRaw?.items || feedRaw?.feed || []);

  const refreshAll = React.useCallback(() => {
    refetchPortfolio();
    refetchSkills();
    refetchAgent();
  }, [refetchPortfolio, refetchSkills, refetchAgent]);

  // ── WebSocket for live feed — with exponential backoff + heartbeat ──
  useEffect(() => {
    if (!token) return;
    let ws;
    let reconnectTimeout;
    let heartbeatTimeout;
    let isMounted = true;
    let retryCount = 0;

    function resetHeartbeat() {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        // No message received in HEARTBEAT_TIMEOUT — connection is stale
        if (isMounted) {
          setConnectionLost(true);
          setWsConnected(false);
        }
        if (ws?.readyState === WebSocket.OPEN) ws.close();
      }, WS_HEARTBEAT_TIMEOUT);
    }

    function connect() {
      const wsUrl = API.replace(/^http/, 'ws') + `/ws/live?token=${token}`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) {
          setConnectionLost(false);
          setWsConnected(true);
          retryCount = 0; // reset backoff on successful connect
        }
        resetHeartbeat();
      };

      ws.onmessage = (event) => {
        resetHeartbeat();
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'feed_event' && parsed.data) {
            queryClient.setQueryData(['feed'], (old) => {
              const prev = Array.isArray(old) ? old : (old?.items || old?.feed || []);
              return [parsed.data, ...prev].slice(0, 50);
            });
          }
        } catch {
          // Malformed WS message — ignore silently
        }
      };

      ws.onclose = () => {
        clearTimeout(heartbeatTimeout);
        if (!isMounted) return;
        setConnectionLost(true);
        setWsConnected(false);
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
        const delay = Math.min(WS_BACKOFF_MAX, WS_BACKOFF_BASE * Math.pow(2, retryCount));
        retryCount++;
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      isMounted = false;
      clearTimeout(heartbeatTimeout);
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [token, queryClient]);

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
      {connectionLost && <ErrorBanner />}

      <StatsRow
        portfolio={portfolio}
        skills={skills}
        agent={agent}
        loadingPortfolio={loadingPortfolio}
        loadingSkills={loadingSkills}
        loadingAgent={loadingAgent}
      />

      <div className="mt-4">
        <PortfolioChart />
      </div>

      <div className="mt-4">
        <DashboardTabs activeTab={dashTab} onChange={setDashTab} />
      </div>

      {dashTab === 'feed' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <LiveFeed items={feed} loading={loadingFeed} />
            <OpenPositions positions={portfolio?.positions} loading={loadingPortfolio} />
          </div>
          <div className="w-full lg:w-[340px] shrink-0 space-y-4">
            {agent ? (
              <>
                <AgentSidebarCard agent={agent} onRefresh={refreshAll} />
                <SidebarSkills skills={skills} onRefresh={refreshAll} />
                <SidebarNetwork agent={agent} nova={portfolio?.nova} />
                <SwarmHealthSection />
                <LearningEngineSection />
                <SupervisorSection />
              </>
            ) : !loadingAgent ? (
              <div className="nova-card p-8 text-center">
                <p className="font-mono text-xs text-[#555] mb-3">No agent deployed</p>
                <Link to={createPageUrl('AgentFactory')} className="font-mono text-xs no-underline" style={{ color: '#00ff88' }}>→ Deploy one</Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <MyAgentTab agent={agent} skills={skills} nova={portfolio?.nova} loading={loadingAgent} onRefresh={refreshAll} />
      )}
    </div>
  );
}
