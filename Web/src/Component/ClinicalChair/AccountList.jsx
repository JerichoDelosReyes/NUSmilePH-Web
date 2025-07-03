import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  Dropdown,
  Modal,
  Badge,
  Alert,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import { Table, message, Spin, Tooltip } from "antd";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiSearch,
  FiCheck,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiUserPlus,
  FiUsers,
  FiUser,
  FiMail,
  FiFilter,
  FiDownload,
  FiArrowLeft,
  FiUpload,
  FiFile,
  FiCalendar,
  FiPhone,
  FiClock,
  FiTrash2,
  FiAlertCircle,
  FiChevronDown,
  FiArrowRight,
  FiInfo,
  FiArchive,
} from "react-icons/fi";
import {
  BsPersonCheck,
  BsPersonX,
  BsPersonExclamation,
  BsFileEarmarkSpreadsheet,
} from "react-icons/bs";
import { UserContext } from "../Context/UserContext";
import axios from "axios";
import "../Views/Styles/AccountList.css";
import { useNavigate } from "react-router";
import { API_URL } from "../../config/api";
import { exportToCSV } from "./utils/csvExport";
import TitleHead from "../Custom Hooks/TitleHead";

const AccountList = () => {
  TitleHead("User Management");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showArchived, setShowArchived] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const isClinicalChair = user?.role === "Clinical Chair";

  // Add this state at the top of your component with other state variables
  const [csvRole, setCsvRole] = useState("Clinician");
  const [singleProgress, setSingleProgress] = useState(0);

  // Check if user is a clinical instructor (for conditional alert)
  const isClinicalInstructor = user?.role === "Clinical Instructor";

  // Enhanced create user modal state with all required fields
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    firstName: "",
    middlename: "",
    surname: "",
    idNumber: "",
    role: "Clinician",
    yearLevel: "",
    section: "", // Add section field
    createType: "single",
    // Add highlighted fields
    prefix: "",
    dob: "",
    gender: "",
    marital_status: "",
    // Contact information fields
    contact_no: "",
    permanent_address: "",
    emergency_person: "",
    emergency_contact_no: "",
    emergency_address: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // CSV upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvResults, setCsvResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return formatDate(dateString);
    } catch (error) {
      return "Invalid Date";
    }
  };
  // Validation functions
  const validateField = (fieldName, value, role = null) => {
    const errors = { ...createForm.errors };

    // Skip required validation for middlename and prefix
    const isOptionalField =
      fieldName === "middlename" || fieldName === "prefix";

    if (!isOptionalField && (!value || value.trim() === "")) {
      errors[fieldName] = `${
        fieldName.charAt(0).toUpperCase() +
        fieldName.slice(1).replace(/_/g, " ")
      } is required`;
      setCreateForm((prev) => ({ ...prev, errors }));
      return;
    }

    switch (fieldName) {
      case "email":
        if (!value) {
          errors.email = "Email is required";
        } else {
          const emailValidation = validateEmail(value, role || createForm.role);
          if (!emailValidation.isValid) {
            errors.email = emailValidation.message;
          } else {
            delete errors.email;
          }
        }
        break;

      case "firstName":
        if (!value) {
          errors.firstName = "First name is required";
        } else if (value.length < 2) {
          errors.firstName = "First name must be at least 2 characters";
        } else {
          delete errors.firstName;
        }
        break;

      case "middlename":
        // Optional field - just validate format if provided
        if (value && value.length < 2) {
          errors.middlename = "Middle name must be at least 2 characters";
        } else {
          delete errors.middlename;
        }
        break;

      case "prefix":
        // Optional field - no validation required
        delete errors.prefix;
        break;

      case "surname":
        if (!value) {
          errors.surname = "Surname is required";
        } else if (value.length < 2) {
          errors.surname = "Surname must be at least 2 characters";
        } else {
          delete errors.surname;
        }
        break;

      case "idNumber":
        if (!value) {
          errors.idNumber = "ID Number is required";
        } else if (!/^\d{4}-\d{6}$/.test(value)) {
          // Use the same format for all users
          errors.idNumber =
            "ID Number should follow format: YYYY-NNNNNN (e.g., 2023-231232)";
        } else {
          delete errors.idNumber;
        }
        break;
      case "yearLevel":
        if (!value) {
          errors.yearLevel = "Year level is required";
        } else {
          delete errors.yearLevel;
        }
        break;

      case "section":
        if (!value) {
          errors.section = "Section is required";
        } else {
          delete errors.section;
        }
        break;

      case "dob":
        if (!value) {
          errors.dob = "Date of birth is required";
        } else if (new Date(value) > new Date()) {
          errors.dob = "Date of birth cannot be in the future";
        } else {
          delete errors.dob;
        }
        break;

      case "gender":
        if (!value) {
          errors.gender = "Gender is required";
        } else {
          delete errors.gender;
        }
        break;

      case "marital_status":
        if (!value) {
          errors.marital_status = "Marital status is required";
        } else {
          delete errors.marital_status;
        }
        break;

      case "contact_no":
        if (!value) {
          errors.contact_no = "Contact number is required";
        } else if (!/^09\d{9}$/.test(value)) {
          errors.contact_no = "Invalid Philippine phone number format";
        } else {
          delete errors.contact_no;
        }
        break;

      case "permanent_address":
        if (!value) {
          errors.permanent_address = "Permanent address is required";
        } else {
          delete errors.permanent_address;
        }
        break;

      case "emergency_person":
        if (!value) {
          errors.emergency_person = "Emergency contact person is required";
        } else {
          delete errors.emergency_person;
        }
        break;

      case "emergency_contact_no":
        if (!value) {
          errors.emergency_contact_no = "Emergency contact number is required";
        } else if (!/^09\d{9}$/.test(value)) {
          errors.emergency_contact_no =
            "Invalid Philippine phone number format";
        } else {
          delete errors.emergency_contact_no;
        }
        break;

      case "emergency_address":
        if (!value) {
          errors.emergency_address = "Emergency address is required";
        } else {
          delete errors.emergency_address;
        }
        break;

      default:
        if (!value) {
          errors[fieldName] = `${fieldName.replace(/_/g, " ")} is required`;
        } else {
          delete errors[fieldName];
        }
    }

    setCreateForm((prev) => ({ ...prev, errors }));
  };

  const markFieldAsTouched = (fieldName) => {
    setCreateForm((prev) => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true },
    }));
  };

  const validateCurrentStep = (step, formData) => {
    const errors = {};

    if (step === 0) {
      // Account info step
      if (!formData.email) errors.email = "Email is required";
      if (!formData.role) errors.role = "Role is required";

      // Validate email format if exists
      if (formData.email) {
        const emailValidation = validateEmail(formData.email, formData.role);
        if (!emailValidation.isValid) {
          errors.email = emailValidation.message;
        }
      }
    } else if (step === 1) {
      // Personal info step
      if (!formData.firstName) errors.firstName = "First name is required";
      if (!formData.surname) errors.surname = "Surname is required";
      if (formData.idNumber) {
        if (!/^\d{4}-\d{6}$/.test(formData.idNumber)) {
          errors.idNumber =
            "ID Number should follow format: YYYY-NNNNNN (e.g., 2023-231232)";
        }
      }
      // Validate ID number format
      if (formData.idNumber) {
        // Apply the same format validation for both roles
        if (!/^\d{4}-\d{6}$/.test(formData.idNumber)) {
          errors.idNumber =
            "ID Number should follow format: YYYY-NNNNNN (e.g., 2023-231232)";
        }
      }

      // Validate year level for clinicians
      if (formData.role === "Clinician" && !formData.yearLevel) {
        errors.yearLevel = "Year level is required for Clinicians";
      }

      // Validate section for clinicians
      if (formData.role === "Clinician" && !formData.section) {
        errors.section = "Section is required for Clinicians";
      }
    }

    setCreateForm((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const validateAllFields = (formData) => {
    // Direct validation of required fields that the backend expects
    const errors = {};

    // Check required fields (excluding prefix and middlename)
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailValidation = validateEmail(formData.email, formData.role);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
      }
    }

    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    // Note: middlename is optional - no validation

    if (!formData.surname || !formData.surname.trim()) {
      errors.surname = "Surname is required";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    // Note: prefix is optional - no validation

    if (!formData.idNumber || !formData.idNumber.trim()) {
      errors.idNumber = "ID Number is required";
    } else if (!/^\d{4}-\d{6}$/.test(formData.idNumber)) {
      errors.idNumber =
        "ID Number should follow format: YYYY-NNNNNN (e.g., 2023-231232)";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    }

    if (!formData.gender || !formData.gender.trim()) {
      errors.gender = "Gender is required";
    }

    if (!formData.marital_status || !formData.marital_status.trim()) {
      errors.marital_status = "Marital status is required";
    }

    if (!formData.contact_no || !formData.contact_no.trim()) {
      errors.contact_no = "Contact number is required";
    }

    if (!formData.permanent_address || !formData.permanent_address.trim()) {
      errors.permanent_address = "Permanent address is required";
    }

    if (!formData.emergency_person || !formData.emergency_person.trim()) {
      errors.emergency_person = "Emergency contact person is required";
    }

    if (
      !formData.emergency_contact_no ||
      !formData.emergency_contact_no.trim()
    ) {
      errors.emergency_contact_no = "Emergency contact number is required";
    }

    if (!formData.emergency_address || !formData.emergency_address.trim()) {
      errors.emergency_address = "Emergency address is required";
    }

    // Year level validation ONLY for Clinicians
    if (formData.role === "Clinician" && !formData.yearLevel) {
      errors.yearLevel = "Year Level is required for Clinicians";
    }

    // Section validation ONLY for Clinicians
    if (
      formData.role === "Clinician" &&
      (!formData.section || !formData.section.trim())
    ) {
      errors.section = "Section is required for Clinicians";
    }

    // Update form state with these validations
    setCreateForm((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      touched: {
        ...prev.touched,
        email: true,
        firstName: true,
        surname: true,
        role: true,
        idNumber: true,
        yearLevel: formData.role === "Clinician", // Only mark as touched for Clinicians
        section: formData.role === "Clinician", // Only mark as touched for Clinicians
        dob: true,
        gender: true,
        marital_status: true,
        contact_no: true,
        permanent_address: true,
        emergency_person: true,
        emergency_contact_no: true,
        emergency_address: true,
        // Don't mark optional fields as touched
      },
    }));

    return Object.keys(errors).length === 0;
  };
  // Email validation function with domain checking
  const validateEmail = (email, role) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    // Check domain based on role
    if (role === "Clinician") {
      if (!email.toLowerCase().endsWith("@students.nu-moa.edu.ph")) {
        return {
          isValid: false,
          message: "Clinician email must use @students.nu-moa.edu.ph domain",
        };
      }
    } else if (role === "Clinical Instructor" || role === "Clinical Chair") {
      if (!email.toLowerCase().endsWith("@nu-moa.edu.ph")) {
        return {
          isValid: false,
          message:
            "Clinical Instructor/Chair email must use @nu-moa.edu.ph domain",
        };
      }
    }

    return { isValid: true, message: "" };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/getAllUsers`);
      setUsers(response.data.users);
      setPagination({
        ...pagination,
        total: response.data.total || response.data.users.length,
      });
      message.success({
        content: "Users loaded successfully",
        icon: <BsPersonCheck className="text-success" />,
        duration: 2,
      });
    } catch (error) {
      message.error({
        content: "Failed to fetch users",
        icon: <BsPersonX className="text-danger" />,
        duration: 3,
      });
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Enhanced status colors and styles
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          variant: "success",
          icon: <BsPersonCheck />,
          class: "status-active",
          color: "#198754",
        };
      case "pending":
        return {
          variant: "warning",
          icon: <BsPersonExclamation />,
          class: "status-pending",
          color: "#ffc107",
        };
      case "inactive":
        return {
          variant: "danger",
          icon: <BsPersonX />,
          class: "status-inactive",
          color: "#dc3545",
        };
      case "archived":
        return {
          variant: "secondary",
          icon: <FiArchive />,
          class: "status-archived",
          color: "#6c757d",
        };
      default:
        return {
          variant: "secondary",
          icon: <BsPersonExclamation />,
          class: "",
          color: "#6c757d",
        };
    }
  };

  const getFullName = (user) => {
    return (
      `${user.prefix ? user.prefix + " " : ""}${user.firstName || ""} ${
        user.middlename ? user.middlename + " " : ""
      }${user.surname || ""}`.trim() || user.email
    );
  };

  // Replace handleDeleteUser with this improved version
  const handleDeleteUser = async (userId, userName) => {
    try {
      const confirmed = await Swal.fire({
        title: "Archive User?",
        html: `
        <div class="text-start">
          <p>Are you sure you want to archive <strong>${userName}</strong>?</p>
          <div class="alert alert-warning mb-3">
            <div class="d-flex">
              <div style="margin-right: 10px;"><i class="bi bi-exclamation-triangle"></i></div>
              <div>
                <p class="mb-0"><strong>What happens when you archive:</strong></p>
                <ul class="mb-0 ps-3 pt-1">
                  <li>User will be marked as archived</li>
                  <li>User won't appear in regular user lists</li>
                  <li>User data will be preserved</li>
                  <li>User can be restored later if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#6c757d",
        cancelButtonColor: "#0d6efd",
        confirmButtonText: '<i class="bi bi-archive"></i> Archive User',
        cancelButtonText: "Cancel",
        focusCancel: true,
        customClass: {
          confirmButton: "btn btn-archive",
        },
      });

      if (confirmed.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: "Archiving...",
          text: "Please wait while we archive this user.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Call the archive endpoint
        const response = await axios.post(
          `${API_URL}/archive/${userId}`,
          { reason: "Archived from user management" },
          { withCredentials: true }
        );

        if (response.data.success) {
          Swal.fire({
            title: "User Archived!",
            text: "The user has been successfully archived.",
            icon: "success",
            confirmButtonColor: "#198754",
          });
          fetchUsers(); // Refresh the user list
        } else {
          throw new Error(response.data.message || "Failed to archive user");
        }
      }
    } catch (error) {
      console.error("Error archiving user:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to archive user. Please try again.",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/update/status/${userId}`,
        {
          status: newStatus,
        },
        {
          withCredentials: true,
        }
      );

      message.success({
        content: `Status updated to ${newStatus}`,
        icon: getStatusConfig(newStatus).icon,
        duration: 2,
      });

      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : user
        )
      );
    } catch (error) {
      message.error("Failed to update status");
      console.error("Error updating status:", error);
    }
  };

  // CSV file handling
  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        message.error("Please select a CSV file");
        return;
      }

      setCsvFile(file);

      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length > 0) {
          const headers = lines[0]
            .split(",")
            .map((h) => h.trim().replace(/"/g, ""));
          const rows = lines.slice(1, 6).map((line) => {
            const values = line
              .split(",")
              .map((v) => v.trim().replace(/"/g, ""));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            return row;
          });

          setCsvPreview({ headers, rows, totalRows: lines.length - 1 });
        }
      };
      reader.readAsText(file);
    }
  };

  // Generate CSV template with correct email domains and required fields
  const downloadCsvTemplate = () => {
    const csvContent = [
      "email,firstname,middlename,lastname,idNumber,yearLevel,section,prefix,dob,gender,marital_status,contact_no,permanent_address,emergency_person,emergency_contact_no,emergency_address",
      "john.doe@students.nu-moa.edu.ph,John,Michael,Doe,2024001,5th Year,A,,,,,,,,,",
      "jane.smith@nu-moa.edu.ph,Jane,,Smith,CI2024002,,,,,,,,,,,",
      "bob.johnson@students.nu-moa.edu.ph,Bob,Lee,Johnson,2024003,6th Year,B,,2000-05-15,Male,Single,09123456789,123 Main St,Maria Johnson,09123456788,456 Side St",
      "mary.williams@students.nu-moa.edu.ph,Mary,,Williams,2024004,5th Year,C,,,,,,,,",
      "james.brown@nu-moa.edu.ph,James,,Brown,CI2024005,,,,1985-10-20,Male,Married,09187654321,789 University Ave,Sarah Brown,09187654322,789 University Ave",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nusmilephmoa_user_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle CSV upload with enhanced validation for backend requirements
  const handleCsvUpload = async () => {
    if (!csvFile) {
      message.error("Please select a CSV file");
      return;
    }

    if (!csvRole) {
      message.error("Please select a role for all users");
      return;
    }

    try {
      setCreateLoading(true);
      setCsvProgress(0);

      const formData = new FormData();
      formData.append("csvFile", csvFile);

      // Add selectedRole to the form data
      formData.append("selectedRole", csvRole);

      // Send to the bulk create endpoint
      const response = await axios.post(
        `${API_URL}/bulk-create-users`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setCsvProgress(progress);
          },
        }
      );
      // Transform the backend response to match frontend expectations
      const results = {
        total: response.data.results.total,
        successful: response.data.results.successful,
        failed: response.data.results.failed,
        // Transform failedUsers to failureDetails format
        failureDetails:
          response.data.results.failedUsers?.map((failure) => ({
            row: failure.row,
            email: failure.email,
            message: failure.error,
          })) || [],
        // Extract general error message if available
        errorMessages: response.data.message || "",
      };

      // Process the results
      setCsvResults(results);
      setShowResultsModal(true);
      setShowCreateModal(false);

      if (response.data.results.successful > 0) {
        message.success({
          content: `Successfully created ${response.data.results.successful} ${csvRole} users`,
          duration: 4,
        });
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      message.error({
        content: error.response?.data?.message || "Failed to upload CSV file",
        duration: 5,
      });
    } finally {
      setCreateLoading(false);
      setCsvProgress(0);
    }
  };
  const handleExportToCSV = () => {
    if (!isClinicalChair) {
      message.error("Only Clinical Chair can export user data");
      return;
    }

    // Format data for export with standardized structure
    const exportData = users.map((user) => ({
      status: user.status || "N/A",
      role: user.role || "N/A",
      idNumber: user.idNumber || "Not Set",
      firstName: user.firstName || "",
      middlename: user.middlename || "",
      surname: user.surname || "",
      fullName: getFullName(user),
      email: user.email || "",
      department: user.department || "N/A",
      yearLevel: user.yearLevel || "N/A",
      section: user.section || "N/A",
      createdAt: formatDate(user.createdAt) || "N/A",
      updatedAt: formatDate(user.updatedAt) || "N/A",
    }));

    const success = exportToCSV(exportData, "all-users");
    if (success) {
      message.success({
        content: "Users data exported successfully",
        icon: <FiDownload className="text-primary" />,
        duration: 3,
      });
    }
  };
  // Enhanced create user functionality with all required fields validation
  const handleCreateUser = async () => {
    const {
      email,
      firstName,
      middlename,
      surname,
      idNumber,
      role,
      yearLevel,
      section, // Include section field
      createType,
      // Additional fields
      prefix,
      dob,
      gender,
      marital_status,
      // Contact information fields
      contact_no,
      permanent_address,
      emergency_person,
      emergency_contact_no,
      emergency_address,
    } = createForm;

    if (createType === "csv") {
      return handleCsvUpload();
    }

    // Use our enhanced validation function
    const isValid = validateAllFields(createForm);
    if (!isValid) {
      message.error({
        content:
          "Please fill in all required fields (Email, First Name, Surname, Role, ID Number)",
        duration: 4,
      });
      return;
    }

    try {
      setCreateLoading(true);
      setSingleProgress(25); // Start progress

      // Send all fields directly at the top level, matching exactly what the controller expects
      const requestData = {
        email: email.toLowerCase().trim(),
        firstname: firstName.trim(), // Backend expects 'firstname' not 'firstName'
        middlename: middlename?.trim() || "",
        lastname: surname.trim(), // Backend expects 'lastname' not 'surname'
        idNumber: idNumber.trim(),
        role: role,
        ...(role === "Clinician" && {
          yearLevel: yearLevel,
          section: section?.trim() || "", // Include section for Clinicians
        }),
        // Additional fields
        prefix: prefix?.trim() || "",
        dob: dob || null,
        gender: gender?.trim() || "",
        marital_status: marital_status?.trim() || "",
        // Include contact fields directly in the request if they're provided
        ...(contact_no && {
          contact_no: contact_no,
          permanent_address: permanent_address || "",
          emergency_person: emergency_person || "",
          emergency_contact_no: emergency_contact_no || "",
          emergency_address: emergency_address || "",
        }),
      };

      // Add debugging to verify data
      console.log("Submitting user data:", requestData);

      setSingleProgress(50);

      // Send request with all fields at the top level
      const response = await axios.post(
        `${API_URL}/create/user`,
        requestData, // Send as flat object, not nested
        {
          withCredentials: true,
        }
      );

      // Rest of the function remains the same...
      setSingleProgress(100);

      message.success({
        content: (
          <div>
            <strong>User created successfully!</strong>
            <br />
            <small>Login credentials have been sent to {email}</small>
            <br />
            <small className="text-muted">
              User must complete their profile to activate account
            </small>
          </div>
        ),
        duration: 5,
        icon: <FiUserPlus className="text-success" />,
      });

      // Reset form
      setCreateForm({
        email: "",
        firstName: "",
        middlename: "",
        surname: "",
        idNumber: "",
        role: "Clinician",
        yearLevel: "",
        section: "", // Reset section field
        createType: "single",
        // Reset additional fields
        prefix: "",
        dob: "",
        gender: "",
        marital_status: "",
        // Reset contact information fields
        contact_no: "",
        permanent_address: "",
        emergency_person: "",
        emergency_contact_no: "",
        emergency_address: "",
        // Reset validation state
        errors: {},
        touched: {},
        // Reset step and tab
        currentStep: 0,
        activeTab: "personal",
      });

      setShowCreateModal(false);
      fetchUsers(); // Refresh the user list

      // Reset progress after short delay
      setTimeout(() => setSingleProgress(0), 1000);
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error response:", error.response?.data);
      setSingleProgress(0);
      message.error({
        content: error.response?.data?.message || "Failed to create user",
        duration: 3,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset file-related states when switching away from CSV
    if (field === "createType" && value !== "csv") {
      setCsvFile(null);
      setCsvPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    // Clear year level when switching from Clinician to Clinical Instructor
    if (field === "role" && value === "Clinical Instructor") {
      setCreateForm((prev) => ({
        ...prev,
        [field]: value,
        yearLevel: "",
      }));
    }
  };

  // Handle role change with email domain validation
  const handleRoleChange = (newRole) => {
    handleCreateFormChange("role", newRole);

    // Clear email if it doesn't match the new role's domain
    if (createForm.email) {
      const emailValidation = validateEmail(createForm.email, newRole);
      if (!emailValidation.isValid) {
        handleCreateFormChange("email", "");
        message.info({
          content: `Email cleared. ${
            newRole === "Clinician"
              ? "Please use @students.nu-moa.edu.ph domain"
              : "Please use @nu-moa.edu.ph domain"
          }`,
          duration: 3,
        });
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = getStatusConfig(status);

    return (
      <Badge
        bg={statusConfig.variant}
        className={`${statusConfig.class} d-flex align-items-center gap-1`}
        style={{ minWidth: "80px", justifyContent: "center" }}
      >
        {statusConfig.icon}
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
      </Badge>
    );
  };

  // Enhanced table columns with date columns
  const columns = [
    {
      title: "ID Number",
      dataIndex: "idNumber",
      key: "idNumber",
      render: (idNumber) => (
        <span className="fw-medium">
          {idNumber && idNumber !== "To be updated" ? idNumber : "Not Set"}
        </span>
      ),
      width: 120,
    },
    {
      title: "Full Name",
      dataIndex: "firstName",
      key: "name",
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#e9ecef",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {getFullName(record).charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="fw-medium">{getFullName(record)}</div>
            <small className="text-muted">{record.email}</small>
          </div>
        </div>
      ),
      sorter: (a, b) => getFullName(a).localeCompare(getFullName(b)),
      width: 300,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Badge
          bg={
            role === "Clinical Chair"
              ? "primary"
              : role === "Clinical Instructor"
              ? "info"
              : "secondary"
          }
          className="fw-normal"
        >
          {role}
        </Badge>
      ),
      filters: [
        { text: "Clinician", value: "Clinician" },
        { text: "Clinical Instructor", value: "Clinical Instructor" },
        { text: "Clinical Chair", value: "Clinical Chair" },
      ],
      onFilter: (value, record) => record.role === value,
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
      align: "center",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => (
        <span className={department ? "text-dark" : "text-muted fst-italic"}>
          {department || "N/A"}
        </span>
      ),
      width: 180,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <Tooltip title={formatDate(createdAt)} placement="top">
          <div className="d-flex align-items-center gap-1">
            <FiCalendar size={12} className="text-muted" />
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 140,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => (
        <Tooltip title={formatDate(updatedAt)} placement="top">
          <div className="d-flex align-items-center gap-1">
            <FiClock size={12} className="text-muted" />
            <span>{formatRelativeTime(updatedAt)}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      width: 140,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => viewUserDetails(record._id)}
            className="action-btn"
            title="View Details"
          >
            <FiEye size={16} />
          </Button>

          {record.status !== "archived" && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => editUser(record._id)}
              className="action-btn"
              title="Edit User"
            >
              <FiEdit size={16} />
            </Button>
          )}

          {/* Show archive button for active users */}
          {record.status !== "archived" && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeleteUser(record._id, getFullName(record))}
              className="action-btn"
              disabled={record.status === "inactive"}
              title="Archive User"
            >
              <FiArchive size={16} />
            </Button>
          )}

          {/* Show restore button for archived users */}
          {record.status === "archived" && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleRestoreUser(record._id, getFullName(record))}
              className="action-btn"
              title="Restore User"
            >
              <FiRefreshCw size={16} />
            </Button>
          )}
        </div>
      ),
      width: 140,
      align: "center",
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const viewUserDetails = (userId) => {
    navigate(`/account/details/${userId}`);
  };

  const editUser = (userId) => {
    navigate(`/chinicalchair/edit/account/${userId}`);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  const handleRestoreUser = async (userId, userName) => {
    try {
      const confirmed = await Swal.fire({
        title: "Restore User?",
        html: `Are you sure you want to restore <strong>${userName}</strong> to active status?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, restore user",
        cancelButtonText: "Cancel",
        focusCancel: true,
      });

      if (confirmed.isConfirmed) {
        const response = await axios.post(
          `${API_URL}/restore/${userId}`,
          { reason: "Restored from archive" },
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          Swal.fire({
            title: "User Restored!",
            text: "The user has been successfully restored to active status.",
            icon: "success",
            confirmButtonColor: "#198754",
          });
          fetchUsers(); // Refresh the user list
        } else {
          throw new Error(response.data.message || "Failed to restore user");
        }
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to restore user. Please try again.",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };
  // Replace your filteredUsers function with this enhanced version
  const filteredUsers = users.filter((user) => {
    // First check if we should show archived users
    if (showArchived) {
      if (user.status !== "archived") return false;
    } else {
      if (user.status === "archived") return false;
    }

    const matchesSearch =
      getFullName(user).toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.idNumber &&
        user.idNumber.toLowerCase().includes(searchText.toLowerCase())) ||
      user.department?.toLowerCase().includes(searchText.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    // Only apply status filter when not showing archived users
    const matchesStatus =
      showArchived ||
      selectedStatus === "all" ||
      user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Enhanced mobile card view with dates
  const renderMobileCardView = () => {
    const paginatedUsers = filteredUsers.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );

    return (
      <>
        {paginatedUsers.map((user, index) => {
          const statusConfig = getStatusConfig(user.status);

          return (
            <Card
              key={user._id || index}
              className="mb-3 shadow-sm border-0 user-card"
            >
              <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: statusConfig.color,
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {getFullName(user).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold">{getFullName(user)}</div>
                    <Badge
                      bg={
                        user.role === "Clinical Chair"
                          ? "primary"
                          : user.role === "Clinical Instructor"
                          ? "info"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <StatusBadge status={user.status} />
              </Card.Header>
              <Card.Body className="py-3">
                <div className="row g-2">
                  <div className="col-12">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-medium">{user.email || "N/A"}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">ID Number</small>
                    <div
                      className={
                        user.idNumber && user.idNumber !== "To be updated"
                          ? "fw-medium"
                          : "text-muted fst-italic"
                      }
                    >
                      {user.idNumber && user.idNumber !== "To be updated"
                        ? user.idNumber
                        : "Not Set"}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Department</small>
                    <div
                      className={
                        user.department ? "fw-medium" : "text-muted fst-italic"
                      }
                    >
                      {user.department || "N/A"}
                    </div>
                  </div>
                  {/* Added date information */}
                  <div className="col-6">
                    <small className="text-muted d-block">
                      <FiCalendar size={12} className="me-1" />
                      Created
                    </small>
                    <div className="small text-muted">
                      {formatRelativeTime(user.createdAt)}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">
                      <FiClock size={12} className="me-1" />
                      Updated
                    </small>
                    <div className="small text-muted">
                      {formatRelativeTime(user.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => viewUserDetails(user._id)}
                    className="flex-fill d-flex align-items-center justify-content-center gap-1"
                  >
                    <FiEye size={14} /> View
                  </Button>

                  {user.status !== "archived" && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => editUser(user._id)}
                      className="flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <FiEdit size={14} /> Edit
                    </Button>
                  )}

                  {user.status !== "archived" && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() =>
                        handleDeleteUser(user._id, getFullName(user))
                      }
                      className="flex-fill d-flex align-items-center justify-content-center gap-1"
                      disabled={user.status === "inactive"}
                    >
                      <FiArchive size={14} /> Archive
                    </Button>
                  )}

                  {user.status === "archived" && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() =>
                        handleRestoreUser(user._id, getFullName(user))
                      }
                      className="flex-fill d-flex align-items-center justify-content-center gap-1"
                    >
                      <FiRefreshCw size={14} /> Restore
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}

        {/* Mobile pagination */}
        {filteredUsers.length > pagination.pageSize && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <small className="text-muted">
              Showing {(pagination.current - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.current * pagination.pageSize,
                filteredUsers.length
              )}{" "}
              of {filteredUsers.length} users
            </small>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current: prev.current - 1,
                  }))
                }
                disabled={pagination.current === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current: prev.current + 1,
                  }))
                }
                disabled={
                  pagination.current * pagination.pageSize >=
                  filteredUsers.length
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  // Main container styles for full width
  const containerStyles = {
    width: "100%",
    maxWidth: "100%",
    padding: "0",
    margin: "0",
  };

  return (
    <div className="account-list-page" style={{ width: "100%" }}>
      <div style={{ padding: "0.5rem 1.5rem" }}>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="compact-back-btn mb-3"
        >
          <FiArrowLeft size={16} />
          <span className="ms-1">Back</span>
        </Button>

        <Card className="shadow-sm border-0 user-management-card">
          {/* Updated header with clinician-header styling */}
          <Card.Header className="clinician-header">
            <div className="clinician-title">
              <h4>User Management</h4>
              <p className="mb-0 opacity-75">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="clinician-count">
              <Badge className="count-badge">
                <FiUsers className="me-2" />
                {filteredUsers.length} Users
              </Badge>
              <Button
                variant="success"
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <FiUserPlus />
                <span>Create User</span>
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {/* Updated filter area using the format from reference */}
            <div className="filter-area">
              <div className="filter-row">
                <input
                  type="text"
                  className="search-input form-control"
                  placeholder="Search by name, email, ID, or department..."
                  onChange={handleSearch}
                  value={searchText}
                />

                <Form.Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="role-select"
                >
                  <option value="all">All Roles</option>
                  <option value="Clinician">Clinician</option>
                  <option value="Clinical Instructor">
                    Clinical Instructor
                  </option>
                  <option value="Clinical Chair">Clinical Chair</option>
                </Form.Select>

                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>

                {/* Archive toggle switch */}
                <div className="archive-toggle d-flex align-items-center">
                  <Form.Check
                    type="switch"
                    id="archive-switch"
                    label={
                      <span className="d-flex align-items-center">
                        <FiArchive size={14} className="me-1" />
                        <span className="d-none d-md-inline">
                          Show Archived
                        </span>
                      </span>
                    }
                    checked={showArchived}
                    onChange={() => setShowArchived(!showArchived)}
                    className="archive-switch"
                  />
                </div>

                <div className="filter-actions">
                  <Button
                    variant="outline-secondary"
                    className="refresh-btn"
                    onClick={fetchUsers}
                    title="Refresh"
                  >
                    <FiRefreshCw size={18} />
                  </Button>
                  {isClinicalChair && (
                    <Button
                      variant="outline-primary"
                      className="export-btn"
                      onClick={handleExportToCSV}
                      disabled={loading || filteredUsers.length === 0}
                      title="Export to CSV"
                    >
                      <FiDownload size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {showArchived && (
              <div className="archive-notice">
                <Alert
                  variant="secondary"
                  className="d-flex align-items-center justify-content-between m-3"
                >
                  <div className="d-flex align-items-center">
                    <FiArchive size={18} className="me-2" />
                    <span>
                      <strong>Archive Mode:</strong> You are currently viewing
                      archived users.
                    </span>
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowArchived(false)}
                  >
                    Exit Archive
                  </Button>
                </Alert>
              </div>
            )}
            {/* Role-based information alert */}
            {isClinicalInstructor && (
              <div className="px-3 pb-0 pt-3">
                <Alert
                  variant="info"
                  className="d-flex align-items-start gap-2 mt-3"
                >
                  <FiInfo size={18} className="mt-1" />
                  <div>
                    <strong>Note about CSV format:</strong>
                    <ul className="mb-0 mt-1">
                      <li>
                        All fields except middle name and prefix are required
                        for user creation
                      </li>
                      <li>
                        Emails must match the domain for the selected role
                      </li>
                      <li>Year level is required for all users</li>
                      <li>Section is required for all users</li>
                      <li>
                        Contact information must be provided for all users
                      </li>
                    </ul>
                  </div>
                </Alert>
              </div>
            )}

            {/* Table content area with full width */}
            <div className="table-content-area px-0">
              {/* Loading indicator */}
              {loading && (
                <div className="text-center py-5">
                  <Spin size="large" />
                  <div className="mt-3 text-muted">Loading users...</div>
                </div>
              )}

              {/* No results message - only shown when no users found */}
              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-5">
                  <FiUsers size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No users found</h6>
                  <p className="text-muted">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}

              {/* Mobile card view - only show on mobile when users exist */}
              {!loading && filteredUsers.length > 0 && (
                <div className="d-block d-md-none p-3">
                  {renderMobileCardView()}
                </div>
              )}

              {/* Enhanced table view that takes up full width */}
              {!loading && filteredUsers.length > 0 && (
                <div className="table-responsive">
                  <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey={(record) =>
                      record._id || Math.random().toString(36).substr(2, 9)
                    }
                    bordered={false}
                    pagination={{
                      ...pagination,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} users`,
                      className: "custom-pagination",
                    }}
                    onChange={handleTableChange}
                    size="middle"
                    scroll={{ x: true }}
                    className="users-table"
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? "table-row-even" : "table-row-odd"
                    }
                  />
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Enhanced Create User Modal with improved UI/UX and field validation */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setCsvFile(null);
          setCsvPreview([]);
          setCreateForm({
            email: "",
            firstName: "",
            middlename: "",
            surname: "",
            idNumber: "",
            role: "Clinician",
            yearLevel: "",
            createType: "single",
            // Reset highlighted fields
            prefix: "",
            dob: "",
            gender: "",
            marital_status: "",
            // Reset contact information fields
            contact_no: "",
            permanent_address: "",
            emergency_person: "",
            emergency_contact_no: "",
            emergency_address: "",
            // Track active step and tabs
            currentStep: 0,
            activeTab: "personal",
            // Field validation state
            errors: {},
            touched: {},
          });
        }}
        centered
        backdrop="static"
        size="lg"
        dialogClassName="modal-wider"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "95%", width: "930px", margin: "0 auto" }}>
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #198754, #20c997)",
              color: "white",
              border: "none",
              padding: "1rem 1.5rem",
            }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <FiUserPlus size={20} />
              <span style={{ fontWeight: 600 }}>Create New User</span>
            </Modal.Title>
          </Modal.Header>
          <div
            style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee" }}
          >
            {/* Creation Method Selector */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "10px",
                  background:
                    createForm.createType === "single" ? "#e9f7f0" : "#f8f9fa",
                  border:
                    createForm.createType === "single"
                      ? "1px solid #20c997"
                      : "1px solid #dee2e6",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color:
                    createForm.createType === "single" ? "#198754" : "#212529",
                  fontWeight: createForm.createType === "single" ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
                onClick={() => handleCreateFormChange("createType", "single")}
              >
                <FiUserPlus size={18} />
                <span>Single User</span>
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "10px",
                  background:
                    createForm.createType === "csv" ? "#e9f7f0" : "#f8f9fa",
                  border:
                    createForm.createType === "csv"
                      ? "1px solid #20c997"
                      : "1px solid #dee2e6",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color:
                    createForm.createType === "csv" ? "#198754" : "#212529",
                  fontWeight: createForm.createType === "csv" ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
                onClick={() => handleCreateFormChange("createType", "csv")}
              >
                <BsFileEarmarkSpreadsheet size={18} />
                <span>CSV Upload</span>
              </button>
            </div>
          </div>
          {/* Single User Form with Steps */}
          {createForm.createType === "single" && (
            <>
              {/* Step Indicators */}
              <div
                style={{
                  padding: "1rem 1rem 0.5rem",
                  display: "flex",
                  gap: "8px",
                  position: "relative",
                }}
              >
                {["Account", "Personal", "Others"].map((step, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      // Validate current step before allowing navigation
                      const canNavigate = validateStepBeforeNavigation(
                        createForm.currentStep,
                        index,
                        createForm
                      );
                      if (canNavigate) {
                        setCreateForm({ ...createForm, currentStep: index });
                      }
                    }}
                  >
                    {/* Line connector */}
                    {index < 2 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "15px",
                          left: "50%",
                          width: "100%",
                          height: "2px",
                          background:
                            createForm.currentStep > index
                              ? "#20c997"
                              : "#dee2e6",
                          zIndex: 1,
                        }}
                      ></div>
                    )}

                    {/* Step circle */}
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background:
                          createForm.currentStep >= index
                            ? "#20c997"
                            : "#f8f9fa",
                        border: "2px solid",
                        borderColor:
                          createForm.currentStep >= index
                            ? "#20c997"
                            : "#dee2e6",
                        color:
                          createForm.currentStep >= index ? "white" : "#adb5bd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "14px",
                        margin: "0 0 8px",
                        zIndex: 2,
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Step label */}
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: createForm.currentStep >= index ? 600 : 400,
                        color:
                          createForm.currentStep >= index
                            ? "#198754"
                            : "#6c757d",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <Modal.Body style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
                <Form noValidate>
                  {/* Step 1: Account Information */}
                  {createForm.currentStep === 0 && (
                    <div style={{ padding: "10px 0" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#212529",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 14px",
                          background: "#f8f9fa",
                          borderRadius: "6px",
                        }}
                      >
                        <FiUser />
                        <span>Account Information</span>
                      </div>

                      {/* Role selection */}
                      <Form.Group className="mb-3">
                        <Form.Label
                          style={{
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>Role</span>
                          <span style={{ color: "#dc3545" }}>*</span>
                        </Form.Label>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "6px",
                          }}
                        >
                          <button
                            type="button"
                            style={{
                              flex: 1,
                              padding: "10px",
                              background:
                                createForm.role === "Clinician"
                                  ? "#e9f7f0"
                                  : "#fff",
                              border:
                                createForm.role === "Clinician"
                                  ? "1px solid #20c997"
                                  : "1px solid #dee2e6",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              color:
                                createForm.role === "Clinician"
                                  ? "#198754"
                                  : "#212529",
                              fontWeight:
                                createForm.role === "Clinician" ? 500 : 400,
                            }}
                            onClick={() => handleRoleChange("Clinician")}
                          >
                            <span>👨‍⚕️ Clinician</span>
                          </button>

                          <button
                            type="button"
                            style={{
                              flex: 1,
                              padding: "10px",
                              background:
                                createForm.role === "Clinical Instructor"
                                  ? "#e9f7f0"
                                  : "#fff",
                              border:
                                createForm.role === "Clinical Instructor"
                                  ? "1px solid #20c997"
                                  : "1px solid #dee2e6",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              color:
                                createForm.role === "Clinical Instructor"
                                  ? "#198754"
                                  : "#212529",
                              fontWeight:
                                createForm.role === "Clinical Instructor"
                                  ? 500
                                  : 400,
                            }}
                            onClick={() =>
                              handleRoleChange("Clinical Instructor")
                            }
                          >
                            <span>👩‍🏫 Clinical Instructor</span>
                          </button>
                        </div>
                        <Form.Text
                          style={{ color: "#6c757d", fontSize: "13px" }}
                        >
                          Role determines the required email domain
                        </Form.Text>
                      </Form.Group>

                      {/* Email input with enhanced validation */}
                      <Form.Group className="mb-4">
                        <Form.Label
                          style={{
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>Email Address</span>
                          <span style={{ color: "#dc3545" }}>*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FiMail className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            placeholder={
                              createForm.role === "Clinician"
                                ? "username@students.nu-moa.edu.ph"
                                : "username@nu-moa.edu.ph"
                            }
                            value={createForm.email}
                            onChange={(e) => {
                              handleCreateFormChange("email", e.target.value);
                              validateField(
                                "email",
                                e.target.value,
                                createForm.role
                              );
                            }}
                            onBlur={() => markFieldAsTouched("email")}
                            required
                            isInvalid={
                              (createForm.touched?.email || createForm.email) &&
                              createForm.errors?.email
                            }
                            isValid={
                              createForm.email &&
                              createForm.touched?.email &&
                              !createForm.errors?.email
                            }
                            autoFocus
                            style={{ borderRadius: "0" }}
                          />
                          <InputGroup.Text
                            className={
                              createForm.email && createForm.touched?.email
                                ? createForm.errors?.email
                                  ? "border-danger bg-danger bg-opacity-10"
                                  : "border-success bg-success bg-opacity-10"
                                : ""
                            }
                          >
                            {createForm.email && createForm.touched?.email ? (
                              createForm.errors?.email ? (
                                <FiAlertCircle
                                  size={16}
                                  className="text-danger"
                                />
                              ) : (
                                <FiCheck size={16} className="text-success" />
                              )
                            ) : null}
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.email}
                          </Form.Control.Feedback>
                        </InputGroup>
                        <Form.Text
                          style={{ color: "#6c757d", fontSize: "13px" }}
                        >
                          {createForm.role === "Clinician"
                            ? "Must use @students.nu-moa.edu.ph domain for Clinicians"
                            : "Must use @nu-moa.edu.ph domain for Clinical Staff"}
                        </Form.Text>
                      </Form.Group>
                    </div>
                  )}

                  {/* Step 2: Personal Information */}
                  {createForm.currentStep === 1 && (
                    <div style={{ padding: "10px 0" }}>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#212529",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 14px",
                          background: "#f8f9fa",
                          borderRadius: "6px",
                        }}
                      >
                        <FiUser />
                        <span>Personal Information</span>
                      </div>

                      {/* Name fields */}
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ flex: "0 0 25%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "block", // Changed from "flex" to "block"
                              marginBottom: "6px",
                            }}
                          >
                            Prefix
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Dr., Mr., Ms."
                            value={createForm.prefix}
                            onChange={(e) => {
                              handleCreateFormChange("prefix", e.target.value);
                              validateField("prefix", e.target.value);
                            }}
                            onBlur={() => markFieldAsTouched("prefix")}
                            isInvalid={
                              createForm.touched?.prefix &&
                              createForm.errors?.prefix
                            }
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.prefix}
                          </Form.Control.Feedback>
                        </div>

                        <div style={{ flex: "0 0 75%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "6px",
                            }}
                          >
                            <span>First Name</span>
                            <span style={{ color: "#dc3545" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            value={createForm.firstName}
                            onChange={(e) => {
                              handleCreateFormChange(
                                "firstName",
                                e.target.value
                              );
                              validateField("firstName", e.target.value);
                            }}
                            onBlur={() => markFieldAsTouched("firstName")}
                            isInvalid={
                              createForm.touched?.firstName &&
                              createForm.errors?.firstName
                            }
                            isValid={
                              createForm.firstName &&
                              createForm.touched?.firstName &&
                              !createForm.errors?.firstName
                            }
                            required
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.firstName}
                          </Form.Control.Feedback>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ flex: "0 0 50%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "block",
                              marginBottom: "6px",
                            }}
                          >
                            Middle Name (Optional)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter middle name (optional)"
                            value={createForm.middlename}
                            onChange={(e) => {
                              handleCreateFormChange(
                                "middlename",
                                e.target.value
                              );
                              validateField("middlename", e.target.value);
                            }}
                            onBlur={() => markFieldAsTouched("middlename")}
                            isInvalid={
                              createForm.touched?.middlename &&
                              createForm.errors?.middlename
                            }
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.middlename}
                          </Form.Control.Feedback>
                        </div>

                        <div style={{ flex: "0 0 50%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "6px",
                            }}
                          >
                            <span>Surname</span>
                            <span style={{ color: "#dc3545" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter surname"
                            value={createForm.surname}
                            onChange={(e) => {
                              handleCreateFormChange("surname", e.target.value);
                              validateField("surname", e.target.value);
                            }}
                            onBlur={() => markFieldAsTouched("surname")}
                            isInvalid={
                              createForm.touched?.surname &&
                              createForm.errors?.surname
                            }
                            isValid={
                              createForm.surname &&
                              createForm.touched?.surname &&
                              !createForm.errors?.surname
                            }
                            required
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.surname}
                          </Form.Control.Feedback>
                        </div>
                      </div>

                      {/* ID, Year Level, and Section */}
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ flex: "0 0 33.33%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "6px",
                            }}
                          >
                            <span>ID Number</span>
                            <span style={{ color: "#dc3545" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., 2023-231232"
                            value={createForm.idNumber}
                            onChange={(e) => {
                              handleCreateFormChange(
                                "idNumber",
                                e.target.value
                              );
                              validateField("idNumber", e.target.value);
                            }}
                            onBlur={() => markFieldAsTouched("idNumber")}
                            isInvalid={
                              createForm.touched?.idNumber &&
                              createForm.errors?.idNumber
                            }
                            isValid={
                              createForm.idNumber &&
                              createForm.touched?.idNumber &&
                              !createForm.errors?.idNumber
                            }
                            required
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.idNumber}
                          </Form.Control.Feedback>
                          <Form.Text
                            style={{ color: "#6c757d", fontSize: "12px" }}
                          >
                            Should start with a year (e.g., 2024)
                          </Form.Text>
                        </div>

                        <div style={{ flex: "0 0 33.33%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "6px",
                            }}
                          >
                            <span>Year Level</span>
                            {createForm.role === "Clinician" && (
                              <span style={{ color: "#dc3545" }}>*</span>
                            )}
                          </Form.Label>
                          <Form.Select
                            value={createForm.yearLevel}
                            onChange={(e) => {
                              handleCreateFormChange(
                                "yearLevel",
                                e.target.value
                              );
                              validateField(
                                "yearLevel",
                                e.target.value,
                                createForm.role
                              );
                            }}
                            onBlur={() => markFieldAsTouched("yearLevel")}
                            isInvalid={
                              createForm.touched?.yearLevel &&
                              createForm.errors?.yearLevel
                            }
                            isValid={
                              createForm.role === "Clinician" &&
                              createForm.yearLevel &&
                              createForm.touched?.yearLevel &&
                              !createForm.errors?.yearLevel
                            }
                            disabled={createForm.role === "Clinical Instructor"}
                            required={createForm.role === "Clinician"}
                            style={{ fontSize: "14px" }}
                          >
                            <option value="">
                              {createForm.role === "Clinical Instructor"
                                ? "Not applicable"
                                : "Select year level"}
                            </option>
                            {createForm.role === "Clinician" && (
                              <>
                                <option value="5th Year">5th Year</option>
                                <option value="6th Year">6th Year</option>
                              </>
                            )}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.yearLevel}
                          </Form.Control.Feedback>
                          <Form.Text
                            style={{ color: "#6c757d", fontSize: "12px" }}
                          >
                            {createForm.role === "Clinician"
                              ? "Required for Clinician role"
                              : "Not applicable for Clinical Instructor"}
                          </Form.Text>
                        </div>

                        <div style={{ flex: "0 0 33.33%" }}>
                          <Form.Label
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginBottom: "6px",
                            }}
                          >
                            <span>Section</span>
                            {createForm.role === "Clinician" && (
                              <span style={{ color: "#dc3545" }}>*</span>
                            )}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={
                              createForm.role === "Clinician"
                                ? "e.g.,DENT222"
                                : "Not applicable"
                            }
                            value={createForm.section || ""}
                            onChange={(e) => {
                              handleCreateFormChange("section", e.target.value);
                              validateField(
                                "section",
                                e.target.value,
                                createForm.role
                              );
                            }}
                            onBlur={() => markFieldAsTouched("section")}
                            isInvalid={
                              createForm.touched?.section &&
                              createForm.errors?.section
                            }
                            isValid={
                              createForm.role === "Clinician" &&
                              createForm.section &&
                              createForm.touched?.section &&
                              !createForm.errors?.section
                            }
                            disabled={createForm.role === "Clinical Instructor"}
                            required={createForm.role === "Clinician"}
                            style={{ fontSize: "14px" }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {createForm.errors?.section}
                          </Form.Control.Feedback>
                          <Form.Text
                            style={{ color: "#6c757d", fontSize: "12px" }}
                          >
                            {createForm.role === "Clinician"
                              ? "Required section identifier"
                              : "Not applicable for Clinical Instructor"}
                          </Form.Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Optional Information */}
                  {createForm.currentStep === 2 && (
                    <div style={{ padding: "10px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          borderBottom: "1px solid #dee2e6",
                          marginBottom: "16px",
                        }}
                      >
                        {["Personal", "Contact", "Emergency"].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() =>
                              setCreateForm({
                                ...createForm,
                                activeTab: tab.toLowerCase(),
                              })
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: "10px 16px",
                              cursor: "pointer",
                              color:
                                createForm.activeTab === tab.toLowerCase()
                                  ? "#198754"
                                  : "#6c757d",
                              fontWeight:
                                createForm.activeTab === tab.toLowerCase()
                                  ? 600
                                  : 400,
                              borderBottom:
                                createForm.activeTab === tab.toLowerCase()
                                  ? "2px solid #198754"
                                  : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {tab === "Personal" ? (
                              <FiUser style={{ marginRight: "6px" }} />
                            ) : tab === "Contact" ? (
                              <FiPhone style={{ marginRight: "6px" }} />
                            ) : (
                              <FiAlertCircle style={{ marginRight: "6px" }} />
                            )}
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Personal Details Tab with validation */}
                      {createForm.activeTab === "personal" && (
                        <div style={{ padding: "0" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginBottom: "16px",
                            }}
                          >
                            <div style={{ flex: "0 0 33.33%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginBottom: "6px",
                                }}
                              >
                                <span>Date of Birth</span>
                                <span style={{ color: "#dc3545" }}>*</span>
                              </Form.Label>
                              <Form.Control
                                type="date"
                                value={createForm.dob}
                                onChange={(e) => {
                                  handleCreateFormChange("dob", e.target.value);
                                  validateField("dob", e.target.value);
                                }}
                                onBlur={() => markFieldAsTouched("dob")}
                                isInvalid={
                                  createForm.touched?.dob &&
                                  createForm.errors?.dob
                                }
                                max={new Date().toISOString().split("T")[0]}
                                style={{ fontSize: "14px" }}
                              />
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.dob}
                              </Form.Control.Feedback>
                            </div>

                            <div style={{ flex: "0 0 33.33%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginBottom: "6px",
                                }}
                              >
                                <span>Gender</span>
                                <span style={{ color: "#dc3545" }}>*</span>
                              </Form.Label>
                              <Form.Select
                                value={createForm.gender}
                                onChange={(e) => {
                                  handleCreateFormChange(
                                    "gender",
                                    e.target.value
                                  );
                                  validateField("gender", e.target.value);
                                }}
                                onBlur={() => markFieldAsTouched("gender")}
                                isInvalid={
                                  createForm.touched?.gender &&
                                  createForm.errors?.gender
                                }
                                style={{ fontSize: "14px" }}
                              >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">
                                  Prefer not to say
                                </option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.gender}
                              </Form.Control.Feedback>
                            </div>

                            <div style={{ flex: "0 0 33.33%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginBottom: "6px",
                                }}
                              >
                                <span>Marital Status</span>
                                <span style={{ color: "#dc3545" }}>*</span>
                              </Form.Label>
                              <Form.Select
                                value={createForm.marital_status}
                                onChange={(e) => {
                                  handleCreateFormChange(
                                    "marital_status",
                                    e.target.value
                                  );
                                  validateField(
                                    "marital_status",
                                    e.target.value
                                  );
                                }}
                                onBlur={() =>
                                  markFieldAsTouched("marital_status")
                                }
                                isInvalid={
                                  createForm.touched?.marital_status &&
                                  createForm.errors?.marital_status
                                }
                                style={{ fontSize: "14px" }}
                              >
                                <option value="">Select status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.marital_status}
                              </Form.Control.Feedback>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Information Tab with validation */}
                      {createForm.activeTab === "contact" && (
                        <div style={{ padding: "0" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginBottom: "16px",
                            }}
                          >
                            <div style={{ flex: "0 0 50%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "block",
                                  marginBottom: "6px",
                                }}
                              >
                                Contact Number
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  type="text"
                                  placeholder="e.g., 09123456789"
                                  value={createForm.contact_no}
                                  onChange={(e) => {
                                    handleCreateFormChange(
                                      "contact_no",
                                      e.target.value
                                    );
                                    validateField("contact_no", e.target.value);
                                  }}
                                  onBlur={() =>
                                    markFieldAsTouched("contact_no")
                                  }
                                  isInvalid={
                                    createForm.touched?.contact_no &&
                                    createForm.errors?.contact_no
                                  }
                                  style={{ fontSize: "14px" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {createForm.errors?.contact_no}
                                </Form.Control.Feedback>
                              </InputGroup>
                              <Form.Text
                                style={{ color: "#6c757d", fontSize: "12px" }}
                              >
                                Philippine format (e.g., 09123456789)
                              </Form.Text>
                            </div>

                            <div style={{ flex: "0 0 50%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "block",
                                  marginBottom: "6px",
                                }}
                              >
                                Permanent Address
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter permanent address"
                                value={createForm.permanent_address}
                                onChange={(e) => {
                                  handleCreateFormChange(
                                    "permanent_address",
                                    e.target.value
                                  );
                                  validateField(
                                    "permanent_address",
                                    e.target.value
                                  );
                                }}
                                onBlur={() =>
                                  markFieldAsTouched("permanent_address")
                                }
                                isInvalid={
                                  createForm.touched?.permanent_address &&
                                  createForm.errors?.permanent_address
                                }
                                style={{ fontSize: "14px" }}
                              />
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.permanent_address}
                              </Form.Control.Feedback>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact Tab with validation */}
                      {createForm.activeTab === "emergency" && (
                        <div style={{ padding: "0" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginBottom: "16px",
                            }}
                          >
                            <div style={{ flex: "0 0 50%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "block",
                                  marginBottom: "6px",
                                }}
                              >
                                Emergency Contact Person
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Full name of emergency contact"
                                value={createForm.emergency_person}
                                onChange={(e) => {
                                  handleCreateFormChange(
                                    "emergency_person",
                                    e.target.value
                                  );
                                  validateField(
                                    "emergency_person",
                                    e.target.value
                                  );
                                }}
                                onBlur={() =>
                                  markFieldAsTouched("emergency_person")
                                }
                                isInvalid={
                                  createForm.touched?.emergency_person &&
                                  createForm.errors?.emergency_person
                                }
                                style={{ fontSize: "14px" }}
                              />
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.emergency_person}
                              </Form.Control.Feedback>
                            </div>

                            <div style={{ flex: "0 0 50%" }}>
                              <Form.Label
                                style={{
                                  fontWeight: 500,
                                  fontSize: "14px",
                                  display: "block",
                                  marginBottom: "6px",
                                }}
                              >
                                Emergency Contact Number
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="e.g., 09123456789"
                                value={createForm.emergency_contact_no}
                                onChange={(e) => {
                                  handleCreateFormChange(
                                    "emergency_contact_no",
                                    e.target.value
                                  );
                                  validateField(
                                    "emergency_contact_no",
                                    e.target.value
                                  );
                                }}
                                onBlur={() =>
                                  markFieldAsTouched("emergency_contact_no")
                                }
                                isInvalid={
                                  createForm.touched?.emergency_contact_no &&
                                  createForm.errors?.emergency_contact_no
                                }
                                style={{ fontSize: "14px" }}
                              />
                              <Form.Control.Feedback type="invalid">
                                {createForm.errors?.emergency_contact_no}
                              </Form.Control.Feedback>
                            </div>
                          </div>

                          <div style={{ marginBottom: "16px" }}>
                            <Form.Label
                              style={{
                                fontWeight: 500,
                                fontSize: "14px",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              Emergency Contact Address
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter emergency contact address"
                              value={createForm.emergency_address}
                              onChange={(e) => {
                                handleCreateFormChange(
                                  "emergency_address",
                                  e.target.value
                                );
                                validateField(
                                  "emergency_address",
                                  e.target.value
                                );
                              }}
                              onBlur={() =>
                                markFieldAsTouched("emergency_address")
                              }
                              isInvalid={
                                createForm.touched?.emergency_address &&
                                createForm.errors?.emergency_address
                              }
                              style={{ fontSize: "14px" }}
                            />
                            <Form.Control.Feedback type="invalid">
                              {createForm.errors?.emergency_address}
                            </Form.Control.Feedback>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {singleProgress > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <ProgressBar
                            now={singleProgress}
                            label={`${singleProgress}%`}
                            variant="success"
                            animated
                            striped
                          />
                        </div>
                      )}

                      {/* Important Info Alert */}
                      <div
                        style={{
                          background: "rgba(13, 202, 240, 0.1)",
                          border: "1px solid rgba(13, 202, 240, 0.2)",
                          borderRadius: "6px",
                          padding: "12px 16px",
                          marginTop: "16px",
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <FiMail
                          style={{
                            color: "#0dcaf0",
                            marginTop: "3px",
                            flexShrink: 0,
                          }}
                          size={16}
                        />
                        <div style={{ fontSize: "14px", color: "#055160" }}>
                          <strong>Important:</strong> The user will receive an
                          email with login credentials. They must complete their
                          profile after logging in to activate their account.
                        </div>
                      </div>
                    </div>
                  )}
                </Form>
              </Modal.Body>

              {/* Step Navigation Footer */}
              <Modal.Footer
                style={{
                  borderTop: "1px solid #eee",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {createForm.currentStep > 0 && (
                    <Button
                      variant="light"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                        padding: "8px 16px",
                      }}
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          currentStep: createForm.currentStep - 1,
                        })
                      }
                    >
                      <FiArrowLeft size={16} /> Back
                    </Button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCsvFile(null);
                      setCsvPreview([]);
                      setCreateForm({
                        email: "",
                        firstName: "",
                        middlename: "",
                        surname: "",
                        idNumber: "",
                        role: "Clinician",
                        yearLevel: "",
                        createType: "single",
                        // Reset highlighted fields
                        prefix: "",
                        dob: "",
                        gender: "",
                        marital_status: "",
                        // Reset contact information fields
                        contact_no: "",
                        permanent_address: "",
                        emergency_person: "",
                        emergency_contact_no: "",
                        emergency_address: "",
                        // Reset step and tab
                        currentStep: 0,
                        activeTab: "personal",
                        // Reset validation state
                        errors: {},
                        touched: {},
                      });
                    }}
                    disabled={createLoading}
                    style={{ fontWeight: 500 }}
                  >
                    Cancel
                  </Button>

                  {createForm.currentStep < 2 ? (
                    <Button
                      variant="primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                        background: "#198754",
                        borderColor: "#198754",
                        padding: "8px 16px",
                      }}
                      onClick={() => {
                        // Validate current step fields before proceeding
                        const isCurrentStepValid = validateCurrentStep(
                          createForm.currentStep,
                          createForm
                        );
                        if (isCurrentStepValid) {
                          setCreateForm({
                            ...createForm,
                            currentStep: createForm.currentStep + 1,
                          });
                        } else {
                          // Show validation message
                          message.error(
                            "Please correct the errors before proceeding"
                          );
                        }
                      }}
                      disabled={
                        (createForm.currentStep === 0 &&
                          (!createForm.email || createForm.errors?.email)) ||
                        (createForm.currentStep === 1 &&
                          (!createForm.firstName ||
                            !createForm.surname ||
                            !createForm.idNumber ||
                            createForm.errors?.firstName ||
                            createForm.errors?.surname ||
                            createForm.errors?.idNumber ||
                            (createForm.role === "Clinician" &&
                              (!createForm.yearLevel ||
                                !createForm.section ||
                                createForm.errors?.yearLevel ||
                                createForm.errors?.section))))
                      }
                    >
                      Next <FiArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() => {
                        // Final validation before submitting
                        const isValid = validateAllFields(createForm);
                        if (isValid) {
                          handleCreateUser();
                        } else {
                          message.error(
                            "Please fix validation issues before submitting"
                          );
                        }
                      }}
                      disabled={
                        createLoading ||
                        !createForm.email ||
                        !createForm.firstName ||
                        !createForm.surname ||
                        !createForm.role ||
                        !createForm.idNumber ||
                        !createForm.dob ||
                        !createForm.gender ||
                        !createForm.marital_status ||
                        !createForm.contact_no ||
                        !createForm.permanent_address ||
                        !createForm.emergency_person ||
                        !createForm.emergency_contact_no ||
                        !createForm.emergency_address ||
                        (createForm.role === "Clinician" &&
                          (!createForm.yearLevel || !createForm.section)) ||
                        Object.keys(createForm.errors || {}).length > 0
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                        padding: "8px 20px",
                      }}
                    >
                      {createLoading ? (
                        <>
                          <Spin size="small" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FiUserPlus size={16} />
                          Create User
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Modal.Footer>
            </>
          )}
          {/* Rest of the CSV Upload Form stays the same */}
          {createForm.createType === "csv" && (
            <Modal.Body style={{ padding: "0.5rem 1.5rem 1.5rem" }}>
              <Form>
                <div
                  style={{
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Bulk User Creation via CSV</h6>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={downloadCsvTemplate}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiDownload size={14} /> Download Template
                    </Button>
                  </div>
                  <p className="small text-muted mb-0">
                    Upload a CSV file with user information. All users will be
                    created with the selected role below.
                  </p>
                </div>

                {/* Added role selection for CSV upload */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 500 }}>
                    Select Role for All Users{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex gap-3">
                    <Button
                      variant={
                        csvRole === "Clinician"
                          ? "success"
                          : "outline-secondary"
                      }
                      className="d-flex align-items-center gap-2 flex-grow-1 justify-content-center"
                      onClick={() => setCsvRole("Clinician")}
                    >
                      <FiUser /> Clinician
                    </Button>
                    <Button
                      variant={
                        csvRole === "Clinical Instructor"
                          ? "success"
                          : "outline-secondary"
                      }
                      className="d-flex align-items-center gap-2 flex-grow-1 justify-content-center"
                      onClick={() => setCsvRole("Clinical Instructor")}
                    >
                      <FiUser /> Clinical Instructor
                    </Button>
                  </div>
                  <Form.Text className="text-muted mt-2">
                    {csvRole === "Clinician"
                      ? "All users will require @students.nu-moa.edu.ph email domain"
                      : csvRole === "Clinical Instructor"
                      ? "All users will require @nu-moa.edu.ph email domain"
                      : "Select a role for all users in the CSV"}
                  </Form.Text>
                </Form.Group>

                <div className="mb-4">
                  <Form.Label>Select CSV File</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="file"
                      onChange={handleCsvFileChange}
                      accept=".csv"
                      ref={fileInputRef}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Only CSV files are supported. Email addresses must match the
                    selected role's domain.
                  </Form.Text>
                </div>

                {csvPreview?.rows?.length > 0 && (
                  <>
                    <div className="mb-3">
                      <h6>
                        Preview ({csvPreview?.rows?.length} of{" "}
                        {csvPreview?.totalRows || 0} rows)
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              {csvPreview.headers.map((header, i) => (
                                <th key={i} style={{ fontSize: "12px" }}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.rows.map((row, i) => (
                              <tr key={i}>
                                {csvPreview.headers.map((header, j) => (
                                  <td key={j} style={{ fontSize: "12px" }}>
                                    {row[header] || ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {csvPreview?.totalRows > 5 && (
                        <p className="small text-muted">
                          Showing first 5 rows of {csvPreview.totalRows} total
                          rows
                        </p>
                      )}
                    </div>

                    {csvProgress > 0 && (
                      <ProgressBar
                        now={csvProgress}
                        label={`${csvProgress}%`}
                        variant="success"
                        className="mb-3"
                        animated
                      />
                    )}
                  </>
                )}

                <Alert
                  variant="info"
                  className="d-flex align-items-start gap-2 mt-3"
                >
                  <FiInfo size={18} className="mt-1" />
                  <div>
                    <strong>Note about CSV format:</strong>
                    <ul className="mb-0 mt-1">
                      <li>Email is the only required field</li>
                      <li>
                        Emails must match the domain for the selected role
                      </li>
                      <li>
                        First name and last name will be set to "To be updated"
                        if empty
                      </li>
                      <li>Year level is required for Clinician role</li>
                      <li>Section is required for Clinician role</li>
                    </ul>
                  </div>
                </Alert>
              </Form>
            </Modal.Body>
          )}
          {/* Updated CSV Form Footer */}
          {createForm.createType === "csv" && (
            <Modal.Footer
              style={{ borderTop: "1px solid #eee", padding: "1rem 1.5rem" }}
            >
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setCsvFile(null);
                  setCsvPreview([]);
                  setCreateForm({
                    ...createForm,
                    createType: "single",
                  });
                  setCsvRole("Clinician"); // Reset to default role
                }}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleCsvUpload}
                disabled={!csvFile || !csvRole || createLoading}
                className="d-flex align-items-center gap-2"
              >
                {createLoading ? (
                  <>
                    <Spin size="small" /> Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} /> Upload & Create {csvRole || ""} Users
                  </>
                )}
              </Button>
            </Modal.Footer>
          )}
        </div>
      </Modal>
      {/* CSV Upload Results Modal */}
      <Modal
        show={showResultsModal}
        onHide={() => setShowResultsModal(false)}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header
          closeButton
          style={{
            background: csvResults?.successful > 0 ? "#d1e7dd" : "#f8d7da",
            borderBottom: "1px solid",
            borderColor: csvResults?.successful > 0 ? "#badbcc" : "#f5c2c7",
          }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            {csvResults?.successful > 0 ? (
              <>
                <BsPersonCheck className="text-success" size={20} />
                <span>Users Created Successfully</span>
              </>
            ) : (
              <>
                <BsPersonX className="text-danger" size={20} />
                <span>CSV Upload Results</span>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {csvResults && (
            <>
              <div className="d-flex justify-content-between mb-3 mt-2">
                <div
                  className="text-center px-3 py-2"
                  style={{ background: "#d1e7dd", borderRadius: "6px" }}
                >
                  <h6 className="text-success mb-1">Successfully Created</h6>
                  <h3>{csvResults.successful}</h3>
                </div>
                <div
                  className="text-center px-3 py-2"
                  style={{ background: "#f8d7da", borderRadius: "6px" }}
                >
                  <h6 className="text-danger mb-1">Failed to Create</h6>
                  <h3>{csvResults.failed}</h3>
                </div>
                <div
                  className="text-center px-3 py-2"
                  style={{ background: "#e2e3e5", borderRadius: "6px" }}
                >
                  <h6 className="text-dark mb-1">Total Processed</h6>
                  <h3>{csvResults.total}</h3>
                </div>
              </div>

              {csvResults.failureDetails &&
                csvResults.failureDetails.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                      <FiAlertCircle className="text-danger" />
                      <span>Failed Records - Reasons for Failure:</span>
                    </h6>
                    <div
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                      className="border rounded"
                    >
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "10%" }}>Row</th>
                            <th style={{ width: "25%" }}>Email</th>
                            <th style={{ width: "65%" }}>Reason for Failure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvResults.failureDetails.map((detail, idx) => {
                            // Determine error category for styling
                            const errorType = detail.message
                              ?.toLowerCase()
                              .includes("duplicate")
                              ? "warning"
                              : detail.message?.toLowerCase().includes("email")
                              ? "info"
                              : detail.message
                                  ?.toLowerCase()
                                  .includes("required")
                              ? "primary"
                              : "danger";

                            const errorBg =
                              errorType === "warning"
                                ? "#fff3cd"
                                : errorType === "info"
                                ? "#cff4fc"
                                : errorType === "primary"
                                ? "#cfe2ff"
                                : "#f8d7da";

                            return (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor:
                                    idx % 2 === 0 ? "white" : "#f8f9fa",
                                }}
                              >
                                <td className="fw-medium">
                                  {detail.row || "Unknown"}
                                </td>
                                <td>{detail.email || "N/A"}</td>
                                <td>
                                  <div className="d-flex gap-2 align-items-start">
                                    <Badge
                                      bg={errorType}
                                      pill
                                      style={{
                                        lineHeight: 1.5,
                                        marginTop: "2px",
                                      }}
                                    >
                                      {errorType === "warning"
                                        ? "Duplicate"
                                        : errorType === "info"
                                        ? "Email Error"
                                        : errorType === "primary"
                                        ? "Missing Data"
                                        : "Error"}
                                    </Badge>
                                    <div>
                                      <span>
                                        {detail.message || "Unknown error"}
                                      </span>

                                      {/* Suggested solution based on error type */}
                                      {errorType === "warning" && (
                                        <small className="d-block text-muted mt-1">
                                          A user with this email already exists
                                          in the system.
                                        </small>
                                      )}
                                      {errorType === "info" && (
                                        <small className="d-block text-muted mt-1">
                                          Check email format or domain
                                          requirements for the user's role.
                                        </small>
                                      )}
                                      {errorType === "primary" && (
                                        <small className="d-block text-muted mt-1">
                                          Fill in all required fields for this
                                          user.
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {csvResults.successful > 0 && (
                <Alert
                  variant="success"
                  className="mt-3 d-flex align-items-center gap-2"
                >
                  <FiMail size={18} />
                  <div>
                    <strong>Emails Sent:</strong> Login credentials have been
                    sent to the {csvResults.successful} newly created users.
                    <small className="d-block mt-1">
                      Users will need to complete their profile after the first
                      login.
                    </small>
                  </div>
                </Alert>
              )}

              {csvResults.failed > 0 && csvResults.successful === 0 && (
                <Alert variant="danger" className="mt-3">
                  <div className="d-flex align-items-start gap-2">
                    <FiAlertCircle size={18} className="mt-1" />
                    <div style={{ width: "100%" }}>
                      <strong className="d-block mb-2">
                        CSV Upload Failed - No users were created
                      </strong>
                      <p>
                        Please check your CSV file for the following common
                        issues:
                      </p>
                      <ul className="mb-2">
                        <li>
                          <strong>Email must be unique:</strong> Each email
                          address must not exist in the system already
                        </li>
                        <li>
                          <strong>ID Number must be unique:</strong> Each ID
                          number must not be associated with another user
                        </li>
                        <li>
                          <strong>Email format:</strong> Ensure emails match the
                          required domain (
                          {csvRole === "Clinician"
                            ? "@students.nu-moa.edu.ph"
                            : "@nu-moa.edu.ph"}
                          )
                        </li>
                        {csvRole === "Clinician" && (
                          <>
                            <li>
                              <strong>Year Level:</strong> Required for
                              Clinicians (use "5th Year" or "6th Year")
                            </li>
                            <li>
                              <strong>Section:</strong> Required for Clinicians
                              (e.g., "DENT222")
                            </li>
                          </>
                        )}
                      </ul>

                      {csvResults.errorMessages && (
                        <div className="bg-light p-2 rounded mb-3 border">
                          <span className="fw-medium">System message:</span>{" "}
                          {csvResults.errorMessages}
                        </div>
                      )}

                      <div className="d-flex justify-content-end mt-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={downloadCsvTemplate}
                          className="d-flex align-items-center gap-2"
                        >
                          <FiDownload size={14} /> Download Template CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={downloadCsvTemplate}
            className="d-flex align-items-center gap-2"
          >
            <FiDownload size={14} /> Get Template
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowResultsModal(false);
              fetchUsers(); // Refresh the user list
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountList;
