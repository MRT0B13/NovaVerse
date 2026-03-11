import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import DeployTransition from './DeployTransition';

const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative', desc: 'Lower sizing, wider ranges, safer thresholds' },
  { value: 'balanced', label: 'Balanced', desc: 'Moderate sizing, standard Kelly' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Max LP deployment, tight ranges, 0.30 Kelly' },
];

const RISK_PRESETS = {
  conservative: { CFO_ORCA_LP_MAX_USD: 80, CFO_KRYSTAL_LP_MAX_USD: 80, CFO_AUTO_TIER_USD: 20, CFO_KELLY_FRACTION: 0.15, CFO_KAMINO_JITO_LOOP_MAX_LOOPS: 2, LP_RANGE_WIDTH_PCT: 15 },
  balanced: { CFO_ORCA_LP_MAX_USD: 130, CFO_KRYSTAL_LP_MAX_USD: 130, CFO_AUTO_TIER_USD: 40, CFO_KELLY_FRACTION: 0.22, CFO_KAMINO_JITO_LOOP_MAX_LOOPS: 2, LP_RANGE_WIDTH_PCT: 10 },
  aggressive: { CFO_ORCA_LP_MAX_USD: 180, CFO_KRYSTAL_LP_MAX_USD: 180, CFO_AUTO_TIER_USD: 60, CFO_KELLY_FRACTION: 0.30, CFO_KAMINO_JITO_LOOP_MAX_LOOPS: 3, LP_RANGE_WIDTH_PCT: 6 },
};

const DEFAULTS = RISK_PRESETS.balanced;

const TEMPLATE_DESCRIPTIONS = {
  'full-nova': 'Full 7-agent swarm. Scout finds opportunities, CFO executes, Guardian protects.',
  'cfo-agent': 'CFO + Guardian only. Capital allocation across Solana LP, Kamino, and Hyperliquid.',
  'scout-agent': 'Intel-only agent. Monitors KOLs, tracks movers, sends signals. No trading.',
  'lp-specialist': 'LP-focused CFO. Optimised for concentrated liquidity on Orca and Krystal.',
  'launcher-agent': 'Token launch specialist. Manages bonding curves, graduation, and initial liquidity.',
  'community-agent': 'Manages community engagement, moderation, and sentiment tracking.',
  'governance-agent': 'Automates governance participation, proposal analysis, and voting delegation.',
  'social-agent': 'Social media automation. X posts, Telegram updates, and community alerts.',
};

const TEMPLATE_COLORS = {
  'full-nova': '#00ff88',
  'cfo-agent': '#00c8ff',
  'scout-agent': '#ff9500',
  'lp-specialist': '#c084fc',
  'launcher-agent': '#f472b6',
  'community-agent': '#fbbf24',
  'governance-agent': '#818cf8',
  'social-agent': '#34d399',
};

