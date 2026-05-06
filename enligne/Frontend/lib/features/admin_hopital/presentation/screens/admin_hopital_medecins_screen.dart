import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalMedecinsContent extends ConsumerWidget {
  const AdminHopitalMedecinsContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medecinsAsync = ref.watch(adminHopitalMedecinsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Médecins', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(adminHopitalMedecinsProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.medecin,
        onPressed: () => _showCreateMedecinDialog(context, ref),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: medecinsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (medecins) {
          if (medecins.isEmpty) {
            return const Center(child: Text('Aucun médecin'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: medecins.length,
            itemBuilder: (context, index) {
              final m = medecins[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.medecin.withValues(alpha: 0.1),
                    child: const Icon(Icons.person, color: AppColors.medecin),
                  ),
                  title: Text(m.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  subtitle: Text(m.email),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, color: AppColors.primary),
                        tooltip: 'Modifier',
                        onPressed: () => _showEditMedecinDialog(context, ref, m),
                      ),
                      IconButton(
                        icon: const Icon(Icons.block, color: AppColors.error),
                        tooltip: 'Désactiver',
                        onPressed: () => _confirmDeactivate(context, ref, m.id, m.fullName),
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

  void _showEditMedecinDialog(BuildContext context, WidgetRef ref, dynamic medecin) {
    ref.read(adminHopitalHopitalServicesProvider); 

    showDialog(
      context: context,
      builder: (ctx) => EditMedecinDialogForm(medecin: medecin),
    );
  }

  void _confirmDeactivate(BuildContext context, WidgetRef ref, int id, String name) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Désactiver', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text('Voulez-vous désactiver le médecin $name ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await ref.read(adminHopitalMedecinsProvider.notifier).deactivateMedecin(id);
              if (context.mounted) {
                Helpers.showSnackBar(
                  context,
                  success ? 'Médecin désactivé' : 'Erreur lors de la désactivation',
                  isError: !success,
                );
              }
            },
            child: const Text('Désactiver', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showCreateMedecinDialog(BuildContext context, WidgetRef ref) {
    // S'assurer que les services sont chargés
    ref.read(adminHopitalHopitalServicesProvider); 

    showDialog(
      context: context,
      builder: (ctx) => const CreateMedecinDialogForm(),
    );
  }
}

class CreateMedecinDialogForm extends ConsumerStatefulWidget {
  const CreateMedecinDialogForm({super.key});

  @override
  ConsumerState<CreateMedecinDialogForm> createState() => _CreateMedecinDialogFormState();
}

class _CreateMedecinDialogFormState extends ConsumerState<CreateMedecinDialogForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _telephoneCtrl = TextEditingController();
  
  final List<int> _selectedServices = [];

  @override
  Widget build(BuildContext context) {
    final servicesState = ref.watch(adminHopitalHopitalServicesProvider);

    return AlertDialog(
      title: Text('Nouveau Médecin', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _firstNameCtrl,
                decoration: const InputDecoration(labelText: 'Prénom'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _lastNameCtrl,
                decoration: const InputDecoration(labelText: 'Nom'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _telephoneCtrl,
                decoration: const InputDecoration(labelText: 'Téléphone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Services du médecin :', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              ),
              if (servicesState.isLoading)
                const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator())
              else if (servicesState.hasValue)
                ...servicesState.value!.map((service) {
                  return CheckboxListTile(
                    title: Text(service.serviceNom),
                    value: _selectedServices.contains(service.service),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedServices.add(service.service);
                        } else {
                          _selectedServices.remove(service.service);
                        }
                      });
                    },
                  );
                }),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.medecin),
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final data = {
              'email': _emailCtrl.text.trim(),
              'first_name': _firstNameCtrl.text.trim(),
              'last_name': _lastNameCtrl.text.trim(),
              'telephone': _telephoneCtrl.text.trim(),
              'service_ids': _selectedServices.toList()
            };
            
            Navigator.pop(context);
            
            final success = await ref.read(adminHopitalMedecinsProvider.notifier).createMedecin(data);
            if (context.mounted) {
              Helpers.showSnackBar(
                context,
                success ? 'Médecin créé avec succès' : 'Erreur lors de la création',
                isError: !success,
              );
            }
          },
          child: const Text('Créer', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _telephoneCtrl.dispose();
    super.dispose();
  }
}

class EditMedecinDialogForm extends ConsumerStatefulWidget {
  final dynamic medecin;
  
  const EditMedecinDialogForm({super.key, required this.medecin});

  @override
  ConsumerState<EditMedecinDialogForm> createState() => _EditMedecinDialogFormState();
}

class _EditMedecinDialogFormState extends ConsumerState<EditMedecinDialogForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailCtrl;
  late final TextEditingController _firstNameCtrl;
  late final TextEditingController _lastNameCtrl;
  late final TextEditingController _telephoneCtrl;
  
  final List<int> _selectedServices = [];

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController(text: widget.medecin.email);
    _firstNameCtrl = TextEditingController(text: widget.medecin.firstName);
    _lastNameCtrl = TextEditingController(text: widget.medecin.lastName);
    _telephoneCtrl = TextEditingController(text: widget.medecin.telephone ?? '');
    _selectedServices.addAll(widget.medecin.serviceIds ?? []);
  }

  @override
  Widget build(BuildContext context) {
    final servicesState = ref.watch(adminHopitalHopitalServicesProvider);

    return AlertDialog(
      title: Text('Modifier Médecin', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _firstNameCtrl,
                decoration: const InputDecoration(labelText: 'Prénom'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _lastNameCtrl,
                decoration: const InputDecoration(labelText: 'Nom'),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _telephoneCtrl,
                decoration: const InputDecoration(labelText: 'Téléphone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Services du médecin :', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              ),
              if (servicesState.isLoading)
                const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator())
              else if (servicesState.hasValue)
                ...servicesState.value!.map((service) {
                  return CheckboxListTile(
                    title: Text(service.serviceNom),
                    value: _selectedServices.contains(service.service),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedServices.add(service.service);
                        } else {
                          _selectedServices.remove(service.service);
                        }
                      });
                    },
                  );
                }),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.medecin),
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final data = {
              'email': _emailCtrl.text.trim(),
              'first_name': _firstNameCtrl.text.trim(),
              'last_name': _lastNameCtrl.text.trim(),
              'telephone': _telephoneCtrl.text.trim(),
              'service_ids': _selectedServices.toList()
            };
            
            Navigator.pop(context);
            
            final success = await ref.read(adminHopitalMedecinsProvider.notifier).updateMedecin(widget.medecin.id, data);
            if (context.mounted) {
              Helpers.showSnackBar(
                context,
                success ? 'Médecin modifié avec succès' : 'Erreur lors de la modification',
                isError: !success,
              );
            }
          },
          child: const Text('Modifier', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _telephoneCtrl.dispose();
    super.dispose();
  }
}
