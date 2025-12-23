/**
 * Page Header Component
 * Reusable header với consistent styling và responsive design
 */

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
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 break-words">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-gray-600 break-words line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            <Button
              onClick={action.onClick}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              {action.icon && <span className="mr-1.5 md:mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
      <Separator />
    </div>
  );
}

export { PageHeader };
