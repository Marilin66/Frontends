// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Badge, Button, PageLoader } from '@/components/ui';
import { Bell, Calendar, FileText, MessageCircle, AlertTriangle, CheckCheck, Check } from 'lucide-react';

function getIcon(type: string) {
  switch (type) {
    case 'rdv_confirme':
    case 'rdv_refuse':
    case 'rdv_annule':    return { icon: Calendar,      color: 'text-blue-600',    bg: 'bg-blue-50' };
    case 'resultat':      return { icon: FileText,      color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'message':       return { icon: MessageCircle, color: 'text-violet-600',  bg: 'bg-violet-50' };
    case 'alerte':        return { icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50' };
    default:              return { icon: Bell,          color: 'text-slate-500',   bg: 'bg-slate-100' };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.notifications)
      .then((data: any) => setNotifications(Array.isArray(data) ? data : data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.post(endpoints.markAllRead);
      setNotifications(notifications.map(n => ({ ...n, est_lu: true })));
    } catch (e) { console.error(e); }
  };

  const markOne = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, est_lu: true } : n));
    } catch (e) { console.error(e); }
  };

  const unread = notifications.filter(n => !n.est_lu).length;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">
            {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
            Tout marquer lu
          </Button>
        )}
      </div>

      {/* Liste */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-medium text-slate-500">Aucune notification</p>
          <p className="text-sm text-slate-400 mt-1">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-50">
          {notifications.map((notif) => {
            const { icon: Icon, color, bg } = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${!notif.est_lu ? 'bg-blue-50/30' : ''}`}
              >
                {/* Indicateur non lu */}
                <div className="flex-shrink-0 mt-1">
                  {!notif.est_lu && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                  {notif.est_lu && <div className="w-2 h-2" />}
                </div>

                {/* Icône */}
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!notif.est_lu ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.created_at || notif.cree_le).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Action marquer lu */}
                {!notif.est_lu && (
                  <button
                    onClick={() => markOne(notif.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
