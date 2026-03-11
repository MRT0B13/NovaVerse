import React, { useState, useEffect } from 'react';

export default function ApiErrorBanner({ error }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center py-2 px-4 animate-fade-in"
      style={{ background: '#ff950020', borderBottom: '1px solid #ff950040' }}
    >
      <span className="font-mono text-xs" style={{ color: '#ff9500' }}>
        ⚠ Connection error — retrying…
      </span>
    </div>
  );
}