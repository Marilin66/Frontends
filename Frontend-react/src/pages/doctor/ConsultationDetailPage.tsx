// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, Button, PageLoader } from '@/components/ui';
import { ConfirmModal } from '@/components/ui';
import {
  ArrowLeft, Edit3, Save, X, Lock, User,
  Calendar, FileText, Stethoscope, Pill, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloturerConfirm, setShowCloturerConfirm] = useState(false);
  const [form, setForm] = useState({ compte_rendu: '', diagnostic: '', prescription: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.consultationDetail(Number(id)));
      setConsultation(data);
      setForm({
        compte_rendu: data.compte_rendu ?? '',
        diagnostic:   data.diagnostic ?? '',
        prescription: data.prescription ?? '',
      });
    } catch (e) { setError('Impossible de charger la consultation.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(endpoints.consultationDetail(Number(id)), form);
      await fetchData();
      setEditing(false);
    } catch { setError('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleCloturer = async () => {
    setShowCloturerConfirm(false);
    setClosing(true);
    try {
      await api.post(endpoints.cloturerConsultation(Number(id)));
      navigate('/medecin/consultations');
    } catch { setError('Erreur lors de la clôture.'); }
    finally { setClosing(false); }
  };

  if (loading) return <PageLoader />;
  if (!consultation) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-slate-600">{error || 'Consultation introuvable.'}</p>
      <Button className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );

  const isClosed = consultation.est_cloture;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Consultation</h1>
          <p className="text-sm text-slate-500">{consultation.patient_nom}</p>
        </div>
        {!isClosed && !editing && (
          <Button onClick={() => setEditing(true)} leftIcon={<Edit3 className="w-4 h-4" />}>
            Modifier
          </Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} leftIcon={<X className="w-4 h-4" />}>
              Annuler
            </Button>
            <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Patient</p>
              <p className="font-semibold text-slate-900">{consultation.patient_nom || '—'}</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date du RDV</p>
              <p className="font-semibold text-slate-900">
                {consultation.date_rdv ? new Date(consultation.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Motif */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Motif</h3>
        </div>
        <p className="text-slate-600 text-sm">{consultation.motif || 'Non renseigné'}</p>
      </Card>

      {/* Sections médicales */}
      {[
        { key: 'compte_rendu', label: 'Compte rendu', icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50',   placeholder: 'Saisir le compte rendu de la consultation…' },
        { key: 'diagnostic',   label: 'Diagnostic',   icon: Stethoscope, color: 'text-teal-600',   bg: 'bg-teal-50',   placeholder: 'Saisir le diagnostic…' },
        { key: 'prescription', label: 'Prescription', icon: Pill,        color: 'text-orange-600', bg: 'bg-orange-50', placeholder: 'Saisir la prescription médicale…' },
      ].map(({ key, label, icon: Icon, color, bg, placeholder }) => (
        <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-800">{label}</h3>
            </div>
            {editing ? (
              <textarea
                rows={4}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
              />
            ) : (
              <p className={`text-sm leading-relaxed ${consultation[key] ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                {consultation[key] || `Aucun ${label.toLowerCase()} renseigné.`}
              </p>
            )}
          </Card>
        </motion.div>
      ))}

      {/* Clôturer */}
      {!isClosed && !editing && (
        <div className="pt-2">
          <button
            onClick={() => setShowCloturerConfirm(true)}
            disabled={closing}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            {closing ? 'Clôture en cours…' : 'Clôturer la consultation'}
          </button>
        </div>
      )}

      {isClosed && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 text-slate-500 text-sm">
          <Lock className="w-4 h-4 shrink-0" />
          Cette consultation est clôturée et ne peut plus être modifiée.
        </div>
      )}

      {/* Confidentialité */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-blue-700 text-xs">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        Ces informations sont confidentielles et protégées par le secret médical.
      </div>

      <ConfirmModal
        open={showCloturerConfirm}
        title="Clôturer cette consultation ?"
        message="Cette action est irréversible. La consultation sera verrouillée et ne pourra plus être modifiée."
        confirmLabel="Clôturer définitivement"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon="warning"
        onConfirm={handleCloturer}
        onCancel={() => setShowCloturerConfirm(false)}
      />
    </div>
  );
}
