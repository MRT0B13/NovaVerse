import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoadBar() {
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: '#111' }}>
      <div
        className="h-full rounded-r"
        style={{
          background: '#00ff88',
          animation: 'page-load-bar 400ms ease-out forwards',
          boxShadow: '0 0 8px #00ff8860',
        }}
      />
      <style>{`
        @keyframes page-load-bar {
          0% { width: 0%; }
          60% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}