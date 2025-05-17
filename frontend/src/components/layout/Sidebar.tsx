// frontend/src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming you have Tooltip from Shadcn
import {
  FileText,
  Users,
  Briefcase,
  Settings,
  UserCircle,
  PlusSquare,
  LayoutGrid, // For Dashboard
  ShieldCheck, // For Admin section
  // Database, // For Data Editor (Admin)
  DatabaseZap, 
  LayoutDashboard, 
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to check for admin status

// Logo component can be kept here or imported if it's more complex/reused
const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
    <defs>
      <linearGradient id="logoGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" /> {/* Use themed color variable */}
        <stop offset="100%" stopColor="hsl(var(--primary-focus))" /> {/* Example: primary-focus or another accent */}
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#logoGradientSidebar)" />
    <path d="M30,55 Q40,25 50,55 T70,55" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="8" strokeLinecap="round" />
    <path d="M35,40 Q50,70 65,40" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="8" strokeLinecap="round" />
  </svg>
);


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPathname: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, currentPathname }) => {
  const isActive = currentPathname === href || (href !== "/" && currentPathname.startsWith(href));
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SidebarProps {
  isAdmin?: boolean; // Optional prop, but we'll use useAuth directly
}

export function Sidebar({ isAdmin }: SidebarProps) { // Use isAdmin directly
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth(); // Get user data from AuthContext

  const isUserAdmin = isAdmin || (isAuthenticated && user?.is_superuser === true);

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { href: "/grants", icon: FileText, label: "Grants" },
    { href: "/apply", icon: PlusSquare, label: "Apply for Grant" },
    { href: "/talent-pool", icon: Users, label: "Talent Pool" },
    { href: "/project-board", icon: Briefcase, label: "Project Board" },
    { href: "/profile", icon: UserCircle, label: "My Profile" },
  ];

  const adminNavItems = [
    {
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/admin/users', // Assuming you have or will have a user management page
      icon: Users,
      label: 'User Management',
    },
    {
      href: '/admin/data-editor', // Existing page
      icon: Edit,
      label: 'Data Editor',
    },
    { // New Item for Data Seeding
      href: '/admin/data-seeding',
      icon: DatabaseZap,
      label: 'Data Seeding',
    },
    // Add more admin-specific links here, e.g., user management, platform settings
    // { href: "/admin/users", icon: Users, label: "Manage Users" },
    // { href: "/admin/settings", icon: Settings, label: "Admin Settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex overflow-y-auto scrollbar-thin">
      <style jsx>{`
      .scrollbar-thin::-webkit-scrollbar {
        width: 2px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: hsl(var(--muted-foreground) / 0.3);
        border-radius: 20px;
      }
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
      }
      `}</style>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base mb-2"
        >
          <Logo />
          <span className="sr-only">Re.Grant</span>
        </Link>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} currentPathname={pathname} />
        ))}
        {/* Conditionally render Admin section */}
        {isUserAdmin && (
          <>
            <div className="my-2 h-px w-3/4 bg-border" /> {/* Separator */}
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:h-8 md:w-8">
                            <ShieldCheck className="h-5 w-5 text-primary-blue" />
                            <span className="sr-only">Admin Section</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Admin Section</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {adminNavItems.map((item) => (
              <NavItem key={item.href} {...item} currentPathname={pathname} />
            ))}
          </>
        )}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/settings" icon={Settings} label="Settings" currentPathname={pathname} />
      </nav>
    </aside>
  );
}