import React from 'react';
import NovaPill from '../nova/NovaPill';

const TEMPLATE_STYLES = {
  'full-nova': { icon: '⚡', color: '#00ff88', bg: '#0d1a0d', badge: 'FLAGSHIP' },
  'cfo-agent': { icon: '💹', color: '#00c8ff', bg: '#0a0a0a', badge: null },
  'scout-agent': { icon: '📡', color: '#ff9500', bg: '#0a0a0a', badge: null },
  'lp-specialist': { icon: '🏊', color: '#c084fc', bg: '#0a0a0a', badge: null },
};

function SkillsPreview({ skills, color }) {
  if (!skills?.length) return null;
  const show = skills.slice(0, 3);
  const extra = skills.length - 3;
  return (
    <p className="font-mono text-[9px] mt-3" style={{ color: '#444' }}>
      {show.join(' · ')}{extra > 0 ? ` +${extra} more` : ''}
    </p>
  );
}

export default function TemplateGrid({ templates, selectedId, onSelect }) {
  return (
    <div>
      <h2 className="font-mono text-[10px] uppercase tracking-wider text-[#888] mb-4">Choose a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map(t => {
          const style = TEMPLATE_STYLES[t.id] || { icon: '🤖', color: '#888', bg: '#0a0a0a', badge: null };
          const isSelected = selectedId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="text-left p-4 rounded-lg cursor-pointer transition-all"
              style={{
                background: isSelected ? style.color + '10' : style.bg,
                border: `1px solid ${isSelected ? style.color : '#1a1a1a'}`,
                outline: isSelected ? `1px solid ${style.color}40` : 'none',
              }}
            >
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
                    <NovaPill text={`${t.skillCount} skills`} color={style.color} />
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] mt-2" style={{ color: style.color + '80' }}>
                {t.agents?.join(', ')}
              </p>
              <SkillsPreview skills={t.defaultSkills} color={style.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}