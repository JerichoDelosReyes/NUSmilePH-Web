import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { App } from "antd";
import axios from "axios";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiKey,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import "./Styles/SignIn.css"; // Using the same CSS file
import TitleHead from "../Custom Hooks/TitleHead";
import Header from "../Custom Hooks/Header";
import Footer from "../Custom Hooks/Footer";
import { API_URL } from "../../config/api";

const ResetPassword = () => {
  TitleHead("Reset Password");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { message: messageAPI } = App.useApp();

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      setVerifyingToken(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/verify-reset-token/${token}`
      );

      if (response.data.success) {
        setTokenValid(true);
        setUserInfo(response.data.data);
        console.log("Token verified successfully:", response.data.data);
      } else {
        setError(response.data.message || "Invalid or expired reset token");
      }
    } catch (err) {
      console.error("Token verification error:", err);
      setError(err.response?.data?.message || "Invalid or expired reset token");
    } finally {
      setVerifyingToken(false);
    }
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    } else if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    // Check for at least one special character
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character";
    }

    return "";
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword.trim()) {
      return "Please confirm your password";
    } else if (confirmPassword !== passwords.newPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const validateForm = () => {
    const newPasswordError = validatePassword(passwords.newPassword);
    const confirmPasswordError = validateConfirmPassword(
      passwords.confirmPassword
    );

    setErrors({
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });

    return !newPasswordError && !confirmPasswordError;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (error) setError("");

    if (touched[name] || touched.newPassword || touched.confirmPassword) {
      setTimeout(() => {
        if (name === "newPassword") {
          const newPasswordError = validatePassword(value);
          setErrors((prev) => ({ ...prev, newPassword: newPasswordError }));

          if (passwords.confirmPassword) {
            const confirmPasswordError =
              passwords.confirmPassword !== value
                ? "Passwords do not match"
                : "";
            setErrors((prev) => ({
              ...prev,
              confirmPassword: confirmPasswordError,
            }));
          }
        } else if (name === "confirmPassword") {
          const confirmPasswordError = validateConfirmPassword(value);
          setErrors((prev) => ({
            ...prev,
            confirmPassword: confirmPasswordError,
          }));
        }
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword: passwords.newPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        messageAPI.success(response.data.message);

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage =
        err.response?.data?.message || "Network error. Please try again.";
      setError(errorMessage);
      messageAPI.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderError = (fieldName) => {
    if (touched[fieldName] && errors[fieldName]) {
      return <div className="text-danger">{errors[fieldName]}</div>;
    }
    return null;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="main-container">
        <Header />
        <div className="auth-content">
          <div className="form-section">
            <div className="login-form-container">
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ marginBottom: "2rem", color: "#00245A" }}>
                  <FiLoader
                    size={48}
                    style={{
                      animation: "spin 1s linear infinite",
                      display: "inline-block",
                    }}
                  />
                </div>
                <h3
                  style={{
                    color: "#00245A",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Verifying Reset Link...
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "1rem",
                    margin: 0,
                  }}
                >
                  Please wait while we verify your reset token.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="main-container">
        <Header />
        <div className="auth-content">
          <div className="form-section">
            <div className="login-form-container">
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ marginBottom: "2rem", color: "#dc3545" }}>
                  <FiAlertTriangle size={48} />
                </div>
                <h3
                  style={{
                    color: "#00245A",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Invalid Reset Link
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "1rem",
                    marginBottom: "2rem",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="signin-button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiArrowLeft size={18} />
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="main-container">
        <Header />
        <div className="auth-content">
          <div className="form-section">
            <div className="login-form-container">
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ marginBottom: "2rem", color: "#28a745" }}>
                  <FiCheckCircle size={48} />
                </div>
                <h3
                  style={{
                    color: "#00245A",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Password Reset Successful!
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "1rem",
                    marginBottom: "1.5rem",
                    lineHeight: 1.5,
                  }}
                >
                  Your password has been successfully reset.
                </p>
                <div
                  style={{
                    backgroundColor: "rgba(0, 36, 90, 0.1)",
                    color: "#00245A",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                    borderLeft: "4px solid #00245A",
                  }}
                >
                  Redirecting to sign in page in 3 seconds...
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="signin-button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiKey size={18} />
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="main-container">
      <Header />
      <div className="auth-content">
        <div className="form-section">
          <div className="login-form-container">
            <div className="login-header">
              <h1>Reset Password</h1>
              <p>Create a new password for your account</p>
              {userInfo && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    marginTop: "0.5rem",
                  }}
                >
                  Setting new password for{" "}
                  <strong style={{ color: "#000080" }}>{userInfo.email}</strong>
                </p>
              )}
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder=" "
                  autoComplete="off"
                  disabled={loading}
                  className={`input-field ${
                    touched.newPassword && errors.newPassword
                      ? "is-invalid"
                      : touched.newPassword &&
                        passwords.newPassword &&
                        !errors.newPassword
                      ? "is-valid"
                      : ""
                  }`}
                  style={{ paddingRight: "40px" }}
                />
                <label>New Password</label>
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
                {renderError("newPassword")}
              </div>

              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder=" "
                  autoComplete="off"
                  disabled={loading}
                  className={`input-field ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "is-invalid"
                      : touched.confirmPassword &&
                        passwords.confirmPassword &&
                        !errors.confirmPassword
                      ? "is-valid"
                      : ""
                  }`}
                  style={{ paddingRight: "40px" }}
                />
                <label>Confirm New Password</label>
                <div
                  onClick={toggleConfirmPasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "calc(1.8rem + 0.95rem)",
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
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  role="button"
                  tabIndex="0"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </div>
                {renderError("confirmPassword")}
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #f5c6cb",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiAlertTriangle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="signin-button"
                disabled={
                  loading ||
                  !!errors.newPassword ||
                  !!errors.confirmPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  opacity:
                    loading ||
                    !!errors.newPassword ||
                    !!errors.confirmPassword ||
                    !passwords.newPassword ||
                    !passwords.confirmPassword
                      ? 0.6
                      : 1,
                  cursor:
                    loading ||
                    !!errors.newPassword ||
                    !!errors.confirmPassword ||
                    !passwords.newPassword ||
                    !passwords.confirmPassword
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <FiLoader
                      size={18}
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <FiKey size={18} />
                    Reset Password
                  </>
                )}
              </button>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    color: "#000080",
                    border: "1px solid #000080",
                    borderRadius: "8px",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease-in-out",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = "#000080";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#000080";
                    }
                  }}
                >
                  <FiArrowLeft size={16} />
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
