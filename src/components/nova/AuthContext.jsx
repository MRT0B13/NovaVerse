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

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or a compatible wallet.');
      setConnecting(false);
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      
      const nonceRes = await fetch(`${API}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });
      const { message } = await nonceRes.json();
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      
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
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, []);

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
    <AuthContext.Provider value={{ token, address, truncatedAddress, connecting, error, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}