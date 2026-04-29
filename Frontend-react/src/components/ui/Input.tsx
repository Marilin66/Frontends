// @ts-nocheck
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
  (
    {
      className = '',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      type,
      ...props
    },
    ref
  ) => {
    const inputType = type === 'password' ? 'password' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl transition-all duration-300 outline-none
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error 
                ? 'border-error/50 bg-error/5 focus:ring-error/10 focus:border-error' 
                : 'hover:bg-slate-100 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-inner-soft'
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {onRightIconClick ? (
                <button
                  type="button"
                  onClick={onRightIconClick}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {rightIcon}
                </button>
              ) : (
                <span className="text-slate-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-bold text-error mt-1.5 ml-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500 mt-1.5 ml-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
