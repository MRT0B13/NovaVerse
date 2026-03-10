import React from 'react';

export default function ErrorBanner({ message = 'Connection lost — retrying…' }) {
  return (
    <div
      className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center py-2 font-mono text-xs"
      style={{ background: '#ff950020', borderBottom: '1px solid #ff950040', color: '#ff9500' }}
    >
      {message}
    </div>
  );
}