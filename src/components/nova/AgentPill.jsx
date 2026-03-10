import React from 'react';

const AGENT_COLORS = {
  CFO: '#00ff88',
  SCOUT: '#00c8ff',
  GUARDIAN: '#ff9500',
  SUPERVISOR: '#888888',
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