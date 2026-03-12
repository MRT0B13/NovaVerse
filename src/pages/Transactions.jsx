import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../components/nova/AuthContext';
import TxSummary from '../components/transactions/TxSummary';
import TxFilters from '../components/transactions/TxFilters';
import TxTable from '../components/transactions/TxTable';

const PAGE_SIZE = 50;

export default function Transactions() {
  const apiFetch = useApi();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ strategy: '', chain: '', status: '' });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Derive filter options from summary
  const strategies = Object.keys(summary?.tx_count_by_strategy || {});
  const chains = Object.keys(summary?.tx_count_by_chain || {});

  // Fetch summary once
  useEffect(() => {
    apiFetch('/transactions/summary').then(setSummary).catch(() => {});
  }, [apiFetch]);

  // Fetch transactions (backend supports strategy & chain filters; status is filtered client-side)
  const fetchTx = useCallback(async (newOffset = 0, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: newOffset });
    if (filters.strategy) params.set('strategy', filters.strategy);
    if (filters.chain) params.set('chain', filters.chain);
    const res = await apiFetch(`/transactions?${params}`).catch(() => []);
    const items = Array.isArray(res) ? res : (res?.transactions || []);
    if (append) {
      setTransactions(prev => [...prev, ...items]);
    } else {
      setTransactions(items);
    }
    setHasMore(items.length >= PAGE_SIZE);
    setOffset(newOffset + items.length);
    setLoading(false);
    setLoadingMore(false);
  }, [apiFetch, filters.strategy, filters.chain]);

  useEffect(() => { fetchTx(0); }, [fetchTx]);

  const loadMore = () => fetchTx(offset, true);

  // Apply client-side status filter (backend doesn't support status param)
  const displayed = filters.status
    ? transactions.filter(tx => tx.status === filters.status)
    : transactions;

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      <h1 className="font-syne font-bold text-lg text-white">TRANSACTIONS</h1>
      <TxSummary summary={summary} loading={!summary} />
      <TxFilters filters={filters} onChange={setFilters} strategies={strategies} chains={chains} />
      <TxTable transactions={displayed} loading={loading || loadingMore} onLoadMore={loadMore} hasMore={hasMore} />
    </div>
  );
}