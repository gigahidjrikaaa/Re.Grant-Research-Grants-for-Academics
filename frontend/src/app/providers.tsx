// src/app/providers.tsx
'use client';

import React from 'react';
import { Config, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { XellarKitProvider, defaultConfig as xellarDefaultConfig, darkTheme as xellarDarkTheme } from '@xellar/kit';
import { MeshProvider } from "@meshsdk/react"; // Keep if Cardano part is still active
import { supportedChains } from '@/lib/chains'; // Import your chains
import { polygonAmoy } from 'viem/chains';

// Ensure environment variables are handled (ideally, check them here or log for debugging)
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID || "";
const xellarEnv = process.env.NEXT_PUBLIC_XELLAR_ENV === 'production' ? 'production' : 'sandbox';

if (!walletConnectProjectId) {
    console.warn("Providers.tsx: WalletConnect Project ID (NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) not found.");
}
if (!xellarAppId) {
    console.warn("Providers.tsx: Xellar App ID (NEXT_PUBLIC_XELLAR_APP_ID) not found.");
}

console.log("--- Xellar Config Inputs ---");
console.log("WalletConnect Project ID:", walletConnectProjectId); // Should be your WC ID string
console.log("Xellar App ID:", xellarAppId); // Should be your Xellar App ID string
console.log("Xellar Env:", xellarEnv); // Should be 'sandbox' or 'production'
console.log("Chains:", JSON.stringify(supportedChains, null, 2));
console.log("--- End Xellar Config Inputs ---");

const config = xellarDefaultConfig({
  appName: 'Regrant', // Your application's name
  walletConnectProjectId: "77dc0c61-e855-4e79-9335-53063de168b0", // From .env.local
  xellarAppId,            // From .env.local
  xellarEnv: "sandbox",              // 'sandbox' or 'production', from .env.local
  chains: [polygonAmoy],  // Your defined chains (e.g., [liskSepolia])
  ssr: false,                // For Next.js App Router
}) as Config; // Cast to Wagmi's Config type

const queryClient = new QueryClient();

// Custom hook to ensure component is mounted (prevents hydration errors)
function useIsMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    // Render nothing or a loading indicator on the server/initial render
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={xellarDarkTheme}>
          <MeshProvider>
            {children}
          </MeshProvider>
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}