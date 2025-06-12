
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Sparkles, BookOpenText, PencilRuler, History, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TestPrepAiLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-sidebar-primary group-data-[state=collapsed]:text-primary">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
  </svg>
);

interface NavItem {
  href?: string;
  label: string;
  icon: React.ElementType;
  isGroup?: boolean;
  subItems?: NavSubItem[];
}

interface NavSubItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'AI Powered Tests',
    icon: Sparkles, 
    isGroup: true,
    subItems: [
      { href: '/ai-tests', label: 'Overview', icon: Sparkles },
      { href: '/mock-test', label: 'AI Mock Test', icon: PencilRuler },
      { href: '/practice-test', label: 'AI Practice Test', icon: BookOpenText },
    ],
  },
  { href: '/test-history', label: 'Attempted Test', icon: History },
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
            <SidebarMenu className="p-2 space-y-2"> {/* Increased space-y for main menu items */}
              {navItems.map((item) => {
                if (item.isGroup && item.subItems) {
                  const isGroupActive = item.subItems.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + '/'));
                  return (
                    <SidebarGroup key={item.label} className="p-0">
                      <SidebarGroupLabel className="px-2 py-1.5 text-xs text-muted-foreground group-data-[state=collapsed]:hidden flex items-center">
                        <item.icon className="mr-2 h-4 w-4" /> {item.label}
                      </SidebarGroupLabel>
                       <div className="group-data-[expanded]:hidden text-center my-1">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hidden h-8 w-8 mx-auto pointer-events-none">
                                      {/* <item.icon className="h-4 w-4 text-muted-foreground" /> Standardized icon size */}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                       </div>
                      <SidebarGroupContent className="group-data-[state=collapsed]:mt-0"> {/* Removed pl-0 from here */}
                        <SidebarMenu className="space-y-1 group-data-[state=expanded]:pl-4"> {/* Added pl-4 for indentation when expanded, kept space-y-1 for tighter sub-items */}
                          {item.subItems.map((subItem) => (
                            <SidebarMenuItem key={subItem.href} className="p-0">
                              <SidebarMenuButton
                                isActive={pathname === subItem.href || pathname.startsWith(subItem.href + '/')}
                                className="w-full justify-start text-sm"
                                asChild
                                tooltip={{ children: subItem.label, side: 'right', align: 'center' }}
                              >
                                <Link href={subItem.href}>
                                  <subItem.icon />
                                  <span className="group-data-[state=collapsed]:hidden">{subItem.label}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  );
                }
                return (
                  <SidebarMenuItem key={item.href} className="p-0">
                    <SidebarMenuButton
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))}
                      className="w-full justify-start text-sm"
                      asChild
                      tooltip={{ children: item.label, side: 'right', align: 'center' }}
                    >
                      <Link href={item.href!}>
                        <item.icon />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
