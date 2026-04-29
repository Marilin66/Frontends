import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import 'package:hopitel_app/core/widgets/universal_back_button.dart';

class NotificationSettings {
  final bool pushEnabled;
  final bool emailEnabled;
  final bool appointmentReminders;
  final bool messageNotifications;
  final bool systemUpdates;

  const NotificationSettings({
    this.pushEnabled = true,
    this.emailEnabled = true,
    this.appointmentReminders = true,
    this.messageNotifications = true,
    this.systemUpdates = false,
  });

  NotificationSettings copyWith({
    bool? pushEnabled,
    bool? emailEnabled,
    bool? appointmentReminders,
    bool? messageNotifications,
    bool? systemUpdates,
  }) {
    return NotificationSettings(
      pushEnabled: pushEnabled ?? this.pushEnabled,
      emailEnabled: emailEnabled ?? this.emailEnabled,
      appointmentReminders: appointmentReminders ?? this.appointmentReminders,
      messageNotifications: messageNotifications ?? this.messageNotifications,
      systemUpdates: systemUpdates ?? this.systemUpdates,
    );
  }
}

class PatientNotificationSettingsContent extends ConsumerStatefulWidget {
  final Color primaryColor;

  const PatientNotificationSettingsContent({
    super.key,
    this.primaryColor = AppColors.patient,
  });

  @override
  ConsumerState<PatientNotificationSettingsContent> createState() => _PatientNotificationSettingsContentState();
}

class _PatientNotificationSettingsContentState extends ConsumerState<PatientNotificationSettingsContent> {
  NotificationSettings _settings = const NotificationSettings();

  void _togglePush() {
    setState(() {
      _settings = _settings.copyWith(pushEnabled: !_settings.pushEnabled);
    });
    _showNotificationSnackBar('Notifications push', _settings.pushEnabled);
  }

  void _toggleEmail() {
    setState(() {
      _settings = _settings.copyWith(emailEnabled: !_settings.emailEnabled);
    });
    _showNotificationSnackBar('Notifications email', _settings.emailEnabled);
  }

  void _toggleAppointmentReminders() {
    setState(() {
      _settings = _settings.copyWith(appointmentReminders: !_settings.appointmentReminders);
    });
    _showNotificationSnackBar('Rappels de rendez-vous', _settings.appointmentReminders);
  }

  void _toggleMessageNotifications() {
    setState(() {
      _settings = _settings.copyWith(messageNotifications: !_settings.messageNotifications);
    });
    _showNotificationSnackBar('Notifications de messages', _settings.messageNotifications);
  }

  void _toggleSystemUpdates() {
    setState(() {
      _settings = _settings.copyWith(systemUpdates: !_settings.systemUpdates);
    });
    _showNotificationSnackBar('Mises à jour système', _settings.systemUpdates);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Paramètres de notification', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Notifications push
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SwitchListTile(
              value: _settings.pushEnabled,
              onChanged: (value) => _togglePush(),
              secondary: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _settings.pushEnabled 
                      ? widget.primaryColor.withOpacity(0.1)
                      : AppColors.textHint.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.notifications_active,
                  color: _settings.pushEnabled ? widget.primaryColor : AppColors.textHint,
                ),
              ),
              title: Text(
                'Notifications push',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Recevoir des notifications sur votre appareil',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              activeThumbColor: widget.primaryColor,
            ),
          ),
          
          // Notifications email
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SwitchListTile(
              value: _settings.emailEnabled,
              onChanged: (value) => _toggleEmail(),
              secondary: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _settings.emailEnabled 
                      ? widget.primaryColor.withOpacity(0.1)
                      : AppColors.textHint.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.email,
                  color: _settings.emailEnabled ? widget.primaryColor : AppColors.textHint,
                ),
              ),
              title: Text(
                'Notifications email',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Recevoir des notifications par email',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              activeThumbColor: widget.primaryColor,
            ),
          ),
          
          // Rappels de rendez-vous
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SwitchListTile(
              value: _settings.appointmentReminders,
              onChanged: (value) => _toggleAppointmentReminders(),
              secondary: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _settings.appointmentReminders 
                      ? widget.primaryColor.withOpacity(0.1)
                      : AppColors.textHint.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.calendar_today,
                  color: _settings.appointmentReminders ? widget.primaryColor : AppColors.textHint,
                ),
              ),
              title: Text(
                'Rappels de rendez-vous',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Être informé avant vos rendez-vous',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              activeThumbColor: widget.primaryColor,
            ),
          ),
          
          // Notifications de messages
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SwitchListTile(
              value: _settings.messageNotifications,
              onChanged: (value) => _toggleMessageNotifications(),
              secondary: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _settings.messageNotifications 
                      ? widget.primaryColor.withOpacity(0.1)
                      : AppColors.textHint.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.message,
                  color: _settings.messageNotifications ? widget.primaryColor : AppColors.textHint,
                ),
              ),
              title: Text(
                'Notifications de messages',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Être notifié des nouveaux messages',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              activeThumbColor: widget.primaryColor,
            ),
          ),
          
          // Mises à jour système
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: SwitchListTile(
              value: _settings.systemUpdates,
              onChanged: (value) => _toggleSystemUpdates(),
              secondary: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _settings.systemUpdates 
                      ? widget.primaryColor.withOpacity(0.1)
                      : AppColors.textHint.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.system_update,
                  color: _settings.systemUpdates ? widget.primaryColor : AppColors.textHint,
                ),
              ),
              title: Text(
                'Mises à jour système',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Recevoir les mises à jour de l\'application',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              activeThumbColor: widget.primaryColor,
            ),
          ),
          
          const SizedBox(height: 40),
          
          // Bouton de test
          if (_settings.pushEnabled)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.white),
                          const SizedBox(width: 8),
                          Text(
                            'Notification de test envoyée!',
                            style: GoogleFonts.poppins(),
                          ),
                        ],
                      ),
                      backgroundColor: widget.primaryColor,
                      duration: const Duration(seconds: 3),
                    ),
                  );
                },
                icon: const Icon(Icons.notifications),
                label: Text(
                  'Tester les notifications',
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showNotificationSnackBar(String feature, bool enabled) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$feature ${enabled ? 'activées' : 'désactivées'}',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: enabled ? Colors.green : Colors.orange,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
