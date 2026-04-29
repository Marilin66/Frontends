import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminUsersContent extends ConsumerWidget {
  const SuperAdminUsersContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final adminsAsync = ref.watch(adminHopitauxProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Utilisateurs', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(adminHopitauxProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.adminHopital,
        onPressed: () => _showCreateAdminDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: adminsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (admins) {
          if (admins.isEmpty) return const Center(child: Text('Aucun administrateur'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: admins.length,
            itemBuilder: (context, index) {
              final a = admins[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.adminHopital.withOpacity(0.1),
                    child: const Icon(Icons.admin_panel_settings, color: AppColors.adminHopital),
                  ),
                  title: Text('${a['first_name'] ?? ''} ${a['last_name'] ?? ''}', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  subtitle: Text('${a['email'] ?? ''}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, color: AppColors.primary),
                        tooltip: 'Modifier',
                        onPressed: () => _showEditAdminDialog(context, ref, a),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: AppColors.error),
                        tooltip: 'Supprimer',
                        onPressed: () => _confirmDelete(context, ref, a['id'], '${a['first_name']} ${a['last_name']}'),
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

  void _confirmDelete(BuildContext context, WidgetRef ref, int id, String name) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Supprimer', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text('Voulez-vous supprimer l\'administrateur $name ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await ref.read(adminHopitauxProvider.notifier).deleteAdminHopital(id);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Administrateur supprimé' : 'Erreur lors de la suppression',
                  isError: !success,
                );
              }
            },
            child: const Text('Supprimer', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showEditAdminDialog(BuildContext context, WidgetRef ref, dynamic admin) {
    final formKey = GlobalKey<FormState>();
    final emailCtrl = TextEditingController(text: admin['email']);
    final firstNameCtrl = TextEditingController(text: admin['first_name']);
    final lastNameCtrl = TextEditingController(text: admin['last_name']);
    final telephoneCtrl = TextEditingController(text: admin['telephone'] ?? '');
    final hopitalCtrl = TextEditingController(text: admin['hopital']?.toString() ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Modifier Admin Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: emailCtrl,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: firstNameCtrl,
                  decoration: const InputDecoration(labelText: 'Prénom'),
                  validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: lastNameCtrl,
                  decoration: const InputDecoration(labelText: 'Nom'),
                  validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: telephoneCtrl,
                  decoration: const InputDecoration(labelText: 'Téléphone'),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: hopitalCtrl,
                  decoration: const InputDecoration(labelText: 'ID Hôpital'),
                  keyboardType: TextInputType.number,
                  validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.adminHopital),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(ctx);
              final data = {
                'email': emailCtrl.text.trim(),
                'first_name': firstNameCtrl.text.trim(),
                'last_name': lastNameCtrl.text.trim(),
                'telephone': telephoneCtrl.text.trim(),
                'hopital': int.tryParse(hopitalCtrl.text.trim()) ?? 0,
              };
              final success = await ref.read(adminHopitauxProvider.notifier).updateAdminHopital(admin['id'], data);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Administrateur modifié avec succès' : 'Erreur lors de la modification',
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

  void _showCreateAdminDialog(BuildContext context, WidgetRef ref) {
    final formKey = GlobalKey<FormState>();
    final emailCtrl = TextEditingController();
    final firstNameCtrl = TextEditingController();
    final lastNameCtrl = TextEditingController();
    final telephoneCtrl = TextEditingController();
    final dateNaissanceCtrl = TextEditingController();
    final hopitalCtrl = TextEditingController();
    String sexe = 'M';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: Text('Nouvel Admin Hôpital', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: firstNameCtrl,
                    decoration: const InputDecoration(labelText: 'Prénom'),
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: lastNameCtrl,
                    decoration: const InputDecoration(labelText: 'Nom'),
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: telephoneCtrl,
                    decoration: const InputDecoration(labelText: 'Téléphone'),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: dateNaissanceCtrl,
                    decoration: const InputDecoration(labelText: 'Date de naissance', hintText: 'AAAA-MM-JJ'),
                    readOnly: true,
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: ctx,
                        initialDate: DateTime(1990),
                        firstDate: DateTime(1920),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null) {
                        dateNaissanceCtrl.text =
                            '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                      }
                    },
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: sexe,
                    decoration: const InputDecoration(labelText: 'Sexe'),
                    items: const [
                      DropdownMenuItem(value: 'M', child: Text('Masculin')),
                      DropdownMenuItem(value: 'F', child: Text('Féminin')),
                    ],
                    onChanged: (v) => setState(() => sexe = v ?? 'M'),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: hopitalCtrl,
                    decoration: const InputDecoration(labelText: 'ID Hôpital'),
                    keyboardType: TextInputType.number,
                    validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.adminHopital),
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                Navigator.pop(ctx);
                final data = {
                  'email': emailCtrl.text.trim(),
                  'first_name': firstNameCtrl.text.trim(),
                  'last_name': lastNameCtrl.text.trim(),
                  'telephone': telephoneCtrl.text.trim(),
                  'date_naissance': dateNaissanceCtrl.text.trim(),
                  'sexe': sexe,
                  'hopital': int.tryParse(hopitalCtrl.text.trim()) ?? 0,
                };
                final success = await ref.read(adminHopitauxProvider.notifier).createAdminHopital(data);
                if (context.mounted) {
                  Helpers.showSnackBar(
                    context,
                    success ? 'Administrateur créé avec succès' : 'Erreur lors de la création',
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
