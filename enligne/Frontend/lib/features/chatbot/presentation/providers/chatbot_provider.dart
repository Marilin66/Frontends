import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/datasources/chatbot_remote_datasource.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/network/api_exception.dart';

final chatbotDatasourceProvider = Provider<ChatbotRemoteDatasource>((ref) {
  final client = ref.read(dioClientProvider);
  return ChatbotRemoteDatasource(client);
});

class ChatAction {
  final String label;
  final String type;
  final String? payload;

  const ChatAction({
    required this.label,
    required this.type,
    this.payload,
  });

  factory ChatAction.fromJson(Map<String, dynamic> json) {
    return ChatAction(
      label: json['label'] as String? ?? 'Bouton',
      type: json['type'] as String? ?? 'text',
      // Le backend peut envoyer 'url' ou 'payload'
      payload: (json['payload'] ?? json['url']) as String?,
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final bool isLoading;
  final bool suggestHospital;
  final List<ChatAction> actions;

  const ChatMessage({
    required this.text,
    required this.isUser,
    this.isLoading = false,
    this.suggestHospital = false,
    this.actions = const [],
  });
}

class ChatbotNotifier extends AsyncNotifier<List<ChatMessage>> {
  bool _hasInjectedContext = false;

  @override
  Future<List<ChatMessage>> build() async {
    final authState = ref.read(authProvider);
    final user = authState.user;

    final welcome = const ChatMessage(
      text: 'Bonjour ! Je suis votre assistant Hopitel. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      actions: [
        ChatAction(label: 'Prendre RDV', type: 'route', payload: '/hospitals'),
        ChatAction(label: 'Voir mes résultats', type: 'route', payload: '/patient/results'),
      ],
    );

    if (user == null || user.role != 'patient') {
      return [welcome];
    }

    try {
      final datasource = ref.read(chatbotDatasourceProvider);
      final history = await datasource.getHistory();

      if (history.isEmpty) {
        return [welcome];
      }

      final messages = <ChatMessage>[welcome];
      for (final msg in history) {
        final role = msg['role'] as String? ?? '';
        final content = msg['content'] as String? ?? '';
        if (role == 'system' || content.isEmpty) continue;
        
        // Extraction des actions si présentes dans l'historique (cas rare mais possible)
        final actionsData = msg['actions'] as List?;
        final actions = actionsData?.map((a) => ChatAction.fromJson(a as Map<String, dynamic>)).toList() ?? [];

        messages.add(ChatMessage(
          text: content,
          isUser: role == 'user',
          actions: actions,
        ));
      }
      _hasInjectedContext = true;
      return messages;
    } catch (_) {
      return [welcome];
    }
  }

  Future<void> sendMessage(String question) async {
    final authState = ref.read(authProvider);
    final user = authState.user;

    final currentMessages = state.value ?? [];

    if (user != null && user.role != 'patient') {
      state = AsyncValue.data([
        ...currentMessages,
        ChatMessage(text: question, isUser: true),
        const ChatMessage(
          text: 'Accès réservé aux patients. Ce service n\'est pas disponible pour votre rôle.',
          isUser: false,
        ),
      ]);
      return;
    }

    state = AsyncValue.data([
      ...currentMessages,
      ChatMessage(text: question, isUser: true),
      const ChatMessage(text: '', isUser: false, isLoading: true),
    ]);

    try {
      final datasource = ref.read(chatbotDatasourceProvider);

      if (!_hasInjectedContext) {
        try {
          await datasource.askQuestion(
              "Tu es un assistant de santé Hopitel. Tu donnes uniquement des conseils généraux. Tu ne fais jamais de diagnostic médical ni prescription. Si le patient veut un RDV ou voir ses résultats, mentionne que des boutons sont disponibles.");
          _hasInjectedContext = true;
        } catch (_) {}
      }

      final responseMap = await datasource.askQuestion(question);
      String response = (responseMap['message'] as Map<String, dynamic>?)?['content'] as String? ?? 'Réseau saturé.';
      
      // Récupérer les actions du backend si elles ont été parsées avec succès
      final actionsData = responseMap['actions'] as List?;
      List<ChatAction> actions = actionsData?.map((a) => ChatAction.fromJson(a as Map<String, dynamic>)).toList() ?? [];

      // FAILSAFE FRONTEND : On cherche n'importe quel bloc JSON (Object ou Array)
      final jsonRegex = RegExp(r'(\{[\s\S]*?\}|\[[\s\S]*?\])');
      final matches = jsonRegex.allMatches(response);
      
      if (matches.isNotEmpty) {
        // On prend le dernier match (souvent le JSON final)
        final match = matches.last;
        try {
          final extractedJson = match.group(0)!;
          final dynamic parsed = jsonDecode(extractedJson);
          List<dynamic> rawActions = [];

          if (parsed is List) {
            rawActions = parsed;
          } else if (parsed is Map && parsed.containsKey('buttons')) {
            rawActions = parsed['buttons'];
          } else if (parsed is Map && (parsed.containsKey('actions') || parsed.containsKey('choices'))) {
            rawActions = parsed['actions'] ?? parsed['choices'] ?? [];
          }

          if (rawActions.isNotEmpty && actions.isEmpty) {
            actions = rawActions.map((a) => ChatAction.fromJson(a as Map<String, dynamic>)).toList();
          }
          
          // NETTOYAGE VISUEL : On enlève tout ce qui ressemble à du JSON ou des balises de code
          // On évite d'afficher le bloc technique au patient
          response = response.replaceFirst(extractedJson, '').trim();
          response = response.replaceAll('```json', '').replaceAll('```', '').trim();
          // Supprimer les résidus du genre " { " ou " } " s'ils traînent
          if (response.endsWith('{')) response = response.substring(0, response.length - 1).trim();
        } catch (_) {}
      }
      
      final lowerResponse = response.toLowerCase();
      bool suggestHospital = lowerResponse.contains('urgence') ||
          lowerResponse.contains('hôpital') ||
          lowerResponse.contains('grave');

      final updated = List<ChatMessage>.from(state.value ?? []);
      updated.removeLast();
      updated.add(ChatMessage(
        text: response,
        isUser: false,
        suggestHospital: suggestHospital,
        actions: actions,
      ));
      state = AsyncValue.data(updated);
    } catch (e) {
      final updated = List<ChatMessage>.from(state.value ?? []);
      updated.removeLast();

      String errorMsg = 'Une erreur est survenue lors de la communication avec l\'IA.';
      if (e is ApiException) {
        if (e.statusCode == 401) {
          errorMsg = 'Session expirée. Veuillez vous reconnecter.';
          ref.read(authProvider.notifier).logout();
        } else {
          errorMsg = e.message;
        }
      }

      updated.add(ChatMessage(
        text: errorMsg,
        isUser: false,
      ));
      state = AsyncValue.data(updated);
    }
  }

  void clear() {
    _hasInjectedContext = false;
    state = AsyncValue.data([
      const ChatMessage(
        text: 'Bonjour ! Je suis votre assistant Hopitel. Comment puis-je vous aider aujourd\'hui ?',
        isUser: false,
        actions: [
          ChatAction(label: 'Prendre RDV', type: 'route', payload: '/hospitals'),
          ChatAction(label: 'Voir mes résultats', type: 'route', payload: '/patient/results'),
        ],
      ),
    ]);
  }
}

final chatbotProvider = AsyncNotifierProvider<ChatbotNotifier, List<ChatMessage>>(
  ChatbotNotifier.new,
);
