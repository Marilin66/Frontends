import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';

export 'medecin_home_screen.dart';
export 'medecin_patients_screen.dart';
export 'medecin_messages_screen.dart';
export 'medecin_profile_screen.dart';
export 'medecin_change_password_screen.dart';
export 'medecin_about_screen.dart';
export 'medecin_agenda_screen.dart';

class MedecinShell extends ConsumerWidget {
  final Widget child;

  const MedecinShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/medecin/agenda')) return 1;
    if (location.startsWith('/medecin/patients')) return 2;
    if (location.startsWith('/medecin/messagerie')) return 3;
    if (location.startsWith('/medecin/profile')) return 4;
    if (location.startsWith('/medecin/settings')) return 4;
    if (location.startsWith('/medecin/change-password')) return 4;
    if (location.startsWith('/medecin/about')) return 4;
    return 0;
  }

  void _onTap(int index, BuildContext context) {
    switch (index) {
      case -1:
        context.push('/notifications');
        break;
      case 0:
        context.go('/medecin');
        break;
      case 1:
        context.go('/medecin/agenda');
        break;
      case 2:
        context.go('/medecin/patients');
        break;
      case 3:
        context.go('/medecin/messagerie');
        break;
      case 4:
        context.go('/medecin/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ResponsiveShellLayout(
      selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
      onDestinationSelected: (index) => _onTap(index, context),
      indicatorColor: AppColors.medecin.withValues(alpha: 0.15),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: 'Accueil',
        ),
        NavigationDestination(
          icon: Icon(Icons.calendar_today_outlined),
          selectedIcon: Icon(Icons.calendar_today),
          label: 'Agenda',
        ),
        NavigationDestination(
          icon: Icon(Icons.people_outlined),
          selectedIcon: Icon(Icons.people),
          label: 'Patients',
        ),
        NavigationDestination(
          icon: Icon(Icons.message_outlined),
          selectedIcon: Icon(Icons.message),
          label: 'Messages',
        ),
        NavigationDestination(
          icon: Icon(Icons.settings_outlined),
          selectedIcon: Icon(Icons.settings),
          label: 'Paramètres',
        ),
      ],
      child: child,
    );
  }
}
