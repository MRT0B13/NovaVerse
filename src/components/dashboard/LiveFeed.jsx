import React, { useState } from 'react';
import LiveDot from '../nova/LiveDot';
import { SkeletonRect } from '../nova/Skeleton';
import FeedItem, { AGENT_COLORS } from './FeedItem';

export default function LiveFeed({ items, loading }) {
  const [activeAgent, setActiveAgent] = useState('All');

  if (loading) {
    return (
      <div className="nova-card p-4 space-y-3">
        <SkeletonRect w="40%" h={12} />
        {[1,2,3,4,5].map(i => <SkeletonRect key={i} h={32} />)}
      </div>
    );
  }

  // Derive unique agents from the feed data
  const agents = [...new Set((items || []).map(i => i.agent).filter(Boolean))];
  const filtered = activeAgent === 'All' ? items : (items || []).filter(i => i.agent === activeAgent);

  return (
    <div className="nova-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <LiveDot color="#00ff88" size={6} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
          Agent Activity Feed
        </span>
      </div>

      {/* Agent filter chips */}
      {agents.length > 1 && (
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto nav-scroll" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button
            onClick={() => setActiveAgent('All')}
            className="font-mono text-[10px] px-2.5 py-1 rounded-[4px] cursor-pointer shrink-0 transition-colors"
            style={{
              background: activeAgent === 'All' ? '#1a1a1a' : 'transparent',
              border: `1px solid ${activeAgent === 'All' ? '#333' : '#1a1a1a'}`,
              color: activeAgent === 'All' ? '#fff' : '#555',
            }}
          >All</button>
          {agents.map(a => {
            const active = activeAgent === a;
            const color = AGENT_COLORS[a] || '#888';
            return (
              <button
                key={a}
                onClick={() => setActiveAgent(a)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-[4px] cursor-pointer shrink-0 transition-colors"
                style={{
                  background: active ? `${color}18` : 'transparent',
                  border: `1px solid ${active ? `${color}60` : '#1a1a1a'}`,
                  color: active ? color : '#555',
                }}
              >{a}</button>
            );
          })}
        </div>
      )}

      <div className="overflow-y-auto max-h-[400px]">
        {(!filtered || filtered.length === 0) ? (
          <div className="p-8 text-center text-[#555] font-mono text-xs">
            {activeAgent === 'All' ? 'No activity yet — agent is warming up' : `No activity from ${activeAgent}`}
          </div>
        ) : (
          filtered.map((item, idx) => (
            <FeedItem key={item.id || idx} item={item} />
          ))
        )}
      </div>
    </div>
  );
}