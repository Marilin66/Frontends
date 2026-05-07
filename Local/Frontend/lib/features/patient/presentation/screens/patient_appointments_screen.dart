import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/utils/helpers.dart';
import 'package:hopitel_app/core/widgets/premium_error_view.dart';
import 'package:hopitel_app/core/widgets/premium_loading_view.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/patient/presentation/providers/patient_provider.dart';

import 'package:hopitel_app/features/super_admin/data/models/service_model.dart';

final appointmentStatusFilterProvider = NotifierProvider<AppointmentStatusFilterNotifier, String?>(
  AppointmentStatusFilterNotifier.new,
);

class AppointmentStatusFilterNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  void update(String? val) => state = val;
}

final appointmentServiceFilterProvider = NotifierProvider<AppointmentServiceFilterNotifier, int?>(
  AppointmentServiceFilterNotifier.new,
);

class AppointmentServiceFilterNotifier extends Notifier<int?> {
  @override
  int? build() => null;
  void update(int? val) => state = val;
}

class PatientAppointmentsContent extends ConsumerWidget {
  const PatientAppointmentsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rdvAsync = ref.watch(patientRendezvousProvider);
    final servicesAsync = ref.watch(allServicesProvider);
    final selectedStatut = ref.watch(appointmentStatusFilterProvider);
    final selectedService = ref.watch(appointmentServiceFilterProvider);

