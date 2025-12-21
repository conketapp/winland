import { Button } from './button';

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description?: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export function ReasonDialog({
  open,
  title,
  description,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
}: ReasonDialogProps) {
  if (!open) return null;

  const disabled = !reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Lý do <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Nhập lý do chi tiết..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}


