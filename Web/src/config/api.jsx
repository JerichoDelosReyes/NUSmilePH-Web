// Hardcoded configuration (works immediately)
export const API_URL ="https://nusmileph-backend.onrender.com/api"|| "http://localhost:3000/api";
// "https://nusmileph-backend.onrender.com/api"||
// https://vercel.com/centsadilis-projects
export const ENVIRONMENT = "development";
export const APP_NAME = "NUSmilePH";

// Configuration object
export const CONFIG = {
  API_URL,
  ENVIRONMENT,
  APP_NAME,
  IS_DEVELOPMENT: ENVIRONMENT === "development",
  IS_PRODUCTION: ENVIRONMENT === "production",
  TIMEOUT: 30000,
  DEBUG: true,
};

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_URL}/login`,
  VERIFY_OTP_LOGIN: `${API_URL}/login/verify-otp`,
  FORGOT_PASSWORD: `${API_URL}/forgot-password`,

  VERIFY_ACTIVATION_CODE: `${API_URL}/clinical-chair/verify-activation`,
  SIGNUP: `${API_URL}/register`,
  VERIFY_OTP_SIGNUP: `${API_URL}/register/verify-otp`,
  LOGOUT: `${API_URL}/logout`,

  // User Management
  GET_SESSION_USER: `${API_URL}/getSessionUser`,
  GET_USER_BY_ID: (userId) => `${API_URL}/getUserById/${userId}`,
  GET_USER_PROFILE: (userId) => `${API_URL}/getUserProfile/${userId}`,
  UPDATE_USER_PROFILE: (userId) => `${API_URL}/updateUserProfile/${userId}`,
  UPDATE_USER_BY_ID: (userId) =>
    `${API_URL}/users/${userId}/update/initiate`,
  UPDATE_USER_INITIATE: (userId) =>
    `${API_URL}/users/${userId}/update/initiate`,
  UPDATE_USER_VERIFY_OTP: `${API_URL}/users/update/verify-otp`,
  UPDATE_PASSWORD: (userId) => `${API_URL}/users/${userId}/update/password`,
  UPDATE_PASSWORD_VERIFY_OTP: `${API_URL}/users/update/password/verify-otp`,

  //get file
  GET_USER_PROFILE_IMAGE: (imageID) =>
    `${API_URL}/getFile/profile_pics/${imageID}`,
  GET_PATIENT_SIGNATURE: (imageID) =>
    `${API_URL}/getFile/patient_signature/${imageID}`,
  GET_CLINICIAN_SIGNATURE: (imageID) =>
    `${API_URL}/getFile/clinician_signature/${imageID}`,
  GET_FACULTY_SIGNATURE: (imageID) =>
    `${API_URL}/getFile/clinical_instructor_signature/${imageID}`,

  // Dashboard & Notifications
  GET_DASHBOARD_DATA: `${API_URL}/dashboardData`,
  GET_NOTIFICATIONS: `${API_URL}/notifications`,
  MARK_NOTIFICATION_READ: (notificationId) =>
    `${API_URL}/markNotificationRead/${notificationId}`,

  // Patients
  GET_PATIENTS_ALL: `${API_URL}/patients/get/all`,
  GET_CLINICIAN_PATIENTS: (clinicianId) =>
    `${API_URL}/clinician/${clinicianId}/get/patients`,
  GET_PATIENT_BY_ID: (patientId) => `${API_URL}/patient/get/${patientId}`,
  CREATE_PATIENT: (clinicianId) =>
    `${API_URL}/clinician/${clinicianId}/create/patient`,
  UPDATE_PATIENT_BY_ID: (patientId) => `${API_URL}/patient/update/${patientId}`,
  DELETE_PATIENT: (patientId) => `${API_URL}/patient/delete/${patientId}`,

  //Patient Assessments
  GET_DENTAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/get/dentalHistory`,
  GET_DENTAL_QUESTION: (patientId) =>
    `${API_URL}/patient/${patientId}/get/dentalQuestion`,
  CREATE_DENTAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/create/dentalHistory`,
  CREATE_DENTAL_QUESTION: (patientId) =>
    `${API_URL}/patient/${patientId}/create/dentalQuestion`,
  UPDATE_DENTAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/update/dentalHistory`,
  UPDATE_DENTAL_QUESTION: (patientId) =>
    `${API_URL}/patient/${patientId}/update/dentalQuestion`,

  GET_EXTRAORAL_INTRAORAL: (patientId) =>
    `${API_URL}/patient/${patientId}/get/extraoral/intraoral`,
  CREATE_EXTRAORAL_INTRAORAL: (patientId) =>
    `${API_URL}/patient/${patientId}/create/extraoral/intraoral`,
  UPDATE_EXTRAORAL_INTRAORAL: (patientId) =>
    `${API_URL}/patient/${patientId}/update/extraoral/intraoral`,

  GET_OCCLUSION: (patientId) => `${API_URL}/patient/${patientId}/get/occlusion`,
  CREATE_OCCLUSION: (patientId) =>
    `${API_URL}/patient/${patientId}/create/occlusion`,
  UPDATE_OCCLUSION: (patientId) =>
    `${API_URL}/patient/${patientId}/update/occlusion`,

  GET_PLAQUE_ENAMEL: (patientId) =>
    `${API_URL}/patient/${patientId}/get/plaque/enamel`,
  CREATE_PLAQUE_ENAMEL: (patientId) =>
    `${API_URL}/patient/${patientId}/create/plaque/enamel`,
  UPDATE_PLAQUE_ENAMEL: (patientId) =>
    `${API_URL}/patient/${patientId}/update/plaque/enamel`,

  GET_GINGIVAL_DESCRIPTION: (patientId) =>
    `${API_URL}/patient/${patientId}/get/gingivalDescription`,
  CREATE_GINGIVAL_DESCRIPTION: (patientId) =>
    `${API_URL}/patient/${patientId}/create/gingivalDescription`,
  UPDATE_GINGIVAL_DESCRIPTION: (patientId) =>
    `${API_URL}/patient/${patientId}/update/gingivalDescription`,

  GET_DIAGNOSIS_AND_TREATMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/get/diagnosisAndTreatment`,
  CREATE_DIAGNOSIS_AND_TREATMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/create/diagnosisAndTreatment`,
  UPDATE_DIAGNOSIS_AND_TREATMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/update/diagnosisAndTreatment`,

  GET_FEMALE_FORM: (patientId) => `${API_URL}/patient/${patientId}/get/female`,
  CREATE_FEMALE_FORM: (patientId) =>
    `${API_URL}/patient/${patientId}/create/female`,
  UPDATE_FEMALE_FORM: (patientId) =>
    `${API_URL}/patient/${patientId}/update/female`,

  CREATE_PERODONTAL_ASSESSMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/create/periodontalAssessment`,

  GET_PERIODONTAL_DIAGNOSIS: (patientId) =>
    `${API_URL}/patient/${patientId}/get/periodontalDiagnosis`,
  CREATE_PERIODONTAL_DIAGNOSIS: (patientId) =>
    `${API_URL}/patient/${patientId}/create/periodontalDiagnosis`,
  UPDATE_PERIODONTAL_DIAGNOSIS: (patientId) =>
    `${API_URL}/patient/${patientId}/update/periodontalDiagnosis`,

  GET_PHYSICAL_ASSESSMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/get/physicalAssesment`,
  CREATE_PHYSICAL_ASSESSMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/create/physicalAssesment`,
  UPDATE_PHYSICAL_ASSESSMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/update/physicalAssesment`,
  GET_MEDICAL_HEALTH: (patientId) =>
    `${API_URL}/patient/${patientId}/get/medicalHealth`,
  CREATE_MEDICAL_HEALTH: (patientId) =>
    `${API_URL}/patient/${patientId}/create/medicalHealth`,
  UPDATE_MEDICAL_HEALTH: (patientId) =>
    `${API_URL}/patient/${patientId}/update/medicalHealth`,

  GET_RECORD_TREATMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/get/treatments`,
  CREATE_RECORD_TREATMENT: (patientId) =>
    `${API_URL}/patient/${patientId}/create/treatmentRecord`,

  GET_SOCIAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/get/socialHistory`,
  CREATE_SOCIAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/create/socialHistory`,
  UPDATE_SOCIAL_HISTORY: (patientId) =>
    `${API_URL}/patient/${patientId}/update/socialHistory`,
  // AI Chat
  MOLARBEAR_CHAT: `${API_URL}/molarbear/chat`,
};

// Development logging
if (CONFIG.IS_DEVELOPMENT && CONFIG.DEBUG) {
  console.log("🔧 Environment Configuration:", {
    API_URL: CONFIG.API_URL,
    ENVIRONMENT: CONFIG.ENVIRONMENT,
    APP_NAME: CONFIG.APP_NAME,
  });
}

export default API_ENDPOINTS;
