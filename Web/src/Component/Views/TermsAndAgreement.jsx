import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Modal,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaLock,
  FaCog,
  FaBalanceScale,
  FaBan,
  FaInfoCircle,
  FaFileContract,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaKey,
} from "react-icons/fa";
import { UserContext } from "../Context/UserContext";
import axios from "axios";
import API_ENDPOINTS, { API_URL } from "../../config/api";
import "./Styles/TermsAndAgreement.css";
import OTPInput from "../Custom Hooks/Common/OTPInput/OTPInput"; // Assuming you have this component
import TitleHead from "../Custom Hooks/TitleHead";

const TermsAndAgreement = () => {
  // Add step state to track current flow
  TitleHead("Terms And Conditions");
  const [currentStep, setCurrentStep] = useState("password"); // "password", "otp", "terms"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(true); // Start with password modal visible
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // OTP modal states
  const [showOTP, setShowOTP] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // User data for email reference
  const [userData, setUserData] = useState({
    email: user?.email || "",
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // If user is already verified and has accepted terms, redirect to dashboard
    if (user?.termsAccepted) {
      navigate("/dashboard");
    }

    // Update userData when user context changes
    if (user) {
      setUserData({ email: user.email });
    }

    // Start with password modal open
    setShowPasswordModal(true);
  }, [user, navigate]);

  const acceptTerms = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API to accept terms
      const response = await axios.post(
        `${API_URL}/accept-terms`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);

        // Update user context with the updated user data
        dispatch({
          type: "LOGIN",
          payload: {
            ...user,
            ...response.data.user,
            termsAccepted: true,
          },
        });

        // After accepting terms, navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error accepting terms:", err);
      setError(
        err.response?.data?.message ||
          "Failed to accept terms. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const declineTerms = () => {
    // When declining, redirect to login page or other appropriate page
    navigate("/login");
  };

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

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      alert("Error: New password must be at least 6 characters long.");
      return;
    }

    try {
      setPasswordChangeLoading(true);

      // Store password data for later use
      setPasswordChangeData(passwordData);

      // Step 1: Request OTP by sending BOTH current password AND new password
      const otpRequestPayload = {
        email: userData.email,
        password: passwordData.password, // Current password for verification
        newPassword: passwordData.newPassword, // New password to store in OTP record
      };

      const otpResponse = await axios.post(
        `${API_URL}/users/${user.id}/update/password`,
        otpRequestPayload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (otpResponse.status === 200 || otpResponse.data.success) {
        alert(
          "OTP has been sent to your email. Please check your inbox and enter the code to complete password change."
        );

        // Close password modal
        setShowPasswordModal(false);
        
        // Update step and show OTP modal
        setCurrentStep("otp");
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

      // The payload should only include email and otp
      // The new password is already stored in the OTP record on the backend
      const payload = {
        email: userData.email,
        otp: otp.toString(),
      };

      // Step 2: Verify OTP - backend will use stored newPassword from OTP record
      const response = await axios.put(
        `${API_URL}/users/update/password/verify-otp`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert(
          "Success: Password changed successfully! Please review and accept the terms and conditions."
        );

        // Reset password data
        setPasswordChangeData(null);

        // Close the OTP modal
        setShowOTP(false);

        // Reset password visibility states
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        // Move to terms and conditions step
        setCurrentStep("terms");
        setOtpVerified(true);
        setPasswordChanged(true);
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
          setCurrentStep("password");
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

  // Skip password change and go to OTP step
  const skipPasswordChange = () => {
    setShowPasswordModal(false);
    // Since we're skipping password change, move to terms and conditions
    setCurrentStep("terms");
    setPasswordChanged(false);
  };

  // Skip OTP and go to terms step (when password change is skipped)
  const skipOTP = () => {
    setShowOTP(false);
    setCurrentStep("terms");
  };

  return (
    <div className="terms-page">
      {/* Only render terms and conditions when we're at the terms step */}
      {currentStep === "terms" && (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white py-3">
                  <div className="d-flex align-items-center">
                    <FaFileContract className="me-2" size={24} />
                    <h2 className="mb-0">NUSmilePH Connect Terms of Service</h2>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  {success && (
                    <Alert
                      variant="success"
                      className="d-flex align-items-center mb-4"
                    >
                      <FaCheckCircle className="me-2" size={20} />
                      <div>
                        <strong>Terms Accepted Successfully!</strong>
                        <p className="mb-0">
                          Your account has been activated. You will be redirected to the dashboard.
                        </p>
                      </div>
                    </Alert>
                  )}

                  {error && (
                    <Alert
                      variant="danger"
                      className="d-flex align-items-center mb-4"
                    >
                      <FaTimesCircle className="me-2" size={20} />
                      <div>
                        <strong>Error:</strong> {error}
                      </div>
                    </Alert>
                  )}

                  <div
                    className="terms-content"
                    style={{ maxHeight: "60vh", overflowY: "auto" }}
                  >
                    <h4 className="mb-3">Welcome to NUSmilePH Connect!</h4>
                    <p className="mb-4">
                      By using our services, you agree to these terms:
                    </p>

                    <div className="terms-section mb-4">
                      <h5 className="fw-bold">
                        <FaUserShield className="me-2" />
                        1. User Responsibilities
                      </h5>
                      <ul className="ps-4">
                        <li>
                          You must provide accurate information during
                          registration
                        </li>
                        <li>
                          You are responsible for maintaining the security of your
                          account
                        </li>
                        <li>
                          You agree to use the service in compliance with all
                          applicable laws
                        </li>
                        <li>
                          You will not share your account credentials with any
                          third party
                        </li>
                      </ul>
                    </div>

                    <div className="terms-section mb-4">
                      <h5 className="fw-bold">
                        <FaLock className="me-2" />
                        2. Privacy and Data Protection
                      </h5>
                      <ul className="ps-4">
                        <li>
                          We collect and process your data as described in our
                          Privacy Policy
                        </li>
                        <li>
                          We implement security measures to protect your
                          information
                        </li>
                        <li>You have rights regarding your personal data</li>
                        <li>
                          Your dental records and patient information will be kept
                          confidential according to applicable healthcare
                          regulations
                        </li>
                      </ul>
                    </div>

                    <div className="terms-section mb-4">
                      <h5 className="fw-bold">
                        <FaCog className="me-2" />
                        3. Service Usage
                      </h5>
                      <ul className="ps-4">
                        <li>
                          The service is provided "as is" without warranties
                        </li>
                        <li>We may modify or discontinue services at any time</li>
                        <li>
                          You agree not to misuse or attempt to harm our systems
                        </li>
                        <li>
                          You agree to respect the intellectual property rights
                          associated with the services
                        </li>
                      </ul>
                    </div>

                    <div className="terms-section mb-4">
                      <h5 className="fw-bold">
                        <FaBalanceScale className="me-2" />
                        4. Professional Conduct
                      </h5>
                      <ul className="ps-4">
                        <li>
                          As a dental professional or student, you agree to
                          maintain professional standards
                        </li>
                        <li>
                          You will use the platform in accordance with dental
                          practice guidelines
                        </li>
                        <li>
                          Information shared on the platform should comply with
                          patient confidentiality requirements
                        </li>
                      </ul>
                    </div>

                    <div className="terms-section mb-4">
                      <h5 className="fw-bold">
                        <FaBan className="me-2" />
                        5. Termination
                      </h5>
                      <ul className="ps-4">
                        <li>
                          We reserve the right to suspend or terminate accounts
                          that violate our terms
                        </li>
                        <li>You may request account termination at any time</li>
                        <li>Upon termination, certain obligations may survive</li>
                      </ul>
                    </div>

                    <Alert
                      variant="info"
                      className="d-flex align-items-center mb-0"
                    >
                      <FaInfoCircle className="me-2" size={18} />
                      <div>
                        <strong>Note:</strong> These terms may be updated
                        periodically. By continuing to use NUSmilePH services, you
                        agree to abide by the most current version of these Terms
                        of Service.
                      </div>
                    </Alert>
                  </div>
                </Card.Body>

                <Card.Footer className="d-flex justify-content-between bg-light py-3">
                  <Button
                    variant="outline-danger"
                    className="d-flex align-items-center"
                    onClick={declineTerms}
                    disabled={loading}
                  >
                    <FaTimes className="me-2" />
                    Decline Terms
                  </Button>

                  <Button
                    variant="success"
                    className="d-flex align-items-center"
                    onClick={acceptTerms}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Accept Terms
                      </>
                    )}
                  </Button>
                </Card.Footer>
              </Card>

              <div className="mt-3 text-center">
                <Button
                  variant="link"
                  className="text-muted d-inline-flex align-items-center"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="me-2" />
                  Return to previous page
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      )}

      {/* Password Change Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => {}} // Prevent closing with escape/clicking outside
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title className="d-flex align-items-center">
            <FaKey className="me-2 text-primary" />
            Change Your Password
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            <Alert variant="info" className="d-flex align-items-start">
              <FaInfoCircle className="me-2 mt-1" />
              <div>
                <strong>Welcome!</strong> We recommend changing your temporary
                password for better security. You can skip this step if you
                prefer.
              </div>
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter your current password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Password must be at least 6 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={skipPasswordChange}
              disabled={passwordChangeLoading}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={passwordChangeLoading}
            >
              {passwordChangeLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        show={showOTP}
        onHide={() => {}}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title className="d-flex align-items-center">
            <FaLock className="me-2 text-primary" />
            Enter Verification Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-4">
            Please enter the verification code sent to your email address:{" "}
            <strong>{userData.email}</strong>
          </p>

          <div className="d-flex justify-content-center mb-3">
            <OTPInput
              length={6}
              onComplete={handleOTPSubmit}
              disabled={otpLoading}
            />
          </div>

          {otpLoading && (
            <div className="text-center mt-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Verifying code...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={skipOTP}
            disabled={otpLoading}
          >
            Skip & Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TermsAndAgreement;