import React, { useContext, useReducer,useRef,useState } from 'react';
import { Card, Row, Col, Form, Button, Container, Modal } from 'react-bootstrap';
import SignatureScreen from '../Custom Hooks/SignatureScreen';
import { UserContext } from '../Context/UserContext';
import '../Views/Styles/RecordTreatment.css';
import TitleHead from '../Custom Hooks/TitleHead';
import { useNavigate, useParams } from 'react-router';
import {App} from 'antd'
import axios from 'axios';
import { treatmentRecordReducer, INITIAL_STATE } from '../Reducers/TreatmentRecordReducer';
import { convertImageBase64ToBlob } from '../Custom Hooks/ConvertImageBlob';
import API_ENDPOINTS from '../../config/api';

// Fake data generator for testing treatment records
const generateFakeTreatmentData = () => {
  const patientNames = [
    "Maria Elena Santos",
    "Juan Carlos Dela Cruz",
    "Ana Beatriz Rodriguez",
    "Carlos Miguel Mendoza",
    "Sofia Isabella Reyes",
    "Miguel Antonio Torres",
    "Elena Patricia Fernandez",
    "Roberto David Valdez",
    "Carmen Rosa Lopez",
    "Fernando Luis Garcia",
    "Isabella Marie Cruz",
    "Diego Alexander Morales"
  ];

  const clinicianNames = [
    "Dr. Sarah Chen, DDS",
    "Dr. Michael Johnson, DMD",
    "Dr. Lisa Wong, DDS",
    "Dr. David Kim, DMD",
    "Dr. Rachel Martinez, DDS",
    "Dr. James Park, DMD",
    "Dr. Amanda Taylor, DDS",
    "Dr. Kevin Liu, DMD",
    "Dr. Nicole Brown, DDS",
    "Dr. Christopher Lee, DMD"
  ];

  const instructorNames = [
    "Dr. Patricia Lim, DDS, MS",
    "Dr. Robert Thompson, DMD, PhD",
    "Dr. Michelle Garcia, DDS, MS",
    "Dr. Andrew Chang, DMD, MS",
    "Dr. Jennifer Wang, DDS, PhD",
    "Dr. Christopher Lee, DMD, MS"
  ];

  const commonProcedures = [
    // Preventive procedures
    "Prophylaxis (dental cleaning) - supragingival and subgingival scaling using ultrasonic instruments and hand scalers. Polishing with prophy paste and fluoride treatment applied. Patient education on proper brushing and flossing techniques provided.",
    
    "Fluoride application (5% sodium fluoride varnish) and comprehensive oral hygiene instruction. Plaque control education with demonstration of proper brushing technique. Diet counseling provided to reduce cariogenic food intake.",
    
    "Dental sealant placement on posterior teeth (molars #14, #19, #30). Tooth isolation with rubber dam, acid etching, primer application, and light-cured composite sealant placement. Occlusion checked and adjusted.",
    
    "Comprehensive oral examination with periodontal probing, caries detection, and radiographic evaluation (bitewing and periapical radiographs). Treatment planning discussed with patient. Next appointment scheduled for restorative work.",

    // Restorative procedures
    "Class II composite restoration on tooth #14 (mesial-occlusal surface). Local anesthesia (2% lidocaine with 1:100,000 epinephrine) administered. Rubber dam isolation, caries removal with high-speed handpiece, cavity preparation, etching, bonding, and composite placement with light curing.",
    
    "Class I amalgam restoration on tooth #19 (occlusal surface). Local anesthesia administered, tooth isolated, caries excavation, cavity preparation with proper retention form, amalgam placement and carving. Patient instructed to avoid chewing for 24 hours.",
    
    "Class III composite restoration on tooth #8 (mesial surface) for anterior esthetics. Shade selection performed, rubber dam placement, acid etching, bonding protocol, composite layering technique, finishing and polishing completed.",
    
    "Class V composite restoration on tooth #5 (facial surface) for cervical abrasion repair. Minimal preparation, selective etching, adhesive application, composite placement, and finishing. Desensitizing agent applied post-operatively.",
    
    "Crown preparation on tooth #30 for porcelain-fused-to-metal restoration. Local anesthesia, tooth reduction (1.5mm occlusal, 1mm axial), finish line preparation, impression taken with polyvinyl siloxane, temporary crown fabricated and cemented.",

    // Endodontic procedures
    "Root canal therapy on tooth #3 - access opening, working length determination, cleaning and shaping with rotary instruments, irrigation with sodium hypochlorite, obturation with gutta-percha and AH Plus sealer. Temporary restoration placed.",
    
    "Pulpotomy procedure on primary tooth D. Local anesthesia, rubber dam isolation, access opening, pulp amputation at cervical line, hemostasis achieved, formocresol application, zinc oxide eugenol base, stainless steel crown cementation.",
    
    "Endodontic retreatment on tooth #19. Previous restoration removed, old root canal filling material removed with Gates Glidden drills and solvents, canals re-cleaned and shaped, re-obturation completed. Crown preparation scheduled.",

    // Periodontal procedures
    "Scaling and root planing, maxillary right quadrant (teeth #1-8). Local anesthesia administered, deep scaling with Gracey curettes, root surface debridement, irrigation with chlorhexidine solution. Post-operative instructions given.",
    
    "Gingivectomy procedure on anterior gingiva. Local anesthesia, excess gingival tissue removal with electrosurgery, tissue contouring, periodontal dressing applied. Patient scheduled for suture removal in 7 days.",
    
    "Deep periodontal cleaning with ultrasonic debridement, manual scaling, and antibiotic irrigation (tetracycline HCl). Home care instructions provided including chlorhexidine rinse. 3-month recall scheduled.",

    // Oral surgery procedures
    "Simple extraction of tooth #32 (impacted wisdom tooth). Local anesthesia (4% articaine), tooth luxation with elevators, extraction with forceps, socket inspection, hemostasis achieved, post-operative instructions given. Sutures placed.",
    
    "Surgical extraction of tooth #1 with sectioning. Mucoperiosteal flap elevation, bone removal with surgical bur, tooth sectioning, root removal, alveolar bone contouring, primary closure with 4-0 silk sutures.",
    
    "Alveoloplasty following multiple extractions in preparation for complete denture. Bone contouring with rongeurs and bone file, tissue trimming, wound irrigation, primary closure. Healing period of 6-8 weeks recommended.",
    
    "Incisional biopsy of suspicious lesion on lateral tongue (15mm x 8mm). Local anesthesia, elliptical incision, tissue specimen collection, hemostasis with electrocautery, sutures placed. Specimen sent for histopathological examination.",

    // Prosthodontic procedures
    "Complete upper denture fitting and adjustment. Pressure spots identified and relieved, occlusal adjustment performed, bite registration verified. Patient education on denture care and oral hygiene. Follow-up appointment scheduled.",
    
    "Partial denture adjustment and reline. Clasp adjustment for improved retention, pressure spot relief on tissue surface, soft reline material applied. Occlusion checked and adjusted. Patient comfort verified.",
    
    "Fixed bridge cementation (teeth #13-15, pontic #14). Try-in completed, occlusal adjustment, isolation, cementation with resin cement, excess cement removal. Post-operative care instructions provided.",

    // Orthodontic procedures
    "Initial orthodontic bracket placement on maxillary arch. Tooth cleaning and etching, bracket bonding with light-cured adhesive, initial archwire placement (0.014 NiTi), ligature placement. Oral hygiene instruction emphasized.",
    
    "Orthodontic adjustment appointment. Archwire progression to 0.016 x 0.022 stainless steel, power chain placement for space closure, elastic wear instructions. Progress evaluation and photographs taken.",
    
    "Hawley retainer delivery and fitting. Retainer adjustments for proper fit, retention protocol explained (22 hours daily for 6 months), oral hygiene instructions with retainer. Regular monitoring scheduled.",

    // Pediatric procedures
    "Pediatric treatment with behavior management. Tell-show-do technique employed, nitrous oxide administration for anxiety control, Class II composite restoration on primary tooth A. Parent education on oral hygiene.",
    
    "Space maintainer fabrication and placement following premature loss of primary tooth E. Impression taken, lab work ordered, band and loop space maintainer cemented. Follow-up for monitoring eruption pattern.",
    
    "Pulp therapy on primary tooth B with stainless steel crown. Pulpotomy performed, formocresol medicament applied, IRM base placement, crown selection and cementation. Post-operative care discussed with parent.",

    // Emergency procedures
    "Emergency pain management for acute pulpitis on tooth #14. Local anesthesia administered, access opening, pulp extirpation, canal irrigation, calcium hydroxide placement, temporary restoration. Antibiotic prescription given.",
    
    "Dental trauma management - tooth #9 avulsion. Emergency repositioning within 30 minutes, splinting with composite and wire, tetanus status verified. Endodontic treatment scheduled. Emergency contact information provided.",
    
    "Acute abscess drainage and management. Incision and drainage procedure under local anesthesia, irrigation with saline, drain placement. Antibiotic therapy initiated (Amoxicillin 500mg TID). Pain management with ibuprofen."
  ];

  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

  // Get current date and time
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const currentTime = today.toTimeString().slice(0, 5); // Format: HH:MM

  return {
    date: currentDate,
    time: currentTime,
    patientName: getRandomElement(patientNames),
    clinicianName: getRandomElement(clinicianNames),
    clinicalInstructorName: getRandomElement(instructorNames),
    procedures: getRandomElement(commonProcedures)
  };
};

