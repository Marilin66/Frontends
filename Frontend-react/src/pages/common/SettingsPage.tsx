// @ts-nocheck
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Avatar, Button } from '@/components/ui';
import {
  User, Lock, Bell, Globe, Shield, FileText, Phone, Info,
  ChevronRight, LogOut, HelpCircle
} from 'lucide-react';

interface SettingItem {
  icon: any;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Compte',
      items: [
        { icon: User, label: 'Mon profil', description: 'Modifier mes informations', href: '/profile' },
        { icon: Lock, label: 'Mot de passe', description: 'Changer mon mot de passe', href: '/profile/security/change-password' },
        { icon: Bell, label: 'Notifications', description: 'Gérer mes alertes', href: '/notifications' },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: Globe, label: 'Langue', description: 'Français', href: '/profile' },
      ],
    },
    {
      title: 'Informations',
      items: [
        { icon: Shield, label: 'Politique de confidentialité', href: '/privacy' },
        { icon: FileText, label: "Conditions d'utilisation", href: '/terms' },
        { icon: Info, label: 'À propos', description: 'Hopitel v1.0.0' },
        { icon: Phone, label: 'Urgences', href: '/emergency' },
      ],
    },
    {
      title: '',
      items: [
        { icon: LogOut, label: 'Déconnexion', onClick: logout, danger: true },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Profile card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={`${user?.first_name} ${user?.last_name}`} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
            Modifier
          </Button>
        </div>
      </Card>

      {/* Settings sections */}
      {sections.map((section, si) => (
        <div key={si}>
          {section.title && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{section.title}</p>
          )}
          <Card className="overflow-hidden p-0">
            {section.items.map((item, ii) => {
              const Icon = item.icon;
              const content = (
                <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${ii < section.items.length - 1 ? 'border-b border-slate-100' : ''} ${item.danger ? 'text-red-600' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.danger ? 'bg-red-50' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${item.danger ? 'text-red-500' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.danger ? 'text-red-600' : 'text-slate-900'}`}>{item.label}</p>
                    {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
                  </div>
                  {!item.danger && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </div>
              );

              if (item.onClick) return <button key={ii} className="w-full text-left" onClick={item.onClick}>{content}</button>;
              if (item.href) return <Link key={ii} to={item.href}>{content}</Link>;
              return <div key={ii}>{content}</div>;
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}
