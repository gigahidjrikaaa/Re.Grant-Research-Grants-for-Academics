// src/app/(main)/layout.tsx

import { Sidebar } from "@/components/layout/Sidebar";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 py-6 lg:py-8 lg:pr-14 lg:pl-16 bg-gray-100/50"> {/* Slightly different bg for content area */}
          {children}
        </main>
      </div>
      {/* Footer could go here if needed outside the flex-1 */}
    </div>
  );
}