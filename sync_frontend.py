import os
import shutil

local_dir = r"c:\Users\BADJI\Desktop\Dossiers\Local\Frontend"
enligne_dir = r"c:\Users\BADJI\Desktop\Dossiers\enligne\Frontend"

def sync_folders():
    # 1. Sync lib folder
    local_lib = os.path.join(local_dir, "lib")
    enligne_lib = os.path.join(enligne_dir, "lib")
    if os.path.exists(enligne_lib):
        shutil.rmtree(enligne_lib)
    shutil.copytree(local_lib, enligne_lib)
    print("Synchro du dossier lib : OK")

    # 2. Sync assets folder
    local_assets = os.path.join(local_dir, "assets")
    enligne_assets = os.path.join(enligne_dir, "assets")
    if os.path.exists(enligne_assets):
        shutil.rmtree(enligne_assets)
    shutil.copytree(local_assets, enligne_assets)
    print("Synchro du dossier assets : OK")

    # 3. Handle pubspec.yaml smartly
    local_pub = os.path.join(local_dir, "pubspec.yaml")
    enligne_pub = os.path.join(enligne_dir, "pubspec.yaml")
    
    with open(local_pub, "r", encoding="utf-8") as f:
        local_content = f.read()
        
    with open(enligne_pub, "r", encoding="utf-8") as f:
        enligne_content = f.read()

    # Extract flutter_launcher_icons from enligne
    import re
    match = re.search(r'flutter_launcher_icons:.*min_sdk_android:\s*\d+', enligne_content, re.DOTALL)
    dev_deps_match = re.search(r'flutter_launcher_icons:\s*\^[0-9\.]+', enligne_content)

    new_pub = local_content
    # Inject dev dependency if not there
    if dev_deps_match and "flutter_launcher_icons:" not in new_pub.split("dev_dependencies:")[1].split("\nflutter:")[0]:
        new_pub = new_pub.replace("dev_dependencies:", "dev_dependencies:\n  " + dev_deps_match.group(0))

    if match and "flutter_launcher_icons:" not in new_pub.split("\nflutter:")[1]:
        new_pub = new_pub + "\n" + match.group(0) + "\n"

    with open(enligne_pub, "w", encoding="utf-8") as f:
        f.write(new_pub)
    print("Synchro du pubspec.yaml : OK")

sync_folders()
