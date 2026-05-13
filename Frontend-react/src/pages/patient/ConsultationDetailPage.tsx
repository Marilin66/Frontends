// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, PageLoader } from '@/components/ui';
import { ArrowLeft, User, Calendar, FileText, Stethoscope, Pill, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(endpoints.consultationDetail(Number(id)))
      .then((data: any) => setConsultation(data))
      .catch(() => setError('Impossible de charger la consultation.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;

  if (!consultation) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-slate-600">{error || 'Consultation introuvable.'}</p>
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition">
        Retour
      </button>
    </div>
  );

  const sections = [
    { key: 'compte_rendu', label: 'Compte rendu', icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { key: 'diagnostic',   label: 'Diagnostic',   icon: Stethoscope, color: 'text-teal-600',   bg: 'bg-teal-50' },
    { key: 'prescription', label: 'Prescription', icon: Pill,        color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compte rendu médical</h1>
          <p className="text-sm text-slate-500">{consultation.medecin_nom}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Médecin</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{consultation.medecin_nom || '—'}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-semibold text-slate-900">
                {consultation.date_rdv ? new Date(consultation.date_rdv).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Motif */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Motif</span>
        </div>
        <p className="text-sm text-slate-600">{consultation.motif || 'Non renseigné'}</p>
      </Card>

      {/* Medical sections */}
      {sections.map(({ key, label, icon: Icon, color, bg }, i) => (
        <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-800">{label}</h3>
            </div>
            <p className={`text-sm leading-relaxed ${consultation[key] ? 'text-slate-700' : 'text-slate-400'}`}>
              {consultation[key] || `Aucun ${label.toLowerCase()} renseigné.`}
            </p>
          </Card>
        </motion.div>
      ))}

      {/* Confidentiality note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-blue-700 text-xs">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        Ces informations sont confidentielles et protégées par le secret médical.
      </div>
    </div>
  );
}
