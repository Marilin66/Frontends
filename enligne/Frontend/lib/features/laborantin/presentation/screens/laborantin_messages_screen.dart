import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
