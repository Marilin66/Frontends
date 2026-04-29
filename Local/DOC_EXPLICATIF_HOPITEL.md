# 🏥 Rapport Explicatif : Projet Hopitel

## 1. Vision et Objectifs
**Hopitel** est une plateforme intégrée de gestion de santé conçue pour moderniser le système médical au Bénin. L'objectif est de centraliser les interactions entre les patients, les praticiens et les établissements de santé afin d'éliminer les lenteurs administratives et d'améliorer la qualité des soins.

---

## 2. Écosystème Technique (Stack)
Le projet repose sur une architecture découplée offrant performance et scalabilité :

- **Backend (Cerveau) :** Développé avec **Django 4.2** et **Django REST Framework**. Il gère la logique métier, la sécurité par jetons **JWT**, et les communications asynchrones via **Daphne/Channels**.
- **Frontend (Interface) :** Application mobile et web développée avec **Flutter**. Elle utilise **Riverpod 3.x** pour une gestion d'état réactive et **GoRouter** pour une navigation fluide basée sur les rôles.
- **Base de Données :** Utilisation de **PostgreSQL** pour une gestion relationnelle robuste des dossiers patients et des planning médecins.
- **Temps Réel :** Protocole **WebSocket** pour la messagerie instantanée et les notifications push.

---

## 3. Architecture Logicielle
### A. Backend : Structure Modulaire
Le backend est organisé en 7 applications distinctes :
1. **Accounts** : Gestion fine des profils (Patient, Médecin, Laborantin, Admins) et authentification sécurisée.
2. **Hopitaux** : Cartographie des établissements, gestion des services et statistiques.
3. **Rendez-vous** : Système de gestion des disponibilités et workflow des consultations.
4. **Resultats (BioTrack)** : Module de gestion des analyses médicales avec upload de documents PDF.
5. **Messagerie** : Hub de communication temps réel entre patients et médecins.
6. **Notifications** : Système d'alerte pour les confirmations, résultats et messages.
7. **Chatbot (IA)** : Agent intelligent utilisant l'architecture RAG.

### B. Frontend : Clean Architecture
L'application Flutter suit les principes de la *Clean Architecture* :
- **Core** : Services réseau (Dio), routage, thèmes et constantes globales.
- **Features** : Chaque module (Auth, Patient, Medecin, Chat) est isolé avec sa propre logique UI et ses contrôleurs Riverpod.

---

## 4. Fonctionnalités Majeures par Rôle

### 👤 Le Patient
- **Recherche Géo-spatiale** : Trouver les hôpitaux les plus proches grâce à l'algorithme Haversine.
- **Prise de RDV simplifiée** : Consultation des créneaux libres des médecins en temps réel.
- **Portefeuille de Santé** : Accès immédiat aux résultats d'analyses (BioTrack) dès qu'ils sont disponibles.
- **Assistant IA** : Un chatbot qui répond aux questions et guide vers les bonnes fonctionnalités.

### 👨‍⚕️ Le Médecin
- **Gestion d'Agenda** : Interface intuitive pour valider ou refuser les consultations.
- **Téléconsultation (Chat)** : Communication sécurisée avec le patient une fois le RDV confirmé.
- **Historique Patient** : Consultation rapide du parcours du patient au sein de l'hôpital.

### 🧪 Le Laborantin
- **Digitalisation des résultats** : Publication sécurisée des résultats d'analyses liés aux consultations.
- **Notifications automatiques** : Alertes envoyées au patient dès la mise en ligne d'un résultat.

### 🏛️ Administration (Hôpital & Super Admin)
- **Gestion des ressources** : Pilotage des services, des médecins et des comptes utilisateurs.
- **Statistiques** : Analyse du volume de consultations et de l'activité globale.

---

## 5. Innovations et Valeurs Ajoutées

### 🧠 L'IA Assistant avec RAG (Retrieval-Augmented Generation)
Contrairement aux chatbots classiques, l'IA d'Hopitel est "connectée" à la base de données :
- Elle peut vérifier elle-même si un cardiologue est disponible.
- Elle génère des **"Deep Links"** : des boutons d'action qui apparaissent dans le chat pour permettre au patient d'ouvrir directement un écran spécifique (ex: "Prendre RDV avec ce médecin").

### 🔐 Workflow de Consultation Sécurisé
Le système impose un cycle de vie strict :
1. Un message WebSocket de chat ne peut être envoyé que si une consultation est active.
2. Dès que le médecin clôture la consultation, le canal de communication est verrouillé au niveau du backend (Sécurité par design).

### 📍 Algorithmique Locative
Intégration d'une logique de calcul spatial permettant de trier les ressources de santé non pas par ordre alphabétique, mais par pertinence géographique réelle.

---

## 6. Conclusion
Hopitel n'est pas seulement une application de prise de rendez-vous, c'est un véritable **Système d'Information Hospitalier (SIH) mobile**. Sa force réside dans son architecture moderne, son focus sur l'expérience utilisateur et l'intégration pragmatique de l'Intelligence Artificielle pour fluidifier le parcours patient.
