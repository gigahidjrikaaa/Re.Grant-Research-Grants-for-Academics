// frontend/src/components/layout/NavigationEvents.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import PageLoader from '@/components/ui/PageLoader'; // Your loader component

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // When a navigation starts, show the loader
    // Next.js <Link> components trigger navigation before the new page's data is ready.
    // This effect will catch the *start* of a navigation.
    // However, determining the exact *end* of loading for server components can be tricky.
    // For App Router, Next.js itself often handles transitions smoothly.
    // This approach is more for showing an *immediate* indicator when a link is clicked.

    // To show loading on path change:
    setIsLoading(true);

    // A common pattern is to hide it quickly, as App Router's streaming/Suspense handles actual content loading.
    // If you want it to persist longer, you'd need a more sophisticated way to know when loading is truly "done".
    const timer = setTimeout(() => setIsLoading(false), 500); // Adjust timeout as needed, or use a more robust solution

    return () => clearTimeout(timer);

  }, [pathname, searchParams]);


  // More robust solution using router events if available/needed,
  // or integrating with Suspense boundaries if parts of your page load asynchronously.
  // For a simple "button clicked" feedback, this approach is okay.

  // A more advanced version might use a global state (Zustand/Context)
  // that can be set to `true` before router.push() and `false` in the destination page's `useEffect`.

  // This basic version will show the loader briefly whenever the path or search params change.
  // For page transitions initiated by clicking a <Link>, this works.
  // For programmatic navigation (router.push()), you'd set a loading state manually.

  return <PageLoader isLoading={isLoading} />;
}