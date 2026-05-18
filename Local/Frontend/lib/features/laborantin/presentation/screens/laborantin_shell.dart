import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/responsive_shell_layout.dart';

class LaborantinShell extends ConsumerWidget {
  final Widget child;

  const LaborantinShell({super.key, required this.child});

  int _calculateIndex(String location) {
    if (location.startsWith('/laborantin/pending')) return 1;
    if (location.startsWith('/laborantin/finished')) return 2;
    if (location.startsWith('/laborantin/messagerie')) return 3;
    if (location.startsWith('/laborantin/profile')) return 4;
    return 0; // Dashboard par défaut
  }

  void _onTap(int index, BuildContext context) {
    switch (index) {
      case -1:
        context.push('/notifications');
        break;
      case 0:
        context.go('/laborantin');
        break;
      case 1:
        context.go('/laborantin/pending');
        break;
      case 2:
        context.go('/laborantin/finished');
        break;
      case 3:
        context.go('/laborantin/messagerie');
        break;
      case 4:
        context.go('/laborantin/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ResponsiveShellLayout(
      selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
      onDestinationSelected: (index) => _onTap(index, context),
      indicatorColor: AppColors.primary.withValues(alpha: 0.15),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard_rounded),
          label: 'Dashboard',
        ),
        NavigationDestination(
          icon: Icon(Icons.biotech_outlined),
          selectedIcon: Icon(Icons.biotech_rounded),
          label: 'En cours',
        ),
        NavigationDestination(
          icon: Icon(Icons.history_edu_outlined),
          selectedIcon: Icon(Icons.history_edu_rounded),
          label: 'Clôturées',
        ),
        NavigationDestination(
          icon: Icon(Icons.message_outlined),
          selectedIcon: Icon(Icons.message),
          label: 'Messages',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person),
          label: 'Profil',
        ),
      ],
      child: child,
    );
  }
}
