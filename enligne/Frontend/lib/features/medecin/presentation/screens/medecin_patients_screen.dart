import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import 'package:hopitel_app/features/medecin/data/models/rendezvous_medecin_model.dart';
import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/premium_error_view.dart';
import 'package:hopitel_app/core/widgets/premium_loading_view.dart';
import 'package:hopitel_app/features/medecin/presentation/providers/medecin_provider.dart';
import 'package:hopitel_app/core/utils/helpers.dart';


class MedecinPatientsContent extends ConsumerStatefulWidget {
  const MedecinPatientsContent({super.key});

  @override
  ConsumerState<MedecinPatientsContent> createState() =>
      _MedecinPatientsContentState();
}

class _MedecinPatientsContentState
    extends ConsumerState<MedecinPatientsContent> {
  final _searchCtrl = TextEditingController();
  String _search = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _showPatientAppointments(BuildContext context, String patientName, List<RendezVousMedecinModel> appointments) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Rendez-vous de $patientName',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: appointments.length,
                  itemBuilder: (context, index) {
                    final rdv = appointments[index];
                    final statusColor = Helpers.getStatusColor(rdv.statut);
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        Helpers.formatDateTime(rdv.dateHeure),
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                      subtitle: Text(
                        rdv.motif.isNotEmpty ? rdv.motif : 'Sans motif',
                        style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          Helpers.getStatusLabel(rdv.statut),
                          style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final rdvAsync = ref.watch(medecinRendezvousProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Mes Patients',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(medecinRendezvousProvider.notifier).refresh(),
          ),
        ],
      ),
      body: rdvAsync.when(
        loading: () =>
            const PremiumLoadingView(message: 'Chargement de vos patients...'),
        error: (e, _) => PremiumErrorView(
          message: 'Erreur: $e',
          onRetry: () =>
              ref.read(medecinRendezvousProvider.notifier).refresh(),
        ),
        data: (rdvs) {
          // Grouper les rendez-vous par patient
          final patientsMap = <String, List<RendezVousMedecinModel>>{};
          for (var r in rdvs) {
            patientsMap.putIfAbsent(r.patientNom, () => []).add(r);
          }

          var patientNames = patientsMap.keys.toList()..sort();

          // Filtrage par recherche
          if (_search.isNotEmpty) {
            patientNames = patientNames
                .where((n) =>
                    n.toLowerCase().contains(_search.toLowerCase()))
                .toList();
          }

          return Column(
            children: [
              // ── Barre de recherche ─────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppColors.textHint.withValues(alpha: 0.2)),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() => _search = v),
                    style: GoogleFonts.poppins(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Rechercher un patient…',
                      hintStyle: GoogleFonts.poppins(
                          color: AppColors.textHint, fontSize: 14),
                      prefixIcon: const Icon(Icons.search,
                          color: AppColors.textHint, size: 20),
                      suffixIcon: _search.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close,
                                  size: 18, color: AppColors.textHint),
                              onPressed: () {
                                _searchCtrl.clear();
                                setState(() => _search = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),

              // ── Compteur ───────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    Icon(Icons.people_outline,
                        size: 16,
                        color: AppColors.medecin.withValues(alpha: 0.7)),
                    const SizedBox(width: 6),
                    Text(
                      '${patientNames.length} patient${patientNames.length != 1 ? 's' : ''}',
                      style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),

              // ── Liste ──────────────────────────────────────────────
              Expanded(
                child: patientNames.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.people_outlined,
                                size: 64,
                                color: AppColors.textHint
                                    .withValues(alpha: 0.3)),
                            const SizedBox(height: 16),
                            Text(
                              _search.isEmpty
                                  ? 'Aucun patient trouvé'
                                  : 'Aucun résultat pour "$_search"',
                              style: GoogleFonts.poppins(
                                  color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                        itemCount: patientNames.length,
                        itemBuilder: (context, index) {
                          final name = patientNames[index];
                          final patientRdvs = patientsMap[name]!;
                          final sortedRdvs =
                              List<RendezVousMedecinModel>.from(patientRdvs)
                                ..sort((a, b) =>
                                    b.dateHeure.compareTo(a.dateHeure));
                          final lastRdv = sortedRdvs.first;
                          final initials = name
                              .split(' ')
                              .map((e) => e.isNotEmpty ? e[0] : '')
                              .take(2)
                              .join()
                              .toUpperCase();

                          return GestureDetector(
                            onTap: () => _showPatientAppointments(context, name, patientRdvs),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black
                                        .withValues(alpha: 0.04),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2))
                              ],
                            ),
                            child: Row(
                              children: [
                                // Avatar
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: AppColors.medecin
                                      .withValues(alpha: 0.12),
                                  child: Text(
                                    initials,
                                    style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.medecin,
                                        fontSize: 14),
                                  ),
                                ),
                                const SizedBox(width: 14),

                                // Infos
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: GoogleFonts.poppins(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 15),
                                      ),
                                      const SizedBox(height: 3),
                                      Row(
                                        children: [
                                          Icon(Icons.event_available,
                                              size: 12,
                                              color: AppColors.textHint),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Dernier RDV : ${DateFormat('dd/MM/yyyy', 'fr_FR').format(lastRdv.dateHeure)}',
                                            style: GoogleFonts.poppins(
                                                fontSize: 12,
                                                color: AppColors
                                                    .textSecondary),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${patientRdvs.length} rendez-vous au total',
                                        style: GoogleFonts.poppins(
                                            fontSize: 11,
                                            color: AppColors.textHint),
                                      ),
                                    ],
                                  ),
                                ),

                                // Actions
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Bouton messagerie
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: AppColors.medecin
                                            .withValues(alpha: 0.1),
                                        borderRadius:
                                            BorderRadius.circular(10),
                                      ),
                                      child: IconButton(
                                        padding: EdgeInsets.zero,
                                        icon: Icon(
                                          lastRdv.hasConsultation &&
                                                  lastRdv.consultationId !=
                                                      null
                                              ? Icons.chat_bubble_outline
                                              : Icons.send_rounded,
                                          color: AppColors.medecin,
                                          size: 18,
                                        ),
                                        tooltip: lastRdv.hasConsultation
                                            ? 'Ouvrir la conversation'
                                            : 'Message direct',
                                        onPressed: () {
                                          if (lastRdv.hasConsultation &&
                                              lastRdv.consultationId !=
                                                  null) {
                                            context.go(
                                                '/medecin/messagerie/consultation/${lastRdv.consultationId}');
                                          } else {
                                            context.go(
                                                '/medecin/messagerie/direct/${lastRdv.patient}');
                                          }
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.chevron_right,
                                        color: AppColors.textHint),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
