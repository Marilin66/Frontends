import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../providers/messagerie_provider.dart';
import '../../data/models/message_model.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ── Helpers présence ──────────────────────────────────────────────────────

/// Calcule le statut de présence à partir de la date du dernier message reçu.
/// Pas de système backend de présence → approximation par activité récente.
_PresenceInfo _computePresence(String? lastDateStr) {
  if (lastDateStr == null || lastDateStr.isEmpty) {
    return const _PresenceInfo(label: 'Hors ligne', color: null, show: false);
  }
  final d = DateTime.tryParse(lastDateStr);
  if (d == null) return const _PresenceInfo(label: 'Hors ligne', color: null, show: false);

  final diff = DateTime.now().difference(d);
  if (diff.inMinutes < 10)  return _PresenceInfo(label: 'Actif maintenant',             color: AppColors.success, show: true);
  if (diff.inMinutes < 60)  return _PresenceInfo(label: 'Actif il y a ${diff.inMinutes} min', color: Colors.amber,       show: true);
  if (diff.inHours   < 24)  return _PresenceInfo(label: 'Actif il y a ${diff.inHours}h',      color: AppColors.textHint,  show: true);
  if (diff.inDays    == 1)  return const _PresenceInfo(label: 'Actif hier',              color: null,               show: true);
  return const _PresenceInfo(label: 'Hors ligne', color: null, show: false);
}

class _PresenceInfo {
  final String label;
  final Color? color;
  final bool show;
  const _PresenceInfo({required this.label, required this.color, required this.show});
}

