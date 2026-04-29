import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';

export 'admin_hopital_home_screen.dart';
export 'admin_hopital_medecins_screen.dart';
export 'admin_hopital_services_screen.dart';
export 'admin_hopital_messages_screen.dart';
export 'admin_hopital_settings_screen.dart';
export 'admin_hopital_change_password_screen.dart';
export 'admin_hopital_laborantins_screen.dart';
export 'admin_hopital_about_screen.dart';

class AdminHopitalShell extends ConsumerWidget {
  final Widget child;

  const AdminHopitalShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/admin-hopital/medecins')) return 1;
    if (location.startsWith('/admin-hopital/laborantins')) return 2;
    if (location.startsWith('/admin-hopital/services')) return 3;
    if (location.startsWith('/admin-hopital/messages')) return 4;
    if (location.startsWith('/admin-hopital/settings')) return 5;
    return 0;
  }

  void _onTap(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/admin-hopital');
        break;
      case 1:
        context.go('/admin-hopital/medecins');
        break;
      case 2:
        context.go('/admin-hopital/laborantins');
        break;
      case 3:
        context.go('/admin-hopital/services');
        break;
      case 4:
        context.go('/admin-hopital/messages');
        break;
      case 5:
        context.go('/admin-hopital/settings');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ResponsiveShellLayout(
      selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
      onDestinationSelected: (index) => _onTap(index, context),
      indicatorColor: AppColors.adminHopital.withOpacity(0.15),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home),
          label: 'Accueil',
        ),
        NavigationDestination(
          icon: Icon(Icons.people_outlined),
          selectedIcon: Icon(Icons.people),
          label: 'Médecins',
        ),
        NavigationDestination(
          icon: Icon(Icons.biotech_outlined),
          selectedIcon: Icon(Icons.biotech),
          label: 'Laborantins',
        ),
        NavigationDestination(
          icon: Icon(Icons.miscellaneous_services_outlined),
          selectedIcon: Icon(Icons.miscellaneous_services),
          label: 'Services',
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
