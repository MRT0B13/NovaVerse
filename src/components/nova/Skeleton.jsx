import React from 'react';

export function SkeletonRect({ w = '100%', h = 16, className = '' }) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      style={{ width: typeof w === 'number' ? `${w}px` : w, height: h }}
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="nova-card p-4 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonRect key={i} w={i === 0 ? '60%' : '100%'} h={i === 0 ? 12 : 16} />
      ))}
    </div>
  );
}