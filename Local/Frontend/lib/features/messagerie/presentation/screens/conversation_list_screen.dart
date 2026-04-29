import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/messagerie_provider.dart';

class ConversationListScreen extends ConsumerWidget {
  const ConversationListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context),
          SliverToBoxAdapter(child: _buildQuickActions(context)),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            sliver: conversationsAsync.when(
              loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator())),
              error: (e, _) => SliverFillRemaining(child: Center(child: Text('Erreur: $e'))),
              data: (conversations) {
                if (conversations.isEmpty) return SliverFillRemaining(child: _buildEmptyState());
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _ConversationCard(conversation: conversations[index]),
                    childCount: conversations.length,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 140,
      floating: true,
      pinned: true,
      elevation: 0,
      backgroundColor: AppColors.slate950,
      leading: const UniversalBackButton(color: Colors.white),
      flexibleSpace: FlexibleSpaceBar(
        titlePadding: const EdgeInsets.only(left: 60, bottom: 16),
        title: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'HOPITEL MESSAGERIE',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w900,
                fontSize: 16,
                letterSpacing: -0.5,
                color: Colors.white,
              ),
            ),
            Text(
              'RÉSEAU SÉCURISÉ AES-256',
              style: GoogleFonts.poppins(
                fontSize: 7,
                fontWeight: FontWeight.w700,
                color: AppColors.primary.withOpacity(0.8),
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
        background: Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.slate950, Color(0xFF0F172A)],
                ),
              ),
            ),
            Positioned(
              right: -50,
              top: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withOpacity(0.05),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Container(
      height: 110,
      margin: const EdgeInsets.only(top: 20),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          _QuickActionItem(
            icon: Icons.add_rounded, 
            label: 'Nouveau', 
            isAdd: true,
            onTap: () => _showNewConversationModal(context),
          ),
          _QuickActionItem(
            icon: Icons.support_agent_rounded, 
            label: 'Support',
            onTap: () {
              context.push('/patient/chatbot');
            },
          ),
          _QuickActionItem(
            icon: Icons.flash_on_rounded, 
            label: 'Urgence',
            onTap: () {
              context.push('/patient/nearby');
            },
          ),
          _QuickActionItem(
            icon: Icons.bookmark_outline_rounded, 
            label: 'Favoris',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Aucun favori enregistré.')));
            },
          ),
        ],
      ),
    );
  }

  void _showNewConversationModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => _NewConversationSheet(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.chat_bubble_outline_rounded, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'AUCUNE DISCUSSION',
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Colors.grey[400],
              letterSpacing: 2.0,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isAdd;
  final VoidCallback? onTap;

  const _QuickActionItem({
    required this.icon, 
    required this.label, 
    this.isAdd = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedTap(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 24),
        child: Column(
          children: [
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              color: isAdd ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: (isAdd ? AppColors.primary : Colors.black).withOpacity(0.1),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Icon(icon, color: isAdd ? Colors.white : AppColors.primary, size: 28),
          ),
          const SizedBox(height: 10),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.poppins(
              fontSize: 9, 
              fontWeight: FontWeight.w800,
              color: AppColors.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    ));
  }
}

class _ConversationCard extends StatelessWidget {
  final dynamic conversation;
  const _ConversationCard({required this.conversation});

  @override
  Widget build(BuildContext context) {
    final isConsultation = conversation.type == 'consultation';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: AnimatedTap(
        onTap: () {
          final location = GoRouterState.of(context).matchedLocation;
          if (isConsultation) {
            context.push('$location/consultation/${conversation.consultationId}');
          } else {
            context.push('$location/direct/${conversation.destinataireId}');
          }
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              _buildAvatar(),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            conversation.titre.toUpperCase(),
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w900,
                              fontSize: 14,
                              letterSpacing: -0.5,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _formatDate(conversation.dateDernierMessage),
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      conversation.dernierMessage.isNotEmpty 
                          ? conversation.dernierMessage 
                          : 'Initialiser la synchronisation...',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.poppins(
                        fontSize: 12, 
                        color: AppColors.textSecondary,
                        fontWeight: conversation.nonLus > 0 ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              if (conversation.nonLus > 0) _buildUnreadBadge(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return Stack(
      children: [
        Container(
          height: 64,
          width: 64,
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(22),
            image: const DecorationImage(
              image: NetworkImage('https://ui-avatars.com/api/?background=0F172A&color=fff&bold=true'),
              fit: BoxFit.cover,
            ),
            border: Border.all(color: AppColors.background, width: 2),
          ),
        ),
        Positioned(
          bottom: 2,
          right: 2,
          child: Container(
            height: 14,
            width: 14,
            decoration: BoxDecoration(
              color: Colors.green[500],
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.surface, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUnreadBadge() {
    return Container(
      margin: const EdgeInsets.only(left: 12),
      height: 24,
      width: 24,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF4F46E5)]),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        '${conversation.nonLus}',
        style: GoogleFonts.poppins(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
      ),
    );
  }

  String _formatDate(String dateStr) {
    if (dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      if (date.day == now.day && date.month == now.month && date.year == now.year) {
        return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
      }
      return '${date.day}/${date.month}';
    } catch (_) {
      return '';
    }
  }
}

class _NewConversationSheet extends ConsumerStatefulWidget {
  @override
  ConsumerState<_NewConversationSheet> createState() => _NewConversationSheetState();
}

class _NewConversationSheetState extends ConsumerState<_NewConversationSheet> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // This sheet could fetch doctors and laboratorians directly, but for now we provide quick navigation
    // Since we don't have a specific `search_contacts` endpoint, we just provide shortcuts to search screens
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(10)),
                ),
                Row(
                  children: [
                    const Icon(Icons.maps_ugc_rounded, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Text(
                      'Nouvelle Discussion',
                      style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Sélectionnez un canal :', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                _buildOption(
                  icon: Icons.medical_services_rounded,
                  title: 'Contacter un Médecin',
                  subtitle: 'Recherchez un patricien pour démarrer un chat',
                  color: AppColors.secondary,
                  onTap: () {
                    Navigator.pop(context);
                    context.push('/patient/search');
                  },
                ),
                const SizedBox(height: 16),
                _buildOption(
                  icon: Icons.science_rounded,
                  title: 'Laboratoires & Résultats',
                  subtitle: 'Demandez des précisions sur vos analyses',
                  color: Colors.purple,
                  onTap: () {
                    Navigator.pop(context);
                    context.push('/patient/results');
                  },
                ),
                const SizedBox(height: 16),
                _buildOption(
                  icon: Icons.smart_toy_rounded,
                  title: 'Assistant IA',
                  subtitle: 'Une question rapide ?',
                  color: Colors.teal,
                  onTap: () {
                    Navigator.pop(context);
                    context.push('/patient/chatbot');
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return AnimatedTap(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700)),
                  Text(subtitle, style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.grey[300]),
          ],
        ),
      ),
    );
  }
}
