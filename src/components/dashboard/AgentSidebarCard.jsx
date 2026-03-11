import React, { useState } from 'react';
import LiveDot from '../nova/LiveDot';
import NovaPill from '../nova/NovaPill';
import { useApi } from '../nova/AuthContext';
import { Pause, Play } from 'lucide-react';

const STATUS_DOT = { running: '#00ff88', paused: '#ff9500', deploying: '#00c8ff', error: '#ff4444' };

function formatTemplateId(id) {
  if (!id) return '';
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function AgentSidebarCard({ agent, onRefresh }) {
  const apiFetch = useApi();
  const isRunning = agent?.status === 'running';
  const dotColor = STATUS_DOT[agent?.status] || '#555';

  const handleToggle = async () => {
    const endpoint = isRunning ? '/agents/pause' : '/agents/resume';
    await apiFetch(endpoint, { method: 'PATCH' });
    onRefresh?.();
  };

  if (!agent) return null;

  return (
    <div className="rounded-lg p-5" style={{
      background: 'linear-gradient(135deg, #0d1a0d, #0a0a1a)',
      border: '1px solid #1a2a1a'
    }}>
      <div className="flex flex-col items-center text-center">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl mb-3"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 24px #00ff8840',
          }}
        >💹</div>
        <h3 className="font-syne font-bold text-lg text-white">{agent.display_name}</h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#555] mt-1">
          {formatTemplateId(agent.template_id)}
        </span>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
          <LiveDot color={dotColor} size={5} />
          <span className="font-mono text-[10px] capitalize" style={{ color: dotColor }}>
            {agent.status}
          </span>
          {agent.hasWallet === false && (
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#ff950018', color: '#ff9500', border: '1px solid #ff950030' }}>
              No Wallet
            </span>
          )}
          {agent.hasWallet === true && (
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#00ff8818', color: '#00ff88', border: '1px solid #00ff8830' }}>
              Wallet ✓
            </span>
          )}
        </div>
        {Array.isArray(agent.capabilities) && agent.capabilities.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
            {agent.capabilities.map(cap => (
              <span key={cap} className="font-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#1a1a1a', color: '#888', border: '1px solid #222' }}>
                {cap}
              </span>
            ))}
          </div>
        )}
        {(agent.status === 'running' || agent.status === 'paused') && (
          <button
            onClick={handleToggle}
            className="mt-3 flex items-center gap-2 font-mono text-xs px-4 py-2 rounded cursor-pointer transition-all hover:opacity-80"
            style={{
              background: isRunning ? '#ff950018' : '#00ff8818',
              border: `1px solid ${isRunning ? '#ff950040' : '#00ff8840'}`,
              color: isRunning ? '#ff9500' : '#00ff88',
            }}
          >
            {isRunning ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
          </button>
        )}
      </div>
    </div>
  );
}