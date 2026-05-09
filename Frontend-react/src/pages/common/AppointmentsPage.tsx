// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Plus,
  ClipboardList,
  CheckCircle,
  MessageSquare,
  Info
} from 'lucide-react';
import { Button, StatusBadge, Pagination, usePagination } from '@/components/ui';
import { ConfirmModal, ErrorModal } from '@/components/ui';
import { api, endpoints } from '@/services/api';

const PAGE_SIZE = 10;

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get<any>(endpoints.rendezVous);
      setAppointments(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancelConfirm(null);
    try {
      await api.post(endpoints.annulerRdv(id));
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, statut: 'annule' } : a));
    } catch {
      setErrorMsg("Impossible d'annuler ce rendez-vous.");
    }
  };

  // Normalise les champs — le backend retourne medecin_nom, date_heure, hopital_nom
  const normalize = (apt: any) => {
    const dateHeure = apt.date_heure || apt.date || '';
    const dateObj = dateHeure ? new Date(dateHeure) : null;
    return {
      ...apt,
      _date: dateObj
        ? dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
        : '—',
      _heure: dateObj
        ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '—',
      _medecin: apt.medecin_nom || apt.doctor_name || '—',
      _service: apt.medecin_specialite || apt.service_name || apt.service_nom || '',
      _hopital: apt.hopital_nom || apt.hopital_name || '',
    };
  };

  const filteredAppointments = appointments
    .filter(apt => filter === 'all' || apt.statut === filter)
    .map(normalize);

  const { paged: pagedAppointments, totalItems, totalPages } = usePagination(filteredAppointments, PAGE_SIZE, page);

  const FILTERS = [
    { key: 'all',        label: 'Tous' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'confirme',   label: 'Confirmés' },
    { key: 'termine',    label: 'Terminés' },
    { key: 'annule',     label: 'Annulés' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Rendez-Vous</h1>
          <p className="text-slate-500 mt-1">{appointments.length} rendez-vous au total</p>
        </div>
        <Button onClick={() => navigate('/patient/search')} leftIcon={<Plus className="w-4 h-4" />}>
          Nouveau RDV
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit overflow-x-auto">
        {FILTERS.map(f => {
          const count = f.key === 'all'
            ? appointments.length
            : appointments.filter(a => a.statut === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                filter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  filter === f.key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-semibold text-slate-500">Aucun rendez-vous</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter !== 'all' ? 'Aucun RDV avec ce statut' : 'Prenez votre premier rendez-vous'}
          </p>
          {filter === 'all' && (
            <Button className="mt-4" onClick={() => navigate('/patient/search')}>
              <Plus className="w-4 h-4 mr-2" /> Trouver un médecin
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pagedAppointments.map((apt, idx) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <div className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                apt.statut === 'confirme'   ? 'border-blue-200' :
                apt.statut === 'en_attente' ? 'border-amber-200' :
                apt.statut === 'termine'    ? 'border-emerald-200' :
                'border-slate-200'
              }`}>
                <div className="flex items-start gap-4">

                  {/* Bloc date/heure */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center shrink-0 min-w-[68px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{apt._date.split(' ')[0]}</p>
                    <p className="text-lg font-black text-slate-900 leading-none mt-0.5">{apt._heure}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {apt._date.split(' ').slice(1).join(' ')}
                    </p>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-slate-900">Dr. {apt._medecin}</p>
                        {apt._service && (
                          <p className="text-xs text-slate-500 mt-0.5">{apt._service}</p>
                        )}
                      </div>
                      <StatusBadge status={apt.statut} className="shrink-0" />
                    </div>

                    {apt._hopital && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {apt._hopital}
                      </div>
                    )}

                    {apt.motif && (
                      <p className="text-xs text-slate-400 italic mt-1">"{apt.motif}"</p>
                    )}

                    {/* Bandeaux contextuels */}
                    {apt.statut === 'en_attente' && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                        <Info className="w-3 h-3 shrink-0" />
                        En attente de confirmation par le médecin
                      </div>
                    )}
                    {apt.statut === 'confirme' && !apt.pre_enregistrement && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                        <ClipboardList className="w-3 h-3 shrink-0" />
                        Pensez à remplir votre fiche pré-consultation avant le RDV
                      </div>
                    )}
                    {apt.statut === 'confirme' && apt.pre_enregistrement && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-1.5">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        Fiche envoyée — votre médecin est informé de vos symptômes
                      </div>
                    )}
                    {apt.statut === 'termine' && apt.has_consultation && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        Consultation terminée — compte rendu disponible
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  {/* Pré-consultation */}
                  {(apt.statut === 'confirme' || apt.statut === 'en_attente') && (
                    <Link
                      to={`/patient/rdv/${apt.id}/intake/${encodeURIComponent(apt._medecin)}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        apt.pre_enregistrement
                          ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {apt.pre_enregistrement
                        ? <><CheckCircle className="w-3.5 h-3.5" /> Fiche envoyée</>
                        : <><ClipboardList className="w-3.5 h-3.5" /> Pré-consultation</>
                      }
                    </Link>
                  )}

                  {/* Messagerie */}
                  {apt.has_consultation && apt.consultation_id && (
                    <Link
                      to="/patient/messagerie"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Messages
                    </Link>
                  )}

                  {/* Annuler */}
                  {(apt.statut === 'en_attente' || apt.statut === 'confirme') && (
                    <button
                      onClick={() => setCancelConfirm(apt.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-all ml-auto"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAppointments.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <ConfirmModal
        open={cancelConfirm !== null}
        title="Annuler ce rendez-vous ?"
        message="Cette action est irréversible. Le médecin sera notifié de l'annulation."
        confirmLabel="Annuler le RDV"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon="warning"
        onConfirm={() => handleCancel(cancelConfirm!)}
        onCancel={() => setCancelConfirm(null)}
      />
      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
    </div>
  );
}
