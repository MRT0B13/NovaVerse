import React from 'react';
import NovaPill from '../nova/NovaPill';
import AgentPill from '../nova/AgentPill';

const TEMPLATE_STYLES = {
  'full-nova':        { icon: '⚡', color: '#00ff88', bg: '#0d1a0d', badge: 'FLAGSHIP' },
  'cfo-agent':        { icon: '💹', color: '#00c8ff', bg: '#0a0a0a', badge: null },
  'scout-agent':      { icon: '📡', color: '#ff9500', bg: '#0a0a0a', badge: null },
  'lp-specialist':    { icon: '🏊', color: '#c084fc', bg: '#0a0a0a', badge: null },
  'launcher-agent':   { icon: '🚀', color: '#f472b6', bg: '#0a0a0a', badge: null },
  'community-agent':  { icon: '🤝', color: '#fbbf24', bg: '#0a0a0a', badge: null },
  'governance-agent': { icon: '🏛️', color: '#818cf8', bg: '#0a0a0a', badge: null },
  'social-agent':     { icon: '📢', color: '#34d399', bg: '#0a0a0a', badge: null },
  'analyst-agent':    { icon: '📊', color: '#60a5fa', bg: '#0a0a0a', badge: null },
};

const TEMPLATE_DESCRIPTIONS = {
  'full-nova':        'Full-spectrum DeFi: autonomous trading, yield farming, LP management, intel gathering, and risk control. The complete Nova experience.',
  'cfo-agent':        'Your autonomous CFO. Manages capital across Orca LP, Kamino loops, Hyperliquid perps, and Polymarket. Risk-gated and self-healing.',
  'scout-agent':      'Tracks KOLs, narratives, and alpha signals in real-time. Feeds intelligence to your other agents. No wallet required.',
  'lp-specialist':    'Concentrated liquidity specialist. Manages Orca and Krystal LP positions with dynamic range management.',
  'launcher-agent':   'Token launcher. Generates launch packs, deploys to pump.fun, manages community mascots and marketing automation.',
  'community-agent':  'Community manager. Monitors sentiment, manages Telegram groups, tracks engagement metrics. Needs social config after deploy.',
  'governance-agent': 'Governance strategist. Reads proposals, debates positions, votes aligned with your risk profile. Requires 100 NOVA.',
  'social-agent':     'Social sentinel. Polls Reddit and Google Trends for viral culture signals. Feeds trend pool for reactive token launches.',
  'analyst-agent':    'DeFi analyst. Tracks TVL, DEX volumes, price alerts, and market narratives. Feeds the live feed with intelligence.',
};

const WALLET_REQUIRED = ['full-nova', 'cfo-agent', 'lp-specialist', 'launcher-agent'];

function SkillsPreview({ skills, color }) {
  if (!skills?.length) return null;
  const show = skills.slice(0, 3);
  const extra = skills.length - 3;
  return (
    <p className="font-mono text-[9px] mt-2" style={{ color: '#444' }}>
      {show.join(' · ')}{extra > 0 ? ` +${extra} more` : ''}
    </p>
  );
}

export default function TemplateGrid({ templates, selectedId, onSelect }) {
  const flagship = templates.find(t => t.id === 'full-nova');
  const rest = templates.filter(t => t.id !== 'full-nova');

  const renderCard = (t) => {
    const style = TEMPLATE_STYLES[t.id] || { icon: '🤖', color: '#888', bg: '#0a0a0a', badge: null };
    const isSelected = selectedId === t.id;
    const isFlagship = t.id === 'full-nova';
    const desc = TEMPLATE_DESCRIPTIONS[t.id];
    const needsWallet = WALLET_REQUIRED.includes(t.id);

    return (
      <button
        key={t.id}
        onClick={() => onSelect(t)}
        className={`relative text-left p-4 rounded-lg cursor-pointer transition-all ${isFlagship ? 'sm:col-span-2' : ''}`}
        style={{
          background: isSelected ? style.color + '20' : style.bg,
          border: `1px solid ${isSelected ? style.color : '#1a1a1a'}`,
          outline: isSelected ? `1px solid ${style.color}60` : 'none',
          boxShadow: isSelected ? `0 0 20px ${style.color}15` : 'none',
        }}
      >
        {isSelected && (
          <span
            className="absolute top-3 right-3 font-mono text-[9px] font-bold px-2 py-0.5 rounded-[4px]"
            style={{ background: style.color + '20', color: style.color, border: `1px solid ${style.color}40` }}
          >
            ✓ Selected
          </span>
        )}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{style.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-syne font-semibold text-sm text-white">{t.name}</h3>
              {style.badge && (
                <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#00ff8818', color: '#00ff88', border: '1px solid #00ff8830' }}>
                  {style.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <NovaPill text={`${t.skillCount ?? t.defaultSkills?.length ?? '?'} skills`} color={style.color} />
              {needsWallet && (
                <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ background: '#ff950010', color: '#ff9500', border: '1px solid #ff950020' }}>
                  WALLET REQ
                </span>
              )}
              {(t.novaGate || t.requiresNova) && (
                <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ background: '#c084fc10', color: '#c084fc', border: '1px solid #c084fc20' }}>
                  {t.novaGate || t.requiresNova} NOVA
                </span>
              )}
            </div>
          </div>
        </div>
        {desc && (
          <p className="font-mono text-[10px] mt-1" style={{ color: '#666' }}>{desc}</p>
        )}
        {t.agents?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {t.agents.map(a => <AgentPill key={a} agent={a} />)}
          </div>
        )}
        <SkillsPreview skills={t.defaultSkills} color={style.color} />
      </button>
    );
  };

  return (
    <div>
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#888] mb-4">Choose a Template</h2>
      {flagship && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {renderCard(flagship)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {rest.map(renderCard)}
      </div>
    </div>
  );
}