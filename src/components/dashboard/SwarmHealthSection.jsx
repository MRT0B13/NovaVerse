import React, { useState, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import useNovaQuery from '../../hooks/useNovaQuery';
import { SkeletonRect } from '../nova/Skeleton';
import NovaPill from '../nova/NovaPill';
import CollapsibleSection from './CollapsibleSection';
import { relativeTime } from '../nova/formatters';

function HealthTile({ label, value, color }) {
  return (
    <div className="p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-[#555] mb-1">{label}</p>
      <p className="font-mono text-sm font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function CriticalErrorRow({ error }) {
  return (
    <div className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid #111' }}>
      <NovaPill text={error.agent_name || 'unknown'} color="#ff4444" />
      <span className="font-mono text-[11px] text-[#bbb] flex-1 truncate">{error.message}</span>
      <span className="font-mono text-[10px] text-[#333] shrink-0">{relativeTime(error.created_at)}</span>
    </div>
  );
}

export default function SwarmHealthSection() {
  const apiFetch = useApi();
  const [started, setStarted] = useState(false);
  const [critErrors, setCritErrors] = useState(null);
  const [showCritErrors, setShowCritErrors] = useState(false);

  // Only fetch once the section has been opened. React Query handles
  // caching + refetch interval — no manual setInterval needed.
  const { data, isLoading } = useNovaQuery(
    'health-overview',
    '/health/overview',
    { enabled: started, staleTime: 20_000, refetchInterval: started ? 30_000 : false },
  );

  const handleFirstOpen = useCallback(() => {
    setStarted(true);
  }, []);

  const fetchCriticalErrors = async () => {
    if (critErrors) { setShowCritErrors(s => !s); return; }
    const res = await apiFetch('/health/errors?severity=critical&limit=5').catch(() => []);
    setCritErrors(res || []);
    setShowCritErrors(true);
  };

  const summary = (() => {
    if (!data) return 'Loading…';
    const s = data.status;
    const alive = data.agents?.alive ?? '?';
    const total = data.agents?.total ?? '?';
    const crit = data.errors?.critical ?? 0;
    if (crit > 0) return `⚠ ${crit} critical error${crit > 1 ? 's' : ''}`;
    return `${(s || 'UNKNOWN').toUpperCase()} · ${alive}/${total} agents`;
  })();

  const summaryColor = (() => {
    if (!data) return '#555';
    if ((data.errors?.critical ?? 0) > 0) return '#ff4444';
    if (data.status === 'healthy') return '#00ff88';
    if (data.status === 'degraded') return '#ff9500';
    return '#ff4444';
  })();

  const statusColors = { healthy: '#00ff88', degraded: '#ff9500', critical: '#ff4444' };

  return (
    <CollapsibleSection title="Swarm Health" icon="🛡" accentColor="#00ff88" summary={summary} summaryColor={summaryColor} onFirstOpen={handleFirstOpen}>
      {isLoading || !data ? (
        <div className="space-y-3">
          <SkeletonRect h={20} />
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => <SkeletonRect key={i} h={50} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <NovaPill
              text={(data.status || 'unknown').toUpperCase()}
              color={statusColors[data.status] || '#555'}
            />
            <span className="font-mono text-[10px] text-[#333]">{data.checkedAt ? relativeTime(data.checkedAt) : ''}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <HealthTile
              label="Agents Alive"
              value={`${data.agents?.alive ?? 0} / ${data.agents?.total ?? 0}`}
              color={data.agents?.alive === data.agents?.total ? '#00ff88' : '#ff9500'}
            />
            <HealthTile
              label="Errors (5min)"
              value={data.agents?.totalErrors5min ?? 0}
              color={(data.agents?.totalErrors5min ?? 0) === 0 ? '#00ff88' : '#ff4444'}
            />
            <HealthTile
              label="Unresolved Errors"
              value={data.errors?.unresolved ?? 0}
              color={(data.errors?.unresolved ?? 0) === 0 ? '#00ff88' : (data.errors?.critical ?? 0) > 0 ? '#ff4444' : '#ff9500'}
            />
            <HealthTile
              label="Restarts (24h)"
              value={data.restarts24h ?? 0}
              color={(data.restarts24h ?? 0) === 0 ? '#00ff88' : '#ff9500'}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#555]">
              APIs: {data.apis?.up ?? 0}/{data.apis?.total ?? 0} online
            </span>
            {(data.apis?.down ?? 0) > 0 && (
              <span className="font-mono text-[10px]" style={{ color: '#ff4444' }}>
                {data.apis.down} down
              </span>
            )}
            {(data.apis?.slow ?? 0) > 0 && (
              <span className="font-mono text-[10px]" style={{ color: '#ff9500' }}>
                {data.apis.slow} slow
              </span>
            )}
          </div>

          {(data.errors?.critical ?? 0) > 0 && (
            <div className="rounded p-3" style={{ background: '#ff444418', border: '1px solid #ff444430' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs" style={{ color: '#ff4444' }}>
                  ⚠ {data.errors.critical} critical error{data.errors.critical > 1 ? 's' : ''} require attention
                </span>
                <button
                  onClick={fetchCriticalErrors}
                  className="font-mono text-[10px] cursor-pointer hover:opacity-80"
                  style={{ background: 'none', border: 'none', color: '#ff4444', textDecoration: 'underline' }}
                >
                  {showCritErrors ? 'Hide' : 'View Errors →'}
                </button>
              </div>
              {showCritErrors && critErrors && (
                <div className="mt-2">
                  {critErrors.length === 0 ? (
                    <p className="font-mono text-[10px] text-[#555]">No critical errors found</p>
                  ) : (
                    critErrors.map((err, i) => <CriticalErrorRow key={err.id || i} error={err} />)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
