
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button } from '@/components/ui';
import {
  ArrowLeft, Lock, Shield, ShieldCheck, ShieldAlert,
  ChevronRight, Mail, Smartphone, Key, AlertTriangle
} from 'lucide-react';

export default function SecurityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const securityItems = [
    {
      icon: Lock,
      label: 'Mot de passe',
      description: 'Modifier votre mot de passe de connexion',
      action: () => navigate('/patient/profile/security/change-password'),
      status: null,
      statusColor: '',
    },
    {
      icon: Mail,
      label: 'Email vérifié',
      description: user?.is_email_verified
        ? 'Votre adresse email est confirmée'
        : 'Votre adresse email n\'est pas encore vérifiée',
      action: null,
      status: user?.is_email_verified ? 'Vérifié' : 'Non vérifié',
      statusColor: user?.is_email_verified ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50',
    },
    {
      icon: Smartphone,
      label: 'Téléphone',
      description: user?.telephone || 'Aucun numéro enregistré',
      action: null,
      status: user?.telephone ? 'Enregistré' : null,
      statusColor: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <div className="max-w-lg space-y-5 animate-fade-in pb-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sécurité du compte</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gérez la sécurité de votre compte</p>
        </div>
      </div>

      {/* Statut global */}
      <Card className="p-4">
        <div className={`flex items-center gap-3 p-3 rounded-xl ${user?.is_email_verified ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
          {user?.is_email_verified
            ? <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            : <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${user?.is_email_verified ? 'text-emerald-800' : 'text-amber-800'}`}>
              {user?.is_email_verified ? 'Compte sécurisé' : 'Sécurité à améliorer'}
            </p>
            <p className={`text-xs mt-0.5 ${user?.is_email_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {user?.is_email_verified
                ? 'Votre compte est protégé par une authentification sécurisée'
                : 'Vérifiez votre adresse email pour renforcer la sécurité'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Éléments de sécurité */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Paramètres de sécurité</p>
        <Card className="overflow-hidden p-0">
          {securityItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onClick={item.action || undefined}
                className={`flex items-center gap-3 px-4 py-4 border-b border-slate-50 last:border-0 ${item.action ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
                </div>
                {item.status && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                    {item.status}
                  </span>
                )}
                {item.action && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              </div>
            );
          })}
        </Card>
      </div>

      {/* Changer le mot de passe — CTA principal */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Changer le mot de passe</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Nous vous recommandons de changer votre mot de passe régulièrement.
            </p>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={() => navigate('/patient/profile/security/change-password')}
          leftIcon={<Lock className="w-4 h-4" />}
        >
          Modifier le mot de passe
        </Button>
      </Card>

      {/* Conseils de sécurité */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Conseils de sécurité</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                Utilisez un mot de passe unique d'au moins 8 caractères
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                Mélangez majuscules, minuscules, chiffres et symboles
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                Ne partagez jamais vos identifiants de connexion
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                Déconnectez-vous après chaque session sur un appareil partagé
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
