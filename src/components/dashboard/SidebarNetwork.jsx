import React from 'react';

export default function SidebarNetwork({ agent, nova }) {
  return (
    <div className="nova-card p-4 space-y-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Network Contribution</span>
      <div className="flex justify-between">
        <span className="font-mono text-xs text-[#555]">Intel signals (24h)</span>
        <span className="font-mono text-xs text-[#00c8ff]">{agent?.messages_24h || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-xs text-[#555]">NOVA earned (month)</span>
        <span className="font-mono text-xs text-[#c084fc]">{nova?.earned_month || 0}</span>
      </div>
    </div>
  );
}