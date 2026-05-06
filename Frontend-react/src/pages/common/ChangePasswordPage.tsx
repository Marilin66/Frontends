// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, Button, Input } from '@/components/ui';
import { ArrowLeft, Lock, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      setSaving(true);
      // PATCH /api/accounts/users/me/ avec les champs password
      await api.patch(endpoints.me, {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      setError(err.response?.data?.old_password?.[0] || err.response?.data?.detail || 'Erreur lors du changement de mot de passe.');
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
        <p className="text-sm text-slate-500 text-center">Votre mot de passe a été changé avec succès.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Changer le mot de passe</h1>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

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

          <div className="border-t border-slate-100 pt-4">
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
          </div>

          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            error={form.confirm && form.new_password !== form.confirm ? 'Les mots de passe ne correspondent pas' : ''}
          />

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Minimum 8 caractères avec lettres et chiffres.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)} type="button">Annuler</Button>
            <Button type="submit" className="flex-1" isLoading={saving}>Enregistrer</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
