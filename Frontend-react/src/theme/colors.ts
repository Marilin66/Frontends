// @ts-nocheck
// Couleurs principales basées sur le design system Flutter
export const colors = {
  // Couleurs principales - Bleu Ciel et Blanc dominants
  primary: '#0EA5E9',      // Sky 500
  primaryLight: '#7DD3FC', // Sky 300
  primaryDark: '#0369A1',  // Sky 700

  // Couleurs secondaires
  secondary: '#38BDF8',    // Sky 400
  secondaryLight: '#BAE6FD', // Sky 200
  secondaryDark: '#0284C7',  // Sky 600

  // Couleurs de fond
  background: '#FFFFFF',   // Blanc dominant
  surface: '#F0F9FF',      // Sky 50 (très léger bleu)
  card: '#FFFFFF',

  // Couleurs de texte
  textPrimary: '#0F172A',  // Slate 900
  textSecondary: '#64748B', // Slate 500
  textHint: '#94A3B8',

  // Couleurs d'état
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',

  // Couleurs spécifiques aux rôles
  patient: '#0EA5E9',
  medecin: '#059669',
  adminHopital: '#EA580C',
  superAdmin: '#7C3AED',
  laborantin: '#0891B2',

  // Couleurs neutres
  divider: '#F1F5F9',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
} as const;

// Variables CSS pour Tailwind
export const cssColors = {
  primary: 'rgb(14, 165, 233)',
  primaryLight: 'rgb(125, 211, 252)',
  primaryDark: 'rgb(3, 105, 161)',
  secondary: 'rgb(56, 189, 248)',
  background: 'rgb(255, 255, 255)',
  surface: 'rgb(240, 249, 255)',
  textPrimary: 'rgb(15, 23, 42)',
  textSecondary: 'rgb(100, 116, 139)',
  success: 'rgb(16, 185, 129)',
  warning: 'rgb(245, 158, 11)',
  error: 'rgb(239, 68, 68)',
} as const;
