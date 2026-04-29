import os
import glob
import re

base_lib = r"e:\Soutenance\Dossiers\enligne\Frontend\lib"

# 1. Update ResponsiveShellLayout
shell_path = os.path.join(base_lib, "core", "widgets", "responsive_shell_layout.dart")
with open(shell_path, 'r', encoding='utf-8') as f:
    content = f.read()

# insert import
if "import 'brand_logo.dart';" not in content:
    content = content.replace("import 'package:google_fonts/google_fonts.dart';", "import 'package:google_fonts/google_fonts.dart';\nimport 'brand_logo.dart';")

# replace TopMenu text
top_menu_pattern = r"Text\(\s*'E-SANTÉ',\s*style:\s*GoogleFonts\.poppins\([\s\S]*?\),\s*\),"
content = re.sub(top_menu_pattern, "const BrandLogo(layout: Axis.horizontal, logoSize: 32),", content)

with open(shell_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated responsive_shell_layout.dart")


# 2. Update Login Screen
login_path = os.path.join(base_lib, "features", "auth", "presentation", "screens", "login_screen.dart")
with open(login_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "import '../../../../core/widgets/brand_logo.dart';" not in content:
    content = content.replace("import '../../../../core/widgets/responsive_auth_layout.dart';", "import '../../../../core/widgets/responsive_auth_layout.dart';\nimport '../../../../core/widgets/brand_logo.dart';")

login_pattern = r"Container\([\s\S]*?Icon\(Icons\.local_hospital, size: 48, color: AppColors\.primary\),[\s\S]*?\),[\s]*const SizedBox\(height: 16\),[\s]*Text\(\s*'E-Santé Bénin',[\s\S]*?\),"
content = re.sub(login_pattern, "const BrandLogo(layout: Axis.vertical, logoSize: 64, fontSize: 24),", content)

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login_screen.dart")


# 3. Update Splash Screen
splash_path = os.path.join(base_lib, "features", "auth", "presentation", "screens", "splash_screen.dart")
if os.path.exists(splash_path):
    with open(splash_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "import '../../../../core/widgets/brand_logo.dart';" not in content:
        content = content.replace("import '../../../../core/theme/app_colors.dart';", "import '../../../../core/theme/app_colors.dart';\nimport '../../../../core/widgets/brand_logo.dart';")

    splash_pattern = r"Container\([\s\S]*?Icon\(Icons\.local_hospital, size: 64, color: Colors\.white\),[\s\S]*?\),[\s]*const SizedBox\(height: 24\),[\s]*Text\(\s*'E-Santé Bénin',[\s\S]*?\),"
    content = re.sub(splash_pattern, "const BrandLogo(layout: Axis.vertical, logoSize: 80, fontSize: 32, textColor: Colors.white),", content)
    
    with open(splash_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated splash_screen.dart")


# 4. Global text replacements for wrong variations
all_dart_files = glob.glob(os.path.join(base_lib, "**", "*.dart"), recursive=True)
for filepath in all_dart_files:
    # skip the already heavy customized files
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    content = original_content
    # Replace texts in strings
    content = re.sub(r"E-Santé Bénin", "Esante Benin", content, flags=re.IGNORECASE)
    # also E-Santé stand alone if it's not code
    content = re.sub(r"'E-SANTÉ'", "'Esante Benin'", content)
    content = re.sub(r"'eSante'", "'Esante Benin'", content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed text in {os.path.basename(filepath)}")

