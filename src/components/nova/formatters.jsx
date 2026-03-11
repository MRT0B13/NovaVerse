export function formatUSD(n) {
  if (n == null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPnl(n) {
  if (n == null) return '$0.00';
  const prefix = n >= 0 ? '+' : '';
  return prefix + formatUSD(n).replace('$', '$');
}

export function formatPnlSigned(n) {
  if (n == null) return '+$0.00';
  const abs = Math.abs(n);
  const formatted = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function relativeTime(timeStr) {
  if (!timeStr) return '';
  
  // Handle HH:MM:SS format (feed items)
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
    const now = new Date();
    const [h, m, s] = timeStr.split(':').map(Number);
    const itemTime = new Date(now);
    itemTime.setHours(h, m, s, 0);
    
    const diffMs = now - itemTime;
    if (diffMs < 0) return timeStr;
    
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return timeStr;
  }
  
  // Handle ISO timestamp
  const date = new Date(timeStr);
  if (isNaN(date)) return timeStr;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function timeRemaining(isoStr) {
  if (!isoStr) return 'Unknown';
  const end = new Date(isoStr);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) {
    const ago = now - end;
    const days = Math.floor(ago / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ago % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Ended ${days}d ago`;
    if (hours > 0) return `Ended ${hours}h ago`;
    return 'Ended';
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `Ends in ${days}d ${hours}h`;
  return `Ends in ${hours}h`;
}

export function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export const CHAIN_COLORS = {
  solana: '#c084fc',
  arbitrum: '#00c8ff',
  base: '#4f8ef7',
  polygon: '#8b5cf6',
  ethereum: '#888',
};

export const STRATEGY_COLORS = {
  polymarket: '#c084fc',
  hyperliquid: '#00c8ff',
  hl_perp_scalp: '#00c8ff',
  hl_funding: '#00c8ff',
  orca_lp: '#00ff88',
  krystal_lp: '#00e5cc',
  kamino: '#ff9500',
  kamino_loop: '#ff9500',
  jito: '#ffd700',
  jupiter_swap: '#6366f1',
  evm_flash_arb: '#f472b6',
};

export function strategyColor(key) {
  if (!key) return '#555';
  const lower = key.toLowerCase();
  for (const [k, c] of Object.entries(STRATEGY_COLORS)) {
    if (lower.includes(k)) return c;
  }
  return '#555';
}

export function formatSOL(n) {
  if (n == null) return '0.0000 SOL';
  return Number(n).toFixed(4) + ' SOL';
}

export function formatPct(n) {
  if (n == null) return '0.0%';
  return Number(n).toFixed(1) + '%';
}