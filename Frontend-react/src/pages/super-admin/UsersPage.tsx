
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Card, Button, Badge, Avatar, PageLoader } from '@/components/ui';
import { ErrorModal, ConfirmModal } from '@/components/ui';
import {
  Plus, Mail, Phone, X, Users, Trash2, ShieldCheck,
  Search, Building, RefreshCw, AlertCircle
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  hopital_nom: string;
  hopital: number;
  is_active: boolean;
}

const inputCls = `w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm
  text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none
  focus:ring-2 focus:ring-primary/10 transition-all`;

const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', telephone: '',
    date_naissance: '1990-01-01', sexe: 'M', hopital: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [adminsData, hopitauxData] = await Promise.all([
        api.get<any>(endpoints.adminHopitaux),
        api.get<any>(endpoints.hopitaux),
      ]);
      setAdmins(Array.isArray(adminsData) ? adminsData : adminsData?.results ?? []);
      setHospitals(Array.isArray(hopitauxData) ? hopitauxData : hopitauxData?.results ?? []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post(endpoints.adminHopitaux, formData);
      setIsModalOpen(false);
      setFormData({ email: '', first_name: '', last_name: '', telephone: '', date_naissance: '1990-01-01', sexe: 'M', hopital: '' });
      fetchData();
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data
        ? Object.entries(data).map(([k, v]: any) =>
            `${k === 'non_field_errors' ? '' : k + ' : '}${Array.isArray(v) ? v.join(', ') : v}`
          ).join('\n')
        : "Erreur lors de l'ajout.";
      setErrorMsg(msg);
    } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      await api.delete(`${endpoints.adminHopitaux}${id}/`);
      fetchData();
    } catch { setErrorMsg('Erreur lors de la suppression.'); }
  };

  const filtered = admins.filter(a =>
    `${a.first_name} ${a.last_name} ${a.email} ${a.hopital_nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { canCreateAdminHopital, canDeleteAdminHopital } = usePermissions();

  if (isLoading && admins.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">

      {/* ── Header ── */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrateurs d'hôpitaux</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {admins.length} administrateur{admins.length !== 1 ? 's' : ''} enregistré{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Rechercher un administrateur…"
              className="w-56 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          {canCreateAdminHopital && (
            <Button onClick={() => setIsModalOpen(true)} className="h-10 px-4 rounded-xl text-sm font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nouvel admin
            </Button>
          )}
        </div>
      </section>

      {/* ── Grille ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun administrateur enregistré'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold mx-auto hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" /> Créer le premier admin
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((admin, i) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-5">
                  {/* En-tête carte */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <Avatar
                      name={`${admin.first_name} ${admin.last_name}`}
                      size="md"
                      className="flex-shrink-0"
                    />
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${
                      admin.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {admin.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {/* Nom */}
                  <h3 className="font-semibold text-slate-900 truncate">
                    {admin.first_name} {admin.last_name}
                  </h3>

                  {/* Hôpital */}
                  {admin.hopital_nom && (
                    <div className="flex items-center gap-1.5 mt-1 mb-3">
                      <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span className="text-xs text-slate-500 truncate">{admin.hopital_nom}</span>
                    </div>
                  )}

                  {/* Infos contact */}
                  <div className="space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                    {admin.telephone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                        {admin.telephone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer carte */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                  {canDeleteAdminHopital && (
                    <button
                      onClick={() => setConfirmDeleteId(admin.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal création — visible seulement si droits ── */}
      <AnimatePresence>
        {isModalOpen && canCreateAdminHopital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Header modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Nouvel administrateur</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Créer un compte admin pour un hôpital</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Prénom *</label>
                      <input required className={inputCls} placeholder="Jean"
                        value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Nom *</label>
                      <input required className={inputCls} placeholder="Kpomagan"
                        value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input required type="email" className={inputCls} placeholder="admin@hopital.bj"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Téléphone *</label>
                      <input required type="tel" className={inputCls} placeholder="0197000000"
                        value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Hôpital *</label>
                    <select required className={inputCls}
                      value={formData.hopital} onChange={(e) => setFormData({ ...formData, hopital: e.target.value })}>
                      <option value="">Sélectionner un hôpital…</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>{h.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Date de naissance *</label>
                      <input required type="date" className={inputCls}
                        value={formData.date_naissance} onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Sexe *</label>
                      <select className={inputCls}
                        value={formData.sexe} onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Un email avec les identifiants de connexion sera envoyé automatiquement à l'administrateur.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Annuler
                    </button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 h-10 rounded-xl text-sm font-semibold">
                      Créer l'administrateur
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Supprimer cet administrateur ?"
        message="L'administrateur perdra l'accès à son hôpital. Cette action est irréversible."
        confirmLabel="Supprimer"
        icon="delete"
        onConfirm={() => handleDelete(confirmDeleteId!)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
