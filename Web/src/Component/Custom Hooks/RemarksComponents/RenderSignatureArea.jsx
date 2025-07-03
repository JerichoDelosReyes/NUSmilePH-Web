import { Button, Form, Row, Col } from "react-bootstrap";

export const RenderSignatureArea = (props) => {
  const {
    title,
    field,
    openSignatureModal,
    user,
    state,
    handleUploadSignature,
    handleImageSource,
    handleSectionSave,
    validationResult, // Add validation result prop
  } = props;

  // Check if section requirements are met
  const isValid = validationResult?.isValid !== false; // Default to true if no validation result
  const hasSignature = state.sectionForRemarks[field]?.status;
  
  // Determine if buttons should be disabled
  const isUserRestricted = user?.role === 'Clinician';
  const areRequirementsIncomplete = !isValid;
  const isSignButtonDisabled = isUserRestricted || areRequirementsIncomplete;
  const isSaveButtonDisabled = isUserRestricted || !hasSignature || areRequirementsIncomplete;

  return (
    <div className="modern-signature-area">
      {/* Validation Warning */}
      {!isValid && (
        <div className="alert alert-warning mb-3" style={{ fontSize: '0.9rem' }}>
          <div className="d-flex align-items-start">
            <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
            <div>
              <strong>Requirements Not Met</strong>
              <br />
              <small>{validationResult?.message || 'Complete all required procedures before signing this section.'}</small>
            </div>
          </div>
        </div>
      )}
      
      <Row className="g-3 align-items-stretch">
        
        {/* Signature Controls */}
        <Col xs={12} lg={8}>
          <div className="signature-controls-wrapper">
            <h6 className="signature-section-title mb-3">
              ✍️ Digital Signature Required
            </h6>
            
            <Row className="g-2 mb-3">
              <Col xs={12} sm={6}>
                <Button
                  variant="primary"
                  onClick={() => openSignatureModal(field)}
                  className="signature-button w-100"
                  disabled={isSignButtonDisabled}
                  title={areRequirementsIncomplete ? 'Complete all requirements first' : ''}
                >
                  {hasSignature ? '✏️ Update Signature' : '✍️ Sign Document'}
                  {areRequirementsIncomplete && ' 🚫'}
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleUploadSignature(field)}
                  className="signature-upload-input"
                  disabled={isSignButtonDisabled}
                  title={areRequirementsIncomplete ? 'Complete all requirements first' : ''}
                />
              </Col>
            </Row>
            
            <Form.Label className="small text-muted mb-3 d-block">
              {areRequirementsIncomplete ? (
                <span className="text-danger">
                  🚫 Complete all requirements before uploading signature
                </span>
              ) : (
                <>📁 Upload signature image or use the digital signature pad above</>
              )}
            </Form.Label>
          </div>
        </Col>
        
        {/* Signature Preview */}
        <Col xs={12} lg={4}>
          <div className="signature-preview-wrapper h-100">
            <h6 className="signature-section-title mb-3">
              👀 Signature Preview
            </h6>
            
            {state.sectionForRemarks[field]?.status ? (
              <div className="signature-preview">
                <img
                  src={handleImageSource(state.sectionForRemarks[field].status)}
                  alt={`${title} Signature`}
                  className="signature-image"
                />
                <div className="signature-status mt-2">
                  <span className="status-indicator status-complete"></span>
                  <small className="text-success fw-bold">Signature Uploaded</small>
                </div>
              </div>
            ) : (
              <div className="signature-placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-signature text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mb-0">No signature yet</p>
                  <small className="text-muted">Please sign or upload</small>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
      
      {/* Save Action */}
      <div className="signature-actions mt-4 pt-3 border-top">
        <Row className="align-items-center">
          <Col xs={12} sm={8}>
            <div className="save-status-info">
              {!isValid ? (
                <div className="d-flex align-items-center text-danger">
                  <i className="fas fa-ban me-2"></i>
                  <span>Requirements not met - cannot sign</span>
                </div>
              ) : hasSignature ? (
                <div className="d-flex align-items-center text-success">
                  <i className="fas fa-check-circle me-2"></i>
                  <span className="fw-bold">Ready to save</span>
                </div>
              ) : (
                <div className="d-flex align-items-center text-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <span>Signature required before saving</span>
                </div>
              )}
            </div>
          </Col>
          <Col xs={12} sm={4}>
            <Button
              variant={
                !isValid ? "danger" : 
                hasSignature ? "success" : "outline-secondary"
              }
              onClick={() => handleSectionSave(field)}
              disabled={isSaveButtonDisabled}
              className="action-button w-100"
              title={
                areRequirementsIncomplete ? 'Complete all requirements first' :
                !hasSignature ? 'Upload signature first' : ''
              }
            >
              {!isValid ? '🚫 Cannot Save' :
               hasSignature ? '💾 Save Section' : '⏳ Awaiting Signature'}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};