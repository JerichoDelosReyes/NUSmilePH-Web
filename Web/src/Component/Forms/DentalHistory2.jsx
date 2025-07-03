import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import '../Views/Styles/DentalHistory2.css'; 
import TitleHead from '../Custom Hooks/TitleHead';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { App } from 'antd';
import axios from 'axios';
import { dentalHealthReducer, INITIAL_STATE } from '../Reducers/DentalHealthReducer';
import API_ENDPOINTS from '../../config/api';

// Fake data generator for testing and development
const generateFakeExaminationData = () => {
  const medicalConditions = {
    skin: [
      "Acne scars on face",
      "Mild rosacea",
      "Age spots",
      "Dry patches",
      "Minor discoloration",
      "Small mole on cheek",
    ],
    eyes: [
      "Mild conjunctival irritation",
      "Slight ptosis",
      "Dark circles",
      "Minor asymmetry",
      "Dry eyes symptoms",
    ],
    neck: [
      "Palpable thyroid nodule",
      "Muscle tension",
      "Limited range of motion",
      "Visible lymph nodes",
      "Scar from previous surgery",
    ],
    tmj: [
      "Clicking sound during opening",
      "Mild tenderness on palpation",
      "Restricted opening (< 35mm)",
      "Pain during chewing",
      "Muscle spasm in masseter",
    ],
    lymph_nodes: [
      "Enlarged submandibular nodes",
      "Tender cervical lymph nodes",
      "Palpable but mobile nodes",
      "Slightly firm consistency",
      "Bilateral enlargement",
    ],
    lips: [
      "Cheilitis (cracked corners)",
      "Herpes labialis scar",
      "Mild swelling",
      "Dry and peeling",
      "Angular cheilosis",
    ],
    buccal_mucosa: [
      "Linea alba (bite line)",
      "Minor aphthous ulcer",
      "Cheek biting marks",
      "Mild inflammation",
      "White patches (leukoplakia)",
    ],
    vestibule: [
      "Shallow vestibule",
      "Mucosal tags",
      "Minor inflammation",
      "Tight frenum attachment",
      "Small fibroma",
    ],
    alveolar_ridge: [
      "Bone resorption",
      "Sharp bony edges",
      "Uneven contour",
      "Torus mandibularis",
      "Post-extraction healing",
    ],
    hard_soft_palate: [
      "High palatal vault",
      "Torus palatinus",
      "Cleft palate repair scar",
      "Petechiae",
      "Asymmetrical arch",
    ],
    oro_pharynx: [
      "Enlarged tonsils",
      "Cobblestone appearance",
      "Mild erythema",
      "Post-nasal drip",
      "Deviated uvula",
    ],
    tongue: [
      "Geographic tongue",
      "Fissured tongue",
      "Mild macroglossia",
      "Coating (thrush)",
      "Varicose veins underneath",
    ],
    floor_of_mouth: [
      "Ranula (small)",
      "Prominent lingual veins",
      "Tight lingual frenum",
      "Minor induration",
      "Sublingual varices",
    ],
    salivary_glands: [
      "Decreased salivary flow",
      "Parotid gland swelling",
      "Sialolithiasis (stone)",
      "Mild xerostomia",
      "Ductal obstruction",
    ],
  };

  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomBoolean = (probability = 0.3) => Math.random() < probability;

  const fields = [
    'skin', 'eyes', 'neck', 'tmj', 'lymph_nodes', 'lips', 
    'buccal_mucosa', 'vestibule', 'alveolar_ridge', 'hard_soft_palate',
    'oro_pharynx', 'tongue', 'floor_of_mouth', 'salivary_glands'
  ];

  const fakeData = {};

  fields.forEach((field) => {
    const isAbnormal = getRandomBoolean(0.3); // 30% chance of abnormal

    if (field === 'tmj') {
      // Special handling for TMJ with its additional options
      fakeData[field] = {
        normal: !isAbnormal,
        crepitus_right: isAbnormal ? getRandomBoolean(0.4) : false,
        crepitus_left: isAbnormal ? getRandomBoolean(0.4) : false,
        popping: isAbnormal ? getRandomBoolean(0.5) : false,
        deflection: isAbnormal ? getRandomBoolean(0.3) : false,
        abnormal_description: isAbnormal
          ? getRandomElement(medicalConditions[field])
          : "",
      };
    } else {
      fakeData[field] = {
        normal: !isAbnormal,
        abnormal_description: isAbnormal
          ? getRandomElement(medicalConditions[field] || ["Abnormal findings noted"])
          : "",
      };
    }
  });

  return fakeData;
};

