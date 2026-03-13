import React from 'react';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';
import { relativeTime } from '../nova/formatters';

const TYPE_COLORS = {
  alert: '#ff4444',
  report: '#00c8ff',
  info: '#888',
  trade: '#00ff88',
  decision: '#c084fc',
  escalation: '#ff9500',
  health: '#00e5cc',
};

function formatAgentName(name) {
  if (!name) return 'System';
  return name
    .replace('nova-', '')
    .replace(/-/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
}

function extractReadableSummary(item) {
  // Try summary first
  if (item.summary && typeof item.summary === 'string' && item.summary.trim().length > 0) {
    return item.summary;
  }
  // Try message
  if (item.message && typeof item.message === 'string' && item.message.trim().length > 0) {
    return item.message;
  }
  // Try payload.text
  if (item.payload?.text && typeof item.payload.text === 'string') {
    return item.payload.text;
  }
  // Try payload.summary
  if (item.payload?.summary && typeof item.payload.summary === 'string') {
    return item.payload.summary;
  }
  // Try payload.message
  if (item.payload?.message && typeof item.payload.message === 'string') {
    return item.payload.message;
  }
  // Build something human readable from available fields
  const from = formatAgentName(item.from);
  const type = item.type || 'update';
  const time = item.time ? relativeTime(item.time) : '';
  return `${from} sent ${type} signal${time ? ` · ${time}` : ''}`;
}

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
        <p className="font-mono text-[10px] text-[#444] mb-3">
          Generated {relativeTime(generatedAt)}
        </p>
      )}

      {items.length > 0 ? (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item, i) => {
            const typeColor = TYPE_COLORS[item.type] || '#555';
            const summary = extractReadableSummary(item);
            return (
              <div key={i} className="py-2 px-2 rounded" style={{ background: '#0a0a0a', border: '1px solid #111' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-semibold" style={{ color: typeColor }}>
                    {formatAgentName(item.from)}
                  </span>
                  <NovaPill text={item.type || 'update'} color={typeColor} />
                  {item.time && (
                    <span className="font-mono text-[9px] text-[#333] ml-auto shrink-0">
                      {relativeTime(item.time)}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] text-[#999] leading-relaxed">
                  {summary}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="font-mono text-[10px] text-[#555]">No briefing data available</p>
      )}
    </div>
  );
}
