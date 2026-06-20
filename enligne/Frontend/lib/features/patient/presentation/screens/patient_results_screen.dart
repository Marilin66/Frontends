import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/patient_provider.dart';
import '../../data/models/resultat_model.dart';
import '../../../../core/widgets/universal_back_button.dart';

/// ==========================================================================
/// Écran des résultats médicaux du patient
/// ==========================================================================
/// Cet écran affiche la liste de tous les résultats d'analyses médicales
/// du patient connecté. Chaque résultat est présenté sous forme de carte
/// avec les informations clés : titre, laboratoire, dates, code d'accès
/// et liste des médecins avec lesquels le résultat est partagé.
/// ==========================================================================
typedef PatientResultsContent = PatientResultsScreen;

class PatientResultsScreen extends ConsumerWidget {
  const PatientResultsScreen({super.key});

  /// Tente de parser une date au format ISO et la formate en dd/MM/yyyy.
  /// Retourne une chaîne vide si le parsing échoue.
  String _formaterDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy', 'fr_FR').format(date);
    } catch (_) {
      // Si le format n'est pas reconnu, on retourne la chaîne brute
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    /// Observation du provider des résultats médicaux
    final resultatsAsync = ref.watch(patientResultatsProvider);

    final isDesktop = MediaQuery.of(context).size.width >= 1100;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: isDesktop
          ? null
          : AppBar(
              leading: UniversalBackButton(),
              title: Text(
                'Mes Résultats',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              ),
              centerTitle: true,
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.primary,
              surfaceTintColor: Colors.transparent,
              actions: [
                /// Bouton de rafraîchissement dans l'AppBar
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () =>
                      ref.read(patientResultatsProvider.notifier).refresh(),
                ),
              ],
            ),
      body: resultatsAsync.when(
        /// --- État de chargement ---
        loading: () => const Center(child: CircularProgressIndicator()),

        /// --- État d'erreur avec bouton de réessai ---
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                'Erreur de chargement',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => ref.read(patientResultatsProvider.notifier).refresh(),
                icon: const Icon(Icons.refresh),
                label: const Text('Réessayer'),
                style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
              ),
            ],
          ),
        ),
        data: (resultats) {
          if (resultats.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.science_outlined, size: 64, color: AppColors.textHint),
                  const SizedBox(height: 12),
                  const Text('Aucun résultat disponible'),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => context.go('/patient/result-code'),
                    child: const Text('Entrer un code laboratoire'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(patientResultatsProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: resultats.length + 1,
              separatorBuilder: (_, _) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                if (index == resultats.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8, bottom: 20),
                    child: OutlinedButton.icon(
                      onPressed: () => context.go('/patient/result-code'),
                      icon: const Icon(Icons.vpn_key_outlined),
                      label: const Text('Accéder via un code de laboratoire'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  );
                }
                final resultat = resultats[index];
                final bool estPdf = resultat.fichier.endsWith('.pdf');
                
                return Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                    border: Border.all(color: AppColors.textHint.withValues(alpha: 0.1)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header with status and date
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Disponible',
                                  style: GoogleFonts.poppins(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.success,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              Text(
                                _formaterDate(resultat.dateDepot),
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Icon and Title
                        ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          leading: Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              estPdf ? Icons.picture_as_pdf : Icons.science_outlined,
                              color: AppColors.primary,
                              size: 28,
                            ),
                          ),
                          title: Text(
                            resultat.titre.isNotEmpty ? resultat.titre : 'Résultat d\'analyse',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          subtitle: Text(
                            resultat.laboratoire,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),

                        // Shared with
                        if (resultat.medecinsPartages.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Divider(height: 1),
                                const SizedBox(height: 12),
                                Text(
                                  'PARTAGÉ AVEC',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textHint,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: resultat.medecinsPartages.map((m) => _MedecinChip(nom: m.nom)).toList(),
                                ),
                                const SizedBox(height: 16),
                              ],
                            ),
                          ),
                        
                        // Actions
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.background.withValues(alpha: 0.5),
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(20),
                              bottomRight: Radius.circular(20),
                            ),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: FilledButton.icon(
                                  onPressed: () async {
                                    if (resultat.fichier.isEmpty) return;
                                    // Utilise l'endpoint sécurisé /api/resultats/:id/telecharger/
                                    // qui sert le fichier via Django (pas via media Render)
                                    final apiBase = kIsWeb ? ApiConstants.baseUrlWeb : ApiConstants.baseUrl;
                                    final downloadUrl = '${apiBase}resultats/${resultat.id}/telecharger/';
                                    final uri = Uri.parse(downloadUrl);
                                    if (await canLaunchUrl(uri)) {
                                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                                    }
                                  },
                                  icon: const Icon(Icons.visibility_outlined, size: 18),
                                  label: Text(
                                    'Consulter',
                                    style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                                  ),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton.filledTonal(
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: resultat.codeAcces));
                                  Helpers.showSnackBar(context, 'Code d\'accès copié !');
                                },
                                icon: const Icon(Icons.copy_outlined, size: 20),
                                style: IconButton.styleFrom(
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.all(12),
                                ),
                                tooltip: 'Copier le code',
                              ),
                              const SizedBox(width: 8),
                              IconButton.filledTonal(
                                onPressed: () => _showShareDialog(context, ref, resultat),
                                icon: const Icon(Icons.share_outlined, size: 20),
                                style: IconButton.styleFrom(
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.all(12),
                                ),
                                tooltip: 'Partager avec un médecin',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showShareDialog(BuildContext context, WidgetRef ref, ResultatModel resultat) {
    final searchController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('Partager le résultat', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
          content: SizedBox(
            width: double.maxFinite,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Choisissez un médecin avec qui partager « ${resultat.titre} ».',
                  style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    hintText: 'Rechercher un médecin...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onChanged: (val) => ref.read(medecinsSearchProvider.notifier).search(query: val),
                ),
                const SizedBox(height: 16),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 300),
                  child: ref.watch(medecinsSearchProvider).when(
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text('Erreur: $e')),
                    data: (medecins) {
                      if (medecins.isEmpty) {
                        return const Center(child: Text('Aucun médecin trouvé'));
                      }
                      return ListView.builder(
                        shrinkWrap: true,
                        itemCount: medecins.length,
                        itemBuilder: (context, index) {
                          final m = medecins[index];
                          if (resultat.medecinsPartages.any((p) => p.id == m.id)) {
                            return const SizedBox.shrink();
                          }
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                              child: Text(m.firstName[0], style: const TextStyle(color: AppColors.primary)),
                            ),
                            title: Text('Dr. ${m.firstName} ${m.lastName}', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500)),
                            subtitle: Text(m.services.isNotEmpty ? m.services.first.serviceNom : 'Médecin', style: GoogleFonts.poppins(fontSize: 12)),
                            onTap: () async {
                              final ok = await ref.read(patientResultatsProvider.notifier).shareResultat(resultat.id, m.id);
                              if (context.mounted) {
                                Navigator.pop(context);
                                if (ok) {
                                  Helpers.showSnackBar(context, 'Résultat partagé avec succès !');
                                } else {
                                  Helpers.showSnackBar(context, 'Erreur lors du partage', isError: true);
                                }
                              }
                            },
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Annuler', style: GoogleFonts.poppins()),
            ),
          ],
        ),
      ),
    );
  }
}

class _MedecinChip extends StatelessWidget {
  final String nom;
  const _MedecinChip({required this.nom});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.medecin.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.medecin.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.person_outline, size: 14, color: AppColors.medecin),
          const SizedBox(width: 6),
          Text(
            nom,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.medecin,
            ),
          ),
        ],
      ),
    );
  }
}
