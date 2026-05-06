// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Card, Button, Badge, PageLoader } from '@/components/ui';
import {
  ArrowLeft, Building, Users, Activity, Inbox,
  Mail, Phone, MapPin, Edit2, Save, X,
  CheckCircle, XCircle, ToggleLeft, ToggleRight,
  Plus, MoreVertical, RefreshCw, Stethoscope,
  UserPlus, Trash2, Check
} from 'lucide-react';

type Tab = 'medecins' | 'services' | 'demandes' | 'laborantins';

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hopId = Number(id);

  const [hopital, setHopital] = useState<any>(null);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [laborantins, setLaborantins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('medecins');

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Action states
  const [processing, setProcessing] = useState<number | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [h, m, s, d, l] = await Promise.all([
        api.get(endpoints.hopitalDetail(hopId)),
        api.get(`${endpoints.medecins}?hopital=${hopId}`),
        api.get(endpoints.hopitalServices(hopId)),
        api.get(endpoints.demandesServices),
        api.get(`${endpoints.laborantins}?hopital=${hopId}`),
      ]);
      setHopital(h);
      setMedecins(Array.isArray(m) ? m : (m as any).results ?? []);
      setServices(Array.isArray(s) ? s : (s as any).results ?? []);
      const allD = Array.isArray(d) ? d : (d as any).results ?? [];
      setDemandes(allD.filter((x: any) => x.hopital === hopId));
      setLaborantins(Array.isArray(l) ? l : (l as any).results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [hopId]);

  // ── Edit hopital ──────────────────────────────────────────────────
  const startEdit = () => {
    setEditForm({
      nom:        hopital?.nom ?? '',
      adresse:    hopital?.adresse ?? '',
      ville:      hopital?.ville ?? '',
      telephone:  hopital?.telephone ?? '',
      email:      hopital?.email ?? '',
      code_court: hopital?.code_court ?? '',
      latitude:   hopital?.latitude?.toString() ?? '',
      longitude:  hopital?.longitude?.toString() ?? '',
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        nom: editForm.nom, adresse: editForm.adresse,
        ville: editForm.ville, telephone: editForm.telephone,
        email: editForm.email,
      };
      if (editForm.code_court) payload.code_court = editForm.code_court;
      if (editForm.latitude)   payload.latitude   = parseFloat(editForm.latitude);
      if (editForm.longitude)  payload.longitude  = parseFloat(editForm.longitude);
      await api.patch(`${endpoints.hopitaux}${hopId}/`, payload);
      setEditing(false);
      fetchData();
    } catch { alert('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  // ── Toggle actif ──────────────────────────────────────────────────
  const handleToggle = async () => {
    setToggling(true);
    try {
      await api.patch(`${endpoints.hopitaux}${hopId}/`, { is_active: !hopital.is_active });
      fetchData();
    } catch { alert('Erreur.'); }
    finally { setToggling(false); }
  };

  // ── Demandes ──────────────────────────────────────────────────────
  const handleDemande = async (demandeId: number, valider: boolean) => {
    if (!confirm(`${valider ? 'Valider' : 'Refuser'} cette demande ?`)) return;
    setProcessing(demandeId);
    try {
      if (valider) {
        await api.post(endpoints.validerDemande(demandeId));
      } else {
        const motif = prompt('Motif du refus (optionnel) :') ?? '';
        await api.post(endpoints.refuserDemande(demandeId), { commentaire: motif });
      }
      fetchData();
    } catch { alert('Erreur.'); }
    finally { setProcessing(null); }
  };

  // ── Désactiver médecin ────────────────────────────────────────────
  const handleDeactivateMedecin = async (medecinId: number, nom: string) => {
    if (!confirm(`Désactiver ${nom} ?`)) return;
    try {
      await api.post(`${endpoints.medecins}${medecinId}/desactiver/`);
      fetchData();
    } catch { alert('Erreur.'); }
  };

  if (loading && !hopital) return <PageLoader />;
  if (!hopital) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-slate-500">Hôpital introuvable.</p>
      <Button className="mt-4" onClick={() => navigate('/super-admin/hopitaux')}>Retour</Button>
    </div>
  );

  const tabs: { key: Tab; label: string; count: number; icon: any }[] = [
    { key: 'medecins',    label: 'Médecins',    count: medecins.length,    icon: Stethoscope },
    { key: 'services',    label: 'Services',    count: services.length,    icon: Activity },
    { key: 'demandes',    label: 'Demandes',    count: demandes.filter(d => d.statut === 'en_attente').length, icon: Inbox },
    { key: 'laborantins', label: 'Laborantins', count: laborantins.length, icon: Users },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/super-admin/hopitaux')}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{hopital.nom}</h1>
          <p className="text-sm text-slate-500">{hopital.ville}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition disabled:opacity-50 ${
              hopital.is_active
                ? 'border-green-200 text-green-700 hover:bg-green-50'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {hopital.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {toggling ? '…' : hopital.is_active ? 'Actif' : 'Inactif'}
          </button>
          {!editing ? (
            <Button onClick={startEdit} leftIcon={<Edit2 className="w-4 h-4" />} variant="outline">
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)} leftIcon={<X className="w-4 h-4" />}>
                Annuler
              </Button>
              <Button onClick={saveEdit} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Info card ───────────────────────────────────────────────── */}
      <Card padding="lg">
        {editing ? (
          /* ── Formulaire d'édition ── */
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Modifier les informations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'nom',        label: 'Nom',        type: 'text',   required: true },
                { key: 'ville',      label: 'Ville',      type: 'text',   required: true },
                { key: 'adresse',    label: 'Adresse',    type: 'text',   required: true },
                { key: 'code_court', label: 'Code court', type: 'text',   required: false },
                { key: 'telephone',  label: 'Téléphone',  type: 'tel',    required: true },
                { key: 'email',      label: 'Email',      type: 'email',  required: true },
                { key: 'latitude',   label: 'Latitude',   type: 'number', required: false },
                { key: 'longitude',  label: 'Longitude',  type: 'number', required: false },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required ? ' *' : ''}</label>
                  <input
                    type={type}
                    step={type === 'number' ? 'any' : undefined}
                    required={required}
                    value={editForm[key] ?? ''}
                    onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Affichage infos ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Building, label: 'Nom',       value: hopital.nom,       color: 'text-primary',   bg: 'bg-primary/10' },
              { icon: MapPin,   label: 'Adresse',   value: `${hopital.adresse ?? '—'}, ${hopital.ville ?? '—'}`, color: 'text-rose-600', bg: 'bg-rose-50' },
              { icon: Mail,     label: 'Email',     value: hopital.email,     color: 'text-blue-600',  bg: 'bg-blue-50' },
              { icon: Phone,    label: 'Téléphone', value: hopital.telephone, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{value || '—'}</p>
                </div>
              </div>
            ))}
            {hopital.code_court && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Code court</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{hopital.code_court}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-[110px] px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Médecins */}
        {tab === 'medecins' && (
          <motion.div key="medecins" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {medecins.length === 0 ? (
              <_Empty icon={Stethoscope} message="Aucun médecin dans cet hôpital" />
            ) : (
              <div className="space-y-2">
                {medecins.map((m: any, i: number) => (
                  <Card key={m.id ?? i} padding="sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 font-bold text-blue-600 text-sm">
                        {(m.first_name?.[0] ?? 'M').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">Dr. {m.first_name} {m.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${m.is_active !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {m.is_active !== false ? 'Actif' : 'Inactif'}
                        </span>
                        <button
                          onClick={() => handleDeactivateMedecin(m.id, `Dr. ${m.first_name} ${m.last_name}`)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition group"
                          title="Désactiver"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Services */}
        {tab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {services.length === 0 ? (
              <_Empty icon={Activity} message="Aucun service dans cet hôpital" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s: any, i: number) => (
                  <Card key={s.id ?? i} padding="md">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{s.service_nom ?? s.nom}</p>
                        {(s.description_locale ?? s.service_description) && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description_locale ?? s.service_description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Demandes */}
        {tab === 'demandes' && (
          <motion.div key="demandes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {demandes.length === 0 ? (
              <_Empty icon={Inbox} message="Aucune demande pour cet hôpital" />
            ) : (
              <div className="space-y-3">
                {demandes.map((d: any, i: number) => (
                  <Card key={d.id ?? i} padding="md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{d.nom_nouveau_service ?? d.service_existant_nom ?? 'Service'}</p>
                          {d.description_nouveau_service && (
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{d.description_nouveau_service}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${
                          d.statut === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          d.statut === 'valide'     ? 'bg-green-50 text-green-700 border-green-200' :
                                                      'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {d.statut === 'en_attente' ? 'En attente' : d.statut === 'valide' ? 'Validée' : 'Refusée'}
                        </span>
                      </div>
                      {d.statut === 'en_attente' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleDemande(d.id, false)}
                            disabled={processing === d.id}
                            className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Refuser
                          </button>
                          <button
                            onClick={() => handleDemande(d.id, true)}
                            disabled={processing === d.id}
                            className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {processing === d.id ? '…' : 'Valider'}
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Laborantins */}
        {tab === 'laborantins' && (
          <motion.div key="laborantins" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {laborantins.length === 0 ? (
              <_Empty icon={Users} message="Aucun laborantin dans cet hôpital" />
            ) : (
              <div className="space-y-2">
                {laborantins.map((l: any, i: number) => (
                  <Card key={l.id ?? i} padding="sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 font-bold text-teal-600 text-sm">
                        {(l.first_name?.[0] ?? 'L').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{l.first_name} {l.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{l.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${l.is_active !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {l.is_active !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Helper component ─────────────────────────────────────────────────────────
function _Empty({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
