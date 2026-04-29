// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  showDot = false
}: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20 shadow-glow-sm',
    secondary: 'bg-slate-900 text-white border-white/10 shadow-3xl',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  };

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-white',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-[8px] tracking-[0.2em]',
    md: 'px-6 py-2 text-[10px] tracking-[0.3em]',
    lg: 'px-8 py-3 text-[12px] tracking-[0.4em]',
  };

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 rounded-xl border font-black uppercase italic
        backdrop-blur-sm transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      <AnimatePresence>
        {showDot && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-glow-sm ${dotColors[variant]}`} 
          />
        )}
      </AnimatePresence>
      {children}
    </motion.span>
  );
}

export function StatusBadge({ status, className = "" }: { status: string, className?: string }) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string; dot?: boolean }> = {
    // Appointment statuses
    en_attente: { variant: 'warning', label: 'Attente Terminale', dot: true },
    confirme: { variant: 'info', label: 'Segment Confirmé', dot: true },
    en_cours: { variant: 'primary', label: 'Opération Active', dot: true },
    termine: { variant: 'success', label: 'Archive Terminée', dot: false },
    annule: { variant: 'error', label: 'Vecteur Annulé', dot: false },
    absent: { variant: 'error', label: 'Carence Patient', dot: false },
    // Result statuses
    pret: { variant: 'success', label: 'Dataset Prêt', dot: true },
    livre: { variant: 'info', label: 'Données Livrées', dot: false },
  };

  const config = statusConfig[status] || { variant: 'primary' as BadgeVariant, label: status, dot: false };

  return <Badge variant={config.variant} size="sm" showDot={config.dot} className={className}>{config.label}</Badge>;
}
