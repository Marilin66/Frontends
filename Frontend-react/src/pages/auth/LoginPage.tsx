// @ts-nocheck
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const successMessage = location.state?.message;

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Entrez un email valide';
    }
    
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) return;
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      // Error is handled by context
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] as any,
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-12"
    >
      <Card 
        className="shadow-lg border-slate-200 relative overflow-hidden ring-1 ring-slate-200 bg-white" 
        padding="md"
      >
        {/* Background Decorative Blob */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 relative">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-[2rem] mb-6 shadow-md shadow-primary/15 border border-white"
          >
            <span className="text-white font-black text-3xl sm:text-4xl tracking-tighter">H</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight italic uppercase">
            Connexion<span className="text-primary">.</span>
          </h1>
          <p className="text-slate-400 font-bold tracking-[0.2em] text-[9px] sm:text-[10px] uppercase italic">
            Hopitel
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-xs text-error font-bold leading-relaxed">{error}</p>
            </motion.div>
          )}
          {successMessage && !error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-600 font-bold leading-relaxed">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10">
          <motion.div variants={itemVariants}>
            <Input
              label="Adresse Email"
              type="email"
              placeholder="votre.nom@hopitel.bj"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: '' });
                }
              }}
              error={validationErrors.email}
              leftIcon={<Mail className="w-5 h-5 text-primary" />}
              autoComplete="email"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
             <div className="flex items-center justify-between mb-2 px-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Mot de passe</label>
               <Link
                 to="/forgot-password"
                 className="text-[9px] sm:text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-[0.1em] italic"
               >
                 Oublié ?
               </Link>
             </div>
             <Input
               type={showPassword ? 'text' : 'password'}
               placeholder="••••••••••••"
               value={password}
               onChange={(e) => {
                 setPassword(e.target.value);
                 if (validationErrors.password) {
                   setValidationErrors({ ...validationErrors, password: '' });
                 }
               }}
               error={validationErrors.password}
               leftIcon={<Lock className="w-5 h-5 text-primary" />}
               rightIcon={
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="text-slate-400 hover:text-primary transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               }
               autoComplete="current-password"
               className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"
             />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl shadow-md shadow-primary/15 text-xs font-black italic uppercase tracking-widest"
              isLoading={isLoading}
            >
              Se Connecter <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </form>

        <motion.p 
          variants={itemVariants}
          className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic"
        >
          Nouveau sur la plateforme ?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark transition-colors ml-1 underline decoration-2 underline-offset-4">
            Créer un compte
          </Link>
        </motion.p>
      </Card>
    </motion.div>
  );
}
