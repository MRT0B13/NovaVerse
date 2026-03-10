import React from 'react';

export default function StatCard({ label, value, sub, color = '#ffffff' }) {
  return (
    <div className="nova-card p-4 flex-1 min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#888] mb-2">{label}</p>
      <p className="font-syne font-bold text-2xl truncate" style={{ color }}>{value}</p>
      {sub && <p className="font-mono text-[11px] mt-1 text-[#555]">{sub}</p>}
    </div>
  );
}