# Feature Parity Audit: React vs Flutter

## Executive Summary
Complete feature mapping of React web app pages vs Flutter mobile app screens to identify gaps and ensure feature parity.

---

## 1. AUTH MODULE

### React Auth Pages (4 pages)
- LoginPage.tsx ✅
- RegisterPage.tsx ✅
- ForgotPasswordPage.tsx ✅
- VerifyCodePage.tsx ✅

### Flutter Auth Screens (6 screens)
- login_screen.dart ✅
- register_screen.dart ✅
- request_password_reset_screen.dart ✅
- reset_password_confirm_screen.dart ✅
- verify_code_screen.dart ✅
- splash_screen.dart ⚠️ (Flutter-specific, not in React)

**Status:** ✅ ALL REACT PAGES COVERED + 1 Flutter-specific screen
**Gaps:** None - Flutter has complete auth with splash screen

---

## 2. PATIENT ROLE

### React Patient Pages (13 pages)
| Page | Flutter | Status |
|------|---------|--------|
| AIAgentPage.tsx | patient_chatbot_screen.dart ❌ | Uses patientChatbotScreen in features/chatbot/, not patient/ |
| AppointmentBookingPage.tsx | rendezvous_booking_screen.dart ✅ | ✅ |
| ConsultationDetailPage.tsx | patient_consultation_detail_screen.dart ✅ | ✅ |
| EditProfilePage.tsx | edit_profile_screen.dart ✅ | In core/, shared across roles |
| HealthTipsPage.tsx | health_tips_screen.dart ✅ | In core/, shared across roles |
| HospitalDetailPage.tsx | patient_hospital_details_screen.dart ✅ | ✅ (note: _details.dart vs Detail) |
| NearbyHospitalsPage.tsx | patient_nearby_hospitals_screen.dart ✅ | ✅ |
| PatientIntakePage.tsx | patient_intake_screen.dart ✅ | ✅ |
| ResultSharePage.tsx | patient_result_share_screen.dart ✅ | ✅ |
| AppointmentsPage (common) | patient_appointments_screen.dart ✅ | ✅ |
| MessagesPage (common) | patient_messages_screen.dart ✅ | ✅ |
| ResultsPage (common) | patient_results_screen.dart ✅ | ✅ |
| SearchPage (common) | patient_search_screen.dart ✅ | ✅ |

### Missing/New Flutter Screens in Patient
- patient_home_screen.dart ❓ (Dashboard - exists in React?)
- patient_about_screen.dart ✅ (Common About)
- patient_change_password_screen.dart ✅ (Common in SecurityPage)
- patient_language_screen.dart ❓ (Language - Flutter-specific)
- patient_notification_settings_screen.dart ❓ (Settings - Flutter-specific)
- patient_profile_screen.dart ✅ (Related to ProfilePage)
- patient_result_code_screen.dart ❓ (New tracking feature?)
- hopital_detail_screen.dart ❓ (Duplicate?)
- service_detail_screen.dart ❓ (New feature)

**Status:** ⚠️ MOSTLY COVERED - Additional Flutter screens need investigation

---

## 3. DOCTOR (MEDECIN) ROLE

### React Doctor Pages (2 pages)
| Page | Flutter | Status |
|------|---------|--------|
| ConsultationDetailPage.tsx | medecin_consultation_detail_screen.dart ✅ | ✅ |
| ConsultationsPage.tsx | medecin_consultations_screen.dart ✅ | ✅ |

### Flutter Doctor (Medecin) Screens (9 screens)
- medecin_home_screen.dart ✅ (Dashboard)
- medecin_agenda_screen.dart ✅ (Calendar/Appointments)
- medecin_consultations_screen.dart ✅ (Consultations list)
- medecin_consultation_detail_screen.dart ✅ (Consultation detail)
- medecin_patients_screen.dart ✅ (Patients list)
- medecin_resultat_patient_screen.dart ✅ (Patient results)
- medecin_messages_screen.dart ✅ (Messaging)
- medecin_about_screen.dart ✅ (About)
- medecin_change_password_screen.dart ✅ (Security)
- medecin_profile_screen.dart ✅ (Profile)

### React Common Pages (Doctor can access)
- DoctorAgendaPage.tsx → medecin_agenda_screen.dart ✅
- PatientsPage.tsx → medecin_patients_screen.dart ✅
- ProfilePage.tsx → medecin_profile_screen.dart ✅
- SecurityPage.tsx → medecin_change_password_screen.dart ✅

