import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../messagerie/presentation/screens/conversation_list_screen.dart';

/// Écran messagerie du laborantin.
/// Réutilise ConversationListScreen qui gère déjà la navigation
/// par rôle via GoRouterState.matchedLocation.
class LaborantinMessagesScreen extends ConsumerWidget {
  const LaborantinMessagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const ConversationListScreen();
  }
}