// ── Écran Chat ────────────────────────────────────────────────────────────

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
  final _textCtrl    = TextEditingController();
  final _scrollCtrl  = ScrollController();
  final _recorder    = AudioRecorder();

  bool _isSending    = false;
  bool _isRecording  = false;
  int  _recSeconds   = 0;
  String? _recordPath;

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    _recorder.dispose();
    super.dispose();
  }

  // ── Scroll ───────────────────────────────────────────────────────────

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  // ── État clôture ──────────────────────────────────────────────────────

  bool _isClosed() {
    if (widget.consultationId == null) return false;
    final convs = ref.watch(conversationProvider).value ?? [];
    final match = convs.where((c) => c.consultationId == widget.consultationId);
    return match.isEmpty ? false : match.first.estCloture;
  }

  // ── Envoi texte ───────────────────────────────────────────────────────

  Future<void> _sendText() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty || _isSending) return;
    _textCtrl.clear();
    setState(() => _isSending = true);
    final ok = await ref.read(messageProvider(MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    )).notifier).sendMessage(text);
    if (mounted) { setState(() => _isSending = false); if (ok) _scrollToBottom(); }
  }

  // ── Enregistrement vocal ──────────────────────────────────────────────

  Future<void> _startRecording() async {
    if (!await _recorder.hasPermission()) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Permission microphone refusée')));
      return;
    }
    final dir  = await getTemporaryDirectory();
    _recordPath = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(encoder: AudioEncoder.aacLc), path: _recordPath!);
    setState(() { _isRecording = true; _recSeconds = 0; });
    // Compteur
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!_isRecording || !mounted) return false;
      setState(() => _recSeconds++);
      return true;
    });
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    setState(() => _isRecording = false);
    if (path == null || !mounted) return;
    setState(() => _isSending = true);
    final ok = await ref.read(messageProvider(MessageParam(
      consultationId: widget.consultationId,
      destinataireId: widget.destinataireId,
    )).notifier).sendVoiceMessage(path);
    if (mounted) { setState(() => _isSending = false); if (ok) _scrollToBottom(); }
  }

  Future<void> _cancelRecording() async {
    await _recorder.stop();
    setState(() { _isRecording = false; _recSeconds = 0; });
  }

  // ── Envoi fichier ─────────────────────────────────────────────────────

  Future<void> _pickAndSendFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'],
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.path == null) return;

    setState(() => _isSending = true);

    try {
      final client = ref.read(dioClientProvider);
      final formData = FormData.fromMap({
        'destinataire': widget.destinataireId,
        if (widget.consultationId != null) 'consultation': widget.consultationId,
        'contenu': file.name,
        'type_message': 'fichier',
        'piece_jointe': await MultipartFile.fromFile(file.path!, filename: file.name),
      }..removeWhere((_, v) => v == null));

      final response = await client.post(ApiConstants.messages, data: formData);
      if (response.statusCode == 201 && response.data is Map<String, dynamic>) {
        final newMsg = MessageModel.fromJson(response.data as Map<String, dynamic>);
        final param  = MessageParam(consultationId: widget.consultationId, destinataireId: widget.destinataireId);
        ref.read(messageProvider(param).notifier).addMessage(newMsg);
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur envoi fichier: $e')));
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final param        = MessageParam(consultationId: widget.consultationId, destinataireId: widget.destinataireId);
    final messagesAsync = ref.watch(messageProvider(param));
    final currentUserId = ref.read(authProvider).user?.id;
    final closed        = _isClosed();

    // Calcul de présence à partir du dernier message reçu
    final lastReceivedDate = messagesAsync.value
        ?.where((m) => m.expediteur != currentUserId)
        .lastOrNull
        ?.dateEnvoi;
    final presence = _computePresence(lastReceivedDate);

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(closed, presence),
      body: Column(
        children: [
          if (closed) _buildClosedBanner(),
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erreur: $e')),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(closed ? Icons.lock_outline_rounded : Icons.chat_bubble_outline_rounded, size: 48, color: AppColors.textHint),
                      const SizedBox(height: 12),
                      Text(closed ? 'Consultation terminée' : 'Aucun message',
                          style: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 15, fontWeight: FontWeight.w500)),
                      if (!closed) Text('Envoyez le premier message',
                          style: GoogleFonts.poppins(color: AppColors.textHint, fontSize: 13)),
                    ],
                  ));
                }
                return ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  itemCount: messages.length,
                  itemBuilder: (_, i) {
                    final msg     = messages[i];
                    final isMe    = msg.expediteur == currentUserId;
                    final showSep = i == 0 || _isDifferentDay(messages[i - 1].dateEnvoi, msg.dateEnvoi);
                    return Column(children: [
                      if (showSep) _DateSeparator(dateStr: msg.dateEnvoi),
                      _MessageBubble(message: msg, isMe: isMe),
                    ]);
                  },
                );
              },
            ),
          ),
          closed ? _buildLockedInput() : _buildInput(),
        ],
      ),
    );
  }

  bool _isDifferentDay(String a, String b) {
    try {
      final da = DateTime.parse(a), db = DateTime.parse(b);
      return da.year != db.year || da.month != db.month || da.day != db.day;
    } catch (_) { return false; }
  }

  // ── AppBar — sans boutons appel/vidéo ────────────────────────────────

  PreferredSizeWidget _buildAppBar(bool closed, _PresenceInfo presence) {
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
                ? NetworkImage(widget.contactPhoto!.startsWith('http') ? widget.contactPhoto! : '') as ImageProvider
                : null,
            child: (widget.contactPhoto == null || widget.contactPhoto!.isEmpty)
                ? Text(widget.contactName.isNotEmpty ? widget.contactName[0].toUpperCase() : '?',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 16))
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(widget.contactName,
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimary),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                Row(children: [
                  if (presence.show && !closed) ...[
                    Container(
                      width: 6, height: 6,
                      decoration: BoxDecoration(
                        color: presence.color ?? AppColors.textHint,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                  ],
                  Text(
                    closed ? 'Consultation clôturée' : presence.label,
                    style: GoogleFonts.poppins(
                      fontSize: 11, fontWeight: FontWeight.w500,
                      color: closed ? AppColors.warning
                          : (presence.color ?? AppColors.textSecondary),
                    ),
                  ),
                ]),
              ],
            ),
          ),
        ],
      ),
      // Pas de boutons appel audio/vidéo
    );
  }

  // ── Bannière clôture ──────────────────────────────────────────────────

  Widget _buildClosedBanner() {
    return Container(
      width: double.infinity,
      color: const Color(0xFFFFF3CD),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(children: [
        const Icon(Icons.lock_outline_rounded, size: 15, color: Color(0xFF856404)),
        const SizedBox(width: 8),
        Expanded(child: Text("Cette consultation est terminée. L'envoi de messages est désactivé.",
            style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF856404), fontWeight: FontWeight.w500))),
      ]),
    );
  }

  // ── Zone de saisie ────────────────────────────────────────────────────

  Widget _buildInput() {
    final canSend = _textCtrl.text.trim().isNotEmpty && !_isRecording;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: Color(0xFFEEEEEE), width: 1)),
      ),
      padding: EdgeInsets.only(
        left: 8, right: 8, top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Indicateur enregistrement
          if (_isRecording)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
              child: Row(children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Expanded(child: Text(
                  'Enregistrement… ${(_recSeconds ~/ 60).toString().padLeft(2, '0')}:${(_recSeconds % 60).toString().padLeft(2, '0')}',
                  style: GoogleFonts.poppins(fontSize: 13, color: Colors.red.shade700, fontWeight: FontWeight.w500),
                )),
                GestureDetector(
                  onTap: _cancelRecording,
                  child: Text('Annuler', style: GoogleFonts.poppins(fontSize: 12, color: Colors.red.shade700, fontWeight: FontWeight.bold)),
                ),
              ]),
            ),

          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Bouton pièce jointe
              IconButton(
                icon: const Icon(Icons.attach_file_rounded, color: AppColors.textSecondary),
                onPressed: _isSending ? null : _pickAndSendFile,
                tooltip: 'Joindre un fichier',
              ),

              // Champ texte
              Expanded(
                child: Container(
                  constraints: const BoxConstraints(maxHeight: 120),
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16)),
                  child: TextField(
                    controller: _textCtrl,
                    maxLines: null,
                    enabled: !_isRecording,
                    textCapitalization: TextCapitalization.sentences,
                    style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textPrimary),
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: _isRecording ? 'Enregistrement en cours...' : 'Écrivez votre message...',
                      hintStyle: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 14),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Bouton envoyer OU micro
              if (canSend)
                // Envoyer
                GestureDetector(
                  onTap: _sendText,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 44, height: 44,
                    decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                    child: _isSending
                        ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  ),
                )
              else
                // Micro (maintenir pour enregistrer)
                GestureDetector(
                  onLongPressStart: (_) => _startRecording(),
                  onLongPressEnd:   (_) => _stopRecording(),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: _isRecording ? Colors.red : AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isRecording ? Icons.mic_off_rounded : Icons.mic_rounded,
                      color: Colors.white, size: 20,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLockedInput() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        border: Border(top: BorderSide(color: Color(0xFFEEEEEE), width: 1)),
      ),
      padding: EdgeInsets.only(left: 16, right: 16, top: 14, bottom: MediaQuery.of(context).padding.bottom + 14),
      child: Row(children: [
        const Icon(Icons.lock_rounded, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Expanded(child: Text('Les messages sont désactivés — consultation clôturée',
            style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500))),
      ]),
    );
  }
}

