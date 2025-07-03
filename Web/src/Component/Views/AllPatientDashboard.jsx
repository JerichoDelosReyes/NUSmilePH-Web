import React, { useContext, useEffect, useState, useRef } from "react";
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
} from "react-bootstrap";
import { FiBarChart2, FiPieChart, FiPlus } from "react-icons/fi";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Nav } from "react-bootstrap";
import { Table, App, Spin, Tooltip } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiUserPlus,
  FiUsers,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiCalendar,
  FiMail,
  FiPhone,
  FiArrowLeft,
} from "react-icons/fi";
import {
  BsPersonCheck,
  BsPersonX,
  BsPersonExclamation,
  BsGenderAmbiguous,
  BsGenderFemale,
  BsGenderMale,
} from "react-icons/bs";
import { MdHealthAndSafety, MdLocalHospital } from "react-icons/md";
import TitleHead from "../Custom Hooks/TitleHead";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import "../Views/Styles/AllPatientDashboard.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { exportToCSV } from "../ClinicalChair/utils/csvExport";

const AllPatientDashboard = () => {
  TitleHead("Patient List");
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState("all");
  const [loadingData, setLoadingData] = useState(true);
  const { message: messageApi } = App.useApp();

  // Use a ref to track if patients have been loaded already
  const patientsLoaded = useRef(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [activeTab, setActiveTab] = useState("gender");

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const GENDER_COLORS = {
    Male: "#0088FE",
    Female: "#FF6B81",
  };

  const STATUS_COLORS = {
    Active: "#4CAF50",
    "Follow-up": "#2196F3",
    "New Patient": "#FFC107",
    Inactive: "#9E9E9E",
  };
  
  const getPatients = async () => {
    setLoadingData(true);
    try {
      // Use different API endpoint based on user role
      const apiUrl =
        user.role === "Clinical Chair"
          ? `${API_URL}/patients/get/all`
          : `${API_URL}/clinician/${user.id}/get/patients`;

      const res = await axios.get(apiUrl);
      setPatients(res.data);
      setFilteredPatients(res.data);
      setPagination({
        ...pagination,
        total: res.data.length,
      });

      // Only show success message if it's a manual refresh (not initial load)
      if (patientsLoaded.current) {
        messageApi.success({
          content: "Patients loaded successfully",
          icon: <BsPersonCheck className="text-success" />,
          duration: 2,
        });
      } else {
        // Set the ref to true since we've now loaded patients once
        patientsLoaded.current = true;
      }
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Failed to fetch patients",
        icon: <BsPersonX className="text-danger" />,
        duration: 3,
      });
    } finally {
      setLoadingData(false);
    }
  };
  
  const prepareChartData = () => {
    const genderData = [];
    const ageGroups = {
      "0-17": 0,
      "18-30": 0,
      "31-45": 0,
      "46-60": 0,
      "61+": 0,
    };
    const statusData = [];

    // Count genders
    const genderCounts = { Male: 0, Female: 0 };
    patients.forEach((patient) => {
      if (patient.gender) {
        genderCounts[patient.gender] = (genderCounts[patient.gender] || 0) + 1;
      }
    });

    Object.keys(genderCounts).forEach((gender) => {
      if (genderCounts[gender] > 0) {
        genderData.push({ name: gender, value: genderCounts[gender] });
      }
    });

    // Count ages
    patients.forEach((patient) => {
      const age = parseInt(patient.age || 0);
      if (age < 18) ageGroups["0-17"]++;
      else if (age < 31) ageGroups["18-30"]++;
      else if (age < 46) ageGroups["31-45"]++;
      else if (age < 61) ageGroups["46-60"]++;
      else ageGroups["61+"]++;
    });

    const ageData = Object.keys(ageGroups).map((range) => ({
      range,
      count: ageGroups[range],
    }));

    // Count statuses
    const statusCounts = {};
    patients.forEach((patient) => {
      const status = getPatientStatusColor(patient).label;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    Object.keys(statusCounts).forEach((status) => {
      if (statusCounts[status] > 0) {
        statusData.push({ name: status, value: statusCounts[status] });
      }
    });

    return { genderData, ageData, statusData };
  };

  const EmptyChartMessage = () => (
    <div className="pd-empty-chart d-flex flex-column align-items-center justify-content-center h-100">
      <FiBarChart2 size={36} className="text-muted mb-2" />
      <p className="text-muted mb-0">No data available</p>
    </div>
  );
  
  const handleExportToCSV = () => {
    // Check if user has permission
    if (!user || user.role !== "Clinical Chair") {
      messageApi.error({
        content: "Only Clinical Chair can export patient data",
        icon: <FiDownload className="text-danger" />,
        duration: 3,
      });
      return;
    }

    // Format data for export with standardized structure
    const exportData = patients.map((patient) => ({
      status: getPatientStatusColor(patient).label || "N/A",
      firstName: patient.firstname || "",
      middleName: patient.middlename || "",
      lastName: patient.lastname || "",
      fullName: getFullName(patient),
      gender: patient.gender || "N/A",
      age: patient.age || "N/A",
      email: patient.email || "N/A",
      contactNumber: patient.contact_no || "N/A",
      address: patient.permanent_address || "N/A",
      maritalStatus: patient.marital_status || "N/A",
      occupation: patient.occupation || "N/A",
      emergencyContact: patient.emergency_contact_no || "N/A",
      emergencyPerson: patient.emergency_person || "N/A",
      lastVisit: patient.lastVisit
        ? new Date(patient.lastVisit).toISOString().split("T")[0]
        : "N/A",
    }));

    const success = exportToCSV(exportData, "patient-records");
    if (success) {
      messageApi.success({
        content: "Patient records exported successfully",
        icon: <FiDownload className="text-success" />,
        duration: 3,
      });
    }
  };
  
  // Modified useEffect to avoid duplicate calls
  useEffect(() => {
    if (!loading && user?.id && !patientsLoaded.current) {
      getPatients();
    }
  }, [loading, user]);

  // Enhanced filtering
  useEffect(() => {
    let filtered = patients.filter((patient) => {
      const fullName = `${patient.firstname} ${patient.middlename || ""} ${
        patient.lastname
      }`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchText.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.contact_no?.includes(searchText);

      const matchesGender =
        selectedGender === "all" || patient.gender === selectedGender;

      let matchesAge = true;
      if (selectedAgeRange !== "all") {
        const age = parseInt(patient.age);
        switch (selectedAgeRange) {
          case "child":
            matchesAge = age < 18;
            break;
          case "adult":
            matchesAge = age >= 18 && age < 65;
            break;
          case "senior":
            matchesAge = age >= 65;
            break;
          default:
            matchesAge = true;
        }
      }

      return matchesSearch && matchesGender && matchesAge;
    });

    setFilteredPatients(filtered);
    setPagination({
      ...pagination,
      total: filtered.length,
      current: 1,
    });
  }, [searchText, selectedGender, selectedAgeRange, patients]);

  // Modified refresh function to explicitly show message
  const handleRefresh = () => {
    getPatients();
  };

  const getPatientStatusColor = (patient) => {
    // You can implement logic based on last visit, treatment status, etc.
    const lastVisit = patient.lastVisit ? new Date(patient.lastVisit) : null;
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
      return { variant: "active", label: "Active", icon: <BsPersonCheck /> };
    if (daysSinceVisit < 90)
      return {
        variant: "info",
        label: "Follow-up",
        icon: <MdHealthAndSafety />,
      };
    return { variant: "secondary", label: "Inactive", icon: <BsPersonX /> };
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return <BsGenderMale className="text-primary" />;
      case "female":
        return <BsGenderFemale className="text-danger" />;
      default:
        return <BsGenderAmbiguous className="text-secondary" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getFullName = (patient) => {
    return `${patient.firstname || ""} ${
      patient.middlename ? patient.middlename + " " : ""
    }${patient.lastname || ""}`.trim();
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/patient/delete/${selectedPatient._id}`, {
        withCredentials: true,
      });

      messageApi.success({
        content: "Patient deleted successfully",
        icon: <FiTrash2 className="text-success" />,
        duration: 3,
      });

      setPatients(
        patients.filter((patient) => patient._id !== selectedPatient._id)
      );
      setShowDeleteModal(false);
      setSelectedPatient(null);
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Error deleting patient",
        icon: <BsPersonX className="text-danger" />,
        duration: 3,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const viewPatientDetails = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const editPatient = (patientId) => {
    navigate(`/patientdata/${patientId}`);
  };

  const addNewPatient = () => {
    navigate("/patientdata");
  };

  // Enhanced table columns with component-specific styling
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const status = getPatientStatusColor(record);
        return (
          <div className={`pd-status-badge pd-${status.variant}`}>
            {status.label === "New Patient" && (
              <Badge bg="success" className="pd-new-badge">New Patient</Badge>
            )}
          </div>
        );
      },
      width: "10%",
      responsive: ["md"],
    },
    {
      title: "Patient Information",
      dataIndex: "firstname",
      key: "name",
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <div className="pd-avatar-container me-3">
            <div
              className={`pd-avatar ${
                record.gender?.toLowerCase() === "female" ? "pd-female" : ""
              }`}
            >
              {getInitials(getFullName(record))}
            </div>
          </div>
          <div>
            <div className="pd-patient-name">
              {getFullName(record)}
            </div>
            <div className="pd-patient-meta">
              <div className="pd-meta-item">
                {getGenderIcon(record.gender)}
                <span>{record.gender || "N/A"}</span>
              </div>
              {record.age && (
                <>
                  <div className="pd-meta-divider"></div>
                  <div className="pd-meta-item">
                    <FiCalendar size={14} />
                    <span>{`${record.age} years`}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => getFullName(a).localeCompare(getFullName(b)),
      width: "25%",
    },
    {
      title: "Contact Information",
      key: "contact",
      render: (_, record) => (
        <div>
          {record.contact_no && (
            <div className="pd-contact-item">
              <FiPhone size={14} className="text-primary" />
              <span>{record.contact_no}</span>
            </div>
          )}
          {record.permanent_address && (
            <div className="pd-address">
              {record.permanent_address}
            </div>
          )}
        </div>
      ),
      width: "25%",
      responsive: ["lg"],
    },
    {
      title: "Medical Info",
      key: "medical",
      render: (_, record) => (
        <div>
          {record.marital_status && (
            <div className="pd-info-item">
              <span className="pd-label">Marital:</span>
              <span>{record.marital_status}</span>
            </div>
          )}
          {record.occupation && (
            <div className="pd-info-item">
              <span className="pd-label">Occ:</span>
              <span>{record.occupation}</span>
            </div>
          )}
        </div>
      ),
      width: "25%",
      responsive: ["xl"],
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="pd-actions">
          <Tooltip title="View Details">
            <Button
              variant="link"
              className="pd-action-btn text-primary"
              onClick={() => viewPatientDetails(record._id)}
              aria-label="View patient details"
            >
              <FiEye size={18} />
            </Button>
          </Tooltip>
          <Tooltip title="Edit Patient">
            <Button
              variant="link"
              className="pd-action-btn text-secondary"
              onClick={() => editPatient(record._id)}
              aria-label="Edit patient"
            >
              <FiEdit size={18} />
            </Button>
          </Tooltip>
          <Tooltip title="Delete Patient">
            <Button
              variant="link"
              className="pd-action-btn text-danger"
              onClick={() => {
                setSelectedPatient(record);
                setShowDeleteModal(true);
              }}
              aria-label="Delete patient"
            >
              <FiTrash2 size={18} />
            </Button>
          </Tooltip>
        </div>
      ),
      width: "15%",
      align: "center",
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  // Enhanced mobile card view
  const renderMobileCardView = () => {
    const paginatedPatients = filteredPatients.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );

    if (paginatedPatients.length === 0) {
      return (
        <div className="text-center p-5">
          <FiUsers size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No patients found</h6>
          <p className="text-muted small">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="primary"
            onClick={addNewPatient}
            className="mt-4 w-100 pd-add-btn"
          >
            <FiUserPlus size={20} />
            <span>Add New Patient</span>
          </Button>
        </div>
      );
    }

    return (
      <div className="d-block d-md-none">
        {paginatedPatients.map((patient, index) => {
          const status = getPatientStatusColor(patient);

          return (
            <Card key={patient._id || index} className="mb-3 pd-mobile-card">
              <Card.Header
                className={`pd-card-header pd-${status.variant}`}
              >
                <div className="d-flex align-items-center">
                  <div
                    className={`pd-mobile-avatar me-3 ${
                      patient.gender?.toLowerCase() === "female" ? "pd-female" : ""
                    }`}
                  >
                    {getInitials(getFullName(patient))}
                  </div>
                  <div>
                    <div className="fw-bold fs-6">{getFullName(patient)}</div>
                    <div className="d-flex align-items-center gap-2 small">
                      {getGenderIcon(patient.gender)}
                      <span>{patient.gender || "N/A"}</span>
                      <span>•</span>
                      <span>
                        {patient.age ? `${patient.age} years` : "Age N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                {status.label === "New Patient" && (
                  <Badge bg="success" className="pd-new-badge">New Patient</Badge>
                )}
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="pd-contact-item">
                      <FiPhone size={16} className="text-primary" />
                      <span>
                        {patient.contact_no || "No phone"}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="pd-contact-item">
                      <FiMail size={16} className="text-primary" />
                      <span>
                        {patient.email || "No email"}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="pd-info-label">Marital Status</div>
                    <div className="pd-info-value">
                      {patient.marital_status || "N/A"}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="pd-info-label">Occupation</div>
                    <div className="pd-info-value">
                      {patient.occupation || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 pd-mobile-actions">
                  <Button
                    variant="outline-primary"
                    onClick={() => viewPatientDetails(patient._id)}
                    className="flex-fill pd-action-btn-mobile"
                  >
                    <FiEye size={16} />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => editPatient(patient._id)}
                    className="flex-fill pd-action-btn-mobile"
                  >
                    <FiEdit size={16} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowDeleteModal(true);
                    }}
                    className="pd-delete-btn-mobile"
                  >
                    <FiTrash2 size={16} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          );
        })}

        {/* Mobile pagination */}
        <div className="pd-mobile-pagination">
          <Button
            variant="outline-primary"
            disabled={pagination.current === 1}
            onClick={() =>
              setPagination({ ...pagination, current: pagination.current - 1 })
            }
            className="pd-pagination-btn"
          >
            <i className="bi bi-chevron-left"></i>
            <span>Previous</span>
          </Button>
          <div className="pd-pagination-info">
            <div className="pd-page-numbers">
              {pagination.current} /{" "}
              {Math.ceil(filteredPatients.length / pagination.pageSize)}
            </div>
            <div className="pd-total-info">
              {filteredPatients.length} total patients
            </div>
          </div>
          <Button
            variant="outline-primary"
            disabled={
              pagination.current * pagination.pageSize >=
              filteredPatients.length
            }
            onClick={() =>
              setPagination({ ...pagination, current: pagination.current + 1 })
            }
            className="pd-pagination-btn"
          >
            <span>Next</span>
            <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="pd-wrapper">
      <Container fluid className="pd-container">
        <Row className="pd-main-row">
          <Col className="pd-main-col">
            <Card className="pd-main-card">
              {/* Header */}
              <Card.Header className="pd-header">
                <div className="pd-title-block">
                  <h5 className="mb-0">Patient Management</h5>
                  <div className="pd-subtitle">
                    Manage patient records and information
                  </div>
                </div>
                <div className="pd-header-controls">
                  <div className="pd-count-badge">
                    <FiUsers size={18} />
                    <span>{filteredPatients.length}</span>
                    <span>Patients</span>
                  </div>
                  {user?.role === "Clinician" && (
                    <Button
                      variant="primary"
                      className="pd-add-button"
                      onClick={addNewPatient}
                    >
                      <FiPlus size={18} className="me-1" /> Add Patient
                    </Button>
                  )}
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                {/* Filter area */}
                <div className="pd-filter-area">
                  <div className="pd-filter-row">
                    {/* Search input */}
                    <input
                      type="text"
                      className="form-control pd-search-input"
                      placeholder="Search by name, email, or phone..."
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                    />

                    {/* Gender dropdown */}
                    <select
                      className="form-select pd-select"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    >
                      <option value="all">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    {/* Age range dropdown */}
                    <select
                      className="form-select pd-select"
                      value={selectedAgeRange}
                      onChange={(e) => setSelectedAgeRange(e.target.value)}
                    >
                      <option value="all">All Ages</option>
                      <option value="child">Child (&lt;18)</option>
                      <option value="adult">Adult (18-64)</option>
                      <option value="senior">Senior (65+)</option>
                    </select>

                    {/* Action buttons */}
                    <div className="pd-filter-actions">
                      <Button
                        variant="outline-secondary"
                        className="pd-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loadingData}
                        title="Refresh"
                      >
                        <FiRefreshCw
                          size={18}
                          className={loadingData ? "pd-spin" : ""}
                        />
                      </Button>

                      {/* Only show export button for Clinical Chair */}
                      {user?.role === "Clinical Chair" && (
                        <Button
                          variant="outline-primary"
                          className="pd-export-btn"
                          onClick={handleExportToCSV}
                          disabled={
                            loadingData || filteredPatients.length === 0
                          }
                          title="Export to CSV"
                        >
                          <FiDownload size={18} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Demographics Charts Section */}
                <div className="pd-charts-container">
                  <Row className="g-3">
                    {/* Summary Statistics Row */}
                    <Col lg={12}>
                      <Card className="pd-stats-card">
                        <Card.Body className="p-0">
                          <div className="pd-stats-container">
                            <div className="pd-stats-row">
                              <div className="pd-stats-item">
                                <div className="pd-stats-icon pd-bg-primary">
                                  <FiUsers size={24} className="text-primary" />
                                </div>
                                <div className="pd-stats-content">
                                  <h3 className="pd-stats-value">
                                    {patients.length}
                                  </h3>
                                  <p className="pd-stats-label">Total Patients</p>
                                </div>
                              </div>
                              <div className="pd-stats-item">
                                <div className="pd-stats-icon pd-bg-success">
                                  <BsPersonCheck
                                    size={24}
                                    className="text-success"
                                  />
                                </div>
                                <div className="pd-stats-content">
                                  <h3 className="pd-stats-value">
                                    {
                                      patients.filter(
                                        (p) =>
                                          getPatientStatusColor(p).label ===
                                          "Active"
                                      ).length
                                    }
                                  </h3>
                                  <p className="pd-stats-label">Active Patients</p>
                                </div>
                              </div>
                              <div className="pd-stats-item">
                                <div className="pd-stats-icon pd-bg-info">
                                  <BsGenderMale
                                    size={24}
                                    className="text-info"
                                  />
                                </div>
                                <div className="pd-stats-content">
                                  <h3 className="pd-stats-value">
                                    {
                                      patients.filter(
                                        (p) => p.gender === "Male"
                                      ).length
                                    }
                                  </h3>
                                  <p className="pd-stats-label">Male Patients</p>
                                </div>
                              </div>
                              <div className="pd-stats-item">
                                <div className="pd-stats-icon pd-bg-danger">
                                  <BsGenderFemale
                                    size={24}
                                    className="text-danger"
                                  />
                                </div>
                                <div className="pd-stats-content">
                                  <h3 className="pd-stats-value">
                                    {
                                      patients.filter(
                                        (p) => p.gender === "Female"
                                      ).length
                                    }
                                  </h3>
                                  <p className="pd-stats-label">Female Patients</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Demographics Charts Row */}
                    <Col lg={12}>
                      <Card className="pd-chart-card">
                        <Card.Header className="pd-chart-header">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <div className="pd-chart-icon">
                                <FiPieChart
                                  size={16}
                                  className="text-primary"
                                />
                              </div>
                              <h6 className="mb-0">Patient Demographics</h6>
                            </div>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="pd-refresh-charts-btn"
                              onClick={handleRefresh}
                              disabled={loadingData}
                            >
                              <FiRefreshCw
                                size={14}
                                className={loadingData ? "pd-spin" : ""}
                              />
                              <span className="d-none d-sm-inline ms-1">
                                Refresh
                              </span>
                            </Button>
                          </div>
                        </Card.Header>

                        <Card.Body className="p-0">
                          <div className="pd-charts-nav-wrapper">
                            {/* Chart Navigation Tabs */}
                            <Nav
                              variant="tabs"
                              className="pd-charts-nav"
                              activeKey={activeTab}
                              onSelect={(selectedKey) =>
                                setActiveTab(selectedKey)
                              }
                            >
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="gender"
                                  className="pd-charts-nav-link"
                                >
                                  <BsGenderAmbiguous
                                    className="me-2"
                                    size={14}
                                  />
                                  <span>Gender</span>
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="age"
                                  className="pd-charts-nav-link"
                                >
                                  <FiBarChart2 className="me-2" size={14} />
                                  <span>Age</span>
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link
                                  eventKey="status"
                                  className="pd-charts-nav-link"
                                >
                                  <BsPersonCheck className="me-2" size={14} />
                                  <span>Status</span>
                                </Nav.Link>
                              </Nav.Item>
                            </Nav>

                            <div className="pd-chart-content">
                              {/* Gender Chart */}
                              {activeTab === "gender" && (
                                <div className="pd-chart-container">
                                  <h6 className="pd-chart-title">
                                    Gender Distribution
                                  </h6>
                                  {loadingData ? (
                                    <div className="pd-chart-loading">
                                      <Spin size="large" />
                                    </div>
                                  ) : prepareChartData().genderData.length ===
                                    0 ? (
                                    <EmptyChartMessage />
                                  ) : (
                                    <ResponsiveContainer
                                      width="100%"
                                      height={250}
                                    >
                                      <PieChart>
                                        <Pie
                                          data={prepareChartData().genderData}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          outerRadius={80}
                                          fill="#8884d8"
                                          dataKey="value"
                                          label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                              0
                                            )}%`
                                          }
                                        >
                                          {prepareChartData().genderData.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`gender-cell-${index}`}
                                                fill={
                                                  GENDER_COLORS[entry.name] ||
                                                  COLORS[index % COLORS.length]
                                                }
                                              />
                                            )
                                          )}
                                        </Pie>
                                        <RechartsTooltip
                                          formatter={(value) => [
                                            `${value} patients`,
                                            "Count",
                                          ]}
                                          contentStyle={{
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "8px",
                                            boxShadow:
                                              "0 2px 12px rgba(0,0,0,0.15)",
                                            border: "none",
                                            padding: "10px",
                                          }}
                                        />
                                        <Legend
                                          layout="horizontal"
                                          verticalAlign="bottom"
                                          align="center"
                                          iconSize={10}
                                          iconType="circle"
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}

                              {/* Age Chart */}
                              {activeTab === "age" && (
                                <div className="pd-chart-container">
                                  <h6 className="pd-chart-title">
                                    Age Distribution
                                  </h6>
                                  {loadingData ? (
                                    <div className="pd-chart-loading">
                                      <Spin size="large" />
                                    </div>
                                  ) : prepareChartData().ageData.length === 0 ||
                                    prepareChartData().ageData.every(
                                      (item) => item.count === 0
                                    ) ? (
                                    <EmptyChartMessage />
                                  ) : (
                                    <ResponsiveContainer
                                      width="100%"
                                      height={250}
                                    >
                                      <BarChart
                                        data={prepareChartData().ageData}
                                        margin={{
                                          top: 20,
                                          right: 10,
                                          left: 0,
                                          bottom: 25,
                                        }}
                                        barSize={20}
                                      >
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          vertical={false}
                                          stroke="#eee"
                                        />
                                        <XAxis
                                          dataKey="range"
                                          scale="point"
                                          tick={{ fontSize: 10 }}
                                          tickLine={false}
                                          axisLine={{ stroke: "#E0E0E0" }}
                                        />
                                        <YAxis
                                          tick={{ fontSize: 10 }}
                                          tickLine={false}
                                          axisLine={{ stroke: "#E0E0E0" }}
                                        />
                                        <RechartsTooltip
                                          formatter={(value) => [
                                            `${value} patients`,
                                            "Count",
                                          ]}
                                          contentStyle={{
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "8px",
                                            boxShadow:
                                              "0 2px 12px rgba(0,0,0,0.15)",
                                            border: "none",
                                            padding: "10px",
                                          }}
                                        />
                                        <Bar
                                          dataKey="count"
                                          name="Patients"
                                          radius={[4, 4, 0, 0]}
                                        >
                                          {prepareChartData().ageData.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`age-cell-${index}`}
                                                fill={
                                                  COLORS[index % COLORS.length]
                                                }
                                              />
                                            )
                                          )}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}

                              {/* Status Chart */}
                              {activeTab === "status" && (
                                <div className="pd-chart-container">
                                  <h6 className="pd-chart-title">
                                    Patient Status
                                  </h6>
                                  {loadingData ? (
                                    <div className="pd-chart-loading">
                                      <Spin size="large" />
                                    </div>
                                  ) : prepareChartData().statusData.length ===
                                    0 ? (
                                    <EmptyChartMessage />
                                  ) : (
                                    <ResponsiveContainer
                                      width="100%"
                                      height={250}
                                    >
                                      <PieChart>
                                        <Pie
                                          data={prepareChartData().statusData}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          innerRadius={30}
                                          outerRadius={80}
                                          paddingAngle={2}
                                          fill="#8884d8"
                                          dataKey="value"
                                          label={({ name, percent }) =>
                                            percent > 0.05
                                              ? `${name}: ${(
                                                  percent * 100
                                                ).toFixed(0)}%`
                                              : ""
                                          }
                                        >
                                          {prepareChartData().statusData.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`status-cell-${index}`}
                                                fill={
                                                  STATUS_COLORS[entry.name] ||
                                                  COLORS[index % COLORS.length]
                                                }
                                              />
                                            )
                                          )}
                                        </Pie>
                                        <RechartsTooltip
                                          formatter={(value) => [
                                            `${value} patients`,
                                            "Count",
                                          ]}
                                          contentStyle={{
                                            backgroundColor:
                                              "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "8px",
                                            boxShadow:
                                              "0 2px 12px rgba(0,0,0,0.15)",
                                            border: "none",
                                            padding: "10px",
                                          }}
                                        />
                                        <Legend
                                          layout="horizontal"
                                          verticalAlign="bottom"
                                          align="center"
                                          iconSize={10}
                                          iconType="circle"
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <div className="pd-table-container">
                  {/* Loading indicator */}
                  {loadingData && (
                    <div className="pd-loading-container">
                      <Spin size="large" />
                      <div className="pd-loading-text">Loading patients...</div>
                    </div>
                  )}

                  {/* No results message with wide button */}
                  {!loadingData && filteredPatients.length === 0 && (
                    <div className="pd-empty-container">
                      <FiUsers size={48} className="pd-empty-icon" />
                      <h6 className="pd-empty-title">No patients found</h6>
                      <p className="pd-empty-text">
                        Try adjusting your search or filter criteria, or add a
                        new patient
                      </p>
                      <Button
                        variant="primary"
                        onClick={addNewPatient}
                        className="pd-empty-button"
                      >
                        <FiUserPlus size={20} /> Add New Patient
                      </Button>
                    </div>
                  )}

                  {/* Mobile card view */}
                  {!loadingData &&
                    filteredPatients.length > 0 &&
                    renderMobileCardView()}

                  {/* Table view with component-specific styling */}
                  {!loadingData && filteredPatients.length > 0 && (
                    <div className="d-none d-md-block pd-table-wrapper">
                      <Table
                        columns={columns}
                        dataSource={filteredPatients}
                        rowKey={(record) =>
                          record._id || Math.random().toString(36).substr(2, 9)
                        }
                        bordered={false}
                        pagination={{
                          ...pagination,
                          showSizeChanger: true,
                          pageSizeOptions: ["10", "20", "50"],
                          showTotal: (total, range) =>
                            `Showing ${range[0]}-${range[1]} of ${total} patients`,
                          className: "pd-pagination",
                          position: ["bottomCenter"],
                        }}
                        onChange={handleTableChange}
                        size="middle"
                        scroll={{ x: "100%" }}
                        className="pd-patient-table"
                        rowClassName="pd-table-row"
                      />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Back Button */}
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="pd-back-btn"
        >
          <FiArrowLeft size={16} />
          <span className="ms-1">Back</span>
        </Button>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedPatient(null);
        }}
        centered
        backdrop="static"
        className="pd-modal"
      >
        <Modal.Header closeButton className="pd-modal-header">
          <Modal.Title className="pd-modal-title">
            <div className="pd-modal-icon">
              <FiTrash2 size={18} />
            </div>
            <span>Delete Patient</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pd-modal-body">
          <Alert variant="danger" className="pd-delete-alert">
            <div className="d-flex align-items-start gap-2">
              <BsPersonX className="mt-1 flex-shrink-0" size={20} />
              <div>
                <strong>Warning!</strong> This action cannot be undone. All
                patient data will be permanently deleted.
              </div>
            </div>
          </Alert>

          {selectedPatient && (
            <div>
              <p className="mb-3">
                Are you sure you want to delete the patient record for:
              </p>
              <div className="pd-confirm-box">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`pd-avatar ${
                      selectedPatient.gender?.toLowerCase() === "female"
                        ? "pd-female"
                        : ""
                    }`}
                  >
                    {getInitials(getFullName(selectedPatient))}
                  </div>
                  <div>
                    <div className="pd-confirm-name">
                      {getFullName(selectedPatient)}
                    </div>
                    <div className="pd-confirm-info">
                      {getGenderIcon(selectedPatient.gender)}
                      <span>{selectedPatient.gender}</span>
                      {selectedPatient.age && (
                        <>
                          <span>•</span>
                          <span>{selectedPatient.age} years</span>
                        </>
                      )}
                    </div>
                    <div className="pd-confirm-contact">
                      {selectedPatient.email ||
                        selectedPatient.contact_no ||
                        "No contact info"}
                    </div>
                  </div>
                </div>
              </div>
              <p className="pd-confirm-warning">
                This will permanently delete all patient data, medical records,
                and treatment history.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="pd-modal-footer">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedPatient(null);
            }}
            disabled={deleteLoading}
            className="pd-cancel-btn"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePatient}
            disabled={deleteLoading}
            className="pd-delete-btn"
          >
            {deleteLoading ? (
              <>
                <Spin size="small" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={16} />
                <span>Delete Patient</span>
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllPatientDashboard;