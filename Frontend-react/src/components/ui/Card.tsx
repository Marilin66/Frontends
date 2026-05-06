// @ts-nocheck
import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ghost';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, padding = 'md', variant = 'default', onClick }: CardProps) {
  const paddings = { none: '', xs: 'p-3', sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-8' };
  const base = variant === 'ghost'
    ? 'bg-transparent'
    : 'bg-white border border-slate-200 rounded-2xl shadow-card';

  return (
    <div
      onClick={onClick}
      className={`
        ${base}
        ${paddings[padding]}
        ${hover || onClick ? 'cursor-pointer hover:shadow-card-md hover:border-slate-300 transition-all duration-200' : 'transition-shadow duration-200'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pb-4 mb-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', subtitle }: { children: ReactNode; className?: string; subtitle?: ReactNode }) {
  return (
    <div>
      <h3 className={`text-base font-semibold text-slate-900 ${className}`}>{children}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-4 mt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
}
