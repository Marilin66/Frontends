
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { Button, Badge, Card } from '@/components/ui';
import type { ApiError } from '@/types/api';

interface IntakeFormData {
  symptomes_principaux: string;
  debut_symptomes: string;
  traitements_en_cours: string;
  observations: string;
}

export default function PatientIntakePage() {
  const { rdvId, medecinNom: medecinNomParam } = useParams<{ rdvId: string; medecinNom?: string }>();
  const [searchParams] = useSearchParams();
  // Supporte les deux : path param et query string ?medecin=...
  const medecinNom = medecinNomParam || searchParams.get('medecin') || '';
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
    } catch (err) {
      const status = (err as ApiError).response?.status;
      if (status !== 404) {
         console.warn('Erreur chargement intake:', (err as ApiError).response?.data);
      }
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
      const data = (err as ApiError).response?.data;
      const detail = data && typeof data === 'object' && 'detail' in data ? (data as Record<string, unknown>).detail : undefined;
      setError((detail as string) || 'Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement de votre fiche...</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100 flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fiche transmise !
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Votre médecin pourra consulter ces informations avant votre rendez-vous.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Pré-consultation
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {medecinNom ? `Pour le Dr. ${decodeURIComponent(medecinNom)}` : 'Remplir avant votre rendez-vous'}
          </p>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 mb-10 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <p className="text-slate-700 font-bold text-sm">Informations importantes</p>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Ces informations aident votre médecin à mieux préparer votre consultation. Ce formulaire est <span className="text-primary font-bold">facultatif</span> mais fortement recommandé.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-8 text-rose-600 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Symptômes Card */}
        <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <label className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Stethoscope className="w-4 h-4 text-primary" />
            Symptômes principaux <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.symptomes_principaux}
            onChange={(e) => handleChange('symptomes_principaux', e.target.value)}
            rows={4}
            placeholder="Ex: Maux de tête persistants, fièvre modérée..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </Card>

        {/* Date Card */}
        <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <label className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            Début des symptômes
          </label>
          <input
            type="date"
            value={form.debut_symptomes}
            onChange={(e) => handleChange('debut_symptomes', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </Card>

        {/* Traitements Card */}
        <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <label className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Pill className="w-4 h-4 text-primary" />
            Traitements en cours
          </label>
          <textarea
            value={form.traitements_en_cours}
            onChange={(e) => handleChange('traitements_en_cours', e.target.value)}
            rows={3}
            placeholder="Ex: Paracétamol, traitements chroniques..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </Card>

        {/* Observations Card */}
        <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <label className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <FileText className="w-4 h-4 text-primary" />
            Observations complémentaires
          </label>
          <textarea
            value={form.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            rows={4}
            placeholder="Antécédents, allergies ou toute information utile..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </Card>

        {/* Submit Section */}
        <div className="pt-4 space-y-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full h-16 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isEditMode ? 'Mettre à jour ma fiche' : 'Envoyer la fiche au médecin'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <p className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            Données sécurisées et chiffrées
          </p>
        </div>
      </form>
    </div>
  );
}
