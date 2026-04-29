import os
import glob
import shutil
import re

local_lib_path = r"e:\Soutenance\Dossiers\Local\Frontend\lib"
online_lib_path = r"e:\Soutenance\Dossiers\enligne\Frontend\lib"

# 1. Copy core widgets
widgets = ['universal_back_button.dart', 'safe_pop_scope.dart']
os.makedirs(os.path.join(online_lib_path, "core", "widgets"), exist_ok=True)
for w in widgets:
    src = os.path.join(local_lib_path, "core", "widgets", w)
    dst = os.path.join(online_lib_path, "core", "widgets", w)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied {w} to {dst}")

# 2. Find all screens in online path
screens = glob.glob(os.path.join(online_lib_path, "features", "**", "presentation", "screens", "*.dart"), recursive=True)

import_statement = "import '../../../../core/widgets/universal_back_button.dart';"

replaces_made = 0

for screen in screens:
    try:
        with open(screen, 'r', encoding='utf-8') as f:
            content = f.read()

        # the file is like lib/features/X/presentation/screens/Y.dart
        parts = screen.replace('\\', '/').split('/lib/')
        if len(parts) < 2: continue
        rel_path = parts[1]
        depth = rel_path.count('/')
        dots = '../' * depth
        correct_import = f"import '{dots}core/widgets/universal_back_button.dart';"
        
        modified = False

        if 'context.pop()' in content and 'leading: IconButton' in content and 'Icons.arrow_back' in content:
            # We need to replace the block
            pattern = re.compile(r'leading:\s*IconButton\(\s*icon:\s*const\s*Icon\(Icons\.arrow_back\),\s*onPressed:\s*\(\)\s*=>\s*context\.pop\(\),\s*\),?')
            new_content, num_subs = pattern.subn('leading: const UniversalBackButton(),', content)
            if num_subs > 0:
                content = new_content
                modified = True
                
                # also replace similar ones without `const`
                pattern2 = re.compile(r'leading:\s*IconButton\(\s*icon:\s*Icon\(Icons\.arrow_back\),\s*onPressed:\s*\(\)\s*=>\s*context\.pop\(\),\s*\),?')
                content, num_subs2 = pattern2.subn('leading: const UniversalBackButton(),', content)
                
                # add import if not present
                if 'universal_back_button.dart' not in content:
                    last_import_idx = content.rfind("import '")
                    if last_import_idx != -1:
                        end_of_line = content.find(';', last_import_idx) + 1
                        content = content[:end_of_line] + f"\n{correct_import}" + content[end_of_line:]
                    else:
                        content = correct_import + "\n" + content

        if modified:
            with open(screen, 'w', encoding='utf-8') as f:
                f.write(content)
            replaces_made += 1
            print("Updated BackButton in:", screen)

    except Exception as e:
        print(f"Error processing {screen}: {e}")

# 3. Apply SafePopScope to edit_profile_screen.dart (custom logic since it's more specific)
edit_profile_path = os.path.join(online_lib_path, "features", "core", "presentation", "screens", "edit_profile_screen.dart")
try:
    if os.path.exists(edit_profile_path):
        with open(edit_profile_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'import \'../../../../core/widgets/safe_pop_scope.dart\';' not in content:
            # Replace auth provider import to include safe_pop_scope
            content = content.replace("import '../../../auth/presentation/providers/auth_provider.dart';", 
                "import '../../../../core/widgets/safe_pop_scope.dart';\nimport '../../../auth/presentation/providers/auth_provider.dart';")
            
            # replace Sexe/GroupeSanguin to add dirty flag
            content = content.replace('String? _selectedGroupeSanguin;', 
                'String? _selectedGroupeSanguin;\n  bool _isDirty = false;\n\n  void _markDirty() {\n    if (!_isDirty) setState(() => _isDirty = true);\n  }')
            
            # wrap Scaffold
            content = content.replace('return Scaffold(', 'return SafePopScope(\n      isDirty: _isDirty,\n      child: Scaffold(')
            content = content.replace('      ),\n    );\n  }\n\n  List<Step> _getSteps(bool isPatient)', '      ),\n    );\n  }\n  }\n\n  List<Step> _getSteps(bool isPatient)')
            
            # add mark dirty for some fields
            content = re.sub(r'controller: _firstNameController,', 'controller: _firstNameController,\n              onChanged: (_) => _markDirty(),', content)
            content = re.sub(r'controller: _lastNameController,', 'controller: _lastNameController,\n              onChanged: (_) => _markDirty(),', content)
            
            with open(edit_profile_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Applied SafePopScope to {edit_profile_path}")
except Exception as e:
    print("Error applying SafePopScope:", e)

print(f"\nTotal Navigation files updated: {replaces_made}")
