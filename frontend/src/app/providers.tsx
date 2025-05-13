// src/app/providers.tsx
'use client';

import React from 'react';
import { WagmiProvider, Config as WagmiConfigType } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme as rainbowDarkTheme, Theme as RainbowTheme } from '@rainbow-me/rainbowkit';
import { MeshProvider } from "@meshsdk/react";

import { wagmiConfig as rainbowWagmiConfig } from '@/lib/wagmi'; // Your RainbowKit-based wagmi config
// Placeholder for Xellar's Wagmi config:
// import { wagmiConfig as xellarWagmiConfig } from '@/lib/xellarWagmiConfig';

import { CombinedWalletProvider, useAppWalletProvider } from '@/contexts/WalletProviderContext'; // Use renamed hook
import { WalletProviderType } from '@/lib/wallet-providers/types';
import XellarKitWalletProviderWrapper from '@/lib/wallet-providers/XellarKitWalletProvider'; // Your wrapper

function useIsMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

const regrantRainbowTheme = {
  ...rainbowDarkTheme({
    accentColor: 'hsl(var(--primary))',
    accentColorForeground: 'hsl(var(--primary-foreground))',
    borderRadius: 'medium',
  }),
} as RainbowTheme;

const queryClient = new QueryClient();

// This inner component selects the actual wallet kit provider based on context
const WalletSystemProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProviderType } = useAppWalletProvider(); // Use renamed hook

  // Determine which Wagmi config to use.
  // When Xellar is integrated, this logic will choose between rainbowWagmiConfig and xellarWagmiConfig.
  const currentWagmiConfig: WagmiConfigType = rainbowWagmiConfig; // Default to RainbowKit's Wagmi config
  // if (activeProviderType === WalletProviderType.XellarKit && xellarWagmiConfig) {
  //   currentWagmiConfig = xellarWagmiConfig;
  // }

  // Conditionally render providers
  if (activeProviderType === WalletProviderType.RainbowKit) {
    return (
      <WagmiProvider config={currentWagmiConfig} reconnectOnMount={true}> {/* Or manage reconnect based on actual connection state */}
        <RainbowKitProvider theme={regrantRainbowTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    );
  }

  if (activeProviderType === WalletProviderType.XellarKit) {
    return (
      <WagmiProvider config={currentWagmiConfig} reconnectOnMount={true}> {/* This will use xellarWagmiConfig when ready */}
        <XellarKitWalletProviderWrapper> {/* This wrapper will contain the actual <XellarKitProvider> */}
          {children}
        </XellarKitWalletProviderWrapper>
      </WagmiProvider>
    );
  }

  if (activeProviderType === WalletProviderType.MeshJS) {
    return (
      <MeshProvider>
        {children}
      </MeshProvider>
    );
  }

  // Fallback: If no specific provider is active (WalletProviderType.None),
  // provide a base WagmiProvider context so Wagmi hooks don't break before a connection attempt.
  // It uses the default (RainbowKit's) config, but no kit-specific UI provider is active.
  return (
    <WagmiProvider config={rainbowWagmiConfig} reconnectOnMount={true}> {/* Default for EVM */}
      {children}
    </WagmiProvider>
  );
};


export function Providers({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CombinedWalletProvider initialProviderType={WalletProviderType.None}>
        <WalletSystemProviders>
            {children}
        </WalletSystemProviders>
      </CombinedWalletProvider>
    </QueryClientProvider>
  );
}