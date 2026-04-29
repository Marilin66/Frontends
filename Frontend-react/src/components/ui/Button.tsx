// @ts-nocheck
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-black tracking-widest uppercase italic transition-all duration-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-center whitespace-nowrap overflow-hidden';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md border border-white/10',
      secondary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20',
      outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 shadow-sm',
      ghost: 'bg-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20',
    };

    const sizes = {
      sm: 'px-4 h-9 text-[8px] lg:px-5 lg:h-10 lg:text-[9px]',
      md: 'px-6 h-10 text-[9px] lg:px-7 lg:h-12 lg:text-[10px]',
      lg: 'px-8 h-12 text-[10px] lg:px-10 lg:h-14 lg:text-[11px]',
    };

    return (
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        <div className="relative z-10 flex items-center justify-center truncate">
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
          ) : leftIcon ? (
            <span className="mr-2">{leftIcon}</span>
          ) : null}
          <span className="truncate">{children}</span>
          {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
