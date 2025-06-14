
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
import type { ClientNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import NotificationDialog from './NotificationDialog'; 
import AllNotificationsDialog from './AllNotificationsDialog'; // Import the new dialog

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();
  const mounted = useRef(false);
  const router = useRouter(); 

  const [selectedNotificationForContent, setSelectedNotificationForContent] = useState<ClientNotification | null>(null);
  const [isContentNotificationDialogOpen, setIsContentNotificationDialogOpen] = useState(false);
  const [isAllNotificationsDialogOpen, setIsAllNotificationsDialogOpen] = useState(false);

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
    try {
      const markReadResponse = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (!markReadResponse.ok) {
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
  }, [toast]);

  const handleOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open) { 
      await fetchNotifications(true); 
      if (unreadCount > 0 || notifications.some(n => !n.isRead)) {
        await markNotificationsAsReadOnServer();
        await fetchNotifications(false); 
      }
    }
  };
  
  const handleNotificationClick = (notification: ClientNotification) => {
    if (notification.link) {
      router.push(notification.link);
      setIsDropdownOpen(false); 
    } else {
      setSelectedNotificationForContent(notification);
      setIsContentNotificationDialogOpen(true);
    }
  };

  const handleShowAllClick = () => {
    setIsAllNotificationsDialogOpen(true);
    setIsDropdownOpen(false); // Close dropdown when "Show All" is clicked
  };

  const displayedNotifications = notifications.slice(0, 10);

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
            {displayedNotifications.length === 0 && !isLoading && (
              <DropdownMenuItem disabled className="justify-center text-sm text-muted-foreground py-4">
                No new notifications
              </DropdownMenuItem>
            )}
            {displayedNotifications.map((notification) => (
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
            {notifications.length > 10 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleShowAllClick}
                  className="justify-center text-sm text-primary hover:text-primary hover:bg-muted/50 cursor-pointer font-medium"
                >
                  Show All Notifications ({notifications.length})
                </DropdownMenuItem>
              </>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDialog
        notification={selectedNotificationForContent}
        isOpen={isContentNotificationDialogOpen}
        onOpenChange={setIsContentNotificationDialogOpen}
      />

      <AllNotificationsDialog
        notifications={notifications} // Pass all fetched notifications
        isOpen={isAllNotificationsDialogOpen}
        onOpenChange={setIsAllNotificationsDialogOpen}
        onNotificationClick={handleNotificationClick} // Allow AllNotificationsDialog to use the same click handler
      />
    </>
  );
}
