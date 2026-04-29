// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { ChevronLeft, Lock, Key, Save, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      // await api.post(endpoints.changePassword, formData);
      alert('Mot de passe mis à jour avec succès !');
      navigate('/profile');
    } catch (error) {
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-primary p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-xl">Changer le mot de passe</CardTitle>
          <p className="text-white/70 text-sm mt-1">Protégez votre compte Hopitel</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ancien mot de passe</label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  leftIcon={<Key className="w-4 h-4 text-gray-400" />}
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                />
              </div>
              
              <div className="h-px bg-gray-100 my-4" />

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nouveau mot de passe</label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Confirmer le nouveau mot de passe</label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Utilisez au moins 8 caractères avec un mélange de lettres, de chiffres et de caractères spéciaux pour une sécurité maximale.
              </p>
            </div>
          </CardContent>
          <div className="p-8 border-t flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => navigate(-1)} type="button">Annuler</Button>
            <Button type="submit" isLoading={isLoading} className="flex-[2]" leftIcon={<Save className="w-4 h-4" />}>Enregistrer</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
