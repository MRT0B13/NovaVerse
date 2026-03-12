import React, { useState } from 'react';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';
import { relativeTime } from '../nova/formatters';

const TYPE_COLORS = {
  periodic: '#00c8ff',
  incident: '#ff4444',
  recovery: '#00ff88',
  manual: '#888',
};

export default function HealthReportsFeed({ reports, loading }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="nova-card p-4 space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Health Reports</span>
        {[...Array(3)].map((_, i) => <SkeletonRect key={i} h={48} />)}
      </div>
    );
  }

  const list = Array.isArray(reports) ? reports : [];

  return (
    <div className="nova-card p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Health Reports</span>
      <div className="mt-2 overflow-y-auto" style={{ maxHeight: 400 }}>
        {list.map((r, i) => {
          const isOpen = expanded === i;
          const rType = r.report_type || r.type || 'periodic';
          const text = r.report_text || r.text || '';
          const time = r.created_at || r.time;

          return (
            <div
              key={r.id || i}
              className="py-2.5 px-1 cursor-pointer transition-colors hover:bg-[#0d0d0d]"
              style={{ borderBottom: '1px solid #111' }}
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              <div className="flex items-center gap-2">
                <NovaPill text={rType.toUpperCase()} color={TYPE_COLORS[rType] || '#555'} />
                <span className="font-mono text-[11px] text-[#bbb] truncate flex-1">
                  {text.slice(0, 120) || 'Report'}
                </span>
                <span className="font-mono text-[10px] text-[#444] shrink-0">
                  {time ? relativeTime(time) : ''}
                </span>
              </div>
              {isOpen && text && (
                <div className="mt-2 p-3 rounded-md" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                  <p className="font-mono text-[10px] text-[#888] whitespace-pre-wrap">{text}</p>
                  {r.agent_statuses && (
                    <div className="mt-2">
                      <span className="font-mono text-[9px] uppercase text-[#555]">Agent Statuses</span>
                      <p className="font-mono text-[10px] text-[#666] mt-0.5">
                        {typeof r.agent_statuses === 'string' ? r.agent_statuses : JSON.stringify(r.agent_statuses, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="font-mono text-[10px] text-[#555] py-4 text-center">No health reports yet</p>
        )}
      </div>
    </div>
  );
}
