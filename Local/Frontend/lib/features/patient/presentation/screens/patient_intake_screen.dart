import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/patient_provider.dart';

/// Écran de pré-enregistrement (Patient Intake) avant une consultation.
///
/// Permet au patient de soumettre ses symptômes, traitements et observations
/// afin que le médecin puisse préparer la consultation à l'avance.
class PatientIntakeScreen extends ConsumerStatefulWidget {
  /// Identifiant du rendez-vous concerné.
  final int rendezvousId;

  /// Nom du médecin (pour l'en-tête).
  final String medecinNom;

  const PatientIntakeScreen({
    super.key,
    required this.rendezvousId,
    this.medecinNom = 'votre médecin',
  });

  @override
  ConsumerState<PatientIntakeScreen> createState() => _PatientIntakeScreenState();
}

class _PatientIntakeScreenState extends ConsumerState<PatientIntakeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _symptomesController = TextEditingController();
  final _traitementsController = TextEditingController();
  final _observationsController = TextEditingController();

  DateTime? _debutSymptomes;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditMode = false; // true si un formulaire existe déjà (PUT), false = POST

  @override
  void initState() {
    super.initState();
    _loadExistingData();
  }

  @override
  void dispose() {
    _symptomesController.dispose();
    _traitementsController.dispose();
    _observationsController.dispose();
    super.dispose();
  }

  /// Tente de récupérer un formulaire existant (GET 200 = mode édition).
  Future<void> _loadExistingData() async {
    setState(() => _isLoading = true);
    try {
      final datasource = ref.read(patientDatasourceProvider);
      final existing = await datasource.getPreEnregistrement(widget.rendezvousId);

      if (existing != null) {
        // Mode édition : pré-remplissage du formulaire
        _symptomesController.text = existing['symptomes_principaux'] as String? ?? '';
        _traitementsController.text = existing['traitements_en_cours'] as String? ?? '';
        _observationsController.text = existing['observations'] as String? ?? '';
        final debutStr = existing['debut_symptomes'] as String?;
        if (debutStr != null) {
          _debutSymptomes = DateTime.tryParse(debutStr);
        }
        _isEditMode = true;
      } else {
        _isEditMode = false;
      }
    } catch (_) {
      // En cas d'erreur réseau, on affiche quand même le formulaire vide
      _isEditMode = false;
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _debutSymptomes ?? DateTime.now().subtract(const Duration(days: 3)),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) setState(() => _debutSymptomes = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final data = {
      'symptomes_principaux': _symptomesController.text.trim(),
      'traitements_en_cours': _traitementsController.text.trim(),
      'observations': _observationsController.text.trim(),
      if (_debutSymptomes != null)
        'debut_symptomes': DateFormat('yyyy-MM-dd').format(_debutSymptomes!),
    };

    try {
      final datasource = ref.read(patientDatasourceProvider);
      if (_isEditMode) {
        await datasource.updatePreEnregistrement(widget.rendezvousId, data);
      } else {
        await datasource.createPreEnregistrement(widget.rendezvousId, data);
        setState(() => _isEditMode = true);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '✅ Dossier transmis à ${widget.medecinNom} avec succès.',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la soumission : $e'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }

    if (mounted) setState(() => _isSaving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(),
        title: Text(
          'Pré-consultation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── En-tête informatif ────────────────────────────────
                    _buildInfoCard(),
                    const SizedBox(height: 24),

                    // ── Symptômes principaux ──────────────────────────────
                    _buildSectionTitle('🩺 Symptômes principaux', required: true),
                    const SizedBox(height: 8),
                    _buildTextArea(
                      controller: _symptomesController,
                      hint: 'Ex: Maux de tête, fièvre depuis 3 jours, douleurs abdominales...',
                      validator: (v) =>
                          (v == null || v.trim().isEmpty) ? 'Ce champ est requis' : null,
                    ),
                    const SizedBox(height: 20),

                    // ── Date de début des symptômes ───────────────────────
                    _buildSectionTitle('📅 Début des symptômes'),
                    const SizedBox(height: 8),
                    _buildDatePicker(),
                    const SizedBox(height: 20),

                    // ── Traitements en cours ──────────────────────────────
                    _buildSectionTitle('💊 Traitements en cours'),
                    const SizedBox(height: 8),
                    _buildTextArea(
                      controller: _traitementsController,
                      hint: 'Ex: Paracétamol 500mg, Doliprane, aucun...',
                    ),
                    const SizedBox(height: 20),

                    // ── Observations complémentaires ──────────────────────
                    _buildSectionTitle('📝 Observations complémentaires'),
                    const SizedBox(height: 8),
                    _buildTextArea(
                      controller: _observationsController,
                      hint: 'Ex: Antécédents familiaux, allergies connues, informations pertinentes...',
                      maxLines: 5,
                    ),
                    const SizedBox(height: 32),

                    // ── Bouton soumettre ──────────────────────────────────
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Text(
                                _isEditMode ? 'Mettre à jour le dossier' : 'Envoyer à mon médecin',
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // ── Note facultative ──────────────────────────────────
                    Center(
                      child: Text(
                        'Ce formulaire est facultatif mais aide votre médecin à mieux vous préparer.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: AppColors.textHint,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  // ── Widgets helpers ────────────────────────────────────────────────────────

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Préparez votre consultation',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ces informations seront transmises à ${widget.medecinNom} afin qu\'il ou elle puisse préparer votre consultation en amont.',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, {bool required = false}) {
    return Row(
      children: [
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        if (required) ...[
          const SizedBox(width: 4),
          Text(
            '*',
            style: GoogleFonts.poppins(
              color: AppColors.error,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTextArea({
    required TextEditingController controller,
    required String hint,
    int maxLines = 4,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      style: GoogleFonts.poppins(fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(color: AppColors.textHint, fontSize: 12),
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.all(16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.error),
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return GestureDetector(
      onTap: _pickDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded,
                color: AppColors.primary, size: 18),
            const SizedBox(width: 12),
            Text(
              _debutSymptomes != null
                  ? DateFormat('dd MMMM yyyy', 'fr_FR').format(_debutSymptomes!)
                  : 'Sélectionner une date',
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: _debutSymptomes != null
                    ? AppColors.textPrimary
                    : AppColors.textHint,
              ),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
