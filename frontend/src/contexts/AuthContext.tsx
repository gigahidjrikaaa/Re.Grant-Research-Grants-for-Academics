// frontend/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect as useWagmiDisconnect } from 'wagmi';
import { SiweMessage } from 'siwe'; // For constructing the SIWE message
import { useRouter } from 'next/navigation'; // Or next/router if using Pages Router
import { toast } from 'sonner'; // For notifications

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
  // chain is available from useAccount, no need for useNetwork
  const { signMessageAsync } = useSignMessage();
  const { disconnect: wagmiDisconnect } = useWagmiDisconnect();
  const router = useRouter();

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
      toast.error('Wallet not connected. Please connect your wallet first.');
      setIsLoading(false); // Ensure loading state is reset
      return;
    }
    setIsLoading(true);
    try {
      // 1. Get nonce from backend
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/siwe/nonce?wallet_address=${address}`);
      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        console.error("SIWE: Nonce response error text:", errorText);
        throw new Error(`Failed to fetch nonce: ${nonceResponse.status} ${nonceResponse.statusText}. Body: ${errorText}`);
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
        let errorDetail = `SIWE login failed: ${loginResponse.status} ${loginResponse.statusText}`;
        try {
          const errorData = await loginResponse.json();
          console.error("SIWE: Login response error data (JSON):", errorData);
          errorDetail += ` - ${errorData.detail || JSON.stringify(errorData)}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          const textError = await loginResponse.text();
          console.error("SIWE: Login response error data (text):", textError);
          errorDetail += ` - Body: ${textError}`;
        }
        throw new Error(errorDetail);
      }

        const { access_token }: { access_token: string } = await loginResponse.json();
        setToken(access_token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', access_token);
        }
        await fetchCurrentUser(access_token); // Fetch user data after successful login
        toast.success("Successfully signed in!");

    } catch (error) {
        console.error('SIWE login process error:', error);
        toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Check for Viem/Wagmi specific UserRejectedRequestError
      // Viem errors often have a 'name' property.
      if (
        typeof error === 'object' && 
        error !== null && 
        (('name' in error && error.name === 'UserRejectedRequestError') || 
         ('message' in error && typeof error.message === 'string' && error.message.includes('User rejected the request')))
      ) {
        console.log("SIWE login cancelled by user.");
        toast.info("Sign-in request was cancelled.");
        // No need to clear token/user here as they wouldn't have been set yet in this flow
      } else if (error instanceof Error) { // Handle other Error instances
        console.error('SIWE login process error (general):', error.message);
        toast.error(`Login failed: ${error.message}`);
        setUser(null); // Clear user/token on other errors
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      } else { // Handle non-Error exceptions if any
        console.error('SIWE login process error (unknown type):', error);
        toast.error("An unexpected error occurred during login.");
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
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
    router.push('/'); // Redirect to home or login page
  }, [wagmiDisconnect , router]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isLoading, isAuthenticated, loginWithSiwe, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};