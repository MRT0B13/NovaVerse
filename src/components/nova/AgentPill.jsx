import React from 'react';

const AGENT_COLORS = {
  guardian: '#ff9500',
  analyst: '#00c8ff',
  scout: '#00c8ff',
  'nova-cfo': '#00ff88',
  cfo: '#00ff88',
  supervisor: '#c084fc',
};

function agentColor(name) {
  if (!name) return '#888';
  const lower = name.toLowerCase();
  for (const [key, c] of Object.entries(AGENT_COLORS)) {
    if (lower.includes(key)) return c;
  }
  return '#888';
}

export default function AgentPill({ agent }) {
  const color = agentColor(agent);
  
  return (
    <span
      className="font-mono text-[10px] uppercase px-2 py-[2px] rounded-[3px] inline-flex items-center"
      style={{
        letterSpacing: '0.05em',
        color,
        backgroundColor: color + '18',
        border: `1px solid ${color}40`,
      }}
    >
      {agent}
    </span>
  );
}