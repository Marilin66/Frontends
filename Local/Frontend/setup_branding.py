import os
import shutil
import re

base_online = r"e:\Soutenance\Dossiers\enligne\Frontend"

# 1. Move esantelogo.svg
old_svg_path = os.path.join(base_online, "esantelogo.svg")
assets_dir = os.path.join(base_online, "assets", "images")
new_svg_path = os.path.join(assets_dir, "esantelogo.svg")

os.makedirs(assets_dir, exist_ok=True)
if os.path.exists(old_svg_path):
    shutil.move(old_svg_path, new_svg_path)
    print("Moved esantelogo.svg to assets/images/")

# 2. Update pubspec.yaml
pubspec_path = os.path.join(base_online, "pubspec.yaml")
if os.path.exists(pubspec_path):
    with open(pubspec_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "- assets/images/esantelogo.svg" not in content:
        # insert after - assets/images/onboarding_hero.png
        if "- assets/images/onboarding_hero.png" in content:
            content = content.replace("- assets/images/onboarding_hero.png", "- assets/images/onboarding_hero.png\n    - assets/images/esantelogo.svg")
            with open(pubspec_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated pubspec.yaml")

# 3. Create brand_logo.dart
widget_content = """import 'package:flutter/material.dart';
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
    
    final logo = SvgPicture.asset(
      'assets/images/esantelogo.svg',
      width: logoSize,
      height: logoSize,
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
            text: 'Esante ',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          TextSpan(
            text: 'Benin',
            style: TextStyle(fontWeight: FontWeight.w400),
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
"""

widget_path = os.path.join(base_online, "lib", "core", "widgets", "brand_logo.dart")
with open(widget_path, 'w', encoding='utf-8') as f:
    f.write(widget_content)
print("Created brand_logo.dart")
