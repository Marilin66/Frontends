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
export 'admin_hopital_demandes_screen.dart';
export 'admin_hopital_patients_screen.dart';
export 'admin_hopital_stats_screen.dart';

class AdminHopitalShell extends ConsumerWidget {
  final Widget child;

  const AdminHopitalShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/admin-hopital/medecins'))    return 1;
    if (location.startsWith('/admin-hopital/patients'))    return 2;
    if (location.startsWith('/admin-hopital/messages'))    return 3;
    if (location.startsWith('/admin-hopital/settings'))    return 4;
    if (location.startsWith('/admin-hopital/laborantins')) return 5;
    if (location.startsWith('/admin-hopital/services'))    return 6;
    if (location.startsWith('/admin-hopital/demandes'))    return 7;
    if (location.startsWith('/admin-hopital/stats'))       return 8;
    return 0;
  }

  void _onTap(int index, BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    switch (index) {
      case -1:
        if (location != '/notifications') context.push('/notifications');
        break;
      case 0: if (location != '/admin-hopital') context.go('/admin-hopital'); break;
      case 1: if (location != '/admin-hopital/medecins') context.go('/admin-hopital/medecins'); break;
      case 2: if (location != '/admin-hopital/patients') context.go('/admin-hopital/patients'); break;
      case 3: if (location != '/admin-hopital/messages') context.go('/admin-hopital/messages'); break;
      case 4: if (location != '/admin-hopital/settings') context.go('/admin-hopital/settings'); break;
      case 5: if (location != '/admin-hopital/laborantins') context.go('/admin-hopital/laborantins'); break;
      case 6: if (location != '/admin-hopital/services') context.go('/admin-hopital/services'); break;
      case 7: if (location != '/admin-hopital/demandes') context.go('/admin-hopital/demandes'); break;
      case 8: if (location != '/admin-hopital/stats') context.go('/admin-hopital/stats'); break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ResponsiveShellLayout(
      selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
      onDestinationSelected: (index) => _onTap(index, context),
      indicatorColor: AppColors.adminHopital.withValues(alpha: 0.15),
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
          icon: Icon(Icons.person_search_outlined),
          selectedIcon: Icon(Icons.person_search),
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
          icon: Icon(Icons.inbox_outlined),
          selectedIcon: Icon(Icons.inbox),
          label: 'Demandes',
        ),
        NavigationDestination(
          icon: Icon(Icons.bar_chart_outlined),
          selectedIcon: Icon(Icons.bar_chart),
          label: 'Stats',
        ),
      ],
      child: child,
    );
  }
}
