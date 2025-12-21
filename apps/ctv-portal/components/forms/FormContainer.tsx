/**
 * Reusable Form Container Component
 * Provides consistent form layout và error handling
 */

"use client";

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormContainerProps {
  title?: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
  footer?: ReactNode;
}

export function FormContainer({
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Lưu',
  cancelLabel = 'Hủy',
  onCancel,
  isLoading = false,
  error,
  className,
  footer,
}: FormContainerProps) {
  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {children}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
            )}
            {onSubmit && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : submitLabel}
              </Button>
            )}
            {footer}
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