// ── Séparateur de date ────────────────────────────────────────────────────

class _DateSeparator extends StatelessWidget {
  final String dateStr;
  const _DateSeparator({required this.dateStr});

  String _label() {
    try {
      final d    = DateTime.parse(dateStr);
      final now  = DateTime.now();
      final yest = now.subtract(const Duration(days: 1));
      if (d.year == now.year  && d.month == now.month  && d.day == now.day)  return "Aujourd'hui";
      if (d.year == yest.year && d.month == yest.month && d.day == yest.day) return 'Hier';
      return '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}';
    } catch (_) { return ''; }
  }

  @override
  Widget build(BuildContext context) {
    final label = _label();
    if (label.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
          decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(12)),
          child: Text(label, style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

// ── Bulle de message ──────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMe;
  const _MessageBubble({required this.message, required this.isMe});

  String _formatTime() {
    try {
      final d = DateTime.parse(message.dateEnvoi);
      return '${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}';
    } catch (_) { return ''; }
  }

  bool get _isImage {
    final url = message.pieceJointe ?? '';
    return RegExp(r'\.(jpg|jpeg|png|gif|webp)$', caseSensitive: false).hasMatch(url);
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(top: 3, bottom: 3, left: isMe ? 56 : 0, right: isMe ? 0 : 56),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isMe) ...[
              CircleAvatar(
                radius: 14,
                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                backgroundImage: message.expediteurPhoto != null && message.expediteurPhoto!.isNotEmpty
                    ? NetworkImage(message.expediteurPhoto!) : null,
                child: (message.expediteurPhoto == null || message.expediteurPhoto!.isEmpty)
                    ? Text(message.expediteurNom.isNotEmpty ? message.expediteurNom[0].toUpperCase() : '?',
                        style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary))
                    : null,
              ),
              const SizedBox(width: 6),
            ],
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft:     const Radius.circular(16),
                    topRight:    const Radius.circular(16),
                    bottomLeft:  Radius.circular(isMe ? 16 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 16),
                  ),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!isMe && message.expediteurNom.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: Text(message.expediteurNom,
                            style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      ),

