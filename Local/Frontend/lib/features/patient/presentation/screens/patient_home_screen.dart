import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/shimmer_loading.dart';
import '../../../../core/widgets/fluid_card.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/patient_provider.dart';
import '../../data/models/rendezvous_model.dart';
import '../../data/models/resultat_model.dart';

class PatientHomeContent extends ConsumerWidget {
  const PatientHomeContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final rdvAsync = ref.watch(patientRendezvousProvider);
    final resultatsAsync = ref.watch(patientResultatsProvider);
    final firstName = authState.user?.firstName ?? 'Patient';


    return RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            ref.read(patientRendezvousProvider.notifier).refresh(),
            ref.read(patientResultatsProvider.notifier).refresh(),
          ]);
        },
        child: ListView(
          padding: const EdgeInsets.only(top: 8, bottom: 24),
          physics: const BouncingScrollPhysics(),
          children: [
            // ── Hello Section ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bonjour, $firstName 👋',
                    style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Comment pouvons-nous vous aider aujourd\'hui ?',
                    style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── "Comment ça marche ?" Section ──
            _buildHowItWorks(),
            const SizedBox(height: 32),

            // ── Quick Actions ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildSectionHeader('Actions rapides'),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildQuickActions(context),
            ),
            const SizedBox(height: 32),

            // ── Prochains rendez-vous ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildSectionHeaderWithAction(
                'Prochains rendez-vous',
                onTap: () => context.go('/patient/appointments'),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: rdvAsync.when(
                loading: () => const ShimmerList(itemCount: 2, itemHeight: 80),
                error: (e, _) => _buildErrorCard('Impossible de charger les rendez-vous'),
                data: (rdvs) {
                  if (rdvs.isEmpty) {
                    return _buildEmptyCard(
                      Icons.calendar_today_outlined,
                      'Aucun rendez-vous à venir',
                      'Prenez rendez-vous avec un médecin',
                    );
                  }
                  return Column(
                    children: rdvs
                        .take(2)
                        .map((rdv) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _RendezVousCard(rdv: rdv),
                            ))
                        .toList(),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),

            // ── Derniers résultats ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _buildSectionHeaderWithAction(
                'Derniers résultats d\'analyses',
                onTap: () => context.go('/patient/results'),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: resultatsAsync.when(
                loading: () => const ShimmerList(itemCount: 2, itemHeight: 80),
                error: (e, _) => _buildErrorCard('Impossible de charger les résultats'),
                data: (resultats) {
                  if (resultats.isEmpty) {
                    return _buildEmptyCard(
                      Icons.science_outlined,
                      'Aucun résultat disponible',
                      'Vos rapports apparaîtront ici dès validation',
                    );
                  }
                  return Column(
                    children: resultats
                        .take(2)
                        .map((res) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _ResultatCard(resultat: res),
                            ))
                        .toList(),
                  );
                },
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      );
  }

  Widget _buildHowItWorks() {
    final steps = [
      {'icon': Icons.business_rounded, 'title': '1. Trouvez un hôpital', 'desc': 'Recherchez l\'établissement le plus proche de vous ou par spécialité.'},
      {'icon': Icons.medical_services_outlined, 'title': '2. Choisissez un service', 'desc': 'Sélectionnez le département médical adapté à votre besoin (Pédiatrie, Cardio...).'},
      {'icon': Icons.person_search_outlined, 'title': '3. Sélectionnez un médecin', 'desc': 'Consultez le profil et la disponibilité de votre docteur préféré.'},
      {'icon': Icons.event_available_outlined, 'title': '4. Prenez rendez-vous', 'desc': 'Validez votre créneau en 2 clics et recevez une notification de confirmation.'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: _buildSectionHeader('Comment ça marche ?'),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: steps.length,
            itemBuilder: (context, index) {
              final step = steps[index];
              return Container(
                width: 200,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(step['icon'] as IconData, color: AppColors.primary, size: 28),
                    const SizedBox(height: 8),
                    Text(step['title'] as String, style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Text(
                      step['desc'] as String,
                      style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textSecondary, height: 1.3),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
    );
  }

  Widget _buildSectionHeaderWithAction(String title, {required VoidCallback onTap}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
        ),
        TextButton(
          onPressed: onTap,
          child: Text(
            'Voir tout',
            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.7,
      children: [
        _QuickActionCard(
          icon: Icons.search_rounded,
          label: 'Prendre RDV',
          color: AppColors.primary,
          onTap: () => context.go('/patient/search'),
        ),
        _QuickActionCard(
          icon: Icons.near_me_rounded,
          label: 'À proximité',
          color: AppColors.secondary,
          onTap: () => context.go('/patient/nearby'),
        ),
        _QuickActionCard(
          icon: Icons.calendar_month_outlined,
          label: 'Mes RDV',
          color: AppColors.medecin,
          onTap: () => context.go('/patient/appointments'),
        ),
        _QuickActionCard(
          icon: Icons.science_outlined,
          label: 'Analyses',
          color: AppColors.info,
          onTap: () => context.go('/patient/results'),
        ),
      ],
    );
  }

  Widget _buildErrorCard(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(message, style: GoogleFonts.poppins(color: AppColors.error, fontSize: 13)),
    );
  }

  Widget _buildEmptyCard(IconData icon, String title, String subtitle) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.textHint.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 40, color: AppColors.textHint.withValues(alpha: 0.5)),
          const SizedBox(height: 12),
          Text(title, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text(subtitle, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textHint)),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AnimatedTap(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Flexible(
              child: Text(
                label,
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RendezVousCard extends StatelessWidget {
  final RendezVousModel rdv;
  const _RendezVousCard({required this.rdv});

  @override
  Widget build(BuildContext context) {
    final statusColor = Helpers.getStatusColor(rdv.statut);
    final date = DateTime.tryParse(rdv.dateHeure);
    
    return FluidCard(
      padding: EdgeInsets.zero,
      onTap: () {},
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Container(
          width: 50,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(date != null ? DateFormat('dd', 'fr_FR').format(date) : '?', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
              Text(date != null ? DateFormat('MMM', 'fr_FR').format(date).toUpperCase() : '?', style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary)),
            ],
          ),
        ),
        title: Text(rdv.medecinNom, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(rdv.motif, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.access_time, size: 12, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(date != null ? Helpers.formatTime(date) : '--:--', style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                  child: Text(Helpers.getStatusLabel(rdv.statut), style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultatCard extends StatelessWidget {
  final ResultatModel resultat;
  const _ResultatCard({required this.resultat});

  @override
  Widget build(BuildContext context) {
    return FluidCard(
      padding: EdgeInsets.zero,
      onTap: () {},
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: AppColors.secondary.withValues(alpha: 0.1),
          child: const Icon(Icons.description_outlined, color: AppColors.secondary, size: 20),
        ),
        title: Text(resultat.titre.isNotEmpty ? resultat.titre : 'Analyse médicale', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(resultat.laboratoire, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
      ),
    );
  }
}
