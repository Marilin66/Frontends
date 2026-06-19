import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    password: '',
    password_confirm: '',
  });

  const set = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }));
    if (error) clearError();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim())  e.first_name       = 'Requis';
    if (!form.last_name.trim())   e.last_name        = 'Requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.telephone.trim()) {
      e.telephone = 'Requis';
    } else if (!/^(\+229)?\d{8,10}$/.test(form.telephone.trim())) {
      e.telephone = 'Le numéro doit être béninois valide (8 ou 10 chiffres).';
    }
    if (form.password.length < 6) e.password         = 'Minimum 6 caractères';
    if (form.password !== form.password_confirm)      e.password_confirm = 'Les mots de passe ne correspondent pas';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const normalizedPhone = form.telephone.trim().startsWith('+')
        ? form.telephone.trim()
        : `+229${form.telephone.trim()}`;

      await register({
        ...form,
        telephone: normalizedPhone,
        sexe: 'M',
        role: 'patient',
      });
      sessionStorage.setItem('verification_email', form.email);
      sessionStorage.setItem('verification_phone', normalizedPhone);
      navigate('/verify-code', { state: { email: form.email, telephone: normalizedPhone, message: 'Inscription réussie ! Veuillez saisir le code à 6 chiffres reçu.' } });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const backendErrors: Record<string, string> = {};
        Object.entries(data).forEach(([key, val]) => {
          backendErrors[key] = Array.isArray(val) ? val[0] : String(val);
        });
        if (Object.keys(backendErrors).some(k => k !== 'error' && k !== 'detail' && k !== 'message')) {
          setFieldErrors(backendErrors);
        }
      }
    }
  };

  const InputField = ({ 
    label, value, onChange, error, placeholder, type = 'text', autoComplete, icon: Icon, rightIcon, onRightIconClick 
  }: { 
    label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string;
    type?: string; autoComplete?: string; icon: any; rightIcon?: any; onRightIconClick?: () => void;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 pl-11 ${rightIcon ? 'pr-11' : 'pr-4'} bg-slate-50 dark:bg-slate-800/50 border ${error ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
          autoComplete={autoComplete}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );

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
          <UserPlus className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Créer un compte
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Rejoignez notre réseau de santé numérique.
        </p>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Prénom"
            value={form.first_name}
            onChange={(v) => set('first_name', v)}
            error={fieldErrors.first_name}
            placeholder="Jean"
            icon={User}
            autoComplete="given-name"
          />
          <InputField
            label="Nom"
            value={form.last_name}
            onChange={(v) => set('last_name', v)}
            error={fieldErrors.last_name}
            placeholder="Dupont"
            icon={User}
            autoComplete="family-name"
          />
        </div>

        <InputField
          label="Adresse email"
          type="email"
          value={form.email}
          onChange={(v) => set('email', v)}
          error={fieldErrors.email}
          placeholder="jean.dupont@exemple.com"
          icon={Mail}
          autoComplete="email"
        />

        <InputField
          label="Numéro WhatsApp"
          type="tel"
          value={form.telephone}
          onChange={(v) => set('telephone', v)}
          error={fieldErrors.telephone}
          placeholder="+229XXXXXXXX ou XXXXXXXX"
          icon={Phone}
          autoComplete="tel"
        />
        {!fieldErrors.telephone && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium -mt-2">
            Format béninois requis : 8 ou 10 chiffres (avec ou sans +229)
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(v) => set('password', v)}
            error={fieldErrors.password}
            placeholder="••••••••"
            icon={Lock}
            autoComplete="new-password"
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          <InputField
            label="Confirmation"
            type={showConfirm ? 'text' : 'password'}
            value={form.password_confirm}
            onChange={(v) => set('password_confirm', v)}
            error={fieldErrors.password_confirm}
            placeholder="••••••••"
            icon={Lock}
            autoComplete="new-password"
            rightIcon={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowConfirm(!showConfirm)}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          isLoading={isLoading}
        >
          Finaliser l'inscription
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest">DÉJÀ INSCRIT ?</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
