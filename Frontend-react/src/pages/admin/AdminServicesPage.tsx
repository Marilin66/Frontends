// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, PageLoader } from '@/components/ui';
import { ErrorModal, SuccessModal } from '@/components/ui';
import {
  Plus, Activity, X, Search, SendHorizontal,
  ShieldCheck, RefreshCw, Stethoscope
} from 'lucide-react';

interface HospitalService {
  id: number;
  service_nom: string;
  service_description: string;
  service_icone: string;
}

export default function AdminServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<HospitalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    nom_nouveau_service: '',
    description_nouveau_service: '',
  });

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<HospitalService[]>(endpoints.hopitalServicesProprietaire);
      setServices(Array.isArray(data) ? data : (data as any).results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hopital) {
      setErrorMsg("Hôpital non identifié pour votre compte.");
      return;
    }
    try {
      setIsLoading(true);
      await api.post(endpoints.createDemandeService(user.hopital), formData);
      setSuccessMsg("Demande transmise avec succès ! Elle sera examinée par l'administrateur général.");
      setIsModalOpen(false);
      setFormData({ nom_nouveau_service: '', description_nouveau_service: '' });
      fetchServices();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la transmission de la demande.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(s =>
    s.service_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && services.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services de l'hôpital</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {services.length} service{services.length !== 1 ? 's' : ''} actif{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un service…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-56 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={fetchServices}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Button onClick={() => setIsModalOpen(true)} className="h-10 px-4 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Demander un service
          </Button>
        </div>
      </section>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Pour ajouter un nouveau service, soumettez une demande. Elle sera examinée et validée par l'administrateur général.
        </p>
      </div>

      {/* Grille des services */}
      {filteredServices.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun service enregistré'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold mx-auto hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" /> Demander le premier service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{s.service_nom}</h3>
                    {s.service_description ? (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {s.service_description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">Aucune description</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Actif
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{s.id}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal demande de service */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-lg"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Demander un nouveau service</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Votre demande sera transmise à l'administrateur général
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Nom du service *</label>
                    <input
                      required
                      type="text"
                      value={formData.nom_nouveau_service}
                      onChange={e => setFormData({ ...formData, nom_nouveau_service: e.target.value })}
                      placeholder="Ex: Cardiologie, Pédiatrie, Radiologie…"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Description / justification *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description_nouveau_service}
                      onChange={e => setFormData({ ...formData, description_nouveau_service: e.target.value })}
                      placeholder="Décrivez le service et justifiez son intégration dans votre hôpital…"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      {isLoading ? 'Envoi…' : 'Envoyer la demande'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
    </div>
  );
}
