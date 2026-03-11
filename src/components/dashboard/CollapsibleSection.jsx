import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ title, icon, summary, summaryColor, accentColor, children, onFirstOpen }) {
  const [open, setOpen] = useState(false);
  const accent = accentColor || '#00ff88';

  const toggle = () => {
    if (!open && !hasOpened) {
      setHasOpened(true);
      onFirstOpen?.();
    }
    setOpen(o => !o);
  };

  const [hasOpened, setHasOpened] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        background: open ? '#0a0a0a' : '#0d0d0d',
        border: `1px solid ${open ? accent + '40' : '#1a1a1a'}`,
        boxShadow: open ? `0 0 20px ${accent}10` : 'none',
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer text-left transition-all hover:bg-[#111]"
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: open ? `1px solid ${accent}20` : 'none',
        }}
      >
        {/* Accent bar */}
        <div
          className="w-1 h-8 rounded-full shrink-0"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}60` }}
        />

        {/* Icon */}
        {icon && <span className="text-lg shrink-0">{icon}</span>}

        {/* Title */}
        <span className="font-syne font-bold text-sm text-white flex-1 tracking-tight">
          {title}
        </span>

        {/* Summary pill when collapsed */}
        {!open && summary && (
          <span
            className="font-mono text-[11px] px-3 py-1 rounded-[4px] truncate max-w-[220px]"
            style={{
              color: summaryColor || '#888',
              background: (summaryColor || '#888') + '15',
              border: `1px solid ${(summaryColor || '#888')}30`,
            }}
          >
            {summary}
          </span>
        )}

        {/* Chevron */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all"
          style={{ background: open ? accent + '20' : '#1a1a1a' }}
        >
          {open ? (
            <ChevronDown className="w-3.5 h-3.5" style={{ color: open ? accent : '#555' }} />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
          )}
        </div>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}