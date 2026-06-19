
import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'ghost' | 'elevated';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, padding = 'md', variant = 'default', onClick }: CardProps) {
  const paddings = { none: '', xs: 'p-3', sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-8' };
  const base = variant === 'ghost'
    ? 'bg-transparent'
    : variant === 'elevated'
      ? 'bg-white dark:bg-slate-900 rounded-2xl shadow-card-md border border-slate-100 dark:border-slate-800'
      : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm';

  return (
    <div
      onClick={onClick}
      className={`
        ${base}
        ${paddings[padding]}
        ${hover || onClick ? 'cursor-pointer hover:shadow-card-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200' : 'transition-all duration-200'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', subtitle }: { children: ReactNode; className?: string; subtitle?: ReactNode }) {
  return (
    <div>
      <h3 className={`text-base font-semibold text-slate-900 dark:text-white ${className}`}>{children}</h3>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
}
