import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ title, summary, summaryColor, children, onFirstOpen }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const toggle = () => {
    if (!open && !hasOpened) {
      setHasOpened(true);
      onFirstOpen?.();
    }
    setOpen(o => !o);
  };

  return (
    <div className="nova-card overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left transition-colors hover:bg-[#0d0d0d]"
        style={{ background: 'transparent', border: 'none', borderBottom: open ? '1px solid #1a1a1a' : 'none' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888] flex-1">
          {title}
        </span>
        {!open && summary && (
          <span className="font-mono text-[10px] truncate max-w-[200px]" style={{ color: summaryColor || '#555' }}>
            {summary}
          </span>
        )}
        {open ? (
          <ChevronDown className="w-3 h-3 text-[#555] shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-[#555] shrink-0" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}