from django.urls import path
from .views import ChatHistoryView, ChatSessionsView, SendMessageView

app_name = 'chatbot'

urlpatterns = [
    # Envoi de message (public + authentifié)
    path('message/', SendMessageView.as_view(), name='chat-message'),

    # Sessions (liste + création)
    path('sessions/', ChatSessionsView.as_view(), name='chat-sessions'),

    # Historique : dernière session ou session spécifique
    path('history/', ChatHistoryView.as_view(), name='chat-history'),
    path('history/<int:session_id>/', ChatHistoryView.as_view(), name='chat-history-session'),
]
