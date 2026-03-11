import React from 'react';

export default function DeployTransition({ accent = '#00ff88' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#060606' }}
    >
      <div className="animate-pulse-glow text-center">
        <span className="text-5xl block mb-4">⚡</span>
        <h2
          className="font-syne text-xl font-bold"
          style={{ color: accent }}
        >
          Deploying your agent…
        </h2>
        <p className="font-mono text-[11px] text-[#555] mt-2">
          Setting up skills and connecting to the network
        </p>
      </div>
      <div
        className="mt-8 w-48 h-1 rounded-full overflow-hidden"
        style={{ background: '#1a1a1a' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: accent,
            animation: 'deploy-bar 1.5s ease-in-out forwards',
          }}
        />
      </div>
      <style>{`
        @keyframes deploy-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}