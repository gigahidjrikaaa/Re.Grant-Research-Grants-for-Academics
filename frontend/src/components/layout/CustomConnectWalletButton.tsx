// frontend/src/components/layout/CustomConnectWalletButton.tsx
'use client';

import Image from 'next/image'; // Import the Image component
import React, { useEffect, useState } from 'react'; // Added useEffect and useState
import { useAccount, useDisconnect as useWagmiDisconnect } from 'wagmi';
import { useWallet as useMeshSDKWallet } from '@meshsdk/react';
import { IMeshWallet } from '@/contexts/WalletProviderContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Wallet as WalletIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAppWalletProvider } from '@/contexts/WalletProviderContext';
import { WalletProviderType } from '@/lib/wallet-providers/types';
import { shortenAddress } from '@/lib/utils';
import { useConnectModal as useRainbowConnectModalHook } from '@rainbow-me/rainbowkit'; // Renamed to avoid confusion in this component

const CustomConnectWalletButton: React.FC = () => {
  const { address: evmAddress, isConnected: isEvmConnected, connector: evmConnector } = useAccount();
  const { disconnect: disconnectEvm } = useWagmiDisconnect();

  const {
    connected: isCardanoConnected,
    name: cardanoWalletName,
    disconnect: disconnectCardanoWallet,
  } = useMeshSDKWallet();

  const {
    activeProviderType,
    setActiveProviderType,
    initiateMeshJSConnection,
    getMeshAvailableWallets,
  } = useAppWalletProvider();

  // Get the modal hook function from RainbowKit
  // This hook itself should be fine to call, but openRainbowModal might be undefined
  // if RainbowKitProvider is not an ancestor.
  const { openConnectModal: openRainbowModal } = useRainbowConnectModalHook();

  const meshAvailableWallets = getMeshAvailableWallets();

  // State to ensure modal is opened after provider is set
  const [shouldOpenRainbowModal, setShouldOpenRainbowModal] = useState(false);

  useEffect(() => {
    if (shouldOpenRainbowModal && activeProviderType === WalletProviderType.RainbowKit && openRainbowModal) {
      openRainbowModal();
      setShouldOpenRainbowModal(false); // Reset
    } else if (shouldOpenRainbowModal && activeProviderType === WalletProviderType.RainbowKit && !openRainbowModal) {
      // This case indicates RainbowKitProvider might not be ready yet, or hook issue
      console.error("CustomConnectWalletButton: Tried to open Rainbow modal, but openConnectModal is still not available. Provider rendering issue?");
      setShouldOpenRainbowModal(false); // Reset to prevent loops
    }
  }, [shouldOpenRainbowModal, activeProviderType, openRainbowModal]);


  const handleConnectRainbowKit = () => {
    setActiveProviderType(WalletProviderType.RainbowKit);
    // Instead of calling openRainbowModal immediately, set a state
    // that an effect will pick up once RainbowKitProvider is hopefully rendered.
    setShouldOpenRainbowModal(true);
  };

  const handleConnectXellarKit = () => {
    setActiveProviderType(WalletProviderType.XellarKit);
    console.warn("Xellar Kit connection logic not yet implemented.");
    // Similar effect-based approach for Xellar if it has an async modal opening
  };

  const handleConnectMeshJS = async (walletName: string) => {
    setActiveProviderType(WalletProviderType.MeshJS);
    await initiateMeshJSConnection(walletName);
  };

  const handleDisconnect = () => {
    if (isEvmConnected && (activeProviderType === WalletProviderType.RainbowKit || activeProviderType === WalletProviderType.XellarKit)) {
      disconnectEvm();
    }
    if (isCardanoConnected && activeProviderType === WalletProviderType.MeshJS) {
      disconnectCardanoWallet();
    }
    setActiveProviderType(WalletProviderType.None);
  };

  // ... (rest of the JSX rendering logic remains the same as your last provided version) ...
  if (isEvmConnected && evmAddress && (activeProviderType === WalletProviderType.RainbowKit || activeProviderType === WalletProviderType.XellarKit) ) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            {shortenAddress(evmAddress)} ({evmConnector?.name || activeProviderType})
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connected ({activeProviderType})</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isCardanoConnected && cardanoWalletName && activeProviderType === WalletProviderType.MeshJS) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            {cardanoWalletName} (Cardano)
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connected (Cardano)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Connect Lisk (EVM)</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleConnectRainbowKit} className="cursor-pointer">
            <WalletIcon className="mr-2 h-4 w-4 opacity-70" />
            Browser & Mobile Wallets
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleConnectXellarKit} disabled className="cursor-not-allowed">
            <WalletIcon className="mr-2 h-4 w-4 opacity-70" />
            Social Login (Xellar)
            <span className="ml-auto text-xs text-muted-foreground">Soon</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Connect Cardano</DropdownMenuLabel>
        <DropdownMenuGroup>
          {meshAvailableWallets && meshAvailableWallets.length > 0 ? (
            meshAvailableWallets.map((wallet: IMeshWallet) => (
              <DropdownMenuItem key={wallet.name} onClick={() => handleConnectMeshJS(wallet.name)} className="cursor-pointer">
                <Image src={wallet.icon} alt={`${wallet.name} icon`} className="mr-2 h-4 w-4" width={16} height={16} />
                {wallet.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No Cardano wallets found</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomConnectWalletButton;