// frontend/src/lib/wagmi.ts
import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { liskSepolia } from './chains'; // Assuming liskSepolia is defined in chains.ts

const supportedChains = [liskSepolia] as const;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
    console.warn("WalletConnect Project ID not found. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file.");
}

const { wallets } = getDefaultWallets({
  appName: 'Re.grant',
  projectId: projectId,
  // chains: supportedChains, // For older RainbowKit versions, newer versions infer from Wagmi config
});

const connectors = connectorsForWallets(
  [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [argentWallet, trustWallet, ledgerWallet],
    }
  ],
  {
    projectId,
    appName: 'Re.grant'
  }
);

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors, // Use the generated connectors
  transports: {
    [liskSepolia.id]: http(),
  },
  ssr: true,
});

export { supportedChains } from './chains'; // Re-export chains