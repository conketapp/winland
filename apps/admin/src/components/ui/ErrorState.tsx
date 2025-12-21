import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  description,
  onRetry,
  retryLabel = 'Thử tải lại',
}: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm mb-4 whitespace-pre-line">{description}</div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}


