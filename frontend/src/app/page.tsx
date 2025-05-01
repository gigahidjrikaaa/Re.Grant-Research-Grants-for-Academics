// src/app/page.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, CheckCircle, Users, FileText, Briefcase } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';

export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  // Redirect authenticated users away from the landing page
  // (Adjust '/grants' to your desired default authenticated route)
  useEffect(() => {
    if (isConnected && address) {
      router.push('/grants'); // Redirect to the main app area
    }
  }, [isConnected, address, router]);

  // If already connected, maybe show a minimal loading or redirecting state
  if (isConnected) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-white to-blue-50">
              <p className="text-gray-600">Redirecting to the platform...</p>
              {/* Optional: Add a spinner */}
          </div>
      );
  }

  // Render landing page content if not connected
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="relative flex-grow flex items-center justify-center px-4 py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-blue-100 overflow-hidden">
      {/* Animated Background Decorations */}
      {/* These divs create soft, moving circles behind the main content */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-pulse animate-move-around bg-decoration-1"
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 sm:w-104 sm:h-104 bg-sky-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse animate-move-around bg-decoration-2"
      ></div>
       <div
        className="absolute top-10 right-1/5 w-64 h-64 sm:w-80 sm:h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-lg opacity-45 animate-pulse animate-move-around bg-decoration-3"
      ></div>

      {/* Hero Content (ensure it's above the decorations) */}
      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block xl:inline">Empowering Research with</span>{' '}
        <span className="block text-primary-blue xl:inline">Transparent Funding</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Re.grant leverages Lisk L2 blockchain technology to bring efficiency, transparency, and accessibility to research grant management and collaboration within the Department of Electrical and Information Engineering.
        </p>
        <div className="mt-8 flex justify-center">
         {/* Connect button acts as the primary call to action */}
         <ConnectButton
          label="Connect EVM Wallet & Get Started"
          showBalance={false}
          chainStatus="none"
         />
        </div>
      </div>
      </main>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feature 1: Grants */}
        <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-center mb-4">
           <FileText className="h-10 w-10 text-primary-blue" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Transparent Grants</h3>
          <p className="text-gray-600">Apply for and manage research grants with automated, auditable funding disbursements on the blockchain using IDRX.</p>
        </div>
        {/* Feature 2: Talent Pool */}
        <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50 hover:shadow-md transition-shadow duration-300">
           <div className="flex justify-center mb-4">
           <Users className="h-10 w-10 text-primary-blue" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Talent Pool</h3>
          <p className="text-gray-600">Discover and connect with skilled students and lecturers within the department for research collaboration.</p>
        </div>
        {/* Feature 3: Project Board */}
        <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50 hover:shadow-md transition-shadow duration-300">
           <div className="flex justify-center mb-4">
           <Briefcase className="h-10 w-10 text-primary-blue" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Project Board</h3>
          <p className="text-gray-600">Post specific project needs or find opportunities to contribute your expertise to ongoing research.</p>
        </div>
        </div>
      </div>
      </section>

      {/* IDRX Section - Enhanced UI */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-50 via-sky-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Logo with subtle animation/effect */}
        <div className="flex-shrink-0 transform transition duration-500 hover:scale-105">
          <Image
            src="/idrx-logo.png"
            alt="IDRX Logo"
            width={160} // Slightly larger for emphasis
            height={80} // Adjust height proportionally
            className="drop-shadow-md" // Add subtle shadow
          />
        </div>
        {/* Text Content */}
        <div className="text-center lg:text-left max-w-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Powered by <span className="text-primary-blue">IDRX</span>: Stable & Transparent Funding
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            IDRX, a stablecoin pegged to the Indonesian Rupiah, ensures efficient and auditable grant disbursements on the Lisk L2 blockchain. All funding transactions within Re.grant utilize IDRX for secure value transfer.
          </p>
          <a
            href="https://home.idrx.co/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-blue font-medium hover:text-blue-700 transition-colors duration-300 group"
          >
            Learn More about IDRX
            <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
          </div>
        </div>
      </section>

      {/* Accessing Funds Section - Enhanced UI */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Seamlessly Access Your Funds</h2>
        <p className="text-lg text-gray-600">
          Convert your IDRX grant funds into Indonesian Rupiah (IDR) easily, enabling you to utilize your funding effectively for research needs.
        </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Step 1: Receiving Funds */}
        <div className="bg-gray-50/70 p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center transition duration-300 hover:shadow-lg hover:border-blue-200">
          <div className="p-4 bg-blue-100 rounded-full mb-5">
             {/* Using CheckCircle as a placeholder for receiving/success */}
            <CheckCircle className="h-8 w-8 text-primary-blue" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">Receive Grants in IDRX</h3>
          <p className="text-gray-600">
            Grant funds are securely disbursed directly to your connected wallet as IDRX stablecoins via the Re.grant platform&apos;s smart contracts.
          </p>
        </div>

        {/* Step 2: Converting to IDR */}
        <div className="bg-gray-50/70 p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center transition duration-300 hover:shadow-lg hover:border-blue-200">
          <div className="p-4 bg-blue-100 rounded-full mb-5">
             {/* Using ArrowRight or similar for conversion/exchange */}
            <ArrowRight className="h-8 w-8 text-primary-blue" /> {/* Placeholder, consider ArrowRightLeft or Repeat */}
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">Convert IDRX to IDR</h3>
          <p className="text-gray-600">
            Utilize supported cryptocurrency exchanges or financial platforms to easily convert your IDRX into Indonesian Rupiah for real-world spending.
          </p>
        </div>
          </div>

           {/* Optional: Add a concluding remark or link */}
           <div className="text-center mt-12 text-gray-500">
         <p>Manage your research funding with unprecedented ease and transparency.</p>
         {/*
         <div className="mt-4">
           <a href="/path-to-conversion-guide" className="inline-flex items-center text-primary-blue font-medium hover:underline">
             View Conversion Guide <ArrowRight className="ml-2 h-4 w-4" />
           </a>
         </div>
         */}
           </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-100 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Re.grant - Department of Electrical and Information Engineering. All rights reserved.
        {/* Add other footer links if needed */}
      </div>
      </footer>
    </div>
  );
}
