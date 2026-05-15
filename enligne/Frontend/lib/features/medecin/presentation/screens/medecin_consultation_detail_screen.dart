import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/medecin_provider.dart';
import '../../data/models/consultation_model.dart';

// Provider pour charger une consultation par son ID
final consultationDetailProvider =
    FutureProvider.family<ConsultationModel, int>((ref, id) async {
  final datasource = ref.read(medecinDatasourceProvider);
  return await datasource.getConsultation(id);
});

class MedecinConsultationDetailScreen extends ConsumerStatefulWidget {
  final int consultationId;

  const MedecinConsultationDetailScreen({
    super.key,
    required this.consultationId,
  });

  @override
  ConsumerState<MedecinConsultationDetailScreen> createState() =>
      _MedecinConsultationDetailScreenState();
}

class _MedecinConsultationDetailScreenState
    extends ConsumerState<MedecinConsultationDetailScreen> {
  bool _isEditing = false;
  late TextEditingController _compteRenduCtrl;
  late TextEditingController _diagnosticCtrl;
  late TextEditingController _prescriptionCtrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _compteRenduCtrl = TextEditingController();
    _diagnosticCtrl = TextEditingController();
    _prescriptionCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _compteRenduCtrl.dispose();
    _diagnosticCtrl.dispose();
    _prescriptionCtrl.dispose();
    super.dispose();
  }

  void _initControllers(ConsultationModel c) {
    if (!_isEditing) {
      _compteRenduCtrl.text = c.compteRendu;
      _diagnosticCtrl.text = c.diagnostic;
      _prescriptionCtrl.text = c.prescription;
    }
  }

  Future<void> _saveConsultation() async {
    setState(() => _isSaving = true);
    final data = {
      'compte_rendu': _compteRenduCtrl.text.trim(),
      'diagnostic': _diagnosticCtrl.text.trim(),
      'prescription': _prescriptionCtrl.text.trim(),
    };
    final success = await ref
        .read(medecinConsultationsListProvider.notifier)
        .updateConsultation(widget.consultationId, data);
    if (!mounted) return;
    setState(() {
      _isSaving = false;
      if (success) _isEditing = false;
    });
    Helpers.showSnackBar(
      context,
      success ? 'Consultation mise à jour' : 'Erreur lors de la mise à jour',
      isError: !success,
    );
    if (success) {
      ref.invalidate(consultationDetailProvider(widget.consultationId));
    }
  }

  Future<void> _cloturerConsultation() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Clôturer la consultation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: const Text(
          'Voulez-vous clôturer définitivement cette consultation ? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Clôturer', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    final success = await ref
        .read(medecinConsultationsListProvider.notifier)
        .cloturerConsultation(widget.consultationId);
    if (!mounted) return;
    Helpers.showSnackBar(
      context,
      success ? 'Consultation clôturée' : 'Erreur lors de la clôture',
      isError: !success,
    );
    if (success) {
      ref.invalidate(consultationDetailProvider(widget.consultationId));
      Navigator.pop(context);
    }
  }

  Future<void> _showPrescriptionDialog(ConsultationModel consultation) async {
    final formKey = GlobalKey<FormState>();
    final typeAnalyseCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Prescrire une analyse',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: typeAnalyseCtrl,
                decoration: InputDecoration(
                  labelText: 'Type d\'analyse',
                  hintText: 'Ex: Prise de sang, IRM...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: notesCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Notes pour le laboratoire',
                  hintText: 'Instructions spécifiques...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.medecin),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              
              final data = {
                'consultation': consultation.rendezVousId,
                'patient': consultation.patientId,
                'type_analyse': typeAnalyseCtrl.text.trim(),
                'notes_medecin': notesCtrl.text.trim(),
              };

              Navigator.pop(ctx);
              
              final success = await ref
                  .read(medecinConsultationsListProvider.notifier)
                  .prescrireAnalyse(data);
              
              if (mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Analyse prescrite au laboratoire' : 'Erreur lors de la prescription',
                  isError: !success,
                );
              }
            },
            child: const Text('Prescrire', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final consultationAsync =
        ref.watch(consultationDetailProvider(widget.consultationId));
    final preenregistrementAsync =
        ref.watch(medecinPreenregistrementProvider(widget.consultationId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Consultation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit, color: AppColors.medecin),
              tooltip: 'Modifier',
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            IconButton(
              icon: const Icon(Icons.close, color: AppColors.error),
              tooltip: 'Annuler',
              onPressed: () => setState(() => _isEditing = false),
            ),
        ],
      ),
      body: consultationAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.medecin),
        ),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Erreur: $e',
                  style: GoogleFonts.poppins(color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(
                    consultationDetailProvider(widget.consultationId)),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (consultation) {
          _initControllers(consultation);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Carte Info Patient ──────────────────────────────────
                _buildInfoCard(
                  icon: Icons.person,
                  color: AppColors.medecin,
                  title: 'Patient',
                  content: consultation.patientNom,
                  subtitle:
                      'RDV le ${DateFormat('dd/MM/yyyy à HH:mm').format(consultation.dateRdv)}',
                ),
                const SizedBox(height: 12),
                _buildInfoCard(
                  icon: Icons.medical_information,
                  color: AppColors.secondary,
                  title: 'Motif',
                  content: consultation.motif.isNotEmpty
                      ? consultation.motif
                      : 'Non renseigné',
                ),
                const SizedBox(height: 20),

                // ── Pré-enregistrement Patient ──────────────────────────
                preenregistrementAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => const SizedBox(), // On ignore silencieusement
                  data: (preData) {
                    if (preData == null) return const SizedBox();
                    return Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.assignment_ind_outlined, color: AppColors.secondary, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'Formulaire de Pré-consultation',
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.secondary,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 24),
                          if (preData['symptomes'] != null && preData['symptomes'].toString().isNotEmpty)
                            _buildDetailRow('Symptômes', preData['symptomes']),
                          if (preData['duree_symptomes'] != null && preData['duree_symptomes'].toString().isNotEmpty)
                            _buildDetailRow('Durée', preData['duree_symptomes']),
                          if (preData['antecedents'] != null && preData['antecedents'].toString().isNotEmpty)
                            _buildDetailRow('Antécédents', preData['antecedents']),
                          if (preData['traitements_en_cours'] != null && preData['traitements_en_cours'].toString().isNotEmpty)
                            _buildDetailRow('Traitements', preData['traitements_en_cours']),
                          if (preData['notes_patient'] != null && preData['notes_patient'].toString().isNotEmpty)
                            _buildDetailRow('Notes', preData['notes_patient']),
                        ],
                      ),
                    );
                  },
                ),

                // ── Sections médicales ──────────────────────────────────
                _buildSectionTitle('Compte rendu'),
                const SizedBox(height: 8),
                _isEditing
                    ? _buildTextField(
                        controller: _compteRenduCtrl,
                        hint: 'Saisir le compte rendu de la consultation...',
                        maxLines: 5,
                      )
                    : _buildReadOnlyField(
                        consultation.compteRendu.isNotEmpty
                            ? consultation.compteRendu
                            : 'Aucun compte rendu',
                        maxLines: 5,
                      ),
                const SizedBox(height: 16),

                _buildSectionTitle('Diagnostic'),
                const SizedBox(height: 8),
                _isEditing
                    ? _buildTextField(
                        controller: _diagnosticCtrl,
                        hint: 'Saisir le diagnostic...',
                        maxLines: 4,
                      )
                    : _buildReadOnlyField(
                        consultation.diagnostic.isNotEmpty
                            ? consultation.diagnostic
                            : 'Aucun diagnostic',
                        maxLines: 4,
                      ),
                const SizedBox(height: 16),

                _buildSectionTitle('Prescription'),
                const SizedBox(height: 8),
                _isEditing
                    ? _buildTextField(
                        controller: _prescriptionCtrl,
                        hint: 'Saisir la prescription médicale...',
                        maxLines: 4,
                      )
                    : _buildReadOnlyField(
                        consultation.prescription.isNotEmpty
                            ? consultation.prescription
                            : 'Aucune prescription',
                        maxLines: 4,
                      ),
                const SizedBox(height: 32),

                // ── Boutons d'action ────────────────────────────────────
                if (_isEditing) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _isSaving ? null : _saveConsultation,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.save),
                      label: Text(
                        _isSaving ? 'Enregistrement...' : 'Enregistrer',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.medecin,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ] else ...[
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () => _showPrescriptionDialog(consultation),
                      icon: const Icon(Icons.science_outlined, color: Colors.white),
                      label: Text(
                        'Prescrire une analyse',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: _cloturerConsultation,
                      icon: const Icon(Icons.lock_outline, color: AppColors.error),
                      label: Text(
                        'Clôturer la consultation',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                          color: AppColors.error,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.error),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required Color color,
    required String title,
    required String content,
    String? subtitle,
  }) {
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  content,
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppColors.textHint,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    int maxLines = 3,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(color: AppColors.textHint),
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.medecin),
        ),
      ),
    );
  }

  Widget _buildReadOnlyField(String text, {int maxLines = 3}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textHint.withValues(alpha: 0.15)),
      ),
      child: Text(
        text,
        style: GoogleFonts.poppins(
          fontSize: 14,
          color: text.startsWith('Aucun')
              ? AppColors.textHint
              : AppColors.textPrimary,
        ),
      ),
    );
  }
}
