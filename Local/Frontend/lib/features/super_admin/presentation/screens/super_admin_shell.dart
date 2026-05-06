import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';
import '../../../../core/widgets/global_ai_bubble.dart';

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
    if (location.startsWith('/super-admin/services'))   return 3;
    if (location.startsWith('/super-admin/demandes'))   return 4;
    if (location.startsWith('/super-admin/stats'))      return 5;
    if (location.startsWith('/super-admin/messagerie')) return 6;
    if (location.startsWith('/super-admin/settings'))   return 7;
    return 0;
  }

  void _onTap(int index, BuildContext context) {
    switch (index) {
      case 0: context.go('/super-admin');             break;
      case 1: context.go('/super-admin/hopitaux');    break;
      case 2: context.go('/super-admin/users');       break;
      case 3: context.go('/super-admin/services');    break;
      case 4: context.go('/super-admin/demandes');    break;
      case 5: context.go('/super-admin/stats');       break;
      case 6: context.go('/super-admin/messagerie');  break;
      case 7: context.go('/super-admin/settings');    break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Stack(
      children: [
        ResponsiveShellLayout(
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
        ),
        const GlobalAIBubble(),
      ],
    );
  }
}
