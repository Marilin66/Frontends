import 'package:flutter/material.dart';
import 'animated_tap.dart';
import '../theme/app_colors.dart';

/// Une carte générique avec un effet "Glassmorphism" ou une élévation douce.
/// S'intègre avec `AnimatedTap` pour une interaction WoW.
class FluidCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final double borderRadius;
  final bool hasShadow;

  const FluidCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.borderRadius = 16,
    this.hasShadow = true,
  });

  @override
  Widget build(BuildContext context) {
    final cardContent = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: hasShadow
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ]
            : null,
      ),
      child: child,
    );

    if (onTap == null) {
      return cardContent;
    }

    return AnimatedTap(
      onTap: onTap,
      scaleDown: 0.97,
      child: cardContent,
    );
  }
}
