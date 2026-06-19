/// Système de localisation pour Hopitel
/// 4 langues supportées : Français, English, Fon, Yorùbá
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'language_provider.dart';

/// Identifiants de toutes les chaînes traduites de l'application.
/// Utiliser `t(context, AppStrings.xxx)` pour récupérer la traduction.
class AppStrings {
  AppStrings._();

  // ── Navigation & Général ───────────────────────────────────────────────
  static const String appName = 'appName';
  static const String welcome = 'welcome';
  static const String loading = 'loading';
  static const String error = 'error';
  static const String retry = 'retry';
  static const String cancel = 'cancel';
  static const String save = 'save';
  static const String delete = 'delete';
  static const String confirm = 'confirm';
  static const String close = 'close';
  static const String search = 'search';
  static const String noData = 'noData';
  static const String refresh = 'refresh';
  static const String back = 'back';
  static const String next = 'next';
  static const String seeAll = 'seeAll';
  static const String seeMore = 'seeMore';
  static const String yes = 'yes';
  static const String no = 'no';
  static const String or = 'or';

  // ── Authentification ───────────────────────────────────────────────────
  static const String login = 'login';
  static const String logout = 'logout';
  static const String register = 'register';
  static const String email = 'email';
  static const String password = 'password';
  static const String confirmPassword = 'confirmPassword';
  static const String firstName = 'firstName';
  static const String lastName = 'lastName';
  static const String phone = 'phone';
  static const String forgotPassword = 'forgotPassword';
  static const String resetPassword = 'resetPassword';
  static const String verifyCode = 'verifyCode';
  static const String stayLoggedIn = 'stayLoggedIn';
  static const String noAccount = 'noAccount';
  static const String hasAccount = 'hasAccount';
  static const String createAccount = 'createAccount';
  static const String loginHere = 'loginHere';
  static const String registerHere = 'registerHere';
  static const String invalidCredentials = 'invalidCredentials';
  static const String serverStarting = 'serverStarting';
  static const String logoutConfirm = 'logoutConfirm';

  // ── Patient ────────────────────────────────────────────────────────────
  static const String patientDashboard = 'patientDashboard';
  static const String helloPatient = 'helloPatient';
  static const String howCanWeHelp = 'howCanWeHelp';
  static const String bookAppointment = 'bookAppointment';
  static const String myAppointments = 'myAppointments';
  static const String myResults = 'myResults';
  static const String myProfile = 'myProfile';
  static const String nearbyHospitals = 'nearbyHospitals';
  static const String aiAssistant = 'aiAssistant';
  static const String emergency = 'emergency';
  static const String searchHospital = 'searchHospital';
  static const String analyses = 'analyses';
  static const String upcomingAppointments = 'upcomingAppointments';
  static const String latestResults = 'latestResults';
  static const String noAppointments = 'noAppointments';
  static const String noResults = 'noResults';
  static const String howItWorks = 'howItWorks';
  static const String quickActions = 'quickActions';
  static const String takeAppointment = 'takeAppointment';
  static const String nearby = 'nearby';
  static const String appointments = 'appointments';
  static const String medicalRecord = 'medicalRecord';
  static const String labResults = 'labResults';

  // ── Médecin ────────────────────────────────────────────────────────────
  static const String doctorDashboard = 'doctorDashboard';
  static const String helloDoctor = 'helloDoctor';
  static const String welcomeDoctor = 'welcomeDoctor';
  static const String myAgenda = 'myAgenda';
  static const String myPatients = 'myPatients';
  static const String myConsultations = 'myConsultations';
  static const String todayAppointments = 'todayAppointments';
  static const String lastConsultations = 'lastConsultations';
  static const String noAppointmentsToday = 'noAppointmentsToday';
  static const String noFinishedConsultations = 'noFinishedConsultations';
  static const String refuse = 'refuse';
  static const String finish = 'finish';
  static const String chatting = 'chatting';
  static const String planning = 'planning';
  static const String agenda = 'agenda';

  // ── Admin Hôpital ──────────────────────────────────────────────────────
  static const String adminDashboard = 'adminDashboard';
  static const String doctors = 'doctors';
  static const String labTechnicians = 'labTechnicians';
  static const String services = 'services';
  static const String requests = 'requests';
  static const String patients = 'patients';
  static const String stats = 'stats';
  static const String supervision = 'supervision';
  static const String consultations = 'consultations';
  static const String laboratory = 'laboratory';
  static const String postCare = 'postCare';
  static const String patientJourney = 'patientJourney';
  static const String messages = 'messages';

  // ── Super Admin ────────────────────────────────────────────────────────
  static const String superAdminDashboard = 'superAdminDashboard';
  static const String hospitals = 'hospitals';
  static const String administrators = 'administrators';
  static const String globalServices = 'globalServices';
  static const String createHospital = 'createHospital';

  // ── Laborantin ─────────────────────────────────────────────────────────
  static const String labDashboard = 'labDashboard';
  static const String pendingAnalyses = 'pendingAnalyses';
  static const String finishedAnalyses = 'finishedAnalyses';
  static const String registerAnalysis = 'registerAnalysis';
  static const String closeAnalysis = 'closeAnalysis';

  // ── Messagerie ─────────────────────────────────────────────────────────
  static const String conversations = 'conversations';
  static const String contacts = 'contacts';
  static const String newMessage = 'newMessage';
  static const String typeMessage = 'typeMessage';
  static const String send = 'send';
  static const String noConversations = 'noConversations';
  static const String noContacts = 'noContacts';
  static const String startConversation = 'startConversation';
  static const String consultationClosed = 'consultationClosed';
  static const String messagesDisabled = 'messagesDisabled';
  static const String activeNow = 'activeNow';
  static const String offline = 'offline';
  static const String voiceMessage = 'voiceMessage';
  static const String recording = 'recording';
  static const String cancelRecording = 'cancelRecording';

  // ── Notifications ──────────────────────────────────────────────────────
  static const String notifications = 'notifications';
  static const String markAllRead = 'markAllRead';
  static const String noNotifications = 'noNotifications';

  // ── Profil ─────────────────────────────────────────────────────────────
  static const String profile = 'profile';
  static const String editProfile = 'editProfile';
  static const String changePassword = 'changePassword';
  static const String settings = 'settings';
  static const String security = 'security';
  static const String language = 'language';
  static const String about = 'about';
  static const String faqGuide = 'faqGuide';
  static const String contactSupport = 'contactSupport';
  static const String version = 'version';
  static const String information = 'information';
  static const String phoneLabel = 'phoneLabel';
  static const String address = 'address';
  static const String birthDate = 'birthDate';
  static const String gender = 'gender';
  static const String male = 'male';
  static const String female = 'female';
  static const String other = 'other';

  // ── Médical ────────────────────────────────────────────────────────────
  static const String medicalInfo = 'medicalInfo';
  static const String emergencyContact = 'emergencyContact';
  static const String contactName = 'contactName';
  static const String contactPhone = 'contactPhone';
  static const String bloodType = 'bloodType';
  static const String allergies = 'allergies';
  static const String noAllergies = 'noAllergies';
  static const String npi = 'npi';
  static const String npiRequired = 'npiRequired';
  static const String npiNotSet = 'npiNotSet';
  static const String socialSecurityNumber = 'socialSecurityNumber';

  // ── Rendez-vous ────────────────────────────────────────────────────────
  static const String appointmentsList = 'appointmentsList';
  static const String filterByStatus = 'filterByStatus';
  static const String filterByService = 'filterByService';
  static const String all = 'all';
  static const String pending = 'pending';
  static const String confirmed = 'confirmed';
  static const String finished = 'finished';
  static const String cancelled = 'cancelled';
  static const String refused = 'refused';
  static const String waitingConfirmation = 'waitingConfirmation';
  static const String fillPreConsult = 'fillPreConsult';
  static const String preConsultSent = 'preConsultSent';
  static const String consultTerminated = 'consultTerminated';
  static const String cancelAppointment = 'cancelAppointment';
  static const String cancelReason = 'cancelReason';
  static const String contactDoctor = 'contactDoctor';
  static const String accessConversation = 'accessConversation';