**Status:** ✅ ALL REACT DOCTOR PAGES COVERED + Extended Flutter dashboard

---

## 4. ADMIN HOPITAL ROLE

### React Admin Pages (11 pages)
| Page | Flutter | Status |
|------|---------|--------|
| AdminAppointmentsPage.tsx | admin_hopital_supervision_rdv_screen.dart ✅ | Supervision version |
| AdminConsultationsPage.tsx | admin_hopital_supervision_consultations_screen.dart ✅ | Supervision version |
| AdminDemandesPage.tsx | admin_hopital_demandes_screen.dart ✅ | ✅ |
| AdminDoctorsPage.tsx | admin_hopital_medecins_screen.dart ✅ | ✅ |
| AdminLaboratoryPage.tsx | admin_hopital_supervision_laboratoire_screen.dart ✅ | ✅ |
| AdminPatientJourneyPage.tsx | admin_hopital_patient_journey_screen.dart ✅ | ✅ |
| AdminPatientsPage.tsx | admin_hopital_patients_screen.dart ✅ | ✅ |
| AdminPostCarePage.tsx | ❌ | **MISSING** |
| AdminServicesPage.tsx | admin_hopital_services_screen.dart ✅ | ✅ |
| AdminStaffPage.tsx | ❌ | **MISSING** (or merged into medecins_screen?) |
| AdminStatsPage.tsx | admin_hopital_stats_screen.dart ✅ | ✅ |

### Flutter Admin Screens (15 screens)
- admin_hopital_home_screen.dart ✅ (Dashboard)
- admin_hopital_demandes_screen.dart ✅ (Requests)
- admin_hopital_medecins_screen.dart ✅ (Doctors)
- admin_hopital_laborantins_screen.dart ✅ (Lab technicians)
- admin_hopital_patients_screen.dart ✅ (Patients)
- admin_hopital_services_screen.dart ✅ (Services)
- admin_hopital_supervision_rdv_screen.dart ✅ (Appointments)
- admin_hopital_supervision_consultations_screen.dart ✅ (Consultations)
- admin_hopital_supervision_laboratoire_screen.dart ✅ (Lab)
- admin_hopital_patient_journey_screen.dart ✅ (Patient journey)
- admin_hopital_stats_screen.dart ✅ (Stats)
- admin_hopital_messages_screen.dart ✅ (Messaging)
- admin_hopital_settings_screen.dart ✅ (Settings)
- admin_hopital_change_password_screen.dart ✅ (Security)
- admin_hopital_about_screen.dart ✅ (About)

**Status:** ⚠️ MOSTLY COVERED - 2 React pages missing: AdminPostCarePage, AdminStaffPage

---

## 5. LABORANTIN ROLE

### React Laborantin Pages (2 pages)
| Page | Flutter | Status |
|------|---------|--------|
| LaborantinPendingPage.tsx | laborantin_pending_analyses_screen.dart ✅ | ✅ |
| LaborantinFinishedPage.tsx | laborantin_finished_analyses_screen.dart ✅ | ✅ |

### Flutter Laborantin Screens (7 screens)
- laborantin_dashboard_screen.dart ✅ (Dashboard)
- laborantin_pending_analyses_screen.dart ✅ (Pending)
- laborantin_finished_analyses_screen.dart ✅ (Finished)
- laborantin_messages_screen.dart ✅ (Messaging)
- laborantin_profile_screen.dart ✅ (Profile)
- laborantin_about_screen.dart ✅ (About)
- laborantin_change_password_screen.dart ✅ (Security)

**Status:** ✅ ALL REACT PAGES COVERED + Extended Flutter dashboard + messaging

---

## 6. SUPER ADMIN ROLE

### React Super Admin Pages (7 pages)
| Page | Flutter | Status |
|------|---------|--------|
| CreateHospitalPage.tsx | super_admin_create_hopital_screen.dart ✅ | ✅ |
| EntitiesPage.tsx | super_admin_hopitaux_screen.dart ✅ | Hospitals management |
| EntityDetailPage.tsx | super_admin_hopital_detail_screen.dart ✅ | ✅ |
| SuperAdminDemandesPage.tsx | super_admin_demandes_screen.dart ✅ | ✅ |
| SuperAdminServicesPage.tsx | super_admin_services_screen.dart ✅ | ✅ |
| SuperAdminStatsPage.tsx | super_admin_stats_screen.dart ✅ | ✅ |
| UsersPage.tsx | super_admin_users_screen.dart ✅ | ✅ |

