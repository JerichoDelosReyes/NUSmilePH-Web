import React, { useRef, useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import {message} from 'antd'

const SignatureScreen = ({ onSave }) => {
  const signatureRef = useRef(null);
  const [signatureSize, setSignatureSize] = useState({ width: 500, height: 200 });
  const [messageAPI, contextHolder] = message.useMessage()

  // Function to handle screen resize for responsive canvas
  useEffect(() => {
    const updateSize = () => {
      // Make canvas responsive based on parent container width
      const width = Math.min(window.innerWidth - 60, 500);
      setSignatureSize({ width, height: 200 });
    };

    // Set initial size
    updateSize();

    // Add event listener for window resize
    window.addEventListener('resize', updateSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Save signature
  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      // Get signature as base64 encoded data URL
      const dataURL = signatureRef.current.toDataURL('image/png');
      onSave(dataURL);
    } else {
      messageAPI.error('Please provide a signature before saving.')
    }
  };

  return (
    <div className="signature-container">
      {contextHolder}
      <p className="text-center mb-3">
        Please sign in the area below:
      </p>
      
      <div className="signature-canvas-wrapper">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: signatureSize.width,
            height: signatureSize.height,
            className: 'signature-canvas'
          }}
        />
      </div>
      
      <Row className="mt-3">
        <Col xs={6}>
          <Button 
            variant="outline-secondary" 
            className="w-100" 
            onClick={clearSignature}
          >
            Clear
          </Button>
        </Col>
        <Col xs={6}>
          <Button 
            variant="primary" 
            className="w-100" 
            onClick={saveSignature}
          >
            Save Signature
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SignatureScreen;