import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

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
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div className="flex items-center justify-start">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Connexion
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Saisissez vos identifiants pour accéder à votre espace.
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Message de succès */}
      {successMessage && !error && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
              className={`w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border ${fieldErrors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-bold">
              Oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
              className={`w-full h-12 pl-11 pr-12 bg-slate-50 dark:bg-slate-800/50 border ${fieldErrors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center py-1">
          <input
            id="stay-logged-in"
            type="checkbox"
            checked={stayLoggedIn}
            onChange={(e) => setStayLoggedIn(e.target.checked)}
            className="w-4.5 h-4.5 text-primary border-slate-300 dark:border-slate-600 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="stay-logged-in" className="ml-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer select-none">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest">OU</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary hover:underline font-bold">
          Créer un accès
        </Link>
      </p>
    </div>
  );
}
