
"use client";

import Link from 'next/link';
import { BookOpenText, History, Home, PencilRuler, Sparkles, ChevronDown, LogIn, LogOut, UserPlus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


interface NavItemConfig {
  href?: string;
  label: string;
  icon: React.ElementType;
  isDropdown?: boolean;
  dropdownItems?: DropdownItemConfig[];
  activePaths?: string[];
  requiresAuth?: boolean;
}

interface DropdownItemConfig {
  href: string;
  label: string;
  icon: React.ElementType;
}

const allNavItems: NavItemConfig[] = [
  { href: '/', label: 'Home', icon: Home, requiresAuth: false },
  {
    label: 'AI Powered Test',
    icon: Sparkles,
    isDropdown: true,
    activePaths: ['/mock-test', '/practice-test', '/ai-tests'],
    dropdownItems: [
      { href: '/ai-tests', label: 'Overview', icon: Sparkles },
      { href: '/mock-test', label: 'AI Mock Test', icon: PencilRuler },
      { href: '/practice-test', label: 'AI Practice Test', icon: BookOpenText },
    ],
    requiresAuth: true,
  },
  { href: '/test-history', label: 'History', icon: History, requiresAuth: true },
];

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, userEmail, isLoading, logout, updateAuthState } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      updateAuthState(); 
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateAuthState]);


  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U'; 
    return email.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <header className="bg-background text-foreground shadow-md sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
            </svg>
            TestPrep AI
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="md:hidden">
             <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </header>
    );
  }
  
  const visibleNavItems = allNavItems.filter(item => !item.requiresAuth || isLoggedIn);

  const renderNavItem = (item: NavItemConfig, isMobile: boolean = false) => {
    const isActive = item.href === pathname || (item.activePaths && item.activePaths.some(p => pathname.startsWith(p)));
    if (item.isDropdown && item.dropdownItems) {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              className={cn(
                "text-sm font-medium w-full justify-start md:w-auto md:justify-center",
                isActive
                  ? 'text-primary font-semibold bg-muted'
                  : 'text-foreground hover:bg-muted/50 hover:text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className={isMobile ? "ml-2" : "hidden sm:inline ml-2"}>{item.label}</span>
              <ChevronDown className="h-4 w-4 ml-auto md:ml-1 sm:ml-2 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {item.dropdownItems.map((dropdownItem) => (
              <DropdownMenuItem key={dropdownItem.label} asChild onClick={() => isMobile && setIsMobileMenuOpen(false)}>
                <Link href={dropdownItem.href} className={cn(
                  "flex items-center gap-2 w-full",
                  pathname === dropdownItem.href ? "bg-muted text-primary font-medium" : ""
                )}>
                  <dropdownItem.icon className="h-4 w-4" />
                  <span>{dropdownItem.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button
        key={item.label}
        variant={'ghost'}
        asChild
        className={cn(
          "text-sm font-medium w-full justify-start md:w-auto md:justify-center",
          isActive
            ? 'text-primary font-semibold bg-muted'
            : 'text-foreground hover:bg-muted/50 hover:text-primary'
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <Link href={item.href || '#'} className="flex items-center gap-2">
          <item.icon className="h-4 w-4" />
          <span className={isMobile ? "ml-2" : "hidden sm:inline ml-2"}>{item.label}</span>
        </Link>
      </Button>
    );
  };


  return (
    <header className="bg-background text-foreground shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
          </svg>
          TestPrep AI
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          {visibleNavItems.map(item => renderNavItem(item))}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {userEmail || "User"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm font-medium text-foreground hover:bg-muted/50 hover:text-primary">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              <Button variant="default" asChild size="sm" className="text-sm">
                <Link href="/signup" className="flex items-center gap-1">
                   <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0">
              <div className="p-4 border-b">
                <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
                   </svg>
                   TestPrep AI
                 </Link>
              </div>
              <nav className="flex flex-col space-y-2 p-4">
                {visibleNavItems.map(item => renderNavItem(item, true))}
                <DropdownMenuSeparator />
                {isLoggedIn ? (
                  <>
                    <DropdownMenuLabel className="font-normal px-2 pt-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {userEmail || "User"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                     <Button variant="ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full justify-start text-sm font-medium">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button variant="default" asChild size="sm" className="w-full justify-start text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/signup" className="flex items-center gap-1">
                         <UserPlus className="h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
