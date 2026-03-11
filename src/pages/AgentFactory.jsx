import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import TemplateGrid from '../components/factory/TemplateGrid';
import DeployForm from '../components/factory/DeployForm';
import AgentManagement from '../components/factory/AgentManagement';
import { SkeletonRect } from '../components/nova/Skeleton';

export default function AgentFactory() {
  const apiFetch = useApi();
  const [templates, setTemplates] = useState([]);
  const [agent, setAgent] = useState(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(null); // null = not yet determined

  const fetchData = useCallback(async () => {
    const [t, a] = await Promise.allSettled([
      apiFetch('/agents/templates'),
      apiFetch('/agents/me'),
    ]);
    if (t.status === 'fulfilled') setTemplates(t.value || []);
    const agentData = a.status === 'fulfilled' ? a.value : null;
    setAgent(agentData);
    // Set default tab only on first load
    setTab(prev => prev === null ? (agentData ? 'manage' : 'deploy') : prev);
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
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        <button
          onClick={() => setTab('manage')}
          className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-all"
          style={{
            background: tab === 'manage' ? '#1a1a1a' : 'transparent',
            color: tab === 'manage' ? '#fff' : '#555',
            border: 'none',
          }}
        >
          My Agent
        </button>
        <button
          onClick={() => setTab('deploy')}
          className="flex-1 font-mono text-xs py-2.5 rounded-md cursor-pointer transition-all"
          style={{
            background: tab === 'deploy' ? '#1a1a1a' : 'transparent',
            color: tab === 'deploy' ? '#fff' : '#555',
            border: 'none',
          }}
        >
          Deploy New
        </button>
      </div>

      {/* My Agent tab */}
      {tab === 'manage' && (
        agent ? (
          <AgentManagement agent={agent} onRefresh={fetchData} onSwitchToDeploy={() => setTab('deploy')} />
        ) : (
          <div className="nova-card p-8 text-center">
            <p className="font-mono text-xs text-[#555] mb-3">No agent deployed yet</p>
            <button
              onClick={() => setTab('deploy')}
              className="font-mono text-xs cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#00ff88' }}
            >
              → Deploy your first agent
            </button>
          </div>
        )
      )}

      {/* Deploy New tab */}
      {tab === 'deploy' && (
        agent?.status === 'running' ? (
          <div className="nova-card p-6 text-center" style={{ border: '1px solid #ff950030' }}>
            <p className="font-mono text-xs" style={{ color: '#ff9500' }}>
              ⚠ Pause your current agent before deploying a new one
            </p>
            <button
              onClick={() => setTab('manage')}
              className="font-mono text-xs mt-3 cursor-pointer"
              style={{ background: 'none', border: 'none', color: '#00ff88' }}
            >
              → Go to My Agent
            </button>
          </div>
        ) : (
          <>
            <TemplateGrid
              templates={templates}
              selectedId={selectedTemplate?.id}
              onSelect={setSelectedTemplate}
            />
            {selectedTemplate && <DeployForm template={selectedTemplate} />}
          </>
        )
      )}
    </div>
  );
}