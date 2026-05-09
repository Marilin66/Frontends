// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Avatar, Button, PageLoader, Pagination, usePagination } from '@/components/ui';
import { ConfirmModal, ErrorModal } from '@/components/ui';
import {
  UserPlus, Mail, Phone, X, ShieldCheck,
  Trash2, Search, RefreshCw, FlaskConical, AlertCircle
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 10;

const inputCls = `w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm
  text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none
  focus:ring-2 focus:ring-primary/10 transition-all`;
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '', first_name: '', last_name: '', telephone: '',
    date_naissance: '1995-01-01', sexe: 'M', laboratoire: '',
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data: any = await api.get(endpoints.laborantins);
      setStaff(Array.isArray(data) ? data : data.results || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(endpoints.laborantins, formData);
      setIsModalOpen(false);
      setFormData({ email: '', first_name: '', last_name: '', telephone: '', date_naissance: '1995-01-01', sexe: 'M', laboratoire: '' });
      fetchStaff();
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data ? Object.entries(data).map(([k, v]: any) =>
        `${k === 'non_field_errors' ? '' : k + ' : '}${Array.isArray(v) ? v.join(', ') : v}`
      ).join('\n') : "Erreur lors de la création.";
      setErrorMsg(msg);
    } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      await api.delete(`${endpoints.laborantins}${id}/`);
      fetchStaff();
    } catch { setErrorMsg('Erreur lors de la désactivation.'); }
  };

  const filtered = staff.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);
  const { canCreateLaborantin, canDeleteLaborantin } = usePermissions();

  if (isLoading && staff.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">

      {/* ── Header ── */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laborantins</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {staff.length} laborantin{staff.length !== 1 ? 's' : ''} enregistré{staff.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Rechercher un laborantin…"
              className="w-56 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button onClick={fetchStaff} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          {canCreateLaborantin && (
            <Button onClick={() => setIsModalOpen(true)} className="h-10 px-4 rounded-xl text-sm font-semibold">
              <UserPlus className="w-4 h-4 mr-2" /> Nouveau laborantin
            </Button>
          )}
        </div>
      </section>

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun laborantin enregistré'}
          </p>
          {!searchTerm && (
            <button onClick={() => setIsModalOpen(true)} className="mt-4 flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold mx-auto hover:bg-primary/90 transition">
              <UserPlus className="w-4 h-4" /> Ajouter le premier laborantin
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600">Laborantin</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600 hidden md:table-cell">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600 hidden lg:table-cell">Laboratoire</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((member: any, i: number) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${member.first_name} ${member.last_name}`} size="sm" className="flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.first_name} {member.last_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{member.telephone || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{member.laboratoire || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                        member.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {member.is_active !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canDeleteLaborantin && (
                        <button
                          onClick={() => setConfirmDeleteId(member.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                          title="Désactiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* ── Modal création — visible seulement si droits ── */}
      <AnimatePresence>
        {isModalOpen && canCreateLaborantin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Nouveau laborantin</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Le laborantin recevra un email pour configurer son mot de passe</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
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

                  <div>
                    <label className={labelCls}>Email *</label>
                    <input required type="email" className={inputCls} placeholder="labo@hopital.bj"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Téléphone *</label>
                      <input required type="tel" className={inputCls} placeholder="0197000000"
                        value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Laboratoire</label>
                      <input className={inputCls} placeholder="Ex: Biochimie"
                        value={formData.laboratoire} onChange={(e) => setFormData({ ...formData, laboratoire: e.target.value })} />
                    </div>
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
                    <p className="text-xs text-blue-700">Un email avec les identifiants sera envoyé automatiquement au laborantin.</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Annuler
                    </button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 h-10 rounded-xl text-sm font-semibold">
                      Créer le laborantin
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Désactiver ce laborantin ?"
        message="Le laborantin ne pourra plus se connecter ni traiter des analyses."
        confirmLabel="Désactiver"
        icon="delete"
        onConfirm={() => handleDelete(confirmDeleteId!)}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
    </div>
  );
}