const DentalHealth2 = () => {
  TitleHead('Dental Health Assessment');
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('action') === 'edit';
  const [state, dispatch] = useReducer(dentalHealthReducer, INITIAL_STATE);
  const {message:messageApi} = App.useApp();
  const [isLoading, setIsLoading] = useState(false);

  const getDentalHistory2Data = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_EXTRAORAL_INTRAORAL(id));
      console.log('Fetched data:', response.data);
      dispatch({ type: 'GET_DATA', payload: response.data });
      messageApi.success('Data loaded successfully');
    } catch (err) {
      console.error('Error fetching data:', err);
      messageApi.error('Failed to load existing data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFakeDataGenerate = () => {
    const fakeData = generateFakeExaminationData();
    dispatch({ type: 'GET_DATA', payload: fakeData });
    messageApi.success('Fake examination data generated successfully! 🎲');
  };

  useEffect(() => {
    if (isEdit) {
      getDentalHistory2Data();
    }
  }, [isEdit, id]);

  const handleCheckboxChange = (e, field) => {
    const { id, checked } = e.target;
    const isNormal = id.includes('-normal');
    dispatch({ type: 'SET_NORMAL', payload: { field, value: isNormal } });
  };

  const handleTMJChange = (e, field) => {
    const { checked } = e.target;
    dispatch({ 
      type: 'HANDLE_TMJ_INPUTS', 
      payload: { field, type: 'checkbox', checked } 
    });
  };

  const handleDescriptionChange = (field, value) => {
    dispatch({ type: 'HANDLE_DESCRIPTION', payload: { field, value } });
  };

  const validateForm = () => {
    const fields = [
      'skin', 'eyes', 'neck', 'tmj', 'lymph_nodes', 'lips',
      'buccal_mucosa', 'vestibule', 'alveolar_ridge', 'hard_soft_palate',
      'oro_pharynx', 'tongue', 'floor_of_mouth', 'salivary_glands'
    ];

    const errors = [];

    fields.forEach(field => {
      const fieldData = state[field];
      
      // Check if normal/abnormal is selected
      if (typeof fieldData.normal !== 'boolean') {
        errors.push(`${field.replace(/_/g, ' ')}: Please select Normal or Abnormal`);
      }
      
      // If abnormal, description should be provided
      if (fieldData.normal === false && !fieldData.abnormal_description?.trim()) {
        errors.push(`${field.replace(/_/g, ' ')}: Description required when abnormal`);
      }
    });

    if (errors.length > 0) {
      messageApi.error({
        content: `Please fix the following errors:\n${errors.join('\n')}`,
        duration: 5
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const loadingMessage = messageApi.loading('Saving examination data...', 0);
    
    try {
      if (isEdit) {
        const response = await axios.put(API_ENDPOINTS.UPDATE_EXTRAORAL_INTRAORAL(id), state, {withCredentials: true});
        console.log('Update response:', response.data);
        loadingMessage();
        messageApi.success('Examination data updated successfully');
        
        setTimeout(() => {
          navigate(`/patient/${id}`);
        }, 1500);
      } else {
        const response = await axios.post(API_ENDPOINTS.CREATE_EXTRAORAL_INTRAORAL(id), state, {withCredentials: true});
        console.log('Create response:', response.data);
        loadingMessage();
        messageApi.success('Examination data saved successfully');
        
        setTimeout(() => {
          navigate(`/patient/${id}`);
        }, 1500);
      }
    } catch (err) {
      loadingMessage();
      console.error('Error submitting form:', err);
      
      // Better error handling
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Unknown server error';
        
        switch (status) {
          case 400:
            messageApi.error(`Validation Error: ${errorMessage}`);
            break;
          case 401:
            messageApi.error('Unauthorized: Please log in again');
            break;
          case 403:
            messageApi.error('Permission denied');
            break;
          case 404:
            messageApi.error('Patient not found');
            break;
          case 500:
            messageApi.error('Server error: Please try again later');
            break;
          default:
            messageApi.error(`Error: ${errorMessage}`);
        }
      } else if (err.request) {
        messageApi.error('Network error: Please check your connection');
      } else {
        messageApi.error('Error: Something went wrong');
      }
    }
  };

  // Helper function to render assessment card
  const renderAssessmentCard = (title, field, additionalOptions = null) => (
    <div key={field} className="assessment-card">
      <h5>{title}</h5>
      <div className="checkbox-group">
        <Form.Check 
          type="checkbox"
          id={`${field}-normal`}
          label="Normal"
          className="custom-checkbox normal-checkbox"
          checked={state[field]?.normal === true}
          onChange={(e) => handleCheckboxChange(e, field)}
        />
        <Form.Check 
          type="checkbox"
          id={`${field}-abnormal`}
          label="Abnormal"
          className="custom-checkbox abnormal-checkbox"
          checked={state[field]?.normal === false}
          onChange={(e) => handleCheckboxChange(e, field)}
        />
      </div>
      
      {additionalOptions && state[field]?.normal === false && (
        <div className="additional-options">
          {additionalOptions}
        </div>
      )}
      
      <Form.Control 
        type="text"
        placeholder="Description (if abnormal)"
        value={state[field]?.abnormal_description || ''}
        onChange={(e) => handleDescriptionChange(field, e.target.value)}
        className="description-input"
      />
    </div>
  );

  // Additional options for TMJ
  const tmjAdditionalOptions = (
    <>
      <div className="checkbox-group">
        <Form.Check 
          type="checkbox"
          id="tmj-crepitus-right"
          label="Crepitus Right"
          className="custom-checkbox"
          checked={state.tmj?.crepitus_right || false}
          onChange={(e) => handleTMJChange(e, 'crepitus_right')}
        />
        <Form.Check 
          type="checkbox"
          id="tmj-crepitus-left"
          label="Crepitus Left"
          className="custom-checkbox"
          checked={state.tmj?.crepitus_left || false}
          onChange={(e) => handleTMJChange(e, 'crepitus_left')}
        />
      </div>
      <div className="checkbox-group">
        <Form.Check 
          type="checkbox"
          id="tmj-popping"
          label="Popping"
          className="custom-checkbox"
          checked={state.tmj?.popping || false}
          onChange={(e) => handleTMJChange(e, 'popping')}
        />
        <Form.Check 
          type="checkbox"
          id="tmj-deflection"
          label="Deflection"
          className="custom-checkbox"
          checked={state.tmj?.deflection || false}
          onChange={(e) => handleTMJChange(e, 'deflection')}
        />
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading examination data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fs-5">
                {isEdit ? 'Edit Dental Health Assessment' : 'Dental Health Assessment'}
              </h4>
              
              {/* Development Tools */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleFakeDataGenerate}
                  className="d-flex align-items-center gap-2"
                >
                  <span>🎲</span>
                  Generate Test Data
                </Button>
              )}
            </Card.Header>
            
            <Card.Body>
              <p className="text-muted mb-4">
                Please document the patient's extraoral and intraoral examination findings. 
                This information helps in comprehensive treatment planning and diagnostic assessment.
              </p>
              
              <Form onSubmit={handleSubmit}>
                <div className="assessment-grid">
                  {renderAssessmentCard('Skin', 'skin')}
                  {renderAssessmentCard('Eyes', 'eyes')}
                  {renderAssessmentCard('Neck', 'neck')}
                  {renderAssessmentCard('TMJ', 'tmj', tmjAdditionalOptions)}
                  {renderAssessmentCard('Lymph Nodes', 'lymph_nodes')}
                  {renderAssessmentCard('Lips', 'lips')}
                  {renderAssessmentCard('Buccal Mucosa', 'buccal_mucosa')}
                  {renderAssessmentCard('Vestibule', 'vestibule')}
                  {renderAssessmentCard('Alveolar Ridge', 'alveolar_ridge')}
                  {renderAssessmentCard('Hard/Soft Palate', 'hard_soft_palate')}
                  {renderAssessmentCard('Oro-pharynx', 'oro_pharynx')}
                  {renderAssessmentCard('Tongue', 'tongue')}
                  {renderAssessmentCard('Floor of Mouth', 'floor_of_mouth')}
                  {renderAssessmentCard('Salivary Glands', 'salivary_glands')}
                </div>

                <div className="form-action-buttons mt-4">
                  <div className="row g-2">
                    <div className="col-12 col-md-6 order-md-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 btn-submit"
                        disabled={isLoading}
                      >
                        {isEdit ? 'Update Assessment' : 'Save and Continue'} →
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-1">
                      <Button 
                        variant="secondary" 
                        className="w-100 btn-back"
                        onClick={() => navigate(-1)}
                        disabled={isLoading}
                      >
                        ← Back
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DentalHealth2;