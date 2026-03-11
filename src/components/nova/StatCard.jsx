import React from 'react';

export default function StatCard({ label, value, sub, color = '#ffffff' }) {
  return (
    <div className="nova-card p-3 sm:p-4 flex-1 min-w-0">
      <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#888] mb-1 sm:mb-2">{label}</p>
      <p className="font-syne font-bold text-lg sm:text-2xl truncate" style={{ color }}>{value}</p>
      {sub && <p className="font-mono text-[10px] sm:text-[11px] mt-1 text-[#555] truncate">{sub}</p>}
    </div>
  );
}