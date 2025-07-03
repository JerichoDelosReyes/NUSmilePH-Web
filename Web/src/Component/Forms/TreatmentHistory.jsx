import React, { useContext, useEffect, useReducer,useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Container, Badge } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import '../Views/Styles/TreatmentHistory.css'; // Make sure to create this CSS file with the provided styles
import TitleHead from '../Custom Hooks/TitleHead';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router';
import { treatmentHistoryReducer, INITIAL_STATE } from '../Reducers/TreatmentHistoryReducer';
import {format} from 'date-fns';
import API_ENDPOINTS from '../../config/api';

const TreatmentHistory = () => {
  TitleHead('Treatment Record History');
  const navigate = useNavigate();
  const {id = ''} = useParams();
  const { user } = useContext(UserContext);
  const [state, dispatch] = useReducer(treatmentHistoryReducer, INITIAL_STATE);

  const getTreatmentHistory = async ()=>{
    await axios.get(`${API_ENDPOINTS.GET_RECORD_TREATMENT(id)}`,)
    .then((res)=>{
      console.log(res.data)
      dispatch({type: 'GET_TREATMENT_HISTORY', payload: res.data})
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  const recordsPerPage = 4;

  useEffect(()=>{
    getTreatmentHistory()
  },[id])

  // Pagination calculations
  const indexOfLastRecord = state.currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = state.filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(state.filteredRecords.length / recordsPerPage);

  // Filter records based on search term
  useEffect(() => {
    if (state.searchTerm.trim() === '') {
      dispatch({type: 'HANDLE_FILTERED_RECORDS', payload: state.treatmentRecords});
    } else {
      const filtered = state.treatmentRecords.filter(record => 
        record.procedures.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        record.date.includes(state.searchTerm) ||
        record.clinicianName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        record.clinicalInstructorName.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
      dispatch({type: 'HANDLE_FILTERED_RECORDS', payload: filtered});
    }
    dispatch({type: 'HANDLE_PAGINATION', payload: 1});
  }, [state.searchTerm, state.treatmentRecords]);

  

  // Change page
  // const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const paginate = (pageNumber) => dispatch({type: 'HANDLE_PAGINATION', payload: pageNumber});

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Container fluid className="py-3 py-md-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={9}>
          {/* Page Header */}
          <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <h2 className="page-title mb-2 mb-md-0">Treatment Record History</h2>
            <div className="d-flex flex-column flex-sm-row align-items-center">
              <Form.Group className="mb-2 mb-sm-0 me-sm-2 search-container">
                <div className="position-relative">
                  <i className="bi bi-search search-icon"></i>
                  <Form.Control
                    type="text"
                    placeholder="Search records..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({type: 'HANDLE_SEARCH', payload: {value: e.target.value}})}
                    className="search-input ps-4"
                  />
                </div>
              </Form.Group>
            </div>
          </div>
          
          {/* Desktop/Tablet View - Table */}
          <div className="d-none d-md-block">
            <Card className="shadow-sm mb-4 treatment-card">
              <Card.Body className="p-0">
                <Table hover responsive className="modern-table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Procedures</th>
                      <th className="text-center">Signature</th>
                      <th>Clinician</th>
                      <th>Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record) => (
                      <tr key={record._id} className="treatment-row">
                        <td>
                          <span className="date-badge">{format(new Date(record.date), 'yyyy-dd-MM')}</span>
                        </td>
                        <td>
                          <span className="procedure-badge">{record.procedures}</span>
                        </td>
                        <td className="text-center">
                          <div className="signature-badge">{record.patientSignature ? '✔️' : '❌' }</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="clinician-avatar me-2">
                              {record.clinicianName.charAt(0)}
                            </div>
                            <span>{record.clinicianName}</span>
                          </div>
                        </td>
                        <td>{record.clinicalInstructorName === '' ? 'None' : record.clinicalInstructorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>

          {/* Mobile View - Cards */}
          <div className="d-block d-md-none">
            {currentRecords.length === 0 ? (
              <div className="text-center p-4">
                <p>No records found matching your search.</p>
              </div>
            ) : (
              currentRecords.map((record) => 
              (
                <Card key={record.id} className="mb-3 record-card shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg="light" text="dark" className="date-badge fs-6">
                        {record.date}
                      </Badge>
                      <div className="signature-badge">{record.patientSignature ? '✔️' : '❌' }</div>
                    </div>
                    
                    <h5 className="card-title mb-3">{record.procedures}</h5>
                    
                    <div className="record-details mb-3">
                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="detail-label">Clinician</div>
                          <div className="d-flex align-items-center mt-1">
                            <div className="clinician-avatar me-2" style={{width: "28px", height: "28px", fontSize: "0.8rem"}}>
                              {record.clinicianName.charAt(0)}
                            </div>
                            <span>{record.clinicianName}</span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="detail-label">Instructor</div>
                          <div className="mt-1">{record.clinicalInstructorName}</div>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {state.filteredRecords.length > 0 && (
            <div className="pagination-container d-flex flex-column flex-md-row justify-content-between align-items-center pt-3">
              <div className="mb-3 mb-md-0">
                <span className="text-muted">
                  Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, state.filteredRecords.length)} of {state.filteredRecords.length} records
                </span>
              </div>
              <div className="d-flex align-items-center pagination-controls">
                <Button 
                  variant={state.currentPage === 1 ? "outline-secondary" : "outline-primary"} 
                  size="sm" 
                  className="pagination-btn me-2"
                  onClick={() => state.currentPage > 1 && paginate(state.currentPage - 1)}
                  disabled={state.currentPage === 1}
                >
                  <i className="bi bi-chevron-left me-1"></i> Prev
                </Button>
                
                <div className="d-none d-sm-flex">
                  {pageNumbers.map(number => (
                    <Button
                      key={number}
                      variant={state.currentPage === number ? "primary" : "outline-primary"}
                      size="sm"
                      className="me-2 pagination-btn"
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </Button>
                  ))}
                </div>
                
                <Button 
                  variant={state.currentPage === totalPages ? "outline-secondary" : "outline-primary"} 
                  size="sm" 
                  className="pagination-btn"
                  onClick={() => state.currentPage < totalPages && paginate(state.currentPage + 1)}
                  disabled={state.currentPage === totalPages}
                >
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </Button>
              </div>
            </div>
          )}
        </Col>
      </Row>
      <Button
        variant="primary"
        onClick={() => navigate(-1)}
        >
        Go Back
      </Button>
    </Container>
  );
};

export default TreatmentHistory;