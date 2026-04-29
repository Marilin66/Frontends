import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_analysis_widgets.dart';

class LaborantinFinishedAnalysesScreen extends ConsumerWidget {
  const LaborantinFinishedAnalysesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finishedAsync = ref.watch(laborantinFinishedAnalysesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Historique', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(laborantinFinishedAnalysesProvider.notifier).refresh(),
        child: finishedAsync.when(
          data: (demandes) {
            if (demandes.isEmpty) {
              return const EmptyState(
                icon: Icons.history_rounded,
                message: 'Aucun historique',
                subMessage: 'Les analyses clôturées apparaîtront ici',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: demandes.length,
              itemBuilder: (context, index) => AnalysisCard(demande: demandes[index], isPending: false),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Erreur: $e')),
        ),
      ),
    );
  }
}
