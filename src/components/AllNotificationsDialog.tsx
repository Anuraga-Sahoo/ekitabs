
"use client";

import type { ClientNotification } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AllNotificationsDialogProps {
  notifications: ClientNotification[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNotificationClick: (notification: ClientNotification) => void; // Callback to handle item click
}

export default function AllNotificationsDialog({
  notifications,
  isOpen,
  onOpenChange,
  onNotificationClick,
}: AllNotificationsDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>All Notifications</DialogTitle>
          <DialogDescription>
            Showing all your recent notifications.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow mt-4 pr-3 -mr-3"> {/* Negative margin to hide main scrollbar if content fits */}
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No notifications found.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "cursor-pointer flex flex-col items-start p-3 border rounded-md hover:bg-muted/50",
                    !notification.isRead && "font-semibold bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15"
                  )}
                  onClick={() => {
                    onNotificationClick(notification);
                    // Potentially close this dialog if navigating or opening another,
                    // but for now, let the parent (NotificationBell) handle that if needed.
                  }}
                >
                  <p className="text-sm leading-snug whitespace-normal break-words">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-normal break-words line-clamp-3">
                    {notification.contentHTML.replace(/<[^>]*>?/gm, '').substring(0, 150)}
                    {notification.contentHTML.replace(/<[^>]*>?/gm, '').length > 150 ? '...' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
