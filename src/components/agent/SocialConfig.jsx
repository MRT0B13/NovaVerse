import React, { useState, useEffect } from 'react';
import { useApi } from '../nova/AuthContext';
import { Save, Loader2 } from 'lucide-react';

const SOCIAL_TEMPLATES = ['community-agent', 'governance-agent', 'launcher-agent', 'social-agent'];

export default function SocialConfig({ templateId }) {
  const apiFetch = useApi();
  const [social, setSocial] = useState({ x_handle: '', telegram_group: '', custom_bio: '', posting_frequency: 'medium' });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const show = SOCIAL_TEMPLATES.includes(templateId);

  useEffect(() => {
    if (!show) return;
    apiFetch('/agents/social').then(d => { if (d) setSocial(s => ({ ...s, ...d })); setLoaded(true); }).catch(() => setLoaded(true));
  }, [apiFetch, show]);

  if (!show) return null;

  const set = (k, v) => setSocial(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await apiFetch('/agents/social', { method: 'PATCH', body: JSON.stringify(social) }).catch(() => {});
    setSaving(false);
  };

  const inputStyle = { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 6, padding: '10px 12px', outline: 'none', width: '100%' };

  return (
    <div className="nova-card p-5 space-y-4">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Social Config</span>

      <div>
        <label className="font-mono text-[10px] text-[#888] block mb-1">X Handle</label>
        <input value={social.x_handle || ''} onChange={e => set('x_handle', e.target.value)} placeholder="@username" className="font-mono text-xs" style={inputStyle} />
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#888] block mb-1">Telegram Group</label>
        <input value={social.telegram_group || ''} onChange={e => set('telegram_group', e.target.value)} placeholder="https://t.me/…" className="font-mono text-xs" style={inputStyle} />
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#888] block mb-1">Custom Bio <span className="text-[#333]">({(social.custom_bio || '').length}/280)</span></label>
        <textarea value={social.custom_bio || ''} onChange={e => set('custom_bio', e.target.value.slice(0, 280))} maxLength={280} rows={2} className="font-mono text-xs resize-none" style={inputStyle} />
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#888] block mb-1">Posting Frequency</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high'].map(f => (
            <button key={f} onClick={() => set('posting_frequency', f)} className="flex-1 font-mono text-xs py-2 rounded cursor-pointer capitalize" style={{ background: social.posting_frequency === f ? '#00c8ff18' : '#0d0d0d', border: `1px solid ${social.posting_frequency === f ? '#00c8ff' : '#1a1a1a'}`, color: social.posting_frequency === f ? '#00c8ff' : '#555' }}>{f}</button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 font-mono text-xs py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30" style={{ background: '#00c8ff18', border: '1px solid #00c8ff40', color: '#00c8ff' }}>
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save Social Config
      </button>
    </div>
  );
}