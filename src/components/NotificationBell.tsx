
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
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
import type { ClientNotification } from '@/types'; // Updated to ClientNotification
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import NotificationDialog from './NotificationDialog'; 

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]); // Use ClientNotification
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();
  const mounted = useRef(false);
  const router = useRouter(); 

  const [selectedNotification, setSelectedNotification] = useState<ClientNotification | null>(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async (showErrorToast = false) => {
    if(!mounted.current) return;
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

  const markNotificationsAsReadOnServer = useCallback(async () => {
    if (!mounted.current) return;
    // Only call if there are genuinely unread items based on current client state or if we want to ensure backend is synced.
    // The API will handle the logic of what to mark.
    try {
      const markReadResponse = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (!markReadResponse.ok) {
        const errorData = await markReadResponse.json().catch(() => ({}));
        if (mounted.current) {
          toast({ title: "Error", description: errorData.message || "Could not mark notifications as read.", variant: "destructive"});
        }
      } else {
        // Successfully marked on server, client state unreadCount will be updated on next fetch or optimistically.
        // For now, let fetch handle it.
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      if (mounted.current) {
        toast({ title: "Error", description: "Failed to communicate with server to mark notifications.", variant: "destructive"});
      }
    }
  }, [toast]);


  const handleOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) { 
      // Fetch fresh notifications first
      await fetchNotifications(true); 
      // Then, if there were unread items (or just to be sure), try to mark them as read on server
      if (unreadCount > 0 || notifications.some(n => !n.isRead)) { // Check based on potentially stale client data before server call
        await markNotificationsAsReadOnServer();
        // Optionally, refetch after marking to get the absolute latest state, or update optimistically
        // For simplicity, we can rely on the next automatic fetch or if the user re-opens.
        // Or, to be more responsive:
        await fetchNotifications(false); // Fetch again silently to update unreadCount and visuals
      }
    }
  };
  
  const handleNotificationClick = (notification: ClientNotification) => {
    setSelectedNotification(notification);
    if (notification.link) {
      router.push(notification.link);
      setIsDropdownOpen(false); 
    } else {
      setIsNotificationDialogOpen(true);
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
              >
                <p className="text-sm leading-snug whitespace-normal break-words">
                  {notification.title}
                </p>
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
