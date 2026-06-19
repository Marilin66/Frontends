
import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export function Badge({ children, variant = 'primary', size = 'md', className = '', showDot = false }: BadgeProps) {
  const variants = {
    primary:   'bg-blue-50 text-blue-700 border border-blue-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    success:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:   'bg-amber-50 text-amber-700 border border-amber-200',
    error:     'bg-red-50 text-red-700 border border-red-200',
    info:      'bg-sky-50 text-sky-700 border border-sky-200',
    outline:   'bg-transparent text-slate-600 border border-slate-200',
  };

  const dotColors = {
    primary: 'bg-blue-500', secondary: 'bg-slate-500', success: 'bg-emerald-500',
    warning: 'bg-amber-500', error: 'bg-red-500', info: 'bg-sky-500', outline: 'bg-slate-400',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-[11px]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string; dot?: boolean }> = {
    en_attente: { variant: 'warning', label: 'En attente', dot: true },
    confirme:   { variant: 'info',    label: 'Confirmé',   dot: true },
    en_cours:   { variant: 'primary', label: 'En cours',   dot: true },
    termine:    { variant: 'success', label: 'Terminé',    dot: false },
    annule:     { variant: 'error',   label: 'Annulé',     dot: false },
    refuse:     { variant: 'error',   label: 'Refusé',     dot: false },
    absent:     { variant: 'error',   label: 'Absent',     dot: false },
    pret:       { variant: 'success', label: 'Prêt',       dot: true },
    livre:      { variant: 'info',    label: 'Livré',      dot: false },
    valide:     { variant: 'success', label: 'Validé',     dot: false },
  };

  const c = config[status] || { variant: 'secondary' as BadgeVariant, label: status, dot: false };
  return <Badge variant={c.variant} size="sm" showDot={c.dot} className={className}>{c.label}</Badge>;
}
