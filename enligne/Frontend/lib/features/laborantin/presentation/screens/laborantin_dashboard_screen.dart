import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/theme/app_text_styles.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_forms.dart';

class LaborantinDashboardScreen extends ConsumerWidget {
  const LaborantinDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingAsync = ref.watch(laborantinPendingAnalysesProvider);
    final finishedAsync = ref.watch(laborantinFinishedAnalysesProvider);

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Résumé de l\'activité',
                    style: AppTextStyles.h3,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'En cours',
                          count: pendingAsync.when(
                            data: (list) => list.length.toString(),
                            loading: () => '...',
                            error: (error, stackTrace) => '!',
                          ),
                          icon: Icons.hourglass_empty_rounded,
                          color: AppColors.warning,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _StatCard(
                          title: 'Terminées',
                          count: finishedAsync.when(
                            data: (list) => list.length.toString(),
                            loading: () => '...',
                            error: (error, stackTrace) => '!',
                          ),
                          icon: Icons.check_circle_outline_rounded,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  Text(
                    'Actions rapides',
                    style: AppTextStyles.h3,
                  ),
                  const SizedBox(height: 16),
                  _QuickActionCard(
                    title: 'Inscrire un nouveau patient',
                    subtitle: 'Lancer une nouvelle demande d\'analyse',
                    icon: Icons.person_add_rounded,
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) => const LaborantinManualInscriptionSheet(),
                      );
                    },
                  ),
                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Dernières demandes', style: AppTextStyles.h3),
                      TextButton(
                        onPressed: () {
                          // Par défaut, l'utilisateur peut changer d'onglet via la barre de navigation
                        },
                        child: const Text('Voir tout'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  pendingAsync.when(
                    data: (list) => list.isEmpty
                        ? const Center(child: Padding(
                            padding: EdgeInsets.all(20),
                            child: Text('Aucune demande en cours'),
                          ))
                        : Column(
                            children: list.take(3).map((d) => _SmallAnalysisTile(d: d)).toList(),
                          ),
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Erreur: $e'),
                  ),
                  const SizedBox(height: 30),
                  // ── Liens rapides ──────────────────────────────────
                  Text('Accès rapide', style: AppTextStyles.h3),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickLinkCard(
                          icon: Icons.science_outlined,
                          label: 'Analyses en cours',
                          color: AppColors.warning,
                          count: pendingAsync.value?.length ?? 0,
                          onTap: () {
                            // Navigation via la barre du bas (onglet 1)
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _QuickLinkCard(
                          icon: Icons.history_rounded,
                          label: 'Archives',
                          color: AppColors.success,
                          count: finishedAsync.value?.length ?? 0,
                          onTap: () {
                            // Navigation via la barre du bas (onglet 2)
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _QuickLinkCard(
                          icon: Icons.chat_bubble_outline,
                          label: 'Messages',
                          color: AppColors.primary,
                          count: null,
                          onTap: () {
                            // Navigation via la barre du bas (onglet 3)
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String count;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.count,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(count, style: AppTextStyles.h2.copyWith(color: AppColors.textPrimary)),
          Text(title, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text(subtitle, style: AppTextStyles.bodySmall.copyWith(color: Colors.white.withValues(alpha: 0.9))),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class _SmallAnalysisTile extends StatelessWidget {
  final dynamic d;
  const _SmallAnalysisTile({required this.d});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: Text(d.patientNom.isNotEmpty ? d.patientNom[0] : '?', style: TextStyle(color: AppColors.primary)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${d.patientPrenom} ${d.patientNom}', style: AppTextStyles.bodyLarge),
                Text(d.typeAnalyse, style: AppTextStyles.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickLinkCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final int? count;
  final VoidCallback onTap;

  const _QuickLinkCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.count,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (count != null) ...[
              const SizedBox(height: 4),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
