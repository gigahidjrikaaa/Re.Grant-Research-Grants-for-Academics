// src/components/layout/Header.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming Shadcn Button
import { Menu } from 'lucide-react'; // Icon for mobile menu toggle

// Placeholder Logo component or SVG
const Logo = () => (
    // Replace with your actual SVG logo or image component
    <svg height="24" width="24" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#1E3A8A" strokeWidth="5" fill="none" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fill="#1E3A8A" fontWeight="bold">R</text>
    </svg>
);


export default function Header() {
  // State for mobile menu (implement later if needed)
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      {/* Use bg-white for a cleaner look, adjusted transparency */}
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"> {/* Increased height slightly */}
        {/* Left Section: Logo and Desktop Nav */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Logo />
            <span className="font-bold text-lg text-primary-blue"> {/* Use Primary Blue */}
              Re.grant
            </span>
          </Link>
          {/* Desktop Navigation (Hidden on mobile) */}
          {/* Add key navigation items here if needed, e.g., Grants, Apply */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             <Link href="/grants" className="text-gray-600 hover:text-gray-900">
               Grants
             </Link>
             <Link href="/apply" className="text-gray-600 hover:text-gray-900">
               Apply
             </Link>
           </nav>
        </div>

        {/* Right Section: Wallet Connector & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
           {/* Wallet Connect Button */}
           <div className="flex-shrink-0">
             <ConnectButton
                label="Connect Wallet"
                accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
                chainStatus={{ smallScreen: 'icon', largeScreen: 'full' }}
                showBalance={{ smallScreen: false, largeScreen: true }}
             />
           </div>

           {/* Mobile Menu Button (Hidden on desktop) */}
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Add state later
             aria-label="Toggle Menu"
           >
             <Menu className="h-5 w-5" />
           </Button>
        </div>
      </div>
      {/* Mobile Menu Panel (Implement later if needed) */}
      {/* {isMobileMenuOpen && (
         <div className="md:hidden border-t">
           <nav className="flex flex-col space-y-2 p-4">
              Add mobile nav links here
           </nav>
         </div>
       )} */}
    </header>
  );
}