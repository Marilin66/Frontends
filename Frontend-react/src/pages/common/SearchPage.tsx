// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Badge, Button, PageLoader } from '@/components/ui';
import { Search, MapPin, Building, ChevronRight, Filter, X, Stethoscope } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.hopitaux),
      api.get(endpoints.servicesGlobaux),
    ]).then(([h, s]: any) => {
      const raw = Array.isArray(h) ? h : h.results || [];
      setHospitals(raw.map((x: any) => ({
        id: x.id, nom: x.nom || '', adresse: x.adresse || '',
        ville: x.ville || '', services: Array.isArray(x.services) ? x.services : [],
        nombre_medecins: x.nombre_medecins || 0,
      })));
      setServices(Array.isArray(s) ? s : s.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = hospitals.filter(h => {
    const matchSearch = !search || h.nom.toLowerCase().includes(search.toLowerCase()) || h.ville.toLowerCase().includes(search.toLowerCase());
    const matchService = !selectedService || h.services.some((s: any) => s.id === selectedService || s.service === selectedService);
    return matchSearch && matchService;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trouver un médecin</h1>
        <p className="text-slate-500 mt-1">Recherchez un hôpital ou une spécialité médicale</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Hôpital, clinique, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors">
              <X className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres services */}
      {services.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">Spécialités</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedService(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedService ? 'bg-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              Toutes
            </button>
            {services.slice(0, 10).map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedService === s.id ? 'bg-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {s.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats */}
      <div>
        <p className="text-sm text-slate-500 mb-4">{filtered.length} établissement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="font-medium text-slate-500">Aucun établissement trouvé</p>
            <p className="text-sm text-slate-400 mt-1">Essayez avec d'autres termes</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedService(null); }}>
              Réinitialiser
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((h) => (
              <div
                key={h.id}
                onClick={() => navigate(`/patient/hopital/${h.id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{h.nom}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{h.ville}{h.adresse ? ` — ${h.adresse}` : ''}</span>
                    </div>
                    {h.nombre_medecins > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <Stethoscope className="w-3 h-3" />
                        {h.nombre_medecins} médecin{h.nombre_medecins > 1 ? 's' : ''}
                      </div>
                    )}
                    {h.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {h.services.slice(0, 3).map((s: any, i: number) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                            {s.nom || s.service_nom}
                          </span>
                        ))}
                        {h.services.length > 3 && (
                          <span className="text-xs text-slate-400">+{h.services.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
