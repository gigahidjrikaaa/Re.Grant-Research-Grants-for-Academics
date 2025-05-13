// frontend/src/lib/chains.ts
import { defineChain } from 'viem';

export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: { name: 'Lisk Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    public: { http: ['https://rpc.sepolia-api.lisk.com'] }, // Explicitly adding public
  },
  blockExplorers: {
    default: { name: 'Liskscan', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
});

export const supportedChains = [liskSepolia] as const; // Use 'as const' for stricter typing