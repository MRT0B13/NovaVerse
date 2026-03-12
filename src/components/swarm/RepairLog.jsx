import React from 'react';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';
import { relativeTime } from '../nova/formatters';

const STATUS_COLORS = {
  pending: '#ff9500',
  applied: '#00ff88',
  rolled_back: '#ff4444',
  failed: '#ff4444',
};

function repairStatus(r) {
  if (r.rolled_back) return 'rolled_back';
  if (r.applied && r.test_passed) return 'applied';
  if (r.applied && !r.test_passed) return 'failed';
  if (r.requires_approval && !r.approved) return 'pending';
  return 'pending';
}

export default function RepairLog({ repairs, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Repair Log</span>
        {[...Array(3)].map((_, i) => <SkeletonRect key={i} h={36} />)}
      </div>
    );
  }

  const list = Array.isArray(repairs) ? repairs : [];

  if (list.length === 0) return null;

  return (
    <div className="nova-card p-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#555]">Repair Log</span>
      <div className="mt-2 space-y-1">
        {list.map((r, i) => {
          const status = repairStatus(r);
          const label = status.replace('_', ' ').toUpperCase();
          const time = r.created_at || r.time;

          return (
            <div
              key={r.id || i}
              className="flex items-center gap-2 py-2"
              style={{ borderBottom: '1px solid #111' }}
            >
              <NovaPill text={label} color={STATUS_COLORS[status] || '#555'} />
              <span className="font-mono text-[11px] text-[#888] truncate flex-1">
                {r.agent_name || r.agent || '?'}: {r.error_type || r.repair_category || 'repair'}
              </span>
              <span className="font-mono text-[10px] text-[#444] shrink-0">
                {time ? relativeTime(time) : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
