import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:dio/dio.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
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
          // Bouton import CSV
          IconButton(
            icon: const Icon(Icons.upload_file),
            tooltip: 'Importer CSV',
            onPressed: () => _importCSV(context, ref),
          ),
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
    ref.read(adminHopitalServicesProvider);

    showDialog(
      context: context,
      builder: (ctx) => EditMedecinDialogForm(medecin: medecin),
    );
  }

  void _importCSV(BuildContext context, WidgetRef ref) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv'],
      withData: kIsWeb,
    );
    if (result == null) return;
    final file = result.files.first;

    try {
      final client = ref.read(dioClientProvider);
      final multipart = kIsWeb
          ? MultipartFile.fromBytes(file.bytes!, filename: file.name)
          : await MultipartFile.fromFile(file.path!, filename: file.name);
      final formData = FormData.fromMap({'fichier': multipart});
      await client.post(ApiConstants.medecinsImport, data: formData);
      ref.read(adminHopitalMedecinsProvider.notifier).refresh();
      if (context.mounted) {
        Helpers.showSnackBar(context, 'Import CSV réussi !');
      }
    } catch (e) {
      if (context.mounted) {
        Helpers.showSnackBar(context, 'Erreur lors de l\'import CSV', isError: true);
      }
    }
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
    ref.read(adminHopitalServicesProvider); 

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
  final _numeroOrdreCtrl = TextEditingController();
  final _biographieCtrl = TextEditingController();
  final _dateNaissanceCtrl = TextEditingController(text: '1985-01-01');
  String _sexe = 'M';
  
  final List<int> _selectedServices = [];

  @override
  Widget build(BuildContext context) {
    final servicesState = ref.watch(adminHopitalServicesProvider);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(
        'Nouveau Médecin',
        style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: AppColors.medecin),
      ),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(
                  labelText: 'Email *',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _firstNameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Prénom *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _lastNameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nom *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _telephoneCtrl,
                decoration: const InputDecoration(
                  labelText: 'Téléphone *',
                  prefixIcon: Icon(Icons.phone_outlined),
                  hintText: 'Ex: 0197000000',
                ),
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Requis';
                  if (v.length != 10 || !v.startsWith('01')) {
                    return "Doit comporter 10 chiffres et commencer par '01'";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _numeroOrdreCtrl,
                decoration: const InputDecoration(
                  labelText: 'N° d\'Ordre (optionnel)',
                  prefixIcon: Icon(Icons.assignment_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _biographieCtrl,
                decoration: const InputDecoration(
                  labelText: 'Biographie (optionnelle)',
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _dateNaissanceCtrl,
                decoration: const InputDecoration(
                  labelText: 'Date de naissance *',
                  prefixIcon: Icon(Icons.calendar_today_outlined),
                ),
                readOnly: true,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                onTap: () async {
                  final initialDate = DateTime.tryParse(_dateNaissanceCtrl.text) ?? DateTime(1985, 1, 1);
                  final date = await showDatePicker(
                    context: context,
                    initialDate: initialDate,
                    firstDate: DateTime(1930),
                    lastDate: DateTime.now(),
                  );
                  if (date != null) {
                    setState(() {
                      _dateNaissanceCtrl.text = date.toString().split(' ')[0];
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _sexe,
                decoration: const InputDecoration(
                  labelText: 'Sexe *',
                  prefixIcon: Icon(Icons.wc_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'M', child: Text('Masculin')),
                  DropdownMenuItem(value: 'F', child: Text('Féminin')),
                ],
                onChanged: (val) {
                  setState(() {
                    if (val != null) _sexe = val;
                  });
                },
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Services du médecin * :',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
              const SizedBox(height: 8),
              if (servicesState.isLoading)
                const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator())
              else if (servicesState.hasValue)
                ...servicesState.value!.map((service) {
                  return CheckboxListTile(
                    title: Text(service.nom),
                    activeColor: AppColors.medecin,
                    value: _selectedServices.contains(service.id),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedServices.add(service.id);
                        } else {
                          _selectedServices.remove(service.id);
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
          child: Text('Annuler', style: GoogleFonts.poppins(color: Colors.grey)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.medecin,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final data = {
              'email': _emailCtrl.text.trim(),
              'first_name': _firstNameCtrl.text.trim(),
              'last_name': _lastNameCtrl.text.trim(),
              'telephone': _telephoneCtrl.text.trim(),
              'numero_ordre': _numeroOrdreCtrl.text.trim(),
              'biographie': _biographieCtrl.text.trim(),
              'date_naissance': _dateNaissanceCtrl.text.trim(),
              'sexe': _sexe,
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
          child: Text('Créer', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white)),
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
    _numeroOrdreCtrl.dispose();
    _biographieCtrl.dispose();
    _dateNaissanceCtrl.dispose();
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
  late final TextEditingController _numeroOrdreCtrl;
  late final TextEditingController _biographieCtrl;
  late final TextEditingController _dateNaissanceCtrl;
  String _sexe = 'M';
  
  final List<int> _selectedServices = [];

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController(text: widget.medecin.email);
    _firstNameCtrl = TextEditingController(text: widget.medecin.firstName);
    _lastNameCtrl = TextEditingController(text: widget.medecin.lastName);
    _telephoneCtrl = TextEditingController(text: widget.medecin.telephone ?? '');
    
    // Extract numero_ordre and biographie
    final profileNum = widget.medecin.medecinProfile?['numero_ordre']?.toString() ?? '';
    _numeroOrdreCtrl = TextEditingController(text: profileNum);

    final profileBio = widget.medecin.medecinProfile?['biographie']?.toString() ?? '';
    _biographieCtrl = TextEditingController(text: profileBio);

    _dateNaissanceCtrl = TextEditingController(text: widget.medecin.dateNaissance ?? '1985-01-01');
    _sexe = (widget.medecin.sexe == null || widget.medecin.sexe.isEmpty) ? 'M' : widget.medecin.sexe;

    _selectedServices.addAll(widget.medecin.serviceIds ?? []);
  }

  @override
  Widget build(BuildContext context) {
    final servicesState = ref.watch(adminHopitalServicesProvider);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(
        'Modifier Médecin',
        style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: AppColors.medecin),
      ),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(
                  labelText: 'Email *',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _firstNameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Prénom *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _lastNameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nom *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _telephoneCtrl,
                decoration: const InputDecoration(
                  labelText: 'Téléphone *',
                  prefixIcon: Icon(Icons.phone_outlined),
                  hintText: 'Ex: 0197000000',
                ),
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Requis';
                  if (v.length != 10 || !v.startsWith('01')) {
                    return "Doit comporter 10 chiffres et commencer par '01'";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _numeroOrdreCtrl,
                decoration: const InputDecoration(
                  labelText: 'N° d\'Ordre (optionnel)',
                  prefixIcon: Icon(Icons.assignment_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _biographieCtrl,
                decoration: const InputDecoration(
                  labelText: 'Biographie (optionnelle)',
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _dateNaissanceCtrl,
                decoration: const InputDecoration(
                  labelText: 'Date de naissance *',
                  prefixIcon: Icon(Icons.calendar_today_outlined),
                ),
                readOnly: true,
                validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
                onTap: () async {
                  final initialDate = DateTime.tryParse(_dateNaissanceCtrl.text) ?? DateTime(1985, 1, 1);
                  final date = await showDatePicker(
                    context: context,
                    initialDate: initialDate,
                    firstDate: DateTime(1930),
                    lastDate: DateTime.now(),
                  );
                  if (date != null) {
                    setState(() {
                      _dateNaissanceCtrl.text = date.toString().split(' ')[0];
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _sexe,
                decoration: const InputDecoration(
                  labelText: 'Sexe *',
                  prefixIcon: Icon(Icons.wc_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'M', child: Text('Masculin')),
                  DropdownMenuItem(value: 'F', child: Text('Féminin')),
                ],
                onChanged: (val) {
                  setState(() {
                    if (val != null) _sexe = val;
                  });
                },
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Services du médecin * :',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
              const SizedBox(height: 8),
              if (servicesState.isLoading)
                const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator())
              else if (servicesState.hasValue)
                ...servicesState.value!.map((service) {
                  return CheckboxListTile(
                    title: Text(service.nom),
                    activeColor: AppColors.medecin,
                    value: _selectedServices.contains(service.id),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedServices.add(service.id);
                        } else {
                          _selectedServices.remove(service.id);
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
          child: Text('Annuler', style: GoogleFonts.poppins(color: Colors.grey)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.medecin,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final data = {
              'email': _emailCtrl.text.trim(),
              'first_name': _firstNameCtrl.text.trim(),
              'last_name': _lastNameCtrl.text.trim(),
              'telephone': _telephoneCtrl.text.trim(),
              'numero_ordre': _numeroOrdreCtrl.text.trim(),
              'biographie': _biographieCtrl.text.trim(),
              'date_naissance': _dateNaissanceCtrl.text.trim(),
              'sexe': _sexe,
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
          child: Text('Modifier', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white)),
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
    _numeroOrdreCtrl.dispose();
    _biographieCtrl.dispose();
    _dateNaissanceCtrl.dispose();
    super.dispose();
  }
}
