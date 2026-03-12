import React from 'react';
import LiveDot from '../nova/LiveDot';
import { SkeletonRect } from '../nova/Skeleton';

function apiStatusColor(status) {
  const s = (status || '').toLowerCase();
  if (s === 'up') return '#00ff88';
  if (s === 'slow') return '#ff9500';
  return '#ff4444';
}

export default function ApiHealthPanel({ apis, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">API Health</span>
        {[...Array(4)].map((_, i) => <SkeletonRect key={i} h={24} />)}
      </div>
    );
  }

  const list = Array.isArray(apis) ? apis : [];

  return (
    <div className="nova-card p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">API Health</span>
      <div className="mt-2 space-y-2">
        {list.map((api, i) => {
          const name = api.api_name || api.name || 'Unknown';
          const status = api.status || 'unknown';
          const ms = api.response_time_ms ?? api.responseMs;
          const color = apiStatusColor(status);

          return (
            <div key={api.id || name || i} className="flex items-center gap-2">
              <LiveDot color={color} size={6} />
              <span className="font-mono text-[11px] text-[#bbb] flex-1">{name}</span>
              {ms != null && (
                <span className="font-mono text-[10px] text-[#555]">{Math.round(ms)}ms</span>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="font-mono text-[10px] text-[#555]">No API data</p>
        )}
      </div>
    </div>
  );
}
