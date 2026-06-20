import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../routing/app_router.dart';
import '../theme/app_colors.dart';

class GlobalAIBubble extends ConsumerStatefulWidget {
  const GlobalAIBubble({super.key});

  @override
  ConsumerState<GlobalAIBubble> createState() => _GlobalAIBubbleState();
}

class _GlobalAIBubbleState extends ConsumerState<GlobalAIBubble> {
  // Position initiale (en bas à droite)
  double right = 20;
  double bottom = 100;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: right,
      bottom: bottom,
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            right -= details.delta.dx;
            bottom -= details.delta.dy;

            // Garder la bulle dans l'écran
            if (right < 0) right = 0;
            if (bottom < 0) bottom = 0;
            
            final size = MediaQuery.of(context).size;
            if (right > size.width - 60) right = size.width - 60;
            if (bottom > size.height - 60) bottom = size.height - 60;
          });
        },
        child: Material(
          color: Colors.transparent,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  'Besoin d\'aide ?',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              FloatingActionButton(
                heroTag: 'global_ai_bubble_btn',
                onPressed: () {
                  final router = ref.read(routerProvider);
                  // Push the chatbot route with current location as extra
                  final currentLocation = GoRouterState.of(context).matchedLocation;
                  router.push('/chatbot', extra: currentLocation);
                },
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                  side: const BorderSide(color: Colors.white, width: 2),
                ),
                child: const Icon(Icons.smart_toy, size: 28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
