import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  ApiConstants._();

  // Base URL dynamique selon l'environnement (.env)
  static String get baseUrlWeb => dotenv.env['BASE_URL_WEB'] ?? 'http://localhost:8000/api';
  static String get baseUrlMobile => dotenv.env['BASE_URL_MOBILE'] ?? 'http://10.0.2.2:8000/api';
  static String get baseUrl {
    String url = kIsWeb ? baseUrlWeb : baseUrlMobile;
    if (!url.endsWith('/')) url += '/';
    return url;
  }

  static String get wsBaseUrl {
    final url = baseUrl;
    if (url.startsWith('https://')) {
      return url.replaceFirst('https://', 'wss://').replaceFirst('/api/', '');
    } else if (url.startsWith('http://')) {
      return url.replaceFirst('http://', 'ws://').replaceFirst('/api/', '');
    }
    return url.replaceFirst('/api/', '');
  }

  // Accès par code (public)
  static const String resultatsAccesCode = 'resultats/acces/';

  // Auth
  static const String login = 'token/';
  static const String refreshToken = 'token/refresh/';
  static const String register = 'accounts/register/';
  static const String verifyEmail = 'accounts/verify-email';
  static const String verifyCode = 'accounts/verify-code/';
  static const String resendCode = 'accounts/resend-code/';
  static const String requestPasswordReset = 'accounts/request-password-reset/';
  static const String resetPasswordConfirm = 'accounts/reset-password-confirm/';
  static const String userMe = 'accounts/users/me/';

  // Médecins
  static const String medecins = 'accounts/medecins/';
  static const String medecinsImport = 'accounts/medecins/import/';
  static const String medecinsImportTemplate = 'accounts/medecins/import-template/';

  // Laborantins
  static const String laborantins = 'accounts/laborantins/';

  // Patients
  static const String patients = 'accounts/patients/';

  // Admin Hôpitaux
  static const String adminHopitaux = 'accounts/admin-hopitaux/';

  // Hôpitaux
  static const String hopitaux = 'hopitaux/';
  static const String services = 'services/';
  static const String hopitalStats = 'hopitaux/statistiques/';

  // Demandes de service
  static const String demandes = 'demandes/';

  // Rendez-vous
  static const String disponibilites = 'disponibilites/';
  static const String rendezvous = 'rendezvous/';
  static const String consultations = 'consultations/';

  // Résultats
  static const String resultats = 'resultats/';
  static const String analyses = 'analyses/';

  // Messagerie
  static const String conversations = 'conversations/';
  static const String messages = 'messages/';

  // Chatbot
  static const String chatbotMessage = 'chatbot/message/';
  static const String chatbotHistory = 'chatbot/history/';

  // Notifications
  static const String notifications = 'notifications/';
}