const RecordTreatment = () => {
  TitleHead('Record Treatment');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id = ''} = useParams();
  const [state, dispatch] = useReducer(treatmentRecordReducer, INITIAL_STATE);
  const {message:messageAPI} = App.useApp();
  const uploadbtn = useRef(null);

  // Check if user is Clinical Instructor
  const isClinicalInstructor = user?.role === 'Clinical Instructor';

  // Fake data generator function
  const handleGenerateFakeData = () => {
    const fakeData = generateFakeTreatmentData();
    
    // Update form fields while preserving signatures
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'date', value: fakeData.date } });
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'time', value: fakeData.time } });
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'patientName', value: fakeData.patientName } });
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'clinicianName', value: fakeData.clinicianName } });
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'clinicalInstructorName', value: fakeData.clinicalInstructorName } });
    dispatch({ type: 'HANDLE_INPUT', payload: { name: 'procedures', value: fakeData.procedures } });
    
    messageAPI.success("Fake treatment record data generated successfully! 🎲");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    dispatch({type: 'HANDLE_INPUT', payload: e.target})
    
  };

  // Open signature modal with context of who is signing
  const openSignatureModal = (signerType) => {
    dispatch({type: 'HANDLE_CURRENT_SIGNER', payload: signerType});
    dispatch({type: 'HANDLE_MODAL', payload: true});
  };

  // Handle signature save
  const handleSignatureSave = (field, sig) => {
    if(state.currentSigner){
      if(field ==='patient'){
        dispatch({type: 'HANDLE_INPUT', payload: {name: 'patientSignature', value: sig}})
      }
      else if(field === 'clinician'){
        dispatch({type: 'HANDLE_INPUT', payload: {name: 'clinicianSignature', value: sig}})
      }
      else if(field === 'instructor'){
        dispatch({type: 'HANDLE_INPUT', payload: {name: 'clinicalInstructorSignature', value: sig}})
      }
      dispatch({type: 'HANDLE_MODAL', payload: false});
    }
  };

  const handleUploadChange = (e)=>{
    if(e.target.files[0]){
      const uploadedFile = URL.createObjectURL(e.target.files[0]);
      if(state.currentSigner === 'patient'){
        dispatch({type: 'UPLOAD_PATIENT_SIGNATURE', payload: {value: uploadedFile}})
      }
      else if(state.currentSigner === 'clinician'){
        dispatch({type: 'UPLOAD_CLINICIAN_SIGNATURE', payload: {value: uploadedFile}})
      }
      else if(state.currentSigner === 'instructor'){
        dispatch({type: 'UPLOAD_INSTRUCTOR_SIGNATURE', payload: {value: uploadedFile}})
      }
    }
  }
  const handleUploadBtn = (field)=>{
    dispatch({type:'HANDLE_CURRENT_SIGNER', payload:field})
    uploadbtn.current.click();
    
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {date, time, patientName, patientSignature, procedures, clinicianName,
      clinicianSignature, clinicalInstructorName, clinicalInstructorSignature,
      imgURI, imgURI2, imgURI3} = state;
    const formData = new FormData();

    formData.append('date', date);
    formData.append('time', time);
    formData.append('patientName', patientName);
    formData.append('clinicianName', clinicianName);
    formData.append('procedures', procedures);
    formData.append('clinicalInstructorName', clinicalInstructorName);

    // Handle patient signature
    if(imgURI){
      formData.append('patientSignature', imgURI, `${patientName}_signature.png`);
    }
    else if (patientSignature){
      const patientSignatureBlob = convertImageBase64ToBlob(patientSignature);
      formData.append('patientSignature', patientSignatureBlob, `${patientName}_signature.png`);
    }

    // Handle clinician signature
    if(imgURI2){
      formData.append('clinicianSignature', imgURI2, `${clinicianName}_signature.png`);
    }
    else if (clinicianSignature){
      const clinicianSignatureBlob = convertImageBase64ToBlob(clinicianSignature);
      formData.append('clinicianSignature', clinicianSignatureBlob, `${clinicianName}_signature.png`);
    }

    // Handle clinical instructor signature
    if(imgURI3){
      formData.append('clinicalInstructorSignature', imgURI3, `${clinicalInstructorName}_signature.png`);
    }
    else if (clinicalInstructorSignature){
      const instructorSignatureBlob = convertImageBase64ToBlob(clinicalInstructorSignature);
      formData.append('clinicalInstructorSignature', instructorSignatureBlob, `${clinicalInstructorName}_signature.png`);
    }

    await axios.post(`${API_ENDPOINTS.CREATE_RECORD_TREATMENT(id)}`, 
      formData, {headers: {'Content-Type': 'multipart/form-data'} , withCredentials: true})
    .then((res)=>{
      console.log(res.data);
      messageAPI.success('Treatment record submitted successfully!');
      navigate(`/patient/${id}`)
    })
    .catch((err)=>{
      console.log(err);
      messageAPI.error('Error submitting treatment record. Please try again.');
    })

  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="treatment-record-card shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fs-5">Treatment Record</h4>
              
              {/* Development Tools - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleGenerateFakeData}
                  className="d-flex align-items-center gap-2"
                >
                  <span>🎲</span>
                  Generate Test Data
                </Button>
              )}
            </Card.Header>
            <Card.Body className="px-md-4 py-md-4 px-3 py-3">
              <Form onSubmit={handleSubmit}>
                {/* Date and Time Section */}
                <Row className="mb-4">
                  <Col lg={6} md={6} sm={12} className="mb-3 mb-md-0">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date"
                        value={state.date}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={6} sm={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Time</Form.Label>
                      <Form.Control 
                        type="time" 
                        name="time"
                        value={state.time}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* View Records Button - Responsive improvements */}
                <Row className="mb-4">
                  <Col lg={6} md={8} sm={12} xs={12}>
                    <Button 
                      variant="outline-primary" 
                      type="button" 
                      className="view-records-btn d-flex align-items-center justify-content-center"
                      onClick={()=> navigate(`/treatment-history/${id}`)}
                    >
                      <i className="fas fa-search me-2"></i> 
                      <span>View Records</span>
                    </Button>
                  </Col>
                </Row>

                {/* Patient Information Section */}
                <div className="section-header mb-3">
                  <h5 className="mb-0">Patient Information</h5>
                  <hr className="mt-2 mb-3" />
                </div>
                <Row>
                  <Col lg={6} md={6} sm={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Patient Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter full patient name"
                        name="patientName"
                        value={state.patientName}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={6} sm={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Clinician Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter attending clinician's name"
                        name="clinicianName"
                        value={state.clinicianName}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12} md={12} sm={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Clinical Instructor Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter clinical instructor's name"
                        name="clinicalInstructorName"
                        value={state.clinicalInstructorName}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Treatment Details Section */}
                <div className="section-header mb-3 mt-4">
                  <h5 className="mb-0">Treatment Details</h5>
                  <hr className="mt-2 mb-3" />
                </div>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Procedures Performed</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    placeholder="Enter detailed description of procedures"
                    name="procedures"
                    value={state.procedures}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                {/* Signatures Section */}
                <div className="section-header mb-3 mt-4">
                  <h5 className="mb-0">Signatures</h5>
                  <hr className="mt-2 mb-3" />
                </div>
                <Row className={`row-cols-1 ${isClinicalInstructor ? 'row-cols-md-1 row-cols-lg-3' : 'row-cols-md-2'} g-3`}>
                  <Col className="mb-3">
                    <div className="signature-container">
                      <div className="signature-label">Patient Signature</div>
                      <div className="signature-btn-group">
                        <Button 
                          variant="primary" 
                          className="d-flex align-items-center justify-content-center"
                          onClick={() => openSignatureModal('patient')}
                        >
                          <i className="fas fa-pen"></i>
                          <span>Draw Signature</span>
                        </Button>
                        <input ref={uploadbtn} 
                          type='file' 
                          accept='image/png' 
                          onChange={handleUploadChange}
                          style={{display:'none'}}/>
                        <Button 
                          variant="outline-secondary"
                          className="d-flex align-items-center justify-content-center"
                          onClick={()=>handleUploadBtn('patient')}
                        >
                          <i className="fas fa-upload"></i>
                          <span>Upload Signature</span>
                        </Button>
                      </div>
                      {(state.patientSignature || state.imgURI) && (
                        <div className="signature-preview mt-3 p-3 border rounded bg-light">
                          <p className="small text-muted mb-1">Patient Signature:</p>
                          <img 
                            src={state.patientSignature || state.imgURI} 
                            alt="Patient Signature" 
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col className="mb-3">
                    <div className="signature-container">
                      <div className="signature-label">Clinician Signature</div>
                      <div className="signature-btn-group">
                        <Button 
                          variant="primary"
                          className="d-flex align-items-center justify-content-center"
                          onClick={() => openSignatureModal('clinician')}
                        >
                          <i className="fas fa-pen"></i>
                          <span>Draw Signature</span>
                        </Button>
                        <input ref={uploadbtn} 
                          type='file' 
                          accept='image/png'
                          onChange={handleUploadChange}
                          style={{display:'none'}}/>
                        <Button 
                          variant="outline-secondary"
                          className="d-flex align-items-center justify-content-center"
                          onClick={()=>handleUploadBtn('clinician')}
                        >
                          <i className="fas fa-upload"></i>
                          <span>Upload Signature</span>
                        </Button>
                      </div>
                      {(state.clinicianSignature || state.imgURI2) && (
                        <div className="signature-preview mt-3 p-3 border rounded bg-light">
                          <p className="small text-muted mb-1">Clinician Signature:</p>
                          <img 
                            src={state.clinicianSignature || state.imgURI2} 
                            alt="Clinician Signature" 
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </div>
                      )}
                    </div>
                  </Col>
                  
                  {/* Clinical Instructor Signature - Only show if user is Clinical Instructor */}
                  {isClinicalInstructor && (
                    <Col className="mb-3">
                      <div className="signature-container">
                        <div className="signature-label">Clinical Instructor E-Signature</div>
                        <div className="signature-btn-group">
                          <Button 
                            variant="success"
                            className="d-flex align-items-center justify-content-center"
                            onClick={() => openSignatureModal('instructor')}
                          >
                            <i className="fas fa-pen"></i>
                            <span>Draw E-Signature</span>
                          </Button>
                          <Button 
                            variant="outline-success"
                            className="d-flex align-items-center justify-content-center"
                            onClick={()=>handleUploadBtn('instructor')}
                          >
                            <i className="fas fa-upload"></i>
                            <span>Upload E-Signature</span>
                          </Button>
                        </div>
                        {(state.clinicalInstructorSignature || state.imgURI3) && (
                          <div className="signature-preview mt-3 p-3 border rounded bg-light">
                            <p className="small text-muted mb-1">Clinical Instructor E-Signature:</p>
                            <img 
                              src={state.clinicalInstructorSignature || state.imgURI3} 
                              alt="Clinical Instructor Signature" 
                              style={{ maxWidth: '100%', height: 'auto' }}
                            />
                          </div>
                        )}
                        <div className="mt-2">
                          <small className="text-success fw-semibold">
                            <i className="fas fa-shield-alt me-1"></i>
                            Verified Clinical Instructor: {user?.name || user?.username}
                          </small>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>

                {/* Submit and Back Buttons - Enhanced responsive design */}
                <div className="form-action-buttons mt-4">
                  <Row className="g-3">
                    <div className="col-12 col-md-6 order-md-1">
                      <Button 
                        variant="outline-secondary" 
                        className="w-100 btn-back d-flex align-items-center justify-content-center"
                        onClick={() => navigate(-1)}
                      >
                        <i className="fas fa-arrow-left"></i>
                        <span className="ms-2">Back</span>
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 btn-submit d-flex align-items-center justify-content-center"
                      >
                        <i className="fas fa-save"></i>
                        <span className="ms-2">Submit Record</span>
                      </Button>
                    </div>
                  </Row>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Signature Modal */}
      <Modal 
        show={state.modalVisible} 
        onHide={() => dispatch({type: 'HANDLE_MODAL', payload: false})}
        centered
        backdrop="static"
        size="lg"
        className="signature-modal"
      >
        <Modal.Header closeButton className={`${state.currentSigner === 'instructor' ? 'bg-success' : 'bg-primary'} text-white`}>
          <Modal.Title>
            {state.currentSigner === 'patient' && 'Patient Signature'}
            {state.currentSigner === 'clinician' && 'Clinician Signature'}
            {state.currentSigner === 'instructor' && 'Clinical Instructor E-Signature'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-md-4 p-3">
          {state.currentSigner === 'instructor' && (
            <div className="alert alert-success mb-3">
              <i className="fas fa-shield-alt me-2"></i>
              <strong>Verified Clinical Instructor:</strong> {user?.name || user?.username}
            </div>
          )}
          <SignatureScreen
            onSave={sig => handleSignatureSave(state.currentSigner,sig)}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column flex-md-row justify-content-center justify-content-md-end">
          <Button 
            variant="secondary" 
            onClick={() => dispatch({type: 'HANDLE_MODAL', payload: false})}
            className="mb-2 mb-md-0 me-md-2 d-flex align-items-center justify-content-center"
          >
            <i className="fas fa-times me-2"></i>
            <span>Cancel</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecordTreatment;