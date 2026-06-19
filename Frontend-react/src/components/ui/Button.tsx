
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

    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none';

    const variants = {
      primary:   'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-card-md active:scale-[0.97]',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 active:scale-[0.97]',
      outline:   'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97]',
      ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.97]',
      danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-card-md active:scale-[0.97]',
      success:   'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-card-md active:scale-[0.97]',
    };

    const sizes = {
      xs: 'h-8 px-2.5 text-xs gap-1 min-w-[32px] rounded-lg',
      sm: 'h-9 px-3 text-sm gap-1.5 min-w-[36px] rounded-xl',
      md: 'h-11 px-5 text-sm gap-2 min-w-[44px] rounded-xl',
      lg: 'h-12 px-7 text-base gap-2.5 min-w-[44px] rounded-2xl',
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
