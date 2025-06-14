
"use client";

import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
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
  const mounted = useRef(false); // Ref to track mount status

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async (showErrorToast = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch notifications: ${response.statusText}`);
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (showErrorToast && mounted.current) { // Show toast only if explicitly told (e.g., on open) or initial load
         toast({ 
            title: "Could Not Load Notifications", 
            description: error instanceof Error ? error.message : "An unknown error occurred while trying to fetch your notifications. Please try again later.", 
            variant: "destructive" 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications(true); // Show error toast on initial fetch failure
    // Optional: Set up polling for notifications
    // const intervalId = setInterval(() => fetchNotifications(false), 60000); // Poll every 60 seconds, don't toast on background poll errors
    // return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) { 
      await fetchNotifications(true); // Fetch latest and show errors if any
      
      // Use the freshly fetched unreadCount if possible, or the current state
      // For simplicity, using current unreadCount state here.
      // A more robust way would be to use data from the fetchNotifications response.
      const currentUnread = notifications.filter(n => !n.isRead).length;


      if (currentUnread > 0) { 
        try {
          const markReadResponse = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
          if (markReadResponse.ok) {
            setUnreadCount(0); 
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } else {
            const errorData = await markReadResponse.json().catch(() => ({}));
            toast({ title: "Error", description: errorData.message || "Could not mark notifications as read.", variant: "destructive"});
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
          {isLoading && notifications.length === 0 && ( // Show loader only if initial load and no notifications yet
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
                !notification.isRead && "font-semibold bg-primary/5 dark:bg-primary/10"
              )}
            >
              <Link 
                href={notification.link || "#"} 
                className="w-full"
                onClick={(e) => {
                  if (!notification.link) e.preventDefault(); // Prevent navigation if no link
                }}
              >
                <p className="text-sm leading-snug whitespace-normal break-words">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
