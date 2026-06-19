
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FluidCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: string;
  borderRadius?: string;
  hasShadow?: boolean;
  color?: string;
}

export function FluidCard({
  children,
  onClick,
  className,
  padding = 'p-6',
  borderRadius = 'rounded-2xl',
  hasShadow = true,
  color = 'bg-white',
}: FluidCardProps) {
  const CardContent = (
    <div
      className={cn(
        color,
        padding,
        borderRadius,
        'relative overflow-hidden transition-all duration-200',
        onClick ? 'cursor-pointer hover:shadow-card-lg' : '',
        className
      )}
      style={{
        boxShadow: hasShadow
          ? '0 10px 25px -5px rgba(21, 101, 192, 0.1), 0 20px 25px -5px rgba(21, 101, 192, 0.04)'
          : 'none',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {children}
    </div>
  );

  if (!onClick) {
    return CardContent;
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      {CardContent}
    </motion.div>
  );
}
