// src/components/layout/Header.tsx
'use client';

// import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'; // Remove or comment out
// import { ConnectButton as XellarConnectButton } from '@xellar/kit'; // Import Xellar's ConnectButton
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import CustomConnectWalletButton from './CustomConnectWalletButton';

// Logo component (remains the same)
const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary-blue-hsl)" /> {/* Use themed color */}
          <stop offset="100%" stopColor="oklch(0.6 0.2 250)" /> {/* Example OKLCH blue */}
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#logoGradientHeader)" />
      <path d="M30,50 Q40,20 50,50 T70,50" fill="none" stroke="var(--primary-foreground)" strokeWidth="5" /> {/* Use themed color */}
    </svg>
);

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-input bg-content-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <Logo />
            <span className="font-bold text-lg text-primary-blue"> {/* Use Primary Blue from your theme */}
              <span className='text-primary-foreground rounded-xs pb-0.5 px-0.5 bg-primary-blue'>Re.</span>grant
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             <Link href="/grants" className="text-text-secondary hover:text-text-primary">
               Grants
             </Link>
             <Link href="/apply" className="text-text-secondary hover:text-text-primary">
               Apply
             </Link>
           </nav>
        </div>

        <div className="flex items-center space-x-3">
           <div className="flex-shrink-0">
             <CustomConnectWalletButton /> {/* Use the new custom button */}
           </div>
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             aria-label="Toggle Menu"
           >
             <Menu className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </header>
  );
}