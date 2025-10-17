/**
 * Loading Spinner Component
 */

export default function LoadingSpinner({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

