
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
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
import NotificationDialog from './NotificationDialog'; // Import the new dialog

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();
  const mounted = useRef(false);
  const router = useRouter(); // Initialize useRouter

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);

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
      if (mounted.current) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (showErrorToast && mounted.current) {
         toast({ 
            title: "Could Not Load Notifications", 
            description: error instanceof Error ? error.message : "An unknown error occurred. Please try again later.", 
            variant: "destructive" 
        });
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const markNotificationsAsRead = useCallback(async () => {
    if (unreadCount > 0 || notifications.some(n => !n.isRead)) { // Check if there's anything to mark
      try {
        const markReadResponse = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
        if (markReadResponse.ok) {
          if (mounted.current) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          }
        } else {
          const errorData = await markReadResponse.json().catch(() => ({}));
          if (mounted.current) {
            toast({ title: "Error", description: errorData.message || "Could not mark notifications as read.", variant: "destructive"});
          }
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        if (mounted.current) {
          toast({ title: "Error", description: "Failed to communicate with server to mark notifications.", variant: "destructive"});
        }
      }
    }
  }, [notifications, unreadCount, toast]);

  const handleOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) { 
      await fetchNotifications(true); 
      await markNotificationsAsRead();
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (notification.link) {
      router.push(notification.link);
      setIsDropdownOpen(false); // Close dropdown after navigation
    } else {
      setIsNotificationDialogOpen(true);
      // Dropdown might close automatically, or handle its closure if needed
    }
  };

  return (
    <>
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
            {isLoading && notifications.length === 0 && (
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
                className={cn(
                  "cursor-pointer flex flex-col items-start p-2.5 hover:bg-muted/50",
                  !notification.isRead && "font-semibold bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15"
                )}
                onClick={() => handleNotificationClick(notification)}
                // No asChild or Link here, click is handled by onClick
              >
                <p className="text-sm leading-snug whitespace-normal break-words">
                  {notification.title}
                </p>
                {/* Displaying contentHTML as plain text to avoid XSS by default if not using dialog */}
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-normal break-words line-clamp-2">
                  {notification.contentHTML.replace(/<[^>]*>?/gm, '').substring(0,100)} 
                  {notification.contentHTML.replace(/<[^>]*>?/gm, '').length > 100 ? '...' : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDialog
        notification={selectedNotification}
        isOpen={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      />
    </>
  );
}
