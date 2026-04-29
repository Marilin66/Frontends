// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, Select } from '@/components/ui';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Calendar,
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  UserPlus
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    sexe: '',
    date_naissance: '',
    password: '',
    password_confirm: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
    clearError();
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Entrez un email valide';
    }
    
    if (!formData.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9+\s-]{8,}$/.test(formData.telephone)) {
      errors.telephone = 'Numéro de téléphone invalide';
    }
    
    if (!formData.sexe) {
      errors.sexe = 'Le genre est requis';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Les mots de passe ne correspondent pas';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await register({
        ...formData,
        password_confirm: formData.password,
      });
      navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div className="animate-fade-in py-10">
      <Card 
        className="shadow-2xl border-white relative overflow-hidden max-w-2xl mx-auto bg-white/80 backdrop-blur-xl ring-1 ring-primary/10" 
        padding="lg"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[120px]" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-light/5 rounded-tr-[50px]" />
        
        {/* Logo and Title */}
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight italic uppercase">
            Créer un compte
          </h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">
            Hopitel • Plateforme Digitale
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-xs text-error font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Prénom"
              name="first_name"
              placeholder="Ex: Jean"
              value={formData.first_name}
              onChange={handleChange}
              error={validationErrors.first_name}
              leftIcon={<User className="w-5 h-5 text-primary" />}
              className="bg-slate-50 border-slate-100 italic"
            />

            <Input
              label="Nom"
              name="last_name"
              placeholder="Ex: Kpomagan"
              value={formData.last_name}
              onChange={handleChange}
              error={validationErrors.last_name}
              leftIcon={<User className="w-5 h-5 text-primary" />}
              className="bg-slate-50 border-slate-100 italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="jean.k@email.com"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              leftIcon={<Mail className="w-5 h-5 text-primary" />}
              autoComplete="email"
              className="bg-slate-50 border-slate-100 italic"
            />

            <Input
              label="Téléphone"
              type="tel"
              name="telephone"
              placeholder="+229 XX XX XX XX"
              value={formData.telephone}
              onChange={handleChange}
              error={validationErrors.telephone}
              leftIcon={<Phone className="w-5 h-5 text-primary" />}
              className="bg-slate-50 border-slate-100 italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Genre"
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              error={validationErrors.sexe}
              className="rounded-xl bg-slate-50 border-slate-100 italic"
              options={[
                { value: '', label: 'Sélectionner...', disabled: true },
                { value: 'M', label: 'Masculin' },
                { value: 'F', label: 'Féminin' },
              ]}
            />

            <Input
              label="Date de naissance"
              type="date"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleChange}
              error={validationErrors.date_naissance}
              leftIcon={<Calendar className="w-5 h-5 text-primary" />}
              className="bg-slate-50 border-slate-100 italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
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
              className="bg-slate-50 border-slate-100 italic"
            />

            <Input
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              name="password_confirm"
              placeholder="••••••••"
              value={formData.password_confirm}
              onChange={handleChange}
              error={validationErrors.password_confirm}
              leftIcon={<Lock className="w-5 h-5 text-primary" />}
              className="bg-slate-50 border-slate-100 italic"
            />
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-xs font-black italic uppercase tracking-widest"
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>
          </div>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark transition-colors ml-1 underline decoration-2 underline-offset-4">
              Se connecter
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
