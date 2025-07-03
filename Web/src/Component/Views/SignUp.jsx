import React, { useReducer, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Card,
  Button,
  Container,
  InputGroup,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { App } from "antd";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
} from "@mui/material";
import axios from "axios";
import { faker, SimpleFaker } from "@faker-js/faker";
import { debounce } from 'lodash';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styles/SignUp.css";
import Header from "../Custom Hooks/Header";
import Footer from "../Custom Hooks/Footer";
import TitleHead from "../Custom Hooks/TitleHead";
import { signUpReducer, INITIAL_STATE } from "../Reducers/SignUpReducer";
import { format } from "date-fns";
import API_ENDPOINTS from "../../config/api";

const SignUp = () => {
  TitleHead("Sign Up - NUSmilePH");
  const [state, dispatch] = useReducer(signUpReducer, INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [showActivationModal, setShowActivationModal] = useState(true);
  const [activationCode, setActivationCode] = useState("");
  const [isActivationVerified, setIsActivationVerified] = useState(false);
  const [verifyingActivation, setVerifyingActivation] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [activationTouched, setActivationTouched] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touched, setTouched] = useState({});
  const [validating, setValidating] = useState(false);

  const navigate = useNavigate();
  const { message, modal, notification } = App.useApp();
  const messageAPI = message;
  const customInputs = new SimpleFaker();

  const steps = [
    "Activation",
    "Personal Info",
    "Contact & Emergency",
    "Account Setup",
  ];

// Remove or modify this useEffect to prevent automatic scrolling/focusing
useEffect(() => {
  // Only scroll to first error when user tries to submit or navigate steps
  // Don't auto-focus during typing
  if (Object.keys(validationErrors).length > 0) {
    const firstErrorField = Object.keys(validationErrors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    
    if (errorElement && document.activeElement !== errorElement) {
      // Only scroll, don't focus automatically
      setTimeout(() => {
        errorElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "center",
          inline: "nearest"
        });
        // Remove the automatic focus
        // errorElement.focus();
      }, 100);
    }
  }
}, [validationErrors]);

  // Add this computed value to avoid calling validateOTP() in render
  const isOtpValid = useMemo(() => {
    const otpRegex = /^\d{6}$/;
    return state.otp && otpRegex.test(state.otp);
  }, [state.otp]);

  // Create a debounced validation function
  const debouncedValidate = useMemo(
    () =>
      debounce((name, value) => {
        validateField(name, value);
      }, 300),
    []
  );

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(state.password);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 50) return "Medium";
    return "Weak";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 80) return "success";
    if (passwordStrength >= 50) return "warning";
    return "danger";
  };

  // Field validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'surname':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email is invalid';
        }
        break;
      case 'idNumber':
        if (!value.trim()) {
          error = 'ID number is required';
        } else if (!/^\d+$/.test(value)) {
          error = 'ID number must contain only digits';
        }
        break;
      case 'contact_no':
        if (!value.trim()) {
          error = 'Contact number is required';
        } else if (!/^09\d{9}$/.test(value)) {
          error = 'Must be a valid Philippine mobile number (09XXXXXXXXX)';
        } else if (!/^\d+$/.test(value)) {
          error = 'Contact number must contain only digits';
        }
        break;
      case 'emergency_contact_no':
        if (!value.trim()) {
          error = 'Emergency contact number is required';
        } else if (!/^09\d{9}$/.test(value)) {
          error = 'Must be a valid Philippine mobile number (09XXXXXXXXX)';
        } else if (!/^\d+$/.test(value)) {
          error = 'Emergency contact number must contain only digits';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = 'Password must contain at least one special character';
        }

        // Check confirm password match if it exists
        if (state.confirmPass && value !== state.confirmPass) {
          setValidationErrors(prev => ({
            ...prev,
            confirmPass: 'Passwords do not match'
          }));
        } else if (state.confirmPass) {
          setValidationErrors(prev => ({
            ...prev,
            confirmPass: undefined
          }));
        }
        break;
      case 'confirmPass':
        if (!value) {
          error = 'Please confirm your password';
        } else if (state.password && value !== state.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'yearLevel':
        if (!value) error = 'Please select your year level';
        break;
      case 'gender':
        if (!value) error = 'Please select your gender';
        break;
      case 'program':
        if (!value.trim()) error = 'Program is required';
        break;
      case 'permanent_address':
        if (!value.trim()) error = 'Permanent address is required';
        break;
      case 'emergency_person':
        if (!value.trim()) error = 'Emergency contact person is required';
        break;
      case 'role':
        if (!value) error = 'Please select your role';
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));

    return !error;
  };

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = [
      "firstName",
      "surname",
      "email",
      "idNumber",
      "yearLevel",
      "dob",
      "gender",
      "department",
      "program",
      "contact_no",
      "permanent_address",
      "emergency_person",
      "emergency_contact_no",
      "password",
      "confirmPass",
      "role",
    ];

    const filledFields = requiredFields.filter(
      (field) => state[field] && state[field].toString().trim() !== ""
    );
    const progress = (filledFields.length / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [state]);

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

  // Verify activation code
  const handleActivationSubmit = async () => {
    if (!activationCode.trim()) {
      setActivationError("Activation code is required to proceed");
      return;
    }

    if (activationCode.trim().length !== 6) {
      setActivationError("Activation code must be 6 digits");
      return;
    }

    try {
      setVerifyingActivation(true);
      setActivationError("");

      const response = await axios.post(
        `${API_ENDPOINTS.VERIFY_ACTIVATION_CODE}`,
        {
          activationCode: activationCode.trim(),
        }
      );

      if (response.data.data) {
        const { email, role } = response.data.data;

        // Pre-fill form with verified data
        dispatch({
          type: "HANDLE_INPUT",
          payload: { name: "email", value: email },
        });
        dispatch({
          type: "HANDLE_INPUT",
          payload: { name: "role", value: role },
        });
        dispatch({
          type: "HANDLE_INPUT",
          payload: { name: "activationCode", value: activationCode.trim() },
        });

        setIsActivationVerified(true);
        setShowActivationModal(false);
        setCurrentStep(1);

        messageAPI.success(`Activation verified! Welcome ${role}`);
      }
    } catch (error) {
      console.error("Activation verification error:", error);
      setActivationError(
        error.response?.data?.message ||
        "Invalid or expired activation code. Please check and try again."
      );
    } finally {
      setVerifyingActivation(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleOpenTerms = (e) => {
    e.preventDefault();
    // You can implement terms modal or navigation here
    console.log("Opening terms of service");
  };

  const generateFakeUser = (e) => {
    e.preventDefault();
    if (!isActivationVerified) {
      messageAPI.warning("Please verify your activation code first");
      return;
    }

    const generatedPass = faker.internet.password({
      length: 9,
      pattern: /[a-z, !@#$%^&*(), A-Z, 0-9, ]/,
    });
    const generatedDate = format(
      faker.date.birthdate({ min: 18, max: 25, mode: "age" }),
      "yyyy-MM-dd"
    );
    const fakeUser = {
      firstName: faker.person.firstName(),
      surname: faker.person.lastName(),
      idNumber: faker.string.numeric(10),
      yearLevel: customInputs.helpers.arrayElement([
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
      ]),
      dob: generatedDate,
      gender: customInputs.helpers.arrayElement(["Male", "Female", "Other"]),
      department: "College of Dentistry",
      program: customInputs.helpers.arrayElement([
        "Information Technology",
        "Dentistry",
        "Engineering",
        "Business Administration",
      ]),
      contact_no: faker.phone.number("09#########"),
      permanent_address: faker.location.streetAddress(true),
      emergency_person: faker.person.fullName(),
      emergency_contact_no: faker.phone.number("09#########"),
      emergency_address: faker.location.streetAddress(true),
      password: generatedPass,
      confirmPass: generatedPass,
    };

    dispatch({ type: "HANDLE_GENERATED_USER", payload: fakeUser });
    setValidationErrors({});  // Clear validation errors when fake data is generated
    setTouched({}); // Reset touched state for all fields
    messageAPI.success("Fake data generated successfully!");
  };

  const handleChange = (e) => {
    if (!isActivationVerified && e.target.name !== "activationCode") {
      return;
    }

    const { name, value } = e.target;

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Update the form state
    dispatch({ type: "HANDLE_INPUT", payload: e.target });

    // Debounce validation while typing
    debouncedValidate(name, value);

    // Immediate validation for certain fields like password match
    if (name === 'password' && state.confirmPass) {
      validateField('confirmPass', state.confirmPass);
    }
  };

  // Add a new function for handling blur events
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  // Validation when Next button is clicked
  const validateStepBeforeNext = () => {
    const newErrors = {};
    let isValid = true;

    // Validate based on current step
    switch (currentStep) {
      case 1:
        // Personal Information step
        if (!state.firstName) {
          newErrors.firstName = "First name is required";
          isValid = false;
        }
        
        if (!state.surname) {
          newErrors.surname = "Last name is required";
          isValid = false;
        }
        
        if (!state.idNumber) {
          newErrors.idNumber = "ID number is required";
          isValid = false;
        } else if (!/^\d+$/.test(state.idNumber)) {
          newErrors.idNumber = "ID number must contain only digits";
          isValid = false;
        }
        
        if (!state.email) {
          newErrors.email = "Email is required";
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(state.email)) {
          newErrors.email = "Email is invalid";
          isValid = false;
        }
        
        if (!state.yearLevel) {
          newErrors.yearLevel = "Please select your year level";
          isValid = false;
        }
        
        if (!state.dob) {
          newErrors.dob = "Date of birth is required";
          isValid = false;
        }
        
        if (!state.gender) {
          newErrors.gender = "Please select your gender";
          isValid = false;
        }
        
        if (!state.program) {
          newErrors.program = "Program is required";
          isValid = false;
        }
        break;

      case 2:
        // Contact & Emergency step
        if (!state.contact_no) {
          newErrors.contact_no = "Contact number is required";
          isValid = false;
        } else if (!/^09\d{9}$/.test(state.contact_no)) {
          newErrors.contact_no = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          isValid = false;
        }

        if (!state.permanent_address) {
          newErrors.permanent_address = "Permanent address is required";
          isValid = false;
        }

        if (!state.emergency_person) {
          newErrors.emergency_person = "Emergency contact person is required";
          isValid = false;
        }

        if (!state.emergency_contact_no) {
          newErrors.emergency_contact_no = "Emergency contact number is required";
          isValid = false;
        } else if (!/^09\d{9}$/.test(state.emergency_contact_no)) {
          newErrors.emergency_contact_no = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          isValid = false;
        }
        break;

      case 3:
        // Account Setup step
        if (!state.password) {
          newErrors.password = "Password is required";
          isValid = false;
        } else if (state.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters long";
          isValid = false;
        } else if (!/[A-Z]/.test(state.password)) {
          newErrors.password = "Password must contain at least one uppercase letter";
          isValid = false;
        } else if (!/[a-z]/.test(state.password)) {
          newErrors.password = "Password must contain at least one lowercase letter";
          isValid = false;
        } else if (!/[0-9]/.test(state.password)) {
          newErrors.password = "Password must contain at least one number";
          isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(state.password)) {
          newErrors.password = "Password must contain at least one special character";
          isValid = false;
        }

        if (!state.confirmPass) {
          newErrors.confirmPass = "Please confirm your password";
          isValid = false;
        } else if (state.password !== state.confirmPass) {
          newErrors.confirmPass = "Passwords do not match";
          isValid = false;
        }

        if (!state.role) {
          newErrors.role = "Please select your role";
          isValid = false;
        }

        // Terms agreement validation
        if (!agreedToTerms) {
          newErrors.terms = "You must agree to the terms of service";
          isValid = false;
        }
        break;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    // Mark all fields in the current step as touched
    let fieldsToTouch = {};
    
    // Determine which fields to mark as touched based on current step
    switch (currentStep) {
      case 1:
        // Personal Info step
        fieldsToTouch = {
          firstName: true,
          surname: true,
          email: true,
          idNumber: true,
          yearLevel: true,
          dob: true, 
          gender: true,
          program: true
        };
        break;
      case 2:
        // Contact & Emergency step
        fieldsToTouch = {
          contact_no: true,
          permanent_address: true,
          emergency_person: true,
          emergency_contact_no: true
        };
        break;
      case 3:
        // Account Setup step
        fieldsToTouch = {
          password: true, 
          confirmPass: true,
          role: true
        };
        break;
    }
    
    // Update touched state for all fields in current step
    setTouched(prev => ({
      ...prev,
      ...fieldsToTouch
    }));
    
    // Validate fields before proceeding to next step
    if (validateStepBeforeNext()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      messageAPI.error("Please fill in all required fields correctly");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          state.firstName &&
          state.surname &&
          state.email &&
          state.dob &&
          state.gender
        );
      case 2:
        return (
          state.contact_no &&
          state.permanent_address &&
          state.emergency_person &&
          state.emergency_contact_no
        );
      case 3:
        return (
          state.password &&
          state.confirmPass &&
          state.password === state.confirmPass &&
          state.role &&
          agreedToTerms
        );
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isActivationVerified) {
      messageAPI.error("Please verify your activation code first");
      return;
    }

    // Final validation before submission
    if (!validateStepBeforeNext()) {
      messageAPI.error("Please fix the errors before submitting");
      return;
    }

    const {
      showPassword,
      showConfirmPass,
      otp,
      modalOpen,
      confirmPass,
      ...rest
    } = state;

    // Define allowed fields that the server expects
    const allowedFields = [
      "firstName",
      "surname",
      "email",
      "idNumber",
      "yearLevel",
      "dob",
      "gender",
      "department",
      "program",
      "contact_no",
      "permanent_address",
      "emergency_person",
      "emergency_contact_no",
      "emergency_address",
      "password",
      "role",
      "activationCode",
      "profile",
    ];

    const formData = new FormData();

    // Only append allowed fields
    Object.keys(rest).forEach((key) => {
      if (allowedFields.includes(key)) {
        // Handle file uploads properly
        if (key === "profile" && rest[key]) {
          formData.append(key, rest[key]);
        } else if (
          rest[key] !== null &&
          rest[key] !== undefined &&
          rest[key] !== ""
        ) {
          // Only append non-empty values
          formData.append(key, rest[key]);
        }
      }
    });

    try {
      const res = await axios.post(
        `${API_ENDPOINTS.SIGNUP}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      messageAPI.success("Registration successful! Check your email for OTP");
      dispatch({ type: "HANDLE_MODAL", payload: true });
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      messageAPI.error(err.response?.data?.message || "Registration failed");
    }
  };

  const validateOTP = () => {
    const otpRegex = /^\d{6}$/;

    if (!state.otp) {
      setOtpError("OTP is required");
      return false;
    } else if (!otpRegex.test(state.otp)) {
      setOtpError("OTP must be 6 digits");
      return false;
    } else {
      setOtpError("");
      return true;
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const res = await axios.post(`${API_ENDPOINTS.SIGNUP}`, {
        email: state.email,
      });
      messageAPI.success("OTP resent successfully!");
      setResendCooldown(60);
    } catch (err) {
      console.log(err);
      messageAPI.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setOtpTouched(true);

    if (!validateOTP()) {
      return;
    }

    setOtpLoading(true);

    try {
      const { email, otp, profile } = state;
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otp);
      if (profile) {
        formData.append("profile", profile);
      }

      const res = await axios.post(
        `${API_ENDPOINTS.VERIFY_OTP_SIGNUP}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      messageAPI.success("Account verified successfully!");
      navigate("/login");
    } catch (err) {
      console.log(err);
      messageAPI.error(
        err.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-user me-2"></i>
                <h5 className="mb-0">Personal Information</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {isActivationVerified && (
                <Alert variant="success" className="mb-4">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Activation verified!</strong> Welcome {state.role}
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>First Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={state.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your first name"
                      isInvalid={touched.firstName && !!validationErrors.firstName}
                    />
                    {touched.firstName && validationErrors.firstName && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.firstName}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>Last Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="surname"
                      value={state.surname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your last name"
                      isInvalid={touched.surname && !!validationErrors.surname}
                    />
                    {touched.surname && validationErrors.surname && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.surname}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-envelope me-1"></i>Email *
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={state.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={isActivationVerified}
                      className="modern-input"
                      placeholder="your.email@example.com"
                      isInvalid={touched.email && !!validationErrors.email}
                    />
                    {touched.email && validationErrors.email && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-id-card me-1"></i>Student/Employee ID
                      *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="idNumber"
                      value={state.idNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your ID number"
                      isInvalid={touched.idNumber && !!validationErrors.idNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {touched.idNumber && validationErrors.idNumber && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.idNumber}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-graduation-cap me-1"></i>Year Level *
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="yearLevel"
                      value={state.yearLevel}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input form-select-lg" // Added form-select-lg for larger size
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.yearLevel && !!validationErrors.yearLevel}
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </Form.Control>
                    {touched.yearLevel && validationErrors.yearLevel && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.yearLevel}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar me-1"></i>Date of Birth *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={state.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      isInvalid={touched.dob && !!validationErrors.dob}
                    />
                    {touched.dob && validationErrors.dob && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.dob}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-venus-mars me-1"></i>Gender *
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="gender"
                      value={state.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input form-select-lg" // Added form-select-lg for larger size
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.gender && !!validationErrors.gender}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </Form.Control>
                    {touched.gender && validationErrors.gender && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.gender}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-building me-1"></i>Department *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={state.department || "College of Dentistry"}
                      onChange={handleChange}
                      required
                      disabled
                      className="modern-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-book me-1"></i>Program *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="program"
                      value={state.program}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your program"
                      isInvalid={touched.program && !!validationErrors.program}
                    />
                    {touched.program && validationErrors.program && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.program}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 2:
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-info text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-phone me-2"></i>
                <h5 className="mb-0">Contact & Emergency Information</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <h6 className="mb-3" style={{ color: "#000080" }}>
                <i className="fas fa-user-circle me-2"></i>Your Contact
                Information
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-phone me-1"></i>Contact Number *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="contact_no"
                      value={state.contact_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="09XXXXXXXXX"
                      isInvalid={touched.contact_no && !!validationErrors.contact_no}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {touched.contact_no && validationErrors.contact_no && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.contact_no}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-map-marker-alt me-1"></i>Permanent
                      Address *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="permanent_address"
                      value={state.permanent_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your complete address"
                      isInvalid={touched.permanent_address && !!validationErrors.permanent_address}
                    />
                    {touched.permanent_address && validationErrors.permanent_address && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.permanent_address}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />

              <h6 className="mb-3" style={{ color: "#000080" }}>
                <i className="fas fa-exclamation-triangle me-2"></i>Emergency
                Contact Information
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user-friends me-1"></i>Emergency
                      Contact Person *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="emergency_person"
                      value={state.emergency_person}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Full name of emergency contact"
                      isInvalid={touched.emergency_person && !!validationErrors.emergency_person}
                    />
                    {touched.emergency_person && validationErrors.emergency_person && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.emergency_person}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-phone-alt me-1"></i>Emergency Contact
                      Number *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="emergency_contact_no"
                      value={state.emergency_contact_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="09XXXXXXXXX"
                      isInvalid={touched.emergency_contact_no && !!validationErrors.emergency_contact_no}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {touched.emergency_contact_no && validationErrors.emergency_contact_no && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.emergency_contact_no}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-home me-1"></i>Emergency Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="emergency_address"
                      value={state.emergency_address}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Emergency contact address"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 3:
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-success text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-lock me-2"></i>
                <h5 className="mb-0">Account Setup</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center justify-content-between">
                      <span>
                        <i className="fas fa-key me-1 text-primary"></i>Password
                        *
                      </span>
                      <small className="text-muted">Min 8 characters</small>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={state.showPassword ? "text" : "password"}
                        name="password"
                        value={state.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className="modern-input"
                        placeholder="Create a strong password"
                        style={{
                          paddingRight: "50px",
                          fontSize: "1rem",
                        }}
                        isInvalid={touched.password && !!validationErrors.password}
                      />
                      <button
                        type="button"
                        className="btn p-0 border-0"
                        onClick={() =>
                          dispatch({
                            type: "HANDLE_SHOW_PASSWORD",
                            payload: { value: !state.showPassword },
                          })
                        }
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #dee2e6",
                          zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#e9ecef";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#f8f9fa";
                        }}
                      >
                        <i
                          className={
                            state.showPassword
                              ? "fas fa-eye-slash"
                              : "fas fa-eye"
                          }
                          style={{
                            fontSize: "1rem",
                            color: state.showPassword ? "#6c757d" : "#007bff",
                            pointerEvents: "none",
                          }}
                        ></i>
                      </button>
                    </div>
                    {touched.password && validationErrors.password && (
                      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                        {validationErrors.password}
                      </Form.Control.Feedback>
                    )}

                    {/* Enhanced Password Strength Indicator */}
                    {state.password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">
                            Password strength:
                          </small>
                          <small
                            className={`fw-bold text-${getPasswordStrengthColor()}`}
                          >
                            {getPasswordStrengthLabel()}
                          </small>
                        </div>
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className={`progress-bar bg-${getPasswordStrengthColor()}`}
                            style={{
                              width: `${passwordStrength}%`,
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
                        
                        {/* Password requirements checklist */}
                        <div className="mt-2 small">
                          <ul className="password-req-list ps-3">
                            <li className={state.password.length >= 8 ? "text-success" : "text-muted"}>
                              <i className={`fas ${state.password.length >= 8 ? "fa-check" : "fa-times"} me-1`}></i>
                              At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(state.password) ? "text-success" : "text-muted"}>
                              <i className={`fas ${/[A-Z]/.test(state.password) ? "fa-check" : "fa-times"} me-1`}></i>
                              Uppercase letter
                            </li>
                            <li className={/[a-z]/.test(state.password) ? "text-success" : "text-muted"}>
                              <i className={`fas ${/[a-z]/.test(state.password) ? "fa-check" : "fa-times"} me-1`}></i>
                              Lowercase letter
                            </li>
                            <li className={/[0-9]/.test(state.password) ? "text-success" : "text-muted"}>
                              <i className={`fas ${/[0-9]/.test(state.password) ? "fa-check" : "fa-times"} me-1`}></i>
                              Number
                            </li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(state.password) ? "text-success" : "text-muted"}>
                              <i className={`fas ${/[!@#$%^&*(),.?":{}|<>]/.test(state.password) ? "fa-check" : "fa-times"} me-1`}></i>
                              Special character
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center justify-content-between">
                      <span>
                        <i className="fas fa-check-double me-1 text-primary"></i>
                        Confirm Password *
                      </span>
                      {state.confirmPass &&
                        state.password === state.confirmPass && (
                          <small className="text-success">
                            <i className="fas fa-check-circle me-1"></i>Matches
                          </small>
                        )}
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={state.showConfirmPass ? "text" : "password"}
                        name="confirmPass"
                        value={state.confirmPass}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`modern-input`}
                        placeholder="Confirm your password"
                        style={{
                          paddingRight: "50px",
                          fontSize: "1rem",
                        }}
                        isInvalid={touched.confirmPass && !!validationErrors.confirmPass}
                        isValid={touched.confirmPass && state.confirmPass && state.password === state.confirmPass}
                      />
                      <button
                        type="button"
                        className="btn p-0 border-0"
                        onClick={() =>
                          dispatch({
                            type: "HANDLE_SHOW_CONFIRM_PASSWORD",
                            payload: { value: !state.showConfirmPass },
                          })
                        }
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 10,
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #dee2e6",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#e9ecef";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#f8f9fa";
                        }}
                      >
                        <i
                          className={
                            state.showConfirmPass
                              ? "fas fa-eye-slash"
                              : "fas fa-eye"
                          }
                          style={{
                            fontSize: "1rem",
                            color: state.showConfirmPass
                              ? "#6c757d"
                              : "#007bff",
                            pointerEvents: "none",
                          }}
                        ></i>
                      </button>
                    </div>
                    {touched.confirmPass && validationErrors.confirmPass && (
                      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                        {validationErrors.confirmPass}
                      </Form.Control.Feedback>
                    )}

                    {/* Match Status Feedback */}
                    {state.confirmPass && !validationErrors.confirmPass && (
                      <div className="mt-2">
                        {state.password === state.confirmPass ? (
                          <div className="d-flex align-items-center text-success">
                            <i className="fas fa-check-circle me-2"></i>
                            <small className="fw-medium">
                              Passwords match perfectly!
                            </small>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center text-danger">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            <small className="fw-medium">
                              Passwords do not match
                            </small>
                          </div>
                        )}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user-tag me-1"></i>Role *
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="role"
                      value={state.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={isActivationVerified}
                      className="modern-input form-select-lg" // Added form-select-lg for larger size
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.role && !!validationErrors.role}
                    >
                      <option value="">Select Role</option>
                      <option value="Clinician">👨‍⚕️ Clinician</option>
                      <option value="Clinical Instructor">
                        👩‍🏫 Clinical Instructor
                      </option>
                    </Form.Control>
                    {touched.role && validationErrors.role && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.role}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {/* Terms of Service checkbox */}
                  <Form.Group className="mb-4 mt-4">
                    <Form.Check
                      type="checkbox"
                      id="terms-checkbox"
                      label={
                        <span>I agree to the <a href="#" onClick={handleOpenTerms}>Terms of Service</a></span>
                      }
                      checked={agreedToTerms}
                      onChange={() => {
                        setAgreedToTerms(!agreedToTerms);
                        if (validationErrors.terms) {
                          setValidationErrors(prev => ({ ...prev, terms: undefined }));
                        }
                      }}
                      isInvalid={!!validationErrors.terms}
                    />
                    {validationErrors.terms && (
                      <div className="text-danger small mt-1">
                        {validationErrors.terms}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-camera me-1"></i>Profile Picture
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="profile"
                      accept="image/*"
                      onChange={handleChange}
                      className="modern-input"
                    />
                    {state.profile && (
                      <div className="mt-3 text-center">
                        <img
                          src={URL.createObjectURL(state.profile)}
                          alt="Profile Preview"
                          className="img-thumbnail"
                          style={{
                            maxWidth: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                        <div className="mt-2 text-muted small">
                          {state.profile.name}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="main-container">
      <Header />
      <Container className="py-5">
        <Dialog
          open={showActivationModal}
          onClose={() => false}
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
              backgroundColor: "white",
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
                className="fas fa-shield-alt"
                style={{ marginRight: "8px", fontSize: "1.2rem" }}
              ></i>
              Account Activation Required
            </div>
          </DialogTitle>

          <DialogContent style={{ padding: "32px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <i
                className="fas fa-key"
                style={{
                  fontSize: "3rem",
                  color: "#28a745",
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
                Enter Your Activation Code
              </h5>
              <p
                style={{
                  color: "#6c757d",
                  margin: 0,
                  fontSize: "0.95rem",
                }}
              >
                Please enter the 6-digit activation code provided by your
                Clinical Chair
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#555",
                  marginBottom: "8px",
                  display: "block",
                  textAlign: "center",
                }}
              >
                Activation Code
              </label>
              <TextField
                autoFocus
                required
                type="text"
                fullWidth
                variant="outlined"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setActivationTouched(true);
                  if (activationError) setActivationError("");
                }}
                error={activationTouched && !!activationError}
                helperText={activationTouched ? activationError : ""}
                placeholder="Enter 6-digit code"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "1.2rem",
                    letterSpacing: "0.5rem",
                    fontWeight: "600",
                  },
                }}
                disabled={verifyingActivation}
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
              <i
                className="fas fa-info-circle"
                style={{ marginRight: "8px" }}
              ></i>
              Don't have an activation code? Contact your Clinical Chair or
              Administrator.
            </div>
          </DialogContent>

          <DialogActions
            style={{
              padding: "16px 24px 24px",
              gap: "12px",
              justifyContent: "space-between",
            }}
          >
            <MuiButton
              onClick={handleBackToLogin}
              disabled={verifyingActivation}
              style={{
                color: "#000080",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "8px",
                textTransform: "none",
              }}
              sx={{
                "&:hover:not(:disabled)": {
                  backgroundColor: "#000080 !important",
                  color: "white !important",
                },
                "&:disabled": {
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              }}
            >
              Back to Login
            </MuiButton>
            <MuiButton
              variant="contained"
              disabled={verifyingActivation || !activationCode.trim()}
              onClick={handleActivationSubmit}
              style={{
                backgroundColor: "#000080",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "8px",
                minWidth: "120px",
              }}
            >
              {verifyingActivation ? (
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
                  Verify Code
                </div>
              )}
            </MuiButton>
          </DialogActions>
        </Dialog>

        {/* Main Content */}
        {isActivationVerified && (
          <>
            {/* Progress Header */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="mb-0" style={{ color: "#000080" }}>
                    <i className="fas fa-user-plus me-2"></i>
                    Create Your Account
                  </h2>
                  <div className="text-end">
                    <div className="small text-muted">Form Progress</div>
                    <div className="d-flex align-items-center">
                      <ProgressBar
                        now={formProgress}
                        style={{ width: "100px", height: "8px" }}
                        className="me-2"
                      />
                      <small className="text-muted">
                        {Math.round(formProgress)}%
                      </small>
                    </div>
                  </div>
                </div>

                {/* Enhanced Step Indicator */}
                <div className="d-flex justify-content-between position-relative mb-4">
                  <div
                    className="position-absolute top-50 start-0 translate-middle-y w-100"
                    style={{
                      height: "2px",
                      backgroundColor: "#e9ecef",
                      zIndex: 1,
                    }}
                  ></div>
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="d-flex flex-column align-items-center position-relative"
                      style={{ zIndex: 2 }}
                    >
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${index <= currentStep ? "" : "bg-white border"
                          }`}
                        style={{
                          width: "50px",
                          height: "50px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          backgroundColor: index <= currentStep ? "#000080" : "",
                          color: index <= currentStep ? "#ffffff" : "#000080", // Active steps have white text, inactive have navy text
                        }}
                      >
                        {index < currentStep ? (
                          <i className="fas fa-check"></i>
                        ) : index === currentStep ? (
                          <i className="fas fa-edit"></i>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <small
                        className={`mt-2 text-center ${index <= currentStep ? "fw-bold" : "text-muted"
                          }`}
                        style={{
                          maxWidth: "80px",
                          color: index <= currentStep ? "#000080" : ""
                        }}
                      >
                        {step}
                      </small>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            {/* Form Content */}
            <Form onSubmit={handleSubmit} noValidate className="needs-validation">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="d-flex gap-2">
                        {currentStep > 1 && (
                          <Button
                            variant="outline-secondary"
                            onClick={handlePrevious}
                          >
                            <i className="fas fa-arrow-left me-2"></i>Previous
                          </Button>
                        )}
                        {currentStep < steps.length - 1 ? (
                          <Button
                            variant="primary"
                            onClick={handleNext}
                          >
                            Next<i className="fas fa-arrow-right ms-2"></i>
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            variant="success"
                            className="bg-gradient-success text-white"
                            disabled={!validateCurrentStep()}
                            size="lg"
                          >
                            <i className="fas fa-check me-2"></i>Create Account
                          </Button>
                        )}
                      </div>
                    </Col>
                    <Col md={6} className="text-end">
                      <Button
                        variant="outline-info"
                        onClick={generateFakeUser}
                        size="sm"
                      >
                        <i className="fas fa-magic me-2"></i>Generate Test Data
                      </Button>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <div className="text-center">
                    <p className="small mb-0">
                      Already have an account?
                      <Link
                        to="/login"
                        className="text-decoration-none ms-1 fw-bold"
                      >
                        Login here
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Form>
          </>
        )}
      </Container>

      {/* OTP Verification Modal */}
      <Dialog
        open={state.modalOpen}
        onClose={() =>
          !otpLoading && dispatch({ type: "HANDLE_MODAL", payload: false })
        }
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
              We've sent a verification code to <strong>{state.email}</strong>
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
              name="otp"
              type="text"
              fullWidth
              variant="outlined"
              value={state.otp}
              onChange={(e) => {
                handleChange(e);
                setOtpTouched(true);
                if (otpError) setOtpError("");
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
                    if (!(resendLoading || resendCooldown > 0 || otpLoading)) {
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
          <MuiButton
            onClick={() => dispatch({ type: "HANDLE_MODAL", payload: false })}
            variant="outlined"
            disabled={otpLoading}
            style={{
              color: "#00245A",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "2px solid #00245A",
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
          </MuiButton>
          <MuiButton
            type="submit"
            variant="contained"
            disabled={!isOtpValid || otpLoading}
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
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SignUp;