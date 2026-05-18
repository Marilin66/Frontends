// @ts-nocheck
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Configuration
// Utiliser le backend en ligne pour la production
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8000/api' : 'https://backend-soutenance-1et0.onrender.com/api');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s — le backend Render free tier peut prendre 30-60s à se réveiller
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si les données sont un FormData, supprimer le Content-Type fixe
    // pour laisser axios définir automatiquement le boundary multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const isPersistent = localStorage.getItem('refresh_token') !== null;
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}${endpoints.refreshToken}`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          
          if (isPersistent) {
            localStorage.setItem('auth_token', access);
          } else {
            sessionStorage.setItem('auth_token', access);
          }
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, clear everything
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then((res) => res.data),
  
  post: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  
  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then((res) => res.data),
  
  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then((res) => res.data),
  
  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((res) => res.data),
};

// API endpoints
export const endpoints = {
  // Auth
  login: '/token/',
  register: '/accounts/register/',
  logout: '/token/logout/',
  refreshToken: '/token/refresh/',
  me: '/accounts/users/me/',
  changePassword: '/accounts/users/me/change-password/',
  requestPasswordReset: '/accounts/request-password-reset/',
  resetPasswordConfirm: '/accounts/reset-password-confirm/',

  // Users & Staff
  users: '/accounts/patients/',
  medecins: '/accounts/medecins/',
  medecinsImport: '/accounts/medecins/import/',
  medecinsImportTemplate: '/accounts/medecins/import-template/',
  laborantins: '/accounts/laborantins/',
  patients: '/accounts/patients/',
  adminHopitaux: '/accounts/admin-hopitaux/',
  utilisateurs: '/accounts/users/',
  
  userDetail: (id: number) => `/accounts/patients/${id}/`,
  medecinDetail: (id: number) => `/accounts/medecins/${id}/`,
  laborantinDetail: (id: number) => `/accounts/laborantins/${id}/`,

  // Hospitals & Services
  hopitaux: '/hopitaux/',
  hopitauxNearby: '/hopitaux/nearby/',
  hopitalDetail: (id: number) => `/hopitaux/${id}/`,
  hopitalServices: (id: number) => `/hopitaux/${id}/services/`,
  hopitalServicesProprietaire: '/hopitaux/mes-services/',
  mesServices: '/hopitaux/mes-services/',
  // Supervision & Administration Hôpital
  hopitalStatistiques:   '/hopitaux/supervision/dashboard/',
  supervisionRendezVous:  '/hopitaux/supervision/rendezvous/',
  supervisionConsultations: '/hopitaux/supervision/consultations/',
  supervisionLaboratoire:  '/hopitaux/supervision/laboratoire/',
  parcoursPatient: (id: number | string) => `/hopitaux/supervision/patient/${id}/parcours/`,
  laborantinPatients:    '/hopitaux/laborantin/patients/',
  demandesServices: '/demandes/',
  createDemandeService: (hopitalId: number) => `/hopitaux/${hopitalId}/demandes/`,
  validerDemande: (id: number) => `/demandes/${id}/valider/`,
  refuserDemande: (id: number) => `/demandes/${id}/refuser/`,
  servicesGlobaux: '/services/', // Tous les services dispos
  
  // Appointments (Rendez-vous)
  rendezVous: '/rendezvous/',
  rendezVousDetail: (id: number) => `/rendezvous/${id}/`,
  confirmerRdv: (id: number) => `/rendezvous/${id}/confirmer/`,
  refuserRdv: (id: number) => `/rendezvous/${id}/refuser/`,
  annulerRdv: (id: number) => `/rendezvous/${id}/annuler/`,
  terminerRdv: (id: number) => `/rendezvous/${id}/terminer/`,
  medecinDisponibilites: (id: number) => `/medecins/${id}/disponibilites/`,
  medecinCreneaux: (id: number) => `/medecins/${id}/creneaux/`,
  disponibilites: '/disponibilites/',
  disponibiliteDetail: (id: number) => `/disponibilites/${id}/`,
  // Patient Intake (Pré-enregistrement avant consultation)
  preEnregistrement: (rdvId: number) => `/rendezvous/${rdvId}/preenregistrement/`,
  // Consultations
  consultations: '/consultations/',
  consultationDetail: (id: number) => `/consultations/${id}/`,
  cloturerConsultation: (id: number) => `/consultations/${id}/cloturer/`,
  
  // Medical Results
  resultats: '/resultats/',
  resultatDetail: (id: number) => `/resultats/${id}/`,
  // Analyses (BioTrack)
  analyses: '/analyses/',
  demandesAnalyse: '/analyses/',
  cloturerAnalyse: (id: number) => `/analyses/${id}/cloturer/`,
  laborantinPatients: '/laborantins/patients/',
  getResultatByCode: (code: string) => `/resultats/acces/${code}/`,

  // Messaging & Notifications
  conversations: '/conversations/',
  messages: '/messages/',
  notifications: '/notifications/',
  markAllRead: '/notifications/mark-all-read/',
  chatbot: '/chatbot/message/',
  chatbotSessions: '/chatbot/sessions/',
  chatbotHistory: (id?: number) => id ? `/chatbot/history/${id}/` : '/chatbot/history/',
};

export default apiClient;
