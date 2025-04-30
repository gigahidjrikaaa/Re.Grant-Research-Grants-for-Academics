// src/components/layout/Header.tsx
'use client';

import { CardanoWallet } from '@meshsdk/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          {/* Placeholder for Logo/Brand */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block text-primary-blue"> {/* Use Primary Blue */}
              Re.grant
            </span>
          </Link>
          {/* Add main navigation links here if needed */}
          {/* <nav className="flex items-center gap-6 text-sm">
             <Link href="/grants" className="text-foreground/60 transition-colors hover:text-foreground/80">
               Grants
             </Link>
           </nav> */}
        </div>
        {/* Add mobile navigation toggle here later */}
        {/* <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
           <svg>...</svg> <span className="sr-only">Toggle Menu</span>
         </button> */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {/* RainbowKit Connect Button */}
            <ConnectButton
              label="Connect Wallet"
              accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
              chainStatus={{ smallScreen: 'icon', largeScreen: 'full' }}
              showBalance={{ smallScreen: false, largeScreen: true }}
            />
            {/* Add Cardano Connect Button here later if needed */}
            <div className="ml-2"> <CardanoWallet /> </div>
          </nav>
        </div>
      </div>
    </header>
  );
}