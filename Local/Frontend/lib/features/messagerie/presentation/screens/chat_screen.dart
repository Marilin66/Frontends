import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/messagerie_provider.dart';
import '../../data/models/message_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int? consultationId;
  final int? destinataireId;
  final String contactName;

  const ChatScreen({
    super.key,
    this.consultationId,
    this.destinataireId,
    required this.contactName,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isSending = false;
  
  // Audio Recording
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  String? _recordingPath;

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

  /// Détermine si la consultation est clôturée en consultant le provider de conversations.
  bool _isConsultationClosed() {
    if (widget.consultationId == null) return false;
    final conversations = ref.watch(conversationProvider).value ?? [];
    final match = conversations.where(
      (c) => c.consultationId == widget.consultationId,
    );
    if (match.isEmpty) return false;
    return match.first.estCloture;
  }

  Future<void> _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isSending) return;

    _controller.clear();
    setState(() => _isSending = true);

    final param = MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    );

    final success = await ref.read(messageProvider(param).notifier).sendMessage(text);

    if (mounted) {
      setState(() => _isSending = false);
      if (success) {
        _scrollToBottom();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'envoi du message')),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final directory = await getTemporaryDirectory();
        final path = '${directory.path}/voice_msg_${DateTime.now().millisecondsSinceEpoch}.m4a';
        
        const config = RecordConfig();
        await _audioRecorder.start(config, path: path);
        
        setState(() {
          _isRecording = true;
          _recordingPath = path;
        });
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
      });

      if (path != null && mounted) {
        _handleSendVoice(path);
      }
    } catch (e) {
      debugPrint('Error stopping recording: $e');
    }
  }

  Future<void> _handleSendVoice(String path) async {
    setState(() => _isSending = true);

    final param = MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    );

    final success = await ref.read(messageProvider(param).notifier).sendVoiceMessage(path);

    if (mounted) {
      setState(() => _isSending = false);
      if (success) {
        _scrollToBottom();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'envoi du message vocal')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final param = MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    );
    final messagesAsync = ref.watch(messageProvider(param));
    final currentUserId = ref.read(authProvider).user?.id;
    final isClosed = _isConsultationClosed();

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(isClosed),
      body: Stack(
        children: [
          // Background Pattern
          Positioned.fill(
            child: Opacity(
              opacity: 0.03,
              child: Image.network(
                'https://www.transparenttextures.com/patterns/cubes.png',
                repeat: ImageRepeat.repeat,
              ),
            ),
          ),
          Column(
            children: [
              // ── Bandeau de clôture ────────────────────────────────────
              if (isClosed) _buildClosedBanner(),

              // ── Liste des messages ────────────────────────────────────
              Expanded(
                child: messagesAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Erreur: $e')),
                  data: (messages) {
                    if (messages.isEmpty) return _buildEmptyState(isClosed);
                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final msg = messages[index];
                        final isMe = msg.expediteur == currentUserId;
                        return _MessageBubble(message: msg, isMe: isMe);
                      },
                    );
                  },
                ),
              ),

              // ── Zone de saisie (bloquée si clôturée) ─────────────────
              isClosed ? _buildLockedInputArea() : _buildInputArea(),
            ],
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(bool isClosed) {
    return AppBar(
      leading: const UniversalBackButton(),
      title: Column(
        children: [
          Text(
            widget.contactName,
            style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: isClosed ? Colors.grey : Colors.green[500],
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                isClosed ? 'CONSULTATION CLÔTURÉE' : 'ACTIF MAINTENANT',
                style: GoogleFonts.poppins(
                  fontSize: 8,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.2,
                  color: isClosed ? Colors.grey : Colors.green[600],
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(
            Icons.videocam_rounded,
            color: isClosed ? Colors.grey : AppColors.primary,
          ),
          onPressed: isClosed ? null : () {},
        ),
        const SizedBox(width: 8),
      ],
      centerTitle: true,
      backgroundColor: AppColors.surface,
      elevation: 0,
    );
  }

  /// Bandeau d'avertissement affiché quand la consultation est clôturée.
  Widget _buildClosedBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFFFFF3CD),
      child: Row(
        children: [
          const Icon(Icons.lock_outline_rounded, size: 16, color: Color(0xFF856404)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Cette consultation est terminée. L\'envoi de nouveaux messages est désactivé.',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF856404),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isClosed) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20),
              ],
            ),
            child: Icon(
              isClosed ? Icons.lock_rounded : Icons.chat_bubble_outline_rounded,
              size: 40,
              color: (isClosed ? Colors.grey : AppColors.primary).withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isClosed ? 'CONSULTATION TERMINÉE' : 'CANAL SÉCURISÉ OUVERT',
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: AppColors.textHint,
              letterSpacing: 2.0,
            ),
          ),
        ],
      ),
    );
  }

  /// Zone de saisie normale (consultation ouverte).
  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 15,
        bottom: MediaQuery.of(context).padding.bottom + 15,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 25,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _controller,
                style: GoogleFonts.poppins(fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Votre message...',
                  hintStyle: GoogleFonts.poppins(
                    color: AppColors.textHint,
                    fontSize: 13,
                  ),
                  border: InputBorder.none,
                  prefixIcon: const Icon(
                    Icons.sentiment_satisfied_alt_rounded,
                    color: AppColors.textHint,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // ── Bouton Message Vocal ──────────────────────────────────
          GestureDetector(
            onLongPressStart: (_) => _startRecording(),
            onLongPressEnd: (_) => _stopRecording(),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 50,
              width: 50,
              decoration: BoxDecoration(
                color: _isRecording ? Colors.red.shade100 : AppColors.background,
                shape: BoxShape.circle,
                border: _isRecording ? Border.all(color: Colors.red, width: 2) : null,
              ),
              child: Icon(
                _isRecording ? Icons.mic : Icons.mic_none_rounded,
                color: _isRecording ? Colors.red : AppColors.textHint,
                size: 24,
              ),
            ),
          ),
          const SizedBox(width: 12),
          AnimatedTap(
            onTap: _isSending ? null : _handleSend,
            child: Container(
              height: 50,
              width: 50,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFF4F46E5)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: _isSending
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 22),
            ),
          ),
        ],
      ),
    );
  }

  /// Zone de saisie verrouillée (consultation clôturée).
  Widget _buildLockedInputArea() {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 15,
        bottom: MediaQuery.of(context).padding.bottom + 15,
      ),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Text(
                'Les messages sont désactivés — consultation clôturée',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            height: 50,
            width: 50,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.lock_rounded,
              color: Colors.grey.shade400,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Bulle de message ────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20.0),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isMe) ...[
                CircleAvatar(
                  radius: 12,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: const Icon(Icons.person, size: 14, color: AppColors.primary),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    color: isMe ? AppColors.slate950 : AppColors.surface,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(24),
                      topRight: const Radius.circular(24),
                      bottomLeft: Radius.circular(isMe ? 24 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 24),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: _buildMessageContent(context),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 36, right: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _formatTime(message.dateEnvoi),
                  style: GoogleFonts.poppins(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textHint,
                  ),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(
                    message.lu ? Icons.done_all_rounded : Icons.done_rounded,
                    size: 14,
                    color: message.lu ? AppColors.primary : AppColors.textHint,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Affiche le contenu adapté selon le type de message (texte, vocal, fichier).
  Widget _buildMessageContent(BuildContext context) {
    final textColor = isMe ? Colors.white : AppColors.textPrimary;

    switch (message.typeMessage) {
      case TypeMessage.vocal:
        return _buildVoiceContent(context, textColor);
      case TypeMessage.fichier:
        return _buildFileContent(context, textColor);
      case TypeMessage.texte:
      default:
        return Text(
          message.contenu,
          style: GoogleFonts.poppins(
            color: textColor,
            fontSize: 14,
            height: 1.5,
            fontWeight: FontWeight.w500,
          ),
        );
    }
  }

  /// Bulle pour message vocal — affiche une icône cliquable vers l'URL audio.
  Widget _buildVoiceContent(BuildContext context, Color textColor) {
    return InkWell(
      onTap: () async {
        if (message.audio != null) {
          final uri = Uri.parse(message.audio!);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Impossible d\'ouvrir le message vocal')),
            );
          }
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.play_circle_fill_rounded,
            color: isMe ? Colors.white : AppColors.primary,
            size: 36,
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '🎙 Message vocal',
                style: GoogleFonts.poppins(
                  color: textColor,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                'Appuyer pour écouter',
                style: GoogleFonts.poppins(
                  color: textColor.withOpacity(0.6),
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Bulle pour pièce jointe / fichier.
  Widget _buildFileContent(BuildContext context, Color textColor) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.attach_file_rounded,
          color: isMe ? Colors.white70 : AppColors.primary,
          size: 24,
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            message.contenu.isNotEmpty ? message.contenu : 'Pièce jointe',
            style: GoogleFonts.poppins(
              color: textColor,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  String _formatTime(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}
