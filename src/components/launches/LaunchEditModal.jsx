import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LaunchEditModal({ launchId, initialData, onClose, onSaved }) {
  const apiFetch = useApi();
  const [saving, setSaving] = useState(false);

  const brand = initialData?.brand || {};
  const mascot = initialData?.mascot || {};
  const links = initialData?.links || {};
  const assets = initialData?.assets || {};

  const [form, setForm] = useState({
    name: brand.name || '',
    ticker: brand.ticker || '',
    tagline: brand.tagline || '',
    description: brand.description || '',
    mascot_name: mascot.name || '',
    mascot_personality: mascot.personality || '',
    mascot_catchphrases: (mascot.catchphrases || []).join(', '),
    link_x: links.x || '',
    link_telegram: links.telegram || '',
    link_website: links.website || '',
    logo_url: assets.logo_url || '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const catchphrases = form.mascot_catchphrases
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const body = {
        brand: {
          name: form.name,
          ticker: form.ticker,
          tagline: form.tagline || undefined,
          description: form.description || undefined,
        },
        mascot: (form.mascot_name || form.mascot_personality) ? {
          name: form.mascot_name || undefined,
          personality: form.mascot_personality || undefined,
          catchphrases: catchphrases.length > 0 ? catchphrases : undefined,
        } : undefined,
        links: (form.link_x || form.link_telegram || form.link_website) ? {
          x: form.link_x || undefined,
          telegram: form.link_telegram || undefined,
          website: form.link_website || undefined,
        } : undefined,
        assets: form.logo_url ? { logo_url: form.logo_url } : undefined,
      };

      // Remove undefined top-level keys
      Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

      await apiFetch(`/launches/${launchId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      toast.success('Launch pack updated');
      onSaved?.();
      onClose();
    } catch (err) {
      // toast.error already fired by apiFetch
    }
    setSaving(false);
  };

  const Field = ({ label, k, placeholder, multiline }) => (
    <div>
      <label className="font-mono text-[9px] uppercase tracking-widest text-[#555] block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={form[k]}
          onChange={set(k)}
          placeholder={placeholder}
          rows={3}
          className="w-full font-mono text-xs px-3 py-2 rounded resize-none"
          style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
        />
      ) : (
        <input
          type="text"
          value={form[k]}
          onChange={set(k)}
          placeholder={placeholder}
          className="w-full font-mono text-xs px-3 py-2 rounded"
          style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="nova-card w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-lg text-white">Edit Launch Pack</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white cursor-pointer" style={{ background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#00c8ff]">Brand</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" k="name" placeholder="Token name" />
            <Field label="Ticker" k="ticker" placeholder="$TICKER" />
          </div>
          <Field label="Tagline" k="tagline" placeholder="Short tagline" />
          <Field label="Description" k="description" placeholder="Full description" multiline />

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#ff9500] mt-2">Mascot</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" k="mascot_name" placeholder="Mascot name" />
            <Field label="Personality" k="mascot_personality" placeholder="Personality" />
          </div>
          <Field label="Catchphrases" k="mascot_catchphrases" placeholder="Comma-separated catchphrases" />

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#c084fc] mt-2">Links</p>
          <Field label="X / Twitter" k="link_x" placeholder="https://x.com/..." />
          <Field label="Telegram" k="link_telegram" placeholder="https://t.me/..." />
          <Field label="Website" k="link_website" placeholder="https://..." />

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#ffd700] mt-2">Assets</p>
          <Field label="Logo URL" k="logo_url" placeholder="https://...logo.png" />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-mono text-xs py-2.5 rounded-md cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 mt-4"
            style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
