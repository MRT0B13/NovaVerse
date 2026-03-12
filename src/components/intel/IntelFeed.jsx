import React from 'react';
import FeedItem from '../dashboard/FeedItem';
import { SkeletonRect } from '../nova/Skeleton';

export default function IntelFeed({ items, loading, emptyMessage = 'No intel yet' }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-3">
        {[...Array(5)].map((_, i) => <SkeletonRect key={i} h={48} />)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="nova-card p-8 text-center">
        <p className="font-mono text-xs text-[#555]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="nova-card overflow-y-auto"
      style={{ maxHeight: 600, border: '1px solid #1a1a1a', background: '#0a0a0a' }}
    >
      {items.map((item, i) => (
        <FeedItem key={item.id || i} item={item} />
      ))}
    </div>
  );
}