  // ── Résultats ──────────────────────────────────────────────────────────
  static const String available = 'available';
  static const String consult = 'consult';
  static const String copyCode = 'copyCode';
  static const String share = 'share';
  static const String sharedWith = 'sharedWith';
  static const String accessByCode = 'accessByCode';
  static const String resultCode = 'resultCode';
  static const String enterCode = 'enterCode';
  static const String laboratoryLabel = 'laboratoryLabel';
  static const String patientLabel = 'patientLabel';

  // ── Hôpitaux & Recherche ──────────────────────────────────────────────
  static const String findDoctor = 'findDoctor';
  static const String searchDescription = 'searchDescription';
  static const String specialties = 'specialties';
  static const String popularSpecialties = 'popularSpecialties';
  static const String nearbyHospitalsList = 'nearbyHospitalsList';
  static const String noHospitalFound = 'noHospitalFound';
  static const String resetFilters = 'resetFilters';
  static const String hospitalDetail = 'hospitalDetail';
  static const String takeRdv = 'takeRdv';
  static const String open = 'open';
  static const String closed = 'closed';
  static const String distance = 'distance';
  static const String practitioners = 'practitioners';

  // ── Chatbot IA ─────────────────────────────────────────────────────────
  static const String aiGreeting = 'aiGreeting';
  static const String askQuestion = 'askQuestion';
  static const String newChat = 'newChat';
  static const String recentConversations = 'recentConversations';
  static const String noHistory = 'noHistory';
  static const String aiDisclaimer = 'aiDisclaimer';

  // ── Urgences ───────────────────────────────────────────────────────────
  static const String emergencyNumbers = 'emergencyNumbers';
  static const String samu = 'samu';
  static const String fire = 'fire';
  static const String police = 'police';

  // ── Pages légales ──────────────────────────────────────────────────────
  static const String termsOfUse = 'termsOfUse';
  static const String privacyPolicy = 'privacyPolicy';
  static const String legalMentions = 'legalMentions';

  // ── Paramètres ─────────────────────────────────────────────────────────
  static const String notificationSettings = 'notificationSettings';
  static const String changeLanguage = 'changeLanguage';
  static const String choosePreferredLanguage = 'choosePreferredLanguage';
  static const String defaultLanguage = 'defaultLanguage';
  static const String languageNote = 'languageNote';

  // ── Rôles ──────────────────────────────────────────────────────────────
  static const String rolePatient = 'rolePatient';
  static const String roleDoctor = 'roleDoctor';
  static const String roleAdmin = 'roleAdmin';
  static const String roleSuperAdmin = 'roleSuperAdmin';
  static const String roleLabTech = 'roleLabTech';
}

/// Table de traductions pour les 4 langues.
const Map<String, Map<String, String>> translations = {
  'fr': _french,
  'en': _english,
  'fon': _fon,
  'yoruba': _yoruba,
};

