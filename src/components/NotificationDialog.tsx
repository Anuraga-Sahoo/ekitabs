
"use client";

import type { ClientNotification } from '@/types'; // Updated to ClientNotification
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationDialogProps {
  notification: ClientNotification | null; // Use ClientNotification
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NotificationDialog({ notification, isOpen, onOpenChange }: NotificationDialogProps) {
  if (!notification) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4 pr-6">
          <div 
            dangerouslySetInnerHTML={{ __html: notification.contentHTML }}
            className="prose dark:prose-invert max-w-none text-sm" 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
