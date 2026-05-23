import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/models/rendezvous_medecin_model.dart';
import '../providers/medecin_provider.dart';

class MedecinHomeContent extends ConsumerWidget {
  const MedecinHomeContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final rdvAsync = ref.watch(medecinRendezvousProvider);


    return RefreshIndicator(
        onRefresh: () =>
            ref.read(medecinRendezvousProvider.notifier).refresh(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Welcome Section ──────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.medecin, Color(0xFF1E88E5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.medecin.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bonjour, Dr. ${user?.firstName ?? ''} !',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Bienvenue sur votre espace médecin',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ── Quick Actions ────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.calendar_month,
                    label: 'Mon Agenda',
                    color: AppColors.medecin,
                    onTap: () => context.go('/medecin/agenda'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.people,
                    label: 'Mes Patients',
                    color: AppColors.primary,
                    onTap: () => context.go('/medecin/patients'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.message_outlined,
                    label: 'Mes Messages',
                    color: AppColors.secondary,
                    onTap: () => context.go('/medecin/messages'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.medical_services_outlined,
                    label: 'Consultations',
                    color: Colors.teal,
                    onTap: () => context.go('/medecin/consultations'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.science_outlined,
                    label: 'Résultats',
                    color: Colors.purple,
                    onTap: () => context.go('/medecin/result-patient'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.person_outline,
                    label: 'Mon Profil',
                    color: AppColors.textSecondary,
                    onTap: () => context.go('/medecin/profile'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Rendez-vous du jour ──────────────────────────────────
            _SectionHeader(
              title: 'Rendez-vous du jour',
              onSeeAll: () => context.go('/medecin/agenda'),
            ),
            const SizedBox(height: 8),
            rdvAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Erreur : $e',
                    style: GoogleFonts.poppins(color: AppColors.error)),
              ),
              data: (rdvs) {
                final now = DateTime.now();
                final todayRdvs = rdvs.where((r) =>
                    r.dateHeure.year == now.year &&
                    r.dateHeure.month == now.month &&
                    r.dateHeure.day == now.day).toList()
                  ..sort((a, b) => a.dateHeure.compareTo(b.dateHeure));

                if (todayRdvs.isEmpty) {
                  return _EmptyState(
                    icon: Icons.event_available,
                    message: 'Aucun rendez-vous aujourd\'hui',
                  );
                }

                return Column(
                  children: todayRdvs
                      .take(5)
                      .map((rdv) => _RendezVousMedecinCard(rdv: rdv))
                      .toList(),
                );
              },
            ),

            const SizedBox(height: 24),

            // ── Dernières consultations ──────────────────────────────
            _SectionHeader(
              title: 'Dernières consultations',
              onSeeAll: () => context.go('/medecin/consultations'),
            ),
            const SizedBox(height: 8),
            rdvAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, _) => const SizedBox.shrink(),
              data: (rdvs) {
                final consultations = rdvs
                    .where((r) => r.statut == 'termine')
                    .toList()
                  ..sort((a, b) => b.dateHeure.compareTo(a.dateHeure));

                if (consultations.isEmpty) {
                  return _EmptyState(
                    icon: Icons.medical_services_outlined,
                    message: 'Aucune consultation terminée',
                  );
                }

                return Column(
                  children: consultations
                      .take(3)
                      .map((rdv) => _ConsultationCard(rdv: rdv))
                      .toList(),
                );
              },
            ),

            const SizedBox(height: 16),
          ],
        ),
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Private widgets
// ═══════════════════════════════════════════════════════════════════════════════

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.onSeeAll});

  final String title;
  final VoidCallback onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        TextButton(
          onPressed: onSeeAll,
          child: Text(
            'Voir tout',
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.medecin,
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          Icon(icon, size: 48, color: AppColors.textHint),
          const SizedBox(height: 8),
          Text(
            message,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AnimatedTap(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.15)),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RendezVousMedecinCard extends ConsumerWidget {
  const _RendezVousMedecinCard({required this.rdv});

  final RendezVousMedecinModel rdv;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = Helpers.getStatusColor(rdv.statut);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.withValues(alpha: 0.15)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.medecin.withValues(alpha: 0.1),
                  child: Text(
                    _initials(rdv.patientNom),
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.medecin,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        rdv.patientNom,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.access_time,
                              size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            Helpers.formatTime(rdv.dateHeure),
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    Helpers.getStatusLabel(rdv.statut),
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            if (rdv.motif.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.notes, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      rdv.motif,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
            if (rdv.statut == 'en_attente') ...[
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton.icon(
                    onPressed: () =>
                        _showRefuseDialog(context, ref, rdv.id),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Refuser'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      textStyle: GoogleFonts.poppins(
                          fontSize: 12, fontWeight: FontWeight.w600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () async {
                      final ok = await ref
                          .read(medecinRendezvousProvider.notifier)
                          .confirmerRendezvous(rdv.id);
                      if (context.mounted) {
                        Helpers.showSnackBar(
                          context,
                          ok
                              ? 'Rendez-vous confirmé'
                              : 'Erreur lors de la confirmation',
                          isError: !ok,
                        );
                      }
                    },
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Confirmer'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.success,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      textStyle: GoogleFonts.poppins(
                          fontSize: 12, fontWeight: FontWeight.w600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
            if (rdv.statut == 'confirme') ...[
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  FilledButton.icon(
                    onPressed: () async {
                      final consultationId = await ref
                          .read(medecinRendezvousProvider.notifier)
                          .terminerRendezvous(rdv.id);
                      if (context.mounted) {
                        Helpers.showSnackBar(
                          context,
                          consultationId != null
                              ? 'Consultation créée'
                              : 'Erreur lors de la clôture',
                          isError: consultationId == null,
                        );
                      }
                    },
                    icon: const Icon(Icons.check_circle_outline, size: 16),
                    label: const Text('Terminer'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.teal,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      textStyle: GoogleFonts.poppins(
                          fontSize: 12, fontWeight: FontWeight.w600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  void _showRefuseDialog(BuildContext context, WidgetRef ref, int id) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Refuser le rendez-vous',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Motif du refus…',
            hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () async {
              final motif = controller.text.trim();
              if (motif.isEmpty) return;
              Navigator.pop(ctx);
              final ok = await ref
                  .read(medecinRendezvousProvider.notifier)
                  .refuserRendezvous(id, motif);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  ok ? 'Rendez-vous refusé' : 'Erreur lors du refus',
                  isError: !ok,
                );
              }
            },
            style:
                FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Refuser'),
          ),
        ],
      ),
    );
  }
}

class _ConsultationCard extends StatelessWidget {
  const _ConsultationCard({required this.rdv});

  final RendezVousMedecinModel rdv;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.success.withValues(alpha: 0.2)),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: CircleAvatar(
          backgroundColor: AppColors.success.withValues(alpha: 0.1),
          child: const Icon(Icons.check_circle_outline,
              color: AppColors.success, size: 22),
        ),
        title: Text(
          rdv.patientNom,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          '${Helpers.formatDate(rdv.dateHeure)} • ${rdv.motif}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        trailing: Icon(Icons.chevron_right, color: AppColors.textHint),
      ),
    );
  }
}
