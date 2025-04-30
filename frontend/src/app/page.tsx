// src/app/page.tsx
'use client'; // Needs to be client component to use hooks/buttons

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CardanoWallet } from '@meshsdk/react';
import { Button } from '@/components/ui/button'; // Assuming you re-export Shadcn Button

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Adjust height based on header/footer */}
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">
        Welcome to Re.grant
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        A transparent and efficient platform for managing research grants within the Department of Electrical and Information Engineering, powered by Lisk L2.
      </p>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* RainbowKit Button for EVM (Lisk) */}
        <ConnectButton
          label="Connect EVM Wallet (Lisk)"
          accountStatus="address"
          chainStatus="icon"
          showBalance={true}
        />

        {/* Mesh SDK Button for Cardano */}
        <div className="cardano-wallet-container p-2 bg-white rounded-md shadow">
          <CardanoWallet />
        </div>
      </div>

      {/* Example Shadcn Button (Requires setup) */}
      <Button variant="outline" className="mt-8">Learn More</Button>

      {/* Add more content for the landing page later */}
    </div>
  );
}
