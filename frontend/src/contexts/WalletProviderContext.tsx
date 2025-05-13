// frontend/src/contexts/WalletProviderContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { WalletProviderType } from '@/lib/wallet-providers/types';
// DO NOT import useRainbowConnectModal here
// For MeshJS, connection and available wallets
import { useWallet as useMeshSDKWallet, useWalletList } from '@meshsdk/react';

// Define our own wallet interface since Wallet type is not exported
export interface IMeshWallet {
  name: string;
  icon: string;
  // Add other properties if needed
}

export interface WalletContextType {
  activeProviderType: WalletProviderType;
  setActiveProviderType: (type: WalletProviderType) => void;
  // connectWithRainbowKit will be initiated by the button which has the hook
  // connectWithXellarKit will be initiated by the button
  initiateMeshJSConnection: (walletName: string) => Promise<void>;
  getMeshAvailableWallets: () => IMeshWallet[]; // Use the imported IMeshWallet type
  // Disconnect is better handled directly in the UI component using Wagmi's useDisconnect
  // or Mesh's disconnect to ensure proper context.
  // We can keep a generic setActiveProviderType(WalletProviderType.None) for UI state.
}

const WalletProviderContext = createContext<WalletContextType | undefined>(undefined);

// Renamed hook for clarity and to avoid conflict if you have another useWalletProvider
export const useAppWalletProvider = (): WalletContextType => {
  const context = useContext(WalletProviderContext);
  if (!context) {
    throw new Error('useAppWalletProvider must be used within a CombinedWalletProvider');
  }
  return context;
};

interface CombinedWalletProviderProps {
  children: ReactNode;
  initialProviderType?: WalletProviderType;
}

export const CombinedWalletProvider: React.FC<CombinedWalletProviderProps> = ({
  children,
  initialProviderType = WalletProviderType.None,
}) => {
  const [activeProviderType, setActiveProviderTypeState] = useState<WalletProviderType>(initialProviderType);

  // MeshJS hooks can be initialized here as MeshProvider is higher up or at the same level
  const { connect: connectMeshWalletSDK } = useMeshSDKWallet();
  const meshAvailableWalletsSDK = useWalletList();

  const setActiveProviderType = useCallback((type: WalletProviderType) => {
    console.log("Setting active provider type to:", type);
    setActiveProviderTypeState(type);
  }, []);

  const initiateMeshJSConnection = useCallback(async (walletName: string) => {
    // activeProviderType will be set by the calling component (CustomConnectWalletButton)
    try {
      await connectMeshWalletSDK(walletName);
      console.log(`MeshJS: Successfully initiated connection to ${walletName}`);
    } catch (error) {
      console.error(`Failed to connect with MeshJS wallet ${walletName}:`, error);
    }
  }, [connectMeshWalletSDK]);

  const getMeshAvailableWallets = useCallback((): IMeshWallet[] => {
    return meshAvailableWalletsSDK || [];
  }, [meshAvailableWalletsSDK]);

  return (
    <WalletProviderContext.Provider value={{
      activeProviderType,
      setActiveProviderType,
      initiateMeshJSConnection,
      getMeshAvailableWallets,
    }}>
      {children}
    </WalletProviderContext.Provider>
  );
};