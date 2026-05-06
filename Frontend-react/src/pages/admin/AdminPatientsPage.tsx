// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, Avatar, PageLoader } from '@/components/ui';
import { Users, Search, RefreshCw, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.hopitalPatients);
      setPatients(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.first_name ?? '').toLowerCase().includes(q) ||
      (p.last_name ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  if (loading && patients.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} enregistré{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un patient…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total patients',  value: patients.length,                                          color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Users },
          { label: 'Actifs',          value: patients.filter(p => p.is_active).length,                 color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle },
          { label: 'Inactifs',        value: patients.filter(p => !p.is_active).length,                color: 'text-slate-500',  bg: 'bg-slate-100', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {search ? `Aucun résultat pour "${search}"` : 'Aucun patient enregistré'}
          </p>
          <p className="text-slate-400 text-sm mt-1">Les patients ayant eu un RDV dans votre hôpital apparaissent ici.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => {
            const initials = `${(p.first_name ?? '')[0] ?? ''}${(p.last_name ?? '')[0] ?? ''}`.toUpperCase();
            return (
              <motion.div key={p.id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                      {initials || <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{p.first_name} {p.last_name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {p.email && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {p.email}
                          </span>
                        )}
                        {p.telephone && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="w-3 h-3 shrink-0" /> {p.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${p.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
