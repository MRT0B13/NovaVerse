import React, { useState } from 'react';
import AgentPill from '../nova/AgentPill';
import { relativeTime } from '../nova/formatters';

const AGENT_COLORS = {
  'Nova CFO':        '#00ff88',
  'Nova Scout':      '#00c8ff',
  'Nova Guardian':   '#ff9500',
  'Nova Supervisor': '#c084fc',
  'Nova Analyst':    '#00c8ff',
  'Nova Launcher':   '#f472b6',
  'Nova Community':  '#ffd700',
};

function getTxExplorerUrl(txHash, chain) {
  if (!txHash) return null;
  const c = (chain || '').toLowerCase();
  if (c.includes('solana') || c.includes('sol')) return `https://solscan.io/tx/${txHash}`;
  if (c.includes('base')) return `https://basescan.org/tx/${txHash}`;
  if (c.includes('polygon') || c.includes('matic')) return `https://polygonscan.com/tx/${txHash}`;
  if (c.includes('optimism') || c.includes('op')) return `https://optimistic.etherscan.io/tx/${txHash}`;
  if (c.includes('arb') || c.includes('evm') || c.includes('ethereum')) return `https://arbiscan.io/tx/${txHash}`;
  // Fallback: 0x prefix = EVM, otherwise assume Solana
  if (txHash.startsWith('0x')) return `https://arbiscan.io/tx/${txHash}`;
  return `https://solscan.io/tx/${txHash}`;
}

function buildFeedSummary(item) {
  switch (item.type) {
    case 'INTEL_SIGNAL':
      return item.detail || item.msg;
    case 'TRADE_EXECUTION':
      return `Executed ${item.raw?.strategy ?? 'trade'} — ${item.raw?.amount_in ?? ''} ${item.raw?.token_in ?? ''} → ${item.raw?.token_out ?? ''}`;
    case 'TRADE_OPENED':
      return `Opened ${item.raw?.strategy ?? 'position'} — ${item.raw?.amount_in ?? ''} ${item.raw?.token_in ?? ''} → ${item.raw?.token_out ?? ''}`;
    case 'TRADE_CLOSED':
      return `Closed ${item.raw?.strategy ?? 'position'} — ${item.raw?.token_in ?? item.raw?.asset ?? ''} ${item.raw?.pnl_usd != null ? `(PnL: $${Number(item.raw.pnl_usd).toFixed(2)})` : ''}`;
    case 'LP_UPDATE':
      return `LP position ${item.raw?.action ?? 'updated'} on ${item.raw?.protocol ?? 'Orca'}`;
    case 'LP_OPENED':
      return `Opened LP on ${item.raw?.protocol ?? item.raw?.pool_name ?? 'Orca'} — ${item.raw?.description || ''}`;
    case 'LP_CLOSED':
      return `Closed LP on ${item.raw?.protocol ?? item.raw?.pool_name ?? 'Orca'}`;
    case 'YIELD_UPDATE':
      return `Yield update: ${item.raw?.yield_earned != null ? `$${Number(item.raw.yield_earned).toFixed(2)} earned` : item.detail || 'position updated'}`;
    case 'SECURITY_ALERT':
      return `🛡️ Security: ${item.detail || item.raw?.message || item.msg}`;
    case 'RUG_ALERT':
      return `⚠️ Rug risk detected: ${item.raw?.token ?? item.detail}`;
    case 'GOVERNANCE_VOTE':
      return `Voted ${item.raw?.vote_choice ?? ''} on proposal: ${item.raw?.title ?? item.detail ?? ''}`;
    case 'GOVERNANCE_DEBATE':
      return item.detail || item.msg;
    case 'HEALTH_CHECK':
      return item.detail || item.msg;
    case 'REPORT':
      return item.detail || item.msg;
    case 'ALERT':
      return item.detail || item.msg;
    default:
      return item.detail || item.msg;
  }
}

export default function FeedItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = AGENT_COLORS[item.agent] ?? '#333';
  const summary = buildFeedSummary(item);
  const txUrl = getTxExplorerUrl(item.raw?.tx_hash, item.raw?.chain);

  return (
    <div
      className="px-4 py-3 animate-fade-in cursor-pointer transition-colors hover:bg-[#0d0d0d]"
      style={{ borderBottom: '1px solid #111', borderLeft: `2px solid ${borderColor}` }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-3">
        <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AgentPill agent={item.agent} />
            <span className="font-syne text-sm text-[#bbb] truncate">{item.msg}</span>
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] no-underline shrink-0"
                style={{ color: '#00c8ff' }}
                onClick={(e) => e.stopPropagation()}
              >
                View TX ↗
              </a>
            )}
          </div>
          {summary && summary !== item.msg && (
            <p className="font-mono text-[11px] text-[#888] mt-1 truncate">{summary}</p>
          )}
        </div>
        <span className="font-mono text-[10px] text-[#333] shrink-0 mt-1" title={item.time}>
          {relativeTime(item.time)}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 ml-8 p-3 rounded-md space-y-2" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          {item.detail && (
            <div>
              <span className="font-mono text-[9px] uppercase text-[#555]">Detail</span>
              <p className="font-mono text-[11px] text-[#bbb] mt-0.5 whitespace-pre-wrap">{item.detail}</p>
            </div>
          )}
          {item.raw && (
            <div>
              <span className="font-mono text-[9px] uppercase text-[#555]">Raw Data</span>
              <div className="mt-1 space-y-0.5">
                {Object.entries(item.raw).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-mono text-[10px] text-[#555] shrink-0">{k}:</span>
                    <span className="font-mono text-[10px] text-[#888] break-all">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!item.detail && !item.raw && (
            <p className="font-mono text-[10px] text-[#555]">No additional data</p>
          )}
        </div>
      )}
    </div>
  );
}

export { AGENT_COLORS };