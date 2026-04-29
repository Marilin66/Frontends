import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';

class BrandLogo extends StatelessWidget {
  final Axis layout; // horizontal or vertical
  final double logoSize;
  final double fontSize;
  final Color? textColor;

  const BrandLogo({
    super.key,
    this.layout = Axis.horizontal,
    this.logoSize = 32.0,
    this.fontSize = 20.0,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveTextColor = textColor ?? AppColors.primary;
    
    final logo = Image.asset(
      'assets/images/hopitel_logo.png',
      width: logoSize,
      height: logoSize,
      fit: BoxFit.contain,
    );

    final text = RichText(
      textAlign: layout == Axis.vertical ? TextAlign.center : TextAlign.left,
      text: TextSpan(
        style: GoogleFonts.outfit(
          fontSize: fontSize,
          color: effectiveTextColor,
        ),
        children: const [
          TextSpan(
            text: 'Hopitel',
            style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -1.0),
          ),
        ],
      ),
    );

    if (layout == Axis.vertical) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          logo,
          SizedBox(height: logoSize * 0.25),
          text,
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        logo,
        SizedBox(width: logoSize * 0.3),
        text,
      ],
    );
  }
}
