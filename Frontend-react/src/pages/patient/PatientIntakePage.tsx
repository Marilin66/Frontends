// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Stethoscope,
  Calendar,
  Pill,
  FileText,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api, endpoints } from '@/services/api';

interface IntakeFormData {
  symptomes_principaux: string;
  debut_symptomes: string;
  traitements_en_cours: string;
  observations: string;
}

export default function PatientIntakePage() {
  const { rdvId, medecinNom } = useParams<{ rdvId: string; medecinNom?: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<IntakeFormData>({
    symptomes_principaux: '',
    debut_symptomes: '',
    traitements_en_cours: '',
    observations: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rdvId) return;
    loadExisting();
  }, [rdvId]);

  const loadExisting = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>(endpoints.preEnregistrement(Number(rdvId)));
      if (data) {
        setForm({
          symptomes_principaux: data.symptomes_principaux || '',
          debut_symptomes: data.debut_symptomes || '',
          traitements_en_cours: data.traitements_en_cours || '',
          observations: data.observations || '',
        });
        setIsEditMode(true);
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        setError('Erreur lors du chargement de la fiche.');
      }
      // 404 = pas encore de fiche → mode création
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof IntakeFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symptomes_principaux.trim()) {
      setError('Les symptômes principaux sont requis.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (isEditMode) {
        await api.put(endpoints.preEnregistrement(Number(rdvId)), form);
      } else {
        await api.post(endpoints.preEnregistrement(Number(rdvId)), form);
        setIsEditMode(true);
      }
      setSaved(true);
      setTimeout(() => navigate(-1), 1800);
    } catch (err) {
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-64 gap-4"
      >
        <CheckCircle className="w-16 h-16 text-teal-500" />
        <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">
          Fiche transmise !
        </h2>
        <p className="text-slate-400 font-bold text-sm">
          Votre médecin sera préparé pour la consultation.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none">
            Pré-consultation
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {medecinNom ? `Pour Dr. ${decodeURIComponent(medecinNom)}` : 'Remplir avant la consultation'}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl mb-8">
        <ClipboardList className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-bold text-teal-700 leading-relaxed">
          Ces informations permettent à votre médecin de mieux préparer votre consultation.
          Ce formulaire est <span className="font-black">facultatif</span> mais fortement recommandé.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptômes */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            <Stethoscope className="w-4 h-4 text-red-400" />
            Symptômes principaux <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.symptomes_principaux}
            onChange={(e) => handleChange('symptomes_principaux', e.target.value)}
            rows={4}
            placeholder="Ex: Maux de tête, fièvre depuis 3 jours, douleurs abdominales..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all"
          />
        </div>

        {/* Date début symptômes */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            <Calendar className="w-4 h-4 text-orange-400" />
            Début des symptômes
          </label>
          <input
            type="date"
            value={form.debut_symptomes}
            onChange={(e) => handleChange('debut_symptomes', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Traitements */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            <Pill className="w-4 h-4 text-blue-400" />
            Traitements en cours
          </label>
          <textarea
            value={form.traitements_en_cours}
            onChange={(e) => handleChange('traitements_en_cours', e.target.value)}
            rows={3}
            placeholder="Ex: Paracétamol 500mg, Doliprane, aucun..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all"
          />
        </div>

        {/* Observations */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            <FileText className="w-4 h-4 text-purple-400" />
            Observations complémentaires
          </label>
          <textarea
            value={form.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            rows={4}
            placeholder="Ex: Antécédents familiaux, allergies, informations pertinentes..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-16 bg-slate-900 text-white font-black text-lg rounded-[1.5rem] shadow-2xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              {isEditMode ? 'Mettre à jour la fiche' : 'Envoyer au médecin'}
            </>
          )}
        </button>

        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Formulaire facultatif — aide votre médecin à préparer la consultation
        </p>
      </form>
    </div>
  );
}
