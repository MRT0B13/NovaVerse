import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import { SkeletonRect } from '../nova/Skeleton';
import NovaPill from '../nova/NovaPill';
import LiveDot from '../nova/LiveDot';
import CollapsibleSection from './CollapsibleSection';
import { relativeTime } from '../nova/formatters';

const AGENT_TYPE_COLORS = {
  cfo: '#00ff88',
  scout: '#00c8ff',
  guardian: '#ff9500',
  supervisor: '#888',
};

function agentColor(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, color] of Object.entries(AGENT_TYPE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#888';
}

const STATUS_DOT_COLORS = { alive: '#00ff88', degraded: '#ff9500', dead: '#ff4444' };

export default function SupervisorSection() {
  const apiFetch = useApi();
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState(null);
  const [decisions, setDecisions] = useState(null);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const fetchAll = useCallback(async () => {
    const [s, a, d, dg] = await Promise.allSettled([
      apiFetch('/supervisor/status'),
      apiFetch('/supervisor/agents'),
      apiFetch('/supervisor/decisions?limit=5'),
      apiFetch('/supervisor/digest'),
    ]);
    if (s.status === 'fulfilled') setStatus(s.value);
    if (a.status === 'fulfilled') setAgents(a.value);
    if (d.status === 'fulfilled') setDecisions(d.value);
    if (dg.status === 'fulfilled') setDigest(dg.value);
  }, [apiFetch]);

  const handleFirstOpen = useCallback(async () => {
    setStarted(true);
    setLoading(true);
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

  // Auto-refresh every 15s once opened
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [started, fetchAll]);

  // Summary for collapsed state
  const summary = (() => {
    if (!started) return null;
    if (loading) return 'Loading…';
    if (!status) return 'OFFLINE';
    const s = (status.status || '').toLowerCase();
    if (s === 'alive' || s === 'running') {
      return `ALIVE · ${status.uptime || '?'} uptime`;
    }
    return (s || 'OFFLINE').toUpperCase();
  })();

  const summaryColor = (() => {
    if (!status) return '#ff4444';
    const s = (status.status || '').toLowerCase();
    if (s === 'alive' || s === 'running') return '#00ff88';
    if (s === 'degraded') return '#ff9500';
    return '#ff4444';
  })();

  return (
    <CollapsibleSection title="Supervisor" summary={summary} summaryColor={summaryColor} onFirstOpen={handleFirstOpen}>
      {loading ? (
        <div className="space-y-3">
          <SkeletonRect h={40} />
          <SkeletonRect h={120} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Supervisor status bar */}
          {status && (
            <div className="flex items-center gap-3 flex-wrap p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center gap-1.5">
                <LiveDot color={STATUS_DOT_COLORS[status.status] || '#555'} size={5} />
                <span className="font-syne text-sm text-white">{status.name || 'Supervisor'}</span>
              </div>
              <span className="font-mono text-[10px] text-[#555]">Uptime: <span className="text-[#bbb]">{status.uptime || '—'}</span></span>
              <span className="font-mono text-[10px] text-[#555]">Mem: <span className="text-[#bbb]">{status.memoryMb ?? '—'} MB</span></span>
              {status.currentTask && (
                <span className="font-mono text-[10px] italic text-[#444] truncate max-w-[200px]">{status.currentTask}</span>
              )}
            </div>
          )}

          {/* Swarm agents table */}
          {agents && Array.isArray(agents) && agents.length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Swarm Agents</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                      {['Agent', '', 'Msgs 24h', 'Errors', 'Last Beat'].map(h => (
                        <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((ag, i) => {
                      const color = agentColor(ag.name || ag.agent_name);
                      const beatAge = ag.last_beat ? (Date.now() - new Date(ag.last_beat).getTime()) / 1000 : Infinity;
                      const beatColor = beatAge > 60 ? '#ff4444' : '#555';
                      return (
                        <tr key={ag.id || ag.name || i} style={{ borderBottom: '1px solid #111' }}>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px]" style={{ color }}>{ag.name || ag.agent_name}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_DOT_COLORS[ag.status] || '#555' }} />
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px] text-[#bbb]">{ag.messages_24h ?? 0}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[11px]" style={{ color: (ag.unresolved_errors ?? 0) > 0 ? '#ff4444' : '#555' }}>
                              {ag.unresolved_errors ?? 0}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-[10px]" style={{ color: beatColor }}>
                              {ag.last_beat ? relativeTime(ag.last_beat) : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Decisions */}
          {decisions && Array.isArray(decisions) && decisions.length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Recent Decisions</p>
              <div className="space-y-1">
                {decisions.map((d, i) => (
                  <div key={d.id || i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid #111' }}>
                    <span className="font-mono text-[10px] text-[#333] shrink-0">
                      {d.timestamp || d.created_at ? relativeTime(d.timestamp || d.created_at) : ''}
                    </span>
                    <NovaPill text={d.decision_type || d.type || '?'} color="#00c8ff" />
                    <span className="font-mono text-[11px] text-[#bbb] truncate flex-1">{d.summary || d.message || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor Digest */}
          {digest && (digest.text || digest.content || digest.summary) && (
            <div className="p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#555]">Latest Digest</span>
                {(digest.timestamp || digest.created_at) && (
                  <span className="font-mono text-[10px] text-[#333]">
                    {relativeTime(digest.timestamp || digest.created_at)}
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-[#888] leading-relaxed">
                {digest.text || digest.content || digest.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}