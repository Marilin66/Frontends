// @ts-nocheck
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none';

    const variants = {
      primary:   'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 active:scale-[0.98]',
      outline:   'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-sm active:scale-[0.98]',
      ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200 active:scale-[0.98]',
      danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm hover:shadow-md active:scale-[0.98]',
      success:   'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400 shadow-sm hover:shadow-md active:scale-[0.98]',
    };

    const sizes = {
      xs: 'h-8 px-2.5 text-xs gap-1 min-w-[32px]',
      sm: 'h-9 px-3 text-sm gap-1.5 min-w-[36px]',
      md: 'h-11 px-4 text-sm gap-2 min-w-[44px]',
      lg: 'h-12 px-6 text-base gap-2 min-w-[44px]',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
