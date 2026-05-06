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
      backgroundColor: const Color(0xFFECE5DD), // fond WhatsApp
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
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          closed
                              ? 'Consultation terminée'
                              : 'Aucun message',
                          style: GoogleFonts.poppins(
                            color: Colors.grey.shade500,
                            fontSize: 15,
                          ),
                        ),
                        if (!closed)
                          Text(
                            'Envoyez le premier message',
                            style: GoogleFonts.poppins(
                              color: Colors.grey.shade400,
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
                      horizontal: 8, vertical: 12),
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
      backgroundColor: const Color(0xFF075E54), // vert WhatsApp
      foregroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: Colors.white.withValues(alpha: 0.2),
            child: Text(
              widget.contactName.isNotEmpty
                  ? widget.contactName[0].toUpperCase()
                  : '?',
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  fontSize: 16),
            ),
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
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  closed ? 'Consultation clôturée' : 'En ligne',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: closed
                        ? Colors.orange.shade200
                        : Colors.greenAccent.shade100,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.videocam_outlined),
          onPressed: closed ? null : () {},
        ),
        IconButton(
          icon: const Icon(Icons.call_outlined),
          onPressed: closed ? null : () {},
        ),
        IconButton(
          icon: const Icon(Icons.more_vert),
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
      color: const Color(0xFFECE5DD),
      padding: EdgeInsets.only(
        left: 8,
        right: 8,
        top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Champ texte
          Expanded(
            child: Container(
              constraints: const BoxConstraints(maxHeight: 120),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _textCtrl,
                maxLines: null,
                textCapitalization: TextCapitalization.sentences,
                style: GoogleFonts.poppins(fontSize: 15),
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: 'Message',
                  hintStyle: GoogleFonts.poppins(
                      color: Colors.grey.shade500, fontSize: 15),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  prefixIcon: Icon(Icons.emoji_emotions_outlined,
                      color: Colors.grey.shade500),
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
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _isRecording
                    ? Colors.red
                    : const Color(0xFF075E54),
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
                      size: 22,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLockedInput() {
    return Container(
      color: Colors.grey.shade100,
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
      child: Row(
        children: [
          const Icon(Icons.lock_rounded, size: 18, color: Colors.grey),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Les messages sont désactivés — consultation clôturée',
              style: GoogleFonts.poppins(
                  fontSize: 13, color: Colors.grey.shade500),
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
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFD9FDD3).withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.grey.shade700,
              fontWeight: FontWeight.w500,
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
          top: 2,
          bottom: 2,
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
                child: Text(
                  message.expediteurNom.isNotEmpty
                      ? message.expediteurNom[0].toUpperCase()
                      : '?',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 6),
            ],

            // Bulle
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isMe
                      ? const Color(0xFFDCF8C6) // vert clair WhatsApp
                      : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isMe ? 16 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
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
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),

                    // Contenu
                    _buildContent(context),

                    // Heure + statut
                    const SizedBox(height: 2),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(),
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: Colors.grey.shade500,
                          ),
                        ),
                        if (isMe) ...[
                          const SizedBox(width: 3),
                          Icon(
                            message.lu
                                ? Icons.done_all_rounded
                                : Icons.done_rounded,
                            size: 14,
                            color: message.lu
                                ? const Color(0xFF34B7F1) // bleu WhatsApp
                                : Colors.grey.shade400,
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
                  color: isMe ? const Color(0xFF075E54) : AppColors.primary,
                  size: 32),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Message vocal',
                      style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade800)),
                  Text('Appuyer pour écouter',
                      style: GoogleFonts.poppins(
                          fontSize: 11, color: Colors.grey.shade500)),
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
                size: 18, color: Colors.grey.shade600),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                message.contenu.isNotEmpty ? message.contenu : 'Fichier',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: Colors.grey.shade800,
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
            color: Colors.grey.shade900,
            height: 1.4,
          ),
        );
    }
  }
}
