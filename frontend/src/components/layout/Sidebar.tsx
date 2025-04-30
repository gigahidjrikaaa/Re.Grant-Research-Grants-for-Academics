// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming you set up Shadcn's utility function
import { Home, List, Plus, User } from "lucide-react";

// Icons for navigation
const HomeIcon = () => <Home className="h-5 w-5" />;
const ListIcon = () => <List className="h-5 w-5" />;
const PlusIcon = () => <Plus className="h-5 w-5" />;
const UserIcon = () => <User className="h-5 w-5" />;


const navItems = [
  { href: '/grants', label: 'Browse Grants', icon: ListIcon },
  { href: '/apply', label: 'Apply for Grant', icon: PlusIcon },
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon }, // Example
  { href: '/profile', label: 'My Profile', icon: UserIcon }, // Future
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r border-border/40 bg-background p-4">
      <nav className="flex flex-col space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-blue/10 text-primary-blue" // Active state with Primary Blue
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Default state
              )}
            >
              <item.icon /> {/* Render the icon component */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Add other sidebar content if needed */}
    </aside>
  );
}