import React from 'react';

const AGENT_COLORS = {
  GUARDIAN: '#ff9500',
  ANALYST: '#00c8ff',
  SCOUT: '#00c8ff',
  'NOVA-CFO': '#00ff88',
  CFO: '#00ff88',
  SUPERVISOR: '#c084fc',
};

export default function AgentPill({ agent }) {
  const color = AGENT_COLORS[agent?.toUpperCase()] || '#888888';
  
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-wider px-2 py-[2px] rounded-[3px] inline-flex items-center"
      style={{
        color,
        backgroundColor: color + '18',
        border: `1px solid ${color}40`,
      }}
    >
      {agent}
    </span>
  );
}