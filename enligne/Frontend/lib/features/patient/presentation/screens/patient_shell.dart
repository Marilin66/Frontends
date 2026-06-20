import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';
import '../../../../core/widgets/global_ai_bubble.dart';

export 'patient_home_screen.dart';
export 'patient_search_screen.dart';
export 'patient_appointments_screen.dart';
export 'patient_results_screen.dart' show PatientResultsContent;
export 'patient_messages_screen.dart';
export 'patient_profile_screen.dart';
export 'patient_change_password_screen.dart';
export 'patient_about_screen.dart';
export 'patient_language_screen.dart';
export 'patient_notification_settings_screen.dart';

class PatientShell extends ConsumerWidget {
  final Widget child;

  const PatientShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/patient/search')) return 1;
    if (location.startsWith('/patient/appointments')) return 2;
    if (location.startsWith('/patient/messagerie')) return 3;
    if (location.startsWith('/patient/profile')) return 4;
    return 0; // fallback to Home
  }

  void _onTap(int index, BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    switch (index) {
      case -1:
        if (location != '/notifications') context.push('/notifications');
        break;
      case 0:
        if (location != '/patient') context.go('/patient');
        break;
      case 1:
        if (location != '/patient/search') context.go('/patient/search');
        break;
      case 2:
        if (location != '/patient/appointments') context.go('/patient/appointments');
        break;
      case 3:
        if (location != '/patient/messagerie') context.go('/patient/messagerie');
        break;
      case 4:
        if (location != '/patient/profile') context.go('/patient/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Stack(
      children: [
        ResponsiveShellLayout(
          selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
          onDestinationSelected: (index) => _onTap(index, context),
          indicatorColor: AppColors.primary.withValues(alpha: 0.15),
          useTopMenuOnWeb: true,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Accueil',
            ),
            NavigationDestination(
              icon: Icon(Icons.search),
              selectedIcon: Icon(Icons.search),
              label: 'Recherche',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_month_outlined),
              selectedIcon: Icon(Icons.calendar_month),
              label: 'Mes RDV',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline),
              selectedIcon: Icon(Icons.chat_bubble),
              label: 'Messages',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
          child: child,
        ),
        const GlobalAIBubble(),
      ],
    );
  }
}
