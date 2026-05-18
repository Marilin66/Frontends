import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/messagerie_provider.dart';
import '../../data/models/message_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int? consultationId;
  final int? destinataireId;
  final String contactName;
  final String? contactPhoto;

  const ChatScreen({
    super.key,
    this.consultationId,
    this.destinataireId,
    required this.contactName,
    this.contactPhoto,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _isSending = false;
  bool _isRecording = false;
  final AudioRecorder _recorder = AudioRecorder();

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    _recorder.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  bool _isClosed() {
    if (widget.consultationId == null) return false;
    final convs = ref.watch(conversationProvider).value ?? [];
    final match = convs.where((c) => c.consultationId == widget.consultationId);
    return match.isEmpty ? false : match.first.estCloture;
  }

  Future<void> _send() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty || _isSending) return;
    _textCtrl.clear();
    setState(() => _isSending = true);
    final param = MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    );
    final ok = await ref.read(messageProvider(param).notifier).sendMessage(text);
    if (mounted) {
      setState(() => _isSending = false);
      if (ok) _scrollToBottom();
    }
  }

  Future<void> _startRecording() async {
    if (!await _recorder.hasPermission()) return;
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(), path: path);
    setState(() => _isRecording = true);
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    setState(() => _isRecording = false);
    if (path == null || !mounted) return;
    setState(() => _isSending = true);
    final param = MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    );
    final ok = await ref.read(messageProvider(param).notifier).sendVoiceMessage(path);
    if (mounted) {
      setState(() => _isSending = false);
      if (ok) _scrollToBottom();
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
    final closed = _isClosed();

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(closed),
      body: Column(
        children: [
          // Bandeau clôture
          if (closed) _buildClosedBanner(),

          // Messages
          Expanded(
            child: messagesAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) =>
                  Center(child: Text('Erreur: $e')),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          closed
                              ? Icons.lock_outline_rounded
                              : Icons.chat_bubble_outline_rounded,
                          size: 48,
                          color: AppColors.textHint,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          closed
                              ? 'Consultation terminée'
                              : 'Aucun message',
                          style: GoogleFonts.poppins(
                            color: AppColors.textSecondary,
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (!closed)
                          Text(
                            'Envoyez le premier message',
                            style: GoogleFonts.poppins(
                              color: AppColors.textHint,
                              fontSize: 13,
                            ),
                          ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 16),
                  itemCount: messages.length,
                  itemBuilder: (context, i) {
                    final msg = messages[i];
                    final isMe = msg.expediteur == currentUserId;
                    // Afficher la date si c'est le premier message ou si le jour change
                    final showDate = i == 0 ||
                        _isDifferentDay(
                            messages[i - 1].dateEnvoi, msg.dateEnvoi);
                    return Column(
                      children: [
                        if (showDate) _DateSeparator(dateStr: msg.dateEnvoi),
                        _MessageBubble(message: msg, isMe: isMe),
                      ],
                    );
                  },
                );
              },
            ),
          ),

          // Zone de saisie
          closed ? _buildLockedInput() : _buildInput(),
        ],
      ),
    );
  }

  bool _isDifferentDay(String a, String b) {
    try {
      final da = DateTime.parse(a);
      final db = DateTime.parse(b);
      return da.year != db.year || da.month != db.month || da.day != db.day;
    } catch (_) {
      return false;
    }
  }

  PreferredSizeWidget _buildAppBar(bool closed) {
    return AppBar(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      titleSpacing: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            backgroundImage: widget.contactPhoto != null && widget.contactPhoto!.isNotEmpty
                ? NetworkImage(
                    widget.contactPhoto!.startsWith('http') 
                      ? widget.contactPhoto! 
                      : '${AppColors.primary}${widget.contactPhoto}') // fallback simpliste
                : null,
            child: widget.contactPhoto == null || widget.contactPhoto!.isEmpty
                ? Text(
                    widget.contactName.isNotEmpty
                        ? widget.contactName[0].toUpperCase()
                        : '?',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                        fontSize: 16),
                  )
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.contactName,
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Row(
                  children: [
                    if (!closed) ...[
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      closed ? 'Consultation clôturée' : 'En ligne',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: closed
                            ? AppColors.warning
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.videocam_outlined, color: AppColors.textSecondary),
          onPressed: closed ? null : () {},
        ),
        IconButton(
          icon: const Icon(Icons.call_outlined, color: AppColors.textSecondary),
          onPressed: closed ? null : () {},
        ),
        IconButton(
          icon: const Icon(Icons.more_vert, color: AppColors.textSecondary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildClosedBanner() {
    return Container(
      width: double.infinity,
      color: const Color(0xFFFFF3CD),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          const Icon(Icons.lock_outline_rounded,
              size: 15, color: Color(0xFF856404)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Cette consultation est terminée. L\'envoi de messages est désactivé.',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: const Color(0xFF856404),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      color: AppColors.surface,
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        top: 10,
        bottom: MediaQuery.of(context).padding.bottom + 10,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(color: Color(0xFFEEEEEE), width: 1),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Champ texte
          Expanded(
            child: Container(
              constraints: const BoxConstraints(maxHeight: 120),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9), // slate-100 style
                borderRadius: BorderRadius.circular(16),
              ),
              child: TextField(
                controller: _textCtrl,
                maxLines: null,
                textCapitalization: TextCapitalization.sentences,
                style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textPrimary),
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Écrivez votre message...',
                  hintStyle: GoogleFonts.poppins(
                      color: AppColors.textSecondary, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  prefixIcon: const Icon(Icons.emoji_emotions_outlined,
                      color: AppColors.textSecondary),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Bouton envoyer ou micro
          GestureDetector(
            onTap: _textCtrl.text.trim().isNotEmpty ? _send : null,
            onLongPressStart: _textCtrl.text.trim().isEmpty
                ? (_) => _startRecording()
                : null,
            onLongPressEnd: _textCtrl.text.trim().isEmpty
                ? (_) => _stopRecording()
                : null,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _isRecording
                    ? AppColors.error
                    : AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: _isSending
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : Icon(
                      _textCtrl.text.trim().isNotEmpty
                          ? Icons.send_rounded
                          : (_isRecording
                              ? Icons.mic_off_rounded
                              : Icons.mic_rounded),
                      color: Colors.white,
                      size: 20,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLockedInput() {
    return Container(
      color: const Color(0xFFF8FAFC), // soft slate background
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 14,
        bottom: MediaQuery.of(context).padding.bottom + 14,
      ),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Color(0xFFEEEEEE), width: 1),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.lock_rounded, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Les messages sont désactivés — consultation clôturée',
              style: GoogleFonts.poppins(
                  fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Séparateur de date ────────────────────────────────────────────────────────

class _DateSeparator extends StatelessWidget {
  final String dateStr;
  const _DateSeparator({required this.dateStr});

  String _label() {
    try {
      final d = DateTime.parse(dateStr);
      final now = DateTime.now();
      final yesterday = now.subtract(const Duration(days: 1));
      if (d.year == now.year && d.month == now.month && d.day == now.day) {
        return "Aujourd'hui";
      }
      if (d.year == yesterday.year &&
          d.month == yesterday.month &&
          d.day == yesterday.day) {
        return 'Hier';
      }
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final label = _label();
    if (label.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE2E8F0), // premium slate color
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Bulle de message ──────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  String _formatTime() {
    try {
      final d = DateTime.parse(message.dateEnvoi);
      return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(
          top: 4,
          bottom: 4,
          left: isMe ? 60 : 0,
          right: isMe ? 0 : 60,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Avatar interlocuteur
            if (!isMe) ...[
              CircleAvatar(
                radius: 14,
                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                backgroundImage: message.expediteurPhoto != null && message.expediteurPhoto!.isNotEmpty
                    ? NetworkImage(message.expediteurPhoto!)
                    : null,
                child: message.expediteurPhoto == null || message.expediteurPhoto!.isEmpty
                    ? Text(
                        message.expediteurNom.isNotEmpty
                            ? message.expediteurNom[0].toUpperCase()
                            : '?',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 8),
            ],

            // Bulle
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isMe
                      ? AppColors.primary
                      : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isMe ? 16 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Nom expéditeur (pour les messages reçus)
                    if (!isMe && message.expediteurNom.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          message.expediteurNom,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),

                    // Contenu
                    _buildContent(context),

                    // Heure + statut
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(),
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: isMe ? Colors.white70 : AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (isMe) ...[
                          const SizedBox(width: 4),
                          Icon(
                            message.lu
                                ? Icons.done_all_rounded
                                : Icons.done_rounded,
                            size: 13,
                            color: message.lu
                                ? const Color(0xFF93C5FD) // light blue
                                : Colors.white70,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    switch (message.typeMessage) {
      case TypeMessage.vocal:
        return InkWell(
          onTap: () async {
            if (message.audio != null) {
              final uri = Uri.parse(message.audio!);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            }
          },
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.play_circle_fill_rounded,
                  color: isMe ? Colors.white : AppColors.primary,
                  size: 32),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Message vocal',
                      style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isMe ? Colors.white : AppColors.textPrimary)),
                  Text('Appuyer pour écouter',
                      style: GoogleFonts.poppins(
                          fontSize: 11, color: isMe ? Colors.white70 : AppColors.textSecondary)),
                ],
              ),
            ],
          ),
        );

      case TypeMessage.fichier:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.attach_file_rounded,
                size: 18, color: isMe ? Colors.white70 : AppColors.textSecondary),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                message.contenu.isNotEmpty ? message.contenu : 'Fichier',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: isMe ? Colors.white : AppColors.textPrimary,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        );

      case TypeMessage.texte:
      default:
        return Text(
          message.contenu,
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: isMe ? Colors.white : AppColors.textPrimary,
            height: 1.4,
          ),
        );
    }
  }
}
