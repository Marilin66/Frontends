# 🔗 Guide de Raccordement Frontend / Backend (Chatbot)

L'interface Chatbot côté Flutter existe déjà et est très belle (Riverpod + UI moderne). Cependant, elle a été construite originellement pour s'attendre à d'autres clés JSON.

Puisque nous avons normalisé l'API Backend selon un standard professionnel (`message` et `content`), voici **les 2 seules modifications** à apporter au code Flutter. NE touchez pas à l'UI (`patient_chatbot_screen.dart`), seul le fichier source de données (Datasource) doit être ajusté.

---

### 1. Fichier `lib/core/constants/api_constants.dart`
Assurez-vous que l'URL d'appel correspond au nouvel endpoint Django :

```dart
// Modifiez ou ajoutez cette constante :
static const String chatbotMessage = '/api/chatbot/message/';
// Et si vous souhaitez implémenter l'historique plus tard :
static const String chatbotHistory = '/api/chatbot/history/';
```

---

### 2. Fichier `lib/features/chatbot/data/datasources/chatbot_remote_datasource.dart`
Actuellement, le frontend envoie `{'question': question}` et attend `response.data['reponse']`. 
Il faut le mettre à jour pour envoyer `message` et recevoir `message -> content`.

**Remplacez la méthode `askQuestion` actuelle par celle-ci :**

```dart
// lib/features/chatbot/data/datasources/chatbot_remote_datasource.dart

Future<String> askQuestion(String question) async {
  try {
    // 1. Appel du nouvel endpoint 
    final response = await _client.post(
      ApiConstants.chatbotMessage, // <-- Nouvelle constante
      data: {'message': question}, // <-- 'message' au lieu de 'question'
    );
    
    // 2. Extraction du JSON standardisé
    // Le backend renvoie : { "message": { "role": "assistant", "content": "..." } }
    final messageData = response.data['message'];
    return messageData['content'] as String? ?? 'Aucune réponse.';
    
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
}
```

---

### Résultat attendu 🎉
C'est tout ! Dès que vous sauvegardez ces 2 fichiers :
1. L'application Flutter enverra ses messages à la nouvelle route sécurisée.
2. Le système recevra bien votre clé XAI silencieusement.
3. Le chatbot répondra parfaitement !
