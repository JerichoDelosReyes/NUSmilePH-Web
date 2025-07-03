// Fix styling for form fields and card layouts
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Breadcrumbs,
  Stack,
} from "@mui/material";
import { message } from "antd";
import {
  FiSave,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiHash,
  FiHome,
  FiBookOpen,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import {
  BsPersonCheck,
  BsPersonX,
  BsPersonExclamation,
  BsGenderMale,
  BsGenderFemale,
} from "react-icons/bs";
import { UserContext } from "../Context/UserContext";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import TitleHead from "../Custom Hooks/TitleHead";
import { API_URL } from "../../config/api";

const AccountEdit = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { userId } = useParams();

  const [accountData, setAccountData] = useState({
    email: "",
    firstName: "",
    middlename: "",
    surname: "",
    prefix: "",
    idNumber: "",
    role: "",
    department: "",
    yearLevel: "",
    status: "",
    profile: "",
    contact_no: "",
    permanent_address: "",
    emergency_person: "",
    emergency_contact_no: "",
    emergency_address: "",
    gender: "",
    marital_status: "",
    dob: "",
    program: "",
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Set title
  TitleHead(`Edit ${accountData.firstName || "User"} Account`);

  // Check if user is Clinical Chair
  const isClinicalChair = user?.role === "Clinical Chair";

  useEffect(() => {
    if (userId) {
      fetchAccountData();
    }
  }, [userId]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/getUserById/${userId}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.data || !response.data.users) {
        throw new Error("Invalid response structure");
      }

      const userData = response.data.users;

      // Extract main user data with fallbacks
      const {
        email = "",
        firstName = "",
        middlename = "",
        surname = "",
        prefix = "",
        dob = "",
        idNumber = "",
        profile = "",
        gender = "",
        marital_status = "",
        role = "",
        program = "",
        department = "",
        yearLevel = "",
        status = "",
      } = userData;

      // Extract contact data with proper fallbacks
      let contactData = {
        contact_no: "",
        permanent_address: "",
        emergency_address: "",
        emergency_contact_no: "",
        emergency_person: "",
      };

      if (userData.contact) {
        contactData = {
          contact_no: userData.contact.contact_no || "",
          permanent_address: userData.contact.permanent_address || "",
          emergency_address: userData.contact.emergency_address || "",
          emergency_contact_no: userData.contact.emergency_contact_no || "",
          emergency_person: userData.contact.emergency_person || "",
        };
      } else if (userData.contact_no) {
        contactData = {
          contact_no: userData.contact_no || "",
          permanent_address: userData.permanent_address || "",
          emergency_address: userData.emergency_address || "",
          emergency_contact_no: userData.emergency_contact_no || "",
          emergency_person: userData.emergency_person || "",
        };
      }

      const userInfo = {
        email,
        firstName,
        middlename,
        surname,
        prefix,
        idNumber,
        role,
        department,
        yearLevel,
        status,
        profile,
        dob,
        gender,
        marital_status,
        program,
        ...contactData,
      };

      setAccountData(userInfo);
      setOriginalData(userInfo);
    } catch (error) {
      message.error("Failed to fetch account data");
      console.error("Error fetching account:", error);
      navigate("/chinicalchair/user/accounts");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your functions remain the same...
  // getFullName, getStatusConfig, hasChanges, validateForm, handleInputChange, handleSave

  const getFullName = () => {
    return (
      `${accountData.prefix ? accountData.prefix + " " : ""}${
        accountData.firstName || ""
      } ${accountData.middlename ? accountData.middlename + " " : ""}${
        accountData.surname || ""
      }`.trim() || accountData.email
    );
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          color: "success",
          icon: <BsPersonCheck />,
          bgColor: "#e8f5e9",
          textColor: "#2e7d32",
        };
      case "pending":
        return {
          color: "warning",
          icon: <BsPersonExclamation />,
          bgColor: "#fff8e1",
          textColor: "#f57f17",
        };
      case "inactive":
        return {
          color: "error",
          icon: <BsPersonX />,
          bgColor: "#ffebee",
          textColor: "#c62828",
        };
      default:
        return {
          color: "default",
          icon: <BsPersonExclamation />,
          bgColor: "#f5f5f5",
          textColor: "#757575",
        };
    }
  };

  const hasChanges = () => {
    return JSON.stringify(accountData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    if (!accountData.email || !accountData.firstName || !accountData.surname) {
      message.error("Email, First Name, and Surname are required");
      return false;
    }

    // Validate phone numbers if provided
    if (
      accountData.contact_no &&
      !/^\d{10,15}$/.test(accountData.contact_no.replace(/\D/g, ""))
    ) {
      message.error("Please enter a valid contact number");
      return false;
    }

    if (
      accountData.emergency_contact_no &&
      !/^\d{10,15}$/.test(accountData.emergency_contact_no.replace(/\D/g, ""))
    ) {
      message.error("Please enter a valid emergency contact number");
      return false;
    }

    return true;
  };

  const handleInputChange = (field, value) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!isClinicalChair) {
      message.error("Unauthorized: Only Clinical Chair can edit accounts");
      return;
    }

    setSaveLoading(true);
    try {
      // Prepare data
      const {
        email,
        firstName,
        surname,
        middlename,
        prefix,
        marital_status,
        gender,
        dob,
        yearLevel,
        idNumber,
        department,
        program,
        contact_no,
        permanent_address,
        emergency_person,
        emergency_contact_no,
        emergency_address,
        role,
      } = accountData;

      const dataToSend = {
        email,
        firstName,
        surname,
        middlename,
        prefix,
        marital_status,
        gender,
        dob,
        yearLevel,
        idNumber,
        department,
        program,
        role,
        contact_no,
        permanent_address,
        emergency_person,
        emergency_contact_no,
        emergency_address,
      };

      const url = `${API_URL}/users/${userId}/update/initiate`;
      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      message.success({
        content: `Account for ${getFullName()} updated successfully: ${
          response.data.message
        }`,
        icon: <BsPersonCheck className="text-success" />,
        duration: 3,
      });

      setOriginalData({ ...accountData });

      setTimeout(() => {
        navigate("/chinicalchair/user/accounts");
      }, 1500);
    } catch (error) {
      console.error("Error updating account:", error);

      if (error.response) {
        message.error(
          `Error: ${error.response.data.message || "Update failed"}`
        );
      } else {
        message.error("Failed to update account. Please try again.");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const statusConfig = getStatusConfig(accountData.status);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          p: { xs: 2, sm: 3 },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f9f9fa",
            borderRadius: "12px",
            width: "100%",
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
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        p: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} aria-label="breadcrumb">
        <Typography
          component={RouterLink}
          to="/chinicalchair/user/accounts"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <FiUser style={{ marginRight: 8, fontSize: 16 }} />
          Accounts
        </Typography>
        <Typography color="text.primary">{getFullName()}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<FiArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ mb: 4, px: 3, py: 1 }}
        size="medium"
      >
        Back
      </Button>

      <Paper
        elevation={2}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
          mb: 4,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            background:
              accountData.role === "Clinician"
                ? "linear-gradient(135deg, #4040DD 0%, #5858FE 100%)"
                : accountData.role === "Clinical Instructor"
                ? "linear-gradient(135deg, #198754 0%, #27ae60 100%)"
                : "linear-gradient(135deg, #A33C4C 0%, #C44B59 100%)",
            color: "white",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="600">
              <FiUser
                style={{
                  marginRight: 10,
                  verticalAlign: "middle",
                  fontSize: 24,
                }}
              />
              Edit Account
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              Modify account information and settings for {getFullName()}
            </Typography>
          </Box>

          <Chip
            icon={statusConfig.icon}
            label={
              accountData.status?.charAt(0).toUpperCase() +
                accountData.status?.slice(1) || "Unknown"
            }
            sx={{
              bgcolor: statusConfig.bgColor,
              color: statusConfig.textColor,
              fontWeight: 500,
              "& .MuiChip-icon": { color: statusConfig.textColor },
              fontSize: "0.9rem",
              height: 32,
            }}
            size="medium"
          />
        </Box>

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Authorization Alert */}
          {!isClinicalChair && (
            <Alert
              severity="warning"
              icon={<FiAlertCircle size={24} />}
              sx={{ mb: 4, p: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={500}>
                Read Only Mode
              </Typography>
              <Typography variant="body1">
                You don't have permission to edit accounts. Only Clinical Chair
                can modify account information.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Account Summary - Fixed to prevent overlapping */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  mb: { xs: 3, md: 0 },
                  width: "100%", // Ensure full width
                  height: "100%", // Make sure it fills vertical space too
                  boxSizing: "border-box", // Include padding in width calculation
                }}
              >
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Avatar
                    src={
                      accountData.profile
                        ? `${API_URL}/getFile/profile_pics/${accountData.profile}`
                        : "/bencent.jpg"
                    }
                    alt={getFullName()}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      mb: 2,
                      border: "3px solid rgba(255, 255, 255, 0.8)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    {getFullName()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accountData.email}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Role:
                    </Typography>
                    <Chip
                      label={accountData.role}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 500, height: 28 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Status:
                    </Typography>
                    <Chip
                      label={
                        accountData.status?.charAt(0).toUpperCase() +
                        accountData.status?.slice(1)
                      }
                      size="small"
                      color={statusConfig.color}
                      icon={statusConfig.icon}
                      sx={{ fontWeight: 500, height: 28 }}
                    />
                  </Box>

                  {accountData.idNumber && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        ID:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <FiHash
                          size={16}
                          style={{ marginRight: 6, opacity: 0.7 }}
                        />
                        {accountData.idNumber}
                      </Typography>
                    </Box>
                  )}

                  {accountData.department && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Department:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {accountData.department}
                      </Typography>
                    </Box>
                  )}

                  {accountData.yearLevel && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Year Level:
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {accountData.yearLevel}
                      </Typography>
                    </Box>
                  )}

                  {accountData.gender && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Gender:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {accountData.gender === "Male" ? (
                          <BsGenderMale
                            style={{ marginRight: 6, color: "#4040DD" }}
                          />
                        ) : (
                          <BsGenderFemale
                            style={{ marginRight: 6, color: "#FF6B81" }}
                          />
                        )}
                        {accountData.gender}
                      </Typography>
                    </Box>
                  )}

                  {accountData.contact_no && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Phone:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <FiPhone
                          size={16}
                          style={{ marginRight: 6, opacity: 0.7 }}
                        />
                        {accountData.contact_no}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Form Content - Adding more space between fields */}
            <Grid item xs={12} md={8}>
              {/* Basic Information */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.25rem",
                  }}
                >
                  <FiUser style={{ marginRight: 10, fontSize: 20 }} />
                  Basic Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={accountData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiMail size={18} />
                          </Box>
                        ),
                      }}
                      helperText={!accountData.email && "Email is required"}
                      error={!accountData.email}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Prefix */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    >
                      <InputLabel>Prefix</InputLabel>
                      <Select
                        value={accountData.prefix || ""}
                        onChange={(e) =>
                          handleInputChange("prefix", e.target.value)
                        }
                        label="Prefix"
                        disabled={!isClinicalChair}
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="Dr.">Dr.</MenuItem>
                        <MenuItem value="Prof.">Prof.</MenuItem>
                        <MenuItem value="Mr.">Mr.</MenuItem>
                        <MenuItem value="Ms.">Ms.</MenuItem>
                        <MenuItem value="Mrs.">Mrs.</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* First Name */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={accountData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      required
                      variant="outlined"
                      helperText={
                        !accountData.firstName && "First name is required"
                      }
                      error={!accountData.firstName}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Middle Name */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Middle Name"
                      value={accountData.middlename}
                      onChange={(e) =>
                        handleInputChange("middlename", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Surname */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Surname"
                      value={accountData.surname}
                      onChange={(e) =>
                        handleInputChange("surname", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      required
                      variant="outlined"
                      helperText={!accountData.surname && "Surname is required"}
                      error={!accountData.surname}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Gender */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    >
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={accountData.gender || ""}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        label="Gender"
                        disabled={!isClinicalChair}
                      >
                        <MenuItem value="">Not Specified</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                        <MenuItem value="Prefer not to say">
                          Prefer not to say
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Marital Status */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    >
                      <InputLabel>Marital Status</InputLabel>
                      <Select
                        value={accountData.marital_status || ""}
                        onChange={(e) =>
                          handleInputChange("marital_status", e.target.value)
                        }
                        label="Marital Status"
                        disabled={!isClinicalChair}
                      >
                        <MenuItem value="">Not Specified</MenuItem>
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Married">Married</MenuItem>
                        <MenuItem value="Divorced">Divorced</MenuItem>
                        <MenuItem value="Widowed">Widowed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date of Birth */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={
                        accountData.dob ? accountData.dob.split("T")[0] : ""
                      }
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      disabled={!isClinicalChair}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiCalendar size={18} />
                          </Box>
                        ),
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Account Details */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.25rem",
                  }}
                >
                  <FiHash style={{ marginRight: 10, fontSize: 20 }} />
                  Account Details
                </Typography>

                <Grid container spacing={3}>
                  {/* ID Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID Number"
                      value={accountData.idNumber}
                      onChange={(e) =>
                        handleInputChange("idNumber", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiHash size={18} />
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Role */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    >
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={accountData.role || ""}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        label="Role"
                        disabled={!isClinicalChair}
                      >
                        <MenuItem value="">Select Role</MenuItem>
                        <MenuItem value="Clinical Chair">
                          Clinical Chair
                        </MenuItem>
                        <MenuItem value="Clinical Instructor">
                          Clinical Instructor
                        </MenuItem>
                        <MenuItem value="Clinician">Clinician</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Department */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={accountData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiHome size={18} />
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Program */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Program"
                      value={accountData.program}
                      onChange={(e) =>
                        handleInputChange("program", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiBookOpen size={18} />
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Year Level */}
                  {(accountData.role === "Clinician" || !accountData.role) && (
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={{ "& .MuiInputBase-root": { height: 56 } }}
                      >
                        <InputLabel>Year Level</InputLabel>
                        <Select
                          value={accountData.yearLevel || ""}
                          onChange={(e) =>
                            handleInputChange("yearLevel", e.target.value)
                          }
                          label="Year Level"
                          disabled={!isClinicalChair}
                        >
                          <MenuItem value="">Select Year Level</MenuItem>
                          <MenuItem value="1st Year">1st Year</MenuItem>
                          <MenuItem value="2nd Year">2nd Year</MenuItem>
                          <MenuItem value="3rd Year">3rd Year</MenuItem>
                          <MenuItem value="4th Year">4th Year</MenuItem>
                          <MenuItem value="5th Year">5th Year</MenuItem>
                          <MenuItem value="6th Year">6th Year</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Status - Read Only */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={
                        accountData.status?.charAt(0).toUpperCase() +
                          accountData.status?.slice(1) || "Not Set"
                      }
                      disabled={true}
                      variant="outlined"
                      helperText="Status cannot be modified through this form"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {statusConfig.icon}
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Contact Details */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.25rem",
                    color: "#2e7d32", // success color
                  }}
                >
                  <FiPhone style={{ marginRight: 10, fontSize: 20 }} />
                  Contact Details
                </Typography>

                <Grid container spacing={3}>
                  {/* Contact Number */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      value={accountData.contact_no}
                      onChange={(e) =>
                        handleInputChange("contact_no", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      placeholder="Enter contact number"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiPhone size={18} />
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Permanent Address */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Permanent Address"
                      value={accountData.permanent_address}
                      onChange={(e) =>
                        handleInputChange("permanent_address", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      placeholder="Enter permanent address"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, mt: 1 }}>
                            <FiMapPin size={18} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Emergency Contact */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.25rem",
                    color: "#ed6c02", // warning color
                  }}
                >
                  <FiAlertCircle style={{ marginRight: 10, fontSize: 20 }} />
                  Emergency Contact
                </Typography>

                <Grid container spacing={3}>
                  {/* Emergency Person */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Person"
                      value={accountData.emergency_person}
                      onChange={(e) =>
                        handleInputChange("emergency_person", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      placeholder="Full name of emergency contact"
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Emergency Contact Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Number"
                      value={accountData.emergency_contact_no}
                      onChange={(e) =>
                        handleInputChange(
                          "emergency_contact_no",
                          e.target.value
                        )
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      placeholder="Emergency contact number"
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <FiPhone size={18} />
                          </Box>
                        ),
                      }}
                      sx={{ "& .MuiInputBase-root": { height: 56 } }}
                    />
                  </Grid>

                  {/* Emergency Address */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Address"
                      value={accountData.emergency_address}
                      onChange={(e) =>
                        handleInputChange("emergency_address", e.target.value)
                      }
                      disabled={!isClinicalChair}
                      variant="outlined"
                      placeholder="Address of emergency contact"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, mt: 1 }}>
                            <FiMapPin size={18} />
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {isClinicalChair && (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={
                    saveLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FiSave />
                    )
                  }
                  onClick={handleSave}
                  disabled={saveLoading || !hasChanges()}
                  sx={{ minWidth: 180, py: 1.5 }}
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate(-1)}
                  disabled={saveLoading}
                  size="large"
                  sx={{ py: 1.5 }}
                >
                  Cancel
                </Button>

                {hasChanges() && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<FiRefreshCw />}
                    onClick={() => {
                      setAccountData({ ...originalData });
                      message.info("Changes have been reset");
                    }}
                    disabled={saveLoading}
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    Reset Changes
                  </Button>
                )}

                {hasChanges() && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: { xs: 0, md: "auto" },
                      mt: { xs: 1, md: 0 },
                    }}
                  >
                    <FiAlertCircle style={{ marginRight: 6 }} />
                    You have unsaved changes
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AccountEdit;
