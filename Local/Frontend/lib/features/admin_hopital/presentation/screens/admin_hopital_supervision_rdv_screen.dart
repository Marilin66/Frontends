import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalSupervisionRdvScreen extends ConsumerStatefulWidget {
  const AdminHopitalSupervisionRdvScreen({super.key});

  @override
  ConsumerState<AdminHopitalSupervisionRdvScreen> createState() =>
      _AdminHopitalSupervisionRdvScreenState();
}

class _AdminHopitalSupervisionRdvScreenState
    extends ConsumerState<AdminHopitalSupervisionRdvScreen> {
  String? _selectedStatut;

  static const _statuts = [
    {'value': null, 'label': 'Tous'},
    {'value': 'en_attente', 'label': 'En attente'},
    {'value': 'confirme', 'label': 'Confirmés'},
    {'value': 'annule', 'label': 'Annulés'},
    {'value': 'refuse', 'label': 'Refusés'},
    {'value': 'termine', 'label': 'Terminés'},
  ];

  static const Map<String, Color> _statutColors = {
    'en_attente': Color(0xFFF59E0B),
    'confirme': Color(0xFF10B981),
    'annule': Color(0xFFEF4444),
    'refuse': Color(0xFFEF4444),
    'termine': Color(0xFF6366F1),
  };

  @override
  Widget build(BuildContext context) {
    final rdvAsync =
        ref.watch(adminSupervisionRendezvousProvider(_selectedStatut));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Supervision RDV',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.adminHopital),
            onPressed: () => ref.invalidate(
                adminSupervisionRendezvousProvider(_selectedStatut)),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Filtre statut ──────────────────────────────────────────
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _statuts.map((s) {
                  final isSelected = _selectedStatut == s['value'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(s['label'] as String,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: isSelected
                                ? Colors.white
                                : AppColors.textPrimary,
                          )),
                      selected: isSelected,
                      onSelected: (_) => setState(
                          () => _selectedStatut = s['value']),
                      backgroundColor: AppColors.background,
                      selectedColor: AppColors.adminHopital,
                      checkmarkColor: Colors.white,
                      side: BorderSide(
                        color: isSelected
                            ? AppColors.adminHopital
                            : AppColors.textHint.withValues(alpha: 0.3),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // ── Liste ──────────────────────────────────────────────────
          Expanded(
            child: RefreshIndicator(
              color: AppColors.adminHopital,
              onRefresh: () async => ref.invalidate(
                  adminSupervisionRendezvousProvider(_selectedStatut)),
              child: rdvAsync.when(
                loading: () => const Center(
                    child:
                        CircularProgressIndicator(color: AppColors.adminHopital)),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: AppColors.error),
                      const SizedBox(height: 12),
                      Text('Erreur: $e',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => ref.invalidate(
                            adminSupervisionRendezvousProvider(_selectedStatut)),
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                ),
                data: (rdvList) {
                  if (rdvList.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.event_busy,
                              size: 64,
                              color: AppColors.textHint.withValues(alpha: 0.3)),
                          const SizedBox(height: 16),
                          Text('Aucun rendez-vous',
                              style: GoogleFonts.poppins(
                                  color: AppColors.textSecondary,
                                  fontSize: 16)),
                        ],
                      ),
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: rdvList.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, i) {
                      final rdv = rdvList[i] as Map<String, dynamic>;
                      final statut = rdv['statut'] as String? ?? '';
                      final statutColor =
                          _statutColors[statut] ?? AppColors.textHint;
                      final dateHeure = rdv['date_heure'] as String? ?? '';
                      DateTime? dt;
                      try {
                        dt = DateTime.parse(dateHeure);
                      } catch (_) {}
                      return _RdvCard(
                        patientNom: rdv['patient_nom'] as String? ?? '—',
                        medecinNom: rdv['medecin_nom'] as String? ?? '—',
                        motif: rdv['motif'] as String? ?? 'Non renseigné',
                        statut: rdv['statut_display'] as String? ?? statut,
                        statutColor: statutColor,
                        dateHeure: dt,
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RdvCard extends StatelessWidget {
  final String patientNom;
  final String medecinNom;
  final String motif;
  final String statut;
  final Color statutColor;
  final DateTime? dateHeure;

  const _RdvCard({
    required this.patientNom,
    required this.medecinNom,
    required this.motif,
    required this.statut,
    required this.statutColor,
    this.dateHeure,
  });

  @override
  Widget build(BuildContext context) {
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(patientNom,
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 15)),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statutColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(statut,
                    style: GoogleFonts.poppins(
                        color: statutColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.medical_services_outlined,
                  size: 14, color: AppColors.textHint),
              const SizedBox(width: 4),
              Text('Dr. $medecinNom',
                  style: GoogleFonts.poppins(
                      fontSize: 13, color: AppColors.textSecondary)),
            ],
          ),
          const SizedBox(height: 4),
          if (dateHeure != null)
            Row(
              children: [
                const Icon(Icons.schedule, size: 14, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(
                    DateFormat('dd/MM/yyyy à HH:mm', 'fr_FR')
                        .format(dateHeure!),
                    style: GoogleFonts.poppins(
                        fontSize: 13, color: AppColors.textSecondary)),
              ],
            ),
          if (motif.isNotEmpty && motif != 'Non renseigné') ...[
            const SizedBox(height: 6),
            Text('Motif : $motif',
                style: GoogleFonts.poppins(
                    fontSize: 12, color: AppColors.textHint),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ],
      ),
    );
  }
}
