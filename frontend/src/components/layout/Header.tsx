// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Bell, HelpCircle, Newspaper } from 'lucide-react'; // Added new icons
import CustomConnectWalletButton from './CustomConnectWalletButton';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
} from "@/components/ui/sheet";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext'; // To check auth state for conditional nav
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // For Notifications
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"; // For Search Modal
import { Input } from "@/components/ui/input"; // For Search Input
import { cn } from '@/lib/utils';

// Enhanced Logo component (remains the same)
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" /> 
        <stop offset="100%" stopColor="hsl(var(--primary-gradient-end, var(--accent)))" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#logoGradientHeader)" />
    <path d="M30,50 Q40,20 50,50 T70,50" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="5" />
  </svg>
);

const NavLink = ({ href, children, className, onClick }: { href: string; children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "transition-colors hover:text-primary text-sm",
        isActive ? "text-primary font-semibold" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
};

// Placeholder Search Component
const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    console.log("Searching for:", searchTerm);
    // Implement actual search logic here (e.g., redirect to search results page or fetch results)
    setIsOpen(false); // Close dialog after search
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>
            Search for users, skills, projects, grants, and more.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
            autoFocus
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
        {/* Placeholder for search results or suggestions */}
        {/* <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

// Placeholder Notifications Component
const NotificationsDropdown = () => {
  // Placeholder notifications
  const notifications = [
    { id: 1, message: "New grant matching your profile!", time: "2m ago", read: false },
    { id: 2, message: "Application deadline approaching for 'AI Research Grant'.", time: "1h ago", read: false },
    { id: 3, message: "Welcome to Re.Grant!", time: "1d ago", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && <span className="text-xs text-primary font-normal">{unreadCount} new</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.slice(0, 3).map(notif => ( // Show a few recent ones
            <DropdownMenuItem key={notif.id} className={`flex flex-col items-start ${!notif.read ? 'font-medium' : ''}`}>
              <p className="text-sm leading-tight">{notif.message}</p>
              <p className="text-xs text-muted-foreground">{notif.time}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Link href="/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isAuthenticated } = useAuth(); // Get authentication status

  // Define navigation items based on authentication state or general availability
  const commonNavItems = [
    { href: "/news", label: "News/Blog", icon: Newspaper },
  ];
  
  // These items were previously in the header, now only for unauthenticated or specific scenarios
  const unauthenticatedNavItems = [
    { href: "/grants", label: "Grants", icon: undefined },
    { href: "/apply", label: "Apply", icon: undefined },
  ];

  // For logged-in users, primary navigation is in the sidebar.
  // The header will contain global actions and the "News/Blog" link.
  const desktopNavItems = isAuthenticated ? commonNavItems : [...unauthenticatedNavItems, ...commonNavItems];
  const mobileNavItems = isAuthenticated 
    ? commonNavItems // Only common items for mobile if sidebar is primary
    : [...unauthenticatedNavItems, ...commonNavItems];


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-4 lg:mr-6" aria-label="Homepage">
            <Logo />
            <span className="ml-2 font-bold text-lg text-primary hidden sm:inline-block">
              <span className='text-primary-foreground rounded-xs pb-0.5 px-0.5 bg-primary'>Re.</span>grant
            </span>
          </Link>
        </div>

        {/* Center Section (Desktop): News/Blog Link */}
        <nav className="hidden md:flex items-center space-x-6">
          {desktopNavItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Actions & User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <GlobalSearch />
          <NotificationsDropdown />
          <Link href="/help" passHref legacyBehavior>
            <Button variant="ghost" size="icon" aria-label="Help & Support">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-shrink-0">
            <CustomConnectWalletButton />
          </div>
          
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                     <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                        <Logo />
                        <span className="ml-2 font-bold text-lg text-primary">
                          <span className='text-primary-foreground rounded-xs pb-0.5 px-0.5 bg-primary'>Re.</span>grant
                        </span>
                      </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Close menu">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col space-y-1 p-4 flex-grow">
                  {mobileNavItems.map((item) => (
                     <SheetClose asChild key={item.href}>
                        <NavLink 
                          href={item.href} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                          <span>{item.label}</span>
                        </NavLink>
                      </SheetClose>
                  ))}
                  {/* Add mobile-specific links for global actions if preferred over header icons on small screens */}
                   <SheetClose asChild>
                      <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-sm text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Help & Support</span>
                      </Link>
                    </SheetClose>
                </nav>
                {/* Optional: Footer in Sheet for e.g. social links or a secondary action */}
                 {/* <div className="p-4 border-t">
                    <p className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Re.Grant</p>
                 </div> */}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}