// ═══════════════════════════════════════════════════════════════════════════
// FRANÇAIS
// ═══════════════════════════════════════════════════════════════════════════
const Map<String, String> _french = {
  // Général
  AppStrings.appName: 'Hopitel',
  AppStrings.welcome: 'Bienvenue',
  AppStrings.loading: 'Chargement...',
  AppStrings.error: 'Erreur',
  AppStrings.retry: 'Réessayer',
  AppStrings.cancel: 'Annuler',
  AppStrings.save: 'Enregistrer',
  AppStrings.delete: 'Supprimer',
  AppStrings.confirm: 'Confirmer',
  AppStrings.close: 'Fermer',
  AppStrings.search: 'Rechercher',
  AppStrings.noData: 'Aucune donnée',
  AppStrings.refresh: 'Actualiser',
  AppStrings.back: 'Retour',
  AppStrings.next: 'Suivant',
  AppStrings.seeAll: 'Voir tout',
  AppStrings.seeMore: 'Voir plus',
  AppStrings.yes: 'Oui',
  AppStrings.no: 'Non',
  AppStrings.or: 'ou',

  // Auth
  AppStrings.login: 'Connexion',
  AppStrings.logout: 'Déconnexion',
  AppStrings.register: 'Inscription',
  AppStrings.email: 'Email',
  AppStrings.password: 'Mot de passe',
  AppStrings.confirmPassword: 'Confirmer le mot de passe',
  AppStrings.firstName: 'Prénom',
  AppStrings.lastName: 'Nom',
  AppStrings.phone: 'Téléphone',
  AppStrings.forgotPassword: 'Mot de passe oublié ?',
  AppStrings.resetPassword: 'Réinitialiser le mot de passe',
  AppStrings.verifyCode: 'Vérifier le code',
  AppStrings.stayLoggedIn: 'Rester connecté',
  AppStrings.noAccount: "Pas encore de compte ?",
  AppStrings.hasAccount: 'Déjà un compte ?',
  AppStrings.createAccount: 'Créer un compte',
  AppStrings.loginHere: 'Se connecter',
  AppStrings.registerHere: "S'inscrire",
  AppStrings.invalidCredentials: 'Identifiants invalides',
  AppStrings.serverStarting: 'Le serveur démarre, veuillez patienter 30 secondes...',
  AppStrings.logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',

  // Patient
  AppStrings.patientDashboard: 'Tableau de bord patient',
  AppStrings.helloPatient: 'Bonjour',
  AppStrings.howCanWeHelp: 'Comment pouvons-nous vous aider aujourd\'hui ?',
  AppStrings.bookAppointment: 'Prendre rendez-vous',
  AppStrings.myAppointments: 'Mes rendez-vous',
  AppStrings.myResults: 'Mes résultats',
  AppStrings.myProfile: 'Mon profil',
  AppStrings.nearbyHospitals: 'Hôpitaux à proximité',
  AppStrings.aiAssistant: 'Assistant IA',
  AppStrings.emergency: 'Urgences',
  AppStrings.searchHospital: 'Rechercher un hôpital',
  AppStrings.analyses: 'Analyses',
  AppStrings.upcomingAppointments: 'Prochains rendez-vous',
  AppStrings.latestResults: 'Derniers résultats d\'analyses',
  AppStrings.noAppointments: 'Aucun rendez-vous à venir',
  AppStrings.noResults: 'Aucun résultat disponible',
  AppStrings.howItWorks: 'Comment ça marche ?',
  AppStrings.quickActions: 'Actions rapides',
  AppStrings.takeAppointment: 'Prendre RDV',
  AppStrings.nearby: 'À proximité',
  AppStrings.appointments: 'Mes RDV',
  AppStrings.medicalRecord: 'Dossier Médical',
  AppStrings.labResults: 'Résultats Labo',

  // Médecin
  AppStrings.doctorDashboard: 'Tableau de bord médecin',
  AppStrings.helloDoctor: 'Bonjour, Dr.',
  AppStrings.welcomeDoctor: 'Bienvenue sur votre espace médecin',
  AppStrings.myAgenda: 'Mon Agenda',
  AppStrings.myPatients: 'Mes Patients',
  AppStrings.myConsultations: 'Mes Consultations',
  AppStrings.todayAppointments: 'Rendez-vous du jour',
  AppStrings.lastConsultations: 'Dernières consultations',
  AppStrings.noAppointmentsToday: 'Aucun rendez-vous aujourd\'hui',
  AppStrings.noFinishedConsultations: 'Aucune consultation terminée',
  AppStrings.refuse: 'Refuser',
  AppStrings.finish: 'Terminer',
  AppStrings.chatting: 'Chatter',
  AppStrings.planning: 'Planification',
  AppStrings.agenda: 'Agenda',

  // Admin Hôpital
  AppStrings.adminDashboard: 'Tableau de bord administrateur',
  AppStrings.doctors: 'Médecins',
  AppStrings.labTechnicians: 'Laborantins',
  AppStrings.services: 'Services',
  AppStrings.requests: 'Demandes',
  AppStrings.patients: 'Patients',
  AppStrings.stats: 'Statistiques',
  AppStrings.supervision: 'Supervision',
  AppStrings.consultations: 'Consultations',
  AppStrings.laboratory: 'Laboratoire',
  AppStrings.postCare: 'Post-suivi',
  AppStrings.patientJourney: 'Parcours patient',
  AppStrings.messages: 'Messages',

  // Super Admin
  AppStrings.superAdminDashboard: 'Tableau de bord super administrateur',
  AppStrings.hospitals: 'Hôpitaux',
  AppStrings.administrators: 'Administrateurs',
  AppStrings.globalServices: 'Services globaux',
  AppStrings.createHospital: 'Créer un hôpital',

  // Laborantin
  AppStrings.labDashboard: 'Tableau de bord laborantin',
  AppStrings.pendingAnalyses: 'Analyses en cours',
  AppStrings.finishedAnalyses: 'Analyses clôturées',
  AppStrings.registerAnalysis: 'Inscrire une analyse',
  AppStrings.closeAnalysis: 'Clôturer l\'analyse',

  // Messagerie
  AppStrings.conversations: 'Discussions',
  AppStrings.contacts: 'Contacts',
  AppStrings.newMessage: 'Nouveau message',
  AppStrings.typeMessage: 'Écrivez votre message...',
  AppStrings.send: 'Envoyer',
  AppStrings.noConversations: 'Aucune discussion',
  AppStrings.noContacts: 'Aucun contact',
  AppStrings.startConversation: 'Démarrer la conversation',
  AppStrings.consultationClosed: 'Consultation clôturée',
  AppStrings.messagesDisabled: 'Messages désactivés',
  AppStrings.activeNow: 'Actif maintenant',
  AppStrings.offline: 'Hors ligne',
  AppStrings.voiceMessage: 'Message vocal',
  AppStrings.recording: 'Enregistrement...',
  AppStrings.cancelRecording: 'Annuler',

  // Notifications
  AppStrings.notifications: 'Notifications',
  AppStrings.markAllRead: 'Tout marquer comme lu',
  AppStrings.noNotifications: 'Aucune notification',

  // Profil
  AppStrings.profile: 'Profil',
  AppStrings.editProfile: 'Modifier le profil',
  AppStrings.changePassword: 'Changer le mot de passe',
  AppStrings.settings: 'Paramètres',
  AppStrings.security: 'Sécurité',
  AppStrings.language: 'Langue',
  AppStrings.about: 'À propos',
  AppStrings.faqGuide: 'FAQ & Guide',
  AppStrings.contactSupport: 'Contacter le support',
  AppStrings.version: 'Version',
  AppStrings.information: 'Informations',
  AppStrings.phoneLabel: 'Téléphone',
  AppStrings.address: 'Adresse',
  AppStrings.birthDate: 'Date de naissance',
  AppStrings.gender: 'Sexe',
  AppStrings.male: 'Masculin',
  AppStrings.female: 'Féminin',
  AppStrings.other: 'Autre',

  // Médical
  AppStrings.medicalInfo: 'Informations Médicales',
  AppStrings.emergencyContact: 'Contact d\'Urgence',
  AppStrings.contactName: 'Nom du contact',
  AppStrings.contactPhone: 'Téléphone',
  AppStrings.bloodType: 'Groupe Sanguin',
  AppStrings.allergies: 'Allergies',
  AppStrings.noAllergies: 'Aucune allergie connue',
  AppStrings.npi: 'NPI',
  AppStrings.npiRequired: 'NPI — Requis pour les rendez-vous',
  AppStrings.npiNotSet: 'Non renseigné',
  AppStrings.socialSecurityNumber: 'N° Sécurité',

  // RDV
  AppStrings.appointmentsList: 'Mes Rendez-vous',
  AppStrings.filterByStatus: 'Filtrer par statut',
  AppStrings.filterByService: 'Filtrer par service',
  AppStrings.all: 'Tous',
  AppStrings.pending: 'En attente',
  AppStrings.confirmed: 'Confirmés',
  AppStrings.finished: 'Terminés',
  AppStrings.cancelled: 'Annulés',
  AppStrings.refused: 'Refusés',
  AppStrings.waitingConfirmation: 'En attente de confirmation par le médecin',
  AppStrings.fillPreConsult: 'Remplir la fiche de pré-consultation',
  AppStrings.preConsultSent: 'Fiche de pré-consultation envoyée',
  AppStrings.consultTerminated: 'Consultation terminée — compte rendu disponible',
  AppStrings.cancelAppointment: 'Annuler ce rendez-vous',
  AppStrings.cancelReason: 'Motif de l\'annulation (optionnel)...',
  AppStrings.contactDoctor: 'Contacter le médecin',
  AppStrings.accessConversation: 'Accéder à la conversation',

  // Résultats
  AppStrings.available: 'Disponible',
  AppStrings.consult: 'Consulter',
  AppStrings.copyCode: 'Copier le code',
  AppStrings.share: 'Partager',
  AppStrings.sharedWith: 'PARTAGÉ AVEC',
  AppStrings.accessByCode: 'Accéder via un code de laboratoire',
  AppStrings.resultCode: 'Code résultat',
  AppStrings.enterCode: 'Entrer un code laboratoire',
  AppStrings.laboratoryLabel: 'Laboratoire',
  AppStrings.patientLabel: 'Patient',

  // Hôpitaux
  AppStrings.findDoctor: 'Trouver un médecin',
  AppStrings.searchDescription: 'Recherchez un hôpital ou une spécialité médicale',
  AppStrings.specialties: 'Spécialités',
  AppStrings.popularSpecialties: 'Spécialités Populaires',
  AppStrings.nearbyHospitalsList: 'Hôpitaux à proximité',
  AppStrings.noHospitalFound: 'Aucun établissement trouvé',
  AppStrings.resetFilters: 'Réinitialiser les filtres',
  AppStrings.hospitalDetail: 'Détail de l\'hôpital',
  AppStrings.takeRdv: 'Prendre rendez-vous',
  AppStrings.open: 'Ouvert',
  AppStrings.closed: 'Fermé',
  AppStrings.distance: 'Distance',
  AppStrings.practitioners: 'Praticiens',

  // Chatbot
  AppStrings.aiGreeting: 'Bonjour ! Je suis l\'intelligence Hopitel. Comment puis-je vous aider aujourd\'hui ?',
  AppStrings.askQuestion: 'Posez une question santé...',
  AppStrings.newChat: 'Nouveau chat',
  AppStrings.recentConversations: 'Conversations récentes',
  AppStrings.noHistory: 'Aucun historique',
  AppStrings.aiDisclaimer: 'Assistant IA : Informations indicatives uniquement.',

  // Urgences
  AppStrings.emergencyNumbers: 'Numéros d\'urgence',
  AppStrings.samu: 'SAMU',
  AppStrings.fire: 'Pompiers',
  AppStrings.police: 'Police',

  // Légal
  AppStrings.termsOfUse: 'Conditions d\'utilisation',
  AppStrings.privacyPolicy: 'Politique de confidentialité',
  AppStrings.legalMentions: 'Mentions légales',

  // Paramètres
  AppStrings.notificationSettings: 'Paramètres de notification',
  AppStrings.changeLanguage: 'Changer la langue',
  AppStrings.choosePreferredLanguage: 'Choisissez votre langue préférée',
  AppStrings.defaultLanguage: 'Langue par défaut',
  AppStrings.languageNote: 'Le changement de langue affectera l\'interface de l\'application.',

  // Rôles
  AppStrings.rolePatient: 'Patient',
  AppStrings.roleDoctor: 'Médecin',
  AppStrings.roleAdmin: 'Administrateur',
  AppStrings.roleSuperAdmin: 'Super Admin',
  AppStrings.roleLabTech: 'Laborantin',
};

