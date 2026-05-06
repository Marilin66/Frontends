import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../../../messagerie/presentation/providers/messagerie_provider.dart';
import '../../../messagerie/data/models/message_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int? consultationId;
  final int? destinataireId;
  final String contactName;
  final bool estCloture;

  const ChatScreen({
    super.key,
    this.consultationId,
    this.destinataireId,
    required this.contactName,
    this.estCloture = false,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _audioRecorder = AudioRecorder();
  final _audioPlayer = AudioPlayer();

  bool _isRecording = false;
  bool _isSending = false;
  String? _recordingPath;
  String? _playingUrl;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  MessageParam get _param => MessageParam(
        consultationId: widget.consultationId,
        destinataireId: widget.destinataireId,
      );

  // ── Envoi texte ────────────────────────────────────────────────────────────
  Future<void> _sendText() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending || widget.estCloture) return;
    _messageController.clear();
    setState(() => _isSending = true);
    await ref.read(messageProvider(_param).notifier).sendMessage(text);
    if (mounted) {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  // ── Enregistrement vocal ───────────────────────────────────────────────────
  Future<void> _startRecording() async {
    if (widget.estCloture) return;
    final hasPermission = await _audioRecorder.hasPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Permission microphone refusée')),
        );
      }
      return;
    }
    final dir = await getTemporaryDirectory();
    _recordingPath = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _audioRecorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc),
      path: _recordingPath!,
    );
    setState(() => _isRecording = true);
  }

  Future<void> _stopRecording() async {
    if (!_isRecording) return;
    final path = await _audioRecorder.stop();
    setState(() => _isRecording = false);
    if (path == null) return;

    setState(() => _isSending = true);
    await ref.read(messageProvider(_param).notifier).sendVoiceMessage(path);
    if (mounted) {
      setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  // ── Lecture audio ──────────────────────────────────────────────────────────
  Future<void> _playAudio(String url) async {
    if (_playingUrl == url) {
      await _audioPlayer.stop();
      setState(() => _playingUrl = null);
    } else {
      setState(() => _playingUrl = url);
      await _audioPlayer.play(UrlSource(url));
      _audioPlayer.onPlayerComplete.listen((_) {
        if (mounted) setState(() => _playingUrl = null);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messageProvider(_param));
    final currentUser = ref.watch(authProvider).user;

    ref.listen(messageProvider(_param), (prev, next) {
      if (next is AsyncData) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(),
        title: Column(
          children: [
            Text(
              widget.contactName,
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: widget.estCloture ? Colors.orange : AppColors.success,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  widget.estCloture ? 'Consultation clôturée' : 'En ligne',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: widget.estCloture ? Colors.orange : AppColors.success,
                  ),
                ),
              ],
            ),
          ],
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // ── Bannière clôture ──────────────────────────────────────────────
          if (widget.estCloture)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Colors.orange.shade50,
              child: Row(
                children: [
                  Icon(Icons.lock_rounded, size: 16, color: Colors.orange.shade700),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Cette consultation est clôturée. Les messages sont désactivés.',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.orange.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // ── Liste des messages ────────────────────────────────────────────
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erreur: $e')),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline, size: 48, color: AppColors.textHint),
                        const SizedBox(height: 16),
                        Text(
                          'Aucun message',
                          style: GoogleFonts.poppins(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    final isMe = message.expediteur == currentUser?.id;
                    return _buildMessageBubble(message, isMe);
                  },
                );
              },
            ),
          ),

          // ── Zone de saisie ────────────────────────────────────────────────
          _buildInputArea(),
        ],
      ),
    );
  }

  // ── Bulle de message ───────────────────────────────────────────────────────
  Widget _buildMessageBubble(MessageModel message, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isMe ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 0),
            bottomRight: Radius.circular(isMe ? 0 : 16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  message.expediteurNom,
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),

            // Contenu selon le type
            if (message.typeMessage == TypeMessage.vocal && message.audio != null)
              _buildVoiceMessage(message, isMe)
            else if (message.typeMessage == TypeMessage.fichier && message.pieceJointe != null)
              _buildFileMessage(message, isMe)
            else
              Text(
                message.contenu,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: isMe ? Colors.white : AppColors.textPrimary,
                ),
              ),

            const SizedBox(height: 4),
            Text(
              Helpers.formatTime(DateTime.tryParse(message.dateEnvoi) ?? DateTime.now()),
              style: GoogleFonts.poppins(
                fontSize: 9,
                color: isMe ? Colors.white70 : AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Message vocal ──────────────────────────────────────────────────────────
  Widget _buildVoiceMessage(MessageModel message, bool isMe) {
    final isPlaying = _playingUrl == message.audio;
    return GestureDetector(
      onTap: () => _playAudio(message.audio!),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isMe ? Colors.white.withValues(alpha: 0.2) : AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPlaying ? Icons.stop_rounded : Icons.play_arrow_rounded,
              color: isMe ? Colors.white : AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Message vocal',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isMe ? Colors.white : AppColors.textPrimary,
                ),
              ),
              Text(
                isPlaying ? 'En cours...' : 'Appuyer pour écouter',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  color: isMe ? Colors.white70 : AppColors.textHint,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Message fichier ────────────────────────────────────────────────────────
  Widget _buildFileMessage(MessageModel message, bool isMe) {
    return GestureDetector(
      onTap: () async {
        final uri = Uri.parse(message.pieceJointe!);
        if (await canLaunchUrl(uri)) await launchUrl(uri);
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.attach_file_rounded,
            color: isMe ? Colors.white : AppColors.primary,
            size: 18,
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              message.contenu.isNotEmpty ? message.contenu : 'Pièce jointe',
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: isMe ? Colors.white : AppColors.primary,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Zone de saisie ─────────────────────────────────────────────────────────
  Widget _buildInputArea() {
    if (widget.estCloture) {
      return Container(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 12,
          bottom: MediaQuery.of(context).padding.bottom + 12,
        ),
        color: Colors.orange.shade50,
        child: Row(
          children: [
            Icon(Icons.lock_rounded, size: 18, color: Colors.orange.shade600),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Consultation clôturée — messages désactivés',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.orange.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          // Champ texte
          Expanded(
            child: TextField(
              controller: _messageController,
              maxLines: null,
              enabled: !_isRecording,
              decoration: InputDecoration(
                hintText: _isRecording ? '🎙 Enregistrement...' : 'Écrire un message...',
                hintStyle: GoogleFonts.poppins(
                  color: _isRecording ? AppColors.error : AppColors.textHint,
                  fontSize: 14,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(25),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: _isRecording
                    ? AppColors.error.withValues(alpha: 0.05)
                    : AppColors.background,
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              onSubmitted: (_) => _sendText(),
            ),
          ),
          const SizedBox(width: 8),

          // Bouton micro (maintenir appuyé)
          GestureDetector(
            onLongPressStart: (_) => _startRecording(),
            onLongPressEnd: (_) => _stopRecording(),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _isRecording ? AppColors.error : AppColors.background,
                shape: BoxShape.circle,
                border: Border.all(
                  color: _isRecording ? AppColors.error : AppColors.textHint.withValues(alpha: 0.3),
                ),
              ),
              child: Icon(
                _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                color: _isRecording ? Colors.white : AppColors.textSecondary,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Bouton envoyer
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: _isSending ? AppColors.primary.withValues(alpha: 0.5) : AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: _isSending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 22),
              onPressed: _isSending ? null : _sendText,
            ),
          ),
        ],
      ),
    );
  }
}
