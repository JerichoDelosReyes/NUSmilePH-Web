import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import { UserContext } from "../Context/UserContext";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import TitleHead from "../Custom Hooks/TitleHead";
import { debounce } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";

const ProfileCompletion = () => {
  TitleHead("Complete Your Profile - NUSmilePH");

  const { user, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middlename: "",
    surname: "",
    prefix: "",
    dob: "",
    role: user?.role,
    idNumber: "",
    yearLevel: "",
    gender: "",
    marital_status: "",
    department: "College of Dentistry",
    program: "Doctor of Medicine in Dentistry",
    contact_no: "",
    permanent_address: "",
    emergency_person: "",
    emergency_contact_no: "",
    emergency_address: "",
    profile: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Terms of Service state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const steps = [
    "Personal Info",
    "Academic Info",
    "Contact Info",
    "Emergency Contact",
  ];

  // Get required fields based on user role
  const getRequiredFields = useCallback(() => {
    const baseFields = [
      "prefix",
      "dob",
      "gender",
      "marital_status",
      "contact_no",
      "permanent_address",
      "emergency_person",
      "emergency_contact_no",
    ];

    if (user?.role === "Clinician") {
      return [...baseFields];
    }

    return baseFields;
  }, [user?.role]);

  // Validate individual field
  const validateField = useCallback(
    (name, value) => {
      let error = "";

      switch (name) {
        case "prefix":
          if (!value?.trim()) error = "Please choose your prefix";
          break;

        case "marital_status":
          if (!value?.trim()) error = "Please choose your marital status";
          break;

        case "contact_no":
          if (!value?.trim()) {
            error = "Contact number is required";
          } else if (!/^09\d{9}$/.test(value)) {
            error = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          }
          break;

        case "emergency_contact_no":
          if (!value?.trim()) {
            error = "Emergency contact number is required";
          } else if (!/^09\d{9}$/.test(value)) {
            error = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          }
          break;

        case "dob":
          if (!value) {
            error = "Date of birth is required";
          } else {
            const today = new Date();
            const birthDate = new Date(value);
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 16 || age > 100) {
              error = "Please enter a valid date of birth";
            }
          }
          break;

        case "gender":
          if (!value) error = "Please select your gender";
          break;

        case "permanent_address":
          if (!value?.trim()) error = "Permanent address is required";
          break;

        case "emergency_person":
          if (!value?.trim()) {
            error = "Emergency contact person is required";
          } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = "Contact person should contain only letters";
          }
          break;
      }

      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));

      return !error;
    },
    [user?.role]
  );

  // Create a debounced validation function
  const debouncedValidate = useMemo(
    () =>
      debounce((name, value) => {
        validateField(name, value);
      }, 300),
    [validateField]
  );

  // Fetch user data on component mount
  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(API_ENDPOINTS.GET_USER_BY_ID(user.id), {
        withCredentials: true,
      });

      if (response.data.success || response.data) {
        // Handle different response structures
        const userData = response.data.users;

        // Helper function to clean "To be updated" values but keep data editable
        const cleanValue = (value) => {
          if (
            value === "To be updated" ||
            value === null ||
            value === undefined
          ) {
            return "";
          }
          return value;
        };

        setFormData((prev) => ({
          ...prev,
          firstName: cleanValue(userData.firstName),
          middlename: cleanValue(userData.middlename),
          surname: cleanValue(userData.surname),
          prefix: cleanValue(userData.prefix),
          idNumber: cleanValue(userData.idNumber),
          email: cleanValue(userData.email),
          dob:
            userData.dob && userData.dob !== "1900-01-01T00:00:00.000Z"
              ? userData.dob.split("T")[0]
              : "",
          gender: cleanValue(userData.gender),
          marital_status: cleanValue(userData.marital_status),
          yearLevel: cleanValue(userData.yearLevel),
          // Always set these fixed values regardless of what comes from API
          department: "College of Dentistry",
          program: "Doctor of Medicine in Dentistry",
          // Contact information
          contact_no: cleanValue(userData.contact_no),
          permanent_address: cleanValue(userData.permanent_address),
          emergency_person: cleanValue(userData.emergency_person),
          emergency_contact_no: cleanValue(userData.emergency_contact_no),
          emergency_address: cleanValue(userData.emergency_address),
        }));

        console.log("User data fetched successfully:", userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      console.log("Response data:", error.response?.data);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    // Calculate completion progress
    const requiredFields = getRequiredFields();
    const filledFields = requiredFields.filter(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
    const newProgress = (filledFields.length / requiredFields.length) * 100;
    setProgress(newProgress);
  }, [formData, getRequiredFields]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    // Special handling for terms checkbox
    if (name === "termsAccepted") {
      setTermsAccepted(checked);
      return;
    }

    // Skip change handling for read-only fields
    if (["firstName", "middlename", "surname", "idNumber", "yearLevel"].includes(name)) {
      return;
    }

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (name === "contact_no" || name === "emergency_contact_no") {
      // Only allow numeric input for phone numbers
      const numericValue = value.replace(/\D/g, "");
      const maxLength = 11;

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue.slice(0, maxLength),
      }));

      debouncedValidate(name, numericValue.slice(0, maxLength));
    } else if (name === "department" || name === "program") {
      // Do nothing for these fixed fields - they should not change
      return;
    } else if (name === "emergency_person") {
      // Only allow letters for emergency contact person
      const letterValue = value.replace(/[^a-zA-Z\s'-]/g, "");

      setFormData((prev) => ({
        ...prev,
        [name]: letterValue,
      }));

      debouncedValidate(name, letterValue);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      debouncedValidate(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Skip validation for read-only fields
    if (["firstName", "middlename", "surname", "idNumber", "yearLevel"].includes(name)) {
      return;
    }
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, value);
  };

  const validateStepBeforeNext = () => {
    const newErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 0: // Personal Info
        if (!formData.prefix) {
          newErrors.prefix = "Please choose your prefix";
          isValid = false;
        }
        if (!formData.dob) {
          newErrors.dob = "Date of birth is required";
          isValid = false;
        }
        if (!formData.gender) {
          newErrors.gender = "Please select your gender";
          isValid = false;
        }
        if (!formData.marital_status) {
          newErrors.marital_status = "Please choose your marital status";
          isValid = false;
        }
        break;

      case 1: // Academic Info
        // No validation needed for academic info as fields are read-only
        break;

      case 2: // Contact Info
        if (!formData.contact_no) {
          newErrors.contact_no = "Contact number is required";
          isValid = false;
        } else if (!/^09\d{9}$/.test(formData.contact_no)) {
          newErrors.contact_no = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          isValid = false;
        }
        if (!formData.permanent_address) {
          newErrors.permanent_address = "Permanent address is required";
          isValid = false;
        }
        break;

      case 3: // Emergency Contact
        if (!formData.emergency_person) {
          newErrors.emergency_person = "Emergency contact person is required";
          isValid = false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(formData.emergency_person)) {
          newErrors.emergency_person = "Contact person should contain only letters";
          isValid = false;
        }
        if (!formData.emergency_contact_no) {
          newErrors.emergency_contact_no = "Emergency contact number is required";
          isValid = false;
        } else if (!/^09\d{9}$/.test(formData.emergency_contact_no)) {
          newErrors.emergency_contact_no = "Must be a valid Philippine mobile number (09XXXXXXXXX)";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStepBeforeNext()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if terms are accepted
    if (!termsAccepted) {
      alert("You must accept the Terms of Service to proceed");
      return;
    }

    // Validate all required fields
    const requiredFields = getRequiredFields();
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      alert("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields except termsAccepted
      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== null &&
          formData[key] !== "" &&
          key !== "profile"
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Always ensure these fields have the correct fixed values
      formDataToSend.set("department", "College of Dentistry");
      formDataToSend.set("program", "Doctor of Medicine in Dentistry");

      // Append file if exists
      if (formData.profile) {
        formDataToSend.append("profile", formData.profile);
      }

      // Do NOT append termsAccepted to formDataToSend

      // Use POST method for updating user profile
      const response = await axios.post(
        API_ENDPOINTS.UPDATE_USER_BY_ID(user.id),
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update user context
        dispatch({
          type: "LOGIN",
          payload: {
            ...user,
            ...response.data.user,
            requiresProfileCompletion: false,
            status: response.data.activation?.activated ? "active" : "pending",
            department: "College of Dentistry",
            program: "Doctor of Medicine in Dentistry",
          },
        });

        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  // Handle Terms of Service modal
  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const declineTerms = () => {
    setTermsAccepted(false);
    setShowTermsModal(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-user me-2"></i>
                <h5 className="mb-0">Personal Information</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user-tag me-1"></i>Prefix *
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="modern-input form-select-lg"
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.prefix && !!errors.prefix}
                      required
                    >
                      <option value="">Select Prefix</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.prefix}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      readOnly
                      disabled
                      className="modern-input"
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <Form.Text className="text-muted">
                      Set by administrator (cannot be changed)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>Middle Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="middlename"
                      value={formData.middlename}
                      readOnly
                      disabled
                      className="modern-input"
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <Form.Text className="text-muted">
                      Set by administrator (cannot be changed)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="surname"
                      value={formData.surname}
                      readOnly
                      disabled
                      className="modern-input"
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <Form.Text className="text-muted">
                      Set by administrator (cannot be changed)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar me-1"></i>Date of Birth *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      isInvalid={touched.dob && !!errors.dob}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dob}
                    </Form.Control.Feedback>
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
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input form-select-lg"
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.gender && !!errors.gender}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.gender}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-heart me-1"></i>Marital Status *
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input form-select-lg"
                      style={{ height: "45px", fontSize: "1rem" }}
                      isInvalid={touched.marital_status && !!errors.marital_status}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.marital_status}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 1: // Academic Information
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-info text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-graduation-cap me-2"></i>
                <h5 className="mb-0">Academic Information</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-id-card me-1"></i>ID Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      readOnly
                      disabled
                      className="modern-input"
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <Form.Text className="text-muted">
                      Set by administrator (cannot be changed)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-building me-1"></i>Department
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value="College of Dentistry"
                      readOnly
                      disabled
                      className="modern-input"
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <Form.Text className="text-muted">
                      Department is fixed for all users
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {user?.role === "Clinician" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-graduation-cap me-1"></i>Year Level
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="yearLevel"
                        value={formData.yearLevel}
                        readOnly
                        disabled
                        className="modern-input"
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                      <Form.Text className="text-muted">
                        Set by administrator (cannot be changed)
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-book me-1"></i>Program
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="program"
                        value="Doctor of Medicine in Dentistry"
                        readOnly
                        disabled
                        className="modern-input"
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                      <Form.Text className="text-muted">
                        Program is fixed for all users
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        );

      case 2: // Contact Information
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-warning text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-phone me-2"></i>
                <h5 className="mb-0">Contact Information</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-phone me-1"></i>Contact Number *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="contact_no"
                      value={formData.contact_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="09XXXXXXXXX"
                      isInvalid={touched.contact_no && !!errors.contact_no}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contact_no}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Must be a valid Philippine mobile number starting with 09
                    </Form.Text>
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
                      value={formData.permanent_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Enter your complete address"
                      isInvalid={
                        touched.permanent_address && !!errors.permanent_address
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.permanent_address}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );

      case 3: // Emergency Contact
        return (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-gradient-danger text-white">
              <div className="d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <h5 className="mb-0">Emergency Contact</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
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
                      value={formData.emergency_person}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="Full name of emergency contact"
                      isInvalid={
                        touched.emergency_person && !!errors.emergency_person
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.emergency_person}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Only letters are allowed (e.g., John Doe)
                    </Form.Text>
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
                      value={formData.emergency_contact_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="modern-input"
                      placeholder="09XXXXXXXXX"
                      isInvalid={
                        touched.emergency_contact_no &&
                        !!errors.emergency_contact_no
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.emergency_contact_no}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Must be a valid Philippine mobile number starting with 09
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-home me-1"></i>Emergency Contact
                      Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="emergency_address"
                      value={formData.emergency_address}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Emergency contact address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Profile Picture */}
              <Row>
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
                    <Form.Text className="text-muted">
                      Upload a clear photo of yourself (JPG, PNG, max 5MB)
                    </Form.Text>
                  </Form.Group>
                </Col>

                {formData.profile && (
                  <Col md={6}>
                    <div className="text-center">
                      <img
                        src={URL.createObjectURL(formData.profile)}
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
                        {formData.profile.name}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
              
              {/* Terms of Service checkbox */}
              <Row className="mt-4">
                <Col md={12}>
                  <div className="border border-light rounded p-3 bg-light">
                    <Form.Group className="mb-0">
                      <Form.Check
                        type="checkbox"
                        name="termsAccepted"
                        id="termsAccepted"
                        checked={termsAccepted}
                        onChange={handleChange}
                        label={
                          <span>
                            I have read and agree to the {" "}
                            <a href="#" onClick={openTermsModal}>
                              Terms of Service
                            </a>
                          </span>
                        }
                        required
                      />
                    </Form.Group>
                  </div>
                  {!termsAccepted && currentStep === steps.length - 1 && (
                    <div className="text-danger small mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      You must accept the Terms of Service to proceed
                    </div>
                  )}
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
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px 0", // Add some padding for mobile
      }}
    >
      <Container
        className="w-100"
        style={{
          maxWidth: "1200px",
          margin: "0 auto", // Ensure center alignment
        }}
      >
        {/* Progress Header */}
        <Card
          className="mb-4 shadow-sm border-0 mx-auto"
          style={{ maxWidth: "100%" }}
        >
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0" style={{ color: "#000080" }}>
                <i className="fas fa-user-edit me-2"></i>
                Complete Your Profile
              </h2>
              <div className="text-end">
                <div className="small text-muted">Form Progress</div>
                <div className="d-flex align-items-center">
                  <ProgressBar
                    now={progress}
                    style={{ width: "120px", height: "8px" }}
                    className="me-2"
                  />
                  <small className="text-muted">{Math.round(progress)}%</small>
                </div>
              </div>
            </div>

            <Alert variant="info" className="mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Account Status:</strong> Your account is currently pending
              activation. Please complete all required fields below to activate
              your account.
            </Alert>

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
                    className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${
                      index <= currentStep ? "" : "bg-white border"
                    }`}
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      backgroundColor: index <= currentStep ? "#000080" : "",
                      color: index <= currentStep ? "#ffffff" : "#000080",
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
                    className={`mt-2 text-center ${
                      index <= currentStep ? "fw-bold" : "text-muted"
                    }`}
                    style={{
                      maxWidth: "80px",
                      color: index <= currentStep ? "#000080" : "",
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
        <Form
          onSubmit={handleSubmit}
          noValidate
          className="needs-validation mx-auto"
          style={{ maxWidth: "100%" }}
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Card
            className="shadow-sm border-0 mx-auto"
            style={{ maxWidth: "100%" }}
          >
            <Card.Body className="p-4">
              <Row className="justify-content-center">
                <Col md={8} lg={6} className="text-center">
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    {currentStep > 0 && (
                      <Button
                        variant="outline-secondary"
                        onClick={handlePrevious}
                        size="lg"
                        className="px-4"
                      >
                        <i className="fas fa-arrow-left me-2"></i>Previous
                      </Button>
                    )}
                    {currentStep < steps.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={handleNext}
                        size="lg"
                        className="px-4"
                      >
                        Next<i className="fas fa-arrow-right ms-2"></i>
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="success"
                        className="bg-gradient-success text-white px-4"
                        disabled={loading || progress < 85 || !termsAccepted}
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Updating Profile...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Complete Profile
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-check-circle text-success me-2"></i>
              Profile Updated Successfully!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your profile has been updated successfully.</p>
            <Alert variant="info">
              Your account will be reviewed and activated shortly. You will
              receive an email notification once your account is activated.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleModalClose}>
              Continue to Dashboard
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Terms of Service Modal */}
        <Modal show={showTermsModal} onHide={closeTermsModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-file-contract me-2"></i>
              Terms of Service
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <h5 className="mb-3">Welcome to NUSmilePH Connect!</h5>
            <p className="mb-4">By using our services, you agree to these terms:</p>
            
            <div className="mb-4">
              <h6 className="fw-bold"><i className="fas fa-user-shield me-2"></i>1. User Responsibilities</h6>
              <ul className="ps-4">
                <li>You must provide accurate information during registration</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You agree to use the service in compliance with all applicable laws</li>
                <li>You will not share your account credentials with any third party</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h6 className="fw-bold"><i className="fas fa-lock me-2"></i>2. Privacy and Data Protection</h6>
              <ul className="ps-4">
                <li>We collect and process your data as described in our Privacy Policy</li>
                <li>We implement security measures to protect your information</li>
                <li>You have rights regarding your personal data</li>
                <li>Your dental records and patient information will be kept confidential according to applicable healthcare regulations</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h6 className="fw-bold"><i className="fas fa-cog me-2"></i>3. Service Usage</h6>
              <ul className="ps-4">
                <li>The service is provided "as is" without warranties</li>
                <li>We may modify or discontinue services at any time</li>
                <li>You agree not to misuse or attempt to harm our systems</li>
                <li>You agree to respect the intellectual property rights associated with the services</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h6 className="fw-bold"><i className="fas fa-balance-scale me-2"></i>4. Professional Conduct</h6>
              <ul className="ps-4">
                <li>As a dental professional or student, you agree to maintain professional standards</li>
                <li>You will use the platform in accordance with dental practice guidelines</li>
                <li>Information shared on the platform should comply with patient confidentiality requirements</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h6 className="fw-bold"><i className="fas fa-ban me-2"></i>5. Termination</h6>
              <ul className="ps-4">
                <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
                <li>You may request account termination at any time</li>
                <li>Upon termination, certain obligations may survive</li>
              </ul>
            </div>
            
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Note:</strong> These terms may be updated periodically. By continuing to use NUSmilePH services, you agree to abide by the most current version of these Terms of Service.
            </div>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={declineTerms}>
              <i className="fas fa-times me-2"></i>
              Decline
            </Button>
            <Button variant="primary" onClick={acceptTerms}>
              <i className="fas fa-check me-2"></i>
              Accept
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ProfileCompletion;