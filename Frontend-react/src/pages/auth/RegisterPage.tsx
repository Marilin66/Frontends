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
    <div className="space-y-5">
      {/* Bouton retour vers l'accueil */}
      <div className="flex items-center gap-2 mb-2">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Titre */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-primary">Créer un compte</h2>
        <p className="text-sm text-slate-500 mt-1">Inscription patient</p>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Prénom */}
        <Input
          label="Prénom"
          placeholder="Jean"
          value={form.first_name}
          onChange={(e) => set('first_name', e.target.value)}
          error={fieldErrors.first_name}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="given-name"
        />

        {/* Nom */}
        <Input
          label="Nom"
          placeholder="Kpomagan"
          value={form.last_name}
          onChange={(e) => set('last_name', e.target.value)}
          error={fieldErrors.last_name}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="family-name"
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={fieldErrors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        {/* Téléphone */}
        <Input
          label="Téléphone"
          type="tel"
          placeholder="0199395776"
          value={form.telephone}
          onChange={(e) => set('telephone', e.target.value)}
          error={fieldErrors.telephone}
          helperText="Format Bénin : 10 chiffres commençant par 01 (ex: 0199395776)"
          leftIcon={<Phone className="w-4 h-4" />}
          autoComplete="tel"
        />

        {/* Mot de passe */}
        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={fieldErrors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
        />

        {/* Confirmer mot de passe */}
        <Input
          label="Confirmer le mot de passe"
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password_confirm}
          onChange={(e) => set('password_confirm', e.target.value)}
          error={fieldErrors.password_confirm}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          onRightIconClick={() => setShowConfirm(!showConfirm)}
          autoComplete="new-password"
        />

        {/* Bouton */}
        <Button
          type="submit"
          className="w-full h-12 mt-2"
          isLoading={isLoading}
        >
          S'inscrire
        </Button>
      </form>

      {/* Lien connexion */}
      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
