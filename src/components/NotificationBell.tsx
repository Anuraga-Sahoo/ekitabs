
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch notifications: ${response.statusText}`);
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Do not toast here as it can be annoying if it happens frequently on background poll
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: Set up polling for notifications
    // const intervalId = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
    // return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) { // When dropdown is opening
      await fetchNotifications(); // Fetch latest notifications first
      // Check unreadCount based on the freshly fetched data or existing state if fetch didn't update it yet.
      // The unreadCount state might not be updated yet if fetchNotifications is still running.
      // A more robust way would be to use the count from the fetchNotifications response if possible,
      // or rely on the current unreadCount state and accept a slight delay.
      // For now, let's use the current unreadCount state.
      if (unreadCount > 0) { 
        try {
          const response = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
          if (response.ok) {
            setUnreadCount(0); 
            // Optimistically update isRead status for all currently displayed notifications
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } else {
            toast({ title: "Error", description: "Could not mark notifications as read.", variant: "destructive"});
          }
        } catch (error) {
          console.error("Error marking notifications as read:", error);
          toast({ title: "Error", description: "Failed to communicate with server to mark notifications.", variant: "destructive"});
        }
      }
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && !isLoading && (
            <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
          {isLoading && unreadCount === 0 && ( 
             <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 && !isLoading && (
            <DropdownMenuItem disabled className="justify-center text-sm text-muted-foreground py-4">
              No new notifications
            </DropdownMenuItem>
          )}
          {notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification._id} 
              asChild 
              className={cn(
                "cursor-pointer flex flex-col items-start p-2.5 hover:bg-muted/50",
                !notification.isRead && isDropdownOpen && "font-normal",
                !notification.isRead && !isDropdownOpen && "font-semibold bg-primary/5 dark:bg-primary/10"
              )}
            >
              <Link 
                href={notification.link || "#"} 
                className="w-full"
              >
                <p className="text-sm font-medium leading-snug whitespace-normal break-words">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-normal break-words line-clamp-2">
                  {notification.contentHTML}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </Link>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
        {/* Optional: Add a "View All" link if you have a dedicated notifications page */}
        {/* {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center cursor-pointer">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

