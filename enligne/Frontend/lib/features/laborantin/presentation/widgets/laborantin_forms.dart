import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:hopitel_app/core/theme/app_colors.dart';
import 'package:hopitel_app/core/utils/helpers.dart';
import 'package:hopitel_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:hopitel_app/features/laborantin/presentation/providers/laborantin_provider.dart';

class LaborantinManualInscriptionSheet extends ConsumerStatefulWidget {
  const LaborantinManualInscriptionSheet({super.key});

  @override
  ConsumerState<LaborantinManualInscriptionSheet> createState() => _LaborantinManualInscriptionSheetState();
}

class _LaborantinManualInscriptionSheetState extends ConsumerState<LaborantinManualInscriptionSheet> {
  final _formKey = GlobalKey<FormState>();
  final _searchController = TextEditingController();
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _emailController = TextEditingController();
  final _telController = TextEditingController();
  final _typeController = TextEditingController();
  
  dynamic _selectedPatient;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final patientsAsync = ref.watch(patientSearchProvider);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              ),
              const SizedBox(height: 20),
              Text('Inscrire un Patient', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              
              TextField(
                controller: _searchController,
                onChanged: (v) => ref.read(patientSearchProvider.notifier).search(v),
                decoration: InputDecoration(
                  hintText: 'Rechercher un patient inscrit...',
                  prefixIcon: const Icon(Icons.person_search_rounded),
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                ),
              ),
              
              if (_selectedPatient != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(15)),
                  child: Row(
                    children: [
                      const CircleAvatar(child: Icon(Icons.person)),
                      const SizedBox(width: 12),
                      Expanded(child: Text(_selectedPatient.fullName, style: GoogleFonts.poppins(fontWeight: FontWeight.bold))),
                      IconButton(icon: const Icon(Icons.cancel, color: AppColors.error), onPressed: () => setState(() => _selectedPatient = null)),
                    ],
                  ),
                ),
              ],

              patientsAsync.when(
                data: (patients) => patients.isEmpty || _selectedPatient != null
                    ? const SizedBox.shrink()
                    : ListView.builder(
                        shrinkWrap: true,
                        itemCount: patients.length,
                        itemBuilder: (c, i) => ListTile(
                          title: Text(patients[i].fullName),
                          onTap: () {
                            setState(() {
                              _selectedPatient = patients[i];
                              _nomController.text = patients[i].lastName;
                              _prenomController.text = patients[i].firstName;
                              _emailController.text = patients[i].email;
                              _searchController.clear();
                            });
                            ref.read(patientSearchProvider.notifier).search('');
                          },
                        ),
                      ),
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(child: _buildField('Prénom', _prenomController, req: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildField('Nom', _nomController, req: true)),
                ],
              ),
              const SizedBox(height: 12),
              _buildField('Email', _emailController, req: true, type: TextInputType.emailAddress),
              const SizedBox(height: 12),
              _buildField('Téléphone', _telController, type: TextInputType.phone),
              const SizedBox(height: 12),
              _buildField('Type d\'analyse (ex: NFS, Bilan)', _typeController, req: true),
              
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: _isLoading 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) 
                    : const Text('VALIDER L\'INSCRIPTION'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, {bool req = false, TextInputType? type}) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      decoration: InputDecoration(
        label: Text.rich(
          TextSpan(
            children: [
              TextSpan(text: label),
              if (req) const TextSpan(text: ' *', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (v) => req && (v == null || v.isEmpty) ? 'Ce champ est requis' : null,
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Vérifier que le laborantin a un hôpital avant de soumettre
    final user = ref.read(authProvider).user;
    if (user?.hopital == null) {
      Helpers.showSnackBar(
        context,
        'Votre compte n\'est pas associé à un hôpital. Contactez l\'administrateur.',
        isError: true,
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(laborantinPendingAnalysesProvider.notifier).creerDemande({
        if (_selectedPatient != null) 'patient': _selectedPatient.id,
        'patient_nom': _nomController.text.trim(),
        'patient_prenom': _prenomController.text.trim(),
        'patient_email': _emailController.text.trim(),
        'patient_telephone': _telController.text.trim(),
        'type_analyse': _typeController.text.trim(),
      });

      if (mounted) {
        Navigator.pop(context);
        Helpers.showSnackBar(context, 'Patient inscrit avec succès.');
        ref.read(laborantinPendingAnalysesProvider.notifier).refresh();
      }
    } catch (e) {
      if (mounted) {
        // ApiException.toString() retourne directement le message du backend
        final msg = e.toString().replaceAll('Exception: ', '');
        Helpers.showSnackBar(
          context,
          msg.isNotEmpty ? msg : 'Erreur lors de l\'inscription.',
          isError: true,
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
