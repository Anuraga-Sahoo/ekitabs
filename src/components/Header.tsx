
"use client";

import Link from 'next/link';
import { BookOpenText, History, Home, PencilRuler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/mock-test', label: 'Mock Test', icon: PencilRuler },
  { href: '/practice-test', label: 'Practice', icon: BookOpenText },
  { href: '/test-history', label: 'History', icon: History },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-background text-foreground shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
          </svg>
          TestPrep AI
        </Link>
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={'ghost'} // Using ghost variant as base for custom styling
              asChild
              className={cn(
                "text-sm font-medium",
                pathname === item.href 
                  ? 'text-primary font-semibold bg-muted' 
                  : 'text-foreground hover:bg-muted/50 hover:text-primary'
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
