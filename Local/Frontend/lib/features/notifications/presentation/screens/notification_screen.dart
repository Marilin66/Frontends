import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/premium_error_view.dart';
import '../../../../core/widgets/premium_loading_view.dart';
import '../providers/notification_provider.dart';
import '../../../../core/widgets/universal_back_button.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filteredNotifAsync = ref.watch(filteredNotificationProvider);
    final activeFilter = ref.watch(notificationFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: UniversalBackButton(),
        title: Text('Notifications', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Tout marquer comme lu',
            onPressed: () => ref.read(notificationProvider.notifier).markAllAsRead(),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: NotificationFilter.values.map((filter) {
                final isSelected = activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(filter.label),
                    selected: isSelected,
                    onSelected: (_) => ref.read(notificationFilterProvider.notifier).setFilter(filter),
                    backgroundColor: Colors.white,
                    selectedColor: AppColors.primary.withOpacity(0.1),
                    checkmarkColor: AppColors.primary,
                    labelStyle: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? AppColors.primary : AppColors.textSecondary,
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    side: BorderSide(color: isSelected ? AppColors.primary : Colors.grey.shade300),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
      body: filteredNotifAsync.when(
        loading: () => const PremiumLoadingView(message: 'Chargement de vos notifications...'),
        error: (e, _) => PremiumErrorView(
          message: 'Erreur: $e',
          onRetry: () => ref.read(notificationProvider.notifier).refresh(),
        ),
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: AppColors.textHint.withOpacity(0.3)),
                  const SizedBox(height: 16),
                  Text(
                    'Aucune notification ${activeFilter == NotificationFilter.all ? "" : "dans cette catégorie"}',
                    style: GoogleFonts.poppins(color: AppColors.textSecondary),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(notificationProvider.notifier).refresh(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final n = notifications[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(
                        color: n.lu ? Colors.transparent : AppColors.primary.withOpacity(0.1),
                      ),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _getNotifColor(n.type).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _getNotifIcon(n.type),
                          color: _getNotifColor(n.type),
                          size: 20,
                        ),
                      ),
                      title: Text(
                        n.message,
                        style: GoogleFonts.poppins(
                          fontWeight: n.lu ? FontWeight.normal : FontWeight.w600,
                          fontSize: 14,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          n.dateEnvoi,
                          style: GoogleFonts.poppins(fontSize: 11, color: AppColors.textHint),
                        ),
                      ),
                      trailing: !n.lu 
                        ? Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                          )
                        : null,
                      onTap: () {
                        if (!n.lu) {
                          ref.read(notificationProvider.notifier).markAsRead(n.id);
                        }
                        if (n.lien.isNotEmpty) {
                          context.push(n.lien);
                        }
                      },
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  IconData _getNotifIcon(String type) {
    final t = type.toLowerCase();
    if (t.contains('rendezvous') || t.contains('rdv')) return Icons.calendar_today_outlined;
    if (t.contains('resultat')) return Icons.biotech_outlined;
    if (t.contains('message')) return Icons.chat_bubble_outline;
    return Icons.notifications_none;
  }

  Color _getNotifColor(String type) {
    final t = type.toLowerCase();
    if (t.contains('rendezvous') || t.contains('rdv')) return AppColors.primary;
    if (t.contains('resultat')) return AppColors.secondary;
    if (t.contains('message')) return AppColors.success;
    return AppColors.textHint;
  }
}