    final isDesktop = MediaQuery.of(context).size.width >= 1100;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: isDesktop
          ? null
          : AppBar(
              leading: UniversalBackButton(),
              title: Text('Mes Rendez-vous', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              centerTitle: true,
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.primary,
              surfaceTintColor: Colors.transparent,
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    ref.read(appointmentStatusFilterProvider.notifier).update(null);
                    ref.read(appointmentServiceFilterProvider.notifier).update(null);
                    ref.read(patientRendezvousProvider.notifier).refresh();
                  },
                ),
              ],
            ),
      body: Column(
        children: [
          // ── Barres de filtres ──
          _buildFilters(context, ref, servicesAsync, selectedStatut, selectedService),

          Expanded(
            child: rdvAsync.when(
              loading: () => const PremiumLoadingView(message: 'Chargement de vos rendez-vous...'),
              error: (e, _) => PremiumErrorView(
                message: 'Erreur: $e',
                onRetry: () => ref.read(patientRendezvousProvider.notifier).refresh(),
              ),
              data: (rdvs) {
                if (rdvs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 64, color: AppColors.textHint),
                        const SizedBox(height: 12),
                        const Text('Aucun rendez-vous'),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () => ref.read(patientRendezvousProvider.notifier).refresh(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: rdvs.length,
                    itemBuilder: (context, index) {
                      final rdv = rdvs[index];
                      final statusColor = Helpers.getStatusColor(rdv.statut);
                      final statusLabel = Helpers.getStatusLabel(rdv.statut);
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                          border: Border.all(color: statusColor.withValues(alpha: 0.1), width: 1),
                        ),
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: statusColor.withValues(alpha: 0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(Icons.event_note, color: statusColor, size: 24),
                                  ),
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
                                                'Dr. ${rdv.medecinNom} (${rdv.medecinSpecialite})',
                                                style: GoogleFonts.poppins(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: statusColor.withValues(alpha: 0.1),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                statusLabel,
                                                style: GoogleFonts.poppins(
                                                  fontSize: 11,
                                                  color: statusColor,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                                            const SizedBox(width: 4),
                                            Text(
                                              Helpers.formatDateTime(DateTime.parse(rdv.dateHeure)),
                                              style: GoogleFonts.poppins(
                                                fontSize: 13,
                                                color: AppColors.textSecondary,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(Icons.info_outline, size: 14, color: AppColors.textSecondary),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                rdv.motif,
                                                style: GoogleFonts.poppins(
                                                  fontSize: 13,
                                                  color: AppColors.textSecondary,
                                                  fontStyle: FontStyle.italic,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (rdv.statut == 'annule' && rdv.commentaireAnnulation.isNotEmpty) ...[
                                          const SizedBox(height: 12),
                                          Container(
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(
                                              color: AppColors.error.withValues(alpha: 0.05),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'Motif de refus/annulation :',
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppColors.error,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  rdv.commentaireAnnulation,
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 12,
                                                    color: AppColors.error.withValues(alpha: 0.8),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // ── Bouton Pré-consultation ──────────────────
                            // Visible pour les RDV planifiés ou confirmés (pas encore terminé/annulé)
                            if ((rdv.statut == 'planifie' || rdv.statut == 'confirme') &&
                                rdv.preEnregistrement == null)
                              Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: Colors.teal.withValues(alpha: 0.06),
                                  borderRadius: rdv.hasConsultation && rdv.consultationId != null
                                      ? BorderRadius.zero
                                      : const BorderRadius.only(
                                          bottomLeft: Radius.circular(16),
                                          bottomRight: Radius.circular(16),
                                        ),
                                ),
                                child: TextButton.icon(
                                  onPressed: () => context.go(
                                    '/patient/rdv/${rdv.id}/intake?medecin=${Uri.encodeComponent(rdv.medecinNom)}',
                                  ),
                                  icon: const Icon(Icons.edit_note_rounded, size: 18),
                                  label: Text(
                                    'Remplir la fiche de pré-consultation',
                                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.teal,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                            if ((rdv.statut == 'planifie' || rdv.statut == 'confirme') &&
                                rdv.preEnregistrement != null)
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.teal.withValues(alpha: 0.05),
                                  borderRadius: rdv.hasConsultation && rdv.consultationId != null
                                      ? BorderRadius.zero
                                      : const BorderRadius.only(
                                          bottomLeft: Radius.circular(16),
                                          bottomRight: Radius.circular(16),
                                        ),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.check_circle_rounded, size: 16, color: Colors.teal),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'Fiche de pré-consultation envoyée',
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          color: Colors.teal,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: () => context.go(
                                        '/patient/rdv/${rdv.id}/intake?medecin=${Uri.encodeComponent(rdv.medecinNom)}',
                                      ),
                                      style: TextButton.styleFrom(
                                        foregroundColor: Colors.teal,
                                        padding: EdgeInsets.zero,
                                        minimumSize: Size.zero,
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                      child: Text('Modifier', style: GoogleFonts.poppins(fontSize: 11)),
                                    ),
                                  ],
                                ),
                              ),
                            // ── Bouton Message Direct (RDV confirmé, pas encore de consultation) ──
                            if (rdv.statut == 'confirme' && !rdv.hasConsultation)
                              Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.04),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                ),
                                child: TextButton.icon(
                                  onPressed: () => context.go('/patient/messagerie/direct/${rdv.medecin}'),
                                  icon: const Icon(Icons.chat_bubble_outline, size: 18),
                                  label: Text(
                                    'Contacter Dr. ${rdv.medecinNom}',
                                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: AppColors.primary,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                            // ── Bouton Conversation (consultation créée) ───────────────────────
                            if (rdv.hasConsultation && rdv.consultationId != null)
                              Container(
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.05),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                ),
                                child: TextButton.icon(
                                  onPressed: () => context.go('/messagerie/consultation/${rdv.consultationId}'),
                                  icon: const Icon(Icons.chat_bubble_outline, size: 18),
                                  label: Text(
                                    'Accéder à la conversation',
                                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: AppColors.primary,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<ServiceModel>> servicesAsync,
    String? selectedStatut,
    int? selectedServiceId,
  ) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          // Filtre par statut (Chips)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _StatusChip(
                  label: 'Tous',
                  isSelected: selectedStatut == null,
                  onSelected: () => _updateFilters(ref, null, selectedServiceId),
                ),
                const SizedBox(width: 8),
                _StatusChip(
                  label: 'En attente',
                  isSelected: selectedStatut == 'en_attente',
                  onSelected: () => _updateFilters(ref, 'en_attente', selectedServiceId),
                ),
                const SizedBox(width: 8),
                _StatusChip(
                  label: 'Confirmés',
                  isSelected: selectedStatut == 'confirme',
                  onSelected: () => _updateFilters(ref, 'confirme', selectedServiceId),
                ),
                const SizedBox(width: 8),
                _StatusChip(
                  label: 'Terminés',
                  isSelected: selectedStatut == 'termine',
                  onSelected: () => _updateFilters(ref, 'termine', selectedServiceId),
                ),
                const SizedBox(width: 8),
                _StatusChip(
                  label: 'Annulés',
                  isSelected: selectedStatut == 'annule',
                  onSelected: () => _updateFilters(ref, 'annule', selectedServiceId),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Filtre par service (Dropdown)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: servicesAsync.when(
              data: (services) => DropdownButtonFormField<int?>(
                initialValue: selectedServiceId,
                decoration: InputDecoration(
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.filter_list_rounded, size: 20),
                  hintText: 'Filtrer par service',
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Tous les services')),
                  ...services.map((s) => DropdownMenuItem(value: s.id, child: Text(s.nom))),
                ],
                onChanged: (val) => _updateFilters(ref, selectedStatut, val),
              ),
              loading: () => const SizedBox(height: 40, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
        ],
      ),
    );
  }

  void _updateFilters(WidgetRef ref, String? statut, int? serviceId) {
    ref.read(appointmentStatusFilterProvider.notifier).update(statut);
    ref.read(appointmentServiceFilterProvider.notifier).update(serviceId);
    ref.read(patientRendezvousProvider.notifier).filter(statut: statut, serviceId: serviceId);
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onSelected;

  const _StatusChip({required this.label, required this.isSelected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label, style: GoogleFonts.poppins(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      selected: isSelected,
      onSelected: (_) => onSelected(),
      selectedColor: AppColors.primary.withValues(alpha: 0.2),
      labelStyle: TextStyle(color: isSelected ? AppColors.primary : AppColors.textSecondary),
    );
  }
}
