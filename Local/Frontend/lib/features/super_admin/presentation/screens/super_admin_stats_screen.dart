import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/premium_error_view.dart';
import '../../../../core/widgets/premium_loading_view.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminStatsContent extends ConsumerWidget {
  const SuperAdminStatsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(statsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Tableau de Bord', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(statsProvider.notifier).refresh(),
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () => _exportStats(context, ref),
          ),
        ],
      ),
      body: statsAsync.when(
        loading: () => const PremiumLoadingView(message: 'Analyse des données en cours...'),
        error: (e, _) => PremiumErrorView(
          message: 'Impossible de charger les statistiques : $e',
          onRetry: () => ref.read(statsProvider.notifier).refresh(),
        ),
        data: (stats) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cartes de statistiques principales
              _buildMainStatsCards(context, stats),
              const SizedBox(height: 24),

              // Graphiques
              _buildChartsSection(context, stats),
              const SizedBox(height: 24),

              // Activité récente
              _buildRecentActivity(context, stats),
              const SizedBox(height: 24),

              // Performance système
              _buildSystemPerformance(context, stats),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainStatsCards(BuildContext context, dynamic stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Statistiques Générales',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.4,
          children: [
            _buildStatCard(
              'Utilisateurs Actifs',
              '${stats['activeUsers'] ?? 0}',
              Icons.people,
              AppColors.primary,
              '+12% cette semaine',
            ),
            _buildStatCard(
              'Hôpitaux',
              '${stats['total_hopitaux'] ?? 0}',
              Icons.local_hospital,
              AppColors.adminHopital,
              'Actifs',
            ),
            _buildStatCard(
              'Médecins',
              '${stats['total_medecins'] ?? 0}',
              Icons.medical_services,
              AppColors.medecin,
              'Inscrits',
            ),
            _buildStatCard(
              'Services',
              '${stats['total_services'] ?? 0}',
              Icons.miscellaneous_services,
              AppColors.primary,
              'Globaux',
            ),
            _buildStatCard(
              'Rendez-vous',
              '${stats['total_rdv'] ?? 0}',
              Icons.calendar_today,
              AppColors.success,
              'Total',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, String change) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  change,
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: AppColors.success,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartsSection(BuildContext context, dynamic stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tendance d\'Utilisation',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Connessions par jour',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '7 derniers jours',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Graphique simulé
              SizedBox(
                height: 200,
                child: _buildSimpleChart(stats['dailyLogins'] ?? []),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSimpleChart(List<dynamic> data) {
    if (data.isEmpty) {
      return Center(
        child: Text(
          'Aucune donnée disponible',
          style: GoogleFonts.poppins(color: AppColors.textSecondary),
        ),
      );
    }

    final maxValue = data.map((d) => d['count'] as int).reduce((a, b) => a > b ? a : b).toDouble();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: data.map((d) {
        final value = (d['count'] as int).toDouble();
        final height = maxValue > 0 ? (value / maxValue) * 180 : 0;
        
        return Column(
          children: [
            Container(
              width: 30,
              height: height.toDouble(),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              d['day'].toString().substring(0, 3),
              style: GoogleFonts.poppins(
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              d['count'].toString(),
              style: GoogleFonts.poppins(
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildRecentActivity(BuildContext context, dynamic stats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Activité Récente',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: (stats['recentActivity'] as List?)?.length ?? 0,
            itemBuilder: (context, index) {
              final activity = (stats['recentActivity'] as List)[index];
              return ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _getActivityColor(activity['type']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    _getActivityIcon(activity['type']),
                    color: _getActivityColor(activity['type']),
                    size: 20,
                  ),
                ),
                title: Text(
                  activity['description'] ?? 'Activité inconnue',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w500),
                ),
                subtitle: Text(
                  activity['timestamp'] ?? '',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getActivityColor(activity['type']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    activity['type'] ?? '',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: _getActivityColor(activity['type']),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSystemPerformance(BuildContext context, dynamic stats) {
    final performance = stats['systemPerformance'] as Map<String, dynamic>? ?? {};
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Performance Système',
          style: GoogleFonts.poppins(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildPerformanceItem('CPU', (performance['cpu'] as num?)?.toDouble() ?? 0.0),
              const SizedBox(height: 16),
              _buildPerformanceItem('Mémoire', (performance['memory'] as num?)?.toDouble() ?? 0.0),
              const SizedBox(height: 16),
              _buildPerformanceItem('Stockage', (performance['storage'] as num?)?.toDouble() ?? 0.0),
              const SizedBox(height: 16),
              _buildPerformanceItem('Réseau', (performance['network'] as num?)?.toDouble() ?? 0.0),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceItem(String label, double value) {
    Color color = AppColors.success;
    if (value > 80) {
      color = AppColors.error;
    } else if (value > 60) {
      color = AppColors.warning;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: GoogleFonts.poppins(fontWeight: FontWeight.w500),
            ),
            Text(
              '${value.toStringAsFixed(1)}%',
              style: GoogleFonts.poppins(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: value / 100,
          backgroundColor: AppColors.background,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ],
    );
  }

  Color _getActivityColor(String? type) {
    switch (type) {
      case 'login':
        return AppColors.success;
      case 'register':
        return AppColors.primary;
      case 'appointment':
        return AppColors.info;
      case 'message':
        return AppColors.patient;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _getActivityIcon(String? type) {
    switch (type) {
      case 'login':
        return Icons.login;
      case 'register':
        return Icons.person_add;
      case 'appointment':
        return Icons.calendar_today;
      case 'message':
        return Icons.chat;
      default:
        return Icons.info;
    }
  }

  void _exportStats(BuildContext context, WidgetRef ref) {
    // TODO: Implémenter l'export des statistiques
    Helpers.showSnackBar(context, 'Export des statistiques bientôt disponible');
  }
}
