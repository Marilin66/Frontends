import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/widgets/universal_back_button.dart';

import '../../../../core/theme/app_colors.dart';

enum AppLanguage { french, english }

class PatientLanguageContent extends ConsumerStatefulWidget {
  final Color primaryColor;

  const PatientLanguageContent({
    super.key,
    this.primaryColor = AppColors.patient,
  });

  @override
  ConsumerState<PatientLanguageContent> createState() => _PatientLanguageContentState();
}

class _PatientLanguageContentState extends ConsumerState<PatientLanguageContent> {
  AppLanguage _currentLanguage = AppLanguage.french;

  void _changeLanguage(AppLanguage language) {
    setState(() {
      _currentLanguage = language;
    });
  }

  // Unused methods removed

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Langue', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        leading: UniversalBackButton(),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Choisissez votre langue préférée',
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 20),
          
          // Option Français
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: _currentLanguage == AppLanguage.french 
                  ? Border.all(color: widget.primaryColor, width: 2)
                  : null,
            ),
            child: ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: widget.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.language, color: widget.primaryColor),
              ),
              title: Text(
                'Français',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: _currentLanguage == AppLanguage.french 
                      ? widget.primaryColor 
                      : AppColors.textPrimary,
                ),
              ),
              subtitle: Text(
                'Langue par défaut',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              trailing: _currentLanguage == AppLanguage.french
                  ? Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: widget.primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 16,
                      ),
                    )
                  : null,
              onTap: () {
                _changeLanguage(AppLanguage.french);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Langue changée en Français',
                      style: GoogleFonts.poppins(),
                    ),
                    backgroundColor: widget.primaryColor,
                  ),
                );
              },
            ),
          ),
          
          // Option Anglais
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: _currentLanguage == AppLanguage.english 
                  ? Border.all(color: widget.primaryColor, width: 2)
                  : null,
            ),
            child: ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: widget.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.language, color: widget.primaryColor),
              ),
              title: Text(
                'English',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: _currentLanguage == AppLanguage.english 
                      ? widget.primaryColor 
                      : AppColors.textPrimary,
                ),
              ),
              subtitle: Text(
                'English language',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              trailing: _currentLanguage == AppLanguage.english
                  ? Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: widget.primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 16,
                      ),
                    )
                  : null,
              onTap: () {
                _changeLanguage(AppLanguage.english);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Language changed to English',
                      style: GoogleFonts.poppins(),
                    ),
                    backgroundColor: widget.primaryColor,
                  ),
                );
              },
            ),
          ),
          
          const SizedBox(height: 40),
          
          // Information
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Note',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Le changement de langue affectera uniquement l\'interface de l\'application. Le contenu des messages et des rendez-vous restera dans la langue d\'origine.',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
