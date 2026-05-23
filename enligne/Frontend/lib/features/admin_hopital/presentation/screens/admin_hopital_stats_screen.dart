import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalStatsContent extends ConsumerWidget {
  const AdminHopitalStatsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(adminHopitalDashboardStatsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Statistiques',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.invalidate(adminHopitalDashboardStatsProvider),
          ),
        ],
      ),
      body: statsAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.adminHopital)),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Erreur: $e',
                  style:
                      GoogleFonts.poppins(color: AppColors.textSecondary),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () =>
                    ref.invalidate(adminHopitalDashboardStatsProvider),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (stats) => RefreshIndicator(
          color: AppColors.adminHopital,
          onRefresh: () async =>
              ref.invalidate(adminHopitalDashboardStatsProvider),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Titre section ──────────────────────────────────────
                Text('Vue d\'ensemble',
                    style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 16),

                // ── Grille de stats ────────────────────────────────────
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: [
                    _StatCard(
                      icon: Icons.people,
                      label: 'Médecins',
                      value: '${stats['total_medecins'] ?? 0}',
                      color: AppColors.medecin,
                    ),
                    _StatCard(
                      icon: Icons.medical_services,
                      label: 'Services',
                      value: '${stats['total_services'] ?? 0}',
                      color: AppColors.adminHopital,
                    ),
                    _StatCard(
                      icon: Icons.calendar_today,
                      label: 'Total RDV',
                      value: '${stats['total_rdv'] ?? 0}',
                      color: AppColors.primary,
                    ),
                    _StatCard(
                      icon: Icons.hourglass_empty,
                      label: 'RDV en attente',
                      value: '${stats['rdv_en_attente'] ?? 0}',
                      color: Colors.orange,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Demandes en attente ────────────────────────────────
                if ((stats['demandes_en_attente'] ?? 0) > 0) ...[
                  _AlertBanner(
                    icon: Icons.notifications_active,
                    message:
                        '${stats['demandes_en_attente']} demande(s) de service en attente de validation.',
                    color: Colors.orange,
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Détails RDV ────────────────────────────────────────
                Text('Rendez-vous',
                    style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 12),
                _DetailRow(
                    label: 'Total rendez-vous',
                    value: '${stats['total_rdv'] ?? 0}',
                    icon: Icons.event),
                _DetailRow(
                    label: 'En attente',
                    value: '${stats['rdv_en_attente'] ?? 0}',
                    icon: Icons.pending_actions,
                    valueColor: Colors.orange),
                const SizedBox(height: 24),

                // ── Équipe médicale ────────────────────────────────────
                Text('Équipe médicale',
                    style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 12),
                _DetailRow(
                    label: 'Médecins actifs',
                    value: '${stats['total_medecins'] ?? 0}',
                    icon: Icons.person),
                _DetailRow(
                    label: 'Services proposés',
                    value: '${stats['total_services'] ?? 0}',
                    icon: Icons.local_hospital),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary)),
              Text(label,
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.adminHopital),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label,
                style: GoogleFonts.poppins(
                    fontSize: 14, color: AppColors.textPrimary)),
          ),
          Text(value,
              style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: valueColor ?? AppColors.textPrimary)),
        ],
      ),
    );
  }
}

class _AlertBanner extends StatelessWidget {
  final IconData icon;
  final String message;
  final Color color;

  const _AlertBanner(
      {required this.icon, required this.message, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(message,
                style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: color,
                    fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
