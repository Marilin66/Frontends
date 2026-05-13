// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Avatar, PageLoader, Pagination, usePagination } from '@/components/ui';
import { Users, Search, RefreshCw, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_SIZE = 15;

export default function AdminPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);

  if (loading && patients.length === 0) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} enregistré{patients.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un patient…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-64 pl-9 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total patients', value: patients.length,                          icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
          { label: 'Actifs',         value: patients.filter(p => p.is_active).length, icon: CheckCircle,  color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
          { label: 'Inactifs',       value: patients.filter(p => !p.is_active).length,icon: XCircle,      color: 'text-slate-500',  bg: 'bg-slate-100', border: 'border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {search ? `Aucun résultat pour "${search}"` : 'Aucun patient enregistré'}
          </p>
          {!search && <p className="text-xs text-slate-400 mt-1">Les patients ayant eu un RDV dans votre hôpital apparaissent ici.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((p, i) => {
            const initials = `${(p.first_name ?? '')[0] ?? ''}${(p.last_name ?? '')[0] ?? ''}`.toUpperCase();
            return (
              <motion.div key={p.id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
                      {initials || <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.first_name} {p.last_name}</p>
                      <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                        {p.email && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {p.email}
                          </span>
                        )}
                        {p.telephone && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3 shrink-0" /> {p.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => navigate(`/admin-hopital/patient/${p.id}/journey`)}
                         className="h-9 px-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                       >
                         Voir le parcours
                       </button>
                       <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                         {p.is_active ? 'Actif' : 'Inactif'}
                       </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </motion.div>
  );
}
