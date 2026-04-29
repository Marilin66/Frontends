import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../constants/app_constants.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

class UniversalBackButton extends ConsumerWidget {
  final String? fallbackRoute;
  final VoidCallback? onPressedOverride;
  final Color? color;

  const UniversalBackButton({
    super.key,
    this.fallbackRoute,
    this.onPressedOverride,
    this.color,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return IconButton(
      icon: Icon(Icons.arrow_back, color: color),
      tooltip: MaterialLocalizations.of(context).backButtonTooltip,
      onPressed: () {
        if (onPressedOverride != null) {
          onPressedOverride!();
          return;
        }

        if (context.canPop()) {
          context.pop();
        } else {
          if (fallbackRoute != null) {
            context.go(fallbackRoute!);
          } else {
            final authState = ref.read(authProvider);
            final role = authState.user?.role;
            context.go(_getHomeRoute(role));
          }
        }
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
}
