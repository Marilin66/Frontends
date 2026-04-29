import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../core/widgets/animated_tap.dart';
import '../../../../core/widgets/fluid_card.dart';
import '../../../../core/widgets/safe_pop_scope.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  final Color primaryColor;
  
  const EditProfileScreen({
    super.key,
    this.primaryColor = AppColors.primary,
  });

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _telephoneController;
  late final TextEditingController _adresseController;
  late final TextEditingController _allergiesController;
  late final TextEditingController _secuController;
  late final TextEditingController _urgenceNomController;
  late final TextEditingController _urgenceTelController;
  DateTime? _selectedBirthDate;
  String? _selectedSexe;
  String? _selectedGroupeSanguin;
  bool _isDirty = false;

  void _markDirty() {
    if (!_isDirty) setState(() => _isDirty = true);
  }

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _firstNameController = TextEditingController(text: user?.firstName);
    _lastNameController = TextEditingController(text: user?.lastName);
    _telephoneController = TextEditingController(text: user?.telephone);
    _adresseController = TextEditingController(text: user?.adresse);
    _selectedBirthDate = user?.dateNaissance != null ? DateTime.tryParse(user!.dateNaissance!) : null;
    _selectedSexe = user?.sexe;
    
    if (user?.role == 'patient' && user?.patientProfile != null) {
      final p = user!.patientProfile!;
      _allergiesController = TextEditingController(text: p['allergies'] as String?);
      _secuController = TextEditingController(text: p['numero_secu'] as String?);
      _urgenceNomController = TextEditingController(text: p['contact_urgence_nom'] as String?);
      _urgenceTelController = TextEditingController(text: p['contact_urgence_tel'] as String?);
      _selectedGroupeSanguin = p['groupe_sanguin'] as String?;
    } else {
      _allergiesController = TextEditingController();
      _secuController = TextEditingController();
      _urgenceNomController = TextEditingController();
      _urgenceTelController = TextEditingController();
    }

    if (user?.role == 'medecin' && user?.medecinProfile != null) {
      _allergiesController.text = user!.medecinProfile!['biographie'] as String? ?? '';
    }
    if (user?.role == 'laborantin' && user?.laborantinProfile != null) {
      _secuController.text = user!.laborantinProfile!['laboratoire'] as String? ?? '';
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _telephoneController.dispose();
    _adresseController.dispose();
    _allergiesController.dispose();
    _secuController.dispose();
    _urgenceNomController.dispose();
    _urgenceTelController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final data = <String, dynamic>{
      'first_name': _firstNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'telephone': _telephoneController.text.trim(),
      'adresse': _adresseController.text.trim(),
      'date_naissance': _selectedBirthDate != null ? _selectedBirthDate!.toIso8601String().split('T')[0] : null,
      'sexe': _selectedSexe,
    };

    final role = ref.read(authProvider).user?.role;
    if (role == 'patient') {
      data['patient_profile'] = {
        'groupe_sanguin': _selectedGroupeSanguin,
        'allergies': _allergiesController.text.trim(),
        'numero_secu': _secuController.text.trim(),
        'contact_urgence_nom': _urgenceNomController.text.trim(),
        'contact_urgence_tel': _urgenceTelController.text.trim(),
      };
    } else if (role == 'medecin') {
      data['medecin_profile'] = {
        'biographie': _allergiesController.text.trim(),
      };
    } else if (role == 'laborantin') {
      data['laborantin_profile'] = {
        'laboratoire': _secuController.text.trim(),
      };
    }
    
    final success = await ref.read(authProvider.notifier).updateProfile(data);
    
    if (success && mounted) {
      Helpers.showSnackBar(context, 'Profil mis à jour avec succès.');
      context.pop();
    }
  }

  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isLoading = authState.status == AuthStatus.loading;
    final isPatient = user?.role == 'patient';

    return SafePopScope(
      isDirty: _isDirty,
      child: Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Modifier Profil', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: Form(
        key: _formKey,
        child: Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(primary: widget.primaryColor),
          ),
          child: Stepper(
            type: StepperType.vertical,
            currentStep: _currentStep,
            onStepTapped: (step) => setState(() => _currentStep = step),
            onStepContinue: () {
              final isLastStep = _currentStep == _getSteps(isPatient).length - 1;
              if (isLastStep) {
                _submit();
              } else {
                setState(() => _currentStep += 1);
              }
            },
            onStepCancel: () {
              if (_currentStep > 0) {
                setState(() => _currentStep -= 1);
              } else {
                if (context.canPop()) context.pop();
              }
            },
            controlsBuilder: (context, details) {
              final isLastStep = _currentStep == _getSteps(isPatient).length - 1;
              return Padding(
                padding: const EdgeInsets.only(top: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: isLoading ? null : details.onStepContinue,
                        style: FilledButton.styleFrom(
                          backgroundColor: widget.primaryColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: isLoading
                            ? SizedBox(
                                height: 20, 
                                width: 20, 
                                child: Shimmer.fromColors(
                                  baseColor: Colors.white.withOpacity(0.8),
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
                            : Text(isLastStep ? 'Enregistrer' : 'Suivant', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                      ),
                    ),
                    if (_currentStep > 0) ...[
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: details.onStepCancel,
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: Text('Retour', style: GoogleFonts.poppins()),
                      ),
                    ],
                  ],
                ),
              );
            },
            steps: _getSteps(isPatient),
          ),
        ),
      ),
    ),
    );
  }

  List<Step> _getSteps(bool isPatient) {
    return [
      Step(
        state: _currentStep > 0 ? StepState.complete : StepState.indexed,
        isActive: _currentStep >= 0,
        title: Text('Infos Personnelles', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Column(
          children: [
            const SizedBox(height: 8),
            TextFormField(
              controller: _firstNameController,
              onChanged: (_) => _markDirty(),
              decoration: const InputDecoration(labelText: 'Prénom', prefixIcon: Icon(Icons.person_outline)),
              validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _lastNameController,
              onChanged: (_) => _markDirty(),
              decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
              validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _telephoneController,
              onChanged: (_) => _markDirty(),
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Téléphone', prefixIcon: Icon(Icons.phone_outlined)),
              validator: (v) => v == null || v.isEmpty ? 'Requis' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _adresseController,
              onChanged: (_) => _markDirty(),
              decoration: const InputDecoration(labelText: 'Adresse', prefixIcon: Icon(Icons.location_on_outlined)),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: _selectedBirthDate ?? DateTime(1990),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (date != null) {
                        setState(() {
                          _selectedBirthDate = date;
                          _isDirty = true;
                        });
                      }
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(labelText: 'Naissance', prefixIcon: Icon(Icons.calendar_today_outlined)),
                      child: Text(
                        _selectedBirthDate != null 
                          ? DateFormat('dd/MM/yyyy', 'fr_FR').format(_selectedBirthDate!)
                          : 'Sélectionner',
                        style: GoogleFonts.poppins(fontSize: 13),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedSexe,
                    decoration: const InputDecoration(labelText: 'Sexe', prefixIcon: Icon(Icons.person_pin_outlined)),
                    items: const [
                      DropdownMenuItem(value: 'M', child: Text('H')),
                      DropdownMenuItem(value: 'F', child: Text('F')),
                      DropdownMenuItem(value: 'A', child: Text('?')),
                    ],
                    onChanged: (v) {
                      setState(() {
                        _selectedSexe = v;
                        _isDirty = true;
                      });
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      if (isPatient)
        Step(
          state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          isActive: _currentStep >= 1,
          title: Text('Infos Médicales', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: Column(
            children: [
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedGroupeSanguin,
                decoration: const InputDecoration(labelText: 'Groupe Sanguin', prefixIcon: Icon(Icons.bloodtype_outlined)),
                items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                onChanged: (v) {
                  setState(() {
                    _selectedGroupeSanguin = v;
                    _isDirty = true;
                  });
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _allergiesController,
                onChanged: (_) => _markDirty(),
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Allergies', prefixIcon: Icon(Icons.warning_amber_rounded), hintText: 'Ex: Penicilline...'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _secuController,
                onChanged: (_) => _markDirty(),
                decoration: const InputDecoration(labelText: 'Numéro Sécurité (NPI)', prefixIcon: Icon(Icons.badge_outlined)),
              ),
            ],
          ),
        ),
      if (isPatient)
        Step(
          state: _currentStep > 2 ? StepState.complete : StepState.indexed,
          isActive: _currentStep >= 2,
          title: Text('Contact d\'Urgence', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: Column(
            children: [
              const SizedBox(height: 8),
              TextFormField(
                controller: _urgenceNomController,
                onChanged: (_) => _markDirty(),
                decoration: const InputDecoration(labelText: 'Nom du contact', prefixIcon: Icon(Icons.contact_phone_outlined)),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _urgenceTelController,
                onChanged: (_) => _markDirty(),
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Téléphone du contact', prefixIcon: Icon(Icons.phone_android_outlined)),
              ),
            ],
          ),
        ),
      if (!isPatient)
        Step(
          state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          isActive: _currentStep >= 1,
          title: Text('Infos Professionnelles', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: Column(
            children: [
              const SizedBox(height: 8),
              TextFormField(
                controller: _allergiesController,
                onChanged: (_) => _markDirty(),
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: ref.read(authProvider).user?.role == 'medecin' ? 'Biographie' : 'Note',
                  prefixIcon: const Icon(Icons.description_outlined),
                ),
              ),
              if (ref.read(authProvider).user?.role == 'laborantin') ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _secuController,
                  onChanged: (_) => _markDirty(),
                  decoration: const InputDecoration(labelText: 'Laboratoire', prefixIcon: Icon(Icons.biotech_outlined)),
                ),
              ],
            ],
          ),
        ),
    ];
  }
}
