// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, Badge, Button, PageLoader } from '@/components/ui';
import { FileText, RefreshCw, ChevronRight, Calendar, User, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

function statusColor(statut: string) {
  const map: Record<string, string> = {
    en_cours:  'bg-blue-50 text-blue-700 border-blue-200',
    cloture:   'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[statut] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

function statusLabel(statut: string) {
  const map: Record<string, string> = { en_cours: 'En cours', cloture: 'Clôturée' };
  return map[statut] ?? statut;
}

export default function ConsultationsPage() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.consultations);
      setConsultations(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = consultations.filter(c =>
    (c.patient_nom ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.motif ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && consultations.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Consultations</h1>
          <p className="text-slate-500 mt-1">{consultations.length} consultation{consultations.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Actualiser
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher par patient ou motif…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Aucune consultation trouvée</p>
          <p className="text-slate-400 text-sm mt-1">Les consultations apparaissent après la fin des rendez-vous.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.rendez_vous_id ?? c.id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                hover
                padding="md"
                onClick={() => navigate(`/medecin/consultations/${c.rendez_vous_id ?? c.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">{c.patient_nom || 'Patient'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(c.est_cloture ? 'cloture' : 'en_cours')}`}>
                        {c.est_cloture ? 'Clôturée' : 'En cours'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{c.motif || 'Consultation générale'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {c.date_rdv ? new Date(c.date_rdv).toLocaleDateString('fr-FR') : '—'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
