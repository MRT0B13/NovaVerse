import React from 'react';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';
import { relativeTime } from '../nova/formatters';

export default function SwarmBriefing({ digest, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Supervisor Briefing</span>
        <SkeletonRect h={100} />
      </div>
    );
  }

  const items = digest?.items || [];
  const generatedAt = digest?.generatedAt || digest?.generated_at;
  const digestType = digest?.type || 'compiled';

  return (
    <div className="nova-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Supervisor Briefing</span>
        {digestType && <NovaPill text={digestType.toUpperCase()} color="#c084fc" />}
      </div>

      {generatedAt && (
        <p className="font-mono text-[10px] text-[#444] mb-2">
          Generated {relativeTime(generatedAt)}
        </p>
      )}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="py-1.5" style={{ borderBottom: '1px solid #111' }}>
              <div className="flex items-center gap-2">
                {item.from && (
                  <span className="font-mono text-[10px] shrink-0" style={{ color: '#c084fc' }}>
                    {item.from}
                  </span>
                )}
                {item.type && <NovaPill text={item.type} color="#555" />}
              </div>
              <p className="font-mono text-[11px] text-[#888] mt-0.5">
                {item.summary || item.message || JSON.stringify(item)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-mono text-[10px] text-[#555]">No briefing data available</p>
      )}
    </div>
  );
}
