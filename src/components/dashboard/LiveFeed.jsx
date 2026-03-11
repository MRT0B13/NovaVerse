import React from 'react';
import LiveDot from '../nova/LiveDot';
import AgentPill from '../nova/AgentPill';
import { relativeTime } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

export default function LiveFeed({ items, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-3">
        <SkeletonRect w="40%" h={12} />
        {[1,2,3,4,5].map(i => <SkeletonRect key={i} h={32} />)}
      </div>
    );
  }

  return (
    <div className="nova-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <LiveDot color="#00ff88" size={6} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
          Agent Activity Feed
        </span>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {(!items || items.length === 0) ? (
          <div className="p-8 text-center text-[#555] font-mono text-xs">
            No activity yet
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-start gap-3 px-4 py-3 animate-fade-in"
              style={{ borderBottom: '1px solid #111' }}
            >
              <div className="shrink-0 mt-0.5">
                {item.type ? (
                  <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#555', border: '1px solid #222' }}>
                    {item.type}
                  </span>
                ) : (
                  <span className="text-base">{item.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <AgentPill agent={item.agent} />
                  <span className="font-syne text-sm text-[#bbb]">{item.msg}</span>
                </div>
                {item.detail && (
                  <p className="font-mono text-[11px] text-[#555] mt-1 truncate">{item.detail}</p>
                )}
              </div>
              <span className="font-mono text-[10px] text-[#333] shrink-0 mt-1" title={item.time}>
                {relativeTime(item.time)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}