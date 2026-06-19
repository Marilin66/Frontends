
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { PageLoader, Pagination, usePagination } from '@/components/ui';
import { Users, Search, Mail, Phone, Calendar, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 15;

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  sexe?: string;
}

export default function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      // Tous les rôles utilisent le même endpoint — le backend filtre selon l'utilisateur connecté
      const response: any = await api.get(endpoints.patients);
      const data = Array.isArray(response) ? response : response.results ?? [];
      setPatients(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);

  if (isLoading && patients.length === 0) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Patients</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} enregistré{patients.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-64 pl-9 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
            />
          </div>
          <button onClick={fetchPatients} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total patients',    value: patients.length,                      icon: Users,   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
          { label: 'Résultats filtrés', value: filtered.length,                      icon: Search,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { label: 'Avec email',        value: patients.filter(p => p.email).length, icon: Mail,    color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
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

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun patient'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((p, i) => {
            const initials = `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase();
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
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
                        {p.date_naissance && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/medecin/messagerie')}
                      className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shrink-0"
                      title="Envoyer un message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
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
