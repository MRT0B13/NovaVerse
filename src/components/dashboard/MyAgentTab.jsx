import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LiveDot from '../nova/LiveDot';
import NovaPill from '../nova/NovaPill';
import { useApi } from '../nova/AuthContext';
import { SkeletonRect } from '../nova/Skeleton';
import { Pause, Play, Save, Loader2 } from 'lucide-react';

const STATUS_DOT = { running: '#00ff88', paused: '#ff9500', deploying: '#00c8ff', error: '#ff4444' };

const ALL_CONFIG_ITEMS = [
  { key: 'CFO_ORCA_LP_MAX_USD', label: 'Orca LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
  { key: 'CFO_KRYSTAL_LP_MAX_USD', label: 'Krystal LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
  { key: 'CFO_AUTO_TIER_USD', label: 'Auto-Approve Tier (USD)', min: 0, max: 200, step: 5, type: 'range' },
  { key: 'CFO_KELLY_FRACTION', label: 'Kelly Fraction', min: 0.05, max: 0.50, step: 0.01, type: 'range' },
  { key: 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS', label: 'Kamino Loop Depth', options: [1, 2, 3], type: 'toggle' },
  { key: 'LP_RANGE_WIDTH_PCT', label: 'LP Range Width %', min: 1, max: 50, step: 1, type: 'range' },
];

const TEMPLATE_CONFIG_KEYS = {
  'full-nova': ['CFO_ORCA_LP_MAX_USD', 'CFO_KRYSTAL_LP_MAX_USD', 'CFO_AUTO_TIER_USD', 'CFO_KELLY_FRACTION', 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS'],
  'cfo-agent': ['CFO_ORCA_LP_MAX_USD', 'CFO_AUTO_TIER_USD', 'CFO_KELLY_FRACTION', 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS'],
  'lp-specialist': ['CFO_ORCA_LP_MAX_USD', 'CFO_KRYSTAL_LP_MAX_USD', 'LP_RANGE_WIDTH_PCT'],
  'scout-agent': [],
};

function formatTemplateId(id) {
  if (!id) return '';
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function AgentIdentityCard({ agent, onToggle }) {
  const isRunning = agent.status === 'running';
  const dotColor = STATUS_DOT[agent.status] || '#555';

  return (
    <div className="rounded-lg p-5" style={{
      background: 'linear-gradient(135deg, #0d1a0d, #0a0a1a)',
      border: '1px solid #1a2a1a'
    }}>
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
            boxShadow: '0 0 24px #00ff8840',
          }}
        >💹</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-syne font-bold text-lg text-white">{agent.display_name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <NovaPill text={formatTemplateId(agent.template_id)} />
            <div className="flex items-center gap-1">
              <LiveDot color={dotColor} size={5} />
              <span className="font-mono text-[10px] capitalize" style={{ color: dotColor }}>
                {agent.status}
              </span>
            </div>
          </div>
        </div>
        {(agent.status === 'running' || agent.status === 'paused') && (
          <button
            onClick={onToggle}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded cursor-pointer transition-all hover:opacity-80 shrink-0"
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

function SkillsList({ skills, onToggle }) {
  return (
    <div className="nova-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Skills</span>
      </div>
      <div className="divide-y divide-[#111]">
        {(!skills || skills.length === 0) ? (
          <div className="p-4 text-center text-[#555] font-mono text-xs">No skills loaded — deploy an agent to activate skills</div>
        ) : (
          skills.map(skill => (
            <button
              key={skill.skill_id || skill.id}
              onClick={() => onToggle(skill)}
              className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-left hover:bg-[#0d0d0d]"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: skill.enabled ? '#00ff88' : '#333' }} />
              <span className="font-syne text-sm text-[#bbb] flex-1 truncate">{skill.name}</span>
              <NovaPill text={skill.enabled ? 'ON' : 'OFF'} color={skill.enabled ? '#00ff88' : '#555'} />
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

function ConfigSection({ agent }) {
  const apiFetch = useApi();
  const [configs, setConfigs] = useState({});
  const [saving, setSaving] = useState(false);

  const allowedKeys = TEMPLATE_CONFIG_KEYS[agent?.template_id] || [];
  const configItems = ALL_CONFIG_ITEMS.filter(item => allowedKeys.includes(item.key));

  if (configItems.length === 0) return null;

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(configs)) {
      await apiFetch('/agents/config', {
        method: 'PATCH',
        body: JSON.stringify({ key, value: String(value) }),
      });
    }
    setSaving(false);
    setConfigs({});
  };

  return (
    <div className="nova-card p-5 space-y-5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Configuration</span>
      {configItems.map(item => (
        <div key={item.key}>
          <div className="flex justify-between mb-2">
            <label className="font-mono text-[10px] text-[#888]">{item.label}</label>
            <span className="font-mono text-xs text-white">
              {configs[item.key] !== undefined ? configs[item.key] : item.type === 'range' ? item.min : item.options[0]}
            </span>
          </div>
          {item.type === 'range' ? (
            <input
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={configs[item.key] ?? item.min}
              onChange={e => setConfigs({ ...configs, [item.key]: Number(e.target.value) })}
              className="w-full accent-green-400"
              style={{ height: 4 }}
            />
          ) : (
            <div className="flex gap-2">
              {item.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setConfigs({ ...configs, [item.key]: opt })}
                  className="font-mono text-xs px-4 py-1 rounded cursor-pointer transition-all"
                  style={{
                    background: (configs[item.key] || item.options[0]) === opt ? '#00ff8818' : '#0d0d0d',
                    border: `1px solid ${(configs[item.key] || item.options[0]) === opt ? '#00ff88' : '#1a1a1a'}`,
                    color: (configs[item.key] || item.options[0]) === opt ? '#00ff88' : '#555',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving || Object.keys(configs).length === 0}
        className="w-full flex items-center justify-center gap-2 font-mono text-xs py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30"
        style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save Configuration
      </button>
    </div>
  );
}

export default function MyAgentTab({ agent, skills, nova, loading, onRefresh }) {
  const apiFetch = useApi();
  const [localSkills, setLocalSkills] = useState(null);
  const displaySkills = localSkills || skills;

  // Poll when agent is stuck in 'deploying'
  React.useEffect(() => {
    if (agent?.status !== 'deploying') return;
    const interval = setInterval(() => onRefresh?.(), 3000);
    return () => clearInterval(interval);
  }, [agent?.status, onRefresh]);

  React.useEffect(() => { setLocalSkills(null); }, [skills]);

  const handleToggleAgent = async () => {
    if (!agent) return;
    const endpoint = agent.status === 'running' ? '/agents/pause' : '/agents/resume';
    await apiFetch(endpoint, { method: 'PATCH' });
    onRefresh?.();
  };

  const handleToggleSkill = async (skill) => {
    const newEnabled = !skill.enabled;
    setLocalSkills(prev => {
      const list = prev || skills || [];
      return list.map(s => s.skill_id === skill.skill_id ? { ...s, enabled: newEnabled } : s);
    });
    try {
      await apiFetch(`/skills/${skill.skill_id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: newEnabled }),
      });
      onRefresh?.();
    } catch {
      setLocalSkills(prev => {
        const list = prev || skills || [];
        return list.map(s => s.skill_id === skill.skill_id ? { ...s, enabled: !newEnabled } : s);
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-[640px]">
        {[1,2,3].map(i => (
          <div key={i} className="nova-card p-4 space-y-3">
            <SkeletonRect w="60%" h={10} />
            <SkeletonRect h={40} />
          </div>
        ))}
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        <p className="font-mono text-xs text-[#555] mb-3">No agent deployed</p>
        <Link
          to={createPageUrl('AgentFactory')}
          className="font-mono text-xs no-underline"
          style={{ color: '#00ff88' }}
        >→ Deploy one</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[640px]">
      <AgentIdentityCard agent={agent} onToggle={handleToggleAgent} />
      <SkillsList skills={displaySkills} onToggle={handleToggleSkill} />
      <NetworkStats agent={agent} nova={nova} />
      <ConfigSection agent={agent} />
    </div>
  );
}