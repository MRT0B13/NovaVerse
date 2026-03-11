import React, { useState, useEffect } from 'react';
import { useApi } from '../nova/AuthContext';
import { X, Loader2, Plus } from 'lucide-react';
import NovaPill from '../nova/NovaPill';

export default function SkillsAddModal({ onClose, onAdded, currentSkillIds }) {
  const apiFetch = useApi();
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    apiFetch('/skills/registry')
      .then(data => { setRegistry(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiFetch]);

  const available = registry.filter(s => !currentSkillIds.includes(s.skill_id));

  const handleAssign = async (skillId) => {
    setAssigning(skillId);
    await apiFetch('/skills/assign', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    });
    setAssigning(null);
    onAdded?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="nova-card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-lg text-white">Skill Registry</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white cursor-pointer" style={{ background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded animate-shimmer" />)}
          </div>
        ) : available.length === 0 ? (
          <p className="font-mono text-xs text-[#555] text-center py-8">All available skills are already assigned</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {available.map(skill => (
              <div key={skill.skill_id} className="flex items-center gap-3 p-3 rounded" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <div className="flex-1 min-w-0">
                  <span className="font-syne text-sm text-white block">{skill.name}</span>
                  {skill.description && <span className="font-mono text-[10px] text-[#555] block mt-0.5 truncate">{skill.description}</span>}
                  {skill.category && <NovaPill text={skill.category} color="#00c8ff" />}
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