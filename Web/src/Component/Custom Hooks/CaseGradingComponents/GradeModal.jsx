import { useRef, useState, useEffect, useContext } from "react";
import { Button, Form, Modal, Alert, Row, Col, Spinner, OverlayTrigger, Tooltip, Badge, ProgressBar } from 'react-bootstrap';
import SignaturePad from 'react-signature-canvas';
import { handleImageSource } from "../TallySheetComponents/Utils";
import { format, isAfter, isBefore, subYears } from 'date-fns';
import { formatDateForInput } from "./CaseGradingHelper";
import { UserContext } from '../../Context/UserContext';

export const GradeModal = ({ 
  showGradeModal,
  dispatch,
  selectedCase,
  selectedProcedure,
  grade,
  completionDate,
  signatory,
  feedback,
  handleSaveGrade,
  signatureImg,
  showSignaturePad,
  penaltyCaseName,
  isSubmitting = false
}) => {
  // Access current user information
  const { user } = useContext(UserContext);
  
  const signaturePadRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formState, setFormState] = useState({
    isFormValid: false,
    isFormSubmitted: false,
    formCompletion: 0
  });
  
  const isPenalty = selectedCase?.id?.split('-')[0] === 'penalty';
  
  // Auto-populate signatory with user's name and date with today when modal opens
  useEffect(() => {
    if (showGradeModal && user) {
      // Create instructor name from current user
      const instructorName = user.username
      
      // Only set if we have a valid name and the field isn't already populated
      if (instructorName && (!signatory || signatory.trim() === '')) {
        dispatch({
          type: 'HANDLE_CHANGE',
          payload: { name: 'signatory', value: instructorName }
        });
      }
      
      // Set completion date to today if not already set
      if (!completionDate) {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        dispatch({
          type: 'HANDLE_CHANGE',
          payload: { name: 'completionDate', value: today }
        });
      }
      
      setErrors({});
      setTouched({});
      setFormState({
        isFormValid: false,
        isFormSubmitted: false,
        formCompletion: 0
      });
    }
  }, [showGradeModal, user, signatory, completionDate, dispatch]);
  
  // Update form completion percentage
  useEffect(() => {
    const requiredFields = isPenalty 
      ? ['penaltyCaseName', 'completionDate', 'signatory'] 
      : ['grade', 'completionDate', 'signatory'];
    
    // Always require signature
    requiredFields.push('signatureImg');
    
    // Count completed fields
    let completedFields = 0;
    
    if (isPenalty && penaltyCaseName?.trim()) completedFields++;
    if (!isPenalty && grade && parseInt(grade) >= 1 && parseInt(grade) <= 100) completedFields++;
    if (completionDate) completedFields++;
    if (signatory?.trim()) completedFields++;
    if (signatureImg) completedFields++;
    
    // Calculate completion percentage
    const percentage = Math.floor((completedFields / requiredFields.length) * 100);
    
    // Check if form is valid
    const formErrors = validateForm(true);
    const isValid = Object.keys(formErrors).length === 0;
    
    setFormState(prev => ({
      ...prev,
      formCompletion: percentage,
      isFormValid: isValid
    }));
    
  }, [isPenalty, penaltyCaseName, grade, completionDate, signatory, signatureImg]);
  
  // Validation function
  const validateForm = (silent = false) => {
    const newErrors = {};
    
    if (!isPenalty && (!grade || grade.trim() === '')) {
      newErrors.grade = 'Grade is required';
    } else if (!isPenalty && (parseInt(grade) < 1 || parseInt(grade) > 100)) {
      newErrors.grade = 'Grade must be between 1 and 100';
    }
    
    if (isPenalty && (!penaltyCaseName || penaltyCaseName.trim() === '')) {
      newErrors.penaltyCaseName = 'Penalty case description is required';
    } else if (isPenalty && penaltyCaseName && penaltyCaseName.trim().length < 5) {
      newErrors.penaltyCaseName = 'Description is too short (minimum 5 characters)';
    }
    
    if (!completionDate) {
      newErrors.completionDate = 'Completion date is required';
    } else {
      const selectedDate = new Date(completionDate);
      const today = new Date();
      const oneYearAgo = subYears(today, 1);
      
      if (isAfter(selectedDate, today)) {
        newErrors.completionDate = 'Date cannot be in the future';
      } else if (isBefore(selectedDate, oneYearAgo)) {
        newErrors.completionDate = 'Date cannot be more than 1 year ago';
      }
    }
    
    if (!signatory || signatory.trim() === '') {
      newErrors.signatory = 'Signatory name is required';
    }
    
    if (!signatureImg) {
      newErrors.signatureImg = 'Signature is required';
    }
    
    if (!silent) {
      setErrors(newErrors);
    }
    
    return newErrors;
  };
  
  // Handle field touch events
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate only the blurred field
    const fieldError = {};
    
    switch (field) {
      case 'grade':
        if (!isPenalty) {
          if (!grade || grade.trim() === '') {
            fieldError.grade = 'Grade is required';
          } else if (parseInt(grade) < 1 || parseInt(grade) > 100) {
            fieldError.grade = 'Grade must be between 1 and 100';
          }
        }
        break;
        
      case 'penaltyCaseName':
        if (isPenalty) {
          if (!penaltyCaseName || penaltyCaseName.trim() === '') {
            fieldError.penaltyCaseName = 'Penalty case description is required';
          } else if (penaltyCaseName.trim().length < 5) {
            fieldError.penaltyCaseName = 'Description is too short (minimum 5 characters)';
          }
        }
        break;
        
      case 'completionDate':
        if (!completionDate) {
          fieldError.completionDate = 'Completion date is required';
        } else {
          const selectedDate = new Date(completionDate);
          const today = new Date();
          const oneYearAgo = subYears(today, 1);
          
          if (isAfter(selectedDate, today)) {
            fieldError.completionDate = 'Date cannot be in the future';
          } else if (isBefore(selectedDate, oneYearAgo)) {
            fieldError.completionDate = 'Date cannot be more than 1 year ago';
          }
        }
        break;
        
      case 'signatory':
        if (!signatory || signatory.trim() === '') {
          fieldError.signatory = 'Signatory name is required';
        }
        break;
        
      case 'signatureImg':
        if (!signatureImg) {
          fieldError.signatureImg = 'Signature is required';
        }
        break;
    }
    
    // Update errors for this field only
    setErrors(prev => ({ ...prev, [field]: fieldError[field] }));
  };
  
  // Signature handling
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };
  
  const saveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL();
      dispatch({type:'HANDLE_FILE_UPLOAD', payload: dataUrl});
      dispatch({type:'HANDLE_SIGNATURE_PAD', payload: false});
      setErrors(prev => ({ ...prev, signatureImg: undefined }));
      setTouched(prev => ({ ...prev, signatureImg: true }));
    } else {
      setErrors(prev => ({ ...prev, signatureImg: 'Please draw a signature before saving' }));
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, signatureImg: 'File size should be less than 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch({type:'HANDLE_FILE_UPLOAD', payload: event.target.result});
        setErrors(prev => ({ ...prev, signatureImg: undefined }));
        setTouched(prev => ({ ...prev, signatureImg: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    
    if (name === 'grade') {
      if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 100)) {
        dispatch({type:'HANDLE_CHANGE', payload:{name, value}});
        
        // Clear error if value is valid
        if (value !== '' && parseInt(value) >= 1 && parseInt(value) <= 100) {
          setErrors(prev => ({ ...prev, grade: undefined }));
        }
      }
    } else {
      dispatch({type:'HANDLE_CHANGE', payload:{name, value}});
      
      // Clear error when field is filled
      if (value.trim() !== '') {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleSubmit = () => {
    setFormState(prev => ({ ...prev, isFormSubmitted: true }));
    const formErrors = validateForm();
    
    // Mark all fields as touched on submit
    const allTouched = {};
    ['grade', 'penaltyCaseName', 'completionDate', 'signatory', 'signatureImg', 'feedback'].forEach(
      field => allTouched[field] = true
    );
    setTouched(allTouched);
    
    if (Object.keys(formErrors).length === 0) {
      handleSaveGrade();
    } else {
      // Scroll to first error
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }
  };
  
  // Get feedback color based on grade
  const getGradeFeedbackColor = (grade) => {
    if (!grade) return 'secondary';
    const gradeNum = parseInt(grade);
    if (gradeNum >= 90) return 'success';
    if (gradeNum >= 80) return 'primary';
    if (gradeNum >= 70) return 'info';
    if (gradeNum >= 60) return 'warning';
    return 'danger';
  };

  return (
    <Modal 
      show={showGradeModal} 
      onHide={() => dispatch({type:'HANDLE_MODAL', payload: false})} 
      centered 
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <span className="material-symbols-outlined me-2" style={{ fontSize: '24px' }}>
            {isPenalty ? 'warning' : 'grading'}
          </span>
          {isPenalty ? 'Record Penalty' : 'Grade Case'}: {selectedProcedure?.name} - Case {selectedCase?.case}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-0 px-0 pb-0">
        {/* Form Progress */}
        <div className="px-3 pt-3 pb-0">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Form completion</small>
            <small className={`fw-bold ${formState.formCompletion === 100 ? 'text-success' : 'text-muted'}`}>
              {formState.formCompletion}%
            </small>
          </div>
          <ProgressBar 
            now={formState.formCompletion} 
            variant={formState.formCompletion === 100 ? 'success' : 'primary'} 
            className="mb-3"
            style={{ height: '8px' }}
          />
        </div>
        
        {/* Validation Alert */}
        {formState.isFormSubmitted && Object.keys(errors).length > 0 && (
          <div className="px-3">
            <Alert variant="danger" className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-exclamation-circle me-2 fs-5"></i>
                <strong>Please fix the following issues:</strong>
              </div>
              <ul className="mb-0 ps-4">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          </div>
        )}
        
        {/* Main Form */}
        <div className="px-3">
          <Form noValidate>
            <Row>
              {/* Left Column */}
              <Col md={6}>
                <div className="p-3 bg-light rounded mb-4">
                  <h5 className="mb-3 border-bottom pb-2">Case Details</h5>
                  
                  {!isPenalty ? (
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex justify-content-between align-items-center">
                        <span>
                          Grade (1-100) <span className="text-danger">*</span>
                        </span>
                        {grade && (
                          <Badge 
                            bg={getGradeFeedbackColor(grade)} 
                            style={{ fontSize: '1.2rem', padding: '8px 12px', fontWeight: '600' }}
                          >
                            {grade}%
                          </Badge>
                        )}
                      </Form.Label>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>Enter a grade between 1 and 100</Tooltip>
                        }
                      >
                        <Form.Control 
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Enter grade"
                          name="grade"
                          value={grade}
                          onChange={handleChange}
                          onBlur={() => handleBlur('grade')}
                          isInvalid={(touched.grade || formState.isFormSubmitted) && errors.grade}
                          isValid={touched.grade && grade && !errors.grade && parseInt(grade) >= 1}
                          className="fw-bold text-center"
                          style={{ fontSize: '1.2rem' }}
                        />
                      </OverlayTrigger>
                      <Form.Control.Feedback type="invalid">
                        {errors.grade}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        <i className="fas fa-info-circle me-1"></i> Only numbers from 1 to 100 are allowed
                      </Form.Text>
                    </Form.Group>
                  ) : (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <span>
                          Penalty Description <span className="text-danger">*</span>
                        </span>
                      </Form.Label>
                      <Form.Control 
                        type="text"
                        placeholder="Describe the penalty case"
                        name="penaltyCaseName"
                        value={penaltyCaseName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('penaltyCaseName')}
                        isInvalid={(touched.penaltyCaseName || formState.isFormSubmitted) && errors.penaltyCaseName}
                        isValid={touched.penaltyCaseName && penaltyCaseName && penaltyCaseName.trim().length >= 5 && !errors.penaltyCaseName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.penaltyCaseName}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        <i className="fas fa-info-circle me-1"></i> Provide a clear description of the penalty case
                      </Form.Text>
                    </Form.Group>
                  )}
                  
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span>
                        Completion Date <span className="text-danger">*</span>
                      </span>
                    </Form.Label>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>Pre-filled with today's date</Tooltip>
                      }
                    >
                      <Form.Control 
                        type="date" 
                        name="completionDate"
                        value={formatDateForInput(completionDate)}
                        onChange={handleChange}
                        onBlur={() => handleBlur('completionDate')}
                        isInvalid={(touched.completionDate || formState.isFormSubmitted) && errors.completionDate}
                        isValid={touched.completionDate && completionDate && !errors.completionDate}
                        max={new Date().toISOString().split('T')[0]}
                        className="bg-light"
                      />
                    </OverlayTrigger>
                    <Form.Control.Feedback type="invalid">
                      {errors.completionDate}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      <i className="fas fa-calendar-check me-1"></i> Automatically set to today's date
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span>
                        Feedback
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>Optional comments about the student's performance</Tooltip>
                          }
                        >
                          <i className="fas fa-question-circle ms-2 text-muted" style={{ fontSize: '14px' }}></i>
                        </OverlayTrigger>
                      </span>
                    </Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={4}
                      placeholder="Provide feedback on student performance"
                      name="feedback"
                      value={feedback}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-lightbulb me-1"></i> Optional: Include constructive feedback for improvement
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>
              
              {/* Right Column */}
              <Col md={6}>
                <div className="p-3 bg-light rounded mb-4">
                  <h5 className="mb-3 border-bottom pb-2">Signatory Information</h5>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span>
                        Clinical Instructor <span className="text-danger">*</span>
                      </span>
                    </Form.Label>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>Automatically filled with your name</Tooltip>
                      }
                    >
                      <Form.Control 
                        type="text" 
                        value={signatory}
                        readOnly
                        className="bg-light"
                        style={{ cursor: 'not-allowed' }}
                        isValid={signatory && signatory.trim() !== ''}
                      />
                    </OverlayTrigger>
                    <Form.Text className="text-muted">
                      <i className="fas fa-user-md me-1"></i> Automatically set to your name
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <span>
                        Signature <span className="text-danger">*</span>
                      </span>
                    </Form.Label>
                    
                    <div className="text-center mb-3">
                      <div className="d-flex gap-2 mb-3">
                        <Button 
                          variant={showSignaturePad ? "primary" : "outline-primary"}
                          onClick={() => dispatch({type:'HANDLE_SIGNATURE_PAD', payload: true})}
                          className="w-50 d-flex align-items-center justify-content-center"
                        >
                          <i className="fas fa-pen me-2"></i> Draw Signature
                        </Button>
                        
                        <label className="btn btn-outline-primary w-50 d-flex align-items-center justify-content-center">
                          <i className="fas fa-upload me-2"></i> Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            aria-label="Upload signature image"
                          />
                        </label>
                      </div>
                      
                      {(touched.signatureImg || formState.isFormSubmitted) && errors.signatureImg && (
                        <div className="text-danger mb-2 small d-flex align-items-center">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors.signatureImg}
                        </div>
                      )}
                      
                      {showSignaturePad && (
                        <div className="p-2 border rounded bg-white mb-3">
                          <div className="p-2 mb-2 bg-light text-center small text-muted rounded">
                            <i className="fas fa-pen me-1"></i> Draw your signature below
                          </div>
                          <SignaturePad
                            ref={signaturePadRef}
                            canvasProps={{
                              className: "signature-pad",
                              style: { 
                                width: '100%', 
                                height: '150px',
                                background: '#fff' 
                              }
                            }}
                            backgroundColor="white"
                          />
                          <div className="d-flex justify-content-between mt-2">
                            <Button variant="outline-secondary" size="sm" onClick={clearSignature}>
                              <i className="fas fa-eraser me-1"></i> Clear
                            </Button>
                            <Button variant="success" size="sm" onClick={saveSignature}>
                              <i className="fas fa-check me-1"></i> Save Signature
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {signatureImg && (
                        <div className="p-3 border rounded bg-white mt-3">
                          <div className="position-relative">
                            <img 
                              src={handleImageSource(signatureImg)} 
                              alt="Signature" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '80px',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
                              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            />
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="position-absolute top-0 end-0 rounded-circle p-1"
                              style={{ width: '30px', height: '30px' }}
                              onClick={() => {
                                dispatch({type:'HANDLE_FILE_UPLOAD', payload: null});
                                setErrors(prev => ({ ...prev, signatureImg: 'Signature is required' }));
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                          <div className="text-center mt-2 small text-success">
                            <i className="fas fa-check-circle me-1"></i> Signature provided
                          </div>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-top py-3">
        <div className="d-flex justify-content-between w-100">
          <Button
            variant="outline-secondary"
            onClick={() => dispatch({type:'HANDLE_MODAL', payload:false})}
            className="px-4 d-flex align-items-center"
            disabled={isSubmitting}
          >
            <i className="fas fa-times me-2"></i> Cancel
          </Button>
          
          <div className="d-flex align-items-center">
            {formState.formCompletion < 100 && (
              <span className="text-danger me-3 small">
                <i className="fas fa-exclamation-circle me-1"></i>
                Please complete all required fields
              </span>
            )}
            
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              className="px-4 d-flex align-items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {isPenalty ? 'Save Penalty' : 'Save Grade'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};