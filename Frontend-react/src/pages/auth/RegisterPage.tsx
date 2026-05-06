// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Select } from '@/components/ui';
import { Mail, Lock, User, Phone, Calendar, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', telephone: '',
    sexe: '', date_naissance: '', password: '', password_confirm: '',
  });

  const set = (key: string, val: string) => {
    setForm({ ...form, [key]: val });
    if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: '' });
    clearError();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'Requis';
    if (!form.last_name.trim()) e.last_name = 'Requis';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.telephone.trim()) e.telephone = 'Requis';
    if (!form.sexe) e.sexe = 'Requis';
    if (!form.date_naissance) e.date_naissance = 'Requis';
    if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    if (form.password !== form.password_confirm) e.password_confirm = 'Ne correspond pas';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({ ...form });
      navigate('/login', { state: { message: 'Compte créé ! Vérifiez votre email pour activer votre compte.' } });
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Créer un compte</h2>
        <p className="text-sm text-slate-500 mt-1">Rejoignez la plateforme Hopitel</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" placeholder="Jean" value={form.first_name}
            onChange={(e) => set('first_name', e.target.value)} error={fieldErrors.first_name}
            leftIcon={<User className="w-4 h-4" />} />
          <Input label="Nom" placeholder="Kpomagan" value={form.last_name}
            onChange={(e) => set('last_name', e.target.value)} error={fieldErrors.last_name}
            leftIcon={<User className="w-4 h-4" />} />
        </div>

        <Input label="Email" type="email" placeholder="vous@exemple.com" value={form.email}
          onChange={(e) => set('email', e.target.value)} error={fieldErrors.email}
          leftIcon={<Mail className="w-4 h-4" />} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Téléphone" type="tel" placeholder="+229 XX XX XX" value={form.telephone}
            onChange={(e) => set('telephone', e.target.value)} error={fieldErrors.telephone}
            leftIcon={<Phone className="w-4 h-4" />} />
          <Select label="Genre" value={form.sexe}
            onChange={(e) => set('sexe', e.target.value)} error={fieldErrors.sexe}
            options={[{ value: '', label: 'Choisir...', disabled: true }, { value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]} />
        </div>

        <Input label="Date de naissance" type="date" value={form.date_naissance}
          onChange={(e) => set('date_naissance', e.target.value)} error={fieldErrors.date_naissance}
          leftIcon={<Calendar className="w-4 h-4" />} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Mot de passe" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
            value={form.password} onChange={(e) => set('password', e.target.value)} error={fieldErrors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowPassword(!showPassword)} />
          <Input label="Confirmer" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
            value={form.password_confirm} onChange={(e) => set('password_confirm', e.target.value)}
            error={fieldErrors.password_confirm} leftIcon={<Lock className="w-4 h-4" />} />
        </div>

        <Button type="submit" className="w-full h-11 mt-2" isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}>
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Déjà inscrit ?{' '}
        <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
