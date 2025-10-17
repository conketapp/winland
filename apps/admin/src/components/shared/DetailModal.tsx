/**
 * Shared DetailModal Component
 * Reusable modal for viewing details
 */

import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function DetailModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>

        {footer && (
          <div className="flex gap-2 justify-end pt-4 border-t">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

