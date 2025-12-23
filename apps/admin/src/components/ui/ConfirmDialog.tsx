/**
 * Confirm Dialog Component
 * Reusable confirmation dialog using shadcn/ui
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  loading = false,
  children,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg w-full mx-4 sm:mx-0 p-0 gap-0 overflow-hidden flex flex-col">
        <div className="flex flex-col max-h-[90vh] min-h-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 flex-shrink-0 border-b border-gray-100">
            <DialogTitle className="mb-1">{title}</DialogTitle>
            {description && !children && <DialogDescription className="mt-0">{description}</DialogDescription>}
          </DialogHeader>
          {(children || description) && (
            <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 min-h-0">
              {children || (
                <>
                  {description && <DialogDescription>{description}</DialogDescription>}
                </>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2 px-4 sm:px-6 pt-4 pb-4 sm:pb-5 md:pb-6 flex-shrink-0 border-t border-gray-200 bg-white">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
              className="text-xs sm:text-sm h-9 sm:h-10"
              size="sm"
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant} 
              onClick={handleConfirm} 
              disabled={loading}
              className="text-xs sm:text-sm h-9 sm:h-10"
              size="sm"
            >
              {loading ? 'Đang xử lý...' : confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

