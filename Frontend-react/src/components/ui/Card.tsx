// @ts-nocheck
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'premium';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  variant = 'default',
  onClick 
}: CardProps) {
  const paddingStyles = {
    none: '',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-5 lg:p-6',
    lg: 'p-6 lg:p-8',
  };

  const variantStyles = {
    default: 'bg-white shadow-sm border border-slate-100 rounded-xl lg:rounded-2xl',
    glass: 'bg-white/70 backdrop-blur-3xl border border-white/40 shadow-sm rounded-xl lg:rounded-2xl',
    premium: 'bg-white rounded-2xl lg:rounded-3xl shadow-md border border-slate-50',
  };

  const motionProps = hover || onClick ? {
    whileHover: { y: -3 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <motion.div
      onClick={onClick}
      {...motionProps}
      className={`
        transition-all relative overflow-hidden group
        ${variantStyles[variant]}
        ${hover || onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-slate-50/60 pb-3 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: ReactNode;
}

export function CardTitle({ children, className = '', subtitle }: CardTitleProps) {
  return (
    <div className="space-y-0.5">
      <h3 className={`text-base lg:text-lg font-black text-slate-900 tracking-tighter uppercase italic ${className}`}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{subtitle}</p>
      )}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`relative z-10 ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-slate-50 pt-3 mt-4 ${className}`}>
      {children}
    </div>
  );
}
