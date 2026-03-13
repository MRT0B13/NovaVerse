import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import StatCard from '../components/nova/StatCard';
import LiveDot from '../components/nova/LiveDot';
import NovaPill from '../components/nova/NovaPill';
import { SkeletonRect } from '../components/nova/Skeleton';
import { relativeTime } from '../components/nova/formatters';
import AgentStatusTable from '../components/swarm/AgentStatusTable';
import HealthReportsFeed from '../components/swarm/HealthReportsFeed';
import RepairLog from '../components/swarm/RepairLog';
import ApiHealthPanel from '../components/swarm/ApiHealthPanel';
import SwarmBriefing from '../components/swarm/SwarmBriefing';

const STATUS_STYLES = {
  healthy:  { color: '#00ff88', label: 'HEALTHY' },
  degraded: { color: '#ff9500', label: 'DEGRADED' },
  critical: { color: '#ff4444', label: 'CRITICAL' },
};

export default function SwarmOps() {
  const apiFetch = useApi();
  const [overview, setOverview] = useState(null);
  const [agents, setAgents] = useState([]);
  const [reports, setReports] = useState([]);
  const [errors, setErrors] = useState([]);
  const [restarts, setRestarts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [apis, setApis] = useState([]);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      apiFetch('/health/overview'),
      apiFetch('/health/agents'),
      apiFetch('/health/reports?limit=20'),
      apiFetch('/health/errors?limit=50'),
      apiFetch('/health/restarts?limit=30'),
      apiFetch('/health/repairs?limit=20'),
      apiFetch('/health/apis'),
      apiFetch('/supervisor/digest'),
    ]);

    if (results[0].status === 'fulfilled') setOverview(results[0].value);
    if (results[1].status === 'fulfilled') {
      const d = results[1].value;
      setAgents(Array.isArray(d) ? d : (d?.agents || []));
    }
    if (results[2].status === 'fulfilled') {
      const d = results[2].value;
      setReports(Array.isArray(d) ? d : (d?.reports || []));
    }
    if (results[3].status === 'fulfilled') {
      const d = results[3].value;
      setErrors(Array.isArray(d) ? d : (d?.errors || []));
    }
    if (results[4].status === 'fulfilled') {
      const d = results[4].value;
      setRestarts(Array.isArray(d) ? d : (d?.restarts || []));
    }
    if (results[5].status === 'fulfilled') {
      const d = results[5].value;
      setRepairs(Array.isArray(d) ? d : (d?.repairs || []));
    }
    if (results[6].status === 'fulfilled') {
      const d = results[6].value;
      setApis(Array.isArray(d) ? d : (d?.apis || []));
    }
    if (results[7].status === 'fulfilled') setDigest(results[7].value);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const agentsObj = overview?.agents || {};
  // Count alive based on both the alive boolean AND the status field
  const aliveCount = agentsObj.alive ?? agents.filter(a => {
    if (a.alive === true) return true;
    if (a.alive === false) return false;
    const s = (a.status || '').toLowerCase();
    return s === 'alive' || s === 'running' || s === 'active';
  }).length;
  const totalCount = agentsObj.total ?? agents.length;
  const statusKey = (overview?.status || 'healthy').toLowerCase();
  const style = STATUS_STYLES[statusKey] || STATUS_STYLES.healthy;
  const errCount = errors.length;
  const restartCount = overview?.restarts24h ?? restarts.length;
  const repairCount = repairs.length;
  const lastReport = reports[0]?.created_at || reports[0]?.time;

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto space-y-4">
      {/* Header */}
      <h1 className="font-syne font-bold text-lg text-white">SWARM OPS</h1>

      {/* Status Banner */}
      {loading ? (
        <SkeletonRect h={48} />
      ) : (
        <div
          className="nova-card p-4 flex items-center gap-3 flex-wrap"
          style={{ borderLeft: `3px solid ${style.color}` }}
        >
          <LiveDot color={style.color} />
          <NovaPill text={style.label} color={style.color} />
          <span className="font-mono text-[11px] text-[#bbb]">
            {aliveCount}/{totalCount} agents alive
          </span>
          {lastReport && (
            <span className="font-mono text-[10px] text-[#555] ml-auto">
              Last report: {relativeTime(lastReport)}
            </span>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Agents Online" value={loading ? '...' : `${aliveCount}/${totalCount}`} color="#00ff88" />
        <StatCard label="Errors" value={loading ? '...' : errCount} color={errCount > 0 ? '#ff4444' : '#555'} />
        <StatCard label="Restarts 24h" value={loading ? '...' : restartCount} color={restartCount > 0 ? '#ff9500' : '#555'} />
        <StatCard label="Repairs" value={loading ? '...' : repairCount} color={repairCount > 0 ? '#00c8ff' : '#555'} />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left — main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <AgentStatusTable agents={agents} loading={loading} />
          <HealthReportsFeed reports={reports} loading={loading} />
          <RepairLog repairs={repairs} loading={loading} />
        </div>

        {/* Right — sidebar */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-4">
          <SwarmBriefing digest={digest} loading={loading} />
          <ApiHealthPanel apis={apis} loading={loading} />

          {/* Restart History (compact) */}
          {restarts.length > 0 && (
            <div className="nova-card p-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Recent Restarts</span>
              <div className="mt-2 space-y-1">
                {restarts.slice(0, 10).map((r, i) => (
                  <div key={r.id || i} className="flex items-center gap-2 py-1" style={{ borderBottom: '1px solid #111' }}>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: r.success ? '#00ff88' : '#ff4444' }}
                    />
                    <span className="font-mono text-[10px] text-[#888] truncate flex-1">
                      {r.agent_name || r.agent || '?'}
                    </span>
                    <span className="font-mono text-[9px] text-[#555] shrink-0">
                      {r.restart_type || r.type || ''}
                    </span>
                    <span className="font-mono text-[9px] text-[#444] shrink-0">
                      {(r.created_at || r.time) ? relativeTime(r.created_at || r.time) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
