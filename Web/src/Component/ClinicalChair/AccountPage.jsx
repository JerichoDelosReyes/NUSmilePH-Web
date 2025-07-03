import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// Add these imports after your existing imports
import {
  FiUser,
  FiUsers,
  FiCalendar,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiAlertCircle,
  FiArrowLeft,
  FiEdit2,
  FiAward,
  FiBriefcase,
  FiBookOpen,
  FiHash,
  FiDownload,
  FiMapPin,
} from "react-icons/fi";
import { App, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { IconButton, Typography, Grid, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  BsGenderMale,
  BsGenderFemale,
  BsGenderAmbiguous,
  BsPersonCheck,
  BsPersonX,
  BsPersonExclamation,
} from "react-icons/bs";
import { MdHealthAndSafety } from "react-icons/md";
import FolderIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "../Views/Styles/AccountPage.css";
import { ClinicianSheet } from "../Context/CaseContext";
import { API_URL } from "../../config/api";
import TitleHead from "../Custom Hooks/TitleHead";
import { UserContext } from "../Context/UserContext";
import { exportToCSV } from "../ClinicalChair/utils/csvExport";
const AccountPage = () => {
  const { id = "" } = useParams();
  const [account, setAccount] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { message: messageApi } = App.useApp();
  const { clinicianInfo, setClinicianInfo } = useContext(ClinicianSheet);
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const isCurrentUserClinicalChair = user?.role === "Clinical Chair";
  // For responsive design
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  TitleHead(`Account Details - ${account?.firstName}`); // Set the page title dynamically

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/getUserById/${id}`);
        setAccount(response.data.users);
        console.log("Account data:", response.data.users);

        // If the account is a clinician, fetch their patients
        if (response.data.users.role === "Clinician") {
          try {
            const patientsResponse = await axios.get(
              `${API_URL}/clinician/${id}/get/patients`
            );
            setPatients(patientsResponse.data);
            console.log("Patients data:", patientsResponse.data);
          } catch (patientError) {
            console.error("Failed to fetch patients:", patientError);
          }
        }
      } catch (error) {
        console.error("Failed to fetch account:", error);
        setError("Failed to load account details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAccount();
  }, [id]);
  const handleExportPatientList = () => {
    if (!isCurrentUserClinicalChair) {
      messageApi.error("Only Clinical Chair can export data");
      return;
    }

    // Format data for export
    const exportData = patients.map((patient) => ({
      id: patient._id,
      firstName: patient.firstname || "",
      middleName: patient.middlename || "",
      lastName: patient.lastname || "",
      fullName: `${patient.firstname || ""} ${patient.middlename || ""} ${
        patient.lastname || ""
      }`.trim(),
      gender: patient.gender || "Not Specified",
      dob: patient.dob || "N/A",
      age: patient.age || "N/A",
      religion: patient.religion || "N/A",
      occupation: patient.occupation || "N/A",
      maritalStatus: patient.marital_status || "N/A",
      phone: patient.contact_no || "N/A",
      email: patient.email_address || "N/A",
      address: patient.permanent_address || "N/A",
      emergency_person: patient.emergency_person || "N/A",
      relationship_to_patient: patient.relationship_to_patient || "N/A",
      emergency_contact_no: patient.emergency_contact_no || "N/A",
      emergency_address: patient.emergency_address || "N/A",
      chiefComplaint: patient.chiefComplaint || "N/A",
      illnessHistory: patient.illnessHistory || "N/A",
    }));

    const success = exportToCSV(
      exportData,
      `${account.firstName}-${account.surname}-patients`
    );

    if (success) {
      messageApi.success({
        content: "Patient list exported successfully",
        icon: <FiDownload className="text-primary" />,
        duration: 3,
      });
    }
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading)
    return <div className="loading-spinner">Loading account details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!account) return <div className="no-data-message">No account found.</div>;

  const PersonalDetailsSection = () => (
    <Paper
      elevation={1}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        mb: 3,
        transition: "all 0.2s ease",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header section with icon and title */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: "#000080", // Navy blue header
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FiUser size={20} />
          <Typography variant="h6" fontWeight="600">
            Personal Information
          </Typography>
        </Box>
      </Box>

      {/* Content section with all personal details */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Basic Information Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              mb: 2,
              pb: 1,
              borderBottom: "2px solid #000080",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiUser size={18} color="#000080" style={{ marginRight: "10px" }} />
            <Typography variant="subtitle1" fontWeight="600" color="#000080">
              Basic Information
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Name fields with better alignment */}
            <Grid item xs={12} md={4}>
              <InfoField label="First Name" value={account.firstName} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField label="Middle Name" value={account.middlename} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField label="Last Name" value={account.surname} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField
                label="Email Address"
                value={account.email}
                icon={<FiMail color="#000080" />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField
                label="Birth Date"
                value={
                  account.dob
                    ? new Date(account.dob).toLocaleDateString()
                    : null
                }
                icon={<FiCalendar color="#000080" />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField
                label="Gender"
                value={account.gender}
                icon={
                  account.gender === "Male" ? (
                    <BsGenderMale color="#000080" />
                  ) : account.gender === "Female" ? (
                    <BsGenderFemale color="#FF6B81" />
                  ) : null
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField label="Prefix" value={account.prefix} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoField
                label="Civil Status"
                value={account.marital_status}
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000080"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                }
              />
            </Grid>
          </Grid>
        </Box>

        {/* Contact Information Section */}
        {account.contact && (
          <Box sx={{ mb: 4 }}>
            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: "2px solid #000080",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiPhone
                size={18}
                color="#000080"
                style={{ marginRight: "10px" }}
              />
              <Typography variant="subtitle1" fontWeight="600" color="#000080">
                Contact Information
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <InfoField
                  label="Contact Number"
                  value={account.contact.contact_no}
                  icon={<FiPhone color="#000080" />}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <InfoField
                  label="Permanent Address"
                  value={account.contact.permanent_address}
                  icon={<FiMapPin color="#000080" />}
                  multiline
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Emergency Contact Section */}
        {account.contact && (
          <Box>
            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: "2px solid #000080",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000080"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "10px" }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <Typography variant="subtitle1" fontWeight="600" color="#000080">
                Emergency Contact
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <InfoField
                  label="Emergency Contact Person"
                  value={account.contact.emergency_person}
                  icon={<FiUser color="#000080" />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <InfoField
                  label="Emergency Contact Number"
                  value={account.contact.emergency_contact_no}
                  icon={<FiPhone color="#000080" />}
                />
              </Grid>

              <Grid item xs={12}>
                <InfoField
                  label="Emergency Address"
                  value={account.contact.emergency_address}
                  icon={<FiMapPin color="#000080" />}
                  multiline
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );

  // Helper component for consistent info field display
  const InfoField = ({ label, value, icon, multiline = false }) => (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ fontWeight: 500, mb: 0.7, fontSize: "0.85rem" }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          py: 1,
          px: 1.5,
          bgcolor: "#f8f9fa",
          borderRadius: 1,
          border: "1px solid #eee",
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          minHeight: "42px",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          },
        }}
      >
        {icon && (
          <Box sx={{ mr: 1.5, mt: multiline ? 0.3 : 0, flexShrink: 0 }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="body1"
          fontWeight="500"
          sx={{
            wordBreak: "break-word",
            color: value ? "#333" : "#999",
            fontSize: "0.95rem",
          }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  // Clinician-specific UI
  const ClinicianView = () => {
    // State for case history log
    const [caseHistory, setCaseHistory] = useState([]);
    const [caseLoading, setCaseLoading] = useState(true);

    useEffect(() => {
      if (account && account._id) {
        fetchCaseHistory();
      }
    }, [account]);

    const fetchCaseHistory = async () => {
      try {
        setCaseLoading(true);
        // Fetch submitted cases for the current clinician
        const response = await axios.get(
          `${API_URL}/clinician/${account._id}/submission`
        );
        setCaseHistory(response.data.data || []);
        setCaseLoading(false);
      } catch (err) {
        console.log(err);
        message.error("Failed to load case history data");
        setCaseLoading(false);
      }
    };

    const getStatusBadge = (status) => {
      switch (status?.toLowerCase()) {
        case "approved":
          return <span className="status-badge approved">Approved</span>;
        case "pending":
          return <span className="status-badge pending">Pending</span>;
        case "rejected":
          return <span className="status-badge rejected">Rejected</span>;
        default:
          return <span className="status-badge">{status || "N/A"}</span>;
      }
    };

    const viewCaseDetails = (caseId) => {
      navigate(`/casehistoryclinician/${caseId}`);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (error) {
        return dateString;
      }
    };

    // Handle tally sheet navigation
    const navigateToTallySheet = (sheetLevel) => {
      console.log(`Navigating to tally sheet ${sheetLevel}`);
      console.log("Clinician TallyID:", account[sheetLevel]);
      if (!account[sheetLevel]) {
        messageApi.error(`No ${sheetLevel} data available for this clinician.`);
        return;
      }
      setClinicianInfo({
        clinicianName: `${account.firstName} ${account.middlename || ""} ${
          account.surname
        }`,
        clinicianProfile: account.profile,
        clinicianCollege: account.program,
        tallySheetID: {
          IA: account.IA,
          IB: account.IB,
          IIA: account.IIA,
          IIB: account.IIB,
          IIIA: account.IIIA,
          IIIB: account.IIIB,
          IVA: account.IVA,
          IVB: account.IVB,
          PediatricDentistry: account.PediatricDentistry || account.pediatricDentistry,
        },
      });
      navigate(`/case-grading/${sheetLevel}`);
    };

    return (
      <div className="clinician-view">
        {/* <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="compact-back-btn"
        >
          <FiArrowLeft size={16} />
          <span className="ms-1">Back</span>
        </Button> */}
        <Box
          sx={{ width: "100%", borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="clinician tabs"
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={isSmallScreen ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                minWidth: isSmallScreen ? "auto" : 120,
                "&:hover": {
                  backgroundColor: "rgba(64, 64, 221, 0.04)",
                  color: "#4040DD",
                  transition: "all 0.2s ease",
                },
              },
              "& .Mui-selected": {
                color: "#4040DD",
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#4040DD",
              },
            }}
          >
            <Tab label="Personal Details" />
            <Tab label="Patients" />
            <Tab label="Tally Sheet" />
            <Tab label="Case History Log" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0} style={{ width: "100%" }}>
          <PersonalDetailsSection />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div
            className={`table-container ${isSmallScreen ? "mobile-view" : ""}`}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Patient List
              </Typography>

              {/* Export button */}
              {isCurrentUserClinicalChair && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiDownload size={16} />}
                  onClick={handleExportPatientList}
                  disabled={patients.length === 0}
                  sx={{
                    borderColor: "#4040DD",
                    color: "#4040DD",
                    "&:hover": {
                      borderColor: "#3636C2",
                      backgroundColor: "rgba(64, 64, 221, 0.04)",
                    },
                  }}
                >
                  Export to CSV
                </Button>
              )}
            </Box>

            {patients && patients.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}
                style={{ width: "100%" }}
              >
                <Table style={{ width: "100%" }}>
                  <TableHead sx={{ backgroundColor: "#4040DD" }}>
                    <TableRow>
                      <TableCell
                        sx={{ color: "white", fontWeight: "bold", width: "8%" }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "32%",
                        }}
                      >
                        Patient Information
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "30%",
                        }}
                      >
                        Contact Information
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "20%",
                        }}
                      >
                        Medical Info
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((patient) => {
                      // Helper functions
                      const getPatientStatusColor = (patient) => {
                        const lastVisit = patient.lastVisit
                          ? new Date(patient.lastVisit)
                          : null;
                        const daysSinceVisit = lastVisit
                          ? (new Date() - lastVisit) / (1000 * 60 * 60 * 24)
                          : null;

                        if (!lastVisit)
                          return {
                            variant: "warning",
                            label: "New Patient",
                            icon: <BsPersonExclamation />,
                          };
                        if (daysSinceVisit < 30)
                          return {
                            variant: "active",
                            label: "Active",
                            icon: <BsPersonCheck />,
                          };
                        if (daysSinceVisit < 90)
                          return {
                            variant: "info",
                            label: "Follow-up",
                            icon: <MdHealthAndSafety />,
                          };
                        return {
                          variant: "secondary",
                          label: "Inactive",
                          icon: <BsPersonX />,
                        };
                      };

                      const getFullName = (patient) => {
                        return `${patient.firstname || ""} ${
                          patient.middlename ? patient.middlename + " " : ""
                        }${patient.lastname || ""}`.trim();
                      };

                      const getInitials = (name) => {
                        if (!name) return "";
                        const names = name.split(" ");
                        if (names.length >= 2) {
                          return `${names[0].charAt(0)}${names[
                            names.length - 1
                          ].charAt(0)}`.toUpperCase();
                        }
                        return name.charAt(0).toUpperCase();
                      };

                      const getGenderIcon = (gender) => {
                        switch (gender?.toLowerCase()) {
                          case "male":
                            return <BsGenderMale className="text-primary" />;
                          case "female":
                            return <BsGenderFemale className="text-danger" />;
                          default:
                            return (
                              <BsGenderAmbiguous className="text-secondary" />
                            );
                        }
                      };

                      const status = getPatientStatusColor(patient);
                      const fullName = getFullName(patient);

                      return (
                        <TableRow key={patient._id} hover>
                          <TableCell>
                            <div
                              className={`status-badge ${status.variant}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                width: "fit-content",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                              }}
                            >
                              {status.icon}
                              {status.label}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ position: "relative", mr: 2 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor:
                                      patient.gender?.toLowerCase() === "female"
                                        ? "#FF6B81"
                                        : "#0088FE",
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getInitials(fullName)}
                                </Box>

                                {status.variant === "active" && (
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      backgroundColor: "#4CAF50",
                                      borderRadius: "50%",
                                      position: "absolute",
                                      bottom: 0,
                                      right: 0,
                                      border: "2px solid white",
                                    }}
                                  />
                                )}
                              </Box>

                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {fullName}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "0.8rem",
                                    color: "#666",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                  >
                                    {getGenderIcon(patient.gender)}
                                    <span>{patient.gender || "N/A"}</span>
                                  </Box>

                                  <span style={{ margin: "0 2px" }}>•</span>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                  >
                                    <FiCalendar size={14} />
                                    <span>
                                      {patient.age
                                        ? `${patient.age} years`
                                        : "Age N/A"}
                                    </span>
                                  </Box>

                                  {patient.email && (
                                    <>
                                      <span style={{ margin: "0 2px" }}>•</span>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "3px",
                                          maxWidth: "150px",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <FiMail size={14} />
                                        <span>{patient.email}</span>
                                      </Box>
                                    </>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            {patient.contact_no && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                <FiPhone size={14} color="#4040DD" />
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {patient.contact_no}
                                </Typography>
                              </Box>
                            )}

                            {patient.permanent_address && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                }}
                              >
                                {patient.permanent_address}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {patient.marital_status && (
                                <Box
                                  sx={{
                                    bgcolor: "#f0f0f0",
                                    color: "#555",
                                    borderRadius: "4px",
                                    px: 1,
                                    py: 0.5,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  Marital: {patient.marital_status}
                                </Box>
                              )}

                              {patient.occupation && (
                                <Box
                                  sx={{
                                    bgcolor: "#f0f0f0",
                                    color: "#555",
                                    borderRadius: "4px",
                                    px: 1,
                                    py: 0.5,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    mt: 0.5,
                                  }}
                                >
                                  Occ: {patient.occupation}
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                color="primary"
                                component={Link}
                                href={`/patient/${patient._id}`}
                                sx={{
                                  border: "1px solid #4040DD",
                                  borderRadius: "50%",
                                  p: "4px",
                                  color: "#4040DD",
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                sx={{
                                  border: "1px solid #555",
                                  borderRadius: "50%",
                                  p: "4px",
                                  color: "#555",
                                }}
                                component={Link}
                                href={`/patientdata/${patient._id}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 5,
                  bgcolor: "#f9f9f9",
                  borderRadius: 1,
                  border: "1px dashed #ccc",
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <img
                    src="/bencent.jpg"
                    alt="No patients"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      opacity: 0.5,
                    }}
                  />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  No patients assigned
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  This clinician doesn't have any patients assigned yet.
                </Typography>

                {isCurrentUserClinicalChair && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FiDownload size={16} />}
                    onClick={handleExportPatientList}
                    disabled={true}
                    sx={{ borderColor: "#ccc", color: "#999" }}
                  >
                    Export to CSV
                  </Button>
                )}
              </Box>
            )}
          </div>
        </TabPanel>

        {/* Tally Sheet Tab - Enhanced modern UI */}
        <TabPanel value={tabValue} index={2}>
          <Paper
            elevation={1}
            sx={{ mb: 4, borderRadius: "12px", overflow: "hidden" }}
          >
            {/* Header */}
            <Box
              sx={{
                bgcolor: "#000080", // Navy blue header
                color: "white",
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FolderIcon sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Case Grading
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tally Sheets by Category
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, bgcolor: "#f8f9fa" }}>
              <Grid container spacing={3}>
                {/* Category I */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        pb: 1.5,
                        mb: 2,
                        borderBottom: "2px solid #000080",
                        color: "#000080",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f5ff",
                          color: "#000080",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          mr: 1.5,
                          border: "1px solid #000080",
                        }}
                      >
                        I
                      </Box>
                      Category I
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IA")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IA Sheet
                          </Box>
                        </Button>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IB")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IB Sheet
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Category II */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        pb: 1.5,
                        mb: 2,
                        borderBottom: "2px solid #000080",
                        color: "#000080",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f5ff",
                          color: "#000080",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          mr: 1.5,
                          border: "1px solid #000080",
                        }}
                      >
                        II
                      </Box>
                      Category II
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IIA")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IIA Sheet
                          </Box>
                        </Button>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IIB")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IIB Sheet
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Category III */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        pb: 1.5,
                        mb: 2,
                        borderBottom: "2px solid #000080",
                        color: "#000080",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f5ff",
                          color: "#000080",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          mr: 1.5,
                          border: "1px solid #000080",
                        }}
                      >
                        III
                      </Box>
                      Category III
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IIIA")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IIIA Sheet
                          </Box>
                        </Button>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IIIB")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IIIB Sheet
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Category IV */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        pb: 1.5,
                        mb: 2,
                        borderBottom: "2px solid #000080",
                        color: "#000080",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f0f5ff",
                          color: "#000080",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          mr: 1.5,
                          border: "1px solid #000080",
                        }}
                      >
                        IV
                      </Box>
                      Category IV
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IVA")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IVA Sheet
                          </Box>
                        </Button>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("IVB")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#000080",
                              bgcolor: "#f0f5ff",
                              color: "#000080",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#000080",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            IVB Sheet
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Pediatric Dentistry Category */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        pb: 1.5,
                        mb: 2,
                        borderBottom: "2px solid #ff6b35",
                        color: "#ff6b35",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#fff5f2",
                          color: "#ff6b35",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          mr: 1.5,
                          border: "1px solid #ff6b35",
                          fontSize: "0.8rem",
                        }}
                      >
                        PD
                      </Box>
                      Pediatric Dentistry
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => navigateToTallySheet("PediatricDentistry")}
                          sx={{
                            py: 1.5,
                            justifyContent: "flex-start",
                            borderColor: "#e0e0e0",
                            color: "#444",
                            "&:hover": {
                              borderColor: "#ff6b35",
                              bgcolor: "#fff5f2",
                              color: "#ff6b35",
                            },
                            "& .MuiButton-endIcon": {
                              ml: "auto",
                            },
                          }}
                          endIcon={<ChevronRightIcon />}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              "& svg": {
                                mr: 1,
                                color: "#ff6b35",
                              },
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            Pediatric Dentistry Sheet
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Helper text */}
          <Box sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
            <Typography variant="body2">
              Select a tally sheet to view and manage case grading information.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Note:</b> Some tally sheets may not be available if the
              clinician hasn't completed the required cases or assessments.
            </Typography>
          </Box>
        </TabPanel>
        {/* Case History Log Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper elevation={1} sx={{ mb: 4, overflow: "hidden" }}>
            <Box
              sx={{
                bgcolor: "#4040DD",
                color: "white",
                px: 3,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                CASE HISTORY LOG
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchCaseHistory}
                  >
                    Refresh
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}></Grid>
              </Grid>
              {caseLoading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress color="primary" />
                  <Typography sx={{ mt: 2 }}>
                    Loading case history...
                  </Typography>
                </Box>
              ) : caseHistory.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <Box sx={{ mb: 2, fontSize: "3rem", color: "#999" }}>
                    <FolderIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="h5">No case history found</Typography>
                  <Typography color="textSecondary">
                    No cases have been submitted yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table
                    aria-label="case history table"
                    sx={{ border: "1px solid #eee" }}
                  >
                    <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", px: 1.5 }}
                        >
                          #
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Tally sheet
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Case Section
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Case</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Patient
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Procedure
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Description
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Submitted Date
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {caseHistory.map((caseItem, index) => (
                        <TableRow key={caseItem._id || index} hover>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>{caseItem.tallySheet || "N/A"}</TableCell>
                          <TableCell>{caseItem.section || "N/A"}</TableCell>
                          <TableCell>{caseItem.caseTitle || "N/A"}</TableCell>
                          <TableCell>
                            {caseItem.patient?.firstname}{" "}
                            {caseItem.patient?.middlename
                              ? caseItem.patient.middlename
                              : ""}{" "}
                            {caseItem.patient?.lastname}
                          </TableCell>
                          <TableCell>{caseItem.procedure || "N/A"}</TableCell>
                          <TableCell>{caseItem.description || "N/A"}</TableCell>
                          <TableCell align="center">
                            {getStatusBadge(caseItem.status)}
                          </TableCell>
                          <TableCell>
                            {formatDate(caseItem.submittedAt)}
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => viewCaseDetails(caseItem._id)}
                                startIcon={<VisibilityIcon />}
                              >
                                View
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </TabPanel>
      </div>
    );
  };
  // Clinical Instructor-specific UI
  const ClinicalInstructorView = () => {
    // Add state for filtering cases
    const [caseFilter, setCaseFilter] = useState("all"); // 'all', 'standard', or 'penalty'

    // Process signed cases and penalties from account data
    const processSignedCases = () => {
      if (!account.signedCase || account.signedCase.length === 0) {
        return [];
      }

      return account.signedCase.map((caseItem, index) => ({
        id: caseItem._id || `case-${index}`,
        caseNumber: caseItem.casePath?.split(".").pop() || `Case ${index + 1}`,
        caseName: formatCaseName(caseItem.caseName),
        sheetLevel: caseItem.sheetLevel || "N/A",
        rating: caseItem.rating || "N/A",
        date: caseItem.date
          ? new Date(caseItem.date).toLocaleDateString()
          : "N/A",
        clinician: caseItem.clinician || "Not assigned",
        type: "Standard Case",
      }));
    };

    const processSignedPenalties = () => {
      if (!account.signedPenalty || account.signedPenalty.length === 0) {
        return [];
      }

      return account.signedPenalty.map((penalty, index) => ({
        id: penalty._id || `penalty-${index}`,
        caseNumber: penalty.case || `Penalty Case ${index + 1}`,
        caseName: penalty.casePath?.split(".")[0] || "Penalty Case",
        sheetLevel: penalty.sheetLevel || "N/A",
        rating: "N/A", // Penalties typically don't have ratings
        date: penalty.date
          ? new Date(penalty.date).toLocaleDateString()
          : "N/A",
        clinician: penalty.clinician || "Not assigned",
        type: "Penalty Case",
      }));
    };

    // Format case name to be more readable
    const formatCaseName = (name) => {
      if (!name) return "Unknown Case";

      // Split camelCase into separate words
      return name
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between lowercase and uppercase letters
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Insert space between consecutive uppercase letters if followed by lowercase
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    };

    // Combine all signed cases and penalties
    const allSignedItems = [
      ...processSignedCases(),
      ...processSignedPenalties(),
    ];

    // Filter the items based on the selected filter
    const filteredItems = allSignedItems.filter((item) => {
      if (caseFilter === "all") return true;
      if (caseFilter === "standard") return item.type === "Standard Case";
      if (caseFilter === "penalty") return item.type === "Penalty Case";
      return true;
    });

    // Handle filter change
    const handleFilterChange = (filter) => {
      setCaseFilter(filter);
    };

    return (
      <div className="clinical-instructor-view">
        <Box
          sx={{ width: "100%", borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="instructor tabs"
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={isSmallScreen ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                minWidth: isSmallScreen ? "auto" : 120,
                "&:hover": {
                  backgroundColor: "rgba(64, 64, 221, 0.04)",
                  color: "#4040DD",
                  transition: "all 0.2s ease",
                },
              },
              "& .Mui-selected": {
                color: "#4040DD",
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#4040DD",
              },
            }}
          >
            <Tab label="Personal Details" />
            <Tab label="Signed Cases" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PersonalDetailsSection />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="stats-container">
            <div className="stat-card" style={{ borderLeftColor: "#4040DD" }}>
              <div className="stat-title">Total Cases Signed</div>
              <div className="stat-value">{allSignedItems.length}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "#4caf50" }}>
              <div className="stat-title">Standard Cases</div>
              <div className="stat-value">
                {
                  allSignedItems.filter((item) => item.type === "Standard Case")
                    .length
                }
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "#ff9800" }}>
              <div className="stat-title">Penalty Cases</div>
              <div className="stat-value">
                {
                  allSignedItems.filter((item) => item.type === "Penalty Case")
                    .length
                }
              </div>
            </div>
          </div>

          <div className="case-filter-container">
            <h2>Signed Cases</h2>
            <div className="filter-buttons">
              <button
                className={`filter-button ${
                  caseFilter === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
              >
                All Cases
              </button>
              <button
                className={`filter-button ${
                  caseFilter === "standard" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("standard")}
              >
                Standard Cases
              </button>
              <button
                className={`filter-button ${
                  caseFilter === "penalty" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("penalty")}
              >
                Penalty Cases
              </button>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div
              className={`table-container ${
                isSmallScreen ? "mobile-view" : ""
              }`}
            >
              <TableContainer
                component={Paper}
                sx={{ boxShadow: "none", border: "1px solid #e0e0e0", mt: 3 }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#4040DD" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Case Number
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Case Name
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Year Level
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Rating
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          ...(isSmallScreen && { padding: "8px" }),
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ "&:last-child td": { borderBottom: 0 } }}
                      >
                        <TableCell
                          sx={{
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                          }}
                        >
                          {item.caseNumber}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                          }}
                        >
                          {item.caseName}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                          }}
                        >
                          {item.sheetLevel}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                            color:
                              item.type === "Penalty Case"
                                ? "#ff9800"
                                : "#4040DD",
                          }}
                        >
                          {item.type}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                            fontWeight:
                              item.rating !== "N/A" ? "bold" : "normal",
                          }}
                        >
                          {item.rating}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...(isSmallScreen && {
                              padding: "8px",
                              fontSize: "0.85rem",
                            }),
                          }}
                        >
                          {item.date}
                        </TableCell>
                        <TableCell sx={isSmallScreen ? { padding: "8px" } : {}}>
                          <div className="actions-cell">
                            <Link href={`/case/${item._id}`}>
                              <span className="action-link">View Details</span>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <div className="info-message">
              {caseFilter === "all"
                ? "No signed cases found."
                : caseFilter === "standard"
                ? "No standard cases found."
                : "No penalty cases found."}
            </div>
          )}
        </TabPanel>
      </div>
    );
  };

  // Clinical Chair-specific UI
  const ClinicalChairView = () => {
    // For filtering cases if they're added in the future
    const [caseFilter, setCaseFilter] = useState("all"); // 'all', 'standard', or 'penalty'

    // Empty arrays for signed cases and penalties since they don't exist yet
    const signedCases = [];
    const penalties = [];

    // Combine all signed items (currently empty)
    const allSignedItems = [...signedCases, ...penalties];

    // Handle filter change
    const handleFilterChange = (filter) => {
      setCaseFilter(filter);
    };

    return (
      <div className="clinical-chair-view">
        <Box
          sx={{ width: "100%", borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="chair tabs"
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={isSmallScreen ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                minWidth: isSmallScreen ? "auto" : 120,
                "&:hover": {
                  backgroundColor: "rgba(64, 64, 221, 0.04)",
                  color: "#4040DD",
                  transition: "all 0.2s ease",
                },
              },
              "& .Mui-selected": {
                color: "#4040DD",
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#4040DD",
              },
            }}
          >
            <Tab label="Personal Details" />
            <Tab label="Signed Cases" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PersonalDetailsSection />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="stats-container">
            <div className="stat-card" style={{ borderLeftColor: "#4040DD" }}>
              <div className="stat-title">Total Cases Signed</div>
              <div className="stat-value">0</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "#4caf50" }}>
              <div className="stat-title">Standard Cases</div>
              <div className="stat-value">0</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: "#ff9800" }}>
              <div className="stat-title">Penalty Cases</div>
              <div className="stat-value">0</div>
            </div>
          </div>

          <div className="case-filter-container">
            <h2>Signed Cases</h2>
            <div className="filter-buttons">
              <button
                className={`filter-button ${
                  caseFilter === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
              >
                All Cases
              </button>
              <button
                className={`filter-button ${
                  caseFilter === "standard" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("standard")}
              >
                Standard Cases
              </button>
              <button
                className={`filter-button ${
                  caseFilter === "penalty" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("penalty")}
              >
                Penalty Cases
              </button>
            </div>
          </div>

          {/* Empty state for signed cases */}
          <div className="info-message">
            No signed cases found. Cases that you sign will appear here.
          </div>
        </TabPanel>
      </div>
    );
  };

  // Custom TabPanel component - MODIFIED to fix footer issue
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        className="tab-panel"
        style={{
          minHeight: "60vh",
          animationDuration: "0.3s",
          animationName: value === index ? "fadeIn" : "none",
        }}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: isSmallScreen ? 1 : 2 }}>{children}</Box>
        )}
      </div>
    );
  }
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px", // Set a consistent max width
        margin: "0 auto", // Center the content
        px: 3, // Consistent horizontal padding
        boxSizing: "border-box",
      }}
    >
      {/* Loading and error states */}
      {loading ? (
        <Box
          sx={{
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f9f9fa",
            borderRadius: "12px",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3, color: "primary.main" }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Loading Account Details
          </Typography>
          <Typography color="text.secondary">
            Please wait while we fetch the account information...
          </Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f9f9fa",
            borderRadius: "12px",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: "50%",
              bgcolor: "rgba(244, 67, 54, 0.08)",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiAlertCircle size={60} color="#f44336" />
          </Box>
          <Typography
            variant="h5"
            sx={{ mb: 1, fontWeight: 600, color: "error.main" }}
          >
            Error Loading Data
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center", maxWidth: "500px" }}
          >
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<FiRefreshCw />}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {/* Enhanced Header Section */}
          <Paper
            elevation={3}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              mb: 4,
              transition: "all 0.25s ease",
              "&:hover": {
                boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            {/* Background pattern with animated gradient */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: "100%",
                opacity: 0.06,
                backgroundImage:
                  "url('https://ik.imagekit.io/tfme5aczh/pattern-white.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 0,
              }}
            />

            {/* Animated gradient overlay with consistent navy blue theme */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.9,
                background: "linear-gradient(135deg, #000080 0%, #0000A3 100%)", // Navy blue gradient
                zIndex: 0,
                transition: "all 0.3s ease",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(0,0,128,0.3) 0%, rgba(0,0,128,0) 50%, rgba(0,0,128,0.1) 100%)",
                  opacity: 0.6,
                  animation: "gradientShift 8s ease infinite",
                },
              }}
            />

            {/* Main content section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "stretch" },
                p: { xs: 3, sm: 4 },
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Profile image section with better visual treatment */}
              <Box
                sx={{
                  mb: { xs: 3, md: 0 },
                  mr: { xs: 0, md: 4 },
                  position: "relative",
                  alignSelf: { md: "center" },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: "50%",
                    width: { xs: "110px", sm: "140px" },
                    height: { xs: "110px", sm: "140px" },
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    border: "4px solid rgba(255, 255, 255, 0.6)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                      border: "4px solid rgba(255, 255, 255, 0.8)",
                    },
                  }}
                >
                  <img
                    src={
                      account.profile
                        ? `${API_URL}/getFile/profile_pics/${account.profile}`
                        : "/bencent.jpg"
                    }
                    alt={`${account.firstName} ${account.surname}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Enhanced status indicator with tooltip */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "5px",
                      right: "5px",
                      bgcolor:
                        account.status === "active"
                          ? "#4caf50"
                          : account.status === "pending"
                          ? "#ff9800"
                          : "#f44336",
                      width: { xs: "24px", sm: "28px" },
                      height: { xs: "24px", sm: "28px" },
                      borderRadius: "50%",
                      border: "3px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover::after": {
                        content: `"${
                          account.status
                            ? account.status.charAt(0).toUpperCase() +
                              account.status.slice(1)
                            : "Unknown"
                        }"`,
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        marginBottom: "6px",
                      },
                    }}
                  >
                    {account.status === "active" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    )}
                    {account.status === "pending" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    )}
                    {account.status === "inactive" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    )}
                  </Box>
                </Box>

                {/* Role identifier for small screens */}
                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    justifyContent: "center",
                    mt: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      px: 2,
                      py: 0.5,
                      borderRadius: "30px",
                      display: "inline-flex",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {account.role === "Clinician" && (
                      <FiUser size={14} style={{ marginRight: "8px" }} />
                    )}
                    {account.role === "Clinical Instructor" && (
                      <FiUsers size={14} style={{ marginRight: "8px" }} />
                    )}
                    {account.role === "Clinical Chair" && (
                      <FiAward size={14} style={{ marginRight: "8px" }} />
                    )}
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {account.role}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* User details with improved typography and spacing */}
              <Box
                sx={{
                  color: "white",
                  textAlign: { xs: "center", md: "left" },
                  flex: 1,
                }}
              >
                {/* Name with animated underline on hover */}
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    "&:hover::after": {
                      width: "100%",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-2px",
                      left: 0,
                      width: "0%",
                      height: "2px",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      transition: "width 0.3s ease",
                    },
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: "1.6rem", sm: "2.1rem" },
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      letterSpacing: "0.2px",
                    }}
                  >
                    {account.prefix ? `${account.prefix} ` : ""}
                    {account.firstName}{" "}
                    {account.middlename
                      ? `${account.middlename.charAt(0)}. `
                      : ""}
                    {account.surname}
                  </Typography>
                </Box>

                {/* Role badge - only visible on medium+ screens */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    mb: 1.5,
                    mt: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      px: 2,
                      py: 0.5,
                      borderRadius: "30px",
                      display: "inline-flex",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {account.role === "Clinician" && (
                      <FiUser size={14} style={{ marginRight: "8px" }} />
                    )}
                    {account.role === "Clinical Instructor" && (
                      <FiUsers size={14} style={{ marginRight: "8px" }} />
                    )}
                    {account.role === "Clinical Chair" && (
                      <FiAward size={14} style={{ marginRight: "8px" }} />
                    )}
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {account.role}
                    </Typography>
                  </Box>

                  {/* ID Number with better style */}
                  {account.idNumber && (
                    <Typography
                      sx={{
                        ml: 2,
                        opacity: 0.9,
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "20px",
                        bgcolor: "rgba(255,255,255,0.15)",
                      }}
                    >
                      <FiHash size={14} style={{ marginRight: "6px" }} />
                      {account.idNumber}
                    </Typography>
                  )}
                </Box>

                {/* Additional user details section with nicer icons and layout */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 1, sm: 2 },
                    mt: { xs: 2, md: 1 },
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  {account.department && (
                    <Box
                      sx={{
                        fontSize: "0.9rem",
                        opacity: 0.92,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "rgba(255,255,255,0.15)",
                        px: 1.5,
                        py: 0.7,
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.25)",
                        },
                      }}
                    >
                      <FiBriefcase
                        size={15}
                        style={{ marginRight: "8px", strokeWidth: 2.5 }}
                      />
                      {account.department}
                    </Box>
                  )}

                  {account.program && (
                    <Box
                      sx={{
                        fontSize: "0.9rem",
                        opacity: 0.92,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "rgba(255,255,255,0.15)",
                        px: 1.5,
                        py: 0.7,
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.25)",
                        },
                      }}
                    >
                      <FiBookOpen
                        size={15}
                        style={{ marginRight: "8px", strokeWidth: 2.5 }}
                      />
                      {account.program}
                    </Box>
                  )}

                  {account.yearLevel && (
                    <Box
                      sx={{
                        fontSize: "0.9rem",
                        opacity: 0.92,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "rgba(255,255,255,0.15)",
                        px: 1.5,
                        py: 0.7,
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.25)",
                        },
                      }}
                    >
                      <FiCalendar
                        size={15}
                        style={{ marginRight: "8px", strokeWidth: 2.5 }}
                      />
                      Year {account.yearLevel}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Action buttons with improved styling */}
              <Box
                sx={{
                  ml: { xs: 0, md: 4 },
                  mt: { xs: 4, md: 0 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-end" },
                  justifyContent: { md: "center" },
                  gap: 1.5,
                }}
              >
                <Button
                  startIcon={<FiArrowLeft />}
                  variant="contained"
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    px: 2,
                    py: 1,
                    minWidth: "120px",
                    backdropFilter: "blur(4px)",
                    borderRadius: "8px",
                    fontWeight: 500,
                    border: "1px solid rgba(255,255,255,0.3)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  Back
                </Button>

                {user?.role === "Clinical Chair" &&
                  user?._id !== account._id && (
                    <Button
                      startIcon={<FiEdit2 />}
                      variant="contained"
                      onClick={() =>
                        navigate(`/chinicalchair/edit/account/${account._id}`)
                      }
                      aria-label="Edit profile"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        px: 2,
                        py: 1,
                        minWidth: "120px",
                        backdropFilter: "blur(4px)",
                        borderRadius: "8px",
                        fontWeight: 500,
                        border: "1px solid rgba(255,255,255,0.3)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.3)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
              </Box>
            </Box>
          </Paper>

          {/* Add this keyframe animation to your CSS file */}
          <style jsx>{`
            @keyframes gradientShift {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
          {/* Role-based Content with proper styling */}
          <Box sx={{ width: "100%" }}>
            {account.role === "Clinician" && <ClinicianView />}
            {account.role === "Clinical Instructor" && (
              <ClinicalInstructorView />
            )}
            {account.role === "Clinical Chair" && <ClinicalChairView />}
            {!["Clinician", "Clinical Instructor", "Clinical Chair"].includes(
              account.role
            ) && (
              <Box>
                <PersonalDetailsSection />
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AccountPage;
