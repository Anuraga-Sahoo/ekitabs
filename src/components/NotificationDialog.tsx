
"use client";

import type { Notification } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Will use this for the HTML content
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationDialogProps {
  notification: Notification | null;
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
          {/* 
            SECURITY WARNING: Using dangerouslySetInnerHTML can be risky if the HTML content
            is not from a trusted source or hasn't been sanitized.
            Ensure contentHTML stored in your database is safe.
          */}
          <div 
            dangerouslySetInnerHTML={{ __html: notification.contentHTML }}
            className="prose dark:prose-invert max-w-none text-sm" 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
