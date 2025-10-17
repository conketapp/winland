import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'badge',
  {
    variants: {
      variant: {
        primary: 'badge-primary',
        secondary: 'badge-secondary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
        solid: 'text-white',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
      rounded: {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, rounded, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-1">{rightIcon}</span>}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };




