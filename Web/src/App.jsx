import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, Router, Navigate, replace } from "react-router-dom";
import SignIn from "./Component/Views/SignIn";
import SignUp from "./Component/Views/SignUp";
import AllPatientDashboard from "./Component/Views/AllPatientDashboard";
import PastPatientDashboard from "./Component/Views/PastPatientDashboard";
import AppointmentForm from "./Component/Views/AppointmentForm";
import AIChatBot from "./Component/Views/AIChatBot";
import AppointmentList from "./Component/Views/AppointmentList";
import ME_DentalChart from "./Component/Views/ME_DentalChart";
import Dashboard from "./Component/Views/Dashboard";
import Profile from "./Component/Views/Profile";
import AccountList from "./Component/ClinicalChair/AccountList";
import PatientData from "./Component/Forms/PatientData";
import PatientInformation from "./Component/Views/PatientInformation";
import PhysicalAssesment from "./Component/Forms/PhysicalAssessment";
import FemalePage from "./Component/Forms/FemalePage";
import SocialHistory from "./Component/Forms/SocialHistory";
import DentalHistory from "./Component/Forms/DentalHistory";
import DentalHistory2 from "./Component/Forms/DentalHistory2";
import DentalHistory3 from "./Component/Forms/DentalHistory3";
import PeriodontalDiagnosis from "./Component/Forms/PeriodontalDiagnosis";
import DiagnosisAndTreatment from "./Component/Forms/DiagnosisandTreatment";
import RecordTreatment from "./Component/Forms/RecordTreatment";
import TreatmentHistory from "./Component/Forms/TreatmentHistory";
import PeriodontalAssesment from "./Component/Forms/PeriodontalAssesment";
import ProgressTracker from "./Component/Views/ProgressTracker";
import CaseSubmission from "./Component/Views/CaseSubmission";
import AuditLogTable from "./Component/ClinicalChair/AuditLogTable";
import ClinicianList from "./Component/Views/ClinicianList";
import ClinicalInstructorList from "./Component/Views/ClinicalInstructorList";
import AccountPage from "./Component/ClinicalChair/AccountPage";
import Remarks from "./Component/Views/Remarks";
import SubmittedCaseHistoryLog from "./Component/Views/SubmittedCaseHistoryLog";
import SubmittedCaseInfoClinician from "./Component/Views/SubmittedCaseInfoClinician";
import CaseGrading from "./Component/Views/CaseGrading";
import "../src/Component/Views/Styles/global.css";
import { CaseProvider } from "./Component/Context/CaseContext";
import "../src/Component/Views/Styles/global.css";
import CISignedCaseHistory from "./Component/Custom Hooks/CISignedCaseHistory";
import ResetPassword from "./Component/Views/ResetPassword";
import ProtectedRoute from "./Component/Route/ProtectedRoute";
import MainContent from "./Component/Custom Hooks/MainContent";
import PublicRoute from "./Component/Route/PublicRoute";
import ProfileCompletion from "./Component/Views/ProfileCompletion";
import RoleRoute from "./Component/Route/RoleRoute";
import AccountEdit from "./Component/ClinicalChair/AccountEdit";
import TermsAndAgreement from "./Component/Views/TermsAndAgreement";
import { TitleProvider } from "./Component/Context/TitleContext";

function App() {
  return (
    <TitleProvider>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainContent />}>
            {/*Routes for Clinician Only*/}
            <Route element={<RoleRoute role={["Clinician"]} />}>
              <Route path="/molarBear" element={<AIChatBot />} />
              <Route path="/progress/:year" element={<ProgressTracker />} />
              <Route
                path="/casehistory"
                element={<SubmittedCaseHistoryLog />}
              />
              <Route path="/pastpatient" element={<PastPatientDashboard />} />
              <Route path="/setAppointments" element={<AppointmentForm />} />
              <Route
                path="/setAppointments/:id"
                element={<AppointmentForm />}
              />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/submission/:id" element={<CaseSubmission />} />
            </Route>

            {/*Shared Routes for Clinical Instructor and Chair*/}
            <Route
              element={
                <RoleRoute role={["Clinical Instructor", "Clinical Chair"]} />
              }
            >
              <Route path="/clinicianlist" element={<ClinicianList />} />
              <Route
                path="/case-grading/:year/"
                element={
                  <CaseProvider>
                    <CaseGrading />
                  </CaseProvider>
                }
              />
              <Route
                path="/account/details/:id"
                element={
                  <CaseProvider>
                    <AccountPage />
                  </CaseProvider>
                }
              />
              <Route
                path="/signedcasehistory"
                element={<CISignedCaseHistory />}
              />
            </Route>
            {/* Clinical Chair */}
            <Route element={<RoleRoute role={["Clinical Chair"]} />}>
              <Route
                path="/clinicalInstructorlist"
                element={<ClinicalInstructorList />}
              />
              <Route
                path="/chinicalchair/user/accounts"
                element={<AccountList />}
              />
              <Route
                path="/chinicalchair/get/auditlog"
                element={<AuditLogTable />}
              />
              <Route
                path="/chinicalchair/edit/account/:userId"
                element={<AccountEdit />}
              />
            </Route>

            {/* Routes for All Roles */}
            <Route
              path="/terms-and-conditions"
              element={<TermsAndAgreement />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/allpatientdashboard"
              element={<AllPatientDashboard />}
            />
            <Route path="/dentalChart/:id" element={<ME_DentalChart />} />
            <Route path="/patientdata" element={<PatientData />} />
            <Route path="/patientdata/:id" element={<PatientData />} />
            <Route
              path="/physicalAssessment/:id"
              element={<PhysicalAssesment />}
            />
            <Route path="/female/:id" element={<FemalePage />} />
            <Route path="/social/:id" element={<SocialHistory />} />
            <Route path="/dentalHistory/:id" element={<DentalHistory />} />
            <Route path="/extra-intraOral/:id" element={<DentalHistory2 />} />
            <Route path="/occlusion/:id" element={<DentalHistory3 />} />
            <Route
              path="/periodontalDiagnosis/:id"
              element={<PeriodontalDiagnosis />}
            />
            <Route
              path="/diagnosis-treatment/:id"
              element={<DiagnosisAndTreatment />}
            />
            <Route path="/record-treatment/:id" element={<RecordTreatment />} />

            <Route
              path="/periodontalAssesment/:id"
              element={<PeriodontalAssesment />}
            />
            <Route path="/patient/:id" element={<PatientInformation />} />

            <Route path="/remarks/:year" element={<Remarks />} />
            <Route
              path="/casehistoryclinician/:id"
              element={<SubmittedCaseInfoClinician />}
            />
            <Route
              path="/treatment-history/:id"
              element={<TreatmentHistory />}
            />
          </Route>
        </Route>
      </Routes>
    </TitleProvider>
  );
}

export default App;