// ═══════════════════════════════════════════════════════════════════════════
// ENGLISH
// ═══════════════════════════════════════════════════════════════════════════
const Map<String, String> _english = {
  // General
  AppStrings.appName: 'Hopitel',
  AppStrings.welcome: 'Welcome',
  AppStrings.loading: 'Loading...',
  AppStrings.error: 'Error',
  AppStrings.retry: 'Retry',
  AppStrings.cancel: 'Cancel',
  AppStrings.save: 'Save',
  AppStrings.delete: 'Delete',
  AppStrings.confirm: 'Confirm',
  AppStrings.close: 'Close',
  AppStrings.search: 'Search',
  AppStrings.noData: 'No data',
  AppStrings.refresh: 'Refresh',
  AppStrings.back: 'Back',
  AppStrings.next: 'Next',
  AppStrings.seeAll: 'See all',
  AppStrings.seeMore: 'See more',
  AppStrings.yes: 'Yes',
  AppStrings.no: 'No',
  AppStrings.or: 'or',

  // Auth
  AppStrings.login: 'Login',
  AppStrings.logout: 'Logout',
  AppStrings.register: 'Register',
  AppStrings.email: 'Email',
  AppStrings.password: 'Password',
  AppStrings.confirmPassword: 'Confirm password',
  AppStrings.firstName: 'First name',
  AppStrings.lastName: 'Last name',
  AppStrings.phone: 'Phone',
  AppStrings.forgotPassword: 'Forgot password?',
  AppStrings.resetPassword: 'Reset password',
  AppStrings.verifyCode: 'Verify code',
  AppStrings.stayLoggedIn: 'Stay logged in',
  AppStrings.noAccount: "Don't have an account?",
  AppStrings.hasAccount: 'Already have an account?',
  AppStrings.createAccount: 'Create account',
  AppStrings.loginHere: 'Login here',
  AppStrings.registerHere: 'Register here',
  AppStrings.invalidCredentials: 'Invalid credentials',
  AppStrings.serverStarting: 'Server is starting, please wait 30 seconds...',
  AppStrings.logoutConfirm: 'Are you sure you want to log out?',

  // Patient
  AppStrings.patientDashboard: 'Patient Dashboard',
  AppStrings.helloPatient: 'Hello',
  AppStrings.howCanWeHelp: 'How can we help you today?',
  AppStrings.bookAppointment: 'Book appointment',
  AppStrings.myAppointments: 'My appointments',
  AppStrings.myResults: 'My results',
  AppStrings.myProfile: 'My profile',
  AppStrings.nearbyHospitals: 'Nearby hospitals',
  AppStrings.aiAssistant: 'AI Assistant',
  AppStrings.emergency: 'Emergency',
  AppStrings.searchHospital: 'Search hospital',
  AppStrings.analyses: 'Analyses',
  AppStrings.upcomingAppointments: 'Upcoming appointments',
  AppStrings.latestResults: 'Latest lab results',
  AppStrings.noAppointments: 'No upcoming appointments',
  AppStrings.noResults: 'No results available',
  AppStrings.howItWorks: 'How it works?',
  AppStrings.quickActions: 'Quick actions',
  AppStrings.takeAppointment: 'Book',
  AppStrings.nearby: 'Nearby',
  AppStrings.appointments: 'Appointments',
  AppStrings.medicalRecord: 'Medical Record',
  AppStrings.labResults: 'Lab Results',

  // Doctor
  AppStrings.doctorDashboard: 'Doctor Dashboard',
  AppStrings.helloDoctor: 'Hello, Dr.',
  AppStrings.welcomeDoctor: 'Welcome to your doctor space',
  AppStrings.myAgenda: 'My Agenda',
  AppStrings.myPatients: 'My Patients',
  AppStrings.myConsultations: 'My Consultations',
  AppStrings.todayAppointments: 'Today\'s appointments',
  AppStrings.lastConsultations: 'Last consultations',
  AppStrings.noAppointmentsToday: 'No appointments today',
  AppStrings.noFinishedConsultations: 'No finished consultations',
  AppStrings.refuse: 'Refuse',
  AppStrings.finish: 'Finish',
  AppStrings.chatting: 'Chat',
  AppStrings.planning: 'Planning',
  AppStrings.agenda: 'Agenda',

  // Admin Hospital
  AppStrings.adminDashboard: 'Admin Dashboard',
  AppStrings.doctors: 'Doctors',
  AppStrings.labTechnicians: 'Lab Technicians',
  AppStrings.services: 'Services',
  AppStrings.requests: 'Requests',
  AppStrings.patients: 'Patients',
  AppStrings.stats: 'Statistics',
  AppStrings.supervision: 'Supervision',
  AppStrings.consultations: 'Consultations',
  AppStrings.laboratory: 'Laboratory',
  AppStrings.postCare: 'Post-care',
  AppStrings.patientJourney: 'Patient Journey',
  AppStrings.messages: 'Messages',

  // Super Admin
  AppStrings.superAdminDashboard: 'Super Admin Dashboard',
  AppStrings.hospitals: 'Hospitals',
  AppStrings.administrators: 'Administrators',
  AppStrings.globalServices: 'Global Services',
  AppStrings.createHospital: 'Create Hospital',

  // Lab Tech
  AppStrings.labDashboard: 'Lab Tech Dashboard',
  AppStrings.pendingAnalyses: 'Pending Analyses',
  AppStrings.finishedAnalyses: 'Finished Analyses',
  AppStrings.registerAnalysis: 'Register Analysis',
  AppStrings.closeAnalysis: 'Close Analysis',

  // Messaging
  AppStrings.conversations: 'Conversations',
  AppStrings.contacts: 'Contacts',
  AppStrings.newMessage: 'New message',
  AppStrings.typeMessage: 'Type your message...',
  AppStrings.send: 'Send',
  AppStrings.noConversations: 'No conversations',
  AppStrings.noContacts: 'No contacts',
  AppStrings.startConversation: 'Start the conversation',
  AppStrings.consultationClosed: 'Consultation closed',
  AppStrings.messagesDisabled: 'Messages disabled',
  AppStrings.activeNow: 'Active now',
  AppStrings.offline: 'Offline',
  AppStrings.voiceMessage: 'Voice message',
  AppStrings.recording: 'Recording...',
  AppStrings.cancelRecording: 'Cancel',

  // Notifications
  AppStrings.notifications: 'Notifications',
  AppStrings.markAllRead: 'Mark all as read',
  AppStrings.noNotifications: 'No notifications',

  // Profile
  AppStrings.profile: 'Profile',
  AppStrings.editProfile: 'Edit profile',
  AppStrings.changePassword: 'Change password',
  AppStrings.settings: 'Settings',
  AppStrings.security: 'Security',
  AppStrings.language: 'Language',
  AppStrings.about: 'About',
  AppStrings.faqGuide: 'FAQ & Guide',
  AppStrings.contactSupport: 'Contact support',
  AppStrings.version: 'Version',
  AppStrings.information: 'Information',
  AppStrings.phoneLabel: 'Phone',
  AppStrings.address: 'Address',
  AppStrings.birthDate: 'Date of birth',
  AppStrings.gender: 'Gender',
  AppStrings.male: 'Male',
  AppStrings.female: 'Female',
  AppStrings.other: 'Other',

  // Medical
  AppStrings.medicalInfo: 'Medical Information',
  AppStrings.emergencyContact: 'Emergency Contact',
  AppStrings.contactName: 'Contact name',
  AppStrings.contactPhone: 'Phone',
  AppStrings.bloodType: 'Blood Type',
  AppStrings.allergies: 'Allergies',
  AppStrings.noAllergies: 'No known allergies',
  AppStrings.npi: 'NPI',
  AppStrings.npiRequired: 'NPI — Required for appointments',
  AppStrings.npiNotSet: 'Not set',
  AppStrings.socialSecurityNumber: 'Social Security No.',

  // Appointments
  AppStrings.appointmentsList: 'My Appointments',
  AppStrings.filterByStatus: 'Filter by status',
  AppStrings.filterByService: 'Filter by service',
  AppStrings.all: 'All',
  AppStrings.pending: 'Pending',
  AppStrings.confirmed: 'Confirmed',
  AppStrings.finished: 'Finished',
  AppStrings.cancelled: 'Cancelled',
  AppStrings.refused: 'Refused',
  AppStrings.waitingConfirmation: 'Waiting for doctor confirmation',
  AppStrings.fillPreConsult: 'Fill pre-consultation form',
  AppStrings.preConsultSent: 'Pre-consultation form sent',
  AppStrings.consultTerminated: 'Consultation completed — report available',
  AppStrings.cancelAppointment: 'Cancel this appointment',
  AppStrings.cancelReason: 'Cancellation reason (optional)...',
  AppStrings.contactDoctor: 'Contact doctor',
  AppStrings.accessConversation: 'Access conversation',

  // Results
  AppStrings.available: 'Available',
  AppStrings.consult: 'View',
  AppStrings.copyCode: 'Copy code',
  AppStrings.share: 'Share',
  AppStrings.sharedWith: 'SHARED WITH',
  AppStrings.accessByCode: 'Access via lab code',
  AppStrings.resultCode: 'Result code',
  AppStrings.enterCode: 'Enter a lab code',
  AppStrings.laboratoryLabel: 'Laboratory',
  AppStrings.patientLabel: 'Patient',

  // Hospitals
  AppStrings.findDoctor: 'Find a doctor',
  AppStrings.searchDescription: 'Search for a hospital or medical specialty',
  AppStrings.specialties: 'Specialties',
  AppStrings.popularSpecialties: 'Popular Specialties',
  AppStrings.nearbyHospitalsList: 'Nearby hospitals',
  AppStrings.noHospitalFound: 'No establishment found',
  AppStrings.resetFilters: 'Reset filters',
  AppStrings.hospitalDetail: 'Hospital detail',
  AppStrings.takeRdv: 'Book appointment',
  AppStrings.open: 'Open',
  AppStrings.closed: 'Closed',
  AppStrings.distance: 'Distance',
  AppStrings.practitioners: 'Practitioners',

  // Chatbot
  AppStrings.aiGreeting: 'Hello! I\'m Hopitel Intelligence. How can I help you today?',
  AppStrings.askQuestion: 'Ask a health question...',
  AppStrings.newChat: 'New chat',
  AppStrings.recentConversations: 'Recent conversations',
  AppStrings.noHistory: 'No history',
  AppStrings.aiDisclaimer: 'AI Assistant: Informational purposes only.',

  // Emergency
  AppStrings.emergencyNumbers: 'Emergency Numbers',
  AppStrings.samu: 'Ambulance',
  AppStrings.fire: 'Fire Dept.',
  AppStrings.police: 'Police',

  // Legal
  AppStrings.termsOfUse: 'Terms of Use',
  AppStrings.privacyPolicy: 'Privacy Policy',
  AppStrings.legalMentions: 'Legal Notices',

  // Settings
  AppStrings.notificationSettings: 'Notification settings',
  AppStrings.changeLanguage: 'Change language',
  AppStrings.choosePreferredLanguage: 'Choose your preferred language',
  AppStrings.defaultLanguage: 'Default language',
  AppStrings.languageNote: 'Language change will affect the application interface.',

  // Roles
  AppStrings.rolePatient: 'Patient',
  AppStrings.roleDoctor: 'Doctor',
  AppStrings.roleAdmin: 'Administrator',
  AppStrings.roleSuperAdmin: 'Super Admin',
  AppStrings.roleLabTech: 'Lab Technician',
};

