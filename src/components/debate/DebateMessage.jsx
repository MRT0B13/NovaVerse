import React from 'react';
import { relativeTime } from '../nova/formatters';

const AGENT_COLORS = {
  guardian: '#ff9500',
  analyst: '#00c8ff',
  scout: '#00c8ff',
  'nova-cfo': '#00ff88',
  cfo: '#00ff88',
  supervisor: '#c084fc',
};

function agentToColor(name) {
  if (!name) return '#888';
  const lower = name.toLowerCase();
  for (const [key, c] of Object.entries(AGENT_COLORS)) {
    if (lower.includes(key)) return c;
  }
  return '#888';
}

export default function DebateMessage({ message }) {
  const color = agentToColor(message.agent) || message.color || '#888';

  return (
    <div className="flex items-start gap-3 py-3 animate-fade-in">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: color + '20', border: `1px solid ${color}40` }}
      >
        {message.avatar || '🤖'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-syne font-semibold text-sm" style={{ color }}>{message.agent}</span>
          {message.role && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-[1px] rounded-[3px]"
              style={{ color: color, background: color + '18', border: `1px solid ${color}40` }}
            >
              {message.role}
            </span>
          )}
          <span className="font-mono text-[10px] text-[#333] ml-auto shrink-0">
            {relativeTime(message.created_at || message.time)}
          </span>
        </div>
        <div
          className="font-syne text-sm text-[#bbb] leading-relaxed p-3"
          style={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: '4px 12px 12px 12px',
          }}
        >
          {message.message || message.msg}
        </div>
      </div>
    </div>
  );
}