const ADVANCED_CONFIGS = {
  'full-nova': [
    { key: 'CFO_ORCA_LP_MAX_USD', label: 'Orca LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
    { key: 'CFO_KRYSTAL_LP_MAX_USD', label: 'Krystal LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
    { key: 'CFO_AUTO_TIER_USD', label: 'Auto-Approve Tier (USD)', min: 0, max: 200, step: 5, type: 'range' },
    { key: 'CFO_KELLY_FRACTION', label: 'Kelly Fraction', min: 0.05, max: 0.50, step: 0.01, type: 'range' },
    { key: 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS', label: 'Kamino Loop Depth', options: [1, 2, 3], type: 'toggle' },
  ],
  'cfo-agent': [
    { key: 'CFO_ORCA_LP_MAX_USD', label: 'Orca LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
    { key: 'CFO_AUTO_TIER_USD', label: 'Auto-Approve Tier (USD)', min: 0, max: 200, step: 5, type: 'range' },
    { key: 'CFO_KELLY_FRACTION', label: 'Kelly Fraction', min: 0.05, max: 0.50, step: 0.01, type: 'range' },
    { key: 'CFO_KAMINO_JITO_LOOP_MAX_LOOPS', label: 'Kamino Loop Depth', options: [1, 2, 3], type: 'toggle' },
  ],
  'scout-agent': [],
  'lp-specialist': [
    { key: 'CFO_ORCA_LP_MAX_USD', label: 'Orca LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
    { key: 'CFO_KRYSTAL_LP_MAX_USD', label: 'Krystal LP Max (USD)', min: 0, max: 500, step: 10, type: 'range' },
    { key: 'LP_RANGE_WIDTH_PCT', label: 'LP Range Width %', min: 1, max: 50, step: 1, type: 'range' },
  ],
  'launcher-agent': [
    { key: 'LAUNCH_INITIAL_LIQ_SOL', label: 'Initial Liquidity (SOL)', min: 0.1, max: 10, step: 0.1, type: 'range' },
    { key: 'LAUNCH_BONDING_CURVE_STEEPNESS', label: 'Bonding Curve Steepness', min: 1, max: 10, step: 1, type: 'range' },
  ],
  'community-agent': [],
  'governance-agent': [],
  'social-agent': [],
};

export default function DeployForm({ template }) {
  const apiFetch = useApi();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [riskLevel, setRiskLevel] = useState('balanced');
  const [advancedConfigs, setAdvancedConfigs] = useState({ ...RISK_PRESETS.balanced });

  const handleRiskLevel = (level) => {
    setRiskLevel(level);
    setAdvancedConfigs(prev => ({ ...prev, ...RISK_PRESETS[level] }));
  };
  const [deploying, setDeploying] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [error, setError] = useState(null);

  const templateId = template?.id;
  const accent = TEMPLATE_COLORS[templateId] || '#00ff88';
  const description = TEMPLATE_DESCRIPTIONS[templateId];
  const configItems = ADVANCED_CONFIGS[templateId] || [];

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      const payload = {
        templateId,
        name: name.trim() || undefined,
        riskLevel,
      };
      if (Object.keys(advancedConfigs).length > 0) {
        payload.config = advancedConfigs;
      }
      await apiFetch('/agents/deploy', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Immediately resume to transition from deploying → running
      await apiFetch('/agents/resume', { method: 'PATCH' }).catch(() => {});

      setShowTransition(true);

      // Poll /agents/me until status is no longer 'deploying'
      const pollStart = Date.now();
      const pollInterval = setInterval(async () => {
        try {
          const agentData = await apiFetch('/agents/me');
          if (agentData?.status && agentData.status !== 'deploying') {
            clearInterval(pollInterval);
            navigate(createPageUrl('Dashboard'));
          } else if (Date.now() - pollStart > 15000) {
            clearInterval(pollInterval);
            setShowTransition(false);
            setDeploying(false);
            setError('Agent is taking longer than expected to start. Check your configuration.');
          }
        } catch {
          if (Date.now() - pollStart > 15000) {
            clearInterval(pollInterval);
            setShowTransition(false);
            setDeploying(false);
            setError('Agent is taking longer than expected to start. Check your configuration.');
          }
        }
      }, 2000);
    } catch (err) {
      if (err.message?.includes('409')) {
        setError('You already have an active agent. Pause it first.');
      } else {
        setError(err.message);
      }
      setDeploying(false);
    }
  };

  return (
    <div className="p-5 mt-4 space-y-5 rounded-lg" style={{ background: '#0a0a0a', border: `1px solid ${accent}30` }}>
      {/* Template description */}
      {description && (
        <p className="font-mono text-[11px]" style={{ color: accent + 'cc' }}>
          {description}
        </p>
      )}

      {/* Agent Name */}
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

      {/* Risk Level — hidden for non-trading templates */}
      {!['scout-agent', 'community-agent', 'governance-agent', 'social-agent'].includes(templateId) && (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block mb-2">Risk Level</label>
          <div className="grid grid-cols-3 gap-2">
            {RISK_LEVELS.map(r => (
              <button
                key={r.value}
                onClick={() => handleRiskLevel(r.value)}
                className="p-3 rounded text-left cursor-pointer transition-all"
                style={{
                  background: riskLevel === r.value ? accent + '10' : '#0d0d0d',
                  border: `1px solid ${riskLevel === r.value ? accent : '#1a1a1a'}`,
                }}
              >
                <span className="font-syne text-xs font-semibold text-white block">{r.label}</span>
                <span className="font-mono text-[9px] text-[#555] block mt-1">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Configuration */}
      {configItems.length > 0 && (
        <div className="space-y-4">
          <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block">Advanced Configuration</label>
          {configItems.map(item => (
            <div key={item.key}>
              <div className="flex justify-between mb-2">
                <label className="font-mono text-[10px] text-[#888]">{item.label}</label>
                <span className="font-mono text-xs text-white">
                  {advancedConfigs[item.key] !== undefined
                    ? advancedConfigs[item.key]
                    : DEFAULTS[item.key] ?? (item.type === 'range' ? item.min : item.options[0])}
                </span>
              </div>
              {item.type === 'range' ? (
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={advancedConfigs[item.key] ?? DEFAULTS[item.key] ?? item.min}
                  onChange={e => setAdvancedConfigs({ ...advancedConfigs, [item.key]: Number(e.target.value) })}
                  className="w-full"
                  style={{ height: 4, accentColor: accent }}
                />
              ) : (
                <div className="flex gap-2">
                  {item.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAdvancedConfigs({ ...advancedConfigs, [item.key]: opt })}
                      className="font-mono text-xs px-4 py-1 rounded cursor-pointer transition-all"
                      style={{
                        background: (advancedConfigs[item.key] || item.options[0]) === opt ? accent + '18' : '#0d0d0d',
                        border: `1px solid ${(advancedConfigs[item.key] || item.options[0]) === opt ? accent : '#1a1a1a'}`,
                        color: (advancedConfigs[item.key] || item.options[0]) === opt ? accent : '#555',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="font-mono text-xs" style={{ color: '#ff4444' }}>{error}</p>}

      {/* Deploy Summary */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 rounded-lg" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        <div>
          <span className="font-mono text-[9px] uppercase text-[#555] block">Template</span>
          <span className="font-mono text-xs text-white">{template?.name || templateId}</span>
        </div>
        {!['scout-agent', 'community-agent', 'governance-agent', 'social-agent'].includes(templateId) && (
          <div>
            <span className="font-mono text-[9px] uppercase text-[#555] block">Risk</span>
            <span className="font-mono text-xs text-white capitalize">{riskLevel}</span>
          </div>
        )}
        <div>
          <span className="font-mono text-[9px] uppercase text-[#555] block">Skills</span>
          <span className="font-mono text-xs text-white">{template?.skillCount ?? '—'}</span>
        </div>
        {!['scout-agent', 'community-agent', 'governance-agent', 'social-agent'].includes(templateId) && advancedConfigs.CFO_ORCA_LP_MAX_USD !== undefined && (
          <div>
            <span className="font-mono text-[9px] uppercase text-[#555] block">Orca LP Max</span>
            <span className="font-mono text-xs text-white">${advancedConfigs.CFO_ORCA_LP_MAX_USD}</span>
          </div>
        )}
        {!['scout-agent', 'community-agent', 'governance-agent', 'social-agent'].includes(templateId) && advancedConfigs.CFO_KELLY_FRACTION !== undefined && (
          <div>
            <span className="font-mono text-[9px] uppercase text-[#555] block">Kelly</span>
            <span className="font-mono text-xs text-white">{advancedConfigs.CFO_KELLY_FRACTION}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleDeploy}
        disabled={deploying}
        className="w-full font-mono text-sm py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 font-bold"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
          color: '#060606',
          border: 'none',
        }}
      >
        {deploying ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Deploying…
          </span>
        ) : '⚡ Confirm & Deploy'}
      </button>

      {showTransition && <DeployTransition accent={accent} />}
    </div>
  );
}