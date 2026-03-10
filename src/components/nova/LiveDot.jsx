import React from 'react';

export default function LiveDot({ color = '#00ff88', size = 8 }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size * 2.5, height: size * 2.5 }}>
      <span
        className="animate-ping-ring absolute rounded-full"
        style={{ width: size * 2, height: size * 2, backgroundColor: color, opacity: 0.3 }}
      />
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}