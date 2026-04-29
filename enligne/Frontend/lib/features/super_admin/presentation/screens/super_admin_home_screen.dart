import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/premium_error_view.dart';
import '../../../../core/widgets/premium_loading_view.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminHomeContent extends ConsumerWidget {
  const SuperAdminHomeContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return statsAsync.when(
      loading: () => const PremiumLoadingView(message: 'Chargement du tableau de bord...'),
      error: (e, _) => PremiumErrorView(
        message: 'Erreur: $e',
        onRetry: () => ref.read(dashboardStatsProvider.notifier).refresh(),
      ),
      data: (stats) => RefreshIndicator(
        onRefresh: () => ref.read(dashboardStatsProvider.notifier).refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Welcome Section ──
              _buildWelcomeSection(),
              const SizedBox(height: 24),
              
              // ... rest of the column content ...

                // ── Quick Actions ──
                _buildQuickActions(context),
                const SizedBox(height: 28),

                // ── Stats Grid ──
                Text(
                  'Statistiques',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 14,
                  childAspectRatio: 1.15,
                  children: [
                    _StatCard(
                      icon: Icons.local_hospital,
                      value: stats.totalHopitaux,
                      label: 'Hôpitaux',
                      color: AppColors.primary,
                    ),
                    _StatCard(
                      icon: Icons.medical_services,
                      value: stats.totalMedecins,
                      label: 'Médecins',
                      color: AppColors.medecin,
                    ),
                    _StatCard(
                      icon: Icons.people,
                      value: stats.totalPatients,
                      label: 'Patients',
                      color: AppColors.patient,
                    ),
                    _StatCard(
                      icon: Icons.calendar_month,
                      value: stats.totalRendezvous,
                      label: 'RDV Total',
                      color: AppColors.secondary,
                    ),
                    _StatCard(
                      icon: Icons.today,
                      value: stats.rdvAujourdhui,
                      label: 'RDV Aujourd\'hui',
                      color: AppColors.warning,
                    ),
                    _StatCard(
                      icon: Icons.date_range,
                      value: stats.rdvSemaine,
                      label: 'RDV Semaine',
                      color: AppColors.info,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
    );
  }

  Widget _buildWelcomeSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.superAdmin, Color(0xFF9C27B0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.superAdmin.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tableau de bord administrateur',
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Gestion globale de la plateforme',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _QuickActionCard(
            icon: Icons.local_hospital,
            label: 'Hôpitaux',
            color: AppColors.primary,
            onTap: () => context.go('/super-admin/hopitaux'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickActionCard(
            icon: Icons.people,
            label: 'Utilisateurs',
            color: AppColors.medecin,
            onTap: () => context.go('/super-admin/users'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickActionCard(
            icon: Icons.settings,
            label: 'Paramètres',
            color: AppColors.secondary,
            onTap: () => context.go('/super-admin/settings'),
          ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.10),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final int value;
  final String label;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.10),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 12),
          Text(
            '$value',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
