// frontend/src/components/functional/RainbowKitConnectTrigger.tsx
'use client';

import { useEffect } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface RainbowKitConnectTriggerProps {
  shouldOpen: boolean;
  onModalRequestProcessed: () => void; // To reset the trigger
}

const RainbowKitConnectTrigger: React.FC<RainbowKitConnectTriggerProps> = ({
  shouldOpen,
  onModalRequestProcessed,
}) => {
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (shouldOpen && openConnectModal) {
      console.log("RainbowKitConnectTrigger: Opening modal...");
      openConnectModal();
      onModalRequestProcessed(); // Reset the trigger state in parent
    } else if (shouldOpen && !openConnectModal) {
        console.error("RainbowKitConnectTrigger: Attempted to open modal, but openConnectModal is undefined.");
        onModalRequestProcessed(); // Still reset
    }
  }, [shouldOpen, openConnectModal, onModalRequestProcessed]);

  return null;
};

export default RainbowKitConnectTrigger;