// ═══════════════════════════════════════════════════════════════════════════
// FON (Bénin)
// ═══════════════════════════════════════════════════════════════════════════
const Map<String, String> _fon = {
  // Général
  AppStrings.appName: 'Hopitel',
  AppStrings.welcome: 'Kú dǒ',
  AppStrings.loading: 'Gbɛn...',
  AppStrings.error: 'Vodɔ',
  AppStrings.retry: 'Gbi na',
  AppStrings.cancel: 'Jojo',
  AppStrings.save: 'Hɛ̀n dó',
  AppStrings.delete: 'Yi lɔ́',
  AppStrings.confirm: 'Jɛ́',
  AppStrings.close: 'Fũ',
  AppStrings.search: 'Zhɛ̀',
  AppStrings.noData: 'Alá mɛ',
  AppStrings.refresh: 'Shɛ̀n gbi',
  AppStrings.back: 'Gbà',
  AppStrings.next: 'Shé',
  AppStrings.seeAll: 'Kpà àn',
  AppStrings.seeMore: 'Kpà shé',
  AppStrings.yes: 'Ó',
  AppStrings.no: 'Àvò',
  AppStrings.or: 'á',

  // Auth
  AppStrings.login: 'Yì ló',
  AppStrings.logout: 'Tɔ́ntɔ́n gbe',
  AppStrings.register: 'Tò wé',
  AppStrings.email: 'Bàtì mail',
  AppStrings.password: 'Nù mí',
  AppStrings.confirmPassword: 'Jɛ́ nù mí',
  AppStrings.firstName: 'Nùkun',
  AppStrings.lastName: 'Xásì',
  AppStrings.phone: 'Tɛ́lifòon',
  AppStrings.forgotPassword: 'Wú nù mí yi?',
  AppStrings.resetPassword: 'Shɛ̀n nù mí',
  AppStrings.verifyCode: 'Jɛ́ kòdò',
  AppStrings.stayLoggedIn: 'Dzò ló',
  AppStrings.noAccount: 'Aká mɛ ɔ?',
  AppStrings.hasAccount: 'Aká ń lɛ ɔ?',
  AppStrings.createAccount: 'Tò aká',
  AppStrings.loginHere: 'Yì ló ná',
  AppStrings.registerHere: 'Tò wé ná',
  AppStrings.invalidCredentials: 'Nà mà kúe',
  AppStrings.serverStarting: 'Sɛ́va ń bɛ̀...',
  AppStrings.logoutConfirm: 'Wú bé xɔ̀ yì ló ɔ?',

  // Patient
  AppStrings.patientDashboard: 'Akpò tò wé',
  AppStrings.helloPatient: 'Kú dǒ',
  AppStrings.howCanWeHelp: 'Míá kpa wu àwù ná kɛ́ ɔ?',
  AppStrings.bookAppointment: 'Gbà ràndɛ̀vú',
  AppStrings.myAppointments: 'Ràndɛ̀vú mɛ',
  AppStrings.myResults: 'Késhé mɛ',
  AppStrings.myProfile: 'Àpò mɛ',
  AppStrings.nearbyHospitals: 'Asílɛ̀kò ná á',
  AppStrings.aiAssistant: 'AM gbɛ̀',
  AppStrings.emergency: 'Asà kpá',
  AppStrings.searchHospital: 'Zhɛ̀ asílɛ̀kò',
  AppStrings.analyses: 'Anàlìz',
  AppStrings.upcomingAppointments: 'Ràndɛ̀vú yé ná',
  AppStrings.latestResults: 'Késhé ná',
  AppStrings.noAppointments: 'Ràndɛ̀vú mɛ àvò',
  AppStrings.noResults: 'Késhé mɛ àvò',
  AppStrings.howItWorks: 'Éshé kpa ná wɛ̀ ɔ?',
  AppStrings.quickActions: 'Gbá tò',
  AppStrings.takeAppointment: 'Gbà RDV',
  AppStrings.nearby: 'Ná á',
  AppStrings.appointments: 'RDV mɛ',
  AppStrings.medicalRecord: 'Àkà Dòkila',
  AppStrings.labResults: 'Késhé Labo',

  // Médecin
  AppStrings.doctorDashboard: 'Akpò dòkita',
  AppStrings.helloDoctor: 'Kú dǒ, Dr.',
  AppStrings.welcomeDoctor: 'Kú dǒ á dòkita wé',
  AppStrings.myAgenda: 'Àgɛ̀nda mɛ',
  AppStrings.myPatients: 'Àwù mɛ',
  AppStrings.myConsultations: 'Kɔ̀nsùl mɛ',
  AppStrings.todayAppointments: 'Ràndɛ̀vú éshé',
  AppStrings.lastConsultations: 'Kɔ̀nsùl ná',
  AppStrings.noAppointmentsToday: 'Ràndɛ̀vú mɛ àvò éshé',
  AppStrings.noFinishedConsultations: 'Kɔ̀nsùl àvò mɛ',
  AppStrings.refuse: 'Á vò',
  AppStrings.finish: 'Gblò',
  AppStrings.chatting: 'Gbèdì',
  AppStrings.planning: 'Plàn',
  AppStrings.agenda: 'Àgɛ̀nda',

  // Admin
  AppStrings.adminDashboard: 'Akpò administratɛ́',
  AppStrings.doctors: 'Dòkita',
  AppStrings.labTechnicians: 'Labo',
  AppStrings.services: 'Sɛ́vis',
  AppStrings.requests: 'Dàndé',
  AppStrings.patients: 'Àwù',
  AppStrings.stats: 'Stàtis',
  AppStrings.supervision: 'Sùpɛ̀rvizyɔ̀n',
  AppStrings.consultations: 'Kɔ̀nsùl',
  AppStrings.laboratory: 'Labo',
  AppStrings.postCare: 'Kú suívi',
  AppStrings.patientJourney: 'Yɛ̀wù àwù',
  AppStrings.messages: 'Mɛsàj',

  // Super Admin
  AppStrings.superAdminDashboard: 'Akpò àjáshí',
  AppStrings.hospitals: 'Asílɛ̀kò',
  AppStrings.administrators: 'Administratɛ́',
  AppStrings.globalServices: 'Sɛ́vis kòpò',
  AppStrings.createHospital: 'Tò asílɛ̀kò',

  // Laborantin
  AppStrings.labDashboard: 'Akpò labo',
  AppStrings.pendingAnalyses: 'Anàlìz yé ná',
  AppStrings.finishedAnalyses: 'Anàlìz gblò',
  AppStrings.registerAnalysis: 'Tò anàlìz',
  AppStrings.closeAnalysis: 'Fũ anàlìz',

  // Messagerie
  AppStrings.conversations: 'Gbèdì mɛ',
  AppStrings.contacts: 'Òshɛ̀ mɛ',
  AppStrings.newMessage: 'Mɛsàj yé',
  AppStrings.typeMessage: 'Tò mɛsàj wé...',
  AppStrings.send: 'Fi',
  AppStrings.noConversations: 'Gbèdì mɛ àvò',
  AppStrings.noContacts: 'Òshɛ̀ mɛ àvò',
  AppStrings.startConversation: 'Tò gbèdì',
  AppStrings.consultationClosed: 'Kɔ̀nsùl fũ',
  AppStrings.messagesDisabled: 'Mɛsàj àvò',
  AppStrings.activeNow: 'Gbɛn na',
  AppStrings.offline: 'Àvò',
  AppStrings.voiceMessage: 'Mɛsàj gbòhùn',
  AppStrings.recording: 'Gbɛ̀n...',
  AppStrings.cancelRecording: 'Jojo',

  // Notifications
  AppStrings.notifications: 'Notifìkàsyɔ̀n',
  AppStrings.markAllRead: 'Kpà àn',
  AppStrings.noNotifications: 'Notifìkàsyɔ̀n àvò',

  // Profil
  AppStrings.profile: 'Àpò',
  AppStrings.editProfile: 'Shɛ̀n àpò',
  AppStrings.changePassword: 'Shɛ̀n nù mí',
  AppStrings.settings: 'Kpanŋkpan',
  AppStrings.security: 'Gǎn hǎnyɛ',
  AppStrings.language: 'Gbe',
  AppStrings.about: 'Kpá à',
  AppStrings.faqGuide: 'FAQ & Gbàn',
  AppStrings.contactSupport: 'Gbà àshɛ̀',
  AppStrings.version: 'Vɛ̀rsyɔ̀n',
  AppStrings.information: 'Nyu',
  AppStrings.phoneLabel: 'Tɛ́lifòon',
  AppStrings.address: 'Àdrɛ̀s',
  AppStrings.birthDate: 'Émɛ̀',
  AppStrings.gender: 'Jìndè',
  AppStrings.male: 'Dóko',
  AppStrings.female: 'Dédé',
  AppStrings.other: 'Mɛ',

  // Médical
  AppStrings.medicalInfo: 'Nyù Dòkila',
  AppStrings.emergencyContact: 'Òshɛ̀ Asà',
  AppStrings.contactName: 'Nùkun òshɛ̀',
  AppStrings.contactPhone: 'Tɛ́lifòon',
  AppStrings.bloodType: 'Hwɛ̀',
  AppStrings.allergies: 'Alɛ́rjì',
  AppStrings.noAllergies: 'Alɛ́rjì mɛ àvò',
  AppStrings.npi: 'NPI',
  AppStrings.npiRequired: 'NPI — Dàndé kpa ràndɛ̀vú',
  AppStrings.npiNotSet: 'Àvò mɛ',
  AppStrings.socialSecurityNumber: 'Nù Sɛ̀kyurìté',

  // RDV
  AppStrings.appointmentsList: 'Ràndɛ̀vú mɛ',
  AppStrings.filterByStatus: 'Zhɛ̀ kpa stàtì',
  AppStrings.filterByService: 'Zhɛ̀ kpa sɛ́vis',
  AppStrings.all: 'Àn',
  AppStrings.pending: 'Yé ná',
  AppStrings.confirmed: 'Jɛ́',
  AppStrings.finished: 'Gblò',
  AppStrings.cancelled: 'Jójó',
  AppStrings.refused: 'Á vò',
  AppStrings.waitingConfirmation: 'Yé ná dòkita jɛ́',
  AppStrings.fillPreConsult: 'Tò fiche kɔ̀nsùl',
  AppStrings.preConsultSent: 'Fiche fi',
  AppStrings.consultTerminated: 'Kɔ̀nsùl gblò',
  AppStrings.cancelAppointment: 'Jójó ràndɛ̀vú',
  AppStrings.cancelReason: 'Tìkú...',
  AppStrings.contactDoctor: 'Gbà dòkita',
  AppStrings.accessConversation: 'Yì gbèdì',

  // Résultats
  AppStrings.available: 'Lɛ',
  AppStrings.consult: 'Kpà',
  AppStrings.copyCode: 'Kòpì kòdò',
  AppStrings.share: 'Gbà àshɛ̀',
  AppStrings.sharedWith: 'GBÀ ÀSHƐ̀',
  AppStrings.accessByCode: 'Yì kpa kòdò labo',
  AppStrings.resultCode: 'Kòdò késhé',
  AppStrings.enterCode: 'Tò kòdò labo',
  AppStrings.laboratoryLabel: 'Labo',
  AppStrings.patientLabel: 'Àwù',

  // Hôpitaux
  AppStrings.findDoctor: 'Zhɛ̀ dòkita',
  AppStrings.searchDescription: 'Zhɛ̀ asílɛ̀kò á sɛ́vis dòkila',
  AppStrings.specialties: 'Sɛ́vis dòkila',
  AppStrings.popularSpecialties: 'Sɛ́vis kpópùla',
  AppStrings.nearbyHospitalsList: 'Asílɛ̀kò ná á',
  AppStrings.noHospitalFound: 'Asílɛ̀kò mɛ àvò',
  AppStrings.resetFilters: 'Shɛ̀n zhɛ̀',
  AppStrings.hospitalDetail: 'Àshɛ́ asílɛ̀kò',
  AppStrings.takeRdv: 'Gbà RDV',
  AppStrings.open: 'Fé',
  AppStrings.closed: 'Fũ',
  AppStrings.distance: 'Yɛ̀wù',
  AppStrings.practitioners: 'Dòkita',

  // Chatbot
  AppStrings.aiGreeting: 'Kú dǒ! Mɛ́ né Hopitel Intelligence. Míá kpa wu àwù ná kɛ́ ɔ?',
  AppStrings.askQuestion: 'Bia bɔ̀ dòkila...',
  AppStrings.newChat: 'Gbèdì yé',
  AppStrings.recentConversations: 'Gbèdì ná',
  AppStrings.noHistory: 'Gbèdì mɛ àvò',
  AppStrings.aiDisclaimer: 'AM gbɛ̀: Nyu kpá yé mɛ shé.',

  // Urgences
  AppStrings.emergencyNumbers: 'Nùmɛrò Asà',
  AppStrings.samu: 'SAMU',
  AppStrings.fire: 'Àgbàdo',
  AppStrings.police: 'Polìs',

  // Légal
  AppStrings.termsOfUse: 'Sɛ́n lìn',
  AppStrings.privacyPolicy: 'Polìsì Prívàsi',
  AppStrings.legalMentions: 'Nyù Lègal',

  // Paramètres
  AppStrings.notificationSettings: 'Kpanŋkpan Notifìkàsyɔ̀n',
  AppStrings.changeLanguage: 'Shɛ̀n gbe',
  AppStrings.choosePreferredLanguage: 'Tò gbe wú kpá',
  AppStrings.defaultLanguage: 'Gbe kòshón',
  AppStrings.languageNote: 'Shɛ̀n gbe á fɛ̀ ápò shɛ̀.',

  // Rôles
  AppStrings.rolePatient: 'Àwù',
  AppStrings.roleDoctor: 'Dòkita',
  AppStrings.roleAdmin: 'Administratɛ́',
  AppStrings.roleSuperAdmin: 'Àjáshí',
  AppStrings.roleLabTech: 'Labo',
};

