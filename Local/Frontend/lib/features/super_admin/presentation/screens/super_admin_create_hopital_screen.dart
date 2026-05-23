import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/universal_back_button.dart';
import '../providers/super_admin_provider.dart';

class SuperAdminCreateHopitalScreen extends ConsumerStatefulWidget {
  const SuperAdminCreateHopitalScreen({super.key});

  @override
  ConsumerState<SuperAdminCreateHopitalScreen> createState() =>
      _SuperAdminCreateHopitalScreenState();
}

class _SuperAdminCreateHopitalScreenState
    extends ConsumerState<SuperAdminCreateHopitalScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  final _nomCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telephoneCtrl = TextEditingController();
  final _adresseCtrl = TextEditingController();
  final _villeCtrl = TextEditingController();

  final _adminEmailCtrl = TextEditingController();
  final _adminFirstNameCtrl = TextEditingController();
  final _adminLastNameCtrl = TextEditingController();
  final _adminTelephoneCtrl = TextEditingController();
  final _adminDateNaissanceCtrl = TextEditingController();
  String _adminSexe = 'M';
  
  final List<int> _selectedServices = [];

  @override
  void dispose() {
    _nomCtrl.dispose();
    _emailCtrl.dispose();
    _telephoneCtrl.dispose();
    _adresseCtrl.dispose();
    _villeCtrl.dispose();
    _adminEmailCtrl.dispose();
    _adminFirstNameCtrl.dispose();
    _adminLastNameCtrl.dispose();
    _adminTelephoneCtrl.dispose();
    _adminDateNaissanceCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final data = {
      'nom': _nomCtrl.text.trim(),
      'adresse': _adresseCtrl.text.trim(),
      'ville': _villeCtrl.text.trim(),
      'telephone': _telephoneCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'admin_email': _adminEmailCtrl.text.trim(),
      'admin_first_name': _adminFirstNameCtrl.text.trim(),
      'admin_last_name': _adminLastNameCtrl.text.trim(),
      'admin_telephone': _adminTelephoneCtrl.text.trim(),
      'admin_date_naissance': _adminDateNaissanceCtrl.text.trim(),
      'admin_sexe': _adminSexe,
      'services_initiaux': _selectedServices,
    };

    final success = await ref
        .read(hopitauxProvider.notifier)
        .createHopital(data);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Hôpital créé avec succès'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop(); // Retourne à la liste
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la création de l\'hôpital'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Nouvel Hôpital',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSectionTitle('Informations de l\'hôpital'),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _nomCtrl,
                  label: 'Nom de l\'hôpital *',
                  icon: Icons.local_hospital_outlined,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adresseCtrl,
                  label: 'Adresse *',
                  icon: Icons.map_outlined,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _villeCtrl,
                  label: 'Ville *',
                  icon: Icons.location_city_outlined,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _telephoneCtrl,
                  label: 'Téléphone *',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _emailCtrl,
                  label: 'Email *',
                  icon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Requis';
                    if (!v.contains('@')) return 'Email invalide';
                    return null;
                  },
                ),

                const SizedBox(height: 32),
                _buildSectionTitle('Administrateur Principal'),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adminFirstNameCtrl,
                  label: 'Prénom *',
                  icon: Icons.person_outline,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adminLastNameCtrl,
                  label: 'Nom *',
                  icon: Icons.person_outline,
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adminEmailCtrl,
                  label: 'Email Admin *',
                  icon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Requis';
                    if (!v.contains('@')) return 'Email invalide';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adminTelephoneCtrl,
                  label: 'Téléphone Admin',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _adminDateNaissanceCtrl,
                  label: 'Date de naissance *',
                  icon: Icons.calendar_today_outlined,
                  readOnly: true,
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime(1990),
                      firstDate: DateTime(1920),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      _adminDateNaissanceCtrl.text =
                          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                    }
                  },
                  validator: (v) => v!.isEmpty ? 'Requis' : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _adminSexe,
                  decoration: InputDecoration(
                    labelText: 'Sexe',
                    prefixIcon: const Icon(Icons.wc, color: AppColors.superAdmin),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'M', child: Text('Masculin')),
                    DropdownMenuItem(value: 'F', child: Text('Féminin')),
                  ],
                  onChanged: (v) => setState(() => _adminSexe = v ?? 'M'),
                ),

                const SizedBox(height: 32),
                _buildSectionTitle('Services initiaux (Optionnel)'),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.textHint.withValues(alpha: 0.2)),
                  ),
                  child: ref.watch(servicesProvider).when(
                    loading: () => const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    error: (e, _) => Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text('Erreur: $e', style: const TextStyle(color: AppColors.error)),
                    ),
                    data: (services) => Column(
                      children: services.map((s) {
                        return CheckboxListTile(
                          title: Text(s.nom, style: GoogleFonts.poppins()),
                          activeColor: AppColors.superAdmin,
                          value: _selectedServices.contains(s.id),
                          onChanged: (val) {
                            setState(() {
                              if (val == true) {
                                _selectedServices.add(s.id);
                              } else {
                                _selectedServices.remove(s.id);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ),
                ),

                const SizedBox(height: 48),
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.superAdmin,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            'Créer l\'hôpital',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.superAdmin,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    bool readOnly = false,
    VoidCallback? onTap,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      onTap: onTap,
      validator: validator,
      style: GoogleFonts.poppins(fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: AppColors.textHint),
        prefixIcon: Icon(icon, color: AppColors.superAdmin.withValues(alpha: 0.7)),
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.textHint.withValues(alpha: 0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.superAdmin, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }
}
