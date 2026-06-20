import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';

export 'super_admin_home_screen.dart';
export 'super_admin_hopitaux_screen.dart';
export 'super_admin_users_screen.dart';
export 'super_admin_settings_screen.dart';
export 'super_admin_stats_screen.dart';
export 'super_admin_change_password_screen.dart';
export 'super_admin_about_screen.dart';
export 'super_admin_services_screen.dart';
export 'super_admin_demandes_screen.dart';

class SuperAdminShell extends ConsumerWidget {
  final Widget child;

  const SuperAdminShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/super-admin/hopitaux'))   return 1;
    if (location.startsWith('/super-admin/users'))      return 2;
    if (location.startsWith('/super-admin/messagerie')) return 3;
    if (location.startsWith('/super-admin/settings'))   return 4;
    if (location.startsWith('/super-admin/services'))   return 5;
    if (location.startsWith('/super-admin/demandes'))   return 6;
    if (location.startsWith('/super-admin/stats'))      return 7;
    return 0;
  }

  void _onTap(int index, BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    switch (index) {
      case -1:
        if (location != '/notifications') context.push('/notifications');
        break;
      case 0: if (location != '/super-admin') context.go('/super-admin'); break;
      case 1: if (location != '/super-admin/hopitaux') context.go('/super-admin/hopitaux'); break;
      case 2: if (location != '/super-admin/users') context.go('/super-admin/users'); break;
      case 3: if (location != '/super-admin/messagerie') context.go('/super-admin/messagerie'); break;
      case 4: if (location != '/super-admin/settings') context.go('/super-admin/settings'); break;
      case 5: if (location != '/super-admin/services') context.go('/super-admin/services'); break;
      case 6: if (location != '/super-admin/demandes') context.go('/super-admin/demandes'); break;
      case 7: if (location != '/super-admin/stats') context.go('/super-admin/stats'); break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ResponsiveShellLayout(
      selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
      onDestinationSelected: (index) => _onTap(index, context),
      indicatorColor: AppColors.superAdmin.withValues(alpha: 0.15),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard),
          label: 'Accueil',
        ),
        NavigationDestination(
          icon: Icon(Icons.local_hospital_outlined),
          selectedIcon: Icon(Icons.local_hospital),
          label: 'Hôpitaux',
        ),
        NavigationDestination(
          icon: Icon(Icons.people_outlined),
          selectedIcon: Icon(Icons.people),
          label: 'Admins',
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
          icon: Icon(Icons.medical_services_outlined),
          selectedIcon: Icon(Icons.medical_services),
          label: 'Services',
        ),
        NavigationDestination(
          icon: Icon(Icons.inbox_outlined),
          selectedIcon: Icon(Icons.inbox),
          label: 'Demandes',
        ),
        NavigationDestination(
          icon: Icon(Icons.analytics_outlined),
          selectedIcon: Icon(Icons.analytics),
          label: 'Stats',
        ),
      ],
      child: child,
    );
  }
}
