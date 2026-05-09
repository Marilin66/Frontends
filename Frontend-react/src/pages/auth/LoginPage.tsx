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
      await login({ email, password });
      // Redirection gérée par DashboardRedirect dans App.tsx
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* Bouton retour vers l'accueil */}
      <div className="flex items-center gap-2 mb-2">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Connexion</h2>
        <p className="text-sm text-slate-500 mt-1">Accédez à votre espace santé</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {successMessage && !error && (
        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
          error={fieldErrors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
            error={fieldErrors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
