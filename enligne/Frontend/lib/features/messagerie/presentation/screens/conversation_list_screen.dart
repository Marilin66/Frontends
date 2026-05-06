import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/messagerie_provider.dart';

class ConversationListScreen extends ConsumerStatefulWidget {
  const ConversationListScreen({super.key});

  @override
  ConsumerState<ConversationListScreen> createState() =>
      _ConversationListScreenState();
}

class _ConversationListScreenState
    extends ConsumerState<ConversationListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();
  String _search = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  String _formatDate(String dateStr) {
    if (dateStr.isEmpty) return '';
    try {
      final d = DateTime.parse(dateStr);
      final now = DateTime.now();
      if (d.year == now.year && d.month == now.month && d.day == now.day) {
        return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
      }
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'medecin':
        return AppColors.medecin;
      case 'laborantin':
        return Colors.teal;
      case 'admin_hopital':
        return AppColors.adminHopital;
      case 'admin_general':
      case 'super_admin':
        return AppColors.superAdmin;
      default:
        return AppColors.primary;
    }
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'medecin':
        return 'Médecin';
      case 'laborantin':
        return 'Laborantin';
      case 'admin_hopital':
        return 'Admin Hôpital';
      case 'admin_general':
      case 'super_admin':
        return 'Admin Général';
      default:
        return role;
    }
  }

  String _initials(String nom) {
    final parts = nom.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return nom.isNotEmpty ? nom[0].toUpperCase() : '?';
  }

  // ── Navigation vers le chat ────────────────────────────────────────────────

  void _openChat(BuildContext context, {int? destinataireId, int? consultationId, required String nom}) {
    final location = GoRouterState.of(context).matchedLocation;
    if (consultationId != null) {
      context.push('$location/consultation/$consultationId');
    } else if (destinataireId != null) {
      context.push('$location/direct/$destinataireId');
    }
  }

  @override
  Widget build(BuildContext context) {
    final conversationsAsync = ref.watch(conversationProvider);
    final contactsAsync = ref.watch(contactsDisponiblesProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Text(
          'Messages',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.textPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
            onPressed: () => ref.read(conversationProvider.notifier).refresh(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 2,
          labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14),
          unselectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 14),
          tabs: const [
            Tab(text: 'Discussions'),
            Tab(text: 'Contacts'),
          ],
        ),
      ),
      body: Column(
        children: [
          // ── Barre de recherche ─────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFFF2F2F7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _search = v.toLowerCase()),
                style: GoogleFonts.poppins(fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Rechercher…',
                  hintStyle: GoogleFonts.poppins(
                      color: AppColors.textHint, fontSize: 14),
                  prefixIcon: const Icon(Icons.search,
                      color: AppColors.textHint, size: 20),
                  suffixIcon: _search.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close,
                              size: 18, color: AppColors.textHint),
                          onPressed: () {
                            _searchCtrl.clear();
                            setState(() => _search = '');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
          ),

          // ── Tabs ───────────────────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // ── Onglet Discussions ─────────────────────────────────
                conversationsAsync.when(
                  loading: () => const Center(
                      child: CircularProgressIndicator()),
                  error: (e, _) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            color: AppColors.error, size: 40),
                        const SizedBox(height: 12),
                        Text('Erreur: $e',
                            style: GoogleFonts.poppins(
                                color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => ref
                              .read(conversationProvider.notifier)
                              .refresh(),
                          child: const Text('Réessayer'),
                        ),
                      ],
                    ),
                  ),
                  data: (conversations) {
                    final filtered = conversations
                        .where((c) => _search.isEmpty ||
                            c.titre.toLowerCase().contains(_search))
                        .toList();

                    if (filtered.isEmpty) {
                      return _EmptyState(
                        icon: Icons.chat_bubble_outline_rounded,
                        title: 'Aucune discussion',
                        subtitle: _search.isEmpty
                            ? 'Allez dans l\'onglet Contacts\npour démarrer une conversation.'
                            : 'Aucun résultat pour "$_search"',
                      );
                    }

                    return ListView.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const Divider(
                          height: 1, indent: 76, endIndent: 16),
                      itemBuilder: (context, i) {
                        final conv = filtered[i];
                        return _ConversationTile(
                          initials: _initials(conv.titre),
                          nom: conv.titre,
                          dernierMessage: conv.dernierMessage.isNotEmpty
                              ? conv.dernierMessage
                              : 'Démarrer la conversation',
                          heure: _formatDate(conv.dateDernierMessage),
                          nonLus: conv.nonLus,
                          estCloture: conv.estCloture,
                          couleur: AppColors.primary,
                          onTap: () => _openChat(
                            context,
                            consultationId: conv.consultationId,
                            destinataireId: conv.destinataireId,
                            nom: conv.titre,
                          ),
                        );
                      },
                    );
                  },
                ),

                // ── Onglet Contacts ────────────────────────────────────
                contactsAsync.when(
                  loading: () => const Center(
                      child: CircularProgressIndicator()),
                  error: (e, _) => Center(
                    child: Text('Erreur: $e',
                        style: GoogleFonts.poppins(
                            color: AppColors.textSecondary)),
                  ),
                  data: (contacts) {
                    final filtered = contacts
                        .where((c) =>
                            _search.isEmpty ||
                            c.nom.toLowerCase().contains(_search) ||
                            (c.hopitalNom ?? '')
                                .toLowerCase()
                                .contains(_search))
                        .toList();

                    if (filtered.isEmpty) {
                      return _EmptyState(
                        icon: Icons.people_outline_rounded,
                        title: 'Aucun contact',
                        subtitle: _search.isEmpty
                            ? 'Aucun contact disponible\npour votre rôle.'
                            : 'Aucun résultat pour "$_search"',
                      );
                    }

                    return ListView.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const Divider(
                          height: 1, indent: 76, endIndent: 16),
                      itemBuilder: (context, i) {
                        final contact = filtered[i];
                        final color = _roleColor(contact.role);
                        return _ContactTile(
                          initials: _initials(contact.nom),
                          nom: contact.nom,
                          roleLabel: _roleLabel(contact.role),
                          hopitalNom: contact.hopitalNom,
                          couleur: color,
                          onTap: () => _openChat(
                            context,
                            destinataireId: contact.id,
                            nom: contact.nom,
                          ),
                        );
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Tuile conversation ────────────────────────────────────────────────────────

class _ConversationTile extends StatelessWidget {
  final String initials;
  final String nom;
  final String dernierMessage;
  final String heure;
  final int nonLus;
  final bool estCloture;
  final Color couleur;
  final VoidCallback onTap;

  const _ConversationTile({
    required this.initials,
    required this.nom,
    required this.dernierMessage,
    required this.heure,
    required this.nonLus,
    required this.estCloture,
    required this.couleur,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: couleur.withValues(alpha: 0.15),
                  child: Text(
                    initials,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: couleur,
                    ),
                  ),
                ),
                if (!estCloture)
                  Positioned(
                    bottom: 1,
                    right: 1,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            // Contenu
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          nom,
                          style: GoogleFonts.poppins(
                            fontWeight: nonLus > 0
                                ? FontWeight.w700
                                : FontWeight.w600,
                            fontSize: 15,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        heure,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: nonLus > 0
                              ? AppColors.primary
                              : AppColors.textHint,
                          fontWeight: nonLus > 0
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      if (estCloture) ...[
                        const Icon(Icons.lock_outline,
                            size: 12, color: Colors.orange),
                        const SizedBox(width: 4),
                      ],
                      Expanded(
                        child: Text(
                          dernierMessage,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: nonLus > 0
                                ? AppColors.textPrimary
                                : AppColors.textSecondary,
                            fontWeight: nonLus > 0
                                ? FontWeight.w500
                                : FontWeight.w400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (nonLus > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$nonLus',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Tuile contact ─────────────────────────────────────────────────────────────

class _ContactTile extends StatelessWidget {
  final String initials;
  final String nom;
  final String roleLabel;
  final String? hopitalNom;
  final Color couleur;
  final VoidCallback onTap;

  const _ContactTile({
    required this.initials,
    required this.nom,
    required this.roleLabel,
    this.hopitalNom,
    required this.couleur,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 26,
              backgroundColor: couleur.withValues(alpha: 0.15),
              child: Text(
                initials,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: couleur,
                ),
              ),
            ),
            const SizedBox(width: 14),
            // Infos
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nom,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: couleur.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          roleLabel,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: couleur,
                          ),
                        ),
                      ),
                      if (hopitalNom != null) ...[
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            hopitalNom!,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: AppColors.textHint,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            // Bouton message
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: couleur.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.chat_bubble_outline_rounded,
                  size: 18, color: couleur),
            ),
          ],
        ),
      ),
    );
  }
}

// ── État vide ─────────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon,
                  size: 36,
                  color: AppColors.primary.withValues(alpha: 0.5)),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
