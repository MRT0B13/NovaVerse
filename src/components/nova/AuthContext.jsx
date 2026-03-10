import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = 'https://api.novaverse.xyz';
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function useApi() {
  const { token } = useAuth();
  
  const apiFetch = useCallback(async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API}${path}`, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('nova_token');
      localStorage.removeItem('nova_address');
      window.location.reload();
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.message || `API error ${res.status}`);
    }
    return res.json();
  }, [token]);
  
  return apiFetch;
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nova_token'));
  const [address, setAddress] = useState(() => localStorage.getItem('nova_address'));
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const _doAuth = useCallback(async (walletAddress, signFn) => {
    const nonceRes = await fetch(`${API}/api/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress })
    });
    const { message } = await nonceRes.json();
    const signature = await signFn(message, walletAddress);
    const verifyRes = await fetch(`${API}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress, message, signature })
    });
    const { token: jwt } = await verifyRes.json();
    localStorage.setItem('nova_token', jwt);
    localStorage.setItem('nova_address', walletAddress);
    setToken(jwt);
    setAddress(walletAddress);
  }, []);

  const connectEvm = useCallback(async () => {
    setConnecting('evm');
    setError(null);
    const provider = window.ethereum || window.web3?.currentProvider;
    if (!provider) {
      setError('MetaMask not detected. Open this page inside the MetaMask browser or install the extension.');
      setConnecting(null);
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      await _doAuth(walletAddress, (msg, addr) =>
        provider.request({ method: 'personal_sign', params: [msg, addr] })
      );
    } catch (err) {
      setError(err.message || 'EVM connection failed');
    } finally {
      setConnecting(null);
    }
  }, [_doAuth]);

  const connectSolana = useCallback(async () => {
    setConnecting('solana');
    setError(null);
    const solana = window.phantom?.solana || window.solana;
    if (!solana?.isPhantom && !solana?.connect) {
      setError('Phantom not detected. Open this page inside the Phantom browser or install the extension.');
      setConnecting(null);
      return;
    }
    try {
      const resp = await solana.connect();
      const walletAddress = resp.publicKey.toString();
      await _doAuth(walletAddress, async (msg) => {
        const encoded = new TextEncoder().encode(msg);
        const { signature } = await solana.signMessage(encoded, 'utf8');
        return Buffer.from(signature).toString('hex');
      });
    } catch (err) {
      setError(err.message || 'Solana connection failed');
    } finally {
      setConnecting(null);
    }
  }, [_doAuth]);

  // legacy single connect — tries EVM first, then Solana
  const connect = useCallback(async () => {
    if (window.ethereum || window.web3?.currentProvider) return connectEvm();
    if (window.phantom?.solana || window.solana) return connectSolana();
    setError('No wallet detected. Open this page inside MetaMask or Phantom.');
  }, [connectEvm, connectSolana]);

  const disconnect = useCallback(() => {
    localStorage.removeItem('nova_token');
    localStorage.removeItem('nova_address');
    setToken(null);
    setAddress(null);
  }, []);

  const truncatedAddress = address 
    ? `${address.slice(0, 6)}…${address.slice(-4)}` 
    : null;

  return (
    <AuthContext.Provider value={{ token, address, truncatedAddress, connecting, error, connect, connectEvm, connectSolana, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}