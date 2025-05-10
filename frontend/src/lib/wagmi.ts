// src/lib/wagmi.ts
import { Config } from 'wagmi';
import { defineChain } from 'viem';
import { defaultConfig as xellarDefaultConfig } from '@xellar/kit'; // Import Xellar's config

// 1. Define Lisk Sepolia Chain (remains the same)
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: { decimals: 18, name: 'Lisk Sepolia Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'Liskscan', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
});

const supportedChains = [liskSepolia] as const;

// 2. Get WalletConnect Project ID and Xellar App ID from environment variables
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID || "";
const xellarEnv = process.env.NEXT_PUBLIC_XELLAR_ENV === 'production' ? 'production' : 'sandbox'; // Default to sandbox

if (!walletConnectProjectId) {
    console.warn("WalletConnect Project ID not found. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file.");
}
if (!xellarAppId) {
    console.warn("Xellar App ID not found. Please add NEXT_PUBLIC_XELLAR_APP_ID to your .env.local file.");
}

// 3. Create Wagmi config using Xellar's defaultConfig
// This config will be used by WagmiProvider. XellarKitProvider will also use parts of this.
export const wagmiConfig = xellarDefaultConfig({
  appName: 'Re.grant', // Your app name
  walletConnectProjectId,
  xellarAppId,
  xellarEnv, // 'sandbox' or 'production'
  chains: [...supportedChains], // Create a mutable copy of supportedChains
  // Xellar's defaultConfig handles transports internally based on chains
  // You might not need to define transports explicitly like before if Xellar handles it.
  // Verify this with Xellar documentation. If manual transport setup is needed:
  // transports: {
  //   [liskSepolia.id]: http(),
  // },
  ssr: true, // Enable SSR support if using Next.js
}) as Config; // Cast to Wagmi's Config type

// Export chains if needed elsewhere (e.g., for XellarKitProvider if it doesn't infer from wagmiConfig)
export const chains = supportedChains;