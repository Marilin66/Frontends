class AppConstants {
  AppConstants._();

  static const String appName = 'Hopitel';
  static const String appVersion = '1.0.0';

  // Rôles utilisateur (doit correspondre au backend)
  static const String rolePatient = 'patient';
  static const String roleMedecin = 'medecin';
  static const String roleAdminHopital = 'admin_hopital';
  static const String roleAdminGeneral = 'admin_general';
  static const String roleLaborantin = 'laborantin';

  // Statuts RDV
  static const String rdvEnAttente = 'en_attente';
  static const String rdvConfirme = 'confirme';
  static const String rdvAnnule = 'annule';
  static const String rdvRefuse = 'refuse';
  static const String rdvTermine = 'termine';

  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String languageKey = 'hopitel_language';
}
