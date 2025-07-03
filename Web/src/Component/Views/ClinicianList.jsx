import { useContext, useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  Modal,
  Badge,
  Alert,
  Nav,
} from "react-bootstrap";
import { Table, message, Spin, Tooltip } from "antd";
import {
  FiRefreshCw,
  FiEye,
  FiUsers,
  FiTrash2,
  FiDownload,
  FiArrowLeft,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import { BsPersonCheck, BsPersonX, BsPersonExclamation } from "react-icons/bs";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router";
import axios from "axios";
import TitleHead from "../Custom Hooks/TitleHead";
import "../Views/Styles/ClinicianList.css";
import { API_URL } from "../../config/api";
import { exportToCSV, formatDate } from "../ClinicalChair/utils/csvExport";
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
const ClinicianList = () => {
  TitleHead("Clinician List");
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("status");
  const [clinicians, setClinicians] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tableLoading, setTableLoading] = useState(true);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
  const STATUS_COLORS = {
    "active": "#198754",
    "pending": "#ffc107", 
    "inactive": "#dc3545"
  };
  // Check if current user is Clinical Chair or Clinical Instructor
  const isClinicalChair = user?.role === "Clinical Chair";
  const isClinicalInstructor = user?.role === "Clinical Instructor";

  const fetchClinicians = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user/get/all/by/Clinician`);
      setClinicians(response.data.users);
      setPagination({
        ...pagination,
        total: response.data.users.length,
      });
      message.success({
        content: "Clinicians loaded successfully",
        icon: <BsPersonCheck className="text-success" />,
        duration: 2,
      });
    } catch (error) {
      message.error({
        content: "Failed to fetch clinicians",
        icon: <BsPersonX className="text-danger" />,
        duration: 3,
      });
      console.error("Error fetching clinicians:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchClinicians();
    }
  }, [loading]);
  const prepareChartData = () => {
    // Count clinicians by status
    const statusCounts = { active: 0, pending: 0, inactive: 0 };
    clinicians.forEach((clinician) => {
      const status = clinician.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.keys(statusCounts).map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status],
    }));

    // Count clinicians by department
    const departmentCounts = {};
    clinicians.forEach((clinician) => {
      const dept = clinician.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // Get top 5 departments
    const departmentData = Object.keys(departmentCounts)
      .map((dept) => ({ name: dept, count: departmentCounts[dept] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 departments

    // Monthly registration data (for the timeline)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      months.push({
        name: date.toLocaleDateString("en-US", { month: "short" }),
        month: date.getMonth(),
        year: date.getFullYear(),
        count: 0,
      });
    }

    // Count registrations by month
    clinicians.forEach((clinician) => {
      if (clinician.createdAt) {
        const createdDate = new Date(clinician.createdAt);
        if (createdDate >= sixMonthsAgo) {
          const monthIndex = months.findIndex(
            (m) =>
              m.month === createdDate.getMonth() &&
              m.year === createdDate.getFullYear()
          );
          if (monthIndex !== -1) {
            months[monthIndex].count++;
          }
        }
      }
    });

    return { statusData, departmentData, registrationData: months };
  };

  // Empty chart message component
  const EmptyChartMessage = () => (
    <div className="empty-chart d-flex flex-column align-items-center justify-content-center h-100">
      <FiBarChart2 size={36} className="text-muted mb-2" />
      <p className="text-muted mb-0">No data available</p>
    </div>
  );
  const handleExportToCSV = () => {
    if (!isClinicalChair) {
      message.error("Only Clinical Chair can export data");
      return;
    }

    // Format data for export with standardized structure
    const exportData = clinicians
      .filter((clinician) => clinician.status !== "inactive") // Optional: exclude inactive
      .map((clinician) => ({
        status: clinician.status || "N/A",
        idNumber: clinician.idNumber || "Not Set",
        firstName: clinician.firstName || "",
        middlename: clinician.middlename || "",
        surname: clinician.surname || "",
        fullName: getFullName(clinician),
        email: clinician.email || "",
        department: clinician.department || "N/A",
        yearLevel: clinician.yearLevel || "N/A",
        section: clinician.section || "N/A",
        contactNumber: clinician.contact_no || "N/A",
        createdAt: formatDate
          ? formatDate(clinician.createdAt)
          : clinician.createdAt || "N/A",
        updatedAt: formatDate
          ? formatDate(clinician.updatedAt)
          : clinician.updatedAt || "N/A",
      }));

    const success = exportToCSV(exportData, "clinicians");
    if (success) {
      message.success({
        content: "Clinicians data exported successfully",
        icon: <FiDownload className="text-primary" />,
        duration: 3,
      });
    }
  };

  // Status configurations
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
      default:
        return {
          variant: "secondary",
          icon: <BsPersonExclamation />,
          class: "",
          color: "#6c757d",
        };
    }
  };

  const getFullName = (clinician) => {
    return (
      `${clinician.prefix ? clinician.prefix + " " : ""}${
        clinician.firstName || ""
      } ${clinician.middlename ? clinician.middlename + " " : ""}${
        clinician.surname || ""
      }`.trim() || clinician.email
    );
  };

  // Replace the handleDeleteClinician function with this version that sets status to inactive
  const handleDeleteClinician = async () => {
    if (!isClinicalChair) {
      message.error(
        "Unauthorized: Only Clinical Chair can deactivate clinicians"
      );
      return;
    }

    try {
      setDeleteLoading(true);
      // Instead of deleting, set status to inactive
      await axios.put(`${API_URL}/update/status/${selectedClinician._id}`, {
        status: "inactive",
      });

      message.success({
        content: `${getFullName(selectedClinician)} has been deactivated`,
        icon: <BsPersonX className="text-success" />,
        duration: 2,
      });

      // Update the clinician status in the list
      setClinicians(
        clinicians.map((clinician) =>
          clinician._id === selectedClinician._id
            ? {
                ...clinician,
                status: "inactive",
                updatedAt: new Date().toISOString(),
              }
            : clinician
        )
      );

      setShowDeleteModal(false);
      setSelectedClinician(null);
    } catch (error) {
      message.error("Error deactivating clinician");
      console.error("Error deactivating clinician:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Replace StatusDropdown with simple StatusBadge
  const StatusBadge = ({ status }) => {
    const statusConfig = getStatusConfig(status);

    return (
      <Badge
        bg={statusConfig.variant}
        className={`${statusConfig.class} d-flex align-items-center gap-1`}
        style={{ minWidth: "100px", justifyContent: "center" }}
      >
        {statusConfig.icon}
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
      </Badge>
    );
  };

  // Table column definitions
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Active", value: "active" },
        // Removed inactive filter since we're not showing inactive accounts
      ],
      onFilter: (value, record) => record.status === value,
      width: "120px",
      responsive: ["md"],
    },
    {
      title: "Full Name",
      dataIndex: "firstName",
      key: "name",
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-2">
            <img
              src={
                record.profile
                  ? `${API_URL}/getFile/profile_pics/${record.profile}`
                  : "/bencent.jpg"
              }
              alt={getFullName(record)}
              className="rounded-circle"
              style={{
                width: "32px",
                height: "32px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/bencent.jpg";
              }}
            />
          </div>
          <div>
            <div className="fw-medium">{getFullName(record)}</div>
            <small className="text-muted">{record.email}</small>
          </div>
        </div>
      ),
      sorter: (a, b) => getFullName(a).localeCompare(getFullName(b)),
      width: "250px",
    },
    {
      title: "ID Number",
      dataIndex: "idNumber",
      key: "idNumber",
      render: (idNumber) => (
        <span className={idNumber ? "text-dark" : "text-muted fst-italic"}>
          {idNumber || "Not Set"}
        </span>
      ),
      width: "120px",
      responsive: ["lg"],
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
      width: "150px",
      responsive: ["xl"],
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="d-flex gap-1">
          <Tooltip title="View Details">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/account/details/${record._id}`)}
              className="d-flex align-items-center"
            >
              <FiEye size={14} />
            </Button>
          </Tooltip>
          {isClinicalChair && (
            <Tooltip title="Deactivate Clinician">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  setSelectedClinician(record);
                  setShowDeleteModal(true);
                }}
                className="d-flex align-items-center"
                disabled={record.status === "inactive"}
              >
                <FiTrash2 size={14} />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
      width: "100px",
      fixed: "right",
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Filter clinicians based on search and filters - HIDE INACTIVE ACCOUNTS
  const filteredClinicians = clinicians.filter((clinician) => {
    // First filter out inactive accounts
    if (clinician.status === "inactive") {
      return false;
    }

    const matchesSearch =
      getFullName(clinician).toLowerCase().includes(searchText.toLowerCase()) ||
      clinician.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      (clinician.idNumber &&
        clinician.idNumber.toLowerCase().includes(searchText.toLowerCase())) ||
      clinician.department?.toLowerCase().includes(searchText.toLowerCase());

    const matchesRole =
      selectedRole === "all" || clinician.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || clinician.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Mobile card view with role-based restrictions
  const renderMobileCardView = () => {
    const paginatedClinicians = filteredClinicians.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );

    if (paginatedClinicians.length === 0) {
      return (
        <div className="text-center p-5">
          <FiUsers size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No clinicians found</h6>
          <p className="text-muted small">
            Try adjusting your search or filter criteria
          </p>
        </div>
      );
    }

    return (
      <div className="d-block d-md-none">
        {paginatedClinicians.map((clinician, index) => {
          const statusConfig = getStatusConfig(clinician.status);

          return (
            <Card
              key={clinician._id || index}
              className="mb-3 shadow-sm border-0 user-card"
            >
              <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <img
                      src={
                        clinician.profile
                          ? `${API_URL}/getFile/profile_pics/${clinician.profile}`
                          : "/bencent.jpg"
                      }
                      alt={getFullName(clinician)}
                      className="rounded-circle"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.src = "/bencent.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="fw-bold">{getFullName(clinician)}</div>
                    <Badge bg="info" className="fw-normal">
                      Clinician
                    </Badge>
                  </div>
                </div>
                <StatusBadge status={clinician.status} />
              </Card.Header>
              <Card.Body className="py-3">
                <div className="row g-2">
                  <div className="col-12">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-medium">{clinician.email || "N/A"}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">ID Number</small>
                    <div
                      className={
                        clinician.idNumber
                          ? "fw-medium"
                          : "text-muted fst-italic"
                      }
                    >
                      {clinician.idNumber || "Not Set"}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Department</small>
                    <div
                      className={
                        clinician.department
                          ? "fw-medium"
                          : "text-muted fst-italic"
                      }
                    >
                      {clinician.department || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      navigate(`/account/details/${clinician._id}`)
                    }
                    className="flex-fill d-flex align-items-center justify-content-center gap-1"
                  >
                    <FiEye size={14} /> View
                  </Button>
                  {isClinicalChair && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedClinician(clinician);
                        setShowDeleteModal(true);
                      }}
                      className="flex-fill d-flex align-items-center justify-content-center gap-1"
                      disabled={clinician.status === "inactive"}
                    >
                      <FiTrash2 size={14} /> Deactivate
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}

        {/* Mobile pagination */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={pagination.current === 1}
            onClick={() =>
              setPagination({ ...pagination, current: pagination.current - 1 })
            }
            className="d-flex align-items-center gap-1"
          >
            <i className="bi bi-chevron-left"></i> Previous
          </Button>
          <div className="text-center">
            <Badge bg="light" text="dark" className="fs-6">
              Page {pagination.current} of{" "}
              {Math.ceil(filteredClinicians.length / pagination.pageSize)}
            </Badge>
            <div className="small text-muted mt-1">
              {filteredClinicians.length} total clinicians
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={
              pagination.current * pagination.pageSize >=
              filteredClinicians.length
            }
            onClick={() =>
              setPagination({ ...pagination, current: pagination.current + 1 })
            }
            className="d-flex align-items-center gap-1"
          >
            Next <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="py-2 py-md-4">
      {/* Add Back Button Here */}
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="compact-back-btn"
        >
          <FiArrowLeft size={16} />
          <span className="ms-1">Back</span>
        </Button>
      </div>
      <Row className="mb-3 mb-md-4">
        <Col>
          <Card className="shadow-sm border-0">
            {/* Enhanced Header with role-based messaging */}
            <Card.Header className="bg-gradient-primary text-white border-0 clinician-header">
              <div className="clinician-title">
                <h4 className="mb-1 fs-5 ">Clinician Management</h4>
                <small className="opacity-75">
                  {isClinicalChair
                    ? "Manage clinician accounts and their status"
                    : "View clinician accounts and their status"}
                </small>
              </div>
              <div className="clinician-count">
                <Badge bg="light" text="primary" className="count-badge">
                  {filteredClinicians.length} Clinicians
                </Badge>
                {isClinicalInstructor && (
                  <Badge bg="warning" text="dark" className="fs-6">
                    View Only
                  </Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Enhanced Filters Section */}
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
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    {/* Removed inactive option since we're not showing inactive accounts */}
                  </Form.Select>

                  <div className="filter-actions">
                    <Button
                      variant="outline-secondary"
                      className="refresh-btn"
                      onClick={fetchClinicians}
                      title="Refresh"
                    >
                      <FiRefreshCw size={18} />
                    </Button>

                    {isClinicalChair && (
                      <Button
                        variant="outline-primary"
                        className="export-btn"
                        onClick={handleExportToCSV}
                        disabled={tableLoading || clinicians.length === 0}
                        title="Export to CSV"
                      >
                        <FiDownload size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {/* Demographics Charts Section */}
              <div className="demographics-charts-container px-3 py-3 border-bottom">
                <Row className="g-3">
                  {/* Summary Statistics */}
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm mb-3">
                      <Card.Body className="p-0">
                        <div className="stats-row-container">
                          <div className="stats-row">
                            <div className="stats-item">
                              <div className="stats-icon-wrapper bg-primary-subtle">
                                <FiUsers size={24} className="text-primary" />
                              </div>
                              <div className="stats-content">
                                <h3 className="stats-value">
                                  {clinicians.length}
                                </h3>
                                <p className="stats-label">Total Clinicians</p>
                              </div>
                            </div>
                            <div className="stats-item">
                              <div className="stats-icon-wrapper bg-success-subtle">
                                <BsPersonCheck
                                  size={24}
                                  className="text-success"
                                />
                              </div>
                              <div className="stats-content">
                                <h3 className="stats-value">
                                  {
                                    clinicians.filter(
                                      (c) => c.status === "active"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">Active Clinicians</p>
                              </div>
                            </div>
                            <div className="stats-item">
                              <div className="stats-icon-wrapper bg-warning-subtle">
                                <BsPersonExclamation
                                  size={24}
                                  className="text-warning"
                                />
                              </div>
                              <div className="stats-content">
                                <h3 className="stats-value">
                                  {
                                    clinicians.filter(
                                      (c) => c.status === "pending"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">Pending Accounts</p>
                              </div>
                            </div>
                            <div className="stats-item">
                              <div className="stats-icon-wrapper bg-danger-subtle">
                                <BsPersonX size={24} className="text-danger" />
                              </div>
                              <div className="stats-content">
                                <h3 className="stats-value">
                                  {
                                    clinicians.filter(
                                      (c) => c.status === "inactive"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">Inactive Accounts</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Demographics Charts Row */}
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-white border-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className="chart-icon-bg me-2">
                              <FiPieChart size={16} className="text-primary" />
                            </div>
                            <h6 className="mb-0">Clinician Demographics</h6>
                          </div>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="btn-icon-sm"
                            onClick={fetchClinicians}
                            disabled={tableLoading}
                          >
                            <FiRefreshCw
                              size={14}
                              className={tableLoading ? "spin" : ""}
                            />
                            <span className="d-none d-sm-inline ms-1">
                              Refresh
                            </span>
                          </Button>
                        </div>
                      </Card.Header>

                      <Card.Body className="p-0">
                        <div className="charts-nav-wrapper">
                          {/* Chart Navigation Tabs */}
                          <Nav
                            variant="tabs"
                            className="charts-nav border-bottom"
                            activeKey={activeTab}
                            onSelect={(selectedKey) =>
                              setActiveTab(selectedKey)
                            }
                          >
                            <Nav.Item>
                              <Nav.Link
                                eventKey="status"
                                className="charts-nav-link d-flex align-items-center"
                              >
                                <BsPersonCheck className="me-2" size={14} />
                                <span>Status</span>
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link
                                eventKey="departments"
                                className="charts-nav-link d-flex align-items-center"
                              >
                                <FiBarChart2 className="me-2" size={14} />
                                <span>Departments</span>
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link
                                eventKey="timeline"
                                className="charts-nav-link d-flex align-items-center"
                              >
                                <FiCalendar className="me-2" size={14} />
                                <span>Registration Timeline</span>
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>

                          <div className="p-3">
                            {/* Status Chart */}
                            {activeTab === "status" && (
                              <div className="chart-container">
                                <h6 className="chart-title">
                                  Account Status Distribution
                                </h6>
                                {tableLoading ? (
                                  <div className="chart-skeleton d-flex align-items-center justify-content-center">
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
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                          `${name}: ${(percent * 100).toFixed(
                                            0
                                          )}%`
                                        }
                                      >
                                        {prepareChartData().statusData.map(
                                          (entry, index) => (
                                            <Cell
                                              key={`status-cell-${index}`}
                                              fill={
                                                STATUS_COLORS[
                                                  entry.name.toLowerCase()
                                                ] ||
                                                COLORS[index % COLORS.length]
                                              }
                                            />
                                          )
                                        )}
                                      </Pie>
                                      <RechartsTooltip
                                        formatter={(value) => [
                                          `${value} clinicians`,
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

                            {/* Departments Chart */}
                            {activeTab === "departments" && (
                              <div className="chart-container">
                                <h6 className="chart-title">Top Departments</h6>
                                {tableLoading ? (
                                  <div className="chart-skeleton d-flex align-items-center justify-content-center">
                                    <Spin size="large" />
                                  </div>
                                ) : prepareChartData().departmentData.length ===
                                  0 ? (
                                  <EmptyChartMessage />
                                ) : (
                                  <ResponsiveContainer
                                    width="100%"
                                    height={250}
                                  >
                                    <BarChart
                                      data={prepareChartData().departmentData}
                                      layout="vertical"
                                      margin={{
                                        top: 5,
                                        right: 30,
                                        left: 100,
                                        bottom: 5,
                                      }}
                                    >
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={true}
                                        vertical={false}
                                      />
                                      <XAxis type="number" />
                                      <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={90}
                                        tickFormatter={(value) =>
                                          value.length > 12
                                            ? value.substring(0, 12) + "..."
                                            : value
                                        }
                                      />
                                      <RechartsTooltip
                                        formatter={(value, name, props) => [
                                          `${value} clinicians`,
                                          props.payload.name,
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
                                        fill="#0088FE"
                                        radius={[0, 4, 4, 0]}
                                      >
                                        {prepareChartData().departmentData.map(
                                          (entry, index) => (
                                            <Cell
                                              key={`dept-cell-${index}`}
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

                            {/* Registration Timeline Chart */}
                            {activeTab === "timeline" && (
                              <div className="chart-container">
                                <h6 className="chart-title">
                                  Registration Timeline (Last 6 Months)
                                </h6>
                                {tableLoading ? (
                                  <div className="chart-skeleton d-flex align-items-center justify-content-center">
                                    <Spin size="large" />
                                  </div>
                                ) : prepareChartData().registrationData
                                    .length === 0 ? (
                                  <EmptyChartMessage />
                                ) : (
                                  <ResponsiveContainer
                                    width="100%"
                                    height={250}
                                  >
                                    <BarChart
                                      data={prepareChartData().registrationData}
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
                                        dataKey="name"
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
                                          `${value} registrations`,
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
                                        name="Registrations"
                                        fill="#0088FE"
                                        radius={[4, 4, 0, 0]}
                                      />
                                    </BarChart>
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
              {/* Role-based information alert */}
              {isClinicalInstructor && (
                <div className="px-3 pb-0 pt-3">
                  <Alert
                    variant="info"
                    className="mb-0 border-0 bg-info bg-opacity-10"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <BsPersonExclamation className="text-info" />
                      <small>
                        <strong>Note:</strong> You have view-only access.
                        Contact the Clinical Chair to modify clinician status or
                        delete accounts.
                      </small>
                    </div>
                  </Alert>
                </div>
              )}

              <div className="p-3">
                {/* Loading indicator */}
                {tableLoading && (
                  <div className="text-center py-5">
                    <Spin size="large" />
                    <div className="mt-3 text-muted">Loading clinicians...</div>
                  </div>
                )}

                {/* No results message */}
                {!tableLoading && filteredClinicians.length === 0 && (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No clinicians found</h6>
                    <p className="text-muted">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}

                {/* Mobile card view */}
                {!tableLoading &&
                  filteredClinicians.length > 0 &&
                  renderMobileCardView()}

                {/* Enhanced table view */}
                {!tableLoading && filteredClinicians.length > 0 && (
                  <div className="d-none d-md-block">
                    <Table
                      columns={columns}
                      dataSource={filteredClinicians}
                      rowKey={(record) =>
                        record._id || Math.random().toString(36).substr(2, 9)
                      }
                      bordered={false}
                      pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (total, range) =>
                          `Showing ${range[0]}-${range[1]} of ${total} clinicians`,
                        className: "custom-pagination",
                      }}
                      onChange={handleTableChange}
                      size="middle"
                      scroll={{ x: "max-content" }}
                      className="custom-table"
                      rowClassName="table-row-hover"
                    />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal - Only accessible to Clinical Chair */}
      {isClinicalChair && (
        <Modal
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setSelectedClinician(null);
          }}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title className="d-flex align-items-center gap-2">
              <FiTrash2 />
              Deactivate Clinician
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Alert variant="warning" className="border-0">
              <div className="d-flex align-items-start gap-2">
                <BsPersonExclamation className="mt-1 flex-shrink-0" />
                <div>
                  <strong>Warning:</strong> This will set the clinician's status
                  to inactive. Are you sure you want to deactivate this
                  clinician?
                </div>
              </div>
            </Alert>
            {selectedClinician && (
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={
                      selectedClinician.profile
                        ? `${API_URL}/getFile/profile_pics/${selectedClinician.profile}`
                        : "/bencent.jpg"
                    }
                    alt={getFullName(selectedClinician)}
                    className="rounded-circle"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/bencent.jpg";
                    }}
                  />
                  <div>
                    <div className="fw-bold">
                      {getFullName(selectedClinician)}
                    </div>
                    <small className="text-muted">
                      {selectedClinician.email}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClinician(null);
              }}
              disabled={deleteLoading}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteClinician}
              disabled={deleteLoading}
              className="px-4 d-flex align-items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <Spin size="small" />
                  Deactivating...
                </>
              ) : (
                <>
                  <FiTrash2 />
                  Deactivate Clinician
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default ClinicianList;
