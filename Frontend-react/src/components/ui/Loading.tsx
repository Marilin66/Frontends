// @ts-nocheck
import React from 'react';
import { Loader2, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
       <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse`} />
       <Loader2 className={`animate-spin text-primary relative z-10 ${sizes[size]} ${className}`} />
    </div>
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
}

export function LoadingOverlay({ isLoading, children }: LoadingOverlayProps) {
  return (
    <div className="relative w-full h-full">
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-[100] rounded-[3rem]"
          >
            <div className="bg-white p-12 rounded-[2.5rem] shadow-premium-hover border border-slate-50 text-center space-y-4">
              <Spinner size="lg" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Analyse_Locale_Active</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-8 relative overflow-hidden font-sans">
      {/* Immersive Viewport Decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />
      <div className="absolute inset-0 bg-mesh opacity-[0.03]" />
      
      <div className="text-center relative z-10">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="mb-16"
        >
          <div className="relative inline-block group">
             <div className="absolute inset-0 bg-primary/30 rounded-[3rem] blur-3xl animate-pulse group-hover:scale-125 transition-transform" />
             <div className="relative w-32 h-32 bg-primary rounded-[3rem] flex items-center justify-center shadow-3xl shadow-primary/40">
                <Activity className="text-white w-16 h-16 animate-pulse" />
             </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mt-12 mb-4 italic italic">HOPITEL.</h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-1 shadow-glow-sm w-12 bg-primary rounded-full" />
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] italic">Elite_Terminal v4.0</span>
             <div className="h-1 shadow-glow-sm w-12 bg-primary rounded-full" />
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  delay: i * 0.2 
                }}
                className="w-3 h-3 bg-primary rounded-lg shadow-glow-sm" 
              />
            ))}
          </div>
          
          <div className="px-10 py-4 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/5 inline-flex items-center gap-4">
             <ShieldCheck className="w-4 h-4 text-primary" />
             <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] italic">Initialisation du segment d'accès sécurisé</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ 
  className = '', 
  variant = 'text' 
}: { 
  className?: string; 
  variant?: 'text' | 'circular' | 'rectangular';
}) {
  const variants = {
    text: 'h-4 rounded-xl',
    circular: 'rounded-full',
    rectangular: 'rounded-[2rem]',
  };

  return (
    <div className={`
      relative overflow-hidden bg-slate-100
      ${variants[variant]} 
      ${className}
    `}>
       <motion.div 
         initial={{ x: '-100%' }}
         animate={{ x: '100%' }}
         transition={{
           duration: 2,
           repeat: Infinity,
           ease: "linear",
         }}
         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
       />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[3rem] shadow-premium p-10 border border-slate-50">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton variant="circular" className="w-16 h-16" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="h-6 w-1/3" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-48 w-full mb-8" />
      <div className="flex gap-4">
        <Skeleton variant="rectangular" className="h-14 w-32 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-14 w-32 rounded-2xl" />
      </div>
    </div>
  );
}
