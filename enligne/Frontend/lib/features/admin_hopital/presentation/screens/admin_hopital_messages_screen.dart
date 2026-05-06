import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/admin_hopital_provider.dart';

class AdminHopitalMessagesContent extends ConsumerWidget {
  const AdminHopitalMessagesContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medecinsAsync = ref.watch(adminHopitalMedecinsProvider);
    final laborantinsAsync = ref.watch(adminHopitalLaborantinsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Messagerie Interne',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () => context.go('/messagerie'),
            tooltip: 'Mes conversations',
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Contacter vos agents',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
          
          // Section Médecins
          SliverToBoxAdapter(
            child: _SectionHeader(title: 'Médecins', icon: Icons.medical_services_outlined),
          ),
          medecinsAsync.when(
            loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
            error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('Erreur: $e'))),
            data: (medecins) => SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final m = medecins[index];
                  return _AgentTile(
                    name: '${m.firstName} ${m.lastName}',
                    role: 'Médecin',
                    onTap: () => context.go('/messagerie/direct/${m.id}'),
                  );
                },
                childCount: medecins.length,
              ),
            ),
          ),

          // Section Laborantins
          SliverToBoxAdapter(
            child: const SizedBox(height: 16),
          ),
          SliverToBoxAdapter(
            child: _SectionHeader(title: 'Laborantins', icon: Icons.biotech_outlined),
          ),
          laborantinsAsync.when(
            loading: () => const SliverToBoxAdapter(child: Center(child: CircularProgressIndicator())),
            error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('Erreur: $e'))),
            data: (laborantins) => SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final l = laborantins[index];
                  return _AgentTile(
                    name: '${l.firstName} ${l.lastName}',
                    role: 'Laborantin',
                    onTap: () => context.go('/messagerie/direct/${l.id}'),
                  );
                },
                childCount: laborantins.length,
              ),
            ),
          ),
          
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _AgentTile extends StatelessWidget {
  final String name;
  final String role;
  final VoidCallback onTap;

  const _AgentTile({required this.name, required this.role, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
          child: Text(name[0], style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
        ),
        title: Text(name, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(role, style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
        trailing: const Icon(Icons.send_rounded, color: AppColors.primary, size: 20),
        onTap: onTap,
      ),
    );
  }
}
