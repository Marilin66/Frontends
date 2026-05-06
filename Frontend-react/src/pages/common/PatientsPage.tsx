// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, PageLoader } from '@/components/ui';
import { Users, Search, Mail, Phone, Calendar, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      let endpoint = endpoints.patients;
      if (user?.role === 'admin_hopital') endpoint = endpoints.hopitalPatients;
      const response: any = await api.get(endpoint);
      const data = Array.isArray(response) ? response : response.results ?? [];
      setPatients(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && patients.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Patients</h1>
          <p className="text-slate-500 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchPatients} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total patients', value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Résultats filtrés', value: filtered.length, icon: Search, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avec email', value: patients.filter(p => p.email).length, icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-200 mb-4" />
          <p className="font-medium text-slate-500">{searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun patient'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => {
            const initials = `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase();
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-card-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
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
                        {p.date_naissance && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Action messagerie */}
                    <button
                      onClick={() => navigate('/medecin/messagerie')}
                      className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shrink-0"
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
    </div>
  );
}

