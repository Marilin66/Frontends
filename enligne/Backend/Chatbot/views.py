import re
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.models import Patient
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer, SendMessageSerializer
from .services import openai_chat_completion


def extract_actions_and_clean_message(content):
    """
    Extrait le tableau d'actions JSON si présent et nettoie le message pour l'utilisateur.
    Gère toutes les variantes que le LLM peut produire :
      1. ```json [ ... ] ```   (bloc markdown)
      2. ``` [ ... ] ```       (bloc markdown sans langage)
      3. [ {...}, {...} ]      (JSON brut en fin de message)
    """
    actions = []

    # ── Variante 1 & 2 : bloc markdown ```json [...] ``` ou ``` [...] ``` ──
    md_pattern = r'```(?:json)?\s*(\[[\s\S]*?\])\s*```'
    match = re.search(md_pattern, content, re.DOTALL)
    if match:
        try:
            actions = json.loads(match.group(1))
            content = (content[:match.start()] + content[match.end():]).strip()
            return content, actions
        except json.JSONDecodeError:
            pass

    # ── Variante 3 : tableau JSON brut [ {...}, ... ] en fin de message ──────
    # On cherche le dernier '[' qui ouvre un tableau JSON valide
    last_bracket = content.rfind('[')
    if last_bracket != -1:
        candidate = content[last_bracket:].strip()
        # Trouver la fermeture du tableau
        depth = 0
        end_idx = -1
        for i, ch in enumerate(candidate):
            if ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break
        if end_idx != -1:
            json_str = candidate[:end_idx + 1]
            try:
                parsed = json.loads(json_str)
                # Valider que c'est bien une liste d'actions (objets avec "label")
                if isinstance(parsed, list) and len(parsed) > 0 and isinstance(parsed[0], dict) and 'label' in parsed[0]:
                    actions = parsed
                    content = content[:last_bracket].strip()
            except json.JSONDecodeError:
                pass

    return content, actions


# ── Sessions ──────────────────────────────────────────────────────────────────

class ChatSessionsView(APIView):
    """Liste les sessions de chat du patient connecté, ou en crée une nouvelle."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        sessions = ChatSession.objects.filter(patient=patient).order_by('-date_creation')
        data = [
            {
                "id": s.id,
                "title": _session_title(s),
                "created_at": s.date_creation.isoformat(),
            }
            for s in sessions
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """Crée une nouvelle session de chat."""
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient introuvable."}, status=status.HTTP_403_FORBIDDEN)

        session = ChatSession.objects.create(patient=patient)
        return Response(
            {"id": session.id, "title": _session_title(session), "created_at": session.date_creation.isoformat()},
            status=status.HTTP_201_CREATED,
        )


def _session_title(session):
    """Retourne le contenu du premier message utilisateur comme titre, ou un titre par défaut."""
    first_msg = session.messages.filter(role="user").order_by("timestamp").first()
    if first_msg:
        return first_msg.content[:60]
    return "Nouvelle conversation"


# ── Historique ────────────────────────────────────────────────────────────────

class ChatHistoryView(APIView):
    """
    GET /chatbot/history/          → dernière session du patient (ou vide)
    GET /chatbot/history/<id>/     → session spécifique par ID
    """
    permission_classes = [AllowAny]

    def get(self, request, session_id=None):
        if not request.user.is_authenticated:
            return Response({"session_id": None, "messages": []}, status=status.HTTP_200_OK)

        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({"session_id": None, "messages": []}, status=status.HTTP_200_OK)

        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, patient=patient)
            except ChatSession.DoesNotExist:
                return Response({"error": "Session introuvable."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Dernière session, ou création si aucune
            session = ChatSession.objects.filter(patient=patient).order_by('-date_creation').first()
            if not session:
                session = ChatSession.objects.create(patient=patient)

        messages = session.messages.all().order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(
            {"session_id": session.id, "messages": serializer.data},
            status=status.HTTP_200_OK,
        )


# ── Envoi de message ──────────────────────────────────────────────────────────

class SendMessageView(APIView):
    """Envoie un message à l'IA et retourne la réponse."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']
        session_id = request.data.get('session_id')

        # ── Utilisateur non connecté : réponse sans persistance, sans tools RAG ──
        if not request.user.is_authenticated:
            history_for_api = [{"role": "user", "content": user_message}]
            # Pas de tools pour les anonymes : ils ne peuvent pas prendre RDV
            # et ça évite les timeouts liés au double appel Groq
            ai_response = openai_chat_completion(history_for_api, enable_tools=False)
            clean_content, actions = extract_actions_and_clean_message(ai_response)

            return Response({
                "message": {
                    "id": 0,
                    "role": "assistant",
                    "content": clean_content,
                    "timestamp": None,
                },
                "actions": actions,
            }, status=status.HTTP_200_OK)

        # ── Utilisateur connecté : persistance + RAG ──────────────────────────
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({"error": "Profil patient introuvable."}, status=status.HTTP_403_FORBIDDEN)

        # Résoudre la session
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, patient=patient)
            except ChatSession.DoesNotExist:
                pass  # session_id invalide → on en crée une nouvelle

        if not session:
            session = ChatSession.objects.create(patient=patient)

        # 1. Sauvegarder le message utilisateur
        ChatMessage.objects.create(session=session, role="user", content=user_message)

        # 2. Préparer l'historique (20 derniers messages)
        past_messages = session.messages.all().order_by('-timestamp')[:20]
        history_for_api = [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(list(past_messages))
        ]

        # 3. Appeler Groq (RAG)
        ai_response = openai_chat_completion(history_for_api)

        # 4. Extraire les actions et nettoyer
        clean_content, actions = extract_actions_and_clean_message(ai_response)

        # 5. Sauvegarder la réponse IA
        ai_msg_obj = ChatMessage.objects.create(
            session=session, role="assistant", content=clean_content
        )

        return Response({
            "session_id": session.id,
            "message": ChatMessageSerializer(ai_msg_obj).data,
            "actions": actions,
        }, status=status.HTTP_200_OK)
