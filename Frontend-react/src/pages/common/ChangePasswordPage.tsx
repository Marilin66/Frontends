
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, Button, Input } from '@/components/ui';
import { ArrowLeft, Lock, Key, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });

  // Indicateur de force du mot de passe
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Très faible', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Faible', color: 'bg-orange-500' };
    if (score === 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
    if (score === 4) return { score, label: 'Fort', color: 'bg-blue-500' };
    return { score, label: 'Très fort', color: 'bg-emerald-500' };
  };

  const strength = getStrength(form.new_password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.new_password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.new_password === form.old_password) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }

    try {
      setSaving(true);
      // Appel à l'endpoint dédié change-password
      // Si le backend ne l'a pas encore, on utilise le reset via PATCH me
      // avec les champs old_password et new_password
      await api.post(endpoints.changePassword, {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2500);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.old_password) {
        setError(Array.isArray(data.old_password) ? data.old_password[0] : data.old_password);
      } else if (data?.new_password) {
        setError(Array.isArray(data.new_password) ? data.new_password[0] : data.new_password);
      } else if (data?.detail || data?.error) {
        setError(data.detail || data.error);
      } else if (err?.response?.status === 404) {
        // Endpoint non disponible — fallback via PATCH /me
        try {
          await api.patch(endpoints.me, {
            old_password: form.old_password,
            new_password: form.new_password,
          });
          setSuccess(true);
          setTimeout(() => navigate(-1), 2500);
        } catch (fallbackErr: any) {
          const fd = fallbackErr?.response?.data;
          setError(fd?.old_password?.[0] || fd?.detail || fd?.error || 'Mot de passe actuel incorrect.');
        }
      } else {
        setError('Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Mot de passe mis à jour</h2>
        <p className="text-sm text-slate-500 text-center">
          Votre mot de passe a été changé avec succès. Redirection en cours…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Changer le mot de passe</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sécurisez votre compte</p>
        </div>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mot de passe actuel */}
          <Input
            label="Mot de passe actuel"
            type={showOld ? 'text' : 'password'}
            placeholder="••••••••"
            required
            value={form.old_password}
            onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            leftIcon={<Key className="w-4 h-4" />}
            rightIcon={showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onRightIconClick={() => setShowOld(!showOld)}
          />

          <div className="border-t border-slate-100 pt-4 space-y-4">
            {/* Nouveau mot de passe */}
            <div>
              <Input
                label="Nouveau mot de passe"
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onRightIconClick={() => setShowNew(!showNew)}
              />
              {/* Indicateur de force */}
              {form.new_password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? 'text-red-500' :
                    strength.score === 2 ? 'text-orange-500' :
                    strength.score === 3 ? 'text-yellow-600' :
                    strength.score === 4 ? 'text-blue-600' : 'text-emerald-600'
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmer */}
            <Input
              label="Confirmer le nouveau mot de passe"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onRightIconClick={() => setShowConfirm(!showConfirm)}
              error={form.confirm && form.new_password !== form.confirm ? 'Les mots de passe ne correspondent pas' : ''}
            />
          </div>

          {/* Conseils */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <ul className="text-xs text-blue-700 space-y-0.5">
              <li>• Minimum 8 caractères</li>
              <li>• Mélangez majuscules, chiffres et symboles</li>
              <li>• Ne réutilisez pas un ancien mot de passe</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)} type="button">
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={saving}
              disabled={!form.old_password || !form.new_password || !form.confirm}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
