// src/app/page.tsx
'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; // Removed useState, motion imports already in child components

// Import new landing page components
import HeroSection from '@/components/landing/HeroSection';
import WhatIsRegrantSection from '@/components/landing/sections/WhatIsRegrantSection';
import HowRegrantWorksSection from '@/components/landing/sections/HowRegrantWorksSection';
import IdrxInfoSection from '@/components/landing/sections/IdrxInfoSection';
import KeyBenefitsSection from '@/components/landing/sections/KeyBenefitsSection';
import LandingCtaSection from '@/components/landing/LandingCtaSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      router.push('/grants'); // Redirect to a relevant page after connection, e.g., dashboard or grants list
    }
  }, [isConnected, address, router]);

  // This loading/redirect state can remain if you want to prevent landing page view for connected users.
  if (isConnected) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-brand-background">
            <p className="text-text-secondary">Redirecting to Re.grant platform...</p>
            {/* Optionally, you could render null or a spinner, and layout.tsx handles the main app view */}
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-background text-text-primary">
      {/* The global Header is rendered by src/app/layout.tsx */}
      <main className="flex-grow">
        <HeroSection />
        <WhatIsRegrantSection />
        <HowRegrantWorksSection />
        <IdrxInfoSection />
        <KeyBenefitsSection />
        <LandingCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}