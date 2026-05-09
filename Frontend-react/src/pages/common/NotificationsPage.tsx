// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Button, PageLoader } from '@/components/ui';
import { Bell, Calendar, FileText, MessageCircle, AlertTriangle, CheckCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getIcon(type: string) {
  switch (type) {
    case 'rdv_confirme':
    case 'rdv_refuse':
    case 'rdv_annule':    return { icon: Calendar,      color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' };
    case 'resultat':      return { icon: FileText,      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    case 'message':       return { icon: MessageCircle, color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' };
    case 'alerte':        return { icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' };
    default:              return { icon: Bell,          color: 'text-slate-500',   bg: 'bg-slate-100',  border: 'border-slate-200' };
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
      setNotifications(notifications.map(n => ({ ...n, est_lu: true, lu: true })));
    } catch (e) { console.error(e); }
  };

  const markOne = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, est_lu: true, lu: true } : n));
    } catch (e) { console.error(e); }
  };

  // Normalise les champs selon ce que le backend renvoie (est_lu ou lu)
  const isRead = (n: any) => n.est_lu === true || n.lu === true;

  const unread = notifications.filter(n => !isRead(n)).length;

  if (loading) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20 max-w-2xl">

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </section>

      {/* Liste */}
      {notifications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucune notification</p>
          <p className="text-xs text-slate-400 mt-1">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-50">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const { icon: Icon, color, bg, border } = getIcon(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${!isRead(notif) ? 'bg-primary/5' : ''}`}
                >
                  {/* Indicateur non lu */}
                  <div className="flex-shrink-0 mt-2.5">
                    {!isRead(notif)
                      ? <div className="w-2 h-2 bg-primary rounded-full" />
                      : <div className="w-2 h-2" />
                    }
                  </div>

                  {/* Icône */}
                  <div className={`w-9 h-9 ${bg} border ${border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!isRead(notif) ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(() => {
                        const raw = notif.created_at || notif.cree_le || notif.date_creation;
                        if (!raw) return '';
                        const d = new Date(raw);
                        if (isNaN(d.getTime())) return '';
                        return d.toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        });
                      })()}
                    </p>
                  </div>

                  {/* Action marquer lu */}
                  {!isRead(notif) && (
                    <button
                      onClick={() => markOne(notif.id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                      title="Marquer comme lu"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
