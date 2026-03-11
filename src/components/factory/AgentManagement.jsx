import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import LiveDot from '../nova/LiveDot';
import NovaPill from '../nova/NovaPill';
import { Pause, Play, Save, Loader2 } from 'lucide-react';

const CONFIG_ITEMS = [
  { key: 'CFO_ORCA_LP_MAX_USD', label: 'Orca LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
  { key: 'CFO_KRYSTAL_LP_MAX_USD', label: 'Krystal LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
  { key: 'CFO_AUTO_TIER_USD', label: 'Auto-Approve Tier (USD)', min: 0, max: 200, step: 5, type: 'range' },
  { key: 'CFO_KELLY_FRACTION', label: 'Kelly Fraction', min: 0.05, max: 0.50, step: 0.01, type: 'range' },
  { key: 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS', label: 'Kamino Loop Depth', options: [1, 2, 3], type: 'toggle' },
];

export default function AgentManagement({ agent, onRefresh }) {
  const apiFetch = useApi();
  const [configs, setConfigs] = useState({});
  const [saving, setSaving] = useState(false);
  const isRunning = agent?.status === 'running';

  const handleToggleAgent = async () => {
    const endpoint = isRunning ? '/agents/pause' : '/agents/resume';
    await apiFetch(endpoint, { method: 'PATCH' });
    onRefresh?.();
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(configs);
    for (const [key, value] of entries) {
      await apiFetch('/agents/config', {
        method: 'PATCH',
        body: JSON.stringify({ key, value: String(value) }),
      });
    }
    setSaving(false);
    setConfigs({});
  };

  return (
    <div className="space-y-4">
      {/* Agent card */}
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
          <div className="flex-1">
            <h3 className="font-syne font-bold text-lg text-white">{agent.display_name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <NovaPill text={agent.template_id} />
              <NovaPill text={agent.risk_level} color="#ff9500" />
              <div className="flex items-center gap-1">
                <LiveDot color={isRunning ? '#00ff88' : '#ff9500'} size={5} />
                <span className="font-mono text-[10px]" style={{ color: isRunning ? '#00ff88' : '#ff9500' }}>
                  {agent.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleAgent}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded cursor-pointer transition-all hover:opacity-80 shrink-0"
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

      {/* Config editor */}
      <div className="nova-card p-5 space-y-5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Configuration</span>
        
        {CONFIG_ITEMS.map(item => (
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
    </div>
  );
}