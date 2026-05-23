import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/patient_provider.dart';
import '../../data/models/resultat_model.dart';
import '../../data/models/medecin_search_model.dart';

class PatientResultShareScreen extends ConsumerStatefulWidget {
  final ResultatModel resultat;

  const PatientResultShareScreen({super.key, required this.resultat});

  @override
  ConsumerState<PatientResultShareScreen> createState() =>
      _PatientResultShareScreenState();
}

class _PatientResultShareScreenState
    extends ConsumerState<PatientResultShareScreen> {
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  bool _isSharing = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _shareWith(MedecinSearchModel medecin) async {
    // Vérifier si déjà partagé
    final alreadyShared = widget.resultat.medecinsPartages
        .any((m) => m.id == medecin.id);
    if (alreadyShared) {
      Helpers.showSnackBar(
        context,
        'Ce résultat est déjà partagé avec Dr. ${medecin.fullName}',
        isError: true,
      );
      return;
    }

    setState(() => _isSharing = true);
    final ok = await ref
        .read(patientResultatsProvider.notifier)
        .shareResultat(widget.resultat.id, medecin.id);
    if (!mounted) return;
    setState(() => _isSharing = false);

    Helpers.showSnackBar(
      context,
      ok
          ? 'Résultat partagé avec Dr. ${medecin.fullName}'
          : 'Erreur lors du partage',
      isError: !ok,
    );
    if (ok) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final medecinsAsync = ref.watch(medecinsSearchProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Partager le résultat',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: Column(
        children: [
          // ── Info résultat ──────────────────────────────────────────
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.science,
                      color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.resultat.titre,
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w600, fontSize: 14)),
                      Text(
                        'Partagé avec ${widget.resultat.medecinsPartages.length} médecin(s)',
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Médecins déjà partagés ─────────────────────────────────
          if (widget.resultat.medecinsPartages.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Déjà partagé avec :',
                    style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary)),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: widget.resultat.medecinsPartages.length,
                itemBuilder: (_, i) {
                  final m = widget.resultat.medecinsPartages[i];
                  return Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: Colors.green.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle,
                            size: 14, color: Colors.green),
                        const SizedBox(width: 6),
                        Text('Dr. ${m.nom}',
                            style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: Colors.green,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
          ],

          // ── Barre de recherche ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher un médecin…',
                hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
                prefixIcon:
                    const Icon(Icons.search, color: AppColors.textHint),
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
              onChanged: (v) {
                setState(() => _searchQuery = v.toLowerCase());
                if (v.length >= 2) {
                  ref
                      .read(medecinsSearchProvider.notifier)
                      .search(query: v);
                } else if (v.isEmpty) {
                  ref.read(medecinsSearchProvider.notifier).refresh();
                }
              },
            ),
          ),
          const SizedBox(height: 12),

          // ── Liste médecins ─────────────────────────────────────────
          Expanded(
            child: medecinsAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary)),
              error: (e, _) => Center(
                child: Text('Erreur: $e',
                    style: GoogleFonts.poppins(
                        color: AppColors.textSecondary)),
              ),
              data: (medecins) {
                final filtered = _searchQuery.isEmpty
                    ? medecins
                    : medecins
                        .where((m) =>
                            m.fullName
                                .toLowerCase()
                                .contains(_searchQuery) ||
                            (m.hopitalNom ?? '')
                                .toLowerCase()
                                .contains(_searchQuery))
                        .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      _searchQuery.isEmpty
                          ? 'Aucun médecin disponible'
                          : 'Aucun résultat pour "$_searchQuery"',
                      style: GoogleFonts.poppins(
                          color: AppColors.textSecondary),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  itemCount: filtered.length,
                  itemBuilder: (_, i) {
                    final m = filtered[i];
                    final alreadyShared = widget.resultat.medecinsPartages
                        .any((p) => p.id == m.id);
                    return _MedecinShareCard(
                      medecin: m,
                      alreadyShared: alreadyShared,
                      isLoading: _isSharing,
                      onShare: () => _shareWith(m),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _MedecinShareCard extends StatelessWidget {
  final MedecinSearchModel medecin;
  final bool alreadyShared;
  final bool isLoading;
  final VoidCallback onShare;

  const _MedecinShareCard({
    required this.medecin,
    required this.alreadyShared,
    required this.isLoading,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: alreadyShared
            ? Border.all(color: Colors.green.withValues(alpha: 0.3))
            : null,
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.medecin.withValues(alpha: 0.1),
            child: Text(
              medecin.fullName.isNotEmpty
                  ? medecin.fullName[0].toUpperCase()
                  : 'M',
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  color: AppColors.medecin,
                  fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Dr. ${medecin.fullName}',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                if (medecin.hopitalNom != null)
                  Text(medecin.hopitalNom!,
                      style: GoogleFonts.poppins(
                          fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          if (alreadyShared)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check, size: 14, color: Colors.green),
                  const SizedBox(width: 4),
                  Text('Partagé',
                      style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: Colors.green,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            )
          else
            ElevatedButton(
              onPressed: isLoading ? null : onShare,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text('Partager',
                  style: GoogleFonts.poppins(
                      fontSize: 12, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }
}
