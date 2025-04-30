// src/app/providers.tsx
'use client';

import * as React from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { MeshProvider } from "@meshsdk/react";
import { wagmiConfig } from '@/lib/wagmi'; // Import config from lib

// Custom hook to ensure component is mounted (prevents hydration errors)
function useIsMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

// Define the custom theme based on the style guide
const regrantTheme = darkTheme({
    accentColor: '#1E3A8A', // Primary Blue
    accentColorForeground: '#FFFFFF', // White text on accent
    borderRadius: 'medium',
    fontStack: 'system', // Uses system fonts (like Inter if configured)
    overlayBlur: 'small',
    // You can customize further: colors for connect button, modals etc.
    // See: https://www.rainbowkit.com/docs/theming
});


export function Providers({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    // Render nothing or a loading indicator on the server/initial render
    // This prevents hydration mismatches with client-only wallet state
    return null;
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        modalSize="compact"
        theme={regrantTheme} // Apply custom theme
        appInfo={{
          appName: 'Re.grant',
        }}
      >
        {/* MeshProvider for Cardano */}
        <MeshProvider>
          {children}
        </MeshProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
