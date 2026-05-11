import requests
import json
from django.conf import settings
import logging
from .rag_tools import TOOLS_SCHEMA, execute_tool_call

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Tu es un Assistant Médical Intelligent développé pour E-Santé Bénin.
Tu es là pour guider les patients, les conseiller de manière extrêmement professionnelle, et les aider à trouver un médecin, un hôpital, ou un créneau de RDV.

RÈGLES STRICTES :
1. Tu parles EXCLUSIVEMENT aux patients.
2. Si le patient cherche un médecin ou un hôpital, EXÉCUTE la fonction associée.
3. Si le patient cherche une disponibilité pour un médecin après que tu aies obtenu la liste, EXÉCUTE la fonction de recherche de disponibilité.
4. SOIS RASSURANT ET PROFESSIONNEL. Donne des conseils de vie sains, mais AJOUTE TOUJOURS : "Je suis une IA, veuillez valider ces conseils avec un professionnel de la santé." si l'utilisateur décrit des symptômes.
5. AUCUN DIAGNOSTIC MÉDICAL.
6. Ne communique AUCUNE donnée personnelle issue de dossiers.
7. Quand tu proposes de prendre RDV suite à une recherche, si c'est possible, précise que l'utilisateur peut accomplir cette action dans l'application.
8. Si tu as trouvé des résultats (Hôpitaux, Medecins...) et que tu veux proposer une navigation à l'utilisateur, ajoute STRICTEMENT à la toute fin de ton message un bloc JSON au format suivant (sans commentaires) :
```json
[
  {"type": "redirect", "label": "Prendre RDV avec Dr. Nom", "url": "/patient/medecin/ID/rendezvous"},
  {"type": "redirect", "label": "Voir Hôpital Nom", "url": "/patient/hopital/ID"}
]
```
RÈGLES ABSOLUES pour les URLs :
- Utilise TOUJOURS l'ID numérique (ex: /patient/medecin/42/rendezvous), JAMAIS le nom
- Pour les hôpitaux : /patient/hopital/ID (ex: /patient/hopital/3)
- Pour les médecins : /patient/medecin/ID/rendezvous (ex: /patient/medecin/7/rendezvous)
- N'ajoute ce bloc QUE SI des IDs numériques valides ont été renvoyés par tes outils
- Si tu n'as pas d'ID numérique, NE génère PAS de bouton de navigation

IMPORTANT: Ta réponse doit être claire, formatée proprement (Markdown autorisé), courte et rassurante.
"""

SYSTEM_PROMPT_PUBLIC = """Tu es un Assistant Médical Intelligent développé pour E-Santé Bénin.
Tu es disponible sans connexion pour répondre aux questions médicales générales.

RÈGLES STRICTES :
1. Tu réponds aux questions médicales générales : symptômes courants, conseils de santé, informations sur les maladies.
2. SOIS RASSURANT ET PROFESSIONNEL. Ajoute toujours : "Je suis une IA, veuillez valider ces conseils avec un professionnel de la santé." si l'utilisateur décrit des symptômes.
3. AUCUN DIAGNOSTIC MÉDICAL.
4. Si l'utilisateur cherche un médecin, un hôpital ou veut prendre RDV, explique-lui qu'il doit se connecter ou créer un compte pour accéder à ces fonctionnalités, et propose-lui les boutons suivants :
```json
[
  {"type": "route", "label": "Trouver un hôpital", "payload": "/hospitals"},
  {"type": "route", "label": "Se connecter", "payload": "/login"},
  {"type": "route", "label": "Créer un compte", "payload": "/register"}
]
```
5. Ne génère PAS d'autres boutons de navigation.

IMPORTANT: Ta réponse doit être claire, courte et rassurante.
"""

def openai_chat_completion(history_messages, enable_tools=True):
    """
    Appelle l'API Groq (OpenAI-compatible) avec support du RAG / Function Calling.
    
    :param history_messages: Liste des messages à envoyer
    :param enable_tools: Si False, désactive le function calling (pour les utilisateurs non connectés)
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.CHATBOT_API_KEY}"
    }

    # Choisir le prompt système selon le contexte
    system_prompt = SYSTEM_PROMPT if enable_tools else SYSTEM_PROMPT_PUBLIC

    # Préparation du payload initial
    messages = [{"role": "system", "content": system_prompt}] + history_messages
    
    payload = {
        "model": settings.CHATBOT_MODEL,
        "messages": messages,
        "temperature": 0.5,
    }

    # N'activer les tools que pour les utilisateurs connectés
    if enable_tools:
        payload["tools"] = TOOLS_SCHEMA
        payload["tool_choice"] = "auto"

    timeout = getattr(settings, "CHATBOT_TIMEOUT", 45)

    try:
        response = requests.post(
            settings.CHATBOT_API_URL,
            json=payload,
            headers=headers,
            timeout=timeout,
        )
        
        if not response.ok:
            logger.warning(f"Échec Groq: {response.text}")
            response.raise_for_status()

        data = response.json()
        if "choices" not in data or len(data["choices"]) == 0:
            raise ValueError(f"Format de réponse inattendu: {data}")

        message = data["choices"][0]["message"]
        
        # Vérifier si l'IA veut appeler un ou plusieurs outils (seulement si tools activés)
        if enable_tools and message.get("tool_calls"):
            # On ajoute le message de l'assistant (avec les tool_calls) à l'historique
            messages.append(message)
            
            for tool_call in message["tool_calls"]:
                tool_call_id = tool_call.get("id")
                function_call = tool_call.get("function", {})
                
                # Exécution du tool localement
                tool_result = execute_tool_call(function_call)
                
                # Ajout du résultat en tant que `role: tool`
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call_id,
                    "name": function_call.get("name"),
                    "content": tool_result
                })
                
            # Deuxième appel à Groq pour générer la réponse finale avec le contexte intégré
            final_payload = {
                "model": settings.CHATBOT_MODEL,
                "messages": messages,
                "temperature": 0.5,
            }
            
            final_response = requests.post(
                settings.CHATBOT_API_URL,
                json=final_payload,
                headers=headers,
                timeout=timeout,
            )
            
            if not final_response.ok:
                logger.warning(f"Échec Groq Final: {final_response.text}")
                final_response.raise_for_status()
                
            final_data = final_response.json()
            return final_data["choices"][0]["message"]["content"]
            
        else:
            # Réponse directe sans RAG
            return message.get("content", "")

    except requests.exceptions.Timeout:
        logger.error("Timeout Groq — le modèle a mis trop de temps à répondre")
        return "L'assistant met trop de temps à répondre. Veuillez réessayer dans quelques instants."
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur requête Groq: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Détails Groq: {e.response.text}")
        return "Je suis désolé, je rencontre actuellement un problème technique avec l'assistant. Veuillez réessayer plus tard."
    except Exception as e:
        logger.error(f"Erreur inattendue Groq (RAG): {str(e)}")
        return "Une erreur inattendue s'est produite lors de la recherche des données. Veuillez contacter le support."

