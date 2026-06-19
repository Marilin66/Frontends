import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';
// ── Mock models for post-care follow-ups ───────────────────────────────

class PostCareFollowUp {
  final int id;
  final String patientName;
  final String doctorName;
  final String motif;
  final int progression;
  final int sessionsTotal;
  final int sessionsCompleted;
  final String status; // en_cours, termine, paused

  PostCareFollowUp({
    required this.id,
    required this.patientName,
    required this.doctorName,
    required this.motif,
    required this.progression,
    required this.sessionsTotal,
    required this.sessionsCompleted,
    required this.status,
  });

  factory PostCareFollowUp.fromJson(Map<String, dynamic> json) {
    return PostCareFollowUp(
      id: json['id'] as int? ?? 0,
      patientName: json['patient_nom'] as String? ?? 'Patient',
      doctorName: json['medecin_nom'] as String? ?? 'Dr. Médecin',
      motif: json['motif'] as String? ?? 'Suivi',
      progression: json['progression'] as int? ?? 0,
      sessionsTotal: json['seances_totales'] as int? ?? 1,
      sessionsCompleted: json['seances_faites'] as int? ?? 0,
      status: json['statut'] as String? ?? 'en_cours',
    );
  }
}

// ── Provider ───────────────────────────────────────────────────────────

final adminHopitalPostCareProvider =
    AsyncNotifierProvider<AdminHopitalPostCareNotifier, List<PostCareFollowUp>>(
  AdminHopitalPostCareNotifier.new,
);

class AdminHopitalPostCareNotifier
    extends AsyncNotifier<List<PostCareFollowUp>> {
  @override
  Future<List<PostCareFollowUp>> build() async {
    // TODO: Replace with actual API call when endpoint is available
    // For now, returning mock data
    return _getMockData();
  }

  Future<List<PostCareFollowUp>> _getMockData() async {
    // Simulating API delay
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      PostCareFollowUp(
        id: 1,
        patientName: 'Moussa Diop',
        doctorName: 'Dr. Keita',
        motif: 'Suivi post-opératoire',
        progression: 60,
        sessionsTotal: 5,
        sessionsCompleted: 3,
        status: 'en_cours',
      ),
      PostCareFollowUp(
        id: 2,
        patientName: 'Aminata Touré',
        doctorName: 'Dr. Sow',
        motif: 'Rééducation genou',
        progression: 20,
        sessionsTotal: 10,
        sessionsCompleted: 2,
        status: 'en_cours',
      ),
      PostCareFollowUp(
        id: 3,
        patientName: 'Jean Koffi',
        doctorName: 'Dr. Ben',
        motif: 'Contrôle tension',
        progression: 100,
        sessionsTotal: 1,
        sessionsCompleted: 1,
        status: 'termine',
      ),
      PostCareFollowUp(
        id: 4,
        patientName: 'Fatima Coulibaly',
        doctorName: 'Dr. Keita',
        motif: 'Suivi diabète',
        progression: 45,
        sessionsTotal: 8,
        sessionsCompleted: 3,
        status: 'en_cours',
      ),
    ];
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _getMockData());
  }
}

// ── Screen ─────────────────────────────────────────────────────────────

class AdminHopitalPostCareScreen extends ConsumerWidget {
  const AdminHopitalPostCareScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postCareAsync = ref.watch(adminHopitalPostCareProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text(
          'Suivi Post-Consultation',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(adminHopitalPostCareProvider.notifier).refresh(),
          ),
        ],
      ),
      body: postCareAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Text('Erreur: $err'),
        ),
        data: (followUps) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Metrics
              _buildMetricsSection(followUps),
              const SizedBox(height: 24),

              // Active protocols
              Text(
                'Protocoles de Suivi',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),

              if (followUps.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Text(
                      'Aucun suivi post-consultation',
                      style: GoogleFonts.poppins(
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                )
              else
                ...followUps.map((followUp) =>
                    _buildFollowUpCard(context, followUp)),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricsSection(List<PostCareFollowUp> followUps) {
    final activeProtocols =
        followUps.where((f) => f.status == 'en_cours').length;
    final avgCompletion = followUps.isNotEmpty
        ? (followUps.fold<int>(0, (sum, f) => sum + f.progression) /
                followUps.length)
            .toInt()
        : 0;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Card(
                elevation: 2,
                shadowColor: Colors.black12,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Taux de complétion',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[600],
                            ),
                          ),
                          Icon(
                            Icons.trending_up,
                            color: Colors.green,
                            size: 20,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$avgCompletion%',
                        style: GoogleFonts.poppins(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Card(
                elevation: 2,
                shadowColor: Colors.black12,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Protocoles actifs',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[600],
                            ),
                          ),
                          Icon(
                            Icons.assignment,
                            color: AppColors.primary,
                            size: 20,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$activeProtocols',
                        style: GoogleFonts.poppins(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFollowUpCard(BuildContext context, PostCareFollowUp followUp) {
    final statusColor = followUp.status == 'termine'
        ? Colors.green
        : followUp.status == 'paused'
            ? Colors.orange
            : AppColors.primary;

    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        followUp.patientName,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        followUp.doctorName,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    followUp.status == 'en_cours'
                        ? 'En cours'
                        : followUp.status == 'termine'
                            ? 'Terminé'
                            : 'En pause',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Motif
            Text(
              followUp.motif,
              style: GoogleFonts.poppins(
                fontSize: 13,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 12),

            // Progress
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progression',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${followUp.sessionsCompleted}/${followUp.sessionsTotal} séances',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: followUp.progression / 100,
                minHeight: 8,
                backgroundColor: Colors.grey[300],
                valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${followUp.progression}% complet',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
