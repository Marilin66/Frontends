/**
 * Utilitaire partagé pour sanitiser et naviguer vers les URLs générées par l'IA.
 * L'IA peut produire des routes invalides (noms au lieu d'IDs, alias, etc.)
 * Ce module centralise la logique pour les deux pages chatbot.
 */

// Toutes les routes frontend valides (préfixes)
const VALID_PREFIXES = [
  '/patient/',
  '/medecin/',
  '/admin-hopital',
  '/laborantin/',
  '/super-admin/',
  '/hospitals',
  '/emergency',
  '/tips',
  '/login',
  '/register',
  '/chatbot',
  '/track-results',
  '/hopital/',
  '/onboarding',
  '/terms',
];

// Routes qui nécessitent une authentification patient
const AUTH_REQUIRED_PREFIXES = [
  '/patient/',
  '/medecin/',
  '/admin-hopital',
  '/laborantin/',
  '/super-admin/',
];

/**
 * Sanitise une URL générée par l'IA.
 * - Valide les routes avec paramètres dynamiques (ID numérique obligatoire)
 * - Mappe les alias courants vers les vraies routes
 * - Retourne une route de fallback si invalide
 */
export function sanitizeAIRoute(raw: string): string {
  if (!raw) return '/hospitals';

  // URL externe → laisser passer
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  // Normaliser les slashes doubles
  let target = raw.replace(/\/+/g, '/');

  // S'assurer que ça commence par /
  if (!target.startsWith('/')) target = '/' + target;

  // ── Routes avec paramètres dynamiques : ID numérique obligatoire ──────────

  // /hopital/123 ou /patient/hopital/123 → valide
  if (/^\/hopital\/\d+/.test(target)) return target;
  if (/^\/patient\/hopital\/\d+/.test(target)) return target;

  // /patient/medecin/123/rendezvous → valide
  if (/^\/patient\/medecin\/\d+/.test(target)) return target;

  // /medecins/123/rendezvous (pluriel, généré par l'IA) → corriger en /patient/medecin/123/rendezvous
  const medecinPluralMatch = target.match(/^\/medecins?\/(\d+)(?:\/rendezvous)?/);
  if (medecinPluralMatch) return `/patient/medecin/${medecinPluralMatch[1]}/rendezvous`;

  // /hopitaux/123 (pluriel) → /patient/hopital/123
  const hopitalPluralMatch = target.match(/^\/hopitaux?\/(\d+)/);
  if (hopitalPluralMatch) return `/patient/hopital/${hopitalPluralMatch[1]}`;

  // /hopital/nom-invalide → fallback liste hôpitaux
  if (target.startsWith('/hopital/')) return '/hospitals';
  if (target.startsWith('/patient/hopital/')) return '/hospitals';
  if (target.startsWith('/patient/medecin/')) return '/patient/search';
  if (target.startsWith('/medecin/') || target.startsWith('/medecins/')) return '/patient/search';

  // ── Alias courants générés par l'IA ──────────────────────────────────────

  const ALIASES: Record<string, string> = {
    '/nearby':          '/patient/nearby',
    '/map':             '/patient/nearby',
    '/hopitaux':        '/hospitals',
    '/appointments':    '/patient/appointments',
    '/rendez-vous':     '/patient/appointments',
    '/rdv':             '/patient/appointments',
    '/results':         '/patient/results',
    '/resultats':       '/patient/results',
    '/ai-agent':        '/patient/ai-agent',
    '/assistant':       '/patient/ai-agent',
    '/search':          '/patient/search',
    '/recherche':       '/patient/search',
    '/profile':         '/patient/profile',
    '/profil':          '/patient/profile',
    '/messages':        '/patient/messagerie',
    '/messagerie':      '/patient/messagerie',
    '/notifications':   '/notifications',
  };

  if (ALIASES[target]) return ALIASES[target];

  // ── Détection par mots-clés dans l'URL ───────────────────────────────────

  if (target.includes('hopital') || target.includes('hôpital') || target.startsWith('/hopitaux/')) {
    return '/hospitals';
  }
  if (target.includes('medecin') || target.includes('médecin') || target.startsWith('/medecins/')) {
    return '/patient/search';
  }
  if (target.includes('urgence') || target.includes('emergency')) {
    return '/emergency';
  }
  if (target.includes('conseil') || target.includes('tips') || target.includes('sante')) {
    return '/tips';
  }

  // ── Vérification préfixe valide ───────────────────────────────────────────

  const isValid = VALID_PREFIXES.some(p => target.startsWith(p));
  if (isValid) return target;

  // Fallback
  return '/hospitals';
}

/**
 * Vérifie si une route nécessite une authentification.
 */
export function requiresAuth(route: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some(p => route.startsWith(p));
}
