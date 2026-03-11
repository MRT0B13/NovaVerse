import React, { useState } from 'react';
import NovaPill from '../nova/NovaPill';
import { useApi } from '../nova/AuthContext';
import SkillsAddModal from './SkillsAddModal';

export default function SidebarSkills({ skills, onRefresh }) {
  const apiFetch = useApi();
  const [localSkills, setLocalSkills] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const displaySkills = localSkills || skills;

  React.useEffect(() => { setLocalSkills(null); }, [skills]);

  const handleToggle = async (skill) => {
    const newEnabled = !skill.enabled;
    setLocalSkills(prev => {
      const list = prev || skills || [];
      return list.map(s => s.skill_id === skill.skill_id ? { ...s, enabled: newEnabled } : s);
    });
    try {
      await apiFetch(`/skills/${skill.skill_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: newEnabled }),
      });
      onRefresh?.();
    } catch {
      setLocalSkills(prev => {
        const list = prev || skills || [];
        return list.map(s => s.skill_id === skill.skill_id ? { ...s, enabled: !newEnabled } : s);
      });
    }
  };

  const currentSkillIds = (displaySkills || []).map(s => s.skill_id);

  return (
    <>
      <div className="nova-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Skills</span>
          <button
            onClick={() => setShowAdd(true)}
            className="font-mono text-[10px] cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: 'none', border: 'none', color: '#00c8ff' }}
          >
            + Add
          </button>
        </div>
        <div className="divide-y divide-[#111]">
          {(!displaySkills || displaySkills.length === 0) ? (
            <div className="p-4 text-center text-[#555] font-mono text-xs">No skills loaded</div>
          ) : (
            displaySkills.map(skill => (
              <button
                key={skill.skill_id || skill.id}
                onClick={() => handleToggle(skill)}
                className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-left hover:bg-[#0d0d0d]"
                style={{ background: 'transparent', border: 'none' }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: skill.enabled ? '#00ff88' : '#333' }} />
                <span className="font-syne text-sm text-[#bbb] flex-1 truncate">{skill.name}</span>
                <NovaPill text={skill.enabled ? 'ON' : 'OFF'} color={skill.enabled ? '#00ff88' : '#555'} />
              </button>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <SkillsAddModal
          currentSkillIds={currentSkillIds}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); onRefresh?.(); }}
        />
      )}
    </>
  );
}