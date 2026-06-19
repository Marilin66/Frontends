
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook centralisé pour les permissions CRUD par rôle.
 *
 * Matrice des droits :
 * ┌─────────────────────┬──────────┬─────────┬──────────────┬─────────────┬────────────┐
 * │ Action              │ patient  │ medecin │ admin_hopital│ admin_general│ laborantin │
 * ├─────────────────────┼──────────┼─────────┼──────────────┼─────────────┼────────────┤
 * │ Créer médecin       │    ✗     │    ✗    │      ✓       │      ✓      │     ✗      │
 * │ Supprimer médecin   │    ✗     │    ✗    │      ✓       │      ✓      │     ✗      │
 * │ Créer laborantin    │    ✗     │    ✗    │      ✓       │      ✓      │     ✗      │
 * │ Supprimer laborantin│    ✗     │    ✗    │      ✓       │      ✓      │     ✗      │
 * │ Créer hôpital       │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Modifier hôpital    │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Activer/désactiver  │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Créer admin hopital │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Supprimer admin     │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Créer service global│    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Modifier service    │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Supprimer service   │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Valider demande     │    ✗     │    ✗    │      ✗       │      ✓      │     ✗      │
 * │ Demander service    │    ✗     │    ✗    │      ✓       │      ✗      │     ✗      │
 * │ Inscrire analyse    │    ✗     │    ✗    │      ✗       │      ✗      │     ✓      │
 * │ Clôturer analyse    │    ✗     │    ✗    │      ✗       │      ✗      │     ✓      │
 * │ Annuler RDV         │    ✓     │    ✗    │      ✗       │      ✗      │     ✗      │
 * │ Partager résultat   │    ✓     │    ✗    │      ✗       │      ✗      │     ✗      │
 * └─────────────────────┴──────────┴─────────┴──────────────┴─────────────┴────────────┘
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? '';

  const is = (...roles: string[]) => roles.includes(role);

  return {
    // ── Médecins ──────────────────────────────────────────────────────────────
    canCreateMedecin:    is('admin_hopital', 'admin_general'),
    canDeleteMedecin:    is('admin_hopital', 'admin_general'),
    canImportMedecins:   is('admin_hopital', 'admin_general'),

    // ── Laborantins ───────────────────────────────────────────────────────────
    canCreateLaborantin: is('admin_hopital', 'admin_general'),
    canDeleteLaborantin: is('admin_hopital', 'admin_general'),

    // ── Hôpitaux ──────────────────────────────────────────────────────────────
    canCreateHopital:    is('admin_general'),
    canEditHopital:      is('admin_general'),
    canToggleHopital:    is('admin_general'),

    // ── Admins hôpitaux ───────────────────────────────────────────────────────
    canCreateAdminHopital: is('admin_general'),
    canDeleteAdminHopital: is('admin_general'),

    // ── Services globaux ──────────────────────────────────────────────────────
    canCreateService:    is('admin_general'),
    canEditService:      is('admin_general'),
    canDeleteService:    is('admin_general'),

    // ── Demandes de service ───────────────────────────────────────────────────
    canValiderDemande:   is('admin_general'),
    canRefuserDemande:   is('admin_general'),
    canSoumettreDemande: is('admin_hopital'),

    // ── Analyses (BioTrack) ───────────────────────────────────────────────────
    canInscrireAnalyse:  is('laborantin'),
    canCloturerAnalyse:  is('laborantin'),

    // ── Rendez-vous ───────────────────────────────────────────────────────────
    canAnnulerRdv:       is('patient'),
    canConfirmerRdv:     is('medecin'),
    canRefuserRdv:       is('medecin'),
    canTerminerRdv:      is('medecin'),

    // ── Résultats ─────────────────────────────────────────────────────────────
    canPartagerResultat: is('patient'),
    canTelechargerResultat: is('patient', 'medecin', 'laborantin', 'admin_hopital', 'admin_general'),

    // ── Utilitaires ───────────────────────────────────────────────────────────
    role,
    isPatient:      role === 'patient',
    isMedecin:      role === 'medecin',
    isAdminHopital: role === 'admin_hopital',
    isAdminGeneral: role === 'admin_general',
    isLaborantin:   role === 'laborantin',
    isSuperAdmin:   is('admin_general', 'super_admin'),
  };
}
