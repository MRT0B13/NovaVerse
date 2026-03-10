import React, { useState } from 'react';
import LiveDot from '../nova/LiveDot';
import NovaPill from '../nova/NovaPill';
import { useApi } from '../nova/AuthContext';
import { SkeletonRect } from '../nova/Skeleton';
import { Pause, Play } from 'lucide-react';

function AgentIdentity({ agent, onToggle }) {
  if (!agent) return null;
  const isRunning = agent.status === 'running';

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
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#555] mt-1">{agent.template_id}</p>
        <div className="flex items-center gap-2 mt-3">
          <LiveDot color={isRunning ? '#00ff88' : '#ff9500'} size={6} />
          <span className="font-mono text-xs" style={{ color: isRunning ? '#00ff88' : '#ff9500' }}>
            {agent.status}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="mt-4 flex items-center gap-2 font-mono text-xs px-4 py-2 rounded cursor-pointer transition-all hover:opacity-80"
          style={{
            background: isRunning ? '#ff950018' : '#00ff8818',
            border: `1px solid ${isRunning ? '#ff950040' : '#00ff8840'}`,
            color: isRunning ? '#ff9500' : '#00ff88',
          }}
        >
          {isRunning ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
        </button>
      </div>
    </div>
  );
}

function SkillsList({ skills, onToggle }) {
  return (
    <div className="nova-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Skills</span>
      </div>
      <div className="divide-y divide-[#111]">
        {(!skills || skills.length === 0) ? (
          <div className="p-4 text-center text-[#555] font-mono text-xs">No skills loaded</div>
        ) : (
          skills.map(skill => (
            <button
              key={skill.skill_id || skill.id}
              onClick={() => onToggle(skill)}
              className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-left hover:bg-[#0d0d0d]"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: skill.enabled ? '#00ff88' : '#333' }}
              />
              <span className="font-syne text-sm text-[#bbb] flex-1 truncate">{skill.name}</span>
              <NovaPill
                text={skill.enabled ? 'ON' : 'OFF'}
                color={skill.enabled ? '#00ff88' : '#555'}
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function NetworkStats({ agent, nova }) {
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

export default function AgentSidebar({ agent, skills, nova, loading, onRefresh }) {
  const apiFetch = useApi();

  const handleToggleAgent = async () => {
    const endpoint = agent.status === 'running' ? `/agents/${agent.id}/pause` : `/agents/${agent.id}/resume`;
    await apiFetch(endpoint, { method: 'PATCH' });
    onRefresh?.();
  };

  const handleToggleSkill = async (skill) => {
    const newEnabled = !skill.enabled;
    // Optimistic update
    skill.enabled = newEnabled;
    onRefresh?.();
    
    try {
      await apiFetch(`/skills/${skill.skill_id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: newEnabled }),
      });
    } catch {
      skill.enabled = !newEnabled;
      onRefresh?.();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 w-full lg:w-[340px] shrink-0">
        {[1,2,3].map(i => (
          <div key={i} className="nova-card p-4 space-y-3">
            <SkeletonRect w="60%" h={10} />
            <SkeletonRect h={40} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full lg:w-[340px] shrink-0">
      <AgentIdentity agent={agent} onToggle={handleToggleAgent} />
      <SkillsList skills={skills} onToggle={handleToggleSkill} />
      <NetworkStats agent={agent} nova={nova} />
    </div>
  );
}