import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/premium_error_view.dart';
import 'package:hopitel_app/core/widgets/premium_loading_view.dart';
import 'package:hopitel_app/core/utils/helpers.dart';
import 'package:hopitel_app/features/medecin/presentation/providers/medecin_provider.dart';
import 'package:hopitel_app/features/medecin/data/models/disponibilite_model.dart';

class MedecinAgendaContent extends ConsumerStatefulWidget {
  const MedecinAgendaContent({super.key});

  @override
  ConsumerState<MedecinAgendaContent> createState() =>
      _MedecinAgendaContentState();
}

class _MedecinAgendaContentState extends ConsumerState<MedecinAgendaContent>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  CalendarFormat _calendarFormat = CalendarFormat.month;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _selectedDay = _focusedDay;
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _addDispoDialog() {
    String type = 'recurrent';
    int jourSemaine = 0;
    DateTime? dateSpecifique;
    TimeOfDay heureDebut = const TimeOfDay(hour: 8, minute: 0);
    TimeOfDay heureFin = const TimeOfDay(hour: 17, minute: 0);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: StatefulBuilder(
            builder: (context, setModalState) {
              return SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.textHint.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Ajouter une disponibilité',
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildLabel('Type de disponibilité'),
                    DropdownButtonFormField<String>(
                      initialValue: type,
                      decoration: _inputDecoration(),
                      items: const [
                        DropdownMenuItem(
                          value: 'recurrent',
                          child: Text('Récurrent (Chaque semaine)'),
                        ),
                        DropdownMenuItem(
                          value: 'exception',
                          child: Text('Exceptionnel (Jour précis)'),
                        ),
                        DropdownMenuItem(
                          value: 'indisponible',
                          child: Text('Indisponibilité'),
                        ),
                      ],
                      onChanged: (v) => setModalState(() => type = v!),
                    ),
                    const SizedBox(height: 16),
                    if (type == 'recurrent') ...[
                      _buildLabel('Jour de la semaine'),
                      DropdownButtonFormField<int>(
                        initialValue: jourSemaine,
                        decoration: _inputDecoration(),
                        items: const [
                          DropdownMenuItem(value: 0, child: Text('Lundi')),
                          DropdownMenuItem(value: 1, child: Text('Mardi')),
                          DropdownMenuItem(value: 2, child: Text('Mercredi')),
                          DropdownMenuItem(value: 3, child: Text('Jeudi')),
                          DropdownMenuItem(value: 4, child: Text('Vendredi')),
                          DropdownMenuItem(value: 5, child: Text('Samedi')),
                          DropdownMenuItem(value: 6, child: Text('Dimanche')),
                        ],
                        onChanged: (v) => setModalState(() => jourSemaine = v!),
                      ),
                    ],
                    if (type == 'exception' || type == 'indisponible') ...[
                      _buildLabel('Date'),
                      InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now(),
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(
                              const Duration(days: 365),
                            ),
                            builder: (context, child) {
                              return Theme(
                                data: Theme.of(context).copyWith(
                                  colorScheme: const ColorScheme.light(
                                    primary: AppColors.medecin,
                                  ),
                                ),
                                child: child!,
                              );
                            },
                          );
                          if (date != null) {
                            setModalState(() => dateSpecifique = date);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.textHint.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.calendar_today,
                                size: 20,
                                color: AppColors.medecin,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                dateSpecifique == null
                                    ? 'Choisir une date'
                                    : DateFormat(
                                        'dd MMMM yyyy',
                                        'fr_FR',
                                      ).format(dateSpecifique!),
                                style: GoogleFonts.poppins(
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Début'),
                              InkWell(
                                onTap: () async {
                                  final time = await showTimePicker(
                                    context: context,
                                    initialTime: heureDebut,
                                  );
                                  if (time != null) {
                                    setModalState(() => heureDebut = time);
                                  }
                                },
                                child: _buildTimeDisplay(heureDebut),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Fin'),
                              InkWell(
                                onTap: () async {
                                  final time = await showTimePicker(
                                    context: context,
                                    initialTime: heureFin,
                                  );
                                  if (time != null) {
                                    setModalState(() => heureFin = time);
                                  }
                                },
                                child: _buildTimeDisplay(heureFin),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        onPressed: () async {
                          if ((type == 'exception' || type == 'indisponible') &&
                              dateSpecifique == null) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Veuillez choisir une date.'),
                              ),
                            );
                            return;
                          }

                          final String hD =
                              '${heureDebut.hour.toString().padLeft(2, '0')}:${heureDebut.minute.toString().padLeft(2, '0')}:00';
                          final String hF =
                              '${heureFin.hour.toString().padLeft(2, '0')}:${heureFin.minute.toString().padLeft(2, '0')}:00';

                          if (heureDebut.hour > heureFin.hour ||
                              (heureDebut.hour == heureFin.hour &&
                                  heureDebut.minute >= heureFin.minute)) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'L\'heure de fin doit être après l\'heure de début.',
                                ),
                              ),
                            );
                            return;
                          }

                          final data = {
                            'type': type,
                            'jour_semaine': type == 'recurrent'
                                ? jourSemaine
                                : null,
                            'date_specifique':
                                (type == 'exception' || type == 'indisponible')
                                ? dateSpecifique?.toIso8601String().split(
                                    'T',
                                  )[0]
                                : null,
                            'heure_debut': hD,
                            'heure_fin': hF,
                          };

                          final success = await ref
                              .read(medecinDisponibilitesProvider.notifier)
                              .createDisponibilite(data);
                          if (!context.mounted) return;

                          if (success) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Disponibilité ajoutée'),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Erreur (vérifiez les conflits)'),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.medecin,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          'Enregistrer',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  void _deleteDispo(int id) async {
    final success = await ref
        .read(medecinDisponibilitesProvider.notifier)
        .deleteDisponibilite(id);
    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de la suppression')),
      );
    }
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Text(
        text,
        style: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
      ),
    );
  }

  Widget _buildTimeDisplay(TimeOfDay time) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textHint.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.access_time, size: 20, color: AppColors.medecin),
          const SizedBox(width: 12),
          Text(
            time.format(context),
            style: GoogleFonts.poppins(color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 1100;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: isDesktop
          ? PreferredSize(
              preferredSize: const Size.fromHeight(48),
              child: Container(
                color: AppColors.surface,
                child: TabBar(
                  controller: _tabController,
                  labelColor: AppColors.medecin,
                  unselectedLabelColor: AppColors.textSecondary,
                  indicatorColor: AppColors.medecin,
                  tabs: const [
                    Tab(text: 'Agenda'),
                    Tab(text: 'Planification'),
                  ],
                ),
              ),
            )
          : AppBar(
              title: Text(
                'Mon Agenda',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
              ),
              centerTitle: true,
              backgroundColor: AppColors.surface,
              surfaceTintColor: Colors.transparent,
              bottom: TabBar(
                controller: _tabController,
                labelColor: AppColors.medecin,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorColor: AppColors.medecin,
                tabs: const [
                  Tab(text: 'Agenda'),
                  Tab(text: 'Planification'),
                ],
              ),
            ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildAgendaTab(), _buildPlanningTab()],
      ),
      floatingActionButton: _tabController.index == 1
          ? FloatingActionButton(
              onPressed: _addDispoDialog,
              backgroundColor: AppColors.medecin,
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  Widget _buildAgendaTab() {
    final rdvAsync = ref.watch(medecinRendezvousProvider);

    return Column(
      children: [
        Container(
          color: AppColors.surface,
          child: TableCalendar(
            locale: 'fr_FR',
            firstDay: DateTime.now().subtract(const Duration(days: 365)),
            lastDay: DateTime.now().add(const Duration(days: 365)),
            focusedDay: _focusedDay,
            calendarFormat: _calendarFormat,
            availableCalendarFormats: const {
              CalendarFormat.month: 'Mois',
              CalendarFormat.week: 'Semaine',
            },
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            onFormatChanged: (format) {
              setState(() => _calendarFormat = format);
            },
            eventLoader: (day) {
              final rdvs = ref.watch(medecinRendezvousProvider).value ?? [];
              return rdvs.where((r) => isSameDay(r.dateHeure, day)).toList();
            },
            calendarStyle: CalendarStyle(
              todayDecoration: BoxDecoration(
                color: AppColors.medecin.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              selectedDecoration: const BoxDecoration(
                color: AppColors.medecin,
                shape: BoxShape.circle,
              ),
              markerSize: 7,
              markersMaxCount: 1,
              markerDecoration: const BoxDecoration(
                color: AppColors.secondary,
                shape: BoxShape.circle,
              ),
              outsideDaysVisible: false,
            ),
            headerStyle: HeaderStyle(
              formatButtonVisible: true,
              titleCentered: true,
              formatButtonDecoration: BoxDecoration(
                color: AppColors.medecin.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              formatButtonTextStyle: const TextStyle(
                color: AppColors.medecin,
                fontWeight: FontWeight.bold,
              ),
              leftChevronIcon: const Icon(
                Icons.chevron_left,
                color: AppColors.medecin,
              ),
              rightChevronIcon: const Icon(
                Icons.chevron_right,
                color: AppColors.medecin,
              ),
            ),
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: rdvAsync.when(
            loading: () => const PremiumLoadingView(
              message: 'Chargement de votre agenda...',
            ),
            error: (e, _) => PremiumErrorView(
              message: 'Erreur: $e',
              onRetry: () =>
                  ref.read(medecinRendezvousProvider.notifier).refresh(),
            ),
            data: (rdvs) {
              final dayRdvs =
                  rdvs
                      .where((r) => isSameDay(r.dateHeure, _selectedDay))
                      .toList()
                    ..sort((a, b) => a.dateHeure.compareTo(b.dateHeure));

              if (dayRdvs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 48,
                        color: AppColors.textHint.withValues(alpha: 0.3),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Aucun rendez-vous prévu',
                        style: GoogleFonts.poppins(
                          color: AppColors.textSecondary,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: dayRdvs.length,
                itemBuilder: (context, index) {
                  final rdv = dayRdvs[index];
                  final isNext =
                      index == 0 && rdv.dateHeure.isAfter(DateTime.now());
                  final statusCol = _getStatusColor(rdv.statut);

                  return IntrinsicHeight(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Colonne Heure (Timeline)
                        SizedBox(
                          width: 60,
                          child: Column(
                            children: [
                              Text(
                                DateFormat('HH:mm').format(rdv.dateHeure),
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: isNext
                                      ? AppColors.medecin
                                      : AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "${rdv.duree}min",
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: AppColors.textHint,
                                ),
                              ),
                              Expanded(
                                child: Container(
                                  width: 2,
                                  color: AppColors.textHint.withValues(alpha: 0.1),
                                  margin: const EdgeInsets.symmetric(
                                    vertical: 8,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Carte RDV
                        Expanded(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isNext
                                    ? AppColors.medecin.withValues(alpha: 0.3)
                                    : Colors.transparent,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        rdv.patientNom,
                                        style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: statusCol.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        rdv.statutDisplay,
                                        style: GoogleFonts.poppins(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: statusCol,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  rdv.motif,
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 12),
                                // ── Fiche de pré-consultation (si disponible) ──
                                if (rdv.preEnregistrement != null) ...[
                                  GestureDetector(
                                    onTap: () => _showIntakeSheet(context, rdv.preEnregistrement!),
                                    child: Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(10),
                                      margin: const EdgeInsets.only(bottom: 10),
                                      decoration: BoxDecoration(
                                        color: Colors.teal.withValues(alpha: 0.08),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: Colors.teal.withValues(alpha: 0.25),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.assignment_turned_in_rounded,
                                              size: 16, color: Colors.teal),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              'Fiche pré-consultation disponible',
                                              style: GoogleFonts.poppins(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w700,
                                                color: Colors.teal.shade700,
                                              ),
                                            ),
                                          ),
                                          Text(
                                            'Voir',
                                            style: GoogleFonts.poppins(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.teal,
                                              decoration: TextDecoration.underline,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                                Row(
                                  children: [
                                    if (rdv.statut == 'en_attente') ...[
                                      _buildActionButton(
                                        onPressed: () =>
                                            _showRefuseDialog(context, rdv.id),
                                        icon: Icons.close,
                                        color: AppColors.error,
                                        label: 'Refuser',
                                      ),
                                      const SizedBox(width: 8),
                                      _buildActionButton(
                                        onPressed: () => _confirmRDV(rdv.id),
                                        icon: Icons.check,
                                        color: Colors.green,
                                        label: 'Confirmer',
                                      ),
                                    ] else if (rdv.statut == 'confirme') ...[
                                      _buildActionButton(
                                        onPressed: () => _terminerRDV(rdv.id),
                                        icon: Icons.done_all,
                                        color: AppColors.medecin,
                                        label: 'Terminer',
                                      ),
                                    ] else if (rdv.hasConsultation &&
                                        rdv.consultationId != null) ...[
                                      _buildActionButton(
                                        onPressed: () => context.go(
                                          '/messagerie/consultation/${rdv.consultationId}',
                                        ),
                                        icon: Icons.chat_bubble_outline,
                                        color: AppColors.medecin,
                                        label: 'Chatter',
                                      ),
                                    ],
                                    const Spacer(),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.info_outline,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        // TODO: Show patient detail / summary
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required VoidCallback onPressed,
    required IconData icon,
    required Color color,
    required String label,
  }) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          border: Border.all(color: color.withValues(alpha: 0.3)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Affiche la fiche de pré-consultation du patient dans un bottom sheet.
  void _showIntakeSheet(BuildContext context, Map<String, dynamic> intake) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // ── Handle ─────────────────────────────────────────────
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // ── Titre ───────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.teal.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.assignment_ind_rounded,
                          color: Colors.teal, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Fiche de pré-consultation',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            'Transmise par le patient',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              color: Colors.teal,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 24),
              // ── Contenu ─────────────────────────────────────────────
              Expanded(
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _IntakeField(
                      icon: Icons.sick_rounded,
                      label: 'Symptômes principaux',
                      value: intake['symptomes_principaux'] as String? ?? '—',
                      color: Colors.red.shade400,
                    ),
                    const SizedBox(height: 16),
                    _IntakeField(
                      icon: Icons.calendar_today_rounded,
                      label: 'Début des symptômes',
                      value: intake['debut_symptomes'] as String? ?? '—',
                      color: Colors.orange.shade400,
                    ),
                    const SizedBox(height: 16),
                    _IntakeField(
                      icon: Icons.medication_rounded,
                      label: 'Traitements en cours',
                      value: intake['traitements_en_cours'] as String? ?? '—',
                      color: Colors.blue.shade400,
                    ),
                    const SizedBox(height: 16),
                    _IntakeField(
                      icon: Icons.notes_rounded,
                      label: 'Observations complémentaires',
                      value: intake['observations'] as String? ?? '—',
                      color: Colors.purple.shade400,
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmRDV(int id) async {

    final success = await ref
        .read(medecinRendezvousProvider.notifier)
        .confirmerRendezvous(id);
    if (mounted) {
      Helpers.showSnackBar(
        context,
        success ? 'Rendez-vous confirmé' : 'Erreur lors de la confirmation',
        isError: !success,
      );
    }
  }

  void _terminerRDV(int id) async {
    final consultationId = await ref
        .read(medecinRendezvousProvider.notifier)
        .terminerRendezvous(id);
    if (mounted) {
      if (consultationId != null) {
        Helpers.showSnackBar(
          context,
          'Rendez-vous terminé et consultation créée',
          isError: false,
        );
        context.go('/messagerie/consultation/$consultationId');
      } else {
        Helpers.showSnackBar(
          context,
          'Erreur lors de la validation',
          isError: true,
        );
      }
    }
  }

  void _showRefuseDialog(BuildContext context, int id) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Refuser le rendez-vous',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Motif du refus...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () async {
              final motif = controller.text.trim();
              if (motif.isEmpty) return;
              Navigator.pop(ctx);
              final success = await ref
                  .read(medecinRendezvousProvider.notifier)
                  .refuserRendezvous(id, motif);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Rendez-vous refusé' : 'Erreur lors du refus',
                  isError: !success,
                );
              }
            },
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Refuser'),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanningTab() {
    final disponibilitesAsync = ref.watch(medecinDisponibilitesProvider);

    return disponibilitesAsync.when(
      loading: () =>
          const PremiumLoadingView(message: 'Chargement de votre planning...'),
      error: (e, _) => PremiumErrorView(
        message: 'Impossible de charger vos disponibilités : $e',
        onRetry: () =>
            ref.read(medecinDisponibilitesProvider.notifier).refresh(),
      ),
      data: (dispos) {
        if (dispos.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.calendar_month,
                  size: 60,
                  color: AppColors.textHint.withValues(alpha: 0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  'Définissez vos horaires habituels',
                  style: GoogleFonts.poppins(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _addDispoDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Ajouter une plage'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.medecin,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          );
        }

        // Grouper par type pour l'affichage
        final recurrents = dispos.where((d) => d.type == 'recurrent').toList()
          ..sort((a, b) => (a.jourSemaine ?? 0).compareTo(b.jourSemaine ?? 0));
        final exceptions = dispos.where((d) => d.type != 'recurrent').toList();

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (recurrents.isNotEmpty) ...[
              _buildSectionTitle('Planification Hebdomadaire'),
              ...recurrents.map((d) => _buildDispoCard(d)),
              const SizedBox(height: 24),
            ],
            if (exceptions.isNotEmpty) ...[
              _buildSectionTitle('Exceptions & Indisponibilités'),
              ...exceptions.map((d) => _buildDispoCard(d)),
            ],
          ],
        );
      },
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildDispoCard(DisponibiliteModel d) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: d.type == 'indisponible'
              ? AppColors.error.withValues(alpha: 0.1)
              : AppColors.medecin.withValues(alpha: 0.1),
          child: Icon(
            d.type == 'indisponible' ? Icons.block : Icons.access_time,
            color: d.type == 'indisponible'
                ? AppColors.error
                : AppColors.medecin,
          ),
        ),
        title: Text(
          d.jourSemaineDisplay ??
              d.dateSpecifique?.toString().split(' ')[0] ??
              d.typeDisplay,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${d.heureDebut.substring(0, 5)} - ${d.heureFin.substring(0, 5)}',
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: AppColors.error),
          onPressed: () => _deleteDispo(d.id),
        ),
      ),
    );
  }

  Color _getStatusColor(String statut) {
    return Helpers.getStatusColor(statut);
  }
}

/// Widget affichant un champ de la fiche de pré-consultation.
class _IntakeField extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _IntakeField({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 8),
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 13,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
