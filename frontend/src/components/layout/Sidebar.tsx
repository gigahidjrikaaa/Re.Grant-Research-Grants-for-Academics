// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutGrid, // Example Dashboard Icon
    FileText,   // Grants List Icon
    PlusSquare, // Apply Icon
    User,       // Profile Icon
    Users,      // Talent Pool Icon
    Settings    // Settings Icon
} from 'lucide-react';

// Define navigation items with icons
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid }, // Example
  { href: '/grants', label: 'Browse Grants', icon: FileText },
  { href: '/apply', label: 'Apply for Grant', icon: PlusSquare },
  { href: '/profile', label: 'My Profile', icon: User }, // Future
  { href: '/talent-pool', label: 'Talent Pool', icon: Users }, // Future
  { href: '/settings', label: 'Settings', icon: Settings }, // Example
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-200 bg-white pt-4"> {/* Use white bg */}
      <nav className="flex flex-col space-y-1 px-4 mt-4"> {/* Reduced space-y */}
        {navItems.map((item) => {
          // More specific active check: exact match or starts with + slash
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ease-in-out group", // Added group for potential hover effects
                isActive
                  ? "bg-blue-50 text-primary-blue font-semibold shadow-sm" // Enhanced active state: lighter blue bg, primary text, bold, subtle shadow
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Default state
              )}
            >
              <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0", // Ensure icons don't shrink text
                  isActive ? "text-primary-blue" : "text-gray-400 group-hover:text-gray-500" // Icon color changes
              )} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Optional: Add a fixed section at the bottom */}
      {/* <div className="mt-auto p-4 border-t">
          <p className="text-xs text-gray-500">Re.grant v0.1</p>
      </div> */}
    </aside>
  );
}