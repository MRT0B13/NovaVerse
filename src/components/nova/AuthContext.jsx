import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = 'https://enthusiastic-respect-production-3521.up.railway.app/api';
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

  // Allow session transfer via URL parameter (e.g. from wallet browser → regular browser)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('nova_token');
    const urlAddress = params.get('nova_address');
    if (urlToken && urlAddress) {
      localStorage.setItem('nova_token', urlToken);
      localStorage.setItem('nova_address', urlAddress);
      setToken(urlToken);
      setAddress(urlAddress);
      // Clean the URL so the token isn't visible / shareable
      const clean = new URL(window.location.href);
      clean.searchParams.delete('nova_token');
      clean.searchParams.delete('nova_address');
      window.history.replaceState({}, '', clean.toString());
    }
  }, []);

  const _doAuth = useCallback(async (walletAddress, signFn) => {
    const nonceRes = await fetch(`${API}/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress })
    });
    if (!nonceRes.ok) {
      const errText = await nonceRes.text().catch(() => nonceRes.statusText);
      throw new Error(`Nonce request failed (${nonceRes.status}): ${errText}`);
    }
    const nonceData = await nonceRes.json();
    if (!nonceData.message) throw new Error('No nonce message returned from server');
    
    const signature = await signFn(nonceData.message, walletAddress);
    
    const verifyRes = await fetch(`${API}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress, message: nonceData.message, signature })
    });
    if (!verifyRes.ok) {
      const errText = await verifyRes.text().catch(() => verifyRes.statusText);
      throw new Error(`Verify request failed (${verifyRes.status}): ${errText}`);
    }
    const verifyData = await verifyRes.json();
    if (!verifyData.token) throw new Error('No token returned from server');
    
    localStorage.setItem('nova_token', verifyData.token);
    localStorage.setItem('nova_address', walletAddress);
    setToken(verifyData.token);
    setAddress(walletAddress);
  }, []);

  const connectEvm = useCallback(async () => {
    setConnecting('evm');
    setError(null);
    let provider = null;
    if (window.ethereum?.providers?.length) {
      provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
    } else if (window.ethereum) {
      provider = window.ethereum;
    }
    if (!provider) {
      setError('No EVM wallet detected');
      setConnecting(null);
      return;
    }
    try {
      setError('Step 1/3: Requesting wallet access…');
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      setError(`Step 2/3: Signing message for ${walletAddress.slice(0,6)}…`);
      await _doAuth(walletAddress, (msg, addr) =>
        provider.request({ method: 'personal_sign', params: [msg, addr] })
      );
      setError(null);
    } catch (err) {
      setError(err.message || 'EVM connection failed');
    } finally {
      setConnecting(null);
    }
  }, [_doAuth]);

  const connectSolana = useCallback(async () => {
    setConnecting('solana');
    setError(null);
    const solana = window.phantom?.solana?.isPhantom ? window.phantom.solana
                 : window.solana?.isPhantom ? window.solana
                 : null;
    if (!solana) {
      setError('Phantom not detected');
      setConnecting(null);
      return;
    }
    try {
      setError('Step 1/3: Connecting to Phantom…');
      const resp = await solana.connect();
      const walletAddress = resp.publicKey.toString();
      setError(`Step 2/3: Signing message for ${walletAddress.slice(0,6)}…`);
      await _doAuth(walletAddress, async (msg) => {
        const encoded = new TextEncoder().encode(msg);
        const { signature } = await solana.signMessage(encoded, 'utf8');
        return Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
      });
      setError(null);
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