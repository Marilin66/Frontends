import re
import json

content = """Pour trouver un médecin ou un hôpital, vous pouvez utiliser les boutons suivants :
[
  {"type": "redirect", "label": "Rechercher un médecin", "url": "/medecins"},
  {"type": "redirect", "label": "Rechercher un hôpital", "url": "/hopitaux"}
]"""

def extract_actions_and_clean_message(content):
    actions = []
    # D'abord, essayer avec les blocs markdown json
    pattern = r'```(?:json)?\s*(\[.*?\])\s*```'
    match = re.search(pattern, content, re.DOTALL)
    print("Match 1:", match)
    
    # Si pas de bloc textuel, chercher un tableau json nu à la fin (ou n'importe où)
    if not match:
        pattern = r'(\[[\s\S]*?\])\s*$'
        match = re.search(pattern, content, re.DOTALL)
        print("Match 2:", match)

    if match:
        try:
            # Nettoyage si jamais l'IA ajoute des trucs autour
            json_text = match.group(1).strip()
            print("JSON Text:", repr(json_text))
            actions = json.loads(json_text)
            # On retire le JSON de la réponse front
            content = content[:match.start()].strip()
            print("Decoded actions successfully!")
        except Exception as e:
            print("Exception during loads:", e)
            pass
            
    return content, actions

res = extract_actions_and_clean_message(content)
print("FINAL CONTENT:")
print(repr(res[0]))
print("FINAL ACTIONS:")
print(res[1])
