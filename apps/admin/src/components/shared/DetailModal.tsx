/**
 * Shared DetailModal Component
 * Reusable modal for viewing details
 */

import { ReactNode } from 'react';
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl w-full mx-4 sm:mx-0 p-0 gap-0 overflow-hidden flex flex-col">
        <div className="flex flex-col max-h-[90vh] min-h-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 flex-shrink-0 border-b border-gray-100">
            <DialogTitle className="mb-1">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-0">{description}</DialogDescription>
            )}
          </DialogHeader>
          
          <div className="px-4 sm:px-6 py-4 sm:py-5 md:py-6 overflow-y-auto flex-1 min-h-0">
            {children}
          </div>

          {footer && (
            <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-5 md:pb-6 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                {footer}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

