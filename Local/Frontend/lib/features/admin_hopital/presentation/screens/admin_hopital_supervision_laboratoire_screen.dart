import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalSupervisionLaboratoireScreen extends ConsumerWidget {
  const AdminHopitalSupervisionLaboratoireScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final laboAsync = ref.watch(adminSupervisionLaboratoireProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Supervision Laboratoire',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.adminHopital),
            onPressed: () => ref.invalidate(adminSupervisionLaboratoireProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.adminHopital,
        onRefresh: () async => ref.invalidate(adminSupervisionLaboratoireProvider),
        child: laboAsync.when(
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
                  onPressed: () => ref.invalidate(adminSupervisionLaboratoireProvider),
                  child: const Text('Réessayer'),
                ),
              ],
            ),
          ),
          data: (analyses) {
            if (analyses.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.science_outlined,
                        size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('Aucune analyse',
                        style: GoogleFonts.poppins(
                            color: AppColors.textSecondary, fontSize: 16)),
                  ],
                ),
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: analyses.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final analyse = analyses[i] as Map<String, dynamic>;
                final dateStr = analyse['date_inscription'] as String? ?? '';
                DateTime? dt;
                try {
                  dt = DateTime.parse(dateStr);
                } catch (_) {}

                final String statut = analyse['statut'] as String? ?? 'en_cours';
                final bool isTermine = statut == 'cloture';

                return Container(
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
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  analyse['type_analyse'] as String? ?? 'Analyse',
                                  style: GoogleFonts.poppins(
                                      fontWeight: FontWeight.w600, fontSize: 15),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Patient: ${analyse['patient_prenom']} ${analyse['patient_nom']}',
                                  style: GoogleFonts.poppins(
                                      color: AppColors.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isTermine
                                  ? AppColors.success.withValues(alpha: 0.12)
                                  : AppColors.warning.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                                isTermine ? 'Clôturé' : 'En cours',
                                style: GoogleFonts.poppins(
                                    color: isTermine
                                        ? AppColors.success
                                        : AppColors.warning,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (dt != null)
                        Row(
                          children: [
                            const Icon(Icons.schedule,
                                size: 14, color: AppColors.textHint),
                            const SizedBox(width: 4),
                            Text(
                                'Inscrit le ${DateFormat('dd/MM/yyyy', 'fr_FR').format(dt)}',
                                style: GoogleFonts.poppins(
                                    fontSize: 13, color: AppColors.textSecondary)),
                          ],
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
}
