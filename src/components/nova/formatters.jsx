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
  return date.toLocaleDateString();
}

export function timeRemaining(isoStr) {
  if (!isoStr) return 'Unknown';
  const end = new Date(isoStr);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export const CHAIN_COLORS = {
  solana: '#c084fc',
  arbitrum: '#00c8ff',
  base: '#3b82f6',
  polygon: '#8b5cf6',
  ethereum: '#3b82f6',
};