import React, { useContext, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Table,
  Badge,
  Button,
  Modal
} from "react-bootstrap";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { useNavigate, useParams } from "react-router";
import { FiArrowLeft } from "react-icons/fi"; // Import FiArrowLeft icon
import { message } from "antd";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "../../config/api";

const SubmittedCaseHistoryLog = () => {
  TitleHead("Submitted Case History Log");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [caseHistory, setCaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add states for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);

  useEffect(() => {
    fetchCaseHistory();
  }, [user]);

  const fetchCaseHistory = async () => {
    try {
      setLoading(true);
      console.log(user.id);
      const response = await axios.get(
        `${API_URL}/clinician/${user.id}/submission`
      );
      console.log(response.data.data);
      setCaseHistory(response.data.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      messageApi.error("Failed to load case history data");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const viewCaseDetails = (caseId) => {
    navigate(`/casehistoryclinician/${caseId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Handler for clicking delete button
  const handleDeleteClick = (caseItem) => {
    setCaseToDelete(caseItem);
    setShowDeleteModal(true);
  };

  // Handler for confirming deletion
  const handleDeleteConfirm = async () => {
    if (!caseToDelete) return;
    
    try {
      // API call to delete the case
      await axios.delete(`${API_URL}/clinician/delete/submission/${caseToDelete._id}`);
      
      // Update the local state to remove the deleted case
      setCaseHistory(caseHistory.filter(item => item._id !== caseToDelete._id));
      
      // Show success message
      messageApi.success("Case deleted successfully");
      
      // Close the modal
      setShowDeleteModal(false);
      setCaseToDelete(null);
    } catch (err) {
      console.error("Error deleting case:", err);
      messageApi.error("Failed to delete case");
    }
  };

  // Handler for canceling deletion
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCaseToDelete(null);
  };

  const navigateToSubmission = () => {
    navigate("/submission/:id");
  };
  
  return (
            <Container fluid className="py-4">
              {/* Back Button - Added at the top */}
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

              {/* Patient Information Card */}
              <Card className="shadow-sm mb-4 patient-card">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs={12} md={6}>
                      <h2 className="h4 mb-1">Clinician Case History</h2>
                      <p className="text-muted mb-1">
                        All submitted cases and their statuses
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

      {/* Case History Table Card */}
      <Card className="shadow-sm mb-4 history-card">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">CASE HISTORY LOG</h4>
          
        </Card.Header>
        <Card.Body className="bg-white">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading case history...</p>
            </div>
          ) : caseHistory.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-folder text-muted" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5>No case history found</h5>
              <p className="text-muted">No cases have been submitted by this clinician yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">#</th>
                    <th>Tally sheet</th>
                    <th>Case Section</th>
                    <th>Case</th>
                    <th>Patient</th>
                    <th>Procedure</th>
                    <th>Description</th>
                    <th className="text-center">Status</th>
                    <th>Submitted Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caseHistory.map((caseItem, index) => (
                    <tr key={caseItem._id || index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{caseItem.tallySheet || "N/A"}</td>
                      <td>{caseItem.section}</td>
                      <td>{caseItem.caseTitle || " "}</td>
                      <td>
                        {caseItem.patient.firstname}{" "}
                        {caseItem.patient.middlename
                          ? caseItem.patient.middlename
                          : ""}{" "}
                        {caseItem.patient.lastname}
                      </td>
                      <td>{caseItem.procedure}</td>
                      <td>{caseItem.description}</td>
                      <td className="text-center">{getStatusBadge(caseItem.status)}</td>
                      <td>{formatDate(caseItem.submittedAt)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => viewCaseDetails(caseItem._id)}
                            title="View case details"
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(caseItem)}
                            title="Delete case"
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination with improved design */}
          {caseHistory.length > 10 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing 1-10 of {caseHistory.length} entries
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item disabled">
                    <a className="page-link" href="#" tabIndex="-1">
                      <i className="bi bi-chevron-left"></i>
                    </a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      <i className="bi bi-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          )}

                  {/* Action Buttons */}
                  <div className="form-action-buttons mt-4">
                    <div className="row g-2">
                      {/* Removed the back button from here since we added it at the top */}
                      <div className="col-12 col-sm-6 col-md-4">
                        <Button
                          variant="outline-primary"
                          onClick={fetchCaseHistory}
                          className="w-100 btn-refresh"
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                        </Button>
                      </div>
                      <div className="col-12 col-md-8">
                        <Button
                          variant="primary"
                          onClick={navigateToSubmission}
                          className="w-100 btn-new-case"
                        >
                          <i className="bi bi-plus-circle me-1"></i> Submit New Case
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Guidelines card with improved design */}
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Case Submission Guidelines
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ul className="mb-0">
                    <li>New cases must be approved by a clinical supervisor</li>
                    <li>
                      Ensure all patient information is up-to-date before
                      submission
                    </li>
                    <li>Cases are reviewed within 2-3 business days</li>
                    <li>
                      For urgent cases, please contact the department directly
                    </li>
                  </ul>
                </Card.Body>
              </Card>


       {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={handleDeleteCancel}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {caseToDelete && (
            <>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone.
              </div>
              <p>Are you sure you want to delete the following case?</p>
              <div className="card bg-light">
                <div className="card-body p-3">
                  <p className="mb-1"><strong>Case:</strong> {caseToDelete.caseTitle}</p>
                  <p className="mb-1"><strong>Patient:</strong> {`${caseToDelete.patient.firstname} ${caseToDelete.patient.lastname}`}</p>
                  <p className="mb-1"><strong>Section:</strong> {caseToDelete.section}</p>
                  <p className="mb-0"><strong>Procedure:</strong> {caseToDelete.procedure}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes, Delete Case
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubmittedCaseHistoryLog;