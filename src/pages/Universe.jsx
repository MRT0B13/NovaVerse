import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import LiveDot from '../components/nova/LiveDot';
import NovaPill from '../components/nova/NovaPill';
import { relativeTime } from '../components/nova/formatters';
import { SkeletonRect } from '../components/nova/Skeleton';

const ZONE_META = {
  trading_floor: { icon: '📊', color: '#00ff88', label: 'Trading Floor' },
  intel_hub: { icon: '🔭', color: '#00c8ff', label: 'Intel Hub' },
  watchtower: { icon: '🛡', color: '#ff9500', label: 'Watchtower' },
  command_center: { icon: '⚡', color: '#a855f7', label: 'Command Center' },
  orca_pool: { icon: '🐋', color: '#00e5cc', label: 'Orca Pool' },
  launchpad: { icon: '🚀', color: '#ff4444', label: 'Launchpad' },
  agora: { icon: '🏛', color: '#888', label: 'Agora' },
  burn_furnace: { icon: '🔥', color: '#ff6600', label: 'Burn Furnace' },
};

const AGENT_COLORS = {
  'nova-cfo': '#00ff88',
  'nova-scout': '#00c8ff',
  'nova-analyst': '#c084fc',
  'nova-guardian': '#ff9500',
  'nova-supervisor': '#a855f7',
  'nova-launcher': '#ff4444',
  'nova-community': '#ffd700',
};

function ZoneCard({ zone, count }) {
  const meta = ZONE_META[zone] || { icon: '◈', color: '#555', label: zone.replace(/_/g, ' ') };
  return (
    <div
      className="nova-card p-4 flex items-center gap-3 transition-all hover:scale-[1.02]"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <span className="text-2xl">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-syne font-semibold text-sm text-white capitalize">{meta.label}</p>
        <p className="font-mono text-[10px] text-[#555]">{count} agent{count !== 1 ? 's' : ''}</p>
      </div>
      <span className="font-syne font-bold text-2xl" style={{ color: meta.color }}>{count}</span>
    </div>
  );
}

function AgentWorldTable({ agents, loading }) {
  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <SkeletonRect key={i} h={44} />)}</div>;

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
          Agent World State {agents.length > 0 && `(${agents.length})`}
        </span>
      </div>
      {agents.length === 0 ? (
        <div className="p-6 text-center font-mono text-xs text-[#555]">No agents online</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Agent', 'Zone', 'Home Zone', 'Last Action', 'Status', '24h Msgs', 'Last Seen'].map(h => (
                  <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((a, i) => {
                const zoneMeta = ZONE_META[a.currentZone] || { color: '#555' };
                const agentColor = AGENT_COLORS[a.agentId] || '#bbb';
                return (
                  <tr key={a.agentId || i} style={{ borderBottom: '1px solid #111' }}>
                    <td className="py-2 px-3 font-syne text-xs font-semibold" style={{ color: agentColor }}>
                      {(a.agentId || '').replace('nova-', 'Nova ').replace(/^\w/, c => c.toUpperCase())}
                    </td>
                    <td className="py-2 px-3">
                      <NovaPill text={(a.currentZone || '').replace(/_/g, ' ')} color={zoneMeta.color} />
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#555] capitalize">{(a.homeZone || '').replace(/_/g, ' ')}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#888] max-w-[200px] truncate">{a.lastAction || '—'}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <LiveDot color={a.status === 'active' || a.status === 'running' ? '#00ff88' : '#ff9500'} size={5} />
                        <span className="font-mono text-[10px] capitalize" style={{ color: a.status === 'active' || a.status === 'running' ? '#00ff88' : '#ff9500' }}>
                          {a.status || 'unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#00c8ff]">{a.messages24h || 0}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-[#555]">{a.lastSeen ? relativeTime(a.lastSeen) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EventsFeed({ events, loading }) {
  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <SkeletonRect key={i} h={32} />)}</div>;

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <LiveDot color="#00ff88" size={5} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Live Events</span>
      </div>
      {events.length === 0 ? (
        <div className="p-6 text-center font-mono text-xs text-[#555]">No recent events</div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto divide-y divide-[#111]">
          {events.map((ev, i) => {
            const agentColor = AGENT_COLORS[ev.agent] || '#bbb';
            const zoneMeta = ZONE_META[ev.zone] || { color: '#555', icon: '◈' };
            return (
              <div key={ev.id || i} className="px-4 py-2.5 flex items-start gap-3">
                <span className="text-sm shrink-0">{zoneMeta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold" style={{ color: agentColor }}>
                      {(ev.agent || '').replace('nova-', '')}
                    </span>
                    <NovaPill text={ev.action || 'event'} color={zoneMeta.color} />
                    {ev.zone && <span className="font-mono text-[9px] text-[#444]">{ev.zone.replace(/_/g, ' ')}</span>}
                    <span className="font-mono text-[9px] text-[#333] ml-auto">{ev.ts ? relativeTime(new Date(ev.ts).toISOString()) : ''}</span>
                  </div>
                  {ev.msg && <p className="font-mono text-[10px] text-[#888] mt-0.5 truncate">{ev.msg}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Universe() {
  const apiFetch = useApi();
  const [worldState, setWorldState] = useState(null);
  const [zones, setZones] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [ws, z, ev] = await Promise.allSettled([
      apiFetch('/universe/world-state'),
      apiFetch('/universe/zones'),
      apiFetch('/universe/events?limit=50'),
    ]);
    if (ws.status === 'fulfilled') setWorldState(ws.value);
    if (z.status === 'fulfilled') setZones(z.value?.zoneCounts || z.value || {});
    if (ev.status === 'fulfilled') setEvents(ev.value?.events || ev.value || []);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const agents = worldState?.agents || [];
  const zoneCounts = zones || {};
  const sortedZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]);
  const totalAgents = agents.length;

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <LiveDot color="#00ff88" size={8} />
        <h1 className="font-syne font-bold text-lg text-white">NOVA UNIVERSE</h1>
        <NovaPill text="LIVE" color="#00ff88" />
        {!loading && <span className="font-mono text-[11px] text-[#555]">{totalAgents} agents across {sortedZones.length} zones</span>}
      </div>

      {/* Zone overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {loading ? (
          [1,2,3,4].map(i => <SkeletonRect key={i} h={80} />)
        ) : sortedZones.length === 0 ? (
          <div className="col-span-full nova-card p-6 text-center font-mono text-xs text-[#555]">No zone data</div>
        ) : (
          sortedZones.map(([zone, count]) => (
            <ZoneCard key={zone} zone={zone} count={count} />
          ))
        )}
      </div>

      {/* Two columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Agent world state */}
        <div className="flex-1 min-w-0">
          <AgentWorldTable agents={agents} loading={loading} />
        </div>

        {/* Live events sidebar */}
        <div className="w-full lg:w-[380px] shrink-0">
          <EventsFeed events={events} loading={loading} />
        </div>
      </div>
    </div>
  );
}
