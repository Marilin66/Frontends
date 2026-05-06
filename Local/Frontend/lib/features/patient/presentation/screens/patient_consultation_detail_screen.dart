import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/rendezvous_model.dart';

// ── Provider consultation patient ────────────────────────────────────────────

final patientConsultationDetailProvider =
    FutureProvider.family<Map<String, dynamic>, int>((ref, consultationId) async {
  final client = ref.read(dioClientProvider);
  final response =
      await client.get('${ApiConstants.consultations}$consultationId/');
  return response.data as Map<String, dynamic>;
});

// ── Screen ───────────────────────────────────────────────────────────────────

class PatientConsultationDetailScreen extends ConsumerWidget {
  final int consultationId;
  final RendezVousModel? rendezvous;

  const PatientConsultationDetailScreen({
    super.key,
    required this.consultationId,
    this.rendezvous,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final consultationAsync =
        ref.watch(patientConsultationDetailProvider(consultationId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Compte rendu',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: consultationAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Erreur: $e',
                  style:
                      GoogleFonts.poppins(color: AppColors.textSecondary),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(
                    patientConsultationDetailProvider(consultationId)),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (data) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Bannière médecin ──────────────────────────────────
              _InfoBanner(
                icon: Icons.person,
                color: AppColors.medecin,
                title: 'Médecin',
                value: data['medecin_nom'] as String? ?? 'N/A',
                subtitle: data['date_rdv'] != null
                    ? 'RDV le ${DateFormat('dd/MM/yyyy').format(DateTime.parse(data['date_rdv'] as String))}'
                    : null,
              ),
              const SizedBox(height: 12),
              _InfoBanner(
                icon: Icons.info_outline,
                color: AppColors.secondary,
                title: 'Motif',
                value: (data['motif'] as String?)?.isNotEmpty == true
                    ? data['motif'] as String
                    : 'Non renseigné',
              ),
              const SizedBox(height: 24),

              // ── Sections médicales ────────────────────────────────
              _MedicalSection(
                icon: Icons.description_outlined,
                title: 'Compte rendu',
                content: data['compte_rendu'] as String? ?? '',
                emptyText: 'Aucun compte rendu disponible.',
                color: AppColors.primary,
              ),
              const SizedBox(height: 16),
              _MedicalSection(
                icon: Icons.biotech_outlined,
                title: 'Diagnostic',
                content: data['diagnostic'] as String? ?? '',
                emptyText: 'Aucun diagnostic renseigné.',
                color: Colors.teal,
              ),
              const SizedBox(height: 16),
              _MedicalSection(
                icon: Icons.medication_outlined,
                title: 'Prescription',
                content: data['prescription'] as String? ?? '',
                emptyText: 'Aucune prescription.',
                color: Colors.orange,
              ),
              const SizedBox(height: 32),

              // ── Note bas de page ──────────────────────────────────
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.15)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lock_outline,
                        size: 16, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Ces informations sont confidentielles et protégées par le secret médical.',
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String value;
  final String? subtitle;

  const _InfoBanner({
    required this.icon,
    required this.color,
    required this.title,
    required this.value,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.poppins(
                        fontSize: 11, color: AppColors.textSecondary)),
                Text(value,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 15)),
                if (subtitle != null)
                  Text(subtitle!,
                      style: GoogleFonts.poppins(
                          fontSize: 12, color: AppColors.textHint)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MedicalSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final String content;
  final String emptyText;
  final Color color;

  const _MedicalSection({
    required this.icon,
    required this.title,
    required this.content,
    required this.emptyText,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty = content.trim().isEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 8),
            Text(title,
                style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary)),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isEmpty
                ? AppColors.surface
                : color.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: isEmpty
                    ? AppColors.textHint.withValues(alpha: 0.1)
                    : color.withValues(alpha: 0.15)),
          ),
          child: Text(
            isEmpty ? emptyText : content,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: isEmpty ? AppColors.textHint : AppColors.textPrimary,
              height: 1.6,
            ),
          ),
        ),
      ],
    );
  }
}
