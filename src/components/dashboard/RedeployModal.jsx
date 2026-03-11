import React, { useState, useEffect } from 'react';
import { useApi } from '../nova/AuthContext';
import { Loader2, X, RefreshCw } from 'lucide-react';

const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'aggressive', label: 'Aggressive' },
];

export default function RedeployModal({ agent, onClose, onSuccess }) {
  const apiFetch = useApi();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(agent?.template_id || '');
  const [riskLevel, setRiskLevel] = useState('balanced');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/agents/templates')
      .then(t => { setTemplates(t || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiFetch]);

  const handleRedeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      await apiFetch('/agents/redeploy', {
        method: 'POST',
        body: JSON.stringify({
          templateId: selectedTemplate,
          riskLevel,
          name: name.trim() || undefined,
        }),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Redeploy failed');
      setDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-5 animate-fade-in"
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#ff9500]" />
            <h3 className="font-syne font-bold text-white">Redeploy Agent</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer"
            style={{ background: 'none', border: 'none', color: '#555' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="font-mono text-[11px] text-[#888]">
          This will tear down your current agent and deploy a fresh one with the selected configuration.
        </p>

        {/* Template Select */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Template</label>
          {loading ? (
            <div className="h-10 rounded animate-shimmer" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className="p-3 rounded text-left cursor-pointer transition-all"
                  style={{
                    background: selectedTemplate === t.id ? '#00ff8810' : '#0d0d0d',
                    border: `1px solid ${selectedTemplate === t.id ? '#00ff88' : '#1a1a1a'}`,
                  }}
                >
                  <span className="font-syne text-xs font-semibold text-white block">{t.name || t.id}</span>
                  <span className="font-mono text-[9px] text-[#555] block mt-0.5">
                    {t.skillCount ?? '?'} skills
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Agent Name */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Agent Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Optional display name"
            className="w-full font-syne text-sm px-3 py-2 rounded"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', outline: 'none' }}
          />
        </div>

        {/* Risk Level */}
        {selectedTemplate !== 'scout-agent' && (
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Risk Level</label>
            <div className="flex gap-2">
              {RISK_LEVELS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRiskLevel(r.value)}
                  className="flex-1 font-mono text-xs py-2 rounded cursor-pointer transition-all"
                  style={{
                    background: riskLevel === r.value ? '#00ff8810' : '#0d0d0d',
                    border: `1px solid ${riskLevel === r.value ? '#00ff88' : '#1a1a1a'}`,
                    color: riskLevel === r.value ? '#00ff88' : '#555',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="font-mono text-xs" style={{ color: '#ff4444' }}>{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 font-mono text-xs py-3 rounded cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888' }}
          >
            Cancel
          </button>
          <button
            onClick={handleRedeploy}
            disabled={deploying || !selectedTemplate}
            className="flex-1 font-mono text-xs py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40 font-bold"
            style={{
              background: 'linear-gradient(135deg, #ff9500, #ff9500aa)',
              border: 'none',
              color: '#060606',
            }}
          >
            {deploying ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Redeploying…
              </span>
            ) : '⚡ Redeploy'}
          </button>
        </div>
      </div>
    </div>
  );
}