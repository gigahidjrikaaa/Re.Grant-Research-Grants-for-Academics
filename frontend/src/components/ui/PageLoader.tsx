// frontend/src/components/ui/PageLoader.tsx
'use client'; // This component will be shown/hidden based on client-side state

import React from 'react';
import { Loader2 } from 'lucide-react'; // Using a lucide icon as a spinner

interface PageLoaderProps {
  isLoading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      {/* You can add text like "Loading..." below the spinner if you wish */}
    </div>
  );
};

export default PageLoader;