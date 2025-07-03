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
} from "react-bootstrap";
import { Table, message, Spin, Tooltip } from "antd";
import {
  FiRefreshCw,
  FiEye,
  FiUsers,
  FiTrash2,
  FiDownload,
  FiArrowLeft,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";
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
import { BsPersonCheck, BsPersonX, BsPersonExclamation } from "react-icons/bs";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router";
import axios from "axios";
import TitleHead from "../Custom Hooks/TitleHead";
import "../Views/Styles/AccountList.css";
import { API_URL } from "../../config/api";
import { exportToCSV, formatDate } from "../ClinicalChair/utils/csvExport";

const ClinicalInstructorList = () => {
  TitleHead("Clinical Instructor List");
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  const [clinicalInstructors, setClinicalInstructors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [tableLoading, setTableLoading] = useState(true);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if current user is Clinical Chair
  const isClinicalChair = user?.role === "Clinical Chair";
  // Add after pagination state
  const [activeTab, setActiveTab] = useState("status");

  // Add after isClinicalChair constant
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];
  const STATUS_COLORS = {
    active: "#198754",
    pending: "#ffc107",
  };
  const fetchClinicalInstructors = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/user/get/all/by/Clinical Instructor`
      );
      setClinicalInstructors(response.data.users);
      setPagination({
        ...pagination,
        total: response.data.users.length,
      });
      message.success({
        content: "Clinical Instructors loaded successfully",
        icon: <BsPersonCheck className="text-success" />,
        duration: 2,
      });
    } catch (error) {
      message.error({
        content: "Failed to fetch clinical instructors",
        icon: <BsPersonX className="text-danger" />,
        duration: 3,
      });
      console.error("Error fetching clinical instructors:", error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchClinicalInstructors();
    }
  }, [loading]);
  const prepareChartData = () => {
    // Filter out inactive instructors for chart data
    const activeInstructors = clinicalInstructors.filter(
      (inst) => inst.status !== "inactive"
    );

    // Count instructors by status
    const statusCounts = { active: 0, pending: 0 };
    activeInstructors.forEach((instructor) => {
      const status = instructor.status || "pending";
      if (status !== "inactive") {
        // Extra check to ensure no inactive are counted
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    const statusData = Object.keys(statusCounts).map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status],
    }));

    // Count instructors by department
    const departmentCounts = {};
    activeInstructors.forEach((instructor) => {
      const dept = instructor.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // Get top departments
    const departmentData = Object.keys(departmentCounts)
      .map((dept) => ({ name: dept, count: departmentCounts[dept] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 departments

    // Registration timeline (monthly trend)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Last 6 months including current

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
    activeInstructors.forEach((instructor) => {
      if (instructor.createdAt) {
        const createdDate = new Date(instructor.createdAt);
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
    const exportData = clinicalInstructors
      .filter((instructor) => instructor.status !== "inactive") // Optional: exclude inactive
      .map((instructor) => ({
        status: instructor.status || "N/A",
        idNumber: instructor.idNumber || "Not Set",
        firstName: instructor.firstName || "",
        middlename: instructor.middlename || "",
        surname: instructor.surname || "",
        fullName: getFullName(instructor),
        email: instructor.email || "",
        department: instructor.department || "N/A",
        contactNumber: instructor.contact_no || "N/A",
        createdAt: formatDate
          ? formatDate(instructor.createdAt)
          : instructor.createdAt || "N/A",
        updatedAt: formatDate
          ? formatDate(instructor.updatedAt)
          : instructor.updatedAt || "N/A",
      }));

    const success = exportToCSV(exportData, "clinical-instructors");
    if (success) {
      message.success({
        content: "Clinical instructors data exported successfully",
        icon: <FiDownload className="text-primary" />,
        duration: 3,
      });
    }
  };
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
      default:
        return {
          variant: "secondary",
          icon: <BsPersonExclamation />,
          class: "",
          color: "#6c757d",
        };
    }
  };

  const getFullName = (instructor) => {
    return (
      `${instructor.prefix ? instructor.prefix + " " : ""}${
        instructor.firstName || ""
      } ${instructor.middlename ? instructor.middlename + " " : ""}${
        instructor.surname || ""
      }`.trim() || instructor.email
    );
  };

  // Replace the handleDeleteInstructor function with this version that sets status to inactive
  const handleDeleteInstructor = async () => {
    if (!isClinicalChair) {
      message.error(
        "Unauthorized: Only Clinical Chair can deactivate instructors"
      );
      return;
    }

    try {
      setDeleteLoading(true);
      // Instead of deleting, set status to inactive
      await axios.put(`${API_URL}/update/status/${selectedInstructor._id}`, {
        status: "inactive",
      });

      message.success({
        content: `${getFullName(selectedInstructor)} has been deactivated`,
        icon: <BsPersonX className="text-success" />,
        duration: 2,
      });

      // Update the instructor status in the list
      setClinicalInstructors(
        clinicalInstructors.map((instructor) =>
          instructor._id === selectedInstructor._id
            ? {
                ...instructor,
                status: "inactive",
                updatedAt: new Date().toISOString(),
              }
            : instructor
        )
      );

      setShowDeleteModal(false);
      setSelectedInstructor(null);
    } catch (error) {
      message.error("Error deactivating clinical instructor");
      console.error("Error deactivating clinical instructor:", error);
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

  // Enhanced table columns
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
            <Tooltip title="Deactivate Instructor">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  setSelectedInstructor(record);
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

  // Enhanced filtering - HIDE INACTIVE ACCOUNTS
  const filteredInstructors = clinicalInstructors.filter((instructor) => {
    // First filter out inactive accounts
    if (instructor.status === "inactive") {
      return false;
    }

    const matchesSearch =
      getFullName(instructor)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      instructor.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      (instructor.idNumber &&
        instructor.idNumber.toLowerCase().includes(searchText.toLowerCase())) ||
      instructor.department?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || instructor.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Enhanced mobile card view
  const renderMobileCardView = () => {
    const paginatedInstructors = filteredInstructors.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );

    if (paginatedInstructors.length === 0) {
      return (
        <div className="text-center p-5">
          <FiUsers size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No clinical instructors found</h6>
          <p className="text-muted small">
            Try adjusting your search or filter criteria
          </p>
        </div>
      );
    }

    return (
      <div className="d-block d-md-none">
        {paginatedInstructors.map((instructor, index) => {
          const statusConfig = getStatusConfig(instructor.status);

          return (
            <Card
              key={instructor._id || index}
              className="mb-3 shadow-sm border-0 user-card"
            >
              <Card.Header className="bg-light border-0 d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <img
                      src={
                        instructor.profile
                          ? `${API_URL}/getFile/profile_pics/${instructor.profile}`
                          : "/bencent.jpg"
                      }
                      alt={getFullName(instructor)}
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
                    <div className="fw-bold">{getFullName(instructor)}</div>
                    <Badge bg="info" className="fw-normal">
                      Clinical Instructor
                    </Badge>
                  </div>
                </div>
                <StatusBadge status={instructor.status} />
              </Card.Header>
              <Card.Body className="py-3">
                <div className="row g-2">
                  <div className="col-12">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-medium">{instructor.email || "N/A"}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">ID Number</small>
                    <div
                      className={
                        instructor.idNumber
                          ? "fw-medium"
                          : "text-muted fst-italic"
                      }
                    >
                      {instructor.idNumber || "Not Set"}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Department</small>
                    <div
                      className={
                        instructor.department
                          ? "fw-medium"
                          : "text-muted fst-italic"
                      }
                    >
                      {instructor.department || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      navigate(`/account/details/${instructor._id}`)
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
                        setSelectedInstructor(instructor);
                        setShowDeleteModal(true);
                      }}
                      className="flex-fill d-flex align-items-center justify-content-center gap-1"
                      disabled={instructor.status === "inactive"}
                    >
                      <FiTrash2 size={14} /> Deactivate
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}

        {/* Enhanced mobile pagination */}
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
              {Math.ceil(filteredInstructors.length / pagination.pageSize)}
            </Badge>
            <div className="small text-muted mt-1">
              {filteredInstructors.length} total instructors
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={
              pagination.current * pagination.pageSize >=
              filteredInstructors.length
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
      {/* Add Back Button */}
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
            {/* Enhanced Header */}
            <Card.Header className="bg-gradient-primary text-white border-0 clinician-header">
              <div className="clinician-title">
                <h4 className="mb-1 fs-5">Clinical Instructor Management</h4>
                <small className="opacity-75">
                  {isClinicalChair
                    ? "Manage clinical instructor accounts and their status"
                    : "View clinical instructor accounts and their status"}
                </small>
              </div>
              <div className="clinician-count">
                <Badge bg="light" text="primary" className="count-badge">
                  {filteredInstructors.length} Instructors
                </Badge>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              {/* Updated Filters Section matching ClinicianList */}
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
                      onClick={fetchClinicalInstructors}
                      title="Refresh"
                    >
                      <FiRefreshCw size={18} />
                    </Button>

                    {isClinicalChair && (
                      <Button
                        variant="outline-primary"
                        className="export-btn"
                        onClick={handleExportToCSV}
                        disabled={
                          tableLoading || clinicalInstructors.length === 0
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
                                  {
                                    clinicalInstructors.filter(
                                      (i) => i.status !== "inactive"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">Total Instructors</p>
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
                                    clinicalInstructors.filter(
                                      (i) => i.status === "active"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">
                                  Active Instructors
                                </p>
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
                                    clinicalInstructors.filter(
                                      (i) => i.status === "pending"
                                    ).length
                                  }
                                </h3>
                                <p className="stats-label">Pending Approval</p>
                              </div>
                            </div>
                            <div className="stats-item">
                              <div className="stats-icon-wrapper bg-info-subtle">
                                <FiCalendar size={24} className="text-info" />
                              </div>
                              <div className="stats-content">
                                <h3 className="stats-value">
                                  {
                                    clinicalInstructors.filter((i) => {
                                      if (!i.createdAt) return false;
                                      const createdDate = new Date(i.createdAt);
                                      const thirtyDaysAgo = new Date();
                                      thirtyDaysAgo.setDate(
                                        thirtyDaysAgo.getDate() - 30
                                      );
                                      return (
                                        createdDate >= thirtyDaysAgo &&
                                        i.status !== "inactive"
                                      );
                                    }).length
                                  }
                                </h3>
                                <p className="stats-label">New (30 Days)</p>
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
                            <h6 className="mb-0">Instructor Demographics</h6>
                          </div>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="btn-icon-sm"
                            onClick={fetchClinicalInstructors}
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
                                          `${value} instructors`,
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
                                          `${value} instructors`,
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
                                        allowDecimals={false}
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
              <div className="p-3">
                {/* Loading indicator */}
                {tableLoading && (
                  <div className="text-center py-5">
                    <Spin size="large" />
                    <div className="mt-3 text-muted">
                      Loading clinical instructors...
                    </div>
                  </div>
                )}

                {/* No results message */}
                {!tableLoading && filteredInstructors.length === 0 && (
                  <div className="text-center py-5">
                    <FiUsers size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">
                      No clinical instructors found
                    </h6>
                    <p className="text-muted">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}

                {/* Mobile card view */}
                {!tableLoading &&
                  filteredInstructors.length > 0 &&
                  renderMobileCardView()}

                {/* Enhanced table view */}
                {!tableLoading && filteredInstructors.length > 0 && (
                  <div className="d-none d-md-block">
                    <Table
                      columns={columns}
                      dataSource={filteredInstructors}
                      rowKey={(record) =>
                        record._id || Math.random().toString(36).substr(2, 9)
                      }
                      bordered={false}
                      pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (total, range) =>
                          `Showing ${range[0]}-${range[1]} of ${total} instructors`,
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
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedInstructor(null);
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FiTrash2 />
            Deactivate Clinical Instructor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="warning" className="border-0">
            <div className="d-flex align-items-start gap-2">
              <BsPersonExclamation className="mt-1 flex-shrink-0" />
              <div>
                <strong>Warning:</strong> This will set the clinical
                instructor's status to inactive. Are you sure you want to
                deactivate this clinical instructor?
              </div>
            </div>
          </Alert>
          {selectedInstructor && (
            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={
                    selectedInstructor.profile
                      ? `${API_URL}/getFile/profile_pics/${selectedInstructor.profile}`
                      : "/bencent.jpg"
                  }
                  alt={getFullName(selectedInstructor)}
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
                    {getFullName(selectedInstructor)}
                  </div>
                  <small className="text-muted">
                    {selectedInstructor.email}
                  </small>
                  <div>
                    <Badge bg="info" className="fw-normal mt-1">
                      Clinical Instructor
                    </Badge>
                  </div>
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
              setSelectedInstructor(null);
            }}
            disabled={deleteLoading}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteInstructor}
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
                Deactivate Instructor
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClinicalInstructorList;
