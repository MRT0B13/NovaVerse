import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../nova/AuthContext';
import { X, Loader2, Plus, Search } from 'lucide-react';
import NovaPill from '../nova/NovaPill';
import { toast } from 'sonner';

export default function SkillsAddModal({ onClose, onAdded, currentSkillIds }) {
  const apiFetch = useApi();
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    apiFetch('/skills/registry')
      .then(data => { setRegistry(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiFetch]);

  const available = useMemo(() =>
    registry.filter(s => !currentSkillIds.includes(s.skill_id)),
    [registry, currentSkillIds]
  );

  const categories = useMemo(() => {
    const cats = new Set(available.map(s => s.category).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [available]);

  const filtered = useMemo(() => {
    let result = available;
    if (categoryFilter !== 'all') {
      result = result.filter(s => s.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.skill_id || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [available, categoryFilter, search]);

  const handleAssign = async (skillId) => {
    setAssigning(skillId);
    try {
      await apiFetch('/skills/assign', {
        method: 'POST',
        body: JSON.stringify({ skill_id: skillId }),
      });
      toast.success('Skill assigned');
      onAdded?.();
    } catch {
      // toast.error already fired
    }
    setAssigning(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="nova-card w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-lg text-white">Skill Registry</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white cursor-pointer" style={{ background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full font-mono text-xs pl-8 pr-3 py-2 rounded"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#bbb', outline: 'none' }}
          />
        </div>

        {/* Category filter pills */}
        {categories.length > 2 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="font-mono text-[9px] px-2 py-0.5 rounded cursor-pointer"
                style={{
                  background: categoryFilter === cat ? '#00c8ff18' : 'transparent',
                  border: categoryFilter === cat ? '1px solid #00c8ff40' : '1px solid #1a1a1a',
                  color: categoryFilter === cat ? '#00c8ff' : '#555',
                }}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded animate-shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-xs text-[#555] text-center py-8">
            {available.length === 0 ? 'All available skills are already assigned' : 'No skills match your search'}
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filtered.map(skill => (
              <div key={skill.skill_id} className="flex items-center gap-3 p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <div className="flex-1 min-w-0">
                  <span className="font-syne text-sm text-white block">{skill.name}</span>
                  {skill.description && <span className="font-mono text-[10px] text-[#555] block mt-0.5">{skill.description}</span>}
                  <div className="flex items-center gap-1.5 mt-1">
                    {skill.category && <NovaPill text={skill.category} color="#00c8ff" />}
                    {skill.source_url && (
                      <a href={skill.source_url} target="_blank" rel="noreferrer" className="font-mono text-[9px] no-underline" style={{ color: '#555' }}>source ↗</a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(skill.skill_id)}
                  disabled={assigning === skill.skill_id}
                  className="font-mono text-[10px] px-3 py-1.5 rounded cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 shrink-0"
                  style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
                >
                  {assigning === skill.skill_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Plus className="w-3 h-3 inline" /> Add</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
