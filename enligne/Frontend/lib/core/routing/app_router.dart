import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/request_password_reset_screen.dart';
import '../../features/auth/presentation/screens/reset_password_confirm_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/messagerie/presentation/screens/conversation_list_screen.dart';
import '../../features/notifications/presentation/screens/notification_screen.dart';
import '../../features/messagerie/presentation/screens/chat_screen.dart';
import '../../features/core/presentation/screens/edit_profile_screen.dart';
import '../../features/patient/presentation/screens/patient_shell.dart';
import '../../features/medecin/presentation/screens/medecin_shell.dart';
import '../../features/admin_hopital/presentation/screens/admin_hopital_shell.dart';
import '../../features/super_admin/presentation/screens/super_admin_shell.dart';
import '../../features/super_admin/presentation/screens/super_admin_hopital_detail_screen.dart';
import '../../features/super_admin/data/models/hopital_model.dart' hide HopitalServiceModel;
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_shell.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_dashboard_screen.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_pending_analyses_screen.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_finished_analyses_screen.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_profile_screen.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_about_screen.dart';
import 'package:hopitel_app/features/laborantin/presentation/screens/laborantin_change_password_screen.dart';
import '../../features/chatbot/presentation/screens/patient_chatbot_screen.dart';
import '../../features/patient/presentation/screens/patient_nearby_hospitals_screen.dart';
import '../../features/patient/presentation/screens/hopital_detail_screen.dart';
import '../../features/patient/presentation/screens/service_detail_screen.dart';
import '../../features/patient/presentation/screens/rendezvous_booking_screen.dart';
import '../../features/patient/presentation/screens/patient_intake_screen.dart';
import '../../features/patient/presentation/screens/patient_result_code_screen.dart';
import '../../features/patient/data/models/hopital_search_model.dart' hide HopitalServiceModel;
import '../../features/admin_hopital/data/models/hopital_service_model.dart';
import '../../features/patient/data/models/medecin_search_model.dart';
import '../../features/medecin/presentation/screens/medecin_resultat_patient_screen.dart';
import '../../features/medecin/presentation/screens/medecin_consultations_screen.dart';
import '../../features/medecin/presentation/screens/medecin_consultation_detail_screen.dart';
import '../../features/patient/presentation/screens/patient_consultation_detail_screen.dart';
import '../../features/patient/presentation/screens/patient_result_share_screen.dart';
import '../../features/core/presentation/screens/onboarding_screen.dart';
import '../../features/core/presentation/screens/emergency_numbers_screen.dart';
import '../../features/core/presentation/screens/health_tips_screen.dart';
import '../../features/core/presentation/screens/public_hospital_search_screen.dart';
import '../../features/core/presentation/screens/legal/privacy_policy_screen.dart';
import '../../features/core/presentation/screens/legal/terms_of_use_screen.dart';
import '../../features/core/presentation/screens/legal/legal_mentions_screen.dart';
import '../constants/app_constants.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _patientNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'patient');


