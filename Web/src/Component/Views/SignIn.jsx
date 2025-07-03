import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Styles/SignIn.css";
import TitleHead from "../Custom Hooks/TitleHead";
import axios from "axios";
import { App } from "antd";
import Header from "../Custom Hooks/Header";
import Footer from "../Custom Hooks/Footer";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import Form from "react-bootstrap/Form";
import { useNavigate, useLocation } from "react-router";
import { UserContext } from "../Context/UserContext";
import { API_ENDPOINTS } from "../../config/api";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SignIn = () => {
  TitleHead("Sign In");
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);
  const location = useLocation();
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  // Add touched state to track which fields have been interacted with
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [otp, setOTP] = useState({
    email: "",
    otp: "",
  });
  const [otpError, setOtpError] = useState("");
  const [otpTouched, setOtpTouched] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [otpValid, setOtpValid] = useState(false);
  const { message: messageAPI } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Add state to control password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Add new states for resend functionality and sign in loading
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [signInLoading, setSignInLoading] = useState(false);

  // Add new states for forgot password modal
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordTouched, setForgotPasswordTouched] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      messageAPI.warning(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, messageAPI]);

  // Validate the form whenever login changes
  useEffect(() => {
    validateForm();
  }, [login]);

  // Validate OTP whenever it changes
  useEffect(() => {
    validateOTP();
  }, [otp.otp]);

  // Add useEffect for countdown timer
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const validateOTP = () => {
    const otpRegex = /^\d{6}$/; // Assuming 6-digit OTP

    if (!otp.otp) {
      setOtpError("OTP is required");
      setOtpValid(false);
    } else if (!otpRegex.test(otp.otp)) {
      setOtpError("OTP must be 6 digits");
      setOtpValid(false);
    } else {
      setOtpError("");
      setOtpValid(true);
    }
  };

  const validateForm = () => {
    const emailError = validateEmail(login.email);
    const passwordError = validatePassword(login.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    setFormValid(!emailError && !passwordError);
  };

  // Validate forgot password email
  const validateForgotPasswordEmail = (email) => {
    const emailError = validateEmail(email);
    setForgotPasswordError(emailError);
    return !emailError;
  };

  const handleChange = ({ target: input }) => {
    setLogin({ ...login, [input.name]: input.value });

    // Mark field as touched when user types
    setTouched({
      ...touched,
      [input.name]: true,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle forgot password email change
  const handleForgotPasswordEmailChange = (e) => {
    const email = e.target.value;
    setForgotPasswordEmail(email);
    setForgotPasswordTouched(true);

    if (forgotPasswordTouched) {
      validateForgotPasswordEmail(email);
    }
  };

  // Handle forgot password link click
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setForgotPasswordModalOpen(true);
    setForgotPasswordEmail("");
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);
    setForgotPasswordTouched(false);
  };

  // Handle forgot password form submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordTouched(true);

    if (!validateForgotPasswordEmail(forgotPasswordEmail)) {
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await axios.post(`${API_ENDPOINTS.FORGOT_PASSWORD}`, {
        email: forgotPasswordEmail,
      });

      if (response.data.success) {
        setForgotPasswordSuccess(true);
        messageAPI.success(response.data.message);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to send reset email";
      setForgotPasswordError(errorMessage);
      messageAPI.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Close forgot password modal
  const closeForgotPasswordModal = () => {
    if (!forgotPasswordLoading) {
      setForgotPasswordModalOpen(false);
      setForgotPasswordEmail("");
      setForgotPasswordError("");
      setForgotPasswordSuccess(false);
      setForgotPasswordTouched(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      email: true,
      password: true,
    });

    // Validate form again before submission
    validateForm();
    if (!formValid) {
      return;
    }

    setSignInLoading(true); // Start sign in loading

    try {
      const res = await axios.post(`${API_ENDPOINTS.LOGIN}`, login,
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      messageAPI.success(res.data.message);
      setOTP({ ...otp, email: login.email });
      setModalOpen(true);
    } catch (err) {
      console.log(err);
      messageAPI.error(err.response?.data?.message || "Login failed");
    } finally {
      setSignInLoading(false); // End sign in loading
    }
  };

  // Add resend OTP function
  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const res = await axios.post(`${API_ENDPOINTS.LOGIN}`, login, {
        email: otp.email,
      });
      messageAPI.success("OTP resent successfully!");
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      console.log(err);
      messageAPI.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  // Update your handleOTP function
  const handleOTP = async (e) => {
    e.preventDefault();

    // Mark OTP as touched on submit
    setOtpTouched(true);

    // Validate OTP before submission
    validateOTP();
    if (!otpValid) {
      return;
    }

    setOtpLoading(true); // Start loading

    try {
      const res = await axios.post(`${API_ENDPOINTS.VERIFY_OTP_LOGIN}`, otp, {
        withCredentials: true,
      });
      console.log(res.data);
      messageAPI.success("Login Successful!");
      dispatch({ type: "LOGIN", payload: res.data.user });
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      messageAPI.error(
        err.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setOtpLoading(false); // End loading
    }
  };

  // Updated renderError function that only shows errors for touched fields
  const renderError = (fieldName) => {
    if (touched[fieldName] && errors[fieldName]) {
      return <div className="text-danger">{errors[fieldName]}</div>;
    }
    return null;
  };

  return (
    <div className="main-container">
      <Header />
      <div className="auth-content">
        <div className="logo-section">
          <img
            src="/NU_logo.png"
            alt="National University Logo"
            className="nu-logo"
          />
        </div>

        <div className="form-section">
          <div className="login-form-container">
            <div className="login-header">
              <h1>NUSmilePH</h1>
              <p>Sign in to your account and get started!</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={login.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  autoComplete="off"
                  className={`input-field ${
                    touched.email && errors.email
                      ? "is-invalid"
                      : touched.email && login.email
                      ? "is-valid"
                      : ""
                  }`}
                />
                <label>Email</label>
                {renderError("email")}
              </div>

              <div className="input-group" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={login.password}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  autoComplete="off"
                  className={`input-field ${
                    touched.password && errors.password
                      ? "is-invalid"
                      : touched.password && login.password
                      ? "is-valid"
                      : ""
                  }`}
                  style={{ paddingRight: "40px" }}
                />
                <label>Password</label>
                <div
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "calc(1.8rem + 0.95rem)" /* Fixed position relative to input padding */,
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#666",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    backgroundColor: "transparent",
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                    padding: "0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  role="button"
                  tabIndex="0"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
                {renderError("password")}
              </div>

              <div className="forgot-password-container">
                <a
                  href="#"
                  onClick={handleForgotPasswordClick}
                  className="forgot-password"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="signin-button"
                disabled={!formValid || signInLoading}
              >
                {signInLoading ? (
                  <>
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* OTP Verification Modal */}
        <Dialog
          open={modalOpen}
          onClose={() => !otpLoading && setModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: "12px",
              overflow: "hidden",
            },
          }}
          BackdropProps={{
            style: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            style={{
              color: "white",
              textAlign: "center",
              padding: "20px 24px",
              margin: 0,
              borderBottom: "none",
              backgroundColor: "#00245A",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fas fa-envelope-open"
                style={{ marginRight: "8px", fontSize: "1.2rem" }}
              ></i>
              Verify Your Email
            </div>
          </DialogTitle>

          <DialogContent style={{ padding: "32px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <i
                className="fas fa-envelope"
                style={{
                  fontSize: "3rem",
                  color: "#28a745",
                  marginBottom: "16px",
                  backgroundColor: "#00245A",
                }}
              ></i>
              <h5
                style={{
                  marginTop: "16px",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Check Your Email
              </h5>
              <p
                style={{
                  color: "#6c757d",
                  margin: 0,
                  fontSize: "0.95rem",
                }}
              >
                We've sent a verification code to <strong>{otp.email}</strong>
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                  display: "block",
                  textAlign: "center",
                }}
              >
                Verification Code
              </label>
              <TextField
                autoFocus
                required
                name="OTP"
                type="text"
                fullWidth
                variant="outlined"
                value={otp.otp}
                onChange={(e) => {
                  setOTP({ ...otp, otp: e.target.value });
                  setOtpTouched(true);
                }}
                error={otpTouched && !!otpError}
                helperText={otpTouched ? otpError : ""}
                placeholder="Enter 6-digit code"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    letterSpacing: "0.5rem",
                    fontWeight: "600",
                  },
                }}
                disabled={otpLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&:hover fieldset": {
                      borderColor: "#00245A",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00245A",
                    },
                  },
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: "#e7f3ff",
                border: "1px solid #b8daff",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.875rem",
                color: "#0c5460",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <i
                    className="fas fa-info-circle"
                    style={{ marginRight: "8px" }}
                  ></i>
                  Don't receive the code?{" "}
                  <span
                    onClick={
                      resendLoading || resendCooldown > 0 || otpLoading
                        ? undefined
                        : handleResendOTP
                    }
                    style={{
                      color:
                        resendLoading || resendCooldown > 0 || otpLoading
                          ? "#999"
                          : "#00245A",
                      textTransform: "none",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor:
                        resendLoading || resendCooldown > 0 || otpLoading
                          ? "not-allowed"
                          : "pointer",

                      opacity:
                        resendLoading || resendCooldown > 0 || otpLoading
                          ? 0.6
                          : 1,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !(resendLoading || resendCooldown > 0 || otpLoading)
                      ) {
                        e.target.style.backgroundColor = "transparent";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    {resendLoading ? (
                      <>
                        <i
                          className="fas fa-spinner fa-spin"
                          style={{ marginRight: "4px" }}
                        ></i>
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </span>{" "}
                  Check your spam folder.
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions
            style={{
              padding: "16px 24px 24px",
              gap: "12px",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={() => setModalOpen(false)}
              variant="outlined"
              disabled={otpLoading}
              style={{
                color: "#000080",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                textTransform: "none",
              }}
              sx={{
                "&:hover:not(:disabled)": {
                  backgroundColor: "#00245A !important",
                  color: "white !important",
                },
                "&:disabled": {
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!otpValid || otpLoading}
              onClick={handleOTP}
              style={{
                backgroundColor: "#00245A",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "8px",
                minWidth: "120px",
              }}
            >
              {otpLoading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <i className="fas fa-spinner fa-spin"></i>
                  Verifying...
                </div>
              ) : (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <i className="fas fa-check"></i>
                  Verify Email
                </div>
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Forgot Password Modal */}
        <Dialog
          open={forgotPasswordModalOpen}
          onClose={closeForgotPasswordModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: "12px",
              overflow: "hidden",
            },
          }}
          BackdropProps={{
            style: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            style={{
              color: "white",
              textAlign: "center",
              padding: "20px 24px",
              margin: 0,
              borderBottom: "none",
              backgroundColor: "#000080",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fas fa-key"
                style={{ marginRight: "8px", fontSize: "1.2rem" }}
              ></i>
              {forgotPasswordSuccess ? "Check Your Email" : "Forgot Password"}
            </div>
          </DialogTitle>

          <DialogContent style={{ padding: "32px 24px" }}>
            {!forgotPasswordSuccess ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <i
                    className="fas fa-lock"
                    style={{
                      fontSize: "3rem",
                      color: "#000080",
                      marginBottom: "16px",
                    }}
                  ></i>
                  <h5
                    style={{
                      marginTop: "16px",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Reset Your Password
                  </h5>
                  <p
                    style={{
                      color: "#6c757d",
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                    }}
                  >
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <TextField
                    autoFocus
                    required
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={forgotPasswordEmail}
                    onChange={handleForgotPasswordEmailChange}
                    error={forgotPasswordTouched && !!forgotPasswordError}
                    helperText={
                      forgotPasswordTouched ? forgotPasswordError : ""
                    }
                    placeholder="Enter your email address"
                    disabled={forgotPasswordLoading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "&:hover fieldset": {
                          borderColor: "#000080",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#00245A",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#000080",
                      },
                    }}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "#e7f3ff",
                    border: "1px solid #b8daff",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.875rem",
                    color: "#0c5460",
                  }}
                >
                  <i
                    className="fas fa-info-circle"
                    style={{ marginRight: "8px" }}
                  ></i>
                  We'll send you a secure link to reset your password. Check
                  your spam folder if you don't see it.
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <i
                  className="fas fa-envelope-open"
                  style={{
                    fontSize: "4rem",
                    color: "#000080",
                    marginBottom: "24px",
                  }}
                ></i>
                <h5
                  style={{
                    marginBottom: "16px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Reset Link Sent!
                </h5>
                <p
                  style={{
                    color: "#6c757d",
                    marginBottom: "16px",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                  }}
                >
                  We've sent a password reset link to:
                </p>
                <p
                  style={{
                    fontWeight: "600",
                    color: "#000080",
                    marginBottom: "24px",
                    fontSize: "1rem",
                  }}
                >
                  {forgotPasswordEmail}
                </p>
                <div
                  style={{
                    backgroundColor: "#d1edff",
                    border: "1px solid #bee5eb",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "0.875rem",
                    color: "#0c5460",
                  }}
                >
                  <i
                    className="fas fa-clock"
                    style={{ marginRight: "8px" }}
                  ></i>
                  The reset link will expire in 1 hour. If you don't receive the
                  email, check your spam folder or try again.
                </div>
              </div>
            )}
          </DialogContent>

          <DialogActions
            style={{
              padding: "16px 24px 24px",
              gap: "12px",
              justifyContent: forgotPasswordSuccess
                ? "center"
                : "space-between",
            }}
          >
            {!forgotPasswordSuccess ? (
              <>
                <Button
                  onClick={closeForgotPasswordModal}
                  variant="text"
                  disabled={forgotPasswordLoading}
                  sx={{
                    color: "#000080",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#000080",
                      color: "white",
                    },
                    "&:disabled": {
                      opacity: 0.6,
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPasswordSubmit}
                  variant="contained"
                  disabled={
                    forgotPasswordLoading ||
                    !!forgotPasswordError ||
                    !forgotPasswordEmail
                  }
                  style={{
                    backgroundColor: "#000080",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    minWidth: "140px",
                  }}
                >
                  {forgotPasswordLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Send Reset Link
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={closeForgotPasswordModal}
                variant="contained"
                style={{
                  backgroundColor: "#00245A",
                  color: "white",
                  textTransform: "none",
                  fontWeight: "bold",
                  padding: "12px 24px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <i className="fas fa-check"></i>
                  Got it
                </div>
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
