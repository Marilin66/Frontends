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

      // Pour les messages directs (sans consultationId), filtrer par destinataire/expéditeur
      if (arg.consultationId == null && arg.destinataireId != null) {
        final isRelevant = newMessage.expediteur == arg.destinataireId ||
            newMessage.destinataire == arg.destinataireId;
        if (!isRelevant) return;
      }

      // Éviter les doublons
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

  /// Ajoute un message au state (utilisé par l'UI après envoi fichier)
  void addMessage(MessageModel newMessage) {
    final current = state.value ?? [];
    if (!current.any((m) => m.id == newMessage.id)) {
      state = AsyncValue.data([...current, newMessage]);
    }
  }
}

/// Compteur total de messages non lus (toutes conversations)
final unreadMessageCountProvider = Provider<int>((ref) {
  final conversations = ref.watch(conversationProvider);
  return conversations.value?.fold<int>(0, (sum, c) => sum + c.nonLus) ?? 0;
});

// ─── Contacts disponibles selon le rôle ─────────────────────────────────────

/// Modèle léger pour un contact messagerie
class ContactModel {
  final int id;
  final String nom;
  final String role;
  final String? hopitalNom;
  final String? photo;

  const ContactModel({
    required this.id,
    required this.nom,
    required this.role,
    this.hopitalNom,
    this.photo,
  });
}

/// Charge les contacts à qui l'utilisateur connecté peut envoyer un message direct.
/// - admin_general  → tous les admins hôpitaux
/// - admin_hopital  → médecins + laborantins de son hôpital
/// - medecin        → admin de son hôpital
/// - laborantin     → admin de son hôpital
final contactsDisponiblesProvider =
    FutureProvider<List<ContactModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  if (user == null) return [];

  final client = ref.read(dioClientProvider);

  Future<List<dynamic>> fetchList(String url,
      {Map<String, dynamic>? params}) async {
    try {
      final resp = await client.get(url, queryParameters: params);
      final data = resp.data;
      if (data is List) return data;
      if (data is Map && data['results'] is List) return data['results'] as List;
      return [];
    } catch (_) {
      return [];
    }
  }

  final role = user.role;

  // ── Admin général → tous les admins hôpitaux ──────────────────────────
  if (role == 'admin_general' || role == 'super_admin') {
    final list = await fetchList(ApiConstants.adminHopitaux);
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return ContactModel(
        id: m['id'] as int,
        nom: '${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
        role: 'admin_hopital',
        hopitalNom: m['hopital_nom'] as String?,
        photo: m['photo'] as String?,
      );
    }).toList();
  }

  // ── Admin hôpital → médecins + laborantins de son hôpital ─────────────
  if (role == 'admin_hopital') {
    final hopId = user.hopital;
    if (hopId == null) return [];

    final medList = await fetchList(ApiConstants.medecins,
        params: {'hopital': hopId});
    final labList = await fetchList(ApiConstants.laborantins,
        params: {'hopital': hopId});

    final contacts = <ContactModel>[];
    for (final e in medList) {
      final m = e as Map<String, dynamic>;
      contacts.add(ContactModel(
        id: m['id'] as int,
        nom: 'Dr. ${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
        role: 'medecin',
        hopitalNom: m['hopital_nom'] as String?,
        photo: m['photo'] as String?,
      ));
    }
    for (final e in labList) {
      final m = e as Map<String, dynamic>;
      contacts.add(ContactModel(
        id: m['id'] as int,
        nom: '${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
        role: 'laborantin',
        hopitalNom: m['hopital_nom'] as String?,
        photo: m['photo'] as String?,
      ));
    }
    return contacts;
  }

  // ── Médecin ou Laborantin → contacts de son hôpital ──────────────────────
  if (role == 'medecin' || role == 'laborantin') {
    final hopId = user.hopital;
    if (hopId == null) return [];

    final adminsList = await fetchList(ApiConstants.adminHopitaux);
    final medList = await fetchList(ApiConstants.medecins);
    final labList = await fetchList(ApiConstants.laborantins);

    final contacts = <ContactModel>[];

    // Admins
    for (final e in adminsList) {
      final m = e as Map<String, dynamic>;
      final hId = m['hopital'];
      if (hId?.toString() == hopId.toString()) {
        contacts.add(ContactModel(
          id: m['id'] as int,
          nom: 'Administration: ${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
          role: 'admin_hopital',
          hopitalNom: m['hopital_nom'] as String?,
          photo: m['photo'] as String?,
        ));
      }
    }

    // Médecins
    for (final e in medList) {
      final m = e as Map<String, dynamic>;
      final hId = m['hopital'] ?? m['hopital_id'];
      if (hId?.toString() == hopId.toString() && m['id'].toString() != user.id.toString()) {
        contacts.add(ContactModel(
          id: m['id'] as int,
          nom: 'Dr. ${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
          role: 'medecin',
          hopitalNom: m['hopital_nom'] as String?,
          photo: m['photo'] as String?,
        ));
      }
    }

    // Laborantins
    for (final e in labList) {
      final m = e as Map<String, dynamic>;
      final hId = m['hopital'] ?? m['hopital_id'];
      if (hId?.toString() == hopId.toString() && m['id'].toString() != user.id.toString()) {
        contacts.add(ContactModel(
          id: m['id'] as int,
          nom: 'Lab. ${m['first_name'] ?? ''} ${m['last_name'] ?? ''}'.trim(),
          role: 'laborantin',
          hopitalNom: m['hopital_nom'] as String?,
          photo: m['photo'] as String?,
        ));
      }
    }

    if (contacts.isEmpty) {
      contacts.add(const ContactModel(
        id: 999,
        nom: 'Support Technique Hopitel',
        role: 'admin_general',
        hopitalNom: 'Assistance',
      ));
    }

    return contacts;
  }

  return [];
});
