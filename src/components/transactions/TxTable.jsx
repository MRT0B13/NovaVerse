import React from 'react';
import NovaPill from '../nova/NovaPill';
import { relativeTime, formatUSD, strategyColor, CHAIN_COLORS } from '../nova/formatters';
import { SkeletonRect } from '../nova/Skeleton';

const STATUS_COLORS = { confirmed: '#00ff88', pending: '#ff9500', failed: '#ff4444' };
const TYPE_COLORS = { swap: '#00c8ff', lp_open: '#00ff88', lp_close: '#ff9500', prediction_buy: '#c084fc', prediction_sell: '#f472b6', fee_collect: '#ffd700', stake: '#6366f1' };

export default function TxTable({ transactions, loading, onLoadMore, hasMore }) {
  if (loading && transactions.length === 0) {
    return <div className="space-y-2">{[1,2,3,4,5].map(i => <SkeletonRect key={i} h={40} />)}</div>;
  }

  return (
    <div className="nova-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Time', 'Chain', 'Strategy', 'Type', 'From → To', 'Amount', 'Fee', 'Status', 'TX'].map(h => (
                <th key={h} className="font-mono text-[9px] uppercase text-[#555] text-left py-2 px-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const chain = (tx.chain || '').toLowerCase();
              const isSolana = chain.includes('solana') || chain.includes('sol');
              const txUrl = tx.tx_hash ? (isSolana ? `https://solscan.io/tx/${tx.tx_hash}` : `https://arbiscan.io/tx/${tx.tx_hash}`) : null;
              return (
                <tr key={tx.id || i} style={{ borderBottom: '1px solid #111' }}>
                  <td className="py-2 px-3 font-mono text-[10px] text-[#555] whitespace-nowrap" title={tx.timestamp}>
                    {relativeTime(tx.timestamp)}
                  </td>
                  <td className="py-2 px-3">
                    <NovaPill text={tx.chain || '?'} color={CHAIN_COLORS[chain] || '#888'} />
                  </td>
                  <td className="py-2 px-3">
                    <NovaPill text={tx.strategy_tag || '?'} color={strategyColor(tx.strategy_tag)} />
                  </td>
                  <td className="py-2 px-3">
                    <NovaPill text={tx.tx_type || '?'} color={TYPE_COLORS[tx.tx_type] || '#888'} />
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#bbb] whitespace-nowrap">
                    {tx.token_in && <>{Number(tx.amount_in || 0).toFixed(4)} {tx.token_in}</>}
                    {tx.token_out && <> → {Number(tx.amount_out || 0).toFixed(4)} {tx.token_out}</>}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-white whitespace-nowrap">
                    {formatUSD(tx.amount_usd || tx.amount_in)}
                  </td>
                  <td className="py-2 px-3 font-mono text-[10px] text-[#555]">{tx.fee_usd ? formatUSD(tx.fee_usd) : '—'}</td>
                  <td className="py-2 px-3">
                    <NovaPill text={(tx.status || 'pending').toUpperCase()} color={STATUS_COLORS[tx.status] || '#555'} />
                  </td>
                  <td className="py-2 px-3">
                    {txUrl ? <a href={txUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] no-underline" style={{ color: '#00c8ff' }}>↗</a> : <span className="text-[#333]">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-3 text-center" style={{ borderTop: '1px solid #1a1a1a' }}>
          <button onClick={onLoadMore} disabled={loading} className="font-mono text-[11px] cursor-pointer transition-opacity hover:opacity-80" style={{ background: 'none', border: 'none', color: '#00c8ff', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Loading…' : 'Load more ↓'}
          </button>
        </div>
      )}

      {transactions.length === 0 && !loading && (
        <div className="p-8 text-center"><p className="font-mono text-xs text-[#555]">No transactions found</p></div>
      )}
    </div>
  );
}