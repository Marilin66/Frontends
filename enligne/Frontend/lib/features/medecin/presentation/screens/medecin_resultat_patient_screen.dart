import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';

// Provider pour accéder à un résultat par code
final _resultatByCodeProvider =
    FutureProvider.family<Map<String, dynamic>?, String>((ref, code) async {
  if (code.isEmpty) return null;
  try {
    final client = ref.read(dioClientProvider);
    final response = await client.get('${ApiConstants.resultatsAccesCode}$code/');
    return response.data as Map<String, dynamic>;
  } catch (_) {
    return null;
  }
});

class MedecinResultatPatientScreen extends ConsumerStatefulWidget {
  const MedecinResultatPatientScreen({super.key});

  @override
  ConsumerState<MedecinResultatPatientScreen> createState() =>
      _MedecinResultatPatientScreenState();
}

class _MedecinResultatPatientScreenState
    extends ConsumerState<MedecinResultatPatientScreen> {
  final _codeCtrl = TextEditingController();
  String _searchCode = '';
  bool _hasSearched = false;

  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

  void _search() {
    final code = _codeCtrl.text.trim().toUpperCase();
    if (code.isEmpty) return;
    setState(() {
      _searchCode = code;
      _hasSearched = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(),
        title: Text(
          'Résultats patients',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Explication ──────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.medecin.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: AppColors.medecin.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      color: AppColors.medecin, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Entrez le code d\'accès fourni par le patient pour consulter son résultat d\'analyse.',
                      style: GoogleFonts.poppins(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Champ de recherche ───────────────────────────────────
            Text(
              'Code d\'accès patient',
              style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _codeCtrl,
                    textCapitalization: TextCapitalization.characters,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        letterSpacing: 2,
                        fontSize: 16),
                    decoration: InputDecoration(
                      hintText: 'Ex: ABC123XY',
                      hintStyle: GoogleFonts.poppins(
                          color: AppColors.textHint,
                          fontWeight: FontWeight.normal,
                          letterSpacing: 0),
                      filled: true,
                      fillColor: AppColors.surface,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                            color: AppColors.textHint.withValues(alpha: 0.2)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                            color: AppColors.textHint.withValues(alpha: 0.2)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide:
                            const BorderSide(color: AppColors.medecin),
                      ),
                      prefixIcon: const Icon(Icons.vpn_key_outlined,
                          color: AppColors.medecin),
                      suffixIcon: _codeCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close,
                                  color: AppColors.textHint),
                              onPressed: () {
                                _codeCtrl.clear();
                                setState(() {
                                  _searchCode = '';
                                  _hasSearched = false;
                                });
                              },
                            )
                          : null,
                    ),
                    onSubmitted: (_) => _search(),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _search,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.medecin,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                    ),
                    child: Text(
                      'Rechercher',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // ── Résultat ─────────────────────────────────────────────
            if (_hasSearched && _searchCode.isNotEmpty)
              _ResultatView(code: _searchCode),
          ],
        ),
      ),
    );
  }
}

// ── Widget affichage résultat ─────────────────────────────────────────────────

class _ResultatView extends ConsumerWidget {
  final String code;
  const _ResultatView({required this.code});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_resultatByCodeProvider(code));

    return async.when(
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: AppColors.medecin),
        ),
      ),
      error: (e, _) => _ErrorCard(
          message: 'Erreur lors de la recherche. Vérifiez le code.'),
      data: (data) {
        if (data == null) {
          return _ErrorCard(
              message: 'Aucun résultat trouvé pour le code "$code".');
        }
        return _ResultatCard(data: data);
      },
    );
  }
}

class _ResultatCard extends StatelessWidget {
  final Map<String, dynamic> data;
  const _ResultatCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final titre = data['titre'] as String? ?? 'Résultat d\'analyse';
    final patientNom = data['patient_display_nom'] as String? ??
        data['patient_nom_externe'] as String? ?? '—';
    final laboratoire = data['laboratoire'] as String? ?? '—';
    final dateAnalyse = data['date_analyse'] as String? ?? '';
    final fichier = data['fichier'] as String?;
    final codeAcces = data['code_acces'] as String? ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Badge succès
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, size: 16, color: Colors.green),
              const SizedBox(width: 6),
              Text(
                'Résultat trouvé',
                style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.green),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Carte résultat
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2))
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Titre
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.medecin.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.science,
                        color: AppColors.medecin, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          titre,
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w700, fontSize: 16),
                        ),
                        if (dateAnalyse.isNotEmpty)
                          Text(
                            'Analysé le ${dateAnalyse.split('T').first}',
                            style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),

              // Infos
              _InfoRow(icon: Icons.person_outline, label: 'Patient', value: patientNom),
              const SizedBox(height: 10),
              _InfoRow(icon: Icons.local_hospital_outlined, label: 'Laboratoire', value: laboratoire),
              if (codeAcces.isNotEmpty) ...[
                const SizedBox(height: 10),
                _InfoRow(
                  icon: Icons.vpn_key_outlined,
                  label: 'Code d\'accès',
                  value: codeAcces,
                  trailing: IconButton(
                    icon: const Icon(Icons.copy, size: 16, color: AppColors.medecin),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: codeAcces));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Code copié')),
                      );
                    },
                  ),
                ),
              ],
              const SizedBox(height: 20),

              // Bouton télécharger
              if (fichier != null && fichier.isNotEmpty)
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      final uri = Uri.parse(fichier);
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri,
                            mode: LaunchMode.externalApplication);
                      }
                    },
                    icon: const Icon(Icons.download_outlined),
                    label: Text(
                      'Télécharger le fichier',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.medecin,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline,
                          size: 16, color: AppColors.textHint),
                      const SizedBox(width: 8),
                      Text(
                        'Aucun fichier joint à ce résultat',
                        style: GoogleFonts.poppins(
                            fontSize: 13, color: AppColors.textHint),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailing;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[
      Icon(icon, size: 16, color: AppColors.textHint),
      const SizedBox(width: 8),
      Text(
        '$label : ',
        style: GoogleFonts.poppins(
            fontSize: 13, color: AppColors.textSecondary),
      ),
      Expanded(
        child: Text(
          value,
          style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary),
          overflow: TextOverflow.ellipsis,
        ),
      ),
    ];
    
    if (trailing != null) {
      children.add(trailing!);
    }
    
    return Row(children: children);
  }
}

class _ErrorCard extends StatelessWidget {
  final String message;
  const _ErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.error, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.poppins(
                  fontSize: 13, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
