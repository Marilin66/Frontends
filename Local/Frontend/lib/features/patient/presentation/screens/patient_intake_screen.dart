import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/network/dio_client.dart';
import 'package:hopitel_app/core/constants/api_constants.dart';
import 'package:hopitel_app/core/network/api_exception.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

// ─── Provider ────────────────────────────────────────────────────────────────

final _intakeProvider = FutureProvider.family<Map<String, dynamic>?, int>((ref, rdvId) async {
  final client = ref.read(dioClientProvider);
  try {
    final response = await client.get('${ApiConstants.rendezvous}$rdvId/preenregistrement/');
    final responseData = response.data;
    if (responseData == null || responseData is! Map<String, dynamic>) return null;
    return responseData;
  } on DioException catch (e) {
    if (e.response?.statusCode == 404) return null;
    throw ApiException.fromDioError(e);
  }
});

// ─── Screen ──────────────────────────────────────────────────────────────────

class PatientIntakeScreen extends ConsumerStatefulWidget {
  final int rdvId;
  final String? medecinNom;

  const PatientIntakeScreen({
    super.key,
    int? rdvId,
    int? rendezvousId,
    this.medecinNom,
  }) : rdvId = rdvId ?? rendezvousId ?? 0;

  @override
  ConsumerState<PatientIntakeScreen> createState() => _PatientIntakeScreenState();
}

class _PatientIntakeScreenState extends ConsumerState<PatientIntakeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _symptomesCtrl = TextEditingController();
  final _traitementsCtrl = TextEditingController();
  final _observationsCtrl = TextEditingController();
  DateTime? _debutSymptomes;
  bool _isEditMode = false;
  bool _isSaving = false;
  bool _saved = false;

  @override
  void dispose() {
    _symptomesCtrl.dispose();
    _traitementsCtrl.dispose();
    _observationsCtrl.dispose();
    super.dispose();
  }

  void _prefillFromData(Map<String, dynamic> data) {
    _symptomesCtrl.text = data['symptomes_principaux'] as String? ?? '';
    _traitementsCtrl.text = data['traitements_en_cours'] as String? ?? '';
    _observationsCtrl.text = data['observations'] as String? ?? '';
    final debut = data['debut_symptomes'] as String?;
    if (debut != null && debut.isNotEmpty) {
      _debutSymptomes = DateTime.tryParse(debut);
    }
    _isEditMode = true;
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _debutSymptomes ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null) setState(() => _debutSymptomes = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final payload = {
      'symptomes_principaux': _symptomesCtrl.text.trim(),
      'traitements_en_cours': _traitementsCtrl.text.trim(),
      'observations': _observationsCtrl.text.trim(),
      if (_debutSymptomes != null)
        'debut_symptomes': _debutSymptomes!.toIso8601String().split('T').first,
    };

    try {
      final client = ref.read(dioClientProvider);
      final url = '${ApiConstants.rendezvous}${widget.rdvId}/preenregistrement/';
      if (_isEditMode) {
        await client.put(url, data: payload);
      } else {
        try {
          await client.post(url, data: payload);
        } on DioException catch (e) {
          // Si la fiche existe déjà (400), on bascule en PUT automatiquement
          if (e.response?.statusCode == 400) {
            await client.put(url, data: payload);
            _isEditMode = true;
          } else {
            rethrow;
          }
        }
      }
      if (mounted) {
        setState(() => _saved = true);
        await Future.delayed(const Duration(milliseconds: 1600));
        if (mounted) context.pop();
      }
    } on DioException catch (e) {
      if (mounted) {
        // Extraire le vrai message d'erreur du backend
        String errorMsg = 'Erreur lors de la sauvegarde.';
        final data = e.response?.data;
        if (data is Map) {
          if (data['error'] != null) {
            errorMsg = data['error'].toString();
          } else if (data['detail'] != null) {
            errorMsg = data['detail'].toString();
          } else if (data['symptomes_principaux'] != null) {
            errorMsg = 'Symptômes : ${data['symptomes_principaux']}';
          } else {
            errorMsg = data.values.first.toString();
          }
        } else {
          errorMsg = ApiException.fromDioError(e).message;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final intakeAsync = ref.watch(_intakeProvider(widget.rdvId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const UniversalBackButton(),
        title: Text(
          'Pré-consultation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      body: intakeAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text('Erreur : $e', style: GoogleFonts.poppins(color: AppColors.error)),
        ),
        data: (existingData) {
          // Pré-remplir une seule fois
          if (existingData != null && !_isEditMode && _symptomesCtrl.text.isEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _prefillFromData(existingData);
              setState(() {});
            });
          }

          if (_saved) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 72),
                  const SizedBox(height: 16),
                  Text(
                    'Fiche transmise !',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Votre médecin sera préparé pour la consultation.',
                    style: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Bannière info ──
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            widget.medecinNom != null
                                ? 'Ces informations aideront Dr. ${widget.medecinNom} à préparer votre consultation.'
                                : 'Ces informations aideront votre médecin à préparer votre consultation.',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // ── Symptômes principaux ──
                  _buildLabel('Symptômes principaux *', Icons.medical_services_outlined, AppColors.error),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _symptomesCtrl,
                    maxLines: 4,
                    decoration: _inputDecoration('Ex: Maux de tête, fièvre depuis 3 jours...'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Ce champ est requis' : null,
                  ),
                  const SizedBox(height: 20),

                  // ── Date début symptômes ──
                  _buildLabel('Début des symptômes', Icons.calendar_today_outlined, Colors.orange),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: _pickDate,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.event_rounded, color: AppColors.primary, size: 20),
                          const SizedBox(width: 12),
                          Text(
                            _debutSymptomes != null
                                ? '${_debutSymptomes!.day.toString().padLeft(2, '0')}/${_debutSymptomes!.month.toString().padLeft(2, '0')}/${_debutSymptomes!.year}'
                                : 'Sélectionner une date',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: _debutSymptomes != null ? AppColors.textPrimary : AppColors.textHint,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── Traitements en cours ──
                  _buildLabel('Traitements en cours', Icons.medication_outlined, Colors.blue),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _traitementsCtrl,
                    maxLines: 3,
                    decoration: _inputDecoration('Ex: Paracétamol 500mg, Doliprane, aucun...'),
                  ),
                  const SizedBox(height: 20),

                  // ── Observations ──
                  _buildLabel('Observations complémentaires', Icons.notes_rounded, Colors.purple),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _observationsCtrl,
                    maxLines: 4,
                    decoration: _inputDecoration('Ex: Antécédents familiaux, allergies, informations pertinentes...'),
                  ),
                  const SizedBox(height: 32),

                  // ── Bouton submit ──
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              _isEditMode ? 'Mettre à jour la fiche' : 'Envoyer au médecin',
                              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      'Formulaire facultatif — aide votre médecin à préparer la consultation',
                      style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLabel(String text, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.poppins(color: AppColors.textHint, fontSize: 13),
      filled: true,
      fillColor: Colors.grey.shade50,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error),
      ),
    );
  }
}
