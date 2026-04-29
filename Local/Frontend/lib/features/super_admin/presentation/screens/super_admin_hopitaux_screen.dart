import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import 'package:go_router/go_router.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminHopitauxContent extends ConsumerWidget {
  const SuperAdminHopitauxContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hopitauxAsync = ref.watch(hopitauxProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Hôpitaux', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(hopitauxProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => _showCreateHopitalDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: hopitauxAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (hopitaux) {
          if (hopitaux.isEmpty) return const Center(child: Text('Aucun hôpital'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: hopitaux.length,
            itemBuilder: (context, index) {
              final h = hopitaux[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  onTap: () => context.push('/super-admin/hopitaux/${h.id}', extra: h),
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.local_hospital, color: AppColors.primary),
                  ),
                  title: Text(
                    h.nom,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1A1A1A), // Higher contrast black
                      fontSize: 15,
                    ),
                  ),
                  subtitle: Text(
                    h.adresse,
                    style: GoogleFonts.poppins(
                      color: AppColors.textSecondary.withOpacity(0.9), // Slightly darker
                      fontSize: 13,
                    ),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, color: AppColors.primary),
                        tooltip: 'Modifier',
                        onPressed: () => _showEditHopitalDialog(context, ref, h),
                      ),
                      IconButton(
                        icon: Icon(
                          h.isActive ? Icons.check_circle : Icons.cancel,
                          color: h.isActive ? AppColors.success : AppColors.error,
                        ),
                        tooltip: h.isActive ? 'Désactiver' : 'Activer',
                        onPressed: () async {
                          final success = await ref.read(hopitauxProvider.notifier).toggleStatus(h.id, !h.isActive);
                          if (context.mounted) {
                            Helpers.showSnackBar(
                              context,
                              success
                                  ? (h.isActive ? 'Hôpital désactivé' : 'Hôpital activé')
                                  : 'Erreur lors du changement de statut',
                              isError: !success,
                            );
                          }
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showEditHopitalDialog(BuildContext context, WidgetRef ref, dynamic hopital) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController(text: hopital.nom);
    final adresseCtrl = TextEditingController(text: hopital.adresse);
    final villeCtrl = TextEditingController(text: hopital.ville);
    final telephoneCtrl = TextEditingController(text: hopital.telephone);
    final emailCtrl = TextEditingController(text: hopital.email);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Modifier Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nomCtrl,
                    decoration: const InputDecoration(labelText: 'Nom'),
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: adresseCtrl,
                    decoration: const InputDecoration(labelText: 'Adresse'),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: villeCtrl,
                    decoration: const InputDecoration(labelText: 'Ville'),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: telephoneCtrl,
                    decoration: const InputDecoration(labelText: 'Téléphone'),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(ctx);
              final data = {
                'nom': nomCtrl.text.trim(),
                'adresse': adresseCtrl.text.trim(),
                'ville': villeCtrl.text.trim(),
                'telephone': telephoneCtrl.text.trim(),
                'email': emailCtrl.text.trim(),
              };
              final success = await ref.read(hopitauxProvider.notifier).updateHopital(hopital.id, data);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Hôpital modifié avec succès' : 'Erreur lors de la modification',
                  isError: !success,
                );
              }
            },
            child: const Text('Modifier', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showCreateHopitalDialog(BuildContext context, WidgetRef ref) {
    final formKey = GlobalKey<FormState>();
    final nomCtrl = TextEditingController();
    final adresseCtrl = TextEditingController();
    final villeCtrl = TextEditingController();
    final telephoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final adminEmailCtrl = TextEditingController();
    final adminFirstNameCtrl = TextEditingController();
    final adminLastNameCtrl = TextEditingController();
    final adminTelephoneCtrl = TextEditingController();
    final adminDateNaissanceCtrl = TextEditingController();
    String adminSexe = 'M';
    final List<int> selectedServices = [];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: Text('Nouvel Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Informations de l\'hôpital',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: nomCtrl,
                      decoration: const InputDecoration(labelText: 'Nom'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adresseCtrl,
                      decoration: const InputDecoration(labelText: 'Adresse'),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: villeCtrl,
                      decoration: const InputDecoration(labelText: 'Ville'),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: telephoneCtrl,
                      decoration: const InputDecoration(labelText: 'Téléphone'),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: emailCtrl,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    Text('Administrateur de l\'hôpital',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminEmailCtrl,
                      decoration: const InputDecoration(labelText: 'Email admin'),
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminFirstNameCtrl,
                      decoration: const InputDecoration(labelText: 'Prénom admin'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminLastNameCtrl,
                      decoration: const InputDecoration(labelText: 'Nom admin'),
                      validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminTelephoneCtrl,
                      decoration: const InputDecoration(labelText: 'Téléphone admin'),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: adminDateNaissanceCtrl,
                      decoration: const InputDecoration(labelText: 'Date de naissance admin', hintText: 'AAAA-MM-JJ'),
                      readOnly: true,
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: ctx,
                          initialDate: DateTime(1990),
                          firstDate: DateTime(1920),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null) {
                          adminDateNaissanceCtrl.text =
                              '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                        }
                      },
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: adminSexe,
                      decoration: const InputDecoration(labelText: 'Sexe admin'),
                      items: const [
                        DropdownMenuItem(value: 'M', child: Text('Masculin')),
                        DropdownMenuItem(value: 'F', child: Text('Féminin')),
                      ],
                      onChanged: (v) => setState(() => adminSexe = v ?? 'M'),
                    ),
                    const SizedBox(height: 16),
                    Text('Services initiaux :',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    ref.watch(servicesProvider).when(
                          loading: () => const Center(child: CircularProgressIndicator()),
                          error: (e, _) => Text('Erreur services: $e'),
                          data: (services) => Column(
                            children: services.map((s) {
                              return CheckboxListTile(
                                title: Text(s.nom),
                                value: selectedServices.contains(s.id),
                                onChanged: (val) {
                                  setState(() {
                                    if (val == true) {
                                      selectedServices.add(s.id);
                                    } else {
                                      selectedServices.remove(s.id);
                                    }
                                  });
                                },
                              );
                            }).toList(),
                          ),
                        ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                Navigator.pop(ctx);
                final data = {
                  'nom': nomCtrl.text.trim(),
                  'adresse': adresseCtrl.text.trim(),
                  'ville': villeCtrl.text.trim(),
                  'telephone': telephoneCtrl.text.trim(),
                  'email': emailCtrl.text.trim(),
                  'admin_email': adminEmailCtrl.text.trim(),
                  'admin_first_name': adminFirstNameCtrl.text.trim(),
                  'admin_last_name': adminLastNameCtrl.text.trim(),
                  'admin_telephone': adminTelephoneCtrl.text.trim(),
                  'admin_date_naissance': adminDateNaissanceCtrl.text.trim(),
                  'admin_sexe': adminSexe,
                  'services_initiaux': selectedServices,
                };
                final success = await ref.read(hopitauxProvider.notifier).createHopital(data);
                if (context.mounted) {
                  Helpers.showSnackBar(
                    context,
                    success ? 'Hôpital créé avec succès' : 'Erreur lors de la création',
                    isError: !success,
                  );
                }
              },
              child: const Text('Créer', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
