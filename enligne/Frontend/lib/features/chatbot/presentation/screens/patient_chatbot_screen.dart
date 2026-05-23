import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/chatbot_provider.dart';

class PatientChatbotScreen extends ConsumerStatefulWidget {
  const PatientChatbotScreen({super.key});

  @override
  ConsumerState<PatientChatbotScreen> createState() => _PatientChatbotScreenState();
}

class _PatientChatbotScreenState extends ConsumerState<PatientChatbotScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isSending = false;

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isSending) return;

    _controller.clear();
    setState(() => _isSending = true);

    await ref.read(chatbotProvider.notifier).sendMessage(text);

    if (mounted) {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  String _sanitizeAndMapRoute(String rawRoute) {
    if (rawRoute.isEmpty) return '/hospitals';

    // Normaliser les slashes doubles et les slashs de fin, et mettre en minuscule
    String target = rawRoute.replaceAll(RegExp(r'/+'), '/').toLowerCase().trim();
    if (target.endsWith('/') && target.length > 1) {
      target = target.substring(0, target.length - 1);
    }
    if (!target.startsWith('/')) {
      target = '/$target';
    }

    // 1. Détection des IDs pour les routes dynamiques
    // /hopital/123 ou /patient/hopital/123
    final hopitalIdMatch = RegExp(r'^/(?:patient/)?hopital/(\d+)').firstMatch(target);
    if (hopitalIdMatch != null) {
      return '/hopital/${hopitalIdMatch.group(1)}';
    }

    // /patient/medecin/123/rendezvous ou /medecin/123/rendezvous ou /medecin/123
    final medecinIdMatch = RegExp(r'^/(?:patient/)?medecin[s]?/(\d+)').firstMatch(target);
    if (medecinIdMatch != null) {
      return '/patient/medecin/${medecinIdMatch.group(1)}/rendezvous';
    }

    // 2. Map d'alias précis
    const aliases = {
      '/nearby': '/nearby',
      '/patient/nearby': '/nearby',
      '/map': '/nearby',
      '/hospitals': '/hospitals',
      '/hopitaux': '/hospitals',
      '/appointments': '/patient/appointments',
      '/rendezvous': '/patient/appointments',
      '/rendez-vous': '/patient/appointments',
      '/rdv': '/patient/appointments',
      '/patient/rendezvous': '/patient/appointments',
      '/patient/appointments': '/patient/appointments',
      '/results': '/patient/results',
      '/resultats': '/patient/results',
      '/patient/results': '/patient/results',
      '/patient/resultats': '/patient/results',
      '/ai-agent': '/chatbot',
      '/assistant': '/chatbot',
      '/chatbot': '/chatbot',
      '/patient/chatbot': '/chatbot',
      '/patient/ai-agent': '/chatbot',
      '/search': '/patient/search',
      '/recherche': '/patient/search',
      '/patient/search': '/patient/search',
      '/patient/recherche': '/patient/search',
      '/profile': '/patient/profile',
      '/profil': '/patient/profile',
      '/patient/profile': '/patient/profile',
      '/patient/profil': '/patient/profile',
      '/messages': '/patient/messagerie',
      '/messagerie': '/patient/messagerie',
      '/patient/messages': '/patient/messagerie',
      '/patient/messagerie': '/patient/messagerie',
      '/notifications': '/notifications',
      '/patient/notifications': '/notifications',
      '/tips': '/tips',
      '/conseils': '/tips',
      '/conseil': '/tips',
      '/patient/tips': '/tips',
      '/emergency': '/emergency',
      '/urgences': '/emergency',
      '/urgence': '/emergency',
      '/patient/emergency': '/emergency',
      '/faq': '/faq',
      '/patient/faq': '/faq',
      '/result-code': '/result-code',
      '/track-results': '/result-code',
      '/patient/result-code': '/result-code',
    };

    if (aliases.containsKey(target)) {
      return aliases[target]!;
    }

    // 3. Détection par mots-clés (Failsafe)
    if (target.contains('medecin') || target.contains('médecin') || target.contains('recherche') || target.contains('search')) {
      return '/patient/search';
    }
    if (target.contains('hopital') || target.contains('hôpital') || target.startsWith('/hopitaux')) {
      return '/hospitals';
    }
    if (target.contains('urgence') || target.contains('emergency')) {
      return '/emergency';
    }
    if (target.contains('conseil') || target.contains('tips') || target.contains('sante') || target.contains('santé')) {
      return '/tips';
    }
    if (target.contains('result')) {
      return '/patient/results';
    }
    if (target.contains('rdv') || target.contains('rendez')) {
      return '/patient/appointments';
    }

    // Par défaut
    return rawRoute;
  }

  void _handleAction(ChatAction action) {
    final rawPayload = action.payload;
    if (rawPayload == null) return;
    
    // Assainir et mapper le payload de l'IA vers les routes de l'app Flutter
    final payload = _sanitizeAndMapRoute(rawPayload);
    
    // Supporte 'route' (boutons statiques) et 'redirect' (venant du backend)
    if (action.type == 'route' || action.type == 'redirect') {
      // Vérifier si l'utilisateur est connecté avant de naviguer
      final authState = ref.read(authProvider);
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      
      final requiresAuth = payload.startsWith('/patient/') ||
          payload.startsWith('/medecin/') ||
          payload.startsWith('/admin') ||
          payload.startsWith('/laborantin/') ||
          payload.startsWith('/super-admin/');
      
      if (requiresAuth && !isAuthenticated) {
        context.go('/login');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Connectez-vous pour accéder à cette fonctionnalité.'),
            backgroundColor: Colors.orange,
          ),
        );
      } else {
        context.go(payload);
      }
    } else if (action.type == 'text') {
       _controller.text = action.label;
       _sendMessage();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatAsync = ref.watch(chatbotProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(color: Colors.white),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.smart_toy, size: 20, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Text('Assistant Hopitel', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Nouvelle conversation',
            onPressed: () => ref.read(chatbotProvider.notifier).clear(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: chatAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erreur : $e')),
              data: (messages) => ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final msg = messages[index];
                  return _ChatBubble(
                    message: msg,
                    onAction: _handleAction,
                  );
                },
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.only(left: 16, right: 8, top: 12, bottom: 20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                    maxLines: 4,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: 'Posez votre question santé...',
                      hintStyle: GoogleFonts.poppins(color: AppColors.textHint, fontSize: 13),
                      filled: true,
                      fillColor: AppColors.background,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                AnimatedTap(
                  onTap: _isSending ? null : _sendMessage,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _isSending ? AppColors.textHint : AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: _isSending
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;
  final Function(ChatAction) onAction;

  const _ChatBubble({required this.message, required this.onAction});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    if (message.isLoading) {
      return Align(
        alignment: Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12, right: 60),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16).copyWith(bottomLeft: const Radius.circular(4)),
          ),
          child: Shimmer.fromColors(
            baseColor: AppColors.textHint.withValues(alpha: 0.3),
            highlightColor: AppColors.textHint.withValues(alpha: 0.1),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.smart_toy, size: 18),
                const SizedBox(width: 12),
                Container(width: 100, height: 10, color: Colors.white),
              ],
            ),
          ),
        ),
      );
    }

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            margin: EdgeInsets.only(
              bottom: message.actions.isNotEmpty ? 4 : 12,
              left: isUser ? 60 : 0,
              right: isUser ? 0 : 60,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isUser ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(20).copyWith(
                bottomRight: isUser ? const Radius.circular(4) : null,
                bottomLeft: !isUser ? const Radius.circular(4) : null,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              message.text,
              style: GoogleFonts.poppins(
                fontSize: 14,
                height: 1.5,
                color: isUser ? Colors.white : AppColors.textPrimary,
              ),
            ),
          ),
          if (message.actions.isNotEmpty && !isUser) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 16, left: 4),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: message.actions.map((action) => _ActionButton(
                  action: action,
                  onTap: () => onAction(action),
                )).toList(),
              ),
            ),
          ],
          if (message.suggestHospital && !isUser && message.actions.isEmpty) ...[
             Padding(
               padding: const EdgeInsets.only(bottom: 16, left: 4),
               child: _ActionButton(
                 action: const ChatAction(label: 'Urgences / Hôpitaux', type: 'route', payload: '/patient/nearby'),
                 onTap: () => context.go('/patient/nearby'),
               ),
             ),
          ],
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final ChatAction action;
  final VoidCallback onTap;

  const _ActionButton({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AnimatedTap(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              action.type == 'route' ? Icons.navigation_rounded : Icons.message_rounded,
              size: 14,
              color: AppColors.primary,
            ),
            const SizedBox(width: 8),
            Text(
              action.label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