### Flutter Super Admin Screens (11 screens)
- super_admin_home_screen.dart ✅ (Dashboard)
- super_admin_hopitaux_screen.dart ✅ (Hospitals)
- super_admin_hopital_detail_screen.dart ✅ (Hospital detail)
- super_admin_create_hopital_screen.dart ✅ (Create hospital)
- super_admin_users_screen.dart ✅ (Users)
- super_admin_demandes_screen.dart ✅ (Requests)
- super_admin_services_screen.dart ✅ (Services)
- super_admin_stats_screen.dart ✅ (Stats)
- super_admin_settings_screen.dart ✅ (Settings)
- super_admin_change_password_screen.dart ✅ (Security)
- super_admin_about_screen.dart ✅ (About)

**Status:** ✅ ALL REACT PAGES COVERED + Extended Flutter dashboard

---

## 7. COMMON PAGES (Shared across roles)

### React Common Pages (14 pages)
| Page | Role-Specific Flutter | Shared Flutter | Status |
|------|----------------------|-----------------|--------|
| AppointmentsPage.tsx | patient_appointments_screen.dart | ✅ | Distributed per role |
| ChangePasswordPage.tsx | `*_change_password_screen.dart` | ✅ | Distributed per role |
| DoctorAgendaPage.tsx | medecin_agenda_screen.dart | ✅ | Doctor-specific |
| EmergencyNumbersPage.tsx | emergency_numbers_screen.dart | core/ ✅ | ✅ |
| FAQPage.tsx | faq_screen.dart | core/ ✅ | ✅ |
| GuidePage.tsx | ❌ | **MISSING** | |
| LegalPage.tsx | legal_mentions_screen.dart | core/legal/ ✅ | ✅ |
| MessagesPage.tsx | `*_messages_screen.dart` | ✅ | Distributed per role |
| NotificationsPage.tsx | notification_screen.dart | notifications/ ✅ | ✅ |
| OnboardingPage.tsx | onboarding_screen.dart | core/ ✅ | ✅ |
| PatientsPage.tsx | medecin_patients_screen.dart | ✅ | Doctor-specific |
| ProfilePage.tsx | `*_profile_screen.dart` | ✅ | Distributed per role |
| ResultsPage.tsx | patient_results_screen.dart | ✅ | Patient-specific |
| SearchPage.tsx | patient_search_screen.dart | ✅ | Patient-specific |
| SecurityPage.tsx | `*_change_password_screen.dart` | ✅ | Distributed per role |
| SettingsPage.tsx | `*_settings_screen.dart` | ✅ | Distributed per role |
| TermsPage.tsx | terms_of_use_screen.dart | core/legal/ ✅ | ✅ |

### Flutter Core/Shared Screens (11 screens)
- edit_profile_screen.dart ✅ (Common)
- emergency_numbers_screen.dart ✅ (Common)
- faq_screen.dart ✅ (Common)
- health_tips_screen.dart ✅ (Common)
- onboarding_screen.dart ✅ (Common)
- public_hospital_search_screen.dart ✅ (Public)
- legal_mentions_screen.dart ✅ (Legal)
- privacy_policy_screen.dart ✅ (Legal)
- terms_of_use_screen.dart ✅ (Legal)

**Status:** ⚠️ MOSTLY COVERED - GuidePage missing from Flutter

---

## 8. PUBLIC PAGES

### React Public Pages (4 pages)
| Page | Flutter | Status |
|------|---------|--------|
| PublicChatbotPage.tsx | patient_chatbot_screen.dart? | Uncertain - needs verification |
| PublicHomePage.tsx | ❌ | **MISSING** |
| PublicHospitalsPage.tsx | public_hospital_search_screen.dart | ✅ (in core/) |
| TrackResultsPage.tsx | patient_result_code_screen.dart | Possibly ✅ |

**Status:** ⚠️ INCOMPLETE - Public home and chatbot mapping unclear

---

## 9. SPECIAL FEATURES

### React Features
- AI Agent (Chatbot) - AIAgentPage.tsx
- Messaging - MessagesPage.tsx (shared)
- Notifications - NotificationsPage.tsx (shared)
- Health Tips - HealthTipsPage.tsx (patient)
- Search - SearchPage.tsx (patient)

