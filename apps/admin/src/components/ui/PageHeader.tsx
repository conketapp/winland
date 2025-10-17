/**
 * Page Header Component
 * Reusable header với consistent styling
 */

import React from 'react';
import { Button } from './button';
import { Separator } from './separator';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
      {children}
      <Separator />
    </div>
  );
}

export { PageHeader };
