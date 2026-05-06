// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, Badge, Button, PageLoader } from '@/components/ui';
import { FlaskConical, Download, CheckCircle, Search } from 'lucide-react';

export default function LaborantinFinishedPage() {
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(endpoints.resultats)
      .then((data: any) => setResultats(Array.isArray(data) ? data : data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = resultats.filter((r: any) =>
    (r.patient_display_nom || r.patient_nom || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.titre || r.type_analyse || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analyses clôturées</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un patient ou une analyse..."
          className="w-full h-10 pl-9 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Aucune analyse clôturée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{r.patient_display_nom || r.patient_nom}</p>
                  <p className="text-xs text-slate-500">{r.titre || r.type_analyse}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(r.date_analyse || r.date_resultat).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="success" size="sm">Clôturé</Badge>
                  {r.fichier && (
                    <a href={r.fichier} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        PDF
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
