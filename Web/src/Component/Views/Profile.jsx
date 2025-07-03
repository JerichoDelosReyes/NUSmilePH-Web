import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import TopNavbar from "../Custom Hooks/TopNavbar";
import SideBar from "../Custom Hooks/SideBar";
import {
  NavigationProvider,
  useNavigation,
} from "../Custom Hooks/NavigationProvider";
import TitleHead from "../Custom Hooks/TitleHead";
import Footer from "../Custom Hooks/Footer";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import "../Views/Styles/AllPatientDashboard.css";
import "../Views/Styles/Profile.css";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { API_URL } from "../../config/api";

// Create a wrapper component to use navigation context
const Profile = () => {
  const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } =
    useNavigation();
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  TitleHead("Profile");

  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    maritalStatus: "",
    gender: "",
    dob: "",
    yearLevel: "",
    idNumber: "",
    department: "",
    program: "",
    profile: null,
    contact_no: "",
    permanent_address: "",
    emergency_person: "",
    emergency_contact_no: "",
    emergency_address: "",
    password: "",
    role: "Clinician",
  });

  const [enableChange, setEnableChange] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password change data
  const [passwordChangeData, setPasswordChangeData] = useState(null);

  // Add effect to disable body scrolling when modal is open
  useEffect(() => {
    if (showOTP || showPasswordModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showOTP, showPasswordModal]);

  useEffect(() => {
    const getUserData = async () => {
      if (!loading && user?.id) {
        setDataLoading(true);
        setError(null);

        try {
          console.log("Fetching user data for ID:", user.id);
          console.log("User role:", user.role);

          const res = await axios.get(`${API_URL}/getUserById/${user.id}`, {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("API Response:", res.data);

          // Check if response has the expected structure
          if (!res.data || !res.data.users) {
            throw new Error("Invalid response structure");
          }

          const userInfo = res.data.users;

          // Extract main user data with fallbacks
          const {
            email = "",
            firstName = "",
            surname = "",
            dob = "",
            idNumber = "",
            profile = null,
            gender = "",
            marital_status = "",
            role = "",
            program = "",
            department = "",
            yearLevel = "",
          } = userInfo;

          // Extract contact data with proper fallbacks
          let contactData = {
            contact_no: "",
            permanent_address: "",
            emergency_address: "",
            emergency_contact_no: "",
            emergency_person: "",
          };

          // Handle different possible contact data structures
          if (userInfo.contact) {
            contactData = {
              contact_no: userInfo.contact.contact_no || "",
              permanent_address: userInfo.contact.permanent_address || "",
              emergency_address: userInfo.contact.emergency_address || "",
              emergency_contact_no: userInfo.contact.emergency_contact_no || "",
              emergency_person: userInfo.contact.emergency_person || "",
            };
          } else if (userInfo.contact_no) {
            // Handle case where contact fields are directly on user object
            contactData = {
              contact_no: userInfo.contact_no || "",
              permanent_address: userInfo.permanent_address || "",
              emergency_address: userInfo.emergency_address || "",
              emergency_contact_no: userInfo.emergency_contact_no || "",
              emergency_person: userInfo.emergency_person || "",
            };
          }

          console.log("Extracted contact data:", contactData);

          setUserData({
            email,
            firstName,
            lastName: surname,
            maritalStatus: marital_status,
            dob,
            idNumber,
            profile,
            gender,
            ...contactData,
            program,
            department,
            yearLevel,
            role,
          });

          console.log("User data set successfully");
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(err.message || "Failed to load user data");

          // Set basic user data from context if API fails
          if (user) {
            setUserData((prev) => ({
              ...prev,
              email: user.email || "",
              firstName: user.firstName || "",
              lastName: user.surname || "",
              role: user.role || "",
              idNumber: user.idNumber || "",
            }));
          }
        } finally {
          setDataLoading(false);
        }
      }
    };

    getUserData();
  }, [loading, user]);

  // Direct save without OTP verification
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      // Prepare the data to send
      const {
        email,
        firstName,
        lastName,
        maritalStatus,
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
      } = userData;

      const dataToSend = {
        email,
        firstName,
        surname: lastName,
        marital_status: maritalStatus,
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

      console.log("Sending data:", dataToSend);

      const url = `${API_URL}/users/${user.id}/update/initiate`;
      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      alert("Success: " + response.data.message);

      // Re-enable the form
      setEnableChange(true);

      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      if (error.response) {
        alert("Error: " + error.response.data.message);
      } else {
        alert("Error: Something went wrong.");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Modified to request OTP first, then show OTP modal
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const passwordData = {
      password: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (
      !passwordData.password ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Error: Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Error: New password and confirm password do not match.");
      return;
    }

    // Validate password strength (optional)
    if (passwordData.newPassword.length < 6) {
      alert("Error: New password must be at least 6 characters long.");
      return;
    }

    try {
      setPasswordChangeLoading(true);

      // Store password data for later use
      setPasswordChangeData(passwordData);

      console.log("Requesting OTP for password change...");

      // Step 1: Request OTP by sending BOTH current password AND new password
      const otpRequestPayload = {
        email: userData.email,
        password: passwordData.password, // Current password for verification
        newPassword: passwordData.newPassword, // New password to store in OTP record
      };

      console.log("Sending OTP request with payload:", {
        email: otpRequestPayload.email,
        hasPassword: !!otpRequestPayload.password,
        hasNewPassword: !!otpRequestPayload.newPassword,
      });

      const otpResponse = await axios.post(
        `${API_URL}/users/${user.id}/update/password`,
        otpRequestPayload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("OTP request response:", otpResponse.data);

      if (otpResponse.status === 200 || otpResponse.data.success) {
        alert(
          "OTP has been sent to your email. Please check your inbox and enter the code to complete password change."
        );

        // Close password modal
        setShowPasswordModal(false);

        // Show OTP modal
        setShowOTP(true);
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);

      // Reset password data on error
      setPasswordChangeData(null);

      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          "Failed to send OTP";
        alert(`Error: ${errorMessage}`);

        // If current password is wrong, keep the modal open
        if (
          error.response.status === 401 ||
          errorMessage.toLowerCase().includes("password")
        ) {
          return; // Don't close the modal
        }
      } else {
        alert(
          "Error: Failed to send OTP. Please check your internet connection and try again."
        );
      }
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Complete password change after OTP verification
  const handleOTPSubmit = async (otp) => {
    try {
      setOtpLoading(true);

      if (!userData.email || !otp || !passwordChangeData) {
        alert("Error: Please provide valid email and OTP.");
        return;
      }

      console.log("Verifying OTP and changing password...");

      // The payload should only include email and otp
      // The new password is already stored in the OTP record on the backend
      const payload = {
        email: userData.email,
        otp: otp.toString(),
      };

      console.log("Sending OTP verification payload:", payload);

      // Step 2: Verify OTP - backend will use stored newPassword from OTP record
      const response = await axios.put(
        `${API_URL}/users/update/password/verify-otp`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Password change response:", response.data);

      if (response.status === 200) {
        alert(
          "Success: Password changed successfully! Please use your new password for future logins."
        );

        // Reset password data
        setPasswordChangeData(null);

        // Close the OTP modal
        setShowOTP(false);

        // Reset password visibility states
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error("OTP verification/password change error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          "Failed to verify OTP or change password";
        alert(`Error: ${errorMessage}`);

        // If OTP is invalid/expired, don't close modal to allow retry
        if (
          error.response.status === 400 &&
          errorMessage.toLowerCase().includes("otp")
        ) {
          return; // Keep OTP modal open for retry
        }

        // If OTP data is missing, show specific error and close modal
        if (errorMessage.includes("Password update data missing")) {
          alert(
            "Error: Session expired. Please start the password change process again."
          );
          setShowOTP(false);
          setPasswordChangeData(null);
          setShowPasswordModal(true); // Reopen password modal
          return;
        }
      } else {
        alert(
          "Error: Network error. Please check your connection and try again."
        );
      }

      // Close modals on other errors
      setShowOTP(false);
      setPasswordChangeData(null);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle form input changes while preserving existing values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    if (field === "current") setShowCurrentPassword(!showCurrentPassword);
    if (field === "new") setShowNewPassword(!showNewPassword);
    if (field === "confirm") setShowConfirmPassword(!showConfirmPassword);
  };

  // Show loading state
  if (dataLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h4>Error Loading Profile</h4>
        <p>{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Style for the password eye icon
  const eyeIconStyle = {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    zIndex: 10,
    color: "#666",
  };

  // Backdrop style with blur effect - covering the entire screen
  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: "blur(6px)", // Strong blur effect
    WebkitBackdropFilter: "blur(6px)", // For Safari support
    zIndex: 1040,
    backgroundColor: "rgba(255,255,255,0.1)", // Very subtle light overlay
  };

  // Modal container style
  const modalContainerStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1050,
  };

  // Modal content style
  const modalContentStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90vw",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  };

  // Fixed label style - positioned above input field
  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#333",
    position: "relative",
    zIndex: 1, // Ensure label is above input
  };

  // Form group style to fix positioning
  const formGroupStyle = {
    position: "relative",
    marginBottom: "20px",
  };

  // Improved input style function that keeps text black when disabled
  const getInputStyle = (disabled) => ({
    width: "100%",
    padding: "10px 12px",
    fontSize: "0.95rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: disabled ? "#f9f9f9" : "white",
    color: "#000", // Always keep text color black
    transition: "all 0.2s ease",
    position: "relative", 
    zIndex: 0,
  });

  return (
    <div className="profile-content">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => navigate(-1)}
        className="compact-back-btn"
        style={{
          display: "flex",
          alignItems: "center",
          margin: "0 0 16px 0",
          borderRadius: "8px",
          fontSize: "0.9rem",
          padding: "6px 12px",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <FiArrowLeft size={16} />
        <span className="ms-1">Back</span>
      </Button>

      {/* Enhanced Profile Header with Navy Blue Theme */}
      <div
        style={{
          background: "linear-gradient(135deg, #000080 0%, #0000A3 100%)",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "30px",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Background pattern overlay */}
        <div
          style={{
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

        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            alignItems: window.innerWidth < 768 ? "center" : "flex-start",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Enhanced profile picture container */}
          <div
            style={{
              marginRight: window.innerWidth < 768 ? "0" : "30px",
              marginBottom: window.innerWidth < 768 ? "20px" : "0",
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "50%",
                width: window.innerWidth < 768 ? "110px" : "140px",
                height: window.innerWidth < 768 ? "110px" : "140px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                border: "4px solid rgba(255, 255, 255, 0.6)",
                transition: "all 0.25s ease",
              }}
            >
              <img
                src={
                  userData.profile
                    ? `${API_URL}/getFile/profile_pics/${userData.profile}`
                    : "/bencent.jpg"
                }
                alt={`${userData.firstName} ${userData.lastName}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>

          {/* User information with improved typography */}
          <div style={{ color: "white", flex: 1 }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: window.innerWidth < 768 ? "1.6rem" : "2rem",
                marginBottom: "8px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                letterSpacing: "0.2px",
                textAlign: window.innerWidth < 768 ? "center" : "left",
              }}
            >
              {userData?.firstName} {userData?.lastName}
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                justifyContent:
                  window.innerWidth < 768 ? "center" : "flex-start",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  padding: "4px 12px",
                  borderRadius: "30px",
                  display: "inline-flex",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {userData?.role}
                </span>
              </div>

              {userData?.idNumber && (
                <div
                  style={{
                    marginLeft: "10px",
                    opacity: 0.9,
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                    ID: {userData.idNumber}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "16px",
                justifyContent:
                  window.innerWidth < 768 ? "center" : "flex-start",
              }}
            >
              {userData.program && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.92,
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <span>{userData.program}</span>
                </div>
              )}

              {userData.department && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.92,
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <span>{userData.department}</span>
                </div>
              )}

              {userData.yearLevel && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.92,
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <span>Year {userData.yearLevel}</span>
                </div>
              )}
            </div>

            <p
              style={{
                marginTop: "16px",
                fontSize: "0.95rem",
                opacity: 0.9,
                textAlign: window.innerWidth < 768 ? "center" : "left",
              }}
            >
              <strong>Email:</strong> {userData?.email}
            </p>

            <div
              style={{
                marginTop: "20px",
                textAlign: window.innerWidth < 768 ? "center" : "left",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Basic Information Section */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#000080",
            paddingBottom: "10px",
            borderBottom: "2px solid rgba(0,0,128,0.1)",
          }}
        >
          Basic Information
        </h2>

        <form onSubmit={handleSave}>
          <input
            type="hidden"
            name="idNumber"
            disabled={enableChange}
            value={userData.idNumber || ""}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* Email field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.email || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Civil Status field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="maritalStatus" style={labelStyle}>
                Civil Status
              </label>
              <input
                id="maritalStatus"
                type="text"
                name="maritalStatus"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.maritalStatus || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Last Name field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="lastName" style={labelStyle}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.lastName || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* First Name field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="firstName" style={labelStyle}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.firstName || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Gender field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="gender" style={labelStyle}>
                Gender
              </label>
              <input
                id="gender"
                type="text"
                name="gender"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.gender || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Birth Date field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="dob" style={labelStyle}>
                Birth Date
              </label>
              <input
                id="dob"
                type="date"
                name="dob"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.dob ? userData.dob.split("T")[0] : ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Year Level field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="yearLevel" style={labelStyle}>
                Year Level
              </label>
              <input
                id="yearLevel"
                type="text"
                name="yearLevel"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.yearLevel || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Contact No. field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="contact_no" style={labelStyle}>
                Contact No.
              </label>
              <input
                id="contact_no"
                type="tel"
                name="contact_no"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.contact_no || ""}
                style={getInputStyle(enableChange)}
              />
            </div>
          </div>

          {/* Permanent Address field with fixed label */}
          <div style={{...formGroupStyle, marginBottom: "30px"}}>
            <label htmlFor="permanent_address" style={labelStyle}>
              Permanent Address
            </label>
            <input
              id="permanent_address"
              type="text"
              name="permanent_address"
              onChange={handleChange}
              disabled={enableChange}
              value={userData.permanent_address || ""}
              style={getInputStyle(enableChange)}
            />
          </div>

          <h2
            style={{
              marginTop: "30px",
              marginBottom: "20px",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#000080",
              paddingBottom: "10px",
              borderBottom: "2px solid rgba(0,0,128,0.1)",
            }}
          >
            Emergency Contact Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* Emergency Contact Person field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="emergency_person" style={labelStyle}>
                Emergency Contact Person
              </label>
              <input
                id="emergency_person"
                type="text"
                name="emergency_person"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.emergency_person || ""}
                style={getInputStyle(enableChange)}
              />
            </div>

            {/* Emergency Contact No. field with fixed label */}
            <div style={formGroupStyle}>
              <label htmlFor="emergency_contact_no" style={labelStyle}>
                Emergency Contact No.
              </label>
              <input
                id="emergency_contact_no"
                type="text"
                name="emergency_contact_no"
                onChange={handleChange}
                disabled={enableChange}
                value={userData.emergency_contact_no || ""}
                style={getInputStyle(enableChange)}
              />
            </div>
          </div>

          {/* Emergency Contact Address field with fixed label */}
          <div style={{...formGroupStyle, marginBottom: "30px"}}>
            <label htmlFor="emergency_address" style={labelStyle}>
              Emergency Contact Address
            </label>
            <input
              id="emergency_address"
              type="text"
              name="emergency_address"
              onChange={handleChange}
              disabled={enableChange}
              value={userData.emergency_address || ""}
              style={getInputStyle(enableChange)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "30px",
            }}
          >
            {!enableChange ? (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEnableChange(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    border: "1px solid #ddd",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={saveLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#000080",
                    color: "white",
                    border: "none",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    opacity: saveLoading ? 0.7 : 1,
                  }}
                >
                  {saveLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => setEnableChange(false)} // Simple toggle to edit mode
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#000080",
                  color: "white",
                  border: "none",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>

      {/* OTP Modal for password change */}
      {showOTP && (
        <>
          <div style={backdropStyle}></div>
          <div style={modalContainerStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                Enter OTP
              </h3>
              <p style={{ textAlign: "center" }}>
                We've sent a 6-digit verification code to{" "}
                <strong>{userData.email}</strong>. Please enter the code below
                to complete your password change.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const otp = formData.get("otp");
                  handleOTPSubmit(otp);
                }}
              >
                <div style={formGroupStyle}>
                  <label
                    htmlFor="otp"
                    style={{
                      ...labelStyle,
                      textAlign: "center",
                    }}
                  >
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    name="otp"
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "0.5rem",
                      fontWeight: "500",
                      zIndex: 0,
                    }}
                    placeholder="000000"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                  <small
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "0.5rem",
                      color: "#666",
                    }}
                  >
                    Enter the 6-digit code from your email
                  </small>
                </div>
                <div
                  className="form-buttons"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "space-between",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowOTP(false);
                      setPasswordChangeData(null);
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      flex: "1",
                      opacity: otpLoading ? 0.7 : 1,
                    }}
                    disabled={otpLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      padding: "0.75rem 1rem",
                      flex: "1",
                      opacity: otpLoading ? 0.7 : 1,
                    }}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify & Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <>
          <div style={backdropStyle}></div>
          <div style={modalContainerStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                Change Password
              </h3>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "1.5rem",
                }}
              >
                Enter your current password and choose a new one. We'll send a
                verification code to your email.
              </p>
              <form onSubmit={handlePasswordSubmit}>
                {/* Current Password with show/hide toggle */}
                <div style={{...formGroupStyle, marginBottom: "1.5rem"}}>
                  <label htmlFor="currentPassword" style={labelStyle}>
                    Current Password *
                  </label>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      paddingRight: "35px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      position: "relative",
                      zIndex: 0,
                    }}
                    placeholder="Enter your current password"
                    autoFocus
                  />
                  <div
                    onClick={() => togglePasswordVisibility("current")}
                    style={eyeIconStyle}
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </div>
                </div>

                {/* New Password with show/hide toggle */}
                <div style={{...formGroupStyle, marginBottom: "1.5rem"}}>
                  <label htmlFor="newPassword" style={labelStyle}>
                    New Password *
                  </label>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    required
                    minLength="6"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      paddingRight: "35px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      position: "relative",
                      zIndex: 0,
                    }}
                    placeholder="Enter your new password"
                  />
                  <div
                    onClick={() => togglePasswordVisibility("new")}
                    style={eyeIconStyle}
                  >
                    {showNewPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </div>
                  <small style={{ color: "#666", fontSize: "0.8rem" }}>
                    Minimum 6 characters
                  </small>
                </div>

                {/* Confirm Password with show/hide toggle */}
                <div style={{...formGroupStyle, marginBottom: "1.5rem"}}>
                  <label htmlFor="confirmPassword" style={labelStyle}>
                    Confirm New Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength="6"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      paddingRight: "35px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      position: "relative",
                      zIndex: 0,
                    }}
                    placeholder="Confirm your new password"
                  />
                  <div
                    onClick={() => togglePasswordVisibility("confirm")}
                    style={eyeIconStyle}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </div>
                </div>

                <div
                  className="form-buttons"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "space-between",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPasswordModal(false);
                      // Reset form fields and visibility states
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      flex: "1",
                    }}
                    disabled={passwordChangeLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      padding: "0.75rem 1rem",
                      flex: "1",
                    }}
                    disabled={passwordChangeLoading}
                  >
                    {passwordChangeLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;