                    // Contenu selon le type
                    _buildContent(context),

                    const SizedBox(height: 3),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(_formatTime(), style: GoogleFonts.poppins(fontSize: 10,
                            color: isMe ? Colors.white70 : AppColors.textSecondary, fontWeight: FontWeight.w500)),
                        if (isMe) ...[
                          const SizedBox(width: 3),
                          Icon(message.lu ? Icons.done_all_rounded : Icons.done_rounded,
                              size: 13, color: message.lu ? const Color(0xFF93C5FD) : Colors.white70),
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
        return GestureDetector(
          onTap: () async {
            if (message.audio != null) {
              final uri = Uri.parse(message.audio!);
              if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
            }
          },
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.play_circle_fill_rounded, color: isMe ? Colors.white : AppColors.primary, size: 32),
            const SizedBox(width: 8),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Message vocal', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600,
                  color: isMe ? Colors.white : AppColors.textPrimary)),
              Text('Appuyer pour écouter', style: GoogleFonts.poppins(fontSize: 11,
                  color: isMe ? Colors.white70 : AppColors.textSecondary)),
            ]),
          ]),
        );

      case TypeMessage.fichier:
        if (_isImage && message.pieceJointe != null) {
          return GestureDetector(
            onTap: () async {
              final uri = Uri.parse(message.pieceJointe!);
              if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(message.pieceJointe!, width: 200, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined)),
            ),
          );
        }
        return GestureDetector(
          onTap: () async {
            if (message.pieceJointe != null) {
              final uri = Uri.parse(message.pieceJointe!);
              if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
            }
          },
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.attach_file_rounded, size: 18, color: isMe ? Colors.white70 : AppColors.textSecondary),
            const SizedBox(width: 6),
            Flexible(child: Text(message.contenu.isNotEmpty ? message.contenu : 'Fichier',
                style: GoogleFonts.poppins(fontSize: 13, color: isMe ? Colors.white : AppColors.primary,
                    decoration: TextDecoration.underline))),
          ]),
        );

      case TypeMessage.texte:
        return Text(message.contenu,
            style: GoogleFonts.poppins(fontSize: 14, color: isMe ? Colors.white : AppColors.textPrimary, height: 1.4));
    }
  }
}
