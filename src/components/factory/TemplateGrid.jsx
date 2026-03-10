import React from 'react';
import NovaPill from '../nova/NovaPill';

const TEMPLATE_STYLES = {
  'full-nova': { icon: '⚡', color: '#00ff88' },
  'cfo-agent': { icon: '💹', color: '#00c8ff' },
  'scout-agent': { icon: '📡', color: '#ff9500' },
  'lp-specialist': { icon: '🏊', color: '#c084fc' },
};

export default function TemplateGrid({ templates, selectedId, onSelect }) {
  return (
    <div>
      <h2 className="font-mono text-[10px] uppercase tracking-wider text-[#888] mb-4">Choose a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map(t => {
          const style = TEMPLATE_STYLES[t.id] || { icon: '🤖', color: '#888' };
          const isSelected = selectedId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="text-left p-4 rounded-lg cursor-pointer transition-all"
              style={{
                background: isSelected ? style.color + '10' : '#0a0a0a',
                border: `1px solid ${isSelected ? style.color : '#1a1a1a'}`,
                outline: isSelected ? `1px solid ${style.color}40` : 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h3 className="font-syne font-semibold text-sm text-white">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <NovaPill text={`${t.skillCount} skills`} color={style.color} />
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-[#555] mt-2">
                {t.agents?.join(', ')}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}