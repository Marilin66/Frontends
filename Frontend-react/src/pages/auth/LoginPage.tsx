// @ts-nocheck
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const successMessage = location.state?.message;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email invalide';
    if (!password) errors.password = 'Mot de passe requis';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login({ email, password }, stayLoggedIn);
      // Redirection gérée par DashboardRedirect dans App.tsx
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Bouton retour vers l'accueil */}
      <div className="flex items-center justify-start">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Connexion à Hopitel
        </h2>
        <p className="text-sm text-slate-500 font-medium">Saisissez vos identifiants pour accéder à votre espace.</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Message de succès */}
      {successMessage && !error && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          placeholder="nom@exemple.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
          error={fieldErrors.email}
          className="h-11 rounded-xl"
          autoComplete="email"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
            <Link to="/forgot-password" size="sm" className="text-xs text-primary hover:underline font-bold">
              Oublié ?
            </Link>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
            error={fieldErrors.password}
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="h-11 rounded-xl"
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center py-1">
          <input
            id="stay-logged-in"
            type="checkbox"
            checked={stayLoggedIn}
            onChange={(e) => setStayLoggedIn(e.target.checked)}
            className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="stay-logged-in" className="ml-2 text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer select-none">
            Rester connecté(e)
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          isLoading={isLoading}
        >
          Se connecter
        </Button>
      </form>

      <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">OU</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 font-medium">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary hover:underline font-bold">
          Créer un accès
        </Link>
      </p>
    </div>
  );
}
