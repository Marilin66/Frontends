import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_analysis_widgets.dart';
import 'package:hopitel_app/features/laborantin/presentation/widgets/laborantin_forms.dart';

class LaborantinPendingAnalysesScreen extends ConsumerStatefulWidget {
  const LaborantinPendingAnalysesScreen({super.key});

  @override
  ConsumerState<LaborantinPendingAnalysesScreen> createState() =>
      _LaborantinPendingAnalysesScreenState();
}

class _LaborantinPendingAnalysesScreenState
    extends ConsumerState<LaborantinPendingAnalysesScreen> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
              onRefresh: () => ref.read(laborantinPendingAnalysesProvider.notifier).refresh(),
              child: pendingAsync.when(
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
                      icon: Icons.science_outlined,
                      message: _searchQuery.isEmpty
                          ? 'Aucune analyse en cours'
                          : 'Aucun résultat pour "$_searchQuery"',
                      subMessage: _searchQuery.isEmpty
                          ? 'Cliquez sur + pour inscrire un patient'
                          : '',
                    );
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) =>
                        AnalysisCard(demande: filtered[index], isPending: true),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Erreur: $e')),
              ),
            ),
          ),
        ],
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
