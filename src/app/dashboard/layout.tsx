
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, History, Menu as MenuIcon, NotebookPen, PencilRuler, Target } from 'lucide-react'; // Added NotebookPen, Target
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TestPrepAiLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-sidebar-primary group-data-[state=collapsed]:text-primary">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
  </svg>
);

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/previous-year-tests', label: 'Previous Year Test', icon: NotebookPen },
  { href: '/new-mock-test', label: 'Mock Test', icon: PencilRuler },
  { href: '/new-practice-test', label: 'Practice Test', icon: Target },
  { href: '/test-history', label: 'Test History', icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar 
          side="left" 
          className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground" 
          collapsible="icon"
        >
          <SidebarHeader className="p-3 border-b border-sidebar-border h-[60px] flex items-center justify-center">
            <Link href="/dashboard" className="flex items-center gap-2 w-full group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center">
              <TestPrepAiLogo />
              <span className="font-semibold text-lg text-sidebar-primary group-data-[state=collapsed]:hidden whitespace-nowrap">
                TestPrep AI
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <SidebarMenu className="p-2 space-y-2">
              {navItems.map((item) => (
                  <SidebarMenuItem key={item.href} className="p-0">
                    <SidebarMenuButton
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))}
                      className="w-full justify-start text-sm"
                      asChild
                      tooltip={{ children: item.label, side: 'right', align: 'center' }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-x-hidden">
          <header className="bg-card border-b border-sidebar-border p-0 md:p-3 sticky top-0 z-30 flex items-center justify-between h-[60px] md:hidden">
            <div className="flex items-center gap-2 px-3">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <TestPrepAiLogo />
                  <span className="font-semibold text-lg text-primary">TestPrep AI</span>
                </Link>
            </div>
            <SidebarTrigger className="h-9 w-9 mr-2"> <MenuIcon/> </SidebarTrigger>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto bg-secondary/20">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
