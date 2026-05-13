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
    return Image.asset(
      'assets/images/hopitel_logo.png',
      width: logoSize * (layout == Axis.horizontal ? 2.5 : 1.5), // Le nouveau logo est plus large
      height: logoSize,
      fit: BoxFit.contain,
    );
  }
}
