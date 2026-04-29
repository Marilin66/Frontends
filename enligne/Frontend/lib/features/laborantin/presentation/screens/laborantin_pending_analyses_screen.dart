import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_analysis_widgets.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_forms.dart';

class LaborantinPendingAnalysesScreen extends ConsumerWidget {
  const LaborantinPendingAnalysesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingAsync = ref.watch(laborantinPendingAnalysesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Analyses en cours', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(laborantinPendingAnalysesProvider.notifier).refresh(),
        child: pendingAsync.when(
          data: (demandes) {
            if (demandes.isEmpty) {
              return const EmptyState(
                icon: Icons.science_outlined,
                message: 'Aucune analyse en cours',
                subMessage: 'Cliquez sur + pour inscrire un patient',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: demandes.length,
              itemBuilder: (context, index) => AnalysisCard(demande: demandes[index], isPending: true),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Erreur: $e')),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => const LaborantinManualInscriptionSheet(),
          );
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text('Inscrire Patient', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
