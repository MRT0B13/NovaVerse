import React from 'react';
import { SkeletonRect } from '../nova/Skeleton';
import { relativeTime } from '../nova/formatters';

const AGENT_COLORS = {
  'nova-cfo': '#00ff88',
  'nova-scout': '#00c8ff',
  'nova-guardian': '#ff9500',
  'nova-supervisor': '#c084fc',
  'nova-analyst': '#00c8ff',
  'nova-launcher': '#f472b6',
  'nova-community': '#ffd700',
  'nova': '#00ff88',
  'health-monitor': '#888',
};

function statusColor(agent) {
  if (!agent?.alive && agent?.alive !== undefined) return '#ff4444';
  const s = (agent?.status || '').toLowerCase();
  if (s === 'alive' || s === 'running') return '#00ff88';
  if (s === 'degraded' || s === 'slow') return '#ff9500';
  if (s === 'dead' || s === 'error') return '#ff4444';
  return '#555';
}

export default function AgentStatusTable({ agents, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Agent Status</span>
        {[...Array(4)].map((_, i) => <SkeletonRect key={i} h={28} />)}
      </div>
    );
  }

  const list = Array.isArray(agents) ? agents : [];

  return (
    <div className="nova-card p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Agent Status</span>
      <div className="mt-2">
        {/* Header */}
        <div className="flex items-center gap-3 py-1.5 text-[9px] uppercase tracking-wider text-[#444] font-mono" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <span className="w-[140px]">Agent</span>
          <span className="w-[60px] text-center">Status</span>
          <span className="w-[80px] text-right">Uptime</span>
          <span className="w-[60px] text-right hidden md:block">Mem</span>
          <span className="w-[50px] text-right hidden md:block">Errors</span>
          <span className="w-[70px] text-right">Last Beat</span>
        </div>
        {/* Rows */}
        {list.map((a, i) => {
          const nameColor = AGENT_COLORS[a.name] || AGENT_COLORS[a.agentName] || '#888';
          const dotColor = statusColor(a);
          const uptime = a.uptime || (a.uptimeSeconds ? `${Math.floor(a.uptimeSeconds / 3600)}h` : '—');
          const mem = a.memoryMb != null ? `${Math.round(a.memoryMb)}MB` : '—';
          const errs = a.errorsLast5min ?? a.errors ?? 0;
          const beat = a.lastBeat || a.last_beat;

          return (
            <div
              key={a.name || i}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid #111' }}
            >
              <span className="w-[140px] font-mono text-[11px] truncate" style={{ color: nameColor }}>
                {a.displayName || a.display_name || a.name}
              </span>
              <span className="w-[60px] flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                <span className="font-mono text-[10px] text-[#888]">{a.status || '—'}</span>
              </span>
              <span className="w-[80px] text-right font-mono text-[10px] text-[#888]">{uptime}</span>
              <span className="w-[60px] text-right font-mono text-[10px] text-[#555] hidden md:block">{mem}</span>
              <span
                className="w-[50px] text-right font-mono text-[10px] hidden md:block"
                style={{ color: errs > 0 ? '#ff4444' : '#555' }}
              >
                {errs}
              </span>
              <span className="w-[70px] text-right font-mono text-[10px] text-[#555]">
                {beat ? relativeTime(beat) : '—'}
              </span>
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="font-mono text-[10px] text-[#555] py-4 text-center">No agents reporting</p>
        )}
      </div>
    </div>
  );
}
