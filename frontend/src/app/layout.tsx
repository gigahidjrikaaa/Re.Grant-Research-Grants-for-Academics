// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Includes Tailwind base styles
import '@rainbow-me/rainbowkit/styles.css'; // RainbowKit styles
import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import { Toaster as SonnerToaster } from "sonner"; // Sonner for notifications
import { Suspense } from "react";
import { NavigationEvents } from "@/components/layout/NavigationEvents";

// Setup the Inter font
const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Use swap for better perceived performance
  variable: '--font-inter', // Optional: Define CSS variable
});

export const metadata: Metadata = {
  title: "Re.grant: Grants for Researchers and Academia",
  description: "A transparent grant platform for the Department of Electrical and Information Engineering.",
  // Add icons, open graph tags etc. here later
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen min-w-screen w-full bg-brand-background text-text-primary">
            <Header />
            <main className="flex-grow min-w-screen w-full">
              {/* Main content area */}
              {children}
              <SonnerToaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  },
                  classNames: {
                    success: 'bg-success text-success-foreground',
                    error: 'bg-error text-error-foreground',
                  }
                }}
              />
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <NavigationEvents />
              </Suspense>
            </main>
            {/* <Footer /> Placeholder for Footer */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