// ═══════════════════════════════════════════════════════════════════════════
// YORÙBÁ (Nigeria)
// ═══════════════════════════════════════════════════════════════════════════
const Map<String, String> _yoruba = {
  // General
  AppStrings.appName: 'Hopitel',
  AppStrings.welcome: 'Ẹ n lẹ',
  AppStrings.loading: 'Ń lòde...',
  AppStrings.error: 'Àṣìṣe',
  AppStrings.retry: 'Tún gbìyànjú',
  AppStrings.cancel: 'Fagile',
  AppStrings.save: 'Pamọ́',
  AppStrings.delete: 'Parẹ́',
  AppStrings.confirm: 'Jẹ́rì',
  AppStrings.close: 'Tí',
  AppStrings.search: 'Wá',
  AppStrings.noData: 'Kò sí dátà',
  AppStrings.refresh: 'Tún tẹ̀',
  AppStrings.back: 'Padà',
  AppStrings.next: 'Ìkejì',
  AppStrings.seeAll: 'Wo gbogbo',
  AppStrings.seeMore: 'Wo síi',
  AppStrings.yes: 'Bẹ́ẹ̀ni',
  AppStrings.no: 'Rárá',
  AppStrings.or: 'tàbí',

  // Auth
  AppStrings.login: 'Wọ inú',
  AppStrings.logout: 'Jáde',
  AppStrings.register: 'Kọjúọ',
  AppStrings.email: 'Ìmèlì',
  AppStrings.password: 'Ọ̀rọ̀ ìgbàgbọ́',
  AppStrings.confirmPassword: 'Jẹ́rì ọ̀rọ̀ ìgbàgbọ́',
  AppStrings.firstName: 'Orúkọ',
  AppStrings.lastName: 'Ìdílé',
  AppStrings.phone: 'Fòònù',
  AppStrings.forgotPassword: 'Gbàgbọ́ rẹ̀ rẹ̀ lọ?',
  AppStrings.resetPassword: 'Tún ọ̀rọ̀ ìgbàgbọ́',
  AppStrings.verifyCode: 'Jẹ́rì kòdì',
  AppStrings.stayLoggedIn: 'Sí inú',
  AppStrings.noAccount: 'Kò sí ìròyìn yín?',
  AppStrings.hasAccount: 'Ní ìròyìn tẹ́lẹ̀?',
  AppStrings.createAccount: 'Ṣàkọ sílẹ̀',
  AppStrings.loginHere: 'Wọ inú níbẹ̀',
  AppStrings.registerHere: 'Kọjúọ níbẹ̀',
  AppStrings.invalidCredentials: 'Ìdánilójú kò tọ́',
  AppStrings.serverStarting: 'Sàfítì ń bẹ̀rẹ̀...',
  AppStrings.logoutConfirm: 'Ṣé o gbàgbọ́ pé o fẹ́ jáde?',

  // Patient
  AppStrings.patientDashboard: 'Ìṣàkóso aláìsàn',
  AppStrings.helloPatient: 'Báwo ni',
  AppStrings.howCanWeHelp: 'Báwo ni a ṣe é ran ọ lọ́wọ́ lóní?',
  AppStrings.bookAppointment: 'Pa àpọ́ntì',
  AppStrings.myAppointments: 'Àpọ́ntì mi',
  AppStrings.myResults: 'Àbájáde mi',
  AppStrings.myProfile: 'Profaili mi',
  AppStrings.nearbyHospitals: 'Ilé ìwòsàn àásìkò',
  AppStrings.aiAssistant: 'Olùranṣe AI',
  AppStrings.emergency: 'Ìpànìyàn',
  AppStrings.searchHospital: 'Wá ilé ìwòsàn',
  AppStrings.analyses: 'Àyẹ̀wò',
  AppStrings.upcomingAppointments: 'Àpọ́ntì tó ń bọ̀',
  AppStrings.latestResults: 'Àbájáde àkọ́kọ́',
  AppStrings.noAppointments: 'Kò sí àpọ́ntì',
  AppStrings.noResults: 'Kò sí àbájáde',
  AppStrings.howItWorks: 'Báwo ni ó ṣiṣẹ́?',
  AppStrings.quickActions: 'Iṣẹ́ kíkánnà',
  AppStrings.takeAppointment: 'Pa RDV',
  AppStrings.nearby: 'Àásìkò',
  AppStrings.appointments: 'Àpọ́ntì mi',
  AppStrings.medicalRecord: 'Ìwé ìṣègùn',
  AppStrings.labResults: 'Àbájáde Labo',

  // Doctor
  AppStrings.doctorDashboard: 'Ìṣàkóso dókítà',
  AppStrings.helloDoctor: 'Báwo ni, Dr.',
  AppStrings.welcomeDoctor: 'Ẹ kú àbọ̀ sí ibùgbé dókítà yín',
  AppStrings.myAgenda: 'Àgẹ́nda mi',
  AppStrings.myPatients: 'Aláìsàn mi',
  AppStrings.myConsultations: 'Ìbánilójú mi',
  AppStrings.todayAppointments: 'Àpọ́ntì lóní',
  AppStrings.lastConsultations: 'Ìbánilójú kẹ́yìn',
  AppStrings.noAppointmentsToday: 'Kò sí àpọ́ntì lóní',
  AppStrings.noFinishedConsultations: 'Kò sí ìbánilojú tó parí',
  AppStrings.refuse: 'Kọ̀',
  AppStrings.finish: 'Parí',
  AppStrings.chatting: 'Bá àlàyé',
  AppStrings.planning: 'Ètò',
  AppStrings.agenda: 'Àgẹ́nda',

  // Admin
  AppStrings.adminDashboard: 'Ìṣàkóso òṣìṣẹ́',
  AppStrings.doctors: 'Dókítà',
  AppStrings.labTechnicians: 'Ọmọ iṣẹ́ Labo',
  AppStrings.services: 'Iṣẹ́',
  AppStrings.requests: 'Ìbéèrè',
  AppStrings.patients: 'Aláìsàn',
  AppStrings.stats: 'Ìsinmi',
  AppStrings.supervision: 'Ìkọ́ni',
  AppStrings.consultations: 'Ìbánilójú',
  AppStrings.laboratory: 'Labo',
  AppStrings.postCare: 'Ìtọ́jú sílẹ̀',
  AppStrings.patientJourney: 'Ìrìn àjò aláìsàn',
  AppStrings.messages: 'Ìfiranṣẹ́',

  // Super Admin
  AppStrings.superAdminDashboard: 'Ìṣàkóso ààṣá',
  AppStrings.hospitals: 'Ilé ìwòsàn',
  AppStrings.administrators: 'Àwọn òṣìṣẹ́',
  AppStrings.globalServices: 'Iṣẹ́ gbogbogbò',
  AppStrings.createHospital: 'Ṣàkọ ilé ìwòsàn',

  // Lab Tech
  AppStrings.labDashboard: 'Ìṣàkóso ọmọ iṣẹ́ Labo',
  AppStrings.pendingAnalyses: 'Àyẹ̀wò tó ń retí',
  AppStrings.finishedAnalyses: 'Àyẹ̀wò tó parí',
  AppStrings.registerAnalysis: 'Kọ àyẹ̀wò',
  AppStrings.closeAnalysis: 'Tí àyẹ̀wò',

  // Messaging
  AppStrings.conversations: 'Ìjíròrò',
  AppStrings.contacts: 'Àwọn ẹni',
  AppStrings.newMessage: 'Ìfiranṣẹ́ tuntun',
  AppStrings.typeMessage: 'Kọ ìfiranṣẹ́ yín...',
  AppStrings.send: 'Ránṣẹ́',
  AppStrings.noConversations: 'Kò sí ìjíròrò',
  AppStrings.noContacts: 'Kò sí ẹ̀nìyàn',
  AppStrings.startConversation: 'Bẹ̀rẹ̀ ìjíròrò',
  AppStrings.consultationClosed: 'Ìbánilójú ti ṣí',
  AppStrings.messagesDisabled: 'Ìfiranṣẹ́ ti parẹ́',
  AppStrings.activeNow: 'Ṣiṣẹ́ lọ́wọ́lọ́wọ́',
  AppStrings.offline: 'Kò sí inú',
  AppStrings.voiceMessage: 'Ìfiranṣẹ́ ohùn',
  AppStrings.recording: 'Ń gbiyanjú...',
  AppStrings.cancelRecording: 'Fagile',

  // Notifications
  AppStrings.notifications: 'Ìkéde',
  AppStrings.markAllRead: 'Kà gbogbo',
  AppStrings.noNotifications: 'Kò sí ìkéde',

  // Profile
  AppStrings.profile: 'Profaili',
  AppStrings.editProfile: 'Ṣàtúnṣe ìrísí',
  AppStrings.changePassword: 'Yí ọ̀rọ̀ ìgbàgbọ́',
  AppStrings.settings: 'Ètò',
  AppStrings.security: 'Ààbò',
  AppStrings.language: 'Èdè',
  AppStrings.about: 'Nípa',
  AppStrings.faqGuide: 'FAQ & Ìtọ́nisọ́na',
  AppStrings.contactSupport: 'Pe àtìlẹ́yìn',
  AppStrings.version: 'Vẹ́ẹ̀shọ̀n',
  AppStrings.information: 'Ìmọ̀',
  AppStrings.phoneLabel: 'Fòònù',
  AppStrings.address: 'Adrésì',
  AppStrings.birthDate: 'Ọjọ́ ìbí',
  AppStrings.gender: 'Akó',
  AppStrings.male: 'Ọkùnrin',
  AppStrings.female: 'Obìnrin',
  AppStrings.other: 'Mìíràn',

  // Medical
  AppStrings.medicalInfo: 'Ìmọ̀ Ìṣègùn',
  AppStrings.emergencyContact: 'Olùranṣe Ipànìyàn',
  AppStrings.contactName: 'Orúkọ olùranṣe',
  AppStrings.contactPhone: 'Fòònù',
  AppStrings.bloodType: 'Ìdí ẹ̀jẹ̀',
  AppStrings.allergies: 'Àrùn',
  AppStrings.noAllergies: 'Kò sí àrùn',
  AppStrings.npi: 'NPI',
  AppStrings.npiRequired: 'NPI — Ìlò fún àpọ́ntì',
  AppStrings.npiNotSet: 'Kò sí',
  AppStrings.socialSecurityNumber: 'Nọ́mbà Ààbò',

  // Appointments
  AppStrings.appointmentsList: 'Àpọ́ntì mi',
  AppStrings.filterByStatus: 'Ṣààyẹ̀wò sí ìpìlẹ̀',
  AppStrings.filterByService: 'Ṣààyẹ̀wò sí iṣẹ́',
  AppStrings.all: 'Gbogbo',
  AppStrings.pending: 'Tó ń retí',
  AppStrings.confirmed: 'Tó jẹ́rì',
  AppStrings.finished: 'Tó parí',
  AppStrings.cancelled: 'Tó fagile',
  AppStrings.refused: 'Tó kọ̀',
  AppStrings.waitingConfirmation: 'Ń retí ìjẹ́rì dókítà',
  AppStrings.fillPreConsult: 'Kọ ìwé ìbánilójú',
  AppStrings.preConsultSent: 'Ìwé ti ránṣẹ́',
  AppStrings.consultTerminated: 'Ìbánilójú ti parí',
  AppStrings.cancelAppointment: 'Fagile àpọ́ntì',
  AppStrings.cancelReason: 'Ìdí fagbile...',
  AppStrings.contactDoctor: 'Pe dókítà',
  AppStrings.accessConversation: 'Wọ inú ìjíròrò',

  // Results
  AppStrings.available: 'Wà níbẹ̀',
  AppStrings.consult: 'Wo',
  AppStrings.copyCode: 'Gbà kòdì',
  AppStrings.share: 'Pín',
  AppStrings.sharedWith: 'PÍN PÉLÚ',
  AppStrings.accessByCode: 'Wọ inú pẹ̀lú kòdì labo',
  AppStrings.resultCode: 'Kòdì àbájáde',
  AppStrings.enterCode: 'Tẹ kòdì labo',
  AppStrings.laboratoryLabel: 'Labo',
  AppStrings.patientLabel: 'Aláìsàn',

  // Hospitals
  AppStrings.findDoctor: 'Wá dókítà',
  AppStrings.searchDescription: 'Wá ilé ìwòsàn tàbí ìmọ̀ ìṣègùn',
  AppStrings.specialties: 'Ìmọ̀ ìṣègùn',
  AppStrings.popularSpecialties: 'Ìmọ̀ ìṣègùn gbajúgbajà',
  AppStrings.nearbyHospitalsList: 'Ilé ìwòsàn àásìkò',
  AppStrings.noHospitalFound: 'Kò sí ilé ìwòsàn',
  AppStrings.resetFilters: 'Tún wò',
  AppStrings.hospitalDetail: 'Ìsọ̀kan ilé ìwòsàn',
  AppStrings.takeRdv: 'Pa RDV',
  AppStrings.open: 'Ó ṣí',
  AppStrings.closed: 'Ó ti',
  AppStrings.distance: 'Ìjìnlẹ̀',
  AppStrings.practitioners: 'Dókítà',

  // Chatbot
  AppStrings.aiGreeting: 'Ẹ kú òjó! Mo jẹ́ Hopitel Intelligence. Báwo ni mo ṣe é ran ọ lọ́wọ́ lóní?',
  AppStrings.askQuestion: 'Bèèrè ìṣègùn...',
  AppStrings.newChat: 'Ìjíròrò tuntun',
  AppStrings.recentConversations: 'Ìjíròrò kẹ́yìn',
  AppStrings.noHistory: 'Kò sí ìtàn',
  AppStrings.aiDisclaimer: 'Olùranṣe AI: Ìmọ̀ nìkan.',

  // Emergency
  AppStrings.emergencyNumbers: 'Nọ́mbà Ipànìyàn',
  AppStrings.samu: 'Amboyàns',
  AppStrings.fire: 'Ìná',
  AppStrings.police: 'Ọlọ́pàá',

  // Legal
  AppStrings.termsOfUse: 'Ìlànà ìlò',
  AppStrings.privacyPolicy: 'Ètò Ààbò',
  AppStrings.legalMentions: 'Ìròyìn òfin',

  // Settings
  AppStrings.notificationSettings: 'Ètò ìkéde',
  AppStrings.changeLanguage: 'Yí èdè',
  AppStrings.choosePreferredLanguage: 'Yan èdè yín',
  AppStrings.defaultLanguage: 'Èdè ìbẹ̀rẹ̀',
  AppStrings.languageNote: 'Ìyí èdè yóò ṣi agbára sí àpò.',

  // Roles
  AppStrings.rolePatient: 'Aláìsàn',
  AppStrings.roleDoctor: 'Dókítà',
  AppStrings.roleAdmin: 'Òṣìṣẹ́',
  AppStrings.roleSuperAdmin: 'Ààṣá',
  AppStrings.roleLabTech: 'Ọmọ iṣẹ́ Labo',
};

/// Helper pour récupérer une traduction depuis le contexte.
///
/// Utilisation dans un widget :
/// ```dart
/// Text(t(context, AppStrings.welcome))
/// ```
/// Helper pour récupérer une traduction depuis le contexte.
///
/// Utilisation dans un widget :
/// ```dart
/// Text(t(context, AppStrings.welcome))
/// ```
String t(dynamic context, String key) {
  try {
    final provider = ProviderScope.containerOf(
      context,
      listen: false,
    ).read(languageProvider);
    final langCode = provider.languageCode;
    return translations[langCode]?[key] ??
        translations['fr']?[key] ??
        key;
  } catch (_) {
    return translations['fr']?[key] ?? key;
  }
}
