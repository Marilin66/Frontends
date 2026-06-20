import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/utils/helpers.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';
import 'package:hopitel_app/features/laborantin/data/models/demande_analyse_model.dart';

class AnalysisCard extends ConsumerWidget {
  final DemandeAnalyseModel demande;
  final bool isPending;

  const AnalysisCard({super.key, required this.demande, required this.isPending});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (isPending ? AppColors.warning : AppColors.success).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isPending ? Icons.hourglass_empty_rounded : Icons.check_circle_outline,
                    color: isPending ? AppColors.warning : AppColors.success,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${demande.patientPrenom} ${demande.patientNom}',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        demande.typeAnalyse,
                        style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                if (!isPending && demande.resultatCode != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      demande.resultatCode!,
                      style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ),
              ],
            ),
            const Divider(height: 24, thickness: 0.5),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.textHint),
                const SizedBox(width: 6),
                Text(
                  demande.dateInscription.split('T')[0],
                  style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint),
                ),
                const Spacer(),
                // Bouton message direct vers le patient
                if (demande.patientId != null)
                  IconButton(
                    icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                    color: AppColors.primary,
                    tooltip: 'Contacter le patient',
                    onPressed: () => context.go('/laborantin/messagerie/direct/${demande.patientId}'),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                const SizedBox(width: 8),
                if (isPending)
                  ElevatedButton.icon(
                    onPressed: () => _showCloturerAnalyseSheet(context, demande),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.upload_file_rounded, size: 16),
                    label: Text('Clôturer', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600)),
                  )
                else
                  Text(
                    'Déposé le ${demande.dateCloture?.split('T')[0]}',
                    style: GoogleFonts.poppins(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showCloturerAnalyseSheet(BuildContext context, DemandeAnalyseModel demande) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CloturerAnalyseBottomSheet(demande: demande),
    );
  }
}

class CloturerAnalyseBottomSheet extends ConsumerStatefulWidget {
  final DemandeAnalyseModel demande;
  const CloturerAnalyseBottomSheet({super.key, required this.demande});

  @override
  ConsumerState<CloturerAnalyseBottomSheet> createState() => _CloturerAnalyseBottomSheetState();
}

class _CloturerAnalyseBottomSheetState extends ConsumerState<CloturerAnalyseBottomSheet> {
  PlatformFile? _selectedFile;
  bool _isLoading = false;

  Future<void> _pickFile() async {
    final res = await FilePicker.platform.pickFiles(type: FileType.any, withData: kIsWeb);
    if (res != null) setState(() => _selectedFile = res.files.first);
  }

  Future<void> _submit() async {
    if (_selectedFile == null) {
      Helpers.showSnackBar(context, 'Veuillez joindre le PDF.', isError: true);
      return;
    }

    // Validation de la taille du fichier (Max 10 Mo)
    final int maxSizeInBytes = 10 * 1024 * 1024;
    if (_selectedFile!.size > maxSizeInBytes) {
      Helpers.showSnackBar(
        context, 
        'Le fichier est trop volumineux (Max 10 Mo). Veuillez le compresser.', 
        isError: true
      );
      return;
    }
    setState(() => _isLoading = true);

    try {
      final multipart = kIsWeb 
        ? MultipartFile.fromBytes(_selectedFile!.bytes!, filename: _selectedFile!.name)
        : await MultipartFile.fromFile(_selectedFile!.path!, filename: _selectedFile!.name);

      final formData = FormData.fromMap({'fichier': multipart, 'titre': widget.demande.typeAnalyse});

      final result = await ref.read(laborantinPendingAnalysesProvider.notifier).cloturerAnalyse(widget.demande.id, formData);

      if (mounted) {
        setState(() => _isLoading = false);
        if (result != null) {
          Navigator.pop(context);
          _showSuccessDialog(result['code_acces']);
        } else {
          Helpers.showSnackBar(context, 'Erreur lors de la clôture.', isError: true);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        Helpers.showSnackBar(context, 'Erreur technique: $e', isError: true);
      }
    }
  }

  void _showSuccessDialog(String code) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Icon(Icons.check_circle, color: AppColors.success, size: 60),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Analyse Clôturée !', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 8),
            Text('Le patient a été notifié par email.', textAlign: TextAlign.center, style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            Text('Code d\'accès : $code', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Déposer les résultats', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Pour: ${widget.demande.patientPrenom} ${widget.demande.patientNom}', style: GoogleFonts.poppins(color: AppColors.textSecondary)),
          const SizedBox(height: 24),
          InkWell(
            onTap: _pickFile,
            child: Container(
              height: 150, width: double.infinity,
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: _selectedFile != null ? AppColors.primary : Colors.grey[300]!, width: 2)),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.picture_as_pdf_outlined, size: 40, color: _selectedFile != null ? AppColors.primary : Colors.grey),
                  const SizedBox(height: 8),
                  Text(_selectedFile?.name ?? 'Cliquez pour sélectionner le PDF', style: GoogleFonts.poppins(fontSize: 13, color: _selectedFile != null ? AppColors.primary : AppColors.textSecondary)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))),
              child: _isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) 
                : const Text('ENVOYER ET CLÔTURER'),
            ),
          ),
        ],
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String subMessage;
  const EmptyState({super.key, required this.icon, required this.message, required this.subMessage});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: AppColors.textHint.withValues(alpha: 0.3)),
          const SizedBox(height: 16),
          Text(message, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
          Text(subMessage, style: GoogleFonts.poppins(fontSize: 13, color: AppColors.textHint)),
        ],
      ),
    );
  }
}
