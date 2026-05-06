import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalLaborantinsContent extends ConsumerWidget {
  const AdminHopitalLaborantinsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final laborantinsAsync = ref.watch(adminHopitalLaborantinsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Laborantins', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(adminHopitalLaborantinsProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.laborantin,
        onPressed: () => _showCreateLaborantinDialog(context),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: laborantinsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (laborantins) {
          if (laborantins.isEmpty) {
            return const Center(child: Text('Aucun laborantin'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: laborantins.length,
            itemBuilder: (context, index) {
              final lab = laborantins[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.laborantin.withValues(alpha: 0.1),
                    child: const Icon(Icons.biotech, color: AppColors.laborantin),
                  ),
                  title: Text(lab.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  subtitle: Text(lab.email),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, color: AppColors.primary),
                        onPressed: () => _showEditLaborantinDialog(context, lab),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppColors.error),
                        onPressed: () => _confirmDelete(context, ref, lab.id, lab.fullName),
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

  void _showCreateLaborantinDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const LaborantinFormDialog(),
    );
  }

  void _showEditLaborantinDialog(BuildContext context, dynamic lab) {
    showDialog(
      context: context,
      builder: (ctx) => LaborantinFormDialog(laborantin: lab),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, int id, String name) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer / Désactiver'),
        content: Text('Voulez-vous supprimer le compte de $name ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Annuler')),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await ref.read(adminHopitalLaborantinsProvider.notifier).deactivateLaborantin(id);
              if (context.mounted) {
                Helpers.showSnackBar(context, ok ? 'Supprimé' : 'Erreur', isError: !ok);
              }
            },
            child: const Text('Supprimer', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}

class LaborantinFormDialog extends ConsumerStatefulWidget {
  final dynamic laborantin;
  const LaborantinFormDialog({super.key, this.laborantin});

  @override
  ConsumerState<LaborantinFormDialog> createState() => _LaborantinFormDialogState();
}

class _LaborantinFormDialogState extends ConsumerState<LaborantinFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailCtrl;
  late final TextEditingController _firstNameCtrl;
  late final TextEditingController _lastNameCtrl;
  late final TextEditingController _telCtrl;

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController(text: widget.laborantin?.email);
    _firstNameCtrl = TextEditingController(text: widget.laborantin?.firstName);
    _lastNameCtrl = TextEditingController(text: widget.laborantin?.lastName);
    _telCtrl = TextEditingController(text: widget.laborantin?.telephone);
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.laborantin != null;
    return AlertDialog(
      title: Text(isEdit ? 'Modifier Laborantin' : 'Nouveau Laborantin'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (v) => v!.isEmpty ? 'Requis' : null,
              ),
              TextFormField(
                controller: _firstNameCtrl,
                decoration: const InputDecoration(labelText: 'Prénom'),
                validator: (v) => v!.isEmpty ? 'Requis' : null,
              ),
              TextFormField(
                controller: _lastNameCtrl,
                decoration: const InputDecoration(labelText: 'Nom'),
                validator: (v) => v!.isEmpty ? 'Requis' : null,
              ),
              TextFormField(
                controller: _telCtrl,
                decoration: const InputDecoration(labelText: 'Téléphone'),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
        ElevatedButton(
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final data = {
              'email': _emailCtrl.text.trim(),
              'first_name': _firstNameCtrl.text.trim(),
              'last_name': _lastNameCtrl.text.trim(),
              'telephone': _telCtrl.text.trim(),
            };
            
            Navigator.pop(context);
            bool success;
            if (isEdit) {
              success = await ref.read(adminHopitalLaborantinsProvider.notifier).updateLaborantin(widget.laborantin.id, data);
            } else {
              success = await ref.read(adminHopitalLaborantinsProvider.notifier).createLaborantin(data);
            }
            
            if (context.mounted) {
              Helpers.showSnackBar(context, success ? 'Opération réussie' : 'Échec', isError: !success);
            }
          },
          child: Text(isEdit ? 'Modifier' : 'Créer'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _telCtrl.dispose();
    super.dispose();
  }
}
