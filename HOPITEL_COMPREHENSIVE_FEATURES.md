# Hopitel Healthcare Platform - Comprehensive Features Documentation

**Platform Name:** E-Santé Bénin / Hopitel  
**Date:** 2025  
**Version:** Complete Implementation

---

## TABLE OF CONTENTS

1. [User Roles & Permissions](#user-roles--permissions)
2. [Core Features & Functionalities](#core-features--functionalities)
3. [API Endpoints](#api-endpoints)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Models & Entities](#data-models--entities)
6. [Feature Parity by Platform](#feature-parity-by-platform)

---

## USER ROLES & PERMISSIONS

### 1. **PATIENT** (Patient)
**Purpose:** End-user seeking medical services

**Specific Features:**
- User Registration & Authentication
- Email verification via token (24hr validity)
- Profile management with medical information
- Blood group, allergies, and emergency contact information
- Password reset functionality

**Medical Services Access:**
- Search hospitals by location, name, services, or filters
- View hospital details with location coordinates
- Browse available medical doctors
- View doctor specialties and biographies
- See doctor availability calendars
- Book appointments with time slots

**Appointment Management:**
- Create appointment requests (en_attente status)
- Cancel appointments
- View appointment history
- Fill pre-registration intake forms (Intake Patient)
  - Symptom descriptions
  - Current treatments
  - Symptom onset date
  - Additional observations

**Consultation & Follow-up:**
- Access post-consultation care information
- View medical results/analyses (BioTrack)
- Access results via code (for external patients)
- Share results with doctors
- Download result PDF files

**Messaging & Communication:**
- Real-time messaging with treating doctors
- Access consultation-linked conversations
- Receive medical guidance via chat
- Message type: text, voice, file attachments

**AI-Powered Features:**
- Chat with healthcare AI agent (Groq/OpenAI LLM)
- AI-assisted symptom guidance
- Health tips and FAQs
- Tool-based appointment booking from chat

**Notifications:**
- Appointment confirmations/refusals
- Consultation additions
- New result availability
- Incoming messages
- New account welcome notifications

**Additional Features:**
- Emergency contact management
- Health tips library
- Hospital nearby finder (GPS)
- FAQ access
- Guide documentation
- Notification management settings
- Profile picture upload
- Language preferences

---

### 2. **MEDECIN** (Doctor)
**Purpose:** Healthcare provider managing patients and consultations

**Profile & Setup:**
- Professional order number (numéro d'ordre unique)
- Biography/qualifications
- Status (Active/Inactive)
- Default appointment duration configuration (minutes)
- Specialty/service associations

**Availability Management:**
- Set recurring availability by day of week (Lundi-Dimanche)
- Define working hours (heure_debut, heure_fin)
- Create exceptions for specific dates
- Mark unavailable periods (leave, absence)
- Configure appointment duration per patient

**Appointment Management:**
- View appointments list (filtered by status)
- See patient profile and intake information
- Confirm pending appointments (en_attente → confirme)
- Refuse appointments with comments
- Mark appointments as completed (termine)
- Access free time slots for patients to book

**Patient Consultation:**
- Fill consultation reports after completed appointments
- Record diagnostic findings
- Write prescriptions
- Upload consultation notes
- Link medical results to consultations
- Close consultation records

**Messaging & Patient Communication:**
- Chat with specific patients
- Access consultation-linked conversations
- Receive and send messages (text, voice, files)
- Mark messages as read
- Access full consultation history

**Patient Management:**
- View list of patients they're consulting
- Access patient medical history
- View patient results shared with them
- Track patient progress

**Results Management:**
- View lab results shared by patients
- Receive results associated with consultations
- Reference results in consultations

**Admin Dashboard Access (if doctor is admin_hopital):**
- Manage other doctors in hospital
- Manage laborantins
- Approve service requests
- View hospital statistics
- Patient journey tracking

---

### 3. **LABORANTIN** (Lab Technician)
**Purpose:** Healthcare professional managing medical analyses and results

**Profile & Setup:**
- Laboratory name association
- Hospital assignment
- Status active/inactive

**Analysis Workflow:**
- Register new patient analysis requests (analyses/demandes)
- Record patient information:
  - Patient name/first name
  - Email and phone
  - Date of birth
  - Link to registered patients (if inscribed on platform)

**Analysis Types:**
- Support all analysis types (text-based descriptions)
- Examples: NFS (blood count), Fasting glucose, Lipid panel

**Result Management:**
- Close analysis requests by depositing PDF results
- Generate unique access codes for results:
  - Format: `{HOSPITAL_CODE}-{YYYYMM}-{6_RANDOM_ALPHANUMERIC}`
  - Example: `CHUC-202504-A3F9K1`
- Specify result title and analysis date
- Associate results with patient consultations (optional)

**Result Delivery:**
- Email notification to patients automatically
- SMS notification via Twilio
- Notification to platform if patient is registered
- Result sharing links for external patients

**Patient Result Access:**
- Patients access via code (no login required)
- Registered patients see results in their account
- View analysis request history
- Mark analyses as complete (cloture)

**Hospital Dashboard Access (if admin_hopital):**
- View hospital statistics
- Monitor analysis workflow
- Track pending/completed analyses

**Messaging (Optional):**
- Message healthcare team if needed

---

### 4. **ADMIN_HOPITAL** (Hospital Administrator)
**Purpose:** Healthcare facility management and staff coordination

**Hospital Management:**
- View hospital profile information
- Edit hospital details:
  - Name, address, city
  - Phone, email, website
  - Logo, location coordinates
  - Active/inactive status
- View hospital services offered
- Manage hospital statistics and dashboards

**Service Management:**
- Request addition of new services to hospital
- Submit existing or new service requests
- Track service request status (en_attente/valide/refuse)
- Receive notifications on service approvals/rejections

**Staff Management - Doctors:**
- View all doctors assigned to hospital
- Create new doctor accounts:
  - Set professional order number
  - Configure default appointment duration
  - Assign specialties/services
  - Activate/deactivate accounts
- Edit doctor information
- Assign services to doctors
- Manage doctor availability

**Staff Management - Laborantins:**
- Create laborantin accounts
- Assign to hospital
- View laborantin list
- Deactivate accounts
- Configure laboratory information

**Patient Management:**
- View all patients of hospital
- Track patient history
- Monitor patient journey through system
- Search and filter patients

**Consultation Monitoring:**
- Supervise all consultations in hospital
- View consultation details
- Track completion status

**Appointment Supervision:**
- View all appointments in hospital
- Monitor appointment statuses
- Track appointment history

**Lab Management:**
- Monitor analysis requests (pending/completed)
- View laborantin activities
- Track result deposits

**Messaging:**
- Message team and patients
- Supervision of hospital communications

**Reports & Analytics:**
- View hospital statistics:
  - Appointment metrics
  - Patient volume
  - Service utilization
  - Revenue/activity analytics
- Access patient journey reports
- Monitor system usage

**Post-Care Management:**
- Configure post-care guidelines
- View post-care recommendations for patients

---

### 5. **ADMIN_GENERAL** (Super Administrator)
**Purpose:** Platform-wide administration and governance

**User Management:**
- Create/edit/deactivate hospitals
- Create/edit/deactivate doctor accounts
- Create/edit/deactivate lab technician accounts
- Create admin hospital accounts
- Manage patient accounts

**Hospital Management:**
- Approve/reject new hospital registrations
- Activate/deactivate hospitals
- Edit hospital information
- View all hospital statistics
- Monitor hospital operations

**Service Management:**
- Create global services (library)
- Edit service definitions
- Configure service metadata and icons
- Approve/reject service addition requests from hospitals
- View all service requests

**Appointment Oversight:**
- View all platform appointments
- Monitor appointment statuses
- Supervise consultation process

**Analysis Management:**
- View all analysis requests across platform
- Monitor result deposits
- Verify result completeness

**Platform Statistics:**
- Global dashboard with platform metrics
- User statistics (doctors, patients, labs)
- Appointment trends
- Hospital performance metrics
- Service utilization reports

**Notification Management:**
- Send platform-wide notifications
- System alerts

**Doctor CSV Import:**
- Bulk import doctors via CSV
- Template download for bulk uploads
- Automated account creation and email notification

---

## CORE FEATURES & FUNCTIONALITIES

### 1. **AUTHENTICATION & ACCOUNT MANAGEMENT**

**Registration Flow:**
- Patient self-registration (email, password, personal info)
- Staff account creation by admins (admin_hopital or admin_general)
- Email verification with 24-hour token validity
- Automatic email notification on account creation with password reset link

**Login:**
- Email-based authentication (no username)
- JWT token-based session management
- Token refresh mechanism
- Password reset via email token (15-minute validity)

**User Roles:**
- PATIENT, MEDECIN, ADMIN_HOPITAL, ADMIN_GENERAL, LABORANTIN
- Role-based access control (RBAC) throughout API

**Profile Management:**
- Update personal information
- Change profile picture
- Modify contact information
- Emergency contact management (for patients)
- Medical history and blood type (for patients)

---

### 2. **HOSPITAL MANAGEMENT** (hopitaux app)

**Hospital Entity:**
- Complete hospital profiles with details
- Location-based search (latitude/longitude)
- Service offerings per hospital
- Staff directory per hospital
- Hospital code generation for result access

**Services Catalog:**
- Global service library (Cardiology, Pediatrics, Emergency, etc.)
- Service metadata with icons/images
- Hospital-specific service configuration
- Service request workflow for new services
- Medical service hierarchy

**Doctor-Service Assignment:**
- Link doctors to their specialties
- Multiple specialty support per doctor
- Service availability per hospital

---

### 3. **APPOINTMENT SYSTEM** (rendezvous app)

**Doctor Availability Management:**
- Recurring availability (weekly schedule)
- Exception availability (one-time slots)
- Unavailable periods (leave/absence)
- Flexible time-slot generation

**Appointment Lifecycle:**
- **Statuses:** en_attente → confirme/refuse → termine/annule
- Patient initiates appointment request
- Doctor confirms or refuses appointment
- Patient can cancel appointment
- Doctor marks as completed

**Slot Generation:**
- Dynamic creneau (time slot) generation based on:
  - Doctor availability
  - Booked appointments
  - Doctor default duration
- API returns free slots for date range
- Up to 30-day lookout (configurable)

**Appointment Details:**
- Patient-doctor pairing
- Specific date/time
- Duration tracking
- Cancellation reason tracking
- Automatic timestamps (created, modified)

---

### 4. **PRE-CONSULTATION INTAKE** (Pre-enregistrement)

**Patient Intake Form:**
- Fill before appointment or at registration
- Fields:
  - Main symptoms description
  - Symptom onset date
  - Current treatments
  - Additional observations
- Timestamps (submitted, updated)
- Auto-saves to appointment record

**Intake Access:**
- Doctor sees intake before consultation
- Patient can update before consultation
- Single intake per appointment

---

### 5. **CONSULTATION & MEDICAL RECORDS** (Consultations)

**Post-Appointment Consultation:**
- Created when doctor marks appointment as complete
- One-to-one relationship with appointment

**Consultation Contents:**
- Consultation report/notes
- Diagnostic findings
- Prescriptions
- Medical recommendations
- Consultation date/time tracking
- Closure status

**Consultation Workflow:**
- Consultation opened post-appointment
- Doctor fills in findings
- Can be kept open for follow-up
- Doctor marks as closed (clôturée)

---

### 6. **MESSAGING SYSTEM** (messagerie app)

**Message Types:**
- Text messages
- Voice messages (audio files)
- File attachments

**Message Routing:**
- Consultation-based messaging (within specific consultation)
- Direct messaging (between any users)
- Both threaded together in one system

**Message Features:**
- Sender/recipient tracking
- Read/unread status
- Timestamp tracking
- Audio file storage for voice messages

**Conversation List:**
- Aggregated conversations (consultation + direct messages)
- Sorted by most recent
- Unread message count per conversation
- Last message preview

**Real-time Features:**
- WebSocket support for live messaging
- Group broadcast for consultation participants

---

### 7. **RESULTS MANAGEMENT - BioTrack** (resultats app)

**Analysis Request Workflow:**
- Laborantin creates analysis request
- Tracks patient information
- Analysis request statuses: en_cours → cloture

**Result Deposit:**
- PDF file upload
- Unique access code generation
- Analysis date recording
- Laboratory attribution
- Optional consultation linking

**Result Storage:**
- File storage in `resultats/%Y/%m/`
- Metadata: title, date, hospital, lab
- Patient association (registered or external)

**Result Access Methods:**

**Method 1: Code-Based Access (Public)**
- No login required
- Use unique code: `{HOSPITAL_CODE}-{YYYYMM}-{6_ALPHANUMERIC}`
- External patients access results via secure code

**Method 2: Patient Portal (Registered Users)**
- Patients see results in their account
- List of all results with dates
- PDF download functionality

**Method 3: Doctor Sharing**
- Patient shares specific results with doctors
- Doctor can view shared results
- Multiple doctor sharing possible

**Notifications:**
- Email to patient automatically
- SMS via Twilio (if phone number available)
- In-app notification (if patient registered)

---

### 8. **AI CHATBOT ASSISTANT** (Chatbot)

**Technology:**
- LLM-powered conversational AI
- Compatible with: Groq (Llama 3.3), OpenAI (GPT-4), OpenRouter, xAI
- Default: Groq (free tier recommended for production)

**Chatbot Sessions:**
- Create multiple conversation sessions per patient
- Session history persistence
- Session title auto-generated from first message

**Chat Features:**
- Public access (no login required) or authenticated users
- Context-aware responses
- Message history retrieval
- Conversation threading

**AI Capabilities:**
- Medical symptom guidance
- Healthcare information
- Health tips and FAQs
- Tool-based actions:
  - Appointment booking (authenticated users only)
  - Doctor search and filtering
  - Hospital search

**Tool System:**
- JSON action extraction from AI responses
- Structured action format: `[{"label": "Action", "type": "action_type", ...}]`
- Frontend renders interactive buttons
- Handles appointment creation programmatically

**Message History:**
- Last 20 messages kept in context
- Full session history available
- Supports multi-turn conversations

---

### 9. **NOTIFICATIONS SYSTEM** (notifications app)

**Notification Types:**
- RAPPEL_RDV: Appointment reminders
- NOUVEAU_RDV: New appointment request
- RDV_CONFIRME: Appointment confirmed
- RDV_REFUSE: Appointment refused
- RDV_ANNULE: Appointment cancelled
- CONSULTATION_AJOUTEE: Consultation added
- NOUVEAU_RESULTAT: New result available
- NOUVEAU_MESSAGE: New incoming message
- COMPTE_CREE: Account created
- DEMANDE_SERVICE: Service request submitted
- VALIDATION_SERVICE: Service approved
- REFUS_SERVICE: Service rejected

**Notification Features:**
- In-app notification center
- Read/unread status
- Notification links to relevant pages
- Timestamp tracking
- User-specific targeting

**Delivery Channels:**
- In-app only (primary)
- Email notifications (secondary, optional)
- SMS via Twilio (optional, for critical events)

---

### 10. **GEOGRAPHIC FEATURES**

**Nearby Hospital Search:**
- GPS-based hospital finder
- Distance calculation from user location
- Hospital filtering by proximity
- Returns nearby hospitals with coordinates

**Hospital Details:**
- Hospital location (latitude/longitude)
- Address, city, phone, email
- Website link
- Logo and branding

**Integration:**
- Maps integration on frontend
- Location services on mobile (Flutter)

---

### 11. **ACCOUNT RECOVERY & SECURITY**

**Password Reset:**
- Email-based password recovery
- Secure token generation (cryptographic signing)
- Token validity: 15 minutes
- HTML form for non-app users
- API endpoint for app users

**Email Verification:**
- 24-hour validity for verification tokens
- Status tracking (is_email_verified)
- Automatic activation on verification

---

### 12. **ADMINISTRATIVE WORKFLOWS**

**Service Request Approval:**
- Admin hospital submits service requests
- Admin general reviews requests
- Approve: adds service to hospital, creates notification
- Reject: sends rejection reason to admin hospital
- Email notification to requester

**Doctor CSV Import:**
- Template download for bulk uploads
- Parse CSV file
- Batch create doctor accounts
- Send welcome emails automatically
- Create notifications

**Hospital Registration:**
- Admin general approves new hospitals
- Hospital code auto-generation with conflict resolution
- Hospital activation/deactivation

---

## API ENDPOINTS

### **BASE URL:** `http://backend/api/`

### **AUTHENTICATION**

```
POST   /token/                           - Obtain JWT tokens
POST   /token/refresh/                   - Refresh access token
```

### **ACCOUNTS** (`/accounts/`)

```
POST   /accounts/register/               - Patient self-registration
GET    /accounts/verify-email/<token>/   - Email verification (HTML page)
POST   /accounts/request-password-reset/ - Request password reset link
POST   /accounts/reset-password-confirm/ - Confirm password reset
GET    /accounts/reset-password/<token>/ - Password reset form (HTML)
GET    /accounts/users/me/               - Get authenticated user profile
PUT    /accounts/users/me/               - Update user profile
PATCH  /accounts/users/me/               - Partial update user profile

--- DOCTORS (Médecins) ---
GET    /accounts/medecins/               - List all active doctors (public/filtered)
POST   /accounts/medecins/               - Create doctor (admin only)
POST   /accounts/medecins/import/        - Bulk import doctors via CSV
GET    /accounts/medecins/import-template/ - Download CSV template
GET    /accounts/medecins/<id>/          - Doctor details (public)
PUT    /accounts/medecins/<id>/          - Update doctor info
PATCH  /accounts/medecins/<id>/          - Partial update doctor
DELETE /accounts/medecins/<id>/          - Deactivate doctor
POST   /accounts/medecins/<id>/desactiver/ - Deactivate doctor (explicit)

--- LABORANTINS ---
GET    /accounts/laborantins/            - List laborantins
POST   /accounts/laborantins/            - Create laborantin (admin only)
GET    /accounts/laborantins/<id>/       - Laborantin details
PUT    /accounts/laborantins/<id>/       - Update laborantin
PATCH  /accounts/laborantins/<id>/       - Partial update
DELETE /accounts/laborantins/<id>/       - Deactivate laborantin

--- PATIENTS (Admin view) ---
GET    /accounts/patients/               - List patients (admin filtered)
GET    /accounts/patients/<id>/          - Patient details
PUT    /accounts/patients/<id>/          - Update patient
PATCH  /accounts/patients/<id>/          - Partial update patient

--- ADMIN HÔPITAUX (Admin General management) ---
GET    /accounts/admin-hopitaux/         - List hospital admins
POST   /accounts/admin-hopitaux/         - Create hospital admin
GET    /accounts/admin-hopitaux/<id>/    - Admin details
PUT    /accounts/admin-hopitaux/<id>/    - Update admin
PATCH  /accounts/admin-hopitaux/<id>/    - Partial update
```

**Query Parameters:**
- `search` - Search by name, email, phone
- `hopital` - Filter by hospital ID
- `service` - Filter doctors by service ID

---

### **HOSPITALS** (`/hopitaux/`)

```
--- HOSPITAL MANAGEMENT ---
GET    /hopitaux/                        - List all hospitals (public)
POST   /hopitaux/                        - Create hospital (admin general)
GET    /hopitaux/<id>/                   - Hospital details (public)
PUT    /hopitaux/<id>/                   - Update hospital (admin)
PATCH  /hopitaux/<id>/                   - Partial update hospital
DELETE /hopitaux/<id>/                   - Deactivate hospital

GET    /hopitaux/nearby/                 - Nearby hospitals (GPS-based)
GET    /hopitaux/mes-services/           - My hospital's services (admin hôpital)
GET    /hopitaux/mes-services/<id>/      - Update service (admin hôpital)
GET    /hopitaux/patients/               - Hospital patients (admin hôpital)
GET    /hopitaux/statistiques/           - Hospital statistics (admin hôpital)

--- SERVICES ---
GET    /services/                        - List all services (public)
POST   /services/                        - Create service (admin general)
GET    /services/<id>/                   - Service details
PUT    /services/<id>/                   - Update service
PATCH  /services/<id>/                   - Partial update service

--- HOSPITAL SERVICES ---
GET    /hopitaux/<hopital_id>/services/  - Services at hospital

--- SERVICE REQUESTS ---
POST   /hopitaux/<hopital_id>/demandes/  - Request new service (admin hôpital)
GET    /demandes/                        - List requests (admin hôpital or general)
POST   /demandes/<id>/valider/           - Approve request (admin general)
POST   /demandes/<id>/refuser/           - Reject request (admin general)

--- DOCTOR SERVICES ---
GET    /medecins/<medecin_id>/services/  - Doctor's services
POST   /medecins/<medecin_id>/services/  - Add service to doctor (admin)
DELETE /medecins/<medecin_id>/services/<service_id>/ - Remove service
```

**Query Parameters:**
- `ville` - Filter by city
- `service` - Filter by service ID
- `search` - Search hospitals

---

### **APPOINTMENTS & CONSULTATIONS** (`/rendezvous/`)

```
--- AVAILABILITY ---
GET    /disponibilites/                  - List doctor availabilities
POST   /disponibilites/                  - Create availability (doctor)
GET    /disponibilites/<id>/             - Availability details
PUT    /disponibilites/<id>/             - Update availability
DELETE /disponibilites/<id>/             - Delete availability

GET    /medecins/<medecin_id>/disponibilites/ - Doctor's availabilities
GET    /medecins/<medecin_id>/creneaux/  - Free time slots (generate slots)

--- APPOINTMENTS ---
GET    /rendezvous/                      - List appointments (user's)
POST   /rendezvous/                      - Create appointment (patient)
GET    /rendezvous/<id>/                 - Appointment details
POST   /rendezvous/<id>/confirmer/       - Confirm appointment (doctor)
POST   /rendezvous/<id>/refuser/         - Refuse appointment (doctor)
POST   /rendezvous/<id>/annuler/         - Cancel appointment (patient)
POST   /rendezvous/<id>/terminer/        - Mark complete (doctor)
POST   /rendezvous/<id>/preenregistrement/ - Fill pre-consultation intake

--- CONSULTATIONS ---
GET    /consultations/                   - List consultations
GET    /consultations/<id>/              - Consultation details
PUT    /consultations/<id>/              - Update consultation (doctor)
POST   /consultations/<id>/cloturer/     - Close consultation (doctor)
```

**Query Parameters:**
- `statut` - Filter by status (en_attente, confirme, termine, etc.)
- `medecin` - Filter by doctor ID
- `service` - Filter by service
- `type` - Filter availability type (recurrent, exception, indisponible)

---

### **MESSAGES** (`/messagerie/`)

```
GET    /messages/conversations/          - List user conversations
GET    /messages/                        - List messages (filtered)
POST   /messages/                        - Send message
POST   /messages/<id>/mark-read/         - Mark message as read
```

**Query Parameters:**
- `consultation` - Messages in consultation
- `destinataire` - Direct messages with user

---

### **RESULTS & ANALYSES** (`/resultats/`)

```
--- ANALYSIS REQUESTS ---
GET    /analyses/                        - List analysis requests
POST   /analyses/                        - Create analysis request (laborantin)
POST   /analyses/<id>/cloturer/          - Close analysis & deposit result

--- RESULTS ---
GET    /resultats/                       - List results (user's visible)
POST   /resultats/                       - Deposit result (laborantin)
GET    /resultats/<id>/                  - Result details
GET    /resultats/<id>/telecharger/      - Download result PDF
POST   /resultats/<id>/partager/         - Share result with doctor
DELETE /resultats/<id>/partager/<medecin_id>/ - Revoke sharing

GET    /resultats/acces/<code>/          - Access result via code (public)
GET    /laborantins/patients/            - Lab's patients (laborantin)
```

**Query Parameters:**
- `search` - Search by patient name, email, analysis type
- `statut` - Filter by status (en_cours, cloture)
- `ordering` - Sort by date_inscription, statut

---

### **CHATBOT** (`/chatbot/`)

```
GET    /chatbot/history/                 - Get last session (or create)
GET    /chatbot/history/<session_id>/    - Get specific session
GET    /chatbot/sessions/                - List all sessions (authenticated)
POST   /chatbot/sessions/                - Create new session (authenticated)
POST   /chatbot/message/                 - Send message & get AI response
```

**Parameters:**
- `message` - User message (required)
- `session_id` - Session ID (optional, creates if missing)

---

### **NOTIFICATIONS** (`/notifications/`)

```
GET    /notifications/                   - List notifications (user's)
POST   /notifications/<id>/mark-read/    - Mark notification as read
```

---

## FRONTEND ARCHITECTURE

### **REACT WEB APP** (`Frontend-react/`)

**Key Pages & Features:**

#### **Public Pages**
- **PublicHomePage** - Landing page
- **PublicHospitalsPage** - Hospital directory
- **PublicChatbotPage** - AI assistant (unauthenticated)

#### **Authentication**
- **LoginPage** - User login
- **RegisterPage** - Patient registration
- **ForgotPasswordPage** - Password recovery
- **VerifyCodePage** - Email verification
- **ChangePasswordPage** - Password change (authenticated)
- **SecurityPage** - Security settings

#### **Patient Features**
- **PatientDashboard** - Patient home screen
- **AppointmentsPage** - View/manage appointments
- **AppointmentBookingPage** - Book new appointment
- **ConsultationsPage** - View consultations
- **ConsultationDetailPage** - Consultation details
- **ResultsPage** - View medical results
- **TrackResultsPage** - Result tracking
- **ResultSharePage** - Share results with doctors
- **PatientIntakePage** - Pre-consultation form
- **PatientSearchPage** - Search doctors/hospitals
- **MessagesPage** - Messaging interface
- **NotificationsPage** - View notifications
- **NearbyHospitalsPage** - Find nearby hospitals
- **HospitalDetailPage** - Hospital information
- **ProfilePage** - Patient profile
- **EditProfilePage** - Edit profile
- **HealthTipsPage** - Health education
- **FAQPage** - Frequently asked questions
- **EmergencyNumbersPage** - Emergency contacts
- **GuidePage** - Platform guide
- **LegalPage** - Legal information
- **TermsPage** - Terms of service
- **OnboardingPage** - First-time user setup
- **AIAgentPage** - AI chat interface

#### **Doctor Features**
- **DoctorDashboard** - Doctor home screen
- **DoctorAgendaPage** - Availability management
- **ConsultationsPage** - Manage consultations
- **PatientsPage** - Patient list
- **MessagesPage** - Patient messaging
- **ProfilePage** - Doctor profile

#### **Laborantin (Lab Tech)**
- **LaborantinDashboard** - Lab home screen
- **LaborantinPendingPage** - Pending analyses
- **LaborantinFinishedPage** - Completed analyses

#### **Admin Hospital**
- **AdminDashboard** - Dashboard
- **AdminAppointmentsPage** - Appointment supervision
- **AdminConsultationsPage** - Consultation tracking
- **AdminPatientsPage** - Patient management
- **AdminDoctorsPage** - Doctor management
- **AdminStaffPage** - Staff directory
- **AdminLaboratoryPage** - Lab supervision
- **AdminServicesPage** - Service management
- **AdminDemandesPage** - Service requests
- **AdminPostCarePage** - Post-care guidelines
- **AdminPatientJourneyPage** - Patient journey tracking
- **AdminStatsPage** - Hospital statistics

#### **Super Admin**
- **SuperAdminDashboard** - Platform dashboard
- **UsersPage** - User management
- **EntitiesPage** - Hospital entities
- **EntityDetailPage** - Entity details
- **CreateHospitalPage** - Create hospital
- **SuperAdminServicesPage** - Global services
- **SuperAdminDemandesPage** - All service requests
- **SuperAdminStatsPage** - Platform statistics

**Technology Stack:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- REST API integration
- JWT authentication

---

### **FLUTTER MOBILE APP** (`enligne/Frontend/`)

**Flutter Screens by Role:**

#### **Public/Onboarding**
- **SplashScreen** - App startup
- **PublicHomeScreen** - Unauthenticated home
- **LoginScreen** - Authentication
- **RegisterScreen** - Patient signup
- **VerifyCodeScreen** - Email verification
- **RequestPasswordResetScreen** - Password recovery
- **ResetPasswordConfirmScreen** - Reset confirmation
- **OnboardingScreen** - First-time user guide

#### **Patient Screens**
- **PatientHomeScreen** - Patient dashboard
- **PatientAppointmentsScreen** - Appointment list
- **RendezvousBookingScreen** - Book appointment
- **PatientConsultationDetailScreen** - View consultation
- **PatientResultsScreen** - View results
- **PatientResultCodeScreen** - Access via code
- **PatientResultShareScreen** - Share results
- **PatientIntakeScreen** - Pre-registration form
- **PatientNearbyHospitalsScreen** - Nearby hospitals
- **PatientHospitalDetailsScreen** - Hospital info
- **PatientSearchScreen** - Search doctors/hospitals
- **PatientMessagesScreen** - Messaging
- **PatientChatbotScreen** - AI chat
- **ChatScreen** - General chat interface
- **ConversationListScreen** - Message list
- **PatientProfileScreen** - Profile view
- **EditProfileScreen** - Edit profile
- **PatientNotificationSettingsScreen** - Notification settings
- **NotificationScreen** - View notifications
- **PatientLanguageScreen** - Language selection
- **PatientAboutScreen** - About app
- **PatientChangePasswordScreen** - Password change
- **HealthTipsScreen** - Health information
- **FAQScreen** - FAQ
- **GuideScreen** - Usage guide
- **EmergencyNumbersScreen** - Emergency contacts
- **LegalMentionsScreen** - Legal info
- **PrivacyPolicyScreen** - Privacy policy
- **TermsOfUseScreen** - Terms

#### **Doctor Screens**
- **MedecinHomeScreen** - Doctor dashboard
- **MedecinAgendaScreen** - Availability management
- **MedecinConsultationsScreen** - Consultations list
- **MedecinConsultationDetailScreen** - Consultation detail
- **MedecinPatientsScreen** - Patient list
- **MedecinResultatPatientScreen** - View patient results
- **MedecinMessagesScreen** - Patient messaging
- **MedecinProfileScreen** - Doctor profile
- **MedecinChangePasswordScreen** - Password change
- **MedecinAboutScreen** - About

#### **Laborantin Screens**
- **LaborantinDashboardScreen** - Lab home
- **LaborantinPendingAnalysesScreen** - Pending work
- **LaborantinFinishedAnalysesScreen** - Completed work
- **LaborantinProfileScreen** - Profile
- **LaborantinMessagesScreen** - Messages
- **LaborantinChangePasswordScreen** - Password
- **LaborantinAboutScreen** - About

#### **Admin Hospital Screens**
- **AdminHopitalHomeScreen** - Admin dashboard
- **AdminHopitalMedecinsScreen** - Doctor management
- **AdminHopitalLaborantinsScreen** - Lab staff
- **AdminHopitalPatientsScreen** - Patient directory
- **AdminHopitalServicesScreen** - Service management
- **AdminHopitalDemandesScreen** - Service requests
- **AdminHopitalSupervisionRDVScreen** - Appointment supervision
- **AdminHopitalSupervisionConsultationsScreen** - Consultation tracking
- **AdminHopitalSupervisionLaboratoireScreen** - Lab supervision
- **AdminHopitalPatientJourneyScreen** - Patient journey
- **AdminHopitalPostCareScreen** - Post-care
- **AdminHopitalStatsScreen** - Statistics
- **AdminHopitalSettingsScreen** - Settings
- **AdminHopitalChangePasswordScreen** - Password
- **AdminHopitalAboutScreen** - About

#### **Super Admin Screens**
- **SuperAdminHomeScreen** - Dashboard
- **SuperAdminHopitauxScreen** - Hospital management
- **SuperAdminHopitalDetailScreen** - Hospital details
- **SuperAdminServicesScreen** - Services
- **SuperAdminDemandesScreen** - All requests
- **SuperAdminStatsScreen** - Statistics
- **SuperAdminSettingsScreen** - Settings
- **SuperAdminChangePasswordScreen** - Password
- **SuperAdminAboutScreen** - About
- **SuperAdminCreateHopitalScreen** - Create hospital

#### **Utility Screens**
- **ServiceDetailScreen** - Service information
- **HopitalDetailScreen** - Hospital details

**Architecture:**
- Clean Architecture pattern
- Feature-based module structure
- Riverpod/Provider for state management
- REST API client integration
- JWT token management

---

## DATA MODELS & ENTITIES

### **Users & Accounts** (`accounts`)

```
User (AbstractUser)
├── email (unique, primary identifier)
├── role (PATIENT | MEDECIN | ADMIN_HOPITAL | ADMIN_GENERAL | LABORANTIN)
├── telephone
├── date_naissance
├── sexe (M, F, Autre)
├── hopital (FK - null for patients/general admin)
├── adresse
├── photo
├── is_email_verified
├── is_active
└── date_joined

Patient (OneToOne with User)
├── user
├── contact_urgence_nom
├── contact_urgence_tel
├── groupe_sanguin
├── allergies
└── numero_secu

Medecin (OneToOne with User)
├── user
├── numero_ordre (unique)
├── biographie
├── statut (actif | inactif)
└── duree_rdv_default

Laborantin (OneToOne with User)
├── user
└── laboratoire

Service (Global service catalog)
├── nom (unique)
├── description
├── icone
├── image
├── is_active
└── date_creation
```

---

### **Hospital & Services** (`hopitaux`)

```
Hopital
├── nom
├── code_court (unique, auto-generated)
├── adresse
├── ville
├── telephone
├── email
├── site_web
├── description
├── logo
├── latitude
├── longitude
├── is_active
└── date_creation

Service (see above)

HopitalService (M2M relationship)
├── hopital (FK)
├── service (FK)
├── description_locale
└── date_ajout

MedecinService (M2M relationship)
├── medecin (FK)
├── service (FK)
└── date_ajout

DemandeAjoutService
├── hopital (FK)
├── service_existant (FK, nullable)
├── nom_nouveau_service
├── description_nouveau_service
├── statut (en_attente | valide | refuse)
├── date_demande
├── date_traitement
├── commentaire
├── traite_par (FK - Admin General)
└── demande_par (FK - Admin Hospital)
```

---

### **Appointments & Consultations** (`rendezvous`)

```
Disponibilite
├── medecin (FK)
├── type (recurrent | exception | indisponible)
├── jour_semaine (1-7, for recurrent)
├── date_specifique (for exceptions)
├── heure_debut
├── heure_fin
├── is_active
└── date_creation

RendezVous
├── patient (FK)
├── medecin (FK)
├── date_heure
├── duree (minutes)
├── motif
├── statut (en_attente | confirme | annule | refuse | termine)
├── commentaire_annulation
├── cree_le
└── modifie_le

Consultation (OneToOne with RendezVous)
├── rendez_vous
├── compte_rendu
├── diagnostic
├── prescription
├── date_consultation
├── est_cloture
└── date_cloture

PreEnregistrement (OneToOne with RendezVous)
├── rendez_vous
├── symptomes_principaux
├── debut_symptomes
├── traitements_en_cours
├── observations
├── soumis_le
└── mis_a_jour_le
```

---

### **Results & Analyses** (`resultats`)

```
DemandeAnalyse
├── hopital (FK)
├── laborantin (FK)
├── patient (FK, nullable)
├── patient_nom
├── patient_prenom
├── patient_email
├── patient_telephone
├── patient_ddn
├── type_analyse
├── statut (en_cours | cloture)
├── date_inscription
├── date_cloture
└── resultat (OneToOne - created on closure)

Resultat
├── patient (FK, nullable)
├── laborantin (FK)
├── hopital (FK)
├── consultation (FK, nullable)
├── titre
├── fichier (PDF)
├── date_analyse
├── date_depot
├── code_acces (unique, auto-generated)
├── patient_nom_externe
├── patient_email_externe
├── laboratoire
├── partages (M2M with Medecin)
└── demande (reverse OneToOne)
```

---

### **Messaging** (`messagerie`)

```
Message
├── consultation (FK, nullable)
├── expediteur (FK - User)
├── destinataire (FK - User)
├── contenu
├── type_message (texte | vocal | fichier)
├── audio (for voice messages)
├── date_envoi
├── lu (boolean)
└── piece_jointe (optional file)
```

---

### **Notifications** (`notifications`)

```
Notification
├── user (FK)
├── type (RAPPEL_RDV | NOUVEAU_RDV | ... see list above)
├── message
├── lu
├── date_envoi
└── lien (optional URL)
```

---

### **AI Chatbot** (`Chatbot`)

```
ChatSession
├── patient (FK)
├── date_creation
└── messages (reverse FK)

ChatMessage
├── session (FK)
├── role (user | assistant)
├── content
└── timestamp
```

---

## FEATURE PARITY BY PLATFORM

### **Feature Matrix: Web (React) vs Mobile (Flutter)**

| Feature | React | Flutter | Notes |
|---------|-------|---------|-------|
| **Authentication** | ✓ | ✓ | Full parity |
| **Patient Dashboard** | ✓ | ✓ | Both platforms |
| **Doctor Dashboard** | ✓ | ✓ | Both platforms |
| **Appointment Booking** | ✓ | ✓ | Full functionality |
| **Appointment Management** | ✓ | ✓ | View, cancel, confirm |
| **Consultation Viewing** | ✓ | ✓ | Full parity |
| **Intake Forms** | ✓ | ✓ | Pre-registration |
| **Results Management** | ✓ | ✓ | View, download, share |
| **Result Access by Code** | ✓ | ✓ | Public access |
| **Messaging** | ✓ | ✓ | Real-time chat |
| **Voice Messaging** | Partial | ✓ | Better mobile support |
| **AI Chatbot** | ✓ | ✓ | Full parity |
| **Notifications** | ✓ | ✓ | In-app, push capable |
| **Admin Dashboard** | ✓ | ✓ | Admin features |
| **Doctor Availability** | ✓ | ✓ | Schedule management |
| **Nearby Hospitals** | ✓ | ✓ | GPS-based |
| **Hospital Search** | ✓ | ✓ | Full search |
| **Service Requests** | ✓ | ✓ | Admin features |
| **Bulk CSV Import** | ✓ | Partial | Web focus |
| **Offline Mode** | ✗ | Partial | Mobile advantage |
| **Push Notifications** | ✗ | ✓ | Native mobile feature |
| **Camera Integration** | ✗ | ✓ | Mobile only |
| **Health Sharing** | ✓ | ✓ | Share results |

---

## SUMMARY

**Hopitel (E-Santé Bénin)** is a comprehensive, multi-role healthcare platform with:

- **5 User Roles** with distinct feature sets
- **13 Core Feature Areas** covering appointment management, consultation tracking, lab results, messaging, and AI assistance
- **100+ API Endpoints** providing complete CRUD and workflow operations
- **Multi-platform Deployment** (Web React, Mobile Flutter)
- **Enterprise Features** including admin dashboards, reporting, and service management

The platform supports the entire patient journey from hospital discovery through appointment booking, consultation, result sharing, and follow-up communication.

