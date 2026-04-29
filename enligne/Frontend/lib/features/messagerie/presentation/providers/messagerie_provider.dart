import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../data/datasources/messagerie_remote_datasource.dart';
import '../../data/models/conversation_model.dart';
import '../../data/models/message_model.dart';

import '../../../../core/constants/api_constants.dart';
import '../../data/datasources/messagerie_websocket_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// Provider de la datasource messagerie
final messagerieDatasourceProvider =
    Provider<MessagerieRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return MessagerieRemoteDatasource(client);
});

// Provider du service WebSocket
final messagerieWebSocketProvider = Provider<MessagerieWebSocketService>((ref) {
  final baseUrl = ApiConstants.wsBaseUrl; 
  final authState = ref.watch(authProvider);
  final token = authState.token ?? '';
  return MessagerieWebSocketService(baseUrl: baseUrl, token: token);
});

// ─── Conversations ──────────────────────────────────────────────────────────

/// Liste des conversations de l'utilisateur connecté
final conversationProvider =
    AsyncNotifierProvider<ConversationNotifier, List<ConversationModel>>(
  ConversationNotifier.new,
);

class ConversationNotifier extends AsyncNotifier<List<ConversationModel>> {
  @override
  Future<List<ConversationModel>> build() async {
    final datasource = ref.read(messagerieDatasourceProvider);
    return await datasource.getConversations();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(messagerieDatasourceProvider);
      return await datasource.getConversations();
    });
  }
}

// ─── Messages d'une conversation ────────────────────────────────────────────

class MessageParam {
  final int? consultationId;
  final int? destinataireId;
  MessageParam({this.consultationId, this.destinataireId});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MessageParam &&
          runtimeType == other.runtimeType &&
          consultationId == other.consultationId &&
          destinataireId == other.destinataireId;

  @override
  int get hashCode => consultationId.hashCode ^ destinataireId.hashCode;
}

/// Provider family pour les messages
final messageProvider =
    AsyncNotifierProvider.autoDispose.family<MessageNotifier, List<MessageModel>, MessageParam>(
  (arg) => MessageNotifier(arg),
);

class MessageNotifier extends AsyncNotifier<List<MessageModel>> {
  final MessageParam arg;
  StreamSubscription? _subscription;

  MessageNotifier(this.arg);

  @override
  FutureOr<List<MessageModel>> build() async {
    final datasource = ref.read(messagerieDatasourceProvider);
    final wsService = ref.read(messagerieWebSocketProvider);

    // Initial fetch
    final messages = await datasource.getMessages(
      consultationId: arg.consultationId,
      destinataireId: arg.destinataireId,
    );

    // Initialisation WebSocket
    _subscription?.cancel();
    _subscription = wsService.connect(arg.consultationId).listen((newMessage) {
      final current = state.value ?? [];
      // Éviter les doublons si le message vient d'être envoyé localement
      if (!current.any((m) => m.id == newMessage.id)) {
        state = AsyncValue.data([...current, newMessage]);
      }
    });

    ref.onDispose(() {
      _subscription?.cancel();
      wsService.disconnect();
    });

    return messages;
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final datasource = ref.read(messagerieDatasourceProvider);
      return await datasource.getMessages(
        consultationId: arg.consultationId,
        destinataireId: arg.destinataireId,
      );
    });
  }

  Future<bool> sendMessage(String contenu) async {
    try {
      final datasource = ref.read(messagerieDatasourceProvider);
      final newMessage = await datasource.sendMessage(
        consultationId: arg.consultationId,
        destinataireId: arg.destinataireId,
        contenu: contenu,
      );
      // Le state sera mis à jour soit ici, soit via le WebSocket (doublon géré)
      final current = state.value ?? [];
      if (!current.any((m) => m.id == newMessage.id)) {
        state = AsyncValue.data([...current, newMessage]);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> sendVoiceMessage(String audioPath) async {
    try {
      final datasource = ref.read(messagerieDatasourceProvider);
      final newMessage = await datasource.sendVoiceMessage(
        consultationId: arg.consultationId,
        destinataireId: arg.destinataireId,
        audioPath: audioPath,
      );
      
      final current = state.value ?? [];
      if (!current.any((m) => m.id == newMessage.id)) {
        state = AsyncValue.data([...current, newMessage]);
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}

/// Compteur total de messages non lus (toutes conversations)
final unreadMessageCountProvider = Provider<int>((ref) {
  final conversations = ref.watch(conversationProvider);
  return conversations.value?.fold<int>(0, (sum, c) => sum + c.nonLus) ?? 0;
});
