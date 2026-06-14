import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../features/notifications/presentation/providers/notification_provider.dart';

class ResponsiveShellLayout extends StatelessWidget {
  final Widget child;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final Color indicatorColor;
  final List<NavigationDestination> destinations;
  final bool useTopMenuOnWeb;

  const ResponsiveShellLayout({
    super.key,
    required this.child,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.indicatorColor,
    required this.destinations,
    this.useTopMenuOnWeb = false,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;
        final isTablet = constraints.maxWidth >= 600 && constraints.maxWidth < 1100;
        if (isMobile) {
          final state = GoRouterState.of(context);
          final pathSegments = state.uri.pathSegments;
          final location = state.matchedLocation;
          
          // Hide shell AppBar if we are deep in a sub-route (more than 2 segments)
          // OR if we are on a messagerie route (which has its own custom header)
          final showAppBar = pathSegments.length <= 2 && !location.contains('messagerie');

          Widget mainContent = child;
          if (destinations.length > 5) {
            final topDestinations = destinations.sublist(5);
            final activeTopIndex = selectedIndex - 5;

            mainContent = Column(
              children: [
                Container(
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: const Border(
                      bottom: BorderSide(color: Color(0xFFEEEEEE), width: 1),
                    ),
                  ),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: topDestinations.length,
                    itemBuilder: (context, index) {
                      final d = topDestinations[index];
                      final isSelected = activeTopIndex == index;
                      final globalIndex = index + 5;

                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InkWell(
                          onTap: () => onDestinationSelected(globalIndex),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primary : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconTheme(
                                  data: IconThemeData(
                                    color: isSelected ? Colors.white : AppColors.textSecondary,
                                    size: 16,
                                  ),
                                  child: d.icon,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  d.label,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    color: isSelected ? Colors.white : AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Expanded(child: child),
              ],
            );
          }

          return Scaffold(
            appBar: showAppBar 
              ? AppBar(
                  backgroundColor: AppColors.surface,
                  elevation: 0,
                  centerTitle: true,
                  title: Text(
                    'HOPITEL',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                      letterSpacing: 1.5,
                    ),
                  ),
                  actions: [
                    Consumer(
                      builder: (context, ref, child) {
                        final unreadCount = ref.watch(unreadNotificationCountProvider);
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textPrimary),
                              onPressed: () => onDestinationSelected(-1),
                            ),
                            if (unreadCount > 0)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Text(
                                    unreadCount > 9 ? '9+' : unreadCount.toString(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(width: 8),
                  ],
                )
              : null,
            body: mainContent,
            bottomNavigationBar: NavigationBarTheme(
              data: NavigationBarThemeData(
                labelTextStyle: WidgetStateProperty.all(
                  GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500),
                ),
                indicatorColor: indicatorColor,
                indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: NavigationBar(
                selectedIndex: selectedIndex >= 5 ? 0 : selectedIndex,
                onDestinationSelected: onDestinationSelected,
                labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                destinations: destinations.length > 5 
                    ? destinations.sublist(0, 5) 
                    : destinations,
                backgroundColor: AppColors.surface,
                surfaceTintColor: Colors.transparent,
                elevation: 10,
                height: 70,
              ),
            ),
          );
        }

        if (isTablet) {
           return Scaffold(
            body: Row(
              children: [
                NavigationRail(
                  selectedIndex: selectedIndex,
                  onDestinationSelected: onDestinationSelected,
                  labelType: NavigationRailLabelType.all,
                  indicatorColor: indicatorColor,
                  backgroundColor: AppColors.surface,
                  minWidth: 80,
                  selectedLabelTextStyle: GoogleFonts.poppins(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                  unselectedLabelTextStyle: GoogleFonts.poppins(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                  ),
                  destinations: destinations.map((d) {
                    return NavigationRailDestination(
                      icon: d.icon,
                      selectedIcon: _getEffectiveIcon(d, true),
                      label: Text(d.label),
                    );
                  }).toList(),
                ),
                const VerticalDivider(thickness: 1, width: 1),
                Expanded(child: child),
              ],
            ),
          );
        }

        // Web / Desktop
        if (useTopMenuOnWeb) {
          return Scaffold(
            appBar: PreferredSize(
              preferredSize: const Size.fromHeight(70),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Row(
                      children: [
                        Text(
                          'HOPITEL',
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(width: 48),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: destinations.asMap().entries.map((entry) {
                                final isSelected = selectedIndex == entry.key;
                                return Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 4),
                                  child: TextButton(
                                    onPressed: () => onDestinationSelected(entry.key),
                                    style: TextButton.styleFrom(
                                      foregroundColor: isSelected ? AppColors.primary : AppColors.textSecondary,
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: Text(
                                      entry.value.label,
                                      style: GoogleFonts.poppins(
                                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                        const CircleAvatar(
                          radius: 18,
                          backgroundColor: AppColors.primary,
                          child: Icon(Icons.person, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            body: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: child,
              ),
            ),
          );
        }

        // Side Menu for Desktop (Large Screens)
        return Scaffold(
          body: Row(
            children: [
              Container(
                width: 260,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border(right: BorderSide(color: Colors.grey.withValues(alpha: 0.1))),
                ),
                child: Column(
                  children: [
                    const SizedBox(height: 48),
                    Text(
                      'Hopitel',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 48),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: destinations.length,
                        itemBuilder: (context, index) {
                          final d = destinations[index];
                          final isSelected = selectedIndex == index;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: ListTile(
                              onTap: () => onDestinationSelected(index),
                              leading: _getEffectiveIcon(d, isSelected),
                              title: Text(
                                d.label,
                                style: GoogleFonts.poppins(
                                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                  fontSize: 14,
                                ),
                              ),
                              selected: isSelected,
                              selectedTileColor: AppColors.primary.withValues(alpha: 0.08),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1200),
                    child: child,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _getEffectiveIcon(NavigationDestination d, bool isSelected) {
    final widget = isSelected && d.selectedIcon != null ? d.selectedIcon! : d.icon;
    if (widget is Icon) {
      return Icon(
        widget.icon,
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
      );
    }
    return widget;
  }
}
