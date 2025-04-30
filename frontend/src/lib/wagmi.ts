// src/lib/wagmi.ts
import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi'; // Import http transport
import { defineChain } from 'viem'; // Use defineChain for custom chains

// 1. Define Lisk Sepolia Chain using defineChain for better type safety & structure
// (Consider moving this definition to a separate constants file later for cleanliness)
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: { decimals: 18, name: 'Lisk Sepolia Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    // Add more RPC URLs if available (e.g., private ones)
    // public: { http: ['https://rpc.sepolia-api.lisk.com'] }, // Can be same as default if only one public RPC
  },
  blockExplorers: {
    default: { name: 'Liskscan', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
});
// Add other chains here if needed (e.g., Lisk Mainnet)
// Define them similarly using defineChain or import from 'wagmi/chains' if standard
const supportedChains = [liskSepolia] as const; // Make this a readonly array with proper typing

// 2. Set up RainbowKit connectors
// Ensure you have NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
if (!projectId) {
    console.warn("WalletConnect Project ID not found. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file.");
    // Handle this appropriately - throw error or disable WalletConnect
}

const { wallets } = getDefaultWallets({
  appName: 'Re.grant',
  projectId: projectId,
  // chains are implicitly passed via createConfig now, no need to pass here
});

// Define connectors using the wallets from getDefaultWallets and any custom ones
export const connectors = connectorsForWallets(
  [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [
        argentWallet,
        trustWallet,
        ledgerWallet
      ]
    }
  ],
  {
    projectId,
    appName: 'Re.grant'
  }
);
// 3. Create Wagmi config using createConfig (Wagmi v2 style)
export const wagmiConfig = createConfig({
  chains: supportedChains, // Pass the array of supported chains
  connectors: connectors, // Pass the configured connectors
  transports: {
    // Define transport for each chain. Use the chain's id as the key.
    [liskSepolia.id]: http(), // Use the http transport for Lisk Sepolia
    // Example for another chain if added:
    // [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
  },
  ssr: true, // Enable SSR support if using Next.js App Router or Pages Router with SSR
  // Optional: Add storage configuration if needed
  // storage: createStorage({ storage: window.localStorage }),
});

// Export chains separately if needed elsewhere (e.g., in RainbowKitProvider)
export const chains = supportedChains;

