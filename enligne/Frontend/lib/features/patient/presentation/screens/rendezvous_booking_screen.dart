import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:tuple/tuple.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../../data/models/medecin_search_model.dart';
import '../../data/models/creneau_model.dart';
import '../providers/patient_provider.dart';

class RendezvousBookingScreen extends ConsumerStatefulWidget {
  final MedecinSearchModel? medecin;
  final int? medecinId;

  const RendezvousBookingScreen({
    super.key, 
    this.medecin,
    this.medecinId,
  }) : assert(medecin != null || medecinId != null, 'Either medecin or medecinId must be provided');

  @override
  ConsumerState<RendezvousBookingScreen> createState() => _RendezvousBookingScreenState();
}

class _RendezvousBookingScreenState extends ConsumerState<RendezvousBookingScreen> {
  DateTime _selectedDate = DateTime.now();
  CreneauModel? _selectedCreneau;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    if (widget.medecin != null) {
      return _buildContent(context, widget.medecin!);
    }

    final medecinAsync = ref.watch(medecinDetailProvider(widget.medecinId!));

    return medecinAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Erreur: $e'))),
      data: (medecin) => _buildContent(context, medecin),
    );
  }

  Widget _buildContent(BuildContext context, MedecinSearchModel medecin) {
    final dateFormat = DateFormat('yyyy-MM-dd');
    final startStr = dateFormat.format(_selectedDate);
    // final endStr = dateFormat.format(_selectedDate);

    // Pour voir les disponibilités réelles, on peut regarder sur 3 jours
    final threeDaysLater = _selectedDate.add(const Duration(days: 2));
    final params = Tuple3(medecin.id, startStr, dateFormat.format(threeDaysLater));
    final creneauxAsync = ref.watch(medecinCreneauxProvider(params));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Réserver un RDV', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Doctor Header Short
          Container(
            padding: const EdgeInsets.all(20),
            color: AppColors.surface,
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: const Icon(Icons.person, size: 30, color: AppColors.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dr. ${medecin.firstName} ${medecin.lastName}',
                        style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        medecin.services.isNotEmpty 
                          ? medecin.services.first.serviceNom 
                          : 'Médecin Généraliste',
                        style: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Date Selector Strip
          _buildDateStrip(),

          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Text(
                  'Créneaux disponibles',
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
                const Spacer(),
                const Icon(Icons.info_outline, size: 16, color: AppColors.textHint),
              ],
            ),
          ),
          const SizedBox(height: 12),

          Expanded(
            child: creneauxAsync.when(
              loading: () => GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 2.2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: 9,
                itemBuilder: (context, index) => Shimmer.fromColors(
                  baseColor: AppColors.surface,
                  highlightColor: AppColors.background,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
              error: (e, _) => Center(child: Text('Erreur: $e')),
              data: (creneaux) {
                // Filtrer pour ne garder que le jour sélectionné
                final dayCreneaux = creneaux.where((c) {
                  final cDate = DateTime.parse(c.date);
                  return cDate.year == _selectedDate.year &&
                         cDate.month == _selectedDate.month &&
                         cDate.day == _selectedDate.day;
                }).toList();

                if (dayCreneaux.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.event_busy, size: 64, color: AppColors.textHint.withValues(alpha: 0.3)),
                        const SizedBox(height: 16),
                        Text(
                          'Aucune disponibilité ce jour',
                          style: GoogleFonts.poppins(color: AppColors.textSecondary),
                        ),
                        TextButton(
                          onPressed: () {
                            // Prochain jour dispos?
                            setState(() {
                              _selectedDate = _selectedDate.add(const Duration(days: 1));
                            });
                          },
                          child: const Text('Voir le jour suivant'),
                        ),
                      ],
                    ),
                  );
                }

                return GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 2.2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: dayCreneaux.length,
                  itemBuilder: (context, index) {
                    final c = dayCreneaux[index];
                    final isSelected = _selectedCreneau == c;
                    return AnimatedTap(
                      onTap: () => setState(() => _selectedCreneau = c),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.textHint.withValues(alpha: 0.2),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          c.heureDebut.substring(0, 5),
                          style: GoogleFonts.poppins(
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Bottom Action
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 55,
                child: FilledButton(
                  onPressed: (_selectedCreneau == null || _isSubmitting) ? null : () => _confirmBooking(context, medecin, _selectedCreneau!),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isSubmitting 
                    ? SizedBox(
                        height: 20, 
                        width: 20, 
                        child: Shimmer.fromColors(
                          baseColor: Colors.white.withValues(alpha: 0.8),
                          highlightColor: Colors.white,
                          child: Container(
                            height: 20,
                            width: 20,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      )
                    : Text('Confirmer la réservation', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateStrip() {
    return Container(
      height: 100,
      color: AppColors.surface,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: 14, // Prochaines 2 semaines
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = date.year == _selectedDate.year &&
                             date.month == _selectedDate.month &&
                             date.day == _selectedDate.day;
          
          return AnimatedTap(
            onTap: () => setState(() {
              _selectedDate = date;
              _selectedCreneau = null;
            }),
            child: Container(
              width: 65,
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
                border: isSelected ? Border.all(color: AppColors.primary, width: 1.5) : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    DateFormat('E', 'fr_FR').format(date).toUpperCase(),
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: isSelected ? AppColors.primary : AppColors.textHint,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    date.day.toString(),
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _confirmBooking(BuildContext context, MedecinSearchModel medecin, CreneauModel creneau) {
    final motifController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Motif de consultation', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: TextField(
          controller: motifController,
          decoration: InputDecoration(
            hintText: 'Ex: Fièvre, Rappel vaccin...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              _submitBooking(medecin, creneau, motifController.text.trim());
            },
            child: const Text('Réserver maintenant'),
          ),
        ],
      ),
    );
  }

  void _submitBooking(MedecinSearchModel medecin, CreneauModel creneau, String motif) async {
    setState(() => _isSubmitting = true);
    try {
      // Construction de date_heure : "YYYY-MM-DDTHH:MM:00"
      final dateHeure = "${creneau.date}T${creneau.heureDebut}";

      final ok = await ref.read(patientRendezvousProvider.notifier).createRendezvous({
        'medecin': medecin.id,
        'date_heure': dateHeure,
        'motif': motif,
      });
      
      if (mounted) {
        setState(() => _isSubmitting = false);
        if (ok) {
          Helpers.showSnackBar(context, 'Rendez-vous réservé avec succès !');
          // Naviguer vers la page des rendez-vous pour voir la confirmation
          context.go('/patient/appointments');
        } else {
          Helpers.showSnackBar(context, 'Erreur lors de la réservation', isError: true);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        Helpers.showSnackBar(context, 'Erreur: $e', isError: true);
      }
    }
  }
}