final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ValueNotifier<AuthState>(ref.read(authProvider));

  ref.onDispose(() {
    authNotifier.dispose();
  });

  ref.listen<AuthState>(authProvider, (_, next) {
    authNotifier.value = next;
  });

  // Liste des routes accessibles sans être connecté
  const publicRoutes = [
    '/onboarding',
    '/login',
    '/register',
    '/hospitals',
    '/emergency',
    '/tips',
    '/chatbot',
    '/nearby',
    '/result-code',
    '/privacy',
    '/terms',
    '/legal-mentions',
  ];

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: authNotifier,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final authState = authNotifier.value;

      final isLoading = authState.status == AuthStatus.loading ||
          authState.status == AuthStatus.initial;
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final isPublicRoute = publicRoutes.contains(state.matchedLocation) ||
                            state.matchedLocation == '/forgot-password' ||
                            state.matchedLocation.startsWith('/reset-password') ||
                            state.matchedLocation.startsWith('/hopital/') ||
                            state.matchedLocation == '/service';
      final isOnSplash = state.matchedLocation == '/';
      final isAuthRoute = state.matchedLocation == '/login' || 
                          state.matchedLocation == '/register' ||
                          state.matchedLocation == '/forgot-password' ||
                          state.matchedLocation.startsWith('/reset-password');

      // 1. Si en chargement et pas encore sur Splash → Ne rien faire si on est déjà sur login/register
      if (isLoading && !isOnSplash && !isAuthRoute) return '/';

      // 2. Si non authentifié
      if (!isAuthenticated && !isLoading) {
        // Uniquement si on est sur la racine (Splash) → Onboarding
        if (isOnSplash) return '/onboarding';
        
        // Si on essaie d'aller sur une page privée et qu'on n'est pas sur une route d'auth → login
        if (!isPublicRoute && !isAuthRoute) return '/login';
      }

      // 3. Si authentifié
      if (isAuthenticated) {
        // Si on est sur une page d'accueil/auth/onboarding → Rediriger vers Home
        if (isOnSplash || isAuthRoute || state.matchedLocation == '/onboarding') {
          return _getHomeRoute(authState.user?.role);
        }
      }

      // Redirections intelligentes basées sur le rôle pour la messagerie
      final user = authState.user;
      final role = user?.role ?? 'patient';
      
      String rolePrefix;
      if (role == 'admin_hopital') {
        rolePrefix = '/admin-hopital';
      } else if (role == 'medecin') {
        rolePrefix = '/medecin';
      } else if (role == 'super_admin' || role == 'admin_general' || role == 'admin') {
        rolePrefix = '/super-admin';
      } else if (role == 'laborantin') {
        rolePrefix = '/laborantin';
      } else {
        rolePrefix = '/patient';
      }

      // Redirections des anciennes URLs publiques vers les nouvelles
      if (state.matchedLocation == '/patient/nearby') return '/nearby';
      if (state.matchedLocation == '/patient/chatbot') return '/chatbot';
      if (state.matchedLocation.startsWith('/patient/hopital/')) {
        final rest = state.matchedLocation.replaceFirst('/patient/hopital/', '');
        return '/hopital/$rest';
      }
      // Note: /patient/service is handled directly in the patient ShellRoute
      // to preserve state.extra (GoRouter drops extra on redirects)

      if (state.matchedLocation == '/messagerie') return '$rolePrefix/messagerie';
      
      if (state.matchedLocation.startsWith('/messagerie/consultation/')) {
        final id = state.pathParameters['id'] ?? state.uri.pathSegments.last;
        return '$rolePrefix/messagerie/consultation/$id';
      }
      if (state.matchedLocation.startsWith('/messagerie/direct/')) {
        final id = state.pathParameters['id'] ?? state.uri.pathSegments.last;
        return '$rolePrefix/messagerie/direct/$id';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const SplashScreen(),
        ),
      ),
      GoRoute(
        path: '/onboarding',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const OnboardingScreen(),
        ),
      ),
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const LoginScreen(),
        ),
      ),
      GoRoute(
        path: '/register',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const RegisterScreen(),
        ),
      ),
      GoRoute(
        path: '/forgot-password',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const RequestPasswordResetScreen(),
        ),
      ),
      GoRoute(
        path: '/reset-password/:token',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: ResetPasswordConfirmScreen(token: state.pathParameters['token']!),
        ),
      ),

      // Routes Publiques (accessibles sans connexion)
      GoRoute(
        path: '/hospitals',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const PublicHospitalSearchScreen(),
        ),
      ),
      GoRoute(
        path: '/emergency',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const EmergencyNumbersScreen(),
        ),
      ),
      GoRoute(
        path: '/tips',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const HealthTipsScreen(),
        ),
      ),
      GoRoute(
        path: '/chatbot',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const PatientChatbotScreen(),
        ),
      ),
      GoRoute(
        path: '/nearby',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const PatientNearbyHospitalsScreen(),
        ),
      ),
      GoRoute(
        path: '/hopital/:id',
        pageBuilder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          final hopital = state.extra as HopitalSearchModel?;
          return _buildPageWithFadeTransition(
            state: state,
            child: HopitalDetailScreen(
              hopital: hopital,
              hopitalId: id,
            ),
          );
        },
      ),
      GoRoute(
        path: '/service',
        pageBuilder: (context, state) {
          final data = state.extra as Map<String, dynamic>?;
          if (data == null) {
            // Fallback si on arrive ici sans extra (ex: rechargement de page)
            return _buildPageWithFadeTransition(
              state: state,
              child: const SplashScreen(),
            );
          }
          HopitalServiceModel service;
          if (data['service'] is Map<String, dynamic>) {
            service = HopitalServiceModel.fromJson(data['service'] as Map<String, dynamic>);
          } else {
            service = data['service'] as HopitalServiceModel;
          }
          HopitalSearchModel hopital;
          if (data['hopital'] is Map<String, dynamic>) {
            hopital = HopitalSearchModel.fromJson(data['hopital'] as Map<String, dynamic>);
          } else {
            hopital = data['hopital'] as HopitalSearchModel;
          }
          return _buildPageWithFadeTransition(
            state: state,
            child: ServiceDetailScreen(
              service: service,
              hopital: hopital,
            ),
          );
        },
      ),
      GoRoute(
        path: '/privacy',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const PrivacyPolicyScreen(),
        ),
      ),
      GoRoute(
        path: '/terms',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const TermsOfUseScreen(),
        ),
      ),
      GoRoute(
        path: '/legal-mentions',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const LegalMentionsScreen(),
        ),
      ),
      GoRoute(
        path: '/result-code',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const PatientResultCodeScreen(),
        ),
      ),

      // Notifications (accessible par tous les rôles)
      GoRoute(
        path: '/notifications',
        pageBuilder: (context, state) => _buildPageWithFadeTransition(
          state: state,
          child: const NotificationScreen(),
        ),
      ),

      // Messagerie is now handled inside role-based shells to keep the bottom navigation

      // Patient
      ShellRoute(
        navigatorKey: _patientNavigatorKey,
        builder: (context, state, child) => PatientShell(child: child),
        routes: [
          GoRoute(
            path: '/patient',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientHomeContent(),
            ),
          ),
          GoRoute(
            path: '/patient/result-code',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientResultCodeScreen(),
            ),
          ),

          GoRoute(
            path: '/patient/rdv/:rdvId/intake',
            pageBuilder: (context, state) {
              final rdvId = int.parse(state.pathParameters['rdvId']!);
              final medecinNom = state.uri.queryParameters['medecin'];
              return _buildPageWithFadeTransition(
                state: state,
                child: PatientIntakeScreen(
                  rendezvousId: rdvId,
                  medecinNom: medecinNom ?? 'votre médecin',
                ),
              );
            },
          ),

          GoRoute(
            path: '/patient/search',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientSearchContent(),
            ),
          ),

          GoRoute(
            path: '/patient/service',
            pageBuilder: (context, state) {
              final data = state.extra as Map<String, dynamic>?;
              if (data == null) {
                return _buildPageWithFadeTransition(
                  state: state,
                  child: const PatientSearchContent(),
                );
              }
              HopitalServiceModel service;
              if (data['service'] is Map<String, dynamic>) {
                service = HopitalServiceModel.fromJson(data['service'] as Map<String, dynamic>);
              } else {
                service = data['service'] as HopitalServiceModel;
              }
              HopitalSearchModel hopital;
              if (data['hopital'] is Map<String, dynamic>) {
                hopital = HopitalSearchModel.fromJson(data['hopital'] as Map<String, dynamic>);
              } else {
                hopital = data['hopital'] as HopitalSearchModel;
              }
              return _buildPageWithFadeTransition(
                state: state,
                child: ServiceDetailScreen(service: service, hopital: hopital),
              );
            },
          ),
          GoRoute(
            path: '/patient/medecin/:id/rendezvous',
            pageBuilder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              final medecin = state.extra as MedecinSearchModel?;
              return _buildPageWithFadeTransition(
                state: state,
                child: RendezvousBookingScreen(medecin: medecin, medecinId: id),
              );
            },
          ),

          GoRoute(
            path: '/patient/appointments',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientAppointmentsContent(),
            ),
          ),
          GoRoute(
            path: '/patient/results',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientResultsContent(),
            ),
          ),

          GoRoute(
            path: '/patient/consultation/:id',
            pageBuilder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return _buildPageWithFadeTransition(
                state: state,
                child: PatientConsultationDetailScreen(consultationId: id),
              );
            },
          ),

          GoRoute(
            path: '/patient/results/:id/share',
            pageBuilder: (context, state) {
              final resultat = state.extra as dynamic;
              return _buildPageWithFadeTransition(
                state: state,
                child: PatientResultShareScreen(resultat: resultat),
              );
            },
          ),

          GoRoute(
            path: '/patient/messagerie',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const ConversationListScreen(),
            ),
            routes: [
              GoRoute(
                path: 'consultation/:id',
                pageBuilder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return _buildPageWithFadeTransition(
                    state: state,
                    child: ChatScreen(consultationId: id, contactName: 'Consultation'),
                  );
                },
              ),
              GoRoute(
                path: 'direct/:id',
                pageBuilder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return _buildPageWithFadeTransition(
                    state: state,
                    child: ChatScreen(destinataireId: id, contactName: 'Conversation Directe'),
                  );
                },
              ),
            ],
          ),

          GoRoute(
            path: '/patient/profile',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientProfileContent(),
            ),
          ),

          GoRoute(
            path: '/patient/profile/edit',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const EditProfileScreen(primaryColor: AppColors.primary),
            ),
          ),
          GoRoute(
            path: '/patient/change-password',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientChangePasswordContent(),
            ),
          ),
          GoRoute(
            path: '/patient/about',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientAboutContent(),
            ),
          ),
          GoRoute(
            path: '/patient/language',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientLanguageContent(),
            ),
          ),
          GoRoute(
            path: '/patient/notification-settings',
            pageBuilder: (context, state) => _buildPageWithFadeTransition(
              state: state,
              child: const PatientNotificationSettingsContent(),
            ),
          ),

        ],
      ),

      // Médecin
      ShellRoute(
        builder: (context, state, child) => MedecinShell(child: child),
        routes: [
          GoRoute(path: '/medecin', builder: (context, state) => const MedecinHomeContent()),
          GoRoute(path: '/medecin/agenda', builder: (context, state) => const MedecinAgendaContent()),
          GoRoute(path: '/medecin/result-patient', builder: (context, state) => const MedecinResultatPatientScreen()),
          GoRoute(path: '/medecin/consultations', builder: (context, state) => const MedecinConsultationsScreen()),
          GoRoute(
            path: '/medecin/consultations/:id',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return MedecinConsultationDetailScreen(consultationId: id);
            },
          ),
          GoRoute(path: '/medecin/patients', builder: (context, state) => const MedecinPatientsContent()),
          GoRoute(
            path: '/medecin/messagerie',
            builder: (context, state) => const ConversationListScreen(),
            routes: [
              GoRoute(
                path: 'consultation/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(consultationId: id, contactName: 'Consultation');
                },
              ),
              GoRoute(
                path: 'direct/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(destinataireId: id, contactName: 'Conversation Directe');
                },
              ),
            ],
          ),
          GoRoute(path: '/medecin/profile', builder: (context, state) => const MedecinProfileContent()),
          GoRoute(path: '/medecin/profile/edit', builder: (context, state) => const EditProfileScreen(primaryColor: AppColors.medecin)),
          GoRoute(path: '/medecin/change-password', builder: (context, state) => const MedecinChangePasswordContent()),
          GoRoute(path: '/medecin/about', builder: (context, state) => const MedecinAboutContent()),
          GoRoute(path: '/medecin/language', builder: (context, state) => const PatientLanguageContent(primaryColor: AppColors.medecin)),
          GoRoute(path: '/medecin/notifications', builder: (context, state) => const PatientNotificationSettingsContent(primaryColor: AppColors.medecin)),
        ],
      ),

      // Admin Hôpital
      ShellRoute(
        builder: (context, state, child) => AdminHopitalShell(child: child),
        routes: [
          GoRoute(path: '/admin-hopital', builder: (context, state) => const AdminHopitalHomeContent()),
          GoRoute(path: '/admin-hopital/medecins', builder: (context, state) => const AdminHopitalMedecinsContent()),
          GoRoute(path: '/admin-hopital/laborantins', builder: (context, state) => const AdminHopitalLaborantinsContent()),
          GoRoute(path: '/admin-hopital/services', builder: (context, state) => const AdminHopitalServicesContent()),
          GoRoute(path: '/admin-hopital/demandes', builder: (context, state) => const AdminHopitalDemandesContent()),
          GoRoute(path: '/admin-hopital/patients', builder: (context, state) => const AdminHopitalPatientsContent()),
          GoRoute(path: '/admin-hopital/stats', builder: (context, state) => const AdminHopitalStatsContent()),
          GoRoute(path: '/admin-hopital/messages', builder: (context, state) => const AdminHopitalMessagesContent()),
          GoRoute(
            path: '/admin-hopital/messagerie',
            builder: (context, state) => const ConversationListScreen(),
            routes: [
              GoRoute(
                path: 'consultation/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(consultationId: id, contactName: 'Consultation');
                },
              ),
              GoRoute(
                path: 'direct/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(destinataireId: id, contactName: 'Conversation Directe');
                },
              ),
            ],
          ),
          GoRoute(path: '/admin-hopital/settings', builder: (context, state) => const AdminHopitalSettingsContent()),
          GoRoute(path: '/admin-hopital/profile/edit', builder: (context, state) => const EditProfileScreen(primaryColor: AppColors.adminHopital)),
          GoRoute(path: '/admin-hopital/change-password', builder: (context, state) => const AdminHopitalChangePasswordContent()),
          GoRoute(path: '/admin-hopital/about', builder: (context, state) => const AdminHopitalAboutContent()),
          GoRoute(path: '/admin-hopital/language', builder: (context, state) => const PatientLanguageContent(primaryColor: AppColors.adminHopital)),
          GoRoute(path: '/admin-hopital/notifications', builder: (context, state) => const PatientNotificationSettingsContent(primaryColor: AppColors.adminHopital)),
        ],
      ),

      // Super Admin
      ShellRoute(
        builder: (context, state, child) => SuperAdminShell(child: child),
        routes: [
          GoRoute(path: '/super-admin', builder: (context, state) => const SuperAdminHomeContent()),
          GoRoute(path: '/super-admin/hopitaux', builder: (context, state) => const SuperAdminHopitauxContent()),
          GoRoute(
            path: '/super-admin/hopitaux/:id',
            builder: (context, state) {
              final hopital = state.extra as HopitalModel;
              return SuperAdminHopitalDetailScreen(hopital: hopital);
            },
          ),
          GoRoute(path: '/super-admin/users', builder: (context, state) => const SuperAdminUsersContent()),
          GoRoute(path: '/super-admin/services', builder: (context, state) => const SuperAdminServicesContent()),
          GoRoute(path: '/super-admin/demandes', builder: (context, state) => const SuperAdminDemandesContent()),
          GoRoute(path: '/super-admin/settings', builder: (context, state) => const SuperAdminSettingsContent()),
          GoRoute(path: '/super-admin/profile/edit', builder: (context, state) => const EditProfileScreen(primaryColor: AppColors.superAdmin)),
          GoRoute(path: '/super-admin/change-password', builder: (context, state) => const SuperAdminChangePasswordContent()),
          GoRoute(path: '/super-admin/about', builder: (context, state) => const SuperAdminAboutContent()),
          GoRoute(path: '/super-admin/stats', builder: (context, state) => const SuperAdminStatsContent()),
          GoRoute(
            path: '/super-admin/messagerie',
            builder: (context, state) => const ConversationListScreen(),
            routes: [
              GoRoute(
                path: 'direct/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(destinataireId: id, contactName: 'Conversation Directe');
                },
              ),
            ],
          ),
          GoRoute(path: '/super-admin/language', builder: (context, state) => const PatientLanguageContent(primaryColor: AppColors.superAdmin)),
          GoRoute(path: '/super-admin/notifications', builder: (context, state) => const PatientNotificationSettingsContent(primaryColor: AppColors.superAdmin)),
        ],
      ),

      // Laborantin
      ShellRoute(
        builder: (context, state, child) => LaborantinShell(child: child),
        routes: [
          GoRoute(path: '/laborantin', builder: (context, state) => const LaborantinDashboardScreen()),
          GoRoute(path: '/laborantin/pending', builder: (context, state) => const LaborantinPendingAnalysesScreen()),
          GoRoute(path: '/laborantin/finished', builder: (context, state) => const LaborantinFinishedAnalysesScreen()),
          GoRoute(path: '/laborantin/profile', builder: (context, state) => const LaborantinProfileScreen()),
          GoRoute(path: '/laborantin/profile/edit', builder: (context, state) => const EditProfileScreen(primaryColor: AppColors.laborantin)),
          GoRoute(
            path: '/laborantin/messagerie',
            builder: (context, state) => const ConversationListScreen(),
            routes: [
              GoRoute(
                path: 'direct/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ChatScreen(destinataireId: id, contactName: 'Conversation Directe');
                },
              ),
            ],
          ),
          GoRoute(path: '/laborantin/language', builder: (context, state) => const PatientLanguageContent(primaryColor: AppColors.laborantin)),
          GoRoute(path: '/laborantin/notifications', builder: (context, state) => const PatientNotificationSettingsContent(primaryColor: AppColors.laborantin)),
          GoRoute(path: '/laborantin/change-password', builder: (context, state) => const LaborantinChangePasswordScreen()),
          GoRoute(path: '/laborantin/about', builder: (context, state) => const LaborantinAboutScreen()),
        ],
      ),
    ],
  );
});

CustomTransitionPage<void> _buildPageWithFadeTransition({
  required GoRouterState state,
  required Widget child,
}) {
  // On Flutter Web, using state.pageKey inside a ShellRoute can trigger
  // "!_keyReservation.contains(key)" assertion when navigating between
  // shell tabs, because GoRouter may assign the same pageKey to multiple
  // routes within the same shell. Using ValueKey(state.matchedLocation)
  // guarantees each route gets a unique, stable key based on its path.
  return CustomTransitionPage<void>(
    key: ValueKey<String>(state.uri.toString()),
    child: child,
    transitionDuration: const Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  );
}

String _getHomeRoute(String? role) {
  switch (role) {
    case AppConstants.rolePatient:
      return '/patient';
    case AppConstants.roleMedecin:
      return '/medecin';
    case AppConstants.roleAdminHopital:
      return '/admin-hopital';
    case AppConstants.roleAdminGeneral:
      return '/super-admin';
    case AppConstants.roleLaborantin:
      return '/laborantin';
    default:
      return '/login';
  }
}
