import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import TemplateGrid from '../components/factory/TemplateGrid';
import DeployForm from '../components/factory/DeployForm';
import AgentManagement from '../components/factory/AgentManagement';
import { SkeletonRect } from '../components/nova/Skeleton';

export default function AgentFactory() {
  const apiFetch = useApi();
  const [templates, setTemplates] = useState([]);
  const [agent, setAgent] = useState(undefined); // undefined = loading, null = no agent
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [t, a] = await Promise.allSettled([
      apiFetch('/agents/templates'),
      apiFetch('/agents/me'),
    ]);
    if (t.status === 'fulfilled') setTemplates(t.value || []);
    if (a.status === 'fulfilled') setAgent(a.value);
    else setAgent(null);
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[800px] mx-auto space-y-4">
        <SkeletonRect h={20} w="50%" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <SkeletonRect key={i} h={120} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[800px] mx-auto">
      {agent ? (
        <AgentManagement agent={agent} onRefresh={fetchData} />
      ) : (
        <>
          <TemplateGrid
            templates={templates}
            selectedId={selectedTemplate?.id}
            onSelect={setSelectedTemplate}
          />
          {selectedTemplate && <DeployForm template={selectedTemplate} />}
        </>
      )}
    </div>
  );
}