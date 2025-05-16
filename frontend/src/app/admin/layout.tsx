// frontend/src/app/(admin)/layout.tsx
'use client'; // This layout will use hooks for auth check

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !user?.is_superuser)) {
      // Redirect to home or login page if not an authenticated admin
      toast.error("Access Denied: You do not have permission to view this page.");
      router.replace('/'); // Or your login page if you have one
    }
  }, [user, isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || !isAuthenticated || !user?.is_superuser) {
    // Show a loading state or a minimal layout while checking auth
    // Or you could redirect immediately as done in useEffect
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying admin access...</p>
      </div>
    );
  }

  // If authenticated as superuser, render the admin layout
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar isAdmin={true} /> {/* Pass a prop if sidebar needs to change for admin */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14"> {/* Adjust pl based on your sidebar width */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}