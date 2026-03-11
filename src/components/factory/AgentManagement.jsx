import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../nova/AuthContext';
import MyAgentTab from '../dashboard/MyAgentTab';

export default function AgentManagement({ agent, onRefresh, onSwitchToDeploy }) {
  const apiFetch = useApi();
  const [skills, setSkills] = useState(null);
  const [nova, setNova] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExtra = useCallback(async () => {
    const [s, p] = await Promise.allSettled([
      apiFetch('/skills'),
      apiFetch('/portfolio'),
    ]);
    if (s.status === 'fulfilled') setSkills(s.value || []);
    if (p.status === 'fulfilled') setNova(p.value?.nova);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { fetchExtra(); }, [fetchExtra]);

  return (
    <MyAgentTab
      agent={agent}
      skills={skills}
      nova={nova}
      loading={loading}
      onRefresh={() => { onRefresh?.(); fetchExtra(); }}
    />
  );
}