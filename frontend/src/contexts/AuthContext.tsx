// frontend/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect as useWagmiDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe'; // For constructing the SIWE message
// import { useRouter } from 'next/navigation'; // Or next/router if using Pages Router

// Define what your backend's user object looks like after authentication
// This should align with your FastAPI schemas.User
interface AuthenticatedUser {
  id: number;
  wallet_address: string;
  email?: string;
  full_name?: string;
  role: 'student' | 'researcher' | 'admin';
  is_active: boolean;
  is_superuser: boolean;
  created_at: string; // or Date
  updated_at?: string; // or Date
}

interface AuthContextType {
  token: string | null;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithSiwe: () => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>; // To fetch user data after initial login or on app load
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'; // Ensure your backend URL is correct

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  });
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to load initial state

  const { address, chain, isConnected } = useAccount();
  // const { chain: currentChain } = useNetwork(); // To get chainId for SIWE message - chain is available from useAccount
  const { signMessageAsync } = useSignMessage();
  const { disconnect: wagmiDisconnect } = useWagmiDisconnect();
//   const router = useRouter();

  const fetchCurrentUser = useCallback(async (currentToken?: string) => {
    const activeToken = currentToken || token;
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // This endpoint needs to be created in your FastAPI backend (e.g., /users/me)
      // and protected by JWT authentication.
      const response = await fetch(`${API_BASE_URL}/users/me`, { // Assuming /users/me endpoint
        headers: {
          'Authorization': `Bearer ${activeToken}`,
        },
      });
      if (response.ok) {
        const userData: AuthenticatedUser = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch current user, status:', response.status);
        // Token might be invalid or expired
        setToken(null);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Effect to load user data if token exists on mount
  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false); // No token, so not loading user
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only run when token changes initially

  const loginWithSiwe = async () => {
    if (!isConnected || !address || !chain) {
      console.error('Wallet not connected, address or chainId missing for SIWE.');
      alert('Please connect your wallet first.');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Get nonce from backend
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/siwe/nonce?wallet_address=${address}`);
      if (!nonceResponse.ok) {
        throw new Error(`Failed to fetch nonce: ${nonceResponse.statusText}`);
      }
      const { nonce } = await nonceResponse.json();

      // 2. Create SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to Re.Grant.',
        uri: window.location.origin,
        version: '1',
        chainId: chain.id, // Use chain.id from useAccount
        nonce: nonce,
        issuedAt: new Date().toISOString(), // Optional: automatically set by siwe.js
      });
      const messageToSign = siweMessage.prepareMessage();

      // 3. Sign message
      const signature = await signMessageAsync({ message: messageToSign });

      // 4. Send message, signature, address, nonce to backend for login
      const loginResponse = await fetch(`${API_BASE_URL}/auth/siwe/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSign,
          signature,
          address,
          nonce,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(`SIWE login failed: ${errorData.detail || loginResponse.statusText}`);
      }

      const { access_token }: { access_token: string } = await loginResponse.json();
      setToken(access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', access_token);
      }
      await fetchCurrentUser(access_token); // Fetch user data after successful login

    } catch (error) {
      console.error('SIWE login process error:', error);
      // alert(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log("Logging out...");
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    wagmiDisconnect(); // Disconnect wallet via Wagmi
    // Optionally, call a backend /logout endpoint if it invalidates server-side sessions/tokens
    // router.push('/'); // Redirect to home or login page
  }, [wagmiDisconnect /*, router */]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isLoading, isAuthenticated, loginWithSiwe, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};