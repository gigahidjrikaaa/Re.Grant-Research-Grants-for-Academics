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
import { Wallet as WalletIcon, LogOut, ChevronDown, UserCheck, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useAppWalletProvider } from '@/contexts/WalletProviderContext';
import { WalletProviderType } from '@/lib/wallet-providers/types';
import { shortenAddress } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { toast } from 'sonner';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const CustomConnectWalletButton: React.FC = () => {
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  // We're not using disconnectEvm directly as appLogout handles wallet disconnection
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

  const { loginWithSiwe, user: authenticatedUser, isAuthenticated, isLoading: isAuthLoading, logout: appLogout } = useAuth();
  const meshAvailableWallets = getMeshAvailableWallets();

  const { openConnectModal: openRainbowModalFromHook, connectModalOpen } = useConnectModal(); // Get connectModalOpen state
  const [isAttemptingRainbowConnect, setIsAttemptingRainbowConnect] = useState(false);

  // Automatically attempt SIWE login after EVM wallet connection if not already authenticated
  useEffect(() => {
    if (isEvmConnected && evmAddress && !isAuthenticated && !isAuthLoading &&
        (activeProviderType === WalletProviderType.RainbowKit || activeProviderType === WalletProviderType.XellarKit)) {
      console.log("CustomConnectWalletButton: Wallet connected via EVM kit, attempting SIWE login...");
      loginWithSiwe();
    }
  }, [isEvmConnected, evmAddress, isAuthenticated, isAuthLoading, loginWithSiwe, activeProviderType]);

  const handleConnectRainbowKit = () => {
    setActiveProviderType(WalletProviderType.RainbowKit);
    setIsAttemptingRainbowConnect(true);
  };

  useEffect(() => {
    if (
      isAttemptingRainbowConnect &&
      activeProviderType === WalletProviderType.RainbowKit &&
      openRainbowModalFromHook && // Ensure the function is available
      !connectModalOpen // Ensure modal is not already open
    ) {
      console.log("Effect: Opening RainbowKit modal...");
      openRainbowModalFromHook();
      setIsAttemptingRainbowConnect(false); // Reset the attempt flag
    }
  }, [
    isAttemptingRainbowConnect,
    activeProviderType,
    openRainbowModalFromHook,
    connectModalOpen, // Add connectModalOpen to dependency array
  ]);

  const handleConnectXellarKit = () => {
    setActiveProviderType(WalletProviderType.XellarKit);
    console.warn("Xellar Kit connection logic not yet implemented.");
    toast.error("Xellar Kit connection is not yet implemented.");
  };

  const handleConnectMeshJS = async (walletName: string) => {
    setActiveProviderType(WalletProviderType.MeshJS);
    await initiateMeshJSConnection(walletName);
  };

  const handleWalletDisconnect = () => {
    if (isEvmConnected && (activeProviderType === WalletProviderType.RainbowKit || activeProviderType === WalletProviderType.XellarKit)) {
      disconnectEvm(); // This will trigger wagmi's disconnect, AuthContext's logout also calls this.
    }
    if (isCardanoConnected && activeProviderType === WalletProviderType.MeshJS) {
      disconnectCardanoWallet();
    }
    setActiveProviderType(WalletProviderType.None);
    // Note: If the user was authenticated, appLogout() should be called instead to clear session.
  };

  // Display authenticated user info if available
  if (isAuthenticated && authenticatedUser && evmAddress === authenticatedUser.wallet_address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center border-green-500">
            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
            {shortenAddress(authenticatedUser.wallet_address)}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Authenticated ({authenticatedUser.role})</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={appLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If EVM wallet is connected but not yet authenticated with backend (SIWE pending or failed)
  if (isEvmConnected && evmAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center border-orange-500">
            <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
             {shortenAddress(evmAddress)} (Verify)
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
          <DropdownMenuItem onClick={loginWithSiwe} className="cursor-pointer">
            Sign In to Re.Grant
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* This button should just disconnect the wallet, not the app session */}
          <DropdownMenuItem onClick={handleWalletDisconnect} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Cardano connected state (separate from SIWE for now)
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
          <DropdownMenuItem onClick={handleWalletDisconnect} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default: "Connect Wallet" button
  return (
    <DropdownMenu>
      {/* ... (same DropdownMenu for connection options as before) ... */}
       <DropdownMenuTrigger asChild>
        <Button disabled={isAuthLoading}>
          {isAuthLoading ? 'Authenticating...' : <><WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet</>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Connect Lisk (EVM)</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleConnectRainbowKit} className="cursor-pointer" disabled={isAuthLoading}>
            <WalletIcon className="mr-2 h-4 w-4 opacity-70" />
            Browser & Mobile Wallets
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleConnectXellarKit} disabled className="cursor-not-allowed" title="Xellar Kit Integration Pending">
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
              <DropdownMenuItem key={wallet.name} onClick={() => handleConnectMeshJS(wallet.name)} className="cursor-pointer" disabled={isAuthLoading}>
                <Image src={wallet.icon} alt={`${wallet.name} icon`} width={16} height={16} className="mr-2 h-4 w-4" />
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