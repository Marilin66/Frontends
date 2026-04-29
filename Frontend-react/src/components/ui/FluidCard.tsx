// @ts-nocheck
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
        'relative overflow-hidden',
        className
      )}
      style={{
        boxShadow: hasShadow
          ? '0 10px 25px -5px rgba(21, 101, 192, 0.1), 0 20px 25px -5px rgba(21, 101, 192, 0.04)'
          : 'none',
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
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      {CardContent}
    </motion.div>
  );
}
