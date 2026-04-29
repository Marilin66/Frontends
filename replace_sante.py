import os
import re

directories = [
    r"c:\Users\BADJI\Desktop\Dossiers\Local\Frontend\lib",
    r"c:\Users\BADJI\Desktop\Dossiers\Local\Backend",
    r"c:\Users\BADJI\Desktop\Dossiers\Frontend-react\src"
]

pattern = re.compile(r'\b(?:e[- ]?sant[eé](?:\s+b[eé]nin)?|sant[eé]\s+b[eé]nin)\b', re.IGNORECASE)

extensions = ('.dart', '.ts', '.tsx', '.py', '.md', '.json', '.html')

for d in directories:
    for root, dirs, files in os.walk(d):
        if any(skip in root for skip in ['node_modules', '.git', 'env', '__pycache__', 'migrations', 'build', 'web', 'android', 'ios']):
            continue
        for file in files:
            if file.endswith(extensions):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content, count = pattern.subn('Hopitel', content)
                    if count > 0:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Replaced {count} occurrences in {filepath}")
                except Exception as e:
                    pass
print("Done!")
