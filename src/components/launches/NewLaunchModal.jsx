import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';

export default function NewLaunchModal({ onClose, onCreated }) {
  const apiFetch = useApi();
  const [form, setForm] = useState({ name: '', ticker: '', tagline: '', description: '', logo_url: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.ticker) { setError('Name and Ticker are required'); return; }
    setSubmitting(true);
    setError(null);
    const body = {
      brand: { name: form.name, ticker: form.ticker.toUpperCase(), tagline: form.tagline || undefined, description: form.description || undefined },
      assets: form.logo_url ? { logo_url: form.logo_url } : undefined,
    };
    const res = await apiFetch('/launches', { method: 'POST', body: JSON.stringify(body) }).catch(e => { setError(e.message); return null; });
    setSubmitting(false);
    if (res) onCreated(res);
  };

  const inputStyle = { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 6, padding: '10px 12px', outline: 'none', width: '100%' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="nova-card p-6 w-full max-w-md space-y-4" style={{ background: '#0a0a0a' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-base text-white">New Launch</h3>
          <button onClick={onClose} className="font-mono text-xs cursor-pointer" style={{ background: 'none', border: 'none', color: '#555' }}>✕</button>
        </div>

        <div className="space-y-3">
          <input placeholder="Brand Name *" value={form.name} onChange={e => set('name', e.target.value)} className="font-mono text-xs" style={inputStyle} />
          <input placeholder="Ticker *" value={form.ticker} onChange={e => set('ticker', e.target.value.toUpperCase().slice(0, 12))} className="font-mono text-xs" style={inputStyle} />
          <input placeholder="Tagline" value={form.tagline} onChange={e => set('tagline', e.target.value)} className="font-mono text-xs" style={inputStyle} />
          <textarea placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="font-mono text-xs resize-none" style={inputStyle} />
          <input placeholder="Logo URL (optional)" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} className="font-mono text-xs" style={inputStyle} />
        </div>

        {error && <p className="font-mono text-[11px]" style={{ color: '#ff4444' }}>{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer" style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-opacity" style={{ background: '#00ff8820', border: '1px solid #00ff8840', color: '#00ff88', opacity: submitting ? 0.5 : 1 }}>
            {submitting ? 'Creating…' : 'Create Launch'}
          </button>
        </div>
      </div>
    </div>
  );
}