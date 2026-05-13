// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

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
    if (!form.telephone.trim())   e.telephone        = 'Requis';
    if (form.password.length < 6) e.password         = 'Minimum 6 caractères';
    if (form.password !== form.password_confirm)      e.password_confirm = 'Les mots de passe ne correspondent pas';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // Envoie sexe et role en dur comme le mobile
      await register({
        ...form,
        sexe: 'M',
        role: 'patient',
      });
      navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
    } catch (err: any) {
      // Les erreurs de validation du backend sont dans error.response.data
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const backendErrors: Record<string, string> = {};
        Object.entries(data).forEach(([key, val]) => {
          backendErrors[key] = Array.isArray(val) ? val[0] : String(val);
        });
        // Si erreur sur un champ spécifique, l'afficher sous le champ
        if (Object.keys(backendErrors).some(k => k !== 'error' && k !== 'detail' && k !== 'message')) {
          setFieldErrors(backendErrors);
        }
        // Sinon l'erreur globale est déjà gérée par AuthContext
      }
    }};

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
          Créer un compte Hopitel
        </h2>
        <p className="text-sm text-slate-500 font-medium">Rejoignez notre réseau de santé numérique.</p>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            placeholder="Jean"
            value={form.first_name}
            onChange={(e) => set('first_name', e.target.value)}
            error={fieldErrors.first_name}
            className="h-11 rounded-xl"
            autoComplete="given-name"
          />
          <Input
            label="Nom"
            placeholder="Dupont"
            value={form.last_name}
            onChange={(e) => set('last_name', e.target.value)}
            error={fieldErrors.last_name}
            className="h-11 rounded-xl"
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Adresse email"
          type="email"
          placeholder="jean.dupont@exemple.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={fieldErrors.email}
          className="h-11 rounded-xl"
          autoComplete="email"
        />

        <Input
          label="Téléphone"
          type="tel"
          placeholder="0100000000"
          value={form.telephone}
          onChange={(e) => set('telephone', e.target.value)}
          error={fieldErrors.telephone}
          helperText="Format : 10 chiffres commençant par 01"
          className="h-11 rounded-xl"
          autoComplete="tel"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={fieldErrors.password}
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="h-11 rounded-xl"
            autoComplete="new-password"
          />
          <Input
            label="Confirmation"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password_confirm}
            onChange={(e) => set('password_confirm', e.target.value)}
            error={fieldErrors.password_confirm}
            rightIcon={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowConfirm(!showConfirm)}
            className="h-11 rounded-xl"
            autoComplete="new-password"
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

      <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">DÉJÀ INSCRIT ?</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 font-medium">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
