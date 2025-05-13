// frontend/src/lib/wallet-providers/types.ts
export enum WalletProviderType {
  RainbowKit = 'rainbowkit',
  XellarKit = 'xellarkit',
  MeshJS = 'meshjs',
  None = 'none', // Represents no wallet provider active or initialized
}

// You might expand this later with more specific state or functions
export interface WalletContextType {
  activeProviderType: WalletProviderType;
  setActiveProviderType: (type: WalletProviderType) => void;
  // Potentially add generic connect/disconnect/sign functions here later
  // if you want to abstract away Wagmi/MeshJS hooks at a higher level.
  // For now, Wagmi hooks can still be used directly for EVM.
}