### Flutter Features
- Chatbot - patient_chatbot_screen.dart ✅
- Chat - chat_screen.dart ✓
- Messagerie - chat_screen.dart + conversation_list_screen.dart ✓
- Notifications - notification_screen.dart ✅
- Health Tips - health_tips_screen.dart ✅
- Search - patient_search_screen.dart + public_hospital_search_screen.dart ✅

**Status:** ✅ Core features matched

---

## 10. SUMMARY & RECOMMENDATIONS

### ✅ Fully Mapped Features
1. Auth system (4/4 React pages covered + splash screen)
2. Doctor/Medecin (2/2 React pages covered + extended dashboard)
3. Laborantin (2/2 React pages covered + extended features)
4. Super Admin (7/7 React pages covered + extended dashboard)
5. Chatbot/AI Agent
6. Messaging system
7. Notifications
8. Most Patient features (10/13 with questions on 3)

### ⚠️ Missing React Pages in Flutter (Priority 1)
- **GuidePage.tsx** - No Flutter equivalent found
- **AdminPostCarePage.tsx** - No Flutter equivalent found
- **AdminStaffPage.tsx** - May be merged into AdminMedecinsPage

### ❓ Flutter Screens Needing React Equivalent (Priority 2)
- **patient_language_screen.dart** - Is there language switching in React?
- **patient_notification_settings_screen.dart** - Is there notification settings in React?
- **patient_home_screen.dart** - Is there a patient dashboard?
- **medecin_home_screen.dart** - Is there a doctor dashboard?
- **admin_hopital_home_screen.dart** - Is there an admin dashboard?
- Multiple role-specific home screens - Need verification

### 🔄 Unclear Mappings (Priority 3)
- **PublicChatbotPage.tsx** vs **patient_chatbot_screen.dart** - Public vs Patient?
- **TrackResultsPage.tsx** vs **patient_result_code_screen.dart** - Are these the same?
- **AIAgentPage.tsx** location - In patient/ in React but chatbot/ in Flutter
- **hopital_detail_screen.dart** vs **patient_hospital_details_screen.dart** - Duplicates?

---

## 11. IMPLEMENTATION STATUS

### ✅ COMPLETED

1. **guide_screen.dart** ✅ CREATED
   - Location: `enligne/Frontend/lib/features/core/presentation/screens/guide_screen.dart`
   - Status: Complete with 4-step guide + security section
   - Needs: Add to routing in app_router.dart

2. **admin_hopital_post_care_screen.dart** ✅ CREATED
   - Location: `enligne/Frontend/lib/features/admin_hopital/presentation/screens/admin_hopital_post_care_screen.dart`
   - Status: Complete with metrics, follow-up cards, progress tracking
   - Needs: API endpoint integration, Add to routing in app_router.dart

3. **public_home_screen.dart** ✅ CREATED
   - Location: `enligne/Frontend/lib/features/core/presentation/screens/public_home_screen.dart`
   - Status: Complete with features showcase, statistics, CTA buttons
   - Needs: Verify routing for unauthenticated users

4. **admin_hopital_staff_screen.dart** ℹ️ NOT NEEDED
   - Reason: React's AdminStaffPage is for Laborantin management
   - Flutter Equivalent: `admin_hopital_laborantins_screen.dart` (already exists)
   - Conclusion: Feature parity complete ✅

### 🔄 NEXT STEPS

1. **Add Routes to app_router.dart**
   - Add guide_screen to core routes (accessible to all authenticated users)
   - Add admin_hopital_post_care_screen to admin_hopital routes
   - Verify public_home_screen routing for unauthenticated users

2. **Verify Language & Notification Settings**
   - Check if patient_language_screen.dart is needed (React feature check required)
   - Check if patient_notification_settings_screen.dart is needed (React feature check required)

3. **API Integration**
   - Connect admin_hopital_post_care_screen to actual API endpoints
   - Implement search, filtering, and data refresh

4. **Test All Navigation Flows**
   - Verify role-based access to new screens
   - Test all CTAs and navigation buttons
   - Validate consistency with React flows

---

## File Locations Reference

**React:** `Frontend-react/src/pages/`
**Flutter:** `enligne/Frontend/lib/features/`

**New Flutter Screens Added:**
- `enligne/Frontend/lib/features/core/presentation/screens/guide_screen.dart`
- `enligne/Frontend/lib/features/admin_hopital/presentation/screens/admin_hopital_post_care_screen.dart`
- `enligne/Frontend/lib/features/core/presentation/screens/public_home_screen.dart`
