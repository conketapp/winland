/**
 * Loading State Component using shadcn Skeleton
 */

import React from 'react';
import { Skeleton } from './skeleton';
import { Card } from './card';

interface LoadingStateProps {
  message?: string;
  type?: 'page' | 'card' | 'table';
}

export default function LoadingState({ 
  message = 'Đang tải...', 
  type = 'page' 
}: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  // Default page loader with spinner
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-6 text-gray-600 font-medium">{message}</p>
    </div>
  );
}
