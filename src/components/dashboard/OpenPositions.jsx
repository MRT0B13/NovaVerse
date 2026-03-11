import React from 'react';
import { formatUSD, formatPnlSigned, strategyColor, CHAIN_COLORS } from '../nova/formatters';
import NovaPill from '../nova/NovaPill';
import { SkeletonRect } from '../nova/Skeleton';

export default function OpenPositions({ positions, loading }) {
  if (loading) {
    return (
      <div className="nova-card p-4 space-y-3">
        <SkeletonRect w="40%" h={12} />
        {[1,2,3].map(i => <SkeletonRect key={i} h={40} />)}
      </div>
    );
  }

  return (
    <div className="nova-card overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
          Open Positions
        </span>
      </div>

      {(!positions || positions.length === 0) ? (
        <div className="p-8 text-center text-[#555] font-mono text-xs">
          Your agent hasn't opened any positions yet.
        </div>
      ) : (
        <div className="divide-y divide-[#111]">
          {positions.map((pos) => (
            <div key={pos.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <span className="font-syne font-semibold text-sm text-white">{pos.pool_name || pos.asset}</span>
                <div className="flex items-center gap-2 mt-1">
                  <NovaPill text={pos.strategy} color={strategyColor(pos.strategy)} />
                  <NovaPill text={pos.chain} color={CHAIN_COLORS[(pos.chain || '').toLowerCase()] || '#888'} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm text-white">{formatUSD(pos.amount_usd)}</p>
                <p
                  className="font-mono text-xs mt-0.5"
                  style={{ color: pos.pnl_usd > 0 ? '#00ff88' : pos.pnl_usd < 0 ? '#ff4444' : '#555' }}
                >
                  {formatPnlSigned(pos.pnl_usd)}
                  {pos.pnl_pct != null && (
                    <span className="ml-1" style={{ color: pos.pnl_pct > 0 ? '#00ff88' : pos.pnl_pct < 0 ? '#ff4444' : '#555' }}>
                      ({pos.pnl_pct > 0 ? '+' : ''}{Number(pos.pnl_pct).toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}