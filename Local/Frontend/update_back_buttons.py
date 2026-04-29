import os
import glob

lib_path = r"e:\Soutenance\Dossiers\Local\Frontend\lib"
screens = glob.glob(os.path.join(lib_path, "features", "**", "presentation", "screens", "*.dart"), recursive=True)

import_statement = "import '../../../../core/widgets/universal_back_button.dart';"

replaces_made = 0

for screen in screens:
    with open(screen, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine relative import
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
        # Usually it looks like:
        '''
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        '''
        import re
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
                # Find last import
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
        print("Updated:", screen)

print(f"Total files updated: {replaces_made}")
