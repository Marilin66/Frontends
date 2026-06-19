
import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-11 px-3 bg-white dark:bg-slate-900 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600
              transition-all duration-150
              touch-manipulation
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-red-800 dark:focus:ring-red-900'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/20'
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {onRightIconClick ? (
                <button type="button" onClick={onRightIconClick} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 -mr-1">
                  {rightIcon}
                </button>
              ) : (
                <span className="text-slate-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
