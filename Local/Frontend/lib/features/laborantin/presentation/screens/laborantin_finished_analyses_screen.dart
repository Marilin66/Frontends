import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_analysis_widgets.dart';

class LaborantinFinishedAnalysesScreen extends ConsumerStatefulWidget {
  const LaborantinFinishedAnalysesScreen({super.key});

  @override
  ConsumerState<LaborantinFinishedAnalysesScreen> createState() =>
      _LaborantinFinishedAnalysesScreenState();
}

class _LaborantinFinishedAnalysesScreenState
    extends ConsumerState<LaborantinFinishedAnalysesScreen> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
      body: Column(
        children: [
          // ── Barre de recherche ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher un patient ou une analyse…',
                hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
                prefixIcon: const Icon(Icons.search, color: AppColors.textHint),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            ),
          ),
          // ── Liste ──────────────────────────────────────────────────
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(laborantinFinishedAnalysesProvider.notifier).refresh(),
              child: finishedAsync.when(
                data: (demandes) {
                  final filtered = _searchQuery.isEmpty
                      ? demandes
                      : demandes
                          .where((d) =>
                              '${d.patientPrenom} ${d.patientNom}'
                                  .toLowerCase()
                                  .contains(_searchQuery) ||
                              d.typeAnalyse.toLowerCase().contains(_searchQuery))
                          .toList();

                  if (filtered.isEmpty) {
                    return EmptyState(
                      icon: Icons.history_rounded,
                      message: _searchQuery.isEmpty
                          ? 'Aucun historique'
                          : 'Aucun résultat pour "$_searchQuery"',
                      subMessage: _searchQuery.isEmpty
                          ? 'Les analyses clôturées apparaîtront ici'
                          : '',
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final d = filtered[index];
                      return Column(
                        children: [
                          AnalysisCard(demande: d, isPending: false),
                          // ── Code d'accès ──────────────────────────
                          if (d.resultatCode != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.06),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: AppColors.primary.withValues(alpha: 0.2)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.key_rounded,
                                      size: 16, color: AppColors.primary),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Code d\'accès : ',
                                    style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        color: AppColors.textSecondary),
                                  ),
                                  Text(
                                    d.resultatCode!,
                                    style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                        letterSpacing: 1.5),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Erreur: $e')),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
