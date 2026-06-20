# 🏥 E-Santé Bénin - Production

Application de gestion de santé pour le Bénin déployée sur Render.

## 🌐 URLs Production

- **Backend**: https://backend-x5yj.onrender.com
- **Frontend**: https://frontend-soutenance-1et0.onrender.com

## 📊 Statut

✅ **Fonctionnel**: L'application est déployée et opérationnelle  
✅ **Email**: SMTP configuré pour les notifications  
✅ **Base de données**: PostgreSQL synchronisée  

## 🔧 Configuration Production

### Backend (Django)
- **Framework**: Django 4.2 + DRF 3.15
- **Base de données**: PostgreSQL (Render)
- **Authentification**: JWT (SimpleJWT)
- **Email**: SMTP Gmail
- **WebSocket**: Django Channels

### Frontend (Flutter)
- **Framework**: Flutter 3.11+
- **State Management**: Riverpod
- **HTTP Client**: Dio
- **Routing**: GoRouter

## 🚀 Déploiement

### Variables d'environnement requises

**Backend**:
```bash
SECRET_KEY=votre-clé-secrète
DJANGO_DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/dbname
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-app-password
DEFAULT_FROM_EMAIL=noreply@esante-benin.com
FRONTEND_URL=https://frontend-soutenance-1et0.onrender.com
BACKEND_URL=https://backend-x5yj.onrender.com
```

**Frontend**:
```bash
BASE_URL_WEB=https://backend-x5yj.onrender.com/api
BASE_URL_MOBILE=https://backend-x5yj.onrender.com/api
```

### Commandes de maintenance

**Nettoyer et synchroniser la base de données**:
```bash
python fix_database.py
```

**Appliquer les migrations**:
```bash
python manage.py migrate
```

**Créer un superadmin**:
```bash
python manage.py createsuperuser
```

##  Configuration Réseau Mobile

### Problème de connexion résolu

L'application mobile est maintenant configurée pour se connecter en production :

✅ **URL Production** : `https://backend-x5yj.onrender.com/api`  
✅ **Android** : `android:usesCleartextTraffic="true"` configuré  
✅ **iOS** : `NSAppTransportSecurity` avec `NSAllowsArbitraryLoads` activé  

### Pour build de production

1. **Vérifier le `.env`** :
   ```bash
   BASE_URL_MOBILE=https://backend-x5yj.onrender.com/api
   ```

2. **Builder l'APK** :
   ```bash
   flutter clean
   flutter pub get
   flutter build apk --release
   ```

### Pour développement local via WiFi

1. **Trouver votre IP locale** :
   ```bash
   ipconfig  # Windows
   # Chercher "IPv4 Address" (ex: 192.168.1.100)
   ```

2. **Modifier le `.env`** :
   ```bash
   BASE_URL_MOBILE=http://192.168.1.100:8000/api
   ```

3. **Démarrer le backend local** :
   ```bash
   daphne -b 0.0.0.0 -p 8000 backend_soutenance.asgi:application
   ```

## �👥 Comptes de Test

### 🏥 Hôpitaux
- **Centre Hospitalier Universitaire (CHU)** - Cotonou
- **Centre National Hospitalier et Universitaire (CNHU)** - Cotonou  
- **Hôpital de Zone de Porto-Novo** - Porto-Novo

### 👨‍⚕️ Médecins
| Email | Spécialité | Mot de passe |
|-------|------------|--------------|
| dr.koffi@chu-benin.bj | Médecine Générale | Medecin123456! |
| dr.adjo@chu-benin.bj | Cardiologie | Medecin123456! |
| dr.sossa@cnhu-benin.bj | Pédiatrie | Medecin123456! |
| dr.agbo@cnhu-benin.bj | Gynécologie-Obstétrique | Medecin123456! |
| dr.tchabi@hzp-portonovo.bj | Chirurgie | Medecin123456! |

### 🧪 Laborantins
| Email | Laboratoire | Mot de passe |
|-------|-------------|--------------|
| labo1@chu-benin.bj | Analyses générales | Labo123456! |
| labo2@chu-benin.bj | Biochimie | Labo123456! |
| labo3@cnhu-benin.bj | Hématologie | Labo123456! |
| labo4@hzp-portonovo.bj | Bactériologie | Labo123456! |

### 👨‍💼 Administrateurs
| Email | Rôle | Mot de passe |
|-------|------|--------------|
| admin.chu@chu-benin.bj | Admin Hôpital (CHU) | Admin123456! |
| admin.cnhu@cnhu-benin.bj | Admin Hôpital (CNUH) | Admin123456! |
| admin.hzp@hzp-portonovo.bj | Admin Hôpital (HZP) | Admin123456! |
| admin.general@esante-benin.bj | Admin Général | AdminGen123456! |

### 📅 Disponibilités
- ✅ Créneaux disponibles pour les 7 prochains jours
- ✅ 4 créneaux par jour : 8h, 10h, 14h, 16h
- ✅ Pour les 3 premiers médecins (Dr Koffi, Dr Adjo, Dr Sossa)

## 📱 Fonctionnalités

- ✅ Inscription et connexion des patients
- ✅ Prise de rendez-vous en ligne
- ✅ Messagerie temps réel (WebSocket)
- ✅ Résultats d'analyses médicales
- ✅ Notifications push
- ✅ Chatbot IA intégré

## 🔍 Dépannage

### Problèmes courants

**Inscription échoue**:
- Vérifier les logs backend sur Render
- Confirmer que la base de données est accessible
- Vérifier les variables d'environnement SMTP

**Email non reçu**:
- Vérifier la configuration SMTP dans `.env`
- Confirmer que l'email n'est pas dans les spams
- Vérifier les logs d'envoi d'emails

**WebSocket ne connecte pas**:
- Le backend doit utiliser `daphne` (pas `runserver`)
- Vérifier que `CHANNEL_LAYERS` est configuré

## 📈 Monitoring

- **Logs**: Disponibles dans le dashboard Render
- **Base de données**: PostgreSQL monitoring
- **Performance**: Render metrics

## 🔄 Mises à jour

1. Push sur la branche `main`
2. Déploiement automatique via Render
3. Exécuter `fix_database.py` si nécessaire
4. Tester les fonctionnalités critiques

---

📧 **Support**: Pour toute question sur la production, contacter l'administrateur système.
