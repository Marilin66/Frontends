// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Button, Input } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await api.post(endpoints.requestPasswordReset || '/accounts/request-password-reset/', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Vérifiez votre email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Email envoyé !</h2>
        <p className="text-sm text-slate-500">
          Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Mot de passe oublié</h2>
        <p className="text-sm text-slate-500 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />
        <Button type="submit" className="w-full h-11" isLoading={loading}>
          Envoyer le lien
        </Button>
      </form>

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
