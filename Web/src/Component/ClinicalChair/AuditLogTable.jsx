import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { Table, message, Spin, Tooltip } from "antd";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Views/Styles/AuditLogTable.css";
import { API_ENDPOINTS, API_URL } from "../../config/api";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiList,
  FiUser,
  FiMail,
  FiClock,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";
import { exportToCSV } from "./utils/csvExport";
import TitleHead from "../Custom Hooks/TitleHead";

const AuditLogTable = () => {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const isClinicalChair = user?.role === "Clinical Chair";
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  TitleHead("Audit Log Management");
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/get/auditlog`, {
          withCredentials: true,
        });

        const logsData = res.data.data || res.data.logs || res.data || [];

        const sortedLogs = logsData.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt || a.date || 0);
          const dateB = new Date(b.timestamp || b.createdAt || b.date || 0);
          return dateB - dateA;
        });

        setLogs(sortedLogs);
        setPagination((prev) => ({
          ...prev,
          total: sortedLogs.length,
        }));
        setLoading(false);

        console.log("Audit logs fetched and sorted:", sortedLogs);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        message.error("Failed to fetch audit logs");
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };
  const handleExportToCSV = () => {
    // Format data for export with standardized structure
    const exportData = logs.map((log) => ({
      date: formatDate(log.timestamp || log.createdAt || log.date),
      time: formatTime(log.timestamp || log.createdAt || log.date),
      username: getFullName(log.user),
      email: log.user?.email || log.userEmail || "N/A",
      role: log.user?.role || log.userRole || "N/A",
      action: formatAction(log.action),
      description: log.description || "",
    }));

    const success = exportToCSV(exportData, "audit-logs");
    if (success) {
      message.success({
        content: "Audit logs exported to CSV successfully",
        duration: 3,
      });
    }
  };

  const isRecentLog = (timestamp) => {
    if (!timestamp) return false;
    const logDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - logDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  // Helper function to get full name from user object
  const getFullName = (userObj) => {
    if (!userObj) return "N/A";

    return userObj.name || "N/A";
  };

  const filteredLogs = logs
    .filter((log) => {
      if (!searchText) return true;

      const searchLower = searchText.toLowerCase();
      const userName = getFullName(log.user);

      return (
        (log.user?.email &&
          log.user.email.toLowerCase().includes(searchLower)) ||
        (log.user?.role && log.user.role.toLowerCase().includes(searchLower)) ||
        (log.action && log.action.toLowerCase().includes(searchLower)) ||
        (log.description &&
          log.description.toLowerCase().includes(searchLower)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(searchLower)) ||
        (log.userRole && log.userRole.toLowerCase().includes(searchLower)) ||
        (userName && userName.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt || a.date || 0);
      const dateB = new Date(b.timestamp || b.createdAt || b.date || 0);
      return dateB - dateA;
    });

  const getBadgeColor = (action) => {
    if (!action) return "bg-secondary";

    const actionLower = action.toLowerCase();

    if (actionLower.includes("sign case") || actionLower.includes("sign case"))
      return "sign-badge";
    if (actionLower.includes("sign")) return "sign-badge";
    if (actionLower.includes("login")) return "login-badge";
    if (actionLower.includes("log out")) return "logout-badge";
    if (actionLower.includes("create")) return "create-badge";
    if (actionLower.includes("update") || actionLower.includes("edit"))
      return "update-badge";
    if (actionLower.includes("delete") || actionLower.includes("remove"))
      return "delete-badge";
    if (actionLower.includes("section")) return "section-badge";
    if (actionLower.includes("view") || actionLower.includes("access"))
      return "view-badge";

    return "bg-info";
  };

  const formatAction = (action) => {
    if (!action) return "Unknown";

    const formatted = action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return formatted;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatFullTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Reordered columns with Date and Time first
  const columns = [
    {
      title: (
        <div className="d-flex align-items-center gap-1">
          <FiCalendar size={14} />
          Date
        </div>
      ),
      dataIndex: "timestamp",
      key: "date",
      width: "12%",
      render: (timestamp, record) => {
        const dateTime = timestamp || record.createdAt || record.date;
        const isRecent = isRecentLog(dateTime);

        return (
          <Tooltip title={formatFullTimestamp(dateTime)} placement="top">
            <div className="date-cell">
              <div className="d-flex align-items-center gap-1">
                <small className="fw-medium">{formatDate(dateTime)}</small>
                {isRecent && (
                  <Badge bg="success" size="sm" className="new-badge-tiny">
                    NEW
                  </Badge>
                )}
              </div>
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || a.date || 0);
        const dateB = new Date(b.timestamp || b.createdAt || b.date || 0);
        return dateB - dateA;
      },
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: (
        <div className="d-flex align-items-center gap-1">
          <FiClock size={14} />
          Time
        </div>
      ),
      dataIndex: "timestamp",
      key: "time",
      width: "10%",
      render: (timestamp, record) => {
        const dateTime = timestamp || record.createdAt || record.date;

        return (
          <Tooltip title={formatFullTimestamp(dateTime)} placement="top">
            <div className="time-cell">
              <small className="fw-medium">{formatTime(dateTime)}</small>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: (
        <div className="d-flex align-items-center gap-1">
          <FiUser size={14} />
          Name
        </div>
      ),
      dataIndex: ["user"],
      key: "name",
      width: "15%",
      render: (userObj, record) => {
        const fullName = getFullName(userObj);

        return (
          <div className="user-name-cell">
            <div className="d-flex align-items-center">
              <div className="user-avatar me-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: "#e9ecef",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {fullName && fullName !== "N/A"
                    ? fullName.charAt(0).toUpperCase()
                    : "?"}
                </div>
              </div>
              <div>
                <div
                  className="fw-medium text-truncate"
                  style={{ maxWidth: "130px" }}
                >
                  {fullName}
                </div>
              </div>
            </div>
          </div>
        );
      },
      responsive: ["sm"],
    },
    {
      title: (
        <div className="d-flex align-items-center gap-1">
          <FiMail size={14} />
          Email
        </div>
      ),
      dataIndex: ["user", "email"],
      key: "email",
      width: "18%",
      render: (email, record) => {
        const userEmail =
          email || record.userEmail || record.user?.email || "N/A";
        return (
          <div className="text-truncate" style={{ maxWidth: "180px" }}>
            <small>{userEmail}</small>
          </div>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Role",
      dataIndex: ["user", "role"],
      key: "role",
      width: "12%",
      render: (role, record) => {
        const userRole = role || record.userRole || record.user?.role || "N/A";
        return (
          <Badge
            bg={
              userRole === "Clinical Chair"
                ? "danger"
                : userRole === "Clinical Instructor"
                ? "warning"
                : "primary"
            }
            className="role-badge"
          >
            {userRole}
          </Badge>
        );
      },
      responsive: ["lg"],
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "15%",
      render: (action) => (
        <span className={`action-badge ${getBadgeColor(action)}`}>
          {formatAction(action)}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (description) => (
        <Tooltip
          title={description}
          placement="topLeft"
          overlayStyle={{ maxWidth: "400px" }}
        >
          <div className="description-cell">{description || "-"}</div>
        </Tooltip>
      ),
    },
  ];

  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination({
      ...pagination,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/get/auditlog`, {
        withCredentials: true,
      });

      const logsData = res.data.data || res.data.logs || res.data || [];

      const sortedLogs = logsData.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || a.date || 0);
        const dateB = new Date(b.timestamp || b.createdAt || b.date || 0);
        return dateB - dateA;
      });

      setLogs(sortedLogs);
      setPagination((prev) => ({
        ...prev,
        total: sortedLogs.length,
        current: 1,
      }));
      setSearchText("");
      message.success("Audit logs refreshed successfully");
    } catch (error) {
      console.error("Error refreshing audit logs:", error);
      message.error("Failed to refresh audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Updated mobile card view with date and time first
  const renderMobileCardView = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    if (paginatedLogs.length === 0) {
      return (
        <div className="text-center p-5">
          <FiList size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No audit logs found</h6>
          <p className="text-muted small">Try adjusting your search criteria</p>
        </div>
      );
    }

    return (
      <div className="d-block d-md-none">
        {paginatedLogs.map((log, index) => {
          const isRecent = isRecentLog(
            log.timestamp || log.createdAt || log.date
          );
          const fullName = getFullName(log.user);
          const dateTime = log.timestamp || log.createdAt || log.date;

          return (
            <Card
              key={log._id || `log-${index}`}
              className={`mb-3 audit-log-card shadow-sm ${
                isRecent ? "recent-log-card" : ""
              }`}
            >
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                {/* Date and Time in header */}
                <div className="d-flex flex-column">
                  <span className="fw-bold">{formatDate(dateTime)}</span>
                  <small className="text-muted">{formatTime(dateTime)}</small>
                </div>
                <span className={`action-badge ${getBadgeColor(log.action)}`}>
                  {formatAction(log.action)}
                </span>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: "#e9ecef",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {fullName && fullName !== "N/A"
                        ? fullName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <strong
                      className="text-truncate"
                      style={{ maxWidth: "200px" }}
                    >
                      {fullName}
                    </strong>
                    {isRecent && (
                      <Badge
                        bg="success"
                        size="sm"
                        className="new-badge-small ms-auto"
                      >
                        NEW
                      </Badge>
                    )}
                  </div>

                  <div>
                    <strong>Email:</strong>
                    <div
                      className="text-truncate small mt-1"
                      style={{ maxWidth: "250px" }}
                    >
                      {log.user?.email || log.userEmail || "N/A"}
                    </div>
                  </div>
                  <div>
                    <strong>Role:</strong>
                    <Badge
                      bg={
                        (log.user?.role || log.userRole) === "Clinical Chair"
                          ? "danger"
                          : (log.user?.role || log.userRole) ===
                            "Clinical Instructor"
                          ? "warning"
                          : "primary"
                      }
                      className="ms-2"
                    >
                      {log.user?.role || log.userRole || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <div className="text-wrap text-break small description-mobile mt-1">
                      {log.description || "-"}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })}

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={pagination.current === 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, current: prev.current - 1 }))
            }
            className="d-flex align-items-center gap-1"
          >
            <i className="bi bi-chevron-left"></i> Previous
          </Button>
          <div className="text-center">
            <Badge bg="light" text="dark" className="fs-6">
              Page {pagination.current} of{" "}
              {Math.ceil(filteredLogs.length / pagination.pageSize)}
            </Badge>
            <div className="small text-muted mt-1">
              {filteredLogs.length} total logs
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={
              pagination.current * pagination.pageSize >= filteredLogs.length
            }
            onClick={() =>
              setPagination((prev) => ({ ...prev, current: prev.current + 1 }))
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
      <div className="mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="compact-back-btn d-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>

      <Row className="mb-3 mb-md-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-gradient-primary text-white border-0 clinician-header">
              <div className="clinician-title">
                <h4 className="mb-1 fs-5">
                  <FiList className="me-2" />
                  Audit Log Management
                </h4>
                <small className="opacity-75">
                  View and monitor system activity logs (Latest First)
                </small>
              </div>
              <div className="clinician-count">
                <Badge bg="light" text="primary" className="count-badge">
                  {filteredLogs.length} Logs
                </Badge>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <div className="filter-area">
                <div className="filter-row">
                  <input
                    type="text"
                    className="search-input form-control"
                    placeholder="Search by name, email, role, action or description..."
                    onChange={handleSearch}
                    value={searchText}
                  />

                  <div className="filter-actions">
                    <Button
                      variant="outline-secondary"
                      className="refresh-btn"
                      onClick={handleRefresh}
                      disabled={loading}
                      title="Refresh"
                    >
                      <FiRefreshCw
                        size={18}
                        className={loading ? "spin" : ""}
                      />
                    </Button>
                    {isClinicalChair && (
                      <Button
                        variant="outline-primary"
                        className="export-btn"
                        onClick={handleExportToCSV}
                        disabled={loading || logs.length === 0}
                        title="Export to CSV"
                      >
                        <FiDownload size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3">
                {loading && (
                  <div className="text-center py-5">
                    <Spin size="large" />
                    <div className="mt-3 text-muted">Loading audit logs...</div>
                  </div>
                )}

                {!loading && filteredLogs.length === 0 && (
                  <div className="text-center py-5">
                    <FiList size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No audit logs found</h6>
                    <p className="text-muted">
                      {searchText
                        ? "Try adjusting your search criteria"
                        : "No audit logs available at the moment"}
                    </p>
                  </div>
                )}

                {!loading && filteredLogs.length > 0 && renderMobileCardView()}

                {!loading && filteredLogs.length > 0 && (
                  <div className="table-responsive position-relative d-none d-md-block">
                    <Table
                      columns={columns}
                      dataSource={filteredLogs}
                      rowKey={(record) =>
                        record._id ||
                        record.id ||
                        Math.random().toString(36).substr(2, 9)
                      }
                      pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredLogs.length,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showTotal: (total, range) =>
                          `Showing ${range[0]}-${range[1]} of ${total} logs (Latest First)`,
                        className: "custom-pagination",
                        showQuickJumper: true,
                      }}
                      onChange={handleTableChange}
                      size="middle"
                      scroll={{ x: "max-content" }}
                      className="custom-table"
                      onRow={() => ({
                        style: { backgroundColor: "#ffffff" },
                      })}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuditLogTable;
