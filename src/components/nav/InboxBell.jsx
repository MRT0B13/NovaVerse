import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { relativeTime } from '../nova/formatters';

const TYPE_COLORS = {
  alert: '#ff4444',
  approval: '#ff9500',
  report: '#00c8ff',
  info: '#888',
  escalation: '#c084fc',
};

export default function InboxBell() {
  const apiFetch = useApi();
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchInbox = useCallback(async () => {
    try {
      const data = await apiFetch('/supervisor/inbox?unread=true&limit=10');
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = messages.filter(m => !m.acknowledged).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-opacity hover:opacity-80"
        style={{ background: '#1a1a1a', border: '1px solid #222' }}
        aria-label="Inbox"
      >
        <span className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-mono text-[9px] text-black font-bold px-1"
            style={{ background: '#ff4444' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg z-50 animate-fade-in overflow-hidden"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', boxShadow: '0 8px 32px #00000080' }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1a1a1a' }}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Supervisor Inbox</span>
            {unreadCount > 0 && <NovaPill text={`${unreadCount} unread`} color="#ff4444" />}
          </div>

          {messages.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-xs text-[#555]">No messages</p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto divide-y divide-[#111]">
              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className="px-4 py-3 transition-colors hover:bg-[#111]"
                  style={{ opacity: msg.acknowledged ? 0.5 : 1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-semibold" style={{ color: TYPE_COLORS[msg.type] || '#888' }}>
                      {msg.from || 'System'}
                    </span>
                    <NovaPill text={msg.type || 'info'} color={TYPE_COLORS[msg.type] || '#888'} />
                    {msg.priority === 'high' && <NovaPill text="HIGH" color="#ff4444" />}
                    <span className="font-mono text-[9px] text-[#444] ml-auto">{relativeTime(msg.time)}</span>
                  </div>
                  <p className="font-mono text-[11px] text-[#bbb] leading-relaxed">{msg.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
