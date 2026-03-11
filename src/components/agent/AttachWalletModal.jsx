import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import { X, Loader2 } from 'lucide-react';

export default function AttachWalletModal({ onClose, onSuccess }) {
  const apiFetch = useApi();
  const [chain, setChain] = useState('solana');
  const [address, setAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [permissions, setPermissions] = useState(['read']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const togglePerm = (p) => setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleSubmit = async () => {
    if (!address.trim()) { setError('Wallet address is required'); return; }
    setSubmitting(true);
    setError(null);
    const body = { chain, address: address.trim(), permissions };
    if (privateKey.trim()) body.privateKey = privateKey.trim();
    const res = await apiFetch('/agents/wallet', { method: 'POST', body: JSON.stringify(body) }).catch(e => { setError(e.message); return null; });
    setSubmitting(false);
    if (res) onSuccess?.();
  };

  const inputStyle = { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 6, padding: '10px 12px', outline: 'none', width: '100%' };
  const chainBtn = (v, label) => (
    <button key={v} onClick={() => setChain(v)} className="flex-1 font-mono text-xs py-2 rounded cursor-pointer" style={{ background: chain === v ? '#00ff8810' : '#0d0d0d', border: `1px solid ${chain === v ? '#00ff88' : '#1a1a1a'}`, color: chain === v ? '#00ff88' : '#555' }}>{label}</button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="nova-card p-6 w-full max-w-md space-y-4" style={{ background: '#0a0a0a' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-base text-white">Attach Wallet</h3>
          <button onClick={onClose} className="cursor-pointer" style={{ background: 'none', border: 'none', color: '#555' }}><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Chain</label>
          <div className="flex gap-2">
            {chainBtn('solana', 'Solana')}
            {chainBtn('evm', 'EVM')}
            {chainBtn('both', 'Both')}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Wallet Address *</label>
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x… or So…" className="font-mono text-xs" style={inputStyle} />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Private Key (optional)</label>
          <input type="password" value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="Leave blank for read-only" className="font-mono text-xs" style={inputStyle} />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#888] block mb-2">Permissions</label>
          <div className="flex gap-2">
            {['read', 'trade', 'lp'].map(p => (
              <button key={p} onClick={() => togglePerm(p)} className="font-mono text-xs px-4 py-1.5 rounded cursor-pointer capitalize" style={{ background: permissions.includes(p) ? '#00ff8818' : '#0d0d0d', border: `1px solid ${permissions.includes(p) ? '#00ff88' : '#1a1a1a'}`, color: permissions.includes(p) ? '#00ff88' : '#555' }}>{p}</button>
            ))}
          </div>
        </div>

        {error && <p className="font-mono text-[11px]" style={{ color: '#ff4444' }}>{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer" style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer" style={{ background: '#00ff8820', border: '1px solid #00ff8840', color: '#00ff88', opacity: submitting ? 0.5 : 1 }}>
            {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Attaching…</span> : 'Attach Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}