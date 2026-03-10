import React, { useState } from 'react';
import { useApi } from '../nova/AuthContext';
import { X, Loader2 } from 'lucide-react';

export default function SubmitProposalModal({ onClose, onCreated }) {
  const apiFetch = useApi();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch('/governance/proposals', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      onCreated?.();
      onClose();
    } catch (err) {
      if (err.message?.includes('403') || err.message?.toLowerCase().includes('nova')) {
        setError('Minimum 100 NOVA required to submit a proposal');
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="nova-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-lg text-white">Submit Proposal</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white cursor-pointer" style={{ background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Proposal title"
              className="w-full font-syne text-sm px-3 py-2 rounded"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', outline: 'none' }}
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#888] block mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your proposal..."
              rows={4}
              className="w-full font-syne text-sm px-3 py-2 rounded resize-none"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', outline: 'none' }}
            />
          </div>

          {error && (
            <p className="font-mono text-xs" style={{ color: '#ff4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full font-mono text-xs py-3 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#c084fc18', border: '1px solid #c084fc40', color: '#c084fc' }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Submitting…
              </span>
            ) : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}