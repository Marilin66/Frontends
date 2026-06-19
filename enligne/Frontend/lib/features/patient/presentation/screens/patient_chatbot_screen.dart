import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/localization/app_localizations.dart';
import 'package:hopitel_app/core/localization/language_provider.dart';

/// AI Agent page for Flutter — chatbot with session sidebar
class PatientChatbotScreen extends ConsumerStatefulWidget {
  const PatientChatbotScreen({super.key});

  @override
  ConsumerState<PatientChatbotScreen> createState() =>
      _PatientChatbotScreenState();
}

class _PatientChatbotScreenState extends ConsumerState<PatientChatbotScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isTyping = false;
  bool _sidebarOpen = true;
  int? _selectedSessionId;
  final List<_ChatSession> _sessions = [];

  @override
  void initState() {
    super.initState();
    _messages.add(_ChatMessage(
      role: 'assistant',
      content: t(context, AppStrings.aiGreeting),
      timestamp: DateTime.now(),
    ));
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty || _isTyping) return;

    setState(() {
      _messages.add(_ChatMessage(
        role: 'user',
        content: text,
        timestamp: DateTime.now(),
      ));
      _isTyping = true;
    });
    _inputController.clear();
    _scrollToBottom();

    // Simulate AI response (in production, call the chatbot API)
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMessage(
          role: 'assistant',
          content: _getAIResponse(text),
          timestamp: DateTime.now(),
        ));
        _isTyping = false;
      });
      _scrollToBottom();
    });
  }

  String _getAIResponse(String input) {
    final lower = input.toLowerCase();
    if (lower.contains('rdv') || lower.contains('rendez-vous')) {
      return 'Pour prendre rendez-vous, allez dans la section "Rendez-vous" depuis votre tableau de bord. Vous pouvez choisir un hôpital, un service et un créneau disponible.';
    }
    if (lower.contains('résultat') || lower.contains('resultat')) {
      return 'Vos résultats de laboratoire sont disponibles dans la section "Résultats". Vous pouvez les consulter avec le code d\'accès envoyé par email.';
    }
    if (lower.contains('profi')) {
      return 'Vous pouvez modifier votre profil en allant dans "Mon Profil" > "Modifier". N\'oubliez pas de renseigner votre NPI pour pouvoir réserver.';
    }
    return 'Merci pour votre question ! Je suis l\'assistant intelligent d\'Hopitel. Je peux vous aider pour :\n\n• Prise de rendez-vous\n• Consultation de résultats\n• Gestion de votre profil\n• Information sur les services\n\nComment puis-je vous aider ?';
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _startNewSession() {
    setState(() {
      _selectedSessionId = null;
      _messages.clear();
      _messages.add(_ChatMessage(
        role: 'assistant',
        content: 'Nouvelle discussion lancée. En quoi puis-je vous aider ?',
        timestamp: DateTime.now(),
      ));
    });
    if (MediaQuery.of(context).size.width < 1024) {
      setState(() => _sidebarOpen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final langState = ref.watch(languageProvider);
    final langCode = langState.languageCode;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Row(
          children: [
            // ── Sidebar ──
            if (_sidebarOpen)
              _buildSidebar(langCode),

            // ── Main chat area ──
            Expanded(
              child: Column(
                children: [
                  _buildHeader(langCode),
                  Expanded(child: _buildChatArea()),
                  _buildInputArea(langCode),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebar(String langCode) {
    final isWide = MediaQuery.of(context).size.width >= 1024;

    return Container(
      width: isWide ? 300 : MediaQuery.of(context).size.width * 0.85,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          right: BorderSide(
            color: Theme.of(context).dividerColor,
          ),
        ),
      ),
      child: Column(
        children: [
          // New chat button
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _startNewSession,
                    icon: const Icon(Icons.add, size: 18),
                    label: Text(
                      langCode == 'fr' ? 'Nouveau chat' :
                      langCode == 'en' ? 'New chat' :
                      langCode == 'fon' ? 'Agbalé vɛ' :
                      'Àtọ̀nà tuntun',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                if (!isWide) ...[
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => setState(() => _sidebarOpen = false),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ],
            ),
          ),

          // Sessions header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                langCode == 'fr' ? 'CONVERSATIONS RÉCENTES' :
                langCode == 'en' ? 'RECENT CONVERSATIONS' :
                langCode == 'fon' ? 'GBÉGBÉLÉ YI ƑÉ' :
                'ÀKÓRÒ TUNTUN',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).textTheme.bodySmall?.color,
                  letterSpacing: 1.2,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Sessions list
          Expanded(
            child: _sessions.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.chat_bubble_outline,
                          size: 40,
                          color: Theme.of(context).dividerColor,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          langCode == 'fr' ? 'Aucun historique' :
                          langCode == 'en' ? 'No history' :
                          'Kò dákẹ́',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    itemCount: _sessions.length,
                    itemBuilder: (context, index) {
                      final session = _sessions[index];
                      final isSelected = _selectedSessionId == session.id;
                      return ListTile(
                        selected: isSelected,
                        selectedTileColor: Theme.of(context)
                            .colorScheme
                            .primary
                            .withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        leading: Icon(
                          Icons.chat_bubble_outline,
                          size: 20,
                          color: isSelected
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).textTheme.bodySmall?.color,
                        ),
                        title: Text(
                          session.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                        subtitle: Text(
                          '${session.date.day}/${session.date.month}/${session.date.year}',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                        onTap: () {
                          setState(() => _selectedSessionId = session.id);
                          if (!isWide) setState(() => _sidebarOpen = false);
                        },
                      );
                    },
                  ),
          ),

          // Footer badge
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'Hopitel Intelligence v2',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(String langCode) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => setState(() => _sidebarOpen = !_sidebarOpen),
            icon: Icon(
              _sidebarOpen ? Icons.menu_open : Icons.menu,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.smart_toy,
                      size: 18,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        langCode == 'fr' ? 'Assistant Hopitel' :
                        langCode == 'en' ? 'Hopitel Assistant' :
                        'Hopitel Amí',
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      langCode == 'fr' ? 'Connecté' :
                      langCode == 'en' ? 'Connected' :
                      'Kɛ́ká',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatArea() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length) {
          return _buildTypingIndicator();
        }
        return _buildMessageBubble(_messages[index]);
      },
    );
  }

  Widget _buildMessageBubble(_ChatMessage msg) {
    final isUser = msg.role == 'user';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          mainAxisAlignment:
              isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.smart_toy,
                  size: 18, color: Colors.white),
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isUser
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(20),
                    topRight: const Radius.circular(20),
                    bottomLeft: Radius.circular(isUser ? 20 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 20),
                  ),
                  border: isUser
                      ? null
                      : Border.all(
                          color: Theme.of(context).dividerColor,
                          width: 1,
                        ),
                ),
                child: Text(
                  msg.content,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    height: 1.5,
                    color: isUser
                        ? Colors.white
                        : Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ...List.generate(3, (i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: AnimatedContainer(
                duration: Duration(milliseconds: 300 + (i * 200)),
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.6),
                  shape: BoxShape.circle,
                ),
              ),
            )),
            const SizedBox(width: 8),
            Text(
              'Analyse...',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).textTheme.bodySmall?.color,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(String langCode) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _inputController,
                  onSubmitted: (_) => _sendMessage(),
                  decoration: InputDecoration(
                    hintText: langCode == 'fr'
                        ? 'Posez une question santé...'
                        : langCode == 'en'
                            ? 'Ask a health question...'
                            : langCode == 'fon'
                                ? 'Nú gbé ɔ̀fọ̀...'
                                : 'Béèrè ìlera...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(
                        color: Theme.of(context).dividerColor,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(
                        color: Theme.of(context).dividerColor,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    filled: true,
                    fillColor: Theme.of(context).brightness == Brightness.dark
                        ? const Color(0xFF334155)
                        : Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send, color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            langCode == 'fr'
                ? 'Assistant IA : Informations indicatives uniquement.'
                : langCode == 'en'
                    ? 'AI Assistant: Informational only.'
                    : 'Amí IA: Ti ń ké wa kúrò.',
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodySmall?.color,
              letterSpacing: 0.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Models ─────────────────────────────────────────────────────────────────

class _ChatMessage {
  final String role;
  final String content;
  final DateTime timestamp;

  _ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });
}

class _ChatSession {
  final int id;
  final String title;
  final DateTime date;

  _ChatSession({
    required this.id,
    required this.title,
    required this.date,
  });
}
