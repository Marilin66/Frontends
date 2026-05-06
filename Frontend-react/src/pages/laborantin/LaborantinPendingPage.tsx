// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, CardContent, Badge, Button, PageLoader } from '@/components/ui';
import { FlaskConical, PlayCircle, FileCheck, Clock, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useRef } from 'react';

export default function LaborantinPendingPage() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [clotureData, setClotureData] = useState({ observations: '', fichier: null as File | null });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const data: any = await api.get(endpoints.demandesAnalyse);
      const all = Array.isArray(data) ? data : data.results || [];
      setDemandes(all.filter((d: any) => d.statut !== 'cloture'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCloturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;
    const body = new FormData();
    body.append('observations', clotureData.observations);
    if (clotureData.fichier) body.append('fichier', clotureData.fichier);
    try {
      setSaving(true);
      await api.post(endpoints.cloturerAnalyse(selectedDemande.id), body);
      setSelectedDemande(null);
      setClotureData({ observations: '', fichier: null });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Erreur lors de la clôture.');
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analyses en cours</h1>
        <p className="text-sm text-slate-500 mt-0.5">{demandes.length} demande{demandes.length !== 1 ? 's' : ''} à traiter</p>
      </div>

      {demandes.length === 0 ? (
        <div className="text-center py-20">
          <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Aucune analyse en attente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {demandes.map((d: any) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{d.patient_nom}</p>
                    <p className="text-xs text-slate-500">{d.type_analyse}</p>
                  </div>
                </div>
                <Badge variant={d.statut === 'en_cours' ? 'primary' : 'warning'} size="sm">
                  {d.statut === 'en_cours' ? 'En cours' : 'En attente'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock className="w-3.5 h-3.5" />
                {new Date(d.date_demande).toLocaleDateString('fr-FR')}
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setSelectedDemande(d)}
                leftIcon={<FileCheck className="w-4 h-4" />}
              >
                Clôturer l'analyse
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal clôture */}
      {selectedDemande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Clôturer l'analyse</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedDemande.patient_nom} — {selectedDemande.type_analyse}</p>
              </div>
              <button onClick={() => setSelectedDemande(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCloturer} className="p-5 space-y-4">
              {/* Upload PDF */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rapport PDF</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${clotureData.fichier ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {clotureData.fichier ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{clotureData.fichier.name}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <Upload className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Cliquer pour uploader le PDF</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                    onChange={(e) => setClotureData({ ...clotureData, fichier: e.target.files?.[0] || null })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Observations</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                  placeholder="Résultats et observations biologiques..."
                  value={clotureData.observations}
                  onChange={(e) => setClotureData({ ...clotureData, observations: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Le patient recevra une notification avec son code d'accès.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedDemande(null)}>Annuler</Button>
                <Button type="submit" className="flex-1" isLoading={saving} disabled={!clotureData.fichier}>
                  Certifier et envoyer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
