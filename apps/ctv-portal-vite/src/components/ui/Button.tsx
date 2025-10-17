import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'btn',
  {
    variants: {
      variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm hover:from-green-600 hover:to-emerald-700 hover:shadow-md hover:-translate-y-0.5',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm hover:from-amber-600 hover:to-orange-700 hover:shadow-md hover:-translate-y-0.5',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm hover:from-red-600 hover:to-rose-700 hover:shadow-md hover:-translate-y-0.5',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm hover:from-blue-600 hover:to-purple-700 hover:shadow-md hover:-translate-y-0.5',
      },
      size: {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };




