import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../nova/AuthContext';
import NovaPill from '../nova/NovaPill';
import { formatUSD, formatSOL } from '../nova/formatters';

export default function BurnInterface({ eligible, onBurnComplete }) {
  const { address } = useAuth();
  const apiFetch = useApi();
  const [selectedMint, setSelectedMint] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [burning, setBurning] = useState(false);
  const [burnResult, setBurnResult] = useState(null);
  const [error, setError] = useState(null);

  const selected = eligible.find(e => e.mint === selectedMint);

  const getQuote = async () => {
    if (!selectedMint || !amount || Number(amount) <= 0) return;
    setQuoteLoading(true);
    setError(null);
    const res = await apiFetch(`/burn/quote?mint=${selectedMint}&amount=${amount}`).catch(e => { setError(e.message); return null; });
    setQuote(res);
    setQuoteLoading(false);
  };

  const executeBurn = async () => {
    setBurning(true);
    setError(null);
    setBurnResult(null);
    const body = { walletAddress: address, mint: selectedMint, amountTokens: Number(amount), launchPackId: selected?.launchPackId || undefined };
    const res = await apiFetch('/burn', { method: 'POST', body: JSON.stringify(body) }).catch(e => { setError(e.message); return null; });
    setBurning(false);
    if (res) { setBurnResult(res); onBurnComplete?.(); }
  };

  const inputStyle = { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 6, padding: '10px 12px', outline: 'none', width: '100%' };
  const priceImpactBps = Number(quote?.priceImpactBps || 0);

  return (
    <div className="nova-card p-5 space-y-4" style={{ border: '1px solid #ff444440' }}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#888]">Burn Interface</p>

      {/* Step 1: Token Select */}
      <select value={selectedMint} onChange={e => { setSelectedMint(e.target.value); setQuote(null); setBurnResult(null); }} className="font-mono text-xs" style={inputStyle}>
        <option value="">Select token to burn…</option>
        {eligible.map(t => (
          <option key={t.mint} value={t.mint}>
            ${t.tokenTicker} — {t.tokenName} {t.marketCap ? `(MCap: $${Number(t.marketCap).toLocaleString()})` : ''}
          </option>
        ))}
      </select>

      {/* Step 2: Amount */}
      {selectedMint && (
        <div className="flex gap-2">
          <input type="number" placeholder="Amount" value={amount} onChange={e => { setAmount(e.target.value); setQuote(null); }} className="font-mono text-xs flex-1" style={inputStyle} />
          <button onClick={getQuote} disabled={quoteLoading || !amount} className="font-mono text-xs px-4 py-2 rounded-md cursor-pointer shrink-0" style={{ background: '#00c8ff18', border: '1px solid #00c8ff40', color: '#00c8ff', opacity: quoteLoading ? 0.5 : 1 }}>
            {quoteLoading ? 'Quoting…' : 'Get Quote'}
          </button>
        </div>
      )}

      {/* Quote Display */}
      {quote && (
        <div className="p-4 rounded-lg space-y-2" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
          <div className="flex justify-between"><span className="font-mono text-[11px] text-[#888]">Burn Amount</span><span className="font-mono text-[11px] text-white">{Number(quote.amountTokens || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="font-mono text-[11px] text-[#888]">SOL Received</span><span className="font-mono text-[11px]" style={{ color: '#00ff88' }}>{formatSOL(quote.amountSol)}</span></div>
          <div className="flex justify-between"><span className="font-mono text-[11px] text-[#888]">Price Impact</span><span className="font-mono text-[11px]" style={{ color: priceImpactBps > 200 ? '#ff4444' : '#888' }}>{(priceImpactBps / 100).toFixed(2)}%</span></div>
          <div className="flex justify-between"><span className="font-mono text-[11px] text-[#888]">Credits Earned</span><span className="font-mono text-[11px]" style={{ color: '#ffd700' }}>{Number(quote.creditsEarned || 0)}</span></div>
          {quote.distribution && (
            <div className="pt-2 space-y-1" style={{ borderTop: '1px solid #1a1a1a' }}>
              {Object.entries(quote.distribution).map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="font-mono text-[10px] text-[#555]">{k}</span><span className="font-mono text-[10px] text-[#888]">{formatSOL(v)}</span></div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Execute */}
      {quote && !burnResult && (
        <button onClick={executeBurn} disabled={burning} className="w-full font-mono text-sm py-3 rounded-md cursor-pointer transition-opacity" style={{ background: '#ff444420', border: '1px solid #ff444450', color: '#ff4444', opacity: burning ? 0.5 : 1 }}>
          {burning ? 'Burning…' : 'Burn Tokens 🔥'}
        </button>
      )}

      {/* Burn Result */}
      {burnResult && (
        <div className="p-4 rounded-lg space-y-2" style={{ background: '#00ff8810', border: '1px solid #00ff8830' }}>
          <p className="font-mono text-xs" style={{ color: '#00ff88' }}>✓ Burn complete!</p>
          {burnResult.swap_tx && <a href={`https://solscan.io/tx/${burnResult.swap_tx}`} target="_blank" rel="noreferrer" className="font-mono text-[10px] no-underline" style={{ color: '#00c8ff' }}>Swap TX ↗</a>}
          {burnResult.burn_tx && <a href={`https://solscan.io/tx/${burnResult.burn_tx}`} target="_blank" rel="noreferrer" className="font-mono text-[10px] no-underline ml-3" style={{ color: '#c084fc' }}>Burn TX ↗</a>}
        </div>
      )}

      {error && <p className="font-mono text-[11px]" style={{ color: '#ff4444' }}>{error}</p>}
    </div>
  );
}