import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalPatientJourneyScreen extends ConsumerWidget {
  final int patientId;
  final String? patientNom;

  const AdminHopitalPatientJourneyScreen({
    super.key,
    required this.patientId,
    this.patientNom,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final parcoursAsync = ref.watch(adminPatientParcoursProvider(patientId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text(patientNom != null ? 'Parcours: $patientNom' : 'Parcours Patient',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.adminHopital),
            onPressed: () => ref.invalidate(adminPatientParcoursProvider(patientId)),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.adminHopital,
        onRefresh: () async => ref.invalidate(adminPatientParcoursProvider(patientId)),
        child: parcoursAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.adminHopital)),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                const SizedBox(height: 12),
                Text('Erreur: $e',
                    style: GoogleFonts.poppins(color: AppColors.textSecondary)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () => ref.invalidate(adminPatientParcoursProvider(patientId)),
                  child: const Text('Réessayer'),
                ),
              ],
            ),
          ),
          data: (data) {
            final parcours = (data['parcours'] as List<dynamic>?) ?? [];
            if (parcours.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.history_outlined,
                        size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('Aucun historique pour ce patient',
                        style: GoogleFonts.poppins(
                            color: AppColors.textSecondary, fontSize: 16)),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: parcours.length,
              itemBuilder: (context, i) {
                final item = parcours[i] as Map<String, dynamic>;
                final type = item['type'] as String? ?? 'Inconnu';
                final dateStr = item['date'] as String? ?? '';
                DateTime? dt;
                try {
                  dt = DateTime.parse(dateStr);
                } catch (_) {}

                final bool isLast = i == parcours.length - 1;

                return IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Timeline column
                      SizedBox(
                        width: 32,
                        child: Column(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: _getColorForType(type).withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(_getIconForType(type),
                                  size: 16, color: _getColorForType(type)),
                            ),
                            if (!isLast)
                              Expanded(
                                child: Container(
                                  width: 2,
                                  color: AppColors.textHint.withValues(alpha: 0.2),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Content column
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_getTitleForType(type),
                                    style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.w600, fontSize: 15)),
                                const SizedBox(height: 4),
                                if (dt != null)
                                  Text(
                                      DateFormat('dd/MM/yyyy à HH:mm', 'fr_FR')
                                          .format(dt),
                                      style: GoogleFonts.poppins(
                                          color: AppColors.textHint, fontSize: 12)),
                                const SizedBox(height: 8),
                                Text(item['details'] as String? ?? 'Pas de détails',
                                    style: GoogleFonts.poppins(
                                        color: AppColors.textSecondary,
                                        fontSize: 13)),
                                if (item['medecin'] != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.person_outline,
                                            size: 14, color: AppColors.adminHopital),
                                        const SizedBox(width: 4),
                                        Text('Par: ${item['medecin']}',
                                            style: GoogleFonts.poppins(
                                                color: AppColors.adminHopital,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Color _getColorForType(String type) {
    switch (type.toLowerCase()) {
      case 'rendezvous':
        return AppColors.primary;
      case 'consultation':
        return AppColors.success;
      case 'analyse':
        return AppColors.warning;
      case 'resultat':
        return AppColors.medecin;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'rendezvous':
        return Icons.calendar_today;
      case 'consultation':
        return Icons.medical_services;
      case 'analyse':
        return Icons.science;
      case 'resultat':
        return Icons.insert_drive_file;
      default:
        return Icons.info_outline;
    }
  }

  String _getTitleForType(String type) {
    switch (type.toLowerCase()) {
      case 'rendezvous':
        return 'Rendez-vous';
      case 'consultation':
        return 'Consultation';
      case 'analyse':
        return 'Demande d\'Analyse Labo';
      case 'resultat':
        return 'Résultat Labo';
      default:
        return 'Action Inconnue';
    }
  }
}
