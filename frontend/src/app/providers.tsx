// src/app/providers.tsx
'use client';

import React, { ReactNode } from 'react'; // Removed useState, useEffect if not directly used here
import { WagmiProvider, type Config as WagmiConfigType } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme as rainbowDarkTheme, type Theme as RainbowTheme } from '@rainbow-me/rainbowkit';
import { MeshProvider } from "@meshsdk/react";

import { wagmiConfig as rainbowWagmiConfig } from '@/lib/wagmi'; // Your primary/default Wagmi config
// Placeholder for Xellar's Wagmi config, if it needs a *separate* instance:
// import { wagmiConfig as xellarWagmiConfig } from '@/lib/xellarWagmiConfig';

import { CombinedWalletProvider, useAppWalletProvider } from '@/contexts/WalletProviderContext';
import { WalletProviderType } from '@/lib/wallet-providers/types';
import XellarKitWalletProviderWrapper from '@/lib/wallet-providers/XellarKitWalletProvider';
import { AuthProvider } from '@/contexts/AuthContext';

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

// This component will now primarily handle rendering the UI Kit providers (Rainbow, Xellar)
// It assumes WagmiProvider is already an ancestor.
const KitSpecificUIProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeProviderType } = useAppWalletProvider();

  if (activeProviderType === WalletProviderType.RainbowKit) {
    return (
      <RainbowKitProvider theme={regrantRainbowTheme} modalSize="compact">
        {/* The openConnectModal hook will be called directly from CustomConnectWalletButton */}
        {children}
      </RainbowKitProvider>
    );
  }

  if (activeProviderType === WalletProviderType.XellarKit) {
    return (
      <XellarKitWalletProviderWrapper>
        {children}
      </XellarKitWalletProviderWrapper>
    );
  }

  // For MeshJS or if no specific EVM UI kit is active, just render children
  // MeshProvider will be handled separately or at a different level if it conflicts.
  return <>{children}</>;
};


export function Providers({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  // Determine which Wagmi config to use. For now, it's always rainbowWagmiConfig.
  // When Xellar is ready, and if it REQUIRES a different Wagmi config instance,
  // this logic would need to be smarter, potentially by having CombinedWalletProvider
  // also manage the activeWagmiConfig.
  // For now, assume one primary Wagmi config for EVM.
  const currentWagmiConfig: WagmiConfigType = rainbowWagmiConfig;

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={currentWagmiConfig} reconnectOnMount={true}>
        {/* AuthProvider uses Wagmi hooks, so it MUST be inside WagmiProvider */}
        <AuthProvider>
          {/* CombinedWalletProvider manages which UI kit is conceptually active */}
          <CombinedWalletProvider initialProviderType={WalletProviderType.None}>
            {/* KitSpecificUIProviders renders the actual UI Kit (Rainbow, Xellar) */}
            <KitSpecificUIProviders>
                {/* MeshProvider for Cardano - can be here if it doesn't conflict,
                    or moved inside a conditional block if needed */}
                <MeshProvider>
                    {children}
                </MeshProvider>
            </KitSpecificUIProviders>
          </CombinedWalletProvider>
        </AuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}