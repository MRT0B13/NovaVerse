import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative', desc: 'Lower sizing, wider ranges, safer thresholds' },
  { value: 'balanced', label: 'Balanced', desc: 'Moderate sizing, standard Kelly' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Max LP deployment, tight ranges, 0.30 Kelly' },
];

export default function DeployForm({ templateId }) {
  const apiFetch = useApi();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [riskLevel, setRiskLevel] = useState('balanced');
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      await apiFetch('/agents/deploy', {
        method: 'POST',
        body: JSON.stringify({
          templateId,
          name: name.trim() || undefined,
          riskLevel,
        }),
      });
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      if (err.message?.includes('409')) {
        setError('You already have an active agent. Pause it first.');
      } else {
        setError(err.message);
      }
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="nova-card p-5 mt-4 space-y-5">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block mb-2">Agent Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Optional display name"
          className="w-full font-syne text-sm px-3 py-2 rounded"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', outline: 'none' }}
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block mb-2">Risk Level</label>
        <div className="grid grid-cols-3 gap-2">
          {RISK_LEVELS.map(r => (
            <button
              key={r.value}
              onClick={() => setRiskLevel(r.value)}
              className="p-3 rounded text-left cursor-pointer transition-all"
              style={{
                background: riskLevel === r.value ? '#00ff8810' : '#0d0d0d',
                border: `1px solid ${riskLevel === r.value ? '#00ff88' : '#1a1a1a'}`,
              }}
            >
              <span className="font-syne text-xs font-semibold text-white block">{r.label}</span>
              <span className="font-mono text-[9px] text-[#555] block mt-1">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="font-mono text-xs" style={{ color: '#ff4444' }}>{error}</p>}

      <button
        onClick={handleDeploy}
        disabled={deploying}
        className="w-full font-mono text-sm py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 font-bold"
        style={{
          background: 'linear-gradient(135deg, #00ff88, #00c8ff)',
          color: '#060606',
          border: 'none',
        }}
      >
        {deploying ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Deploying…
          </span>
        ) : '⚡ Deploy Agent'}
      </button>
    </div>
  );
}