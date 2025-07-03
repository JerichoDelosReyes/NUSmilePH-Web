import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import TopNavbar from '../Custom Hooks/TopNavbar';
import SideBar from '../Custom Hooks/SideBar';
import { NavigationProvider, useNavigation } from '../Custom Hooks/NavigationProvider';
import { UserContext } from '../Context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Views/Styles/DentalHistory3.css';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { App } from 'antd';
import { dentalHistory2Reducer, INITIAL_STATE } from '../Reducers/DentalHistory_2_Reducer';
import TitleHead from '../Custom Hooks/TitleHead';
import API_ENDPOINTS from '../../config/api';

// Fake data generator for testing and development
const generateFakeOcclusionData = () => {
  const occlusionAbnormalities = [
    "Crossbite (anterior)",
    "Crossbite (posterior)",
    "Open bite",
    "Deep bite",
    "Crowding",
    "Spacing",
    "Midline deviation",
    "Cant of occlusal plane",
    "Edge-to-edge bite",
    "Scissors bite",
    "None noted",
  ];

  const parafunctionalHabits = [
    "Bruxism (grinding)",
    "Clenching",
    "Nail biting",
    "Lip biting",
    "Tongue thrusting",
    "Pen chewing",
    "Ice chewing",
    "Cheek biting",
    "Thumb sucking",
    "None observed",
    "Multiple habits noted",
  ];

  const gingivalColors = [
    "Pink (healthy)",
    "Red (inflamed)",
    "Pale pink",
    "Dusky red",
    "Bluish red",
    "Bright red with bleeding",
    "Purple-red",
    "Grayish",
  ];

  const gingivalConsistencies = [
    "Firm and resilient",
    "Soft and spongy",
    "Firm but enlarged",
    "Boggy and edematous",
    "Fibrotic",
    "Hyperplastic",
    "Tender and swollen",
    "Hard and fibrous",
  ];

  const gingivalContours = [
    "Knife-edge, scalloped",
    "Rolled margins",
    "Bulbous papillae",
    "Cratered papillae",
    "Blunted papillae",
    "Irregular contour",
    "Festooned margins",
    "Knife-edge with recession",
  ];

  const gingivalTextures = [
    "Stippled (orange peel)",
    "Smooth and shiny",
    "Rough and irregular",
    "Ulcerated areas",
    "Fissured",
    "Normal stippling",
    "Loss of stippling",
    "Leathery texture",
  ];

  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomBoolean = (probability = 0.3) => Math.random() < probability;

  // Generate occlusion class selection (only one should be true)
  const occlusionClasses = ['class_I', 'class_II_div_1', 'class_II_div_2', 'class_III'];
  const selectedClass = getRandomElement(occlusionClasses);
  
  const occlusionData = {
    class_I: selectedClass === 'class_I',
    class_II_div_1: selectedClass === 'class_II_div_1',
    class_II_div_2: selectedClass === 'class_II_div_2',
    class_III: selectedClass === 'class_III',
    other_occlusal_abnormalities: getRandomElement(occlusionAbnormalities),
    parafunctional_oral_habits: getRandomElement(parafunctionalHabits),
  };

  // Generate plaque data
  const plaqueLevel = getRandomElement(['Light', 'Moderate', 'Heavy']);
  const distribution = getRandomElement(['Generalized', 'Localized']);

  // Generate enamel conditions (1-4 conditions selected)
  const enamelConditions = {
    erosion: getRandomBoolean(0.25),
    demineralization: getRandomBoolean(0.3),
    attrition: getRandomBoolean(0.35),
    abfraction: getRandomBoolean(0.15),
    fluorosis: getRandomBoolean(0.2),
    abrasion: getRandomBoolean(0.25),
  };

  const plaqueData = {
    plaque: plaqueLevel,
    distribution: distribution,
    enamel_conditions: enamelConditions,
  };

  // Generate gingival description
  const gingivalData = {
    color: getRandomElement(gingivalColors),
    consistency: getRandomElement(gingivalConsistencies),
    contour: getRandomElement(gingivalContours),
    texture: getRandomElement(gingivalTextures),
  };

  return {
    ...occlusionData,
    ...plaqueData,
    ...gingivalData,
  };
};

const DentalHistory3 = () => {
  TitleHead('Occlusion and Plaque Enamel History');
  const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } = useNavigation();
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('action') === 'edit';
  const [state, dispatch] = useReducer(dentalHistory2Reducer, INITIAL_STATE);
  const {message:messageApi }= App.useApp();
  const [isLoading, setIsLoading] = useState(false);

  const getDentalData = async () => {
    setIsLoading(true);
    try {
      const [occlusion, plaque, gingival] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_OCCLUSION(id)),
        axios.get(API_ENDPOINTS.GET_PLAQUE_ENAMEL(id)),
        axios.get(API_ENDPOINTS.GET_GINGIVAL_DESCRIPTION(id)),
      ]);

      console.log('Occlusion Data:', occlusion.data);
      console.log('Plaque Data:', plaque.data);
      console.log('Gingival Data:', gingival.data);

      const enamelConditions = plaque.data.enamel_conditions || {};

      const combinedData = {
        ...occlusion.data,
        ...plaque.data,
        enamel_conditions: enamelConditions,
        ...gingival.data,
      };

      dispatch({ type: 'GET_DATA', payload: combinedData });
      messageApi.success('Data loaded successfully');
    } catch (err) {
      console.error('Error fetching dental data:', err);
      messageApi.error('Failed to load existing data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFakeDataGenerate = () => {
    const fakeData = generateFakeOcclusionData();
    dispatch({ type: 'GET_DATA', payload: fakeData });
    messageApi.success('Fake dental assessment data generated successfully! 🎲');
  };

  useEffect(() => {
    if (isEdit) {
      getDentalData();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    dispatch({ type: 'HANDLE_INPUTS', payload: e.target });
  };

  const handlePlaqueChange = (e) => {
    dispatch({ type: 'HANDLE_PLAQUE_INPUTS', payload: e.target });
  };

  const handleEnamelChange = (e) => {
    dispatch({ type: 'HANDLE_ENAMEL_INPUTS', payload: e.target });
  };

  const validateForm = () => {
    const { 
      class_I, class_II_div_1, class_II_div_2, class_III,
      other_occlusal_abnormalities, parafunctional_oral_habits,
      plaque, distribution, enamel_conditions,
      color, consistency, contour, texture 
    } = state;

    const errors = [];

    // Validate occlusion class selection
    if (!class_I && !class_II_div_1 && !class_II_div_2 && !class_III) {
      errors.push('Please select at least one occlusion class');
    }

    // Validate required text fields
    if (!other_occlusal_abnormalities?.trim()) {
      errors.push('Other occlusal abnormalities is required');
    }

    if (!parafunctional_oral_habits?.trim()) {
      errors.push('Parafunctional oral habits is required');
    }

    if (!plaque) {
      errors.push('Please select plaque level');
    }

    if (!distribution) {
      errors.push('Please select plaque distribution');
    }

    // Validate enamel conditions
    const hasEnamelCondition = Object.values(enamel_conditions || {}).some(Boolean);
    if (!hasEnamelCondition) {
      errors.push('Please select at least one enamel condition');
    }

    // Validate gingival description
    if (!color?.trim()) {
      errors.push('Gingival color is required');
    }

    if (!consistency?.trim()) {
      errors.push('Gingival consistency is required');
    }

    if (!contour?.trim()) {
      errors.push('Gingival contour is required');
    }

    if (!texture?.trim()) {
      errors.push('Gingival texture is required');
    }

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

    const loadingMessage = messageApi.loading('Saving dental assessment data...', 0);

    try {
      const {
        class_I,
        class_II_div_1,
        class_II_div_2,
        class_III,
        other_occlusal_abnormalities,
        parafunctional_oral_habits,
        plaque,
        distribution,
        enamel_conditions,
        color,
        consistency,
        contour,
        texture,
      } = state;

      const occlusionData = { 
        class_I, 
        class_II_div_1, 
        class_II_div_2, 
        class_III, 
        other_occlusal_abnormalities, 
        parafunctional_oral_habits 
      };

      const plaqueData = { 
        plaque, 
        distribution, 
        enamel_conditions 
      };

      const gingivalData = { 
        color, 
        consistency, 
        contour, 
        texture 
      };

      console.log('Sending data:', { occlusionData, plaqueData, gingivalData });

      if (isEdit) {
        await Promise.all([
          axios.put(API_ENDPOINTS.UPDATE_OCCLUSION(id), occlusionData,{withCredentials: true}),
          axios.put(API_ENDPOINTS.UPDATE_PLAQUE_ENAMEL(id), plaqueData,{withCredentials: true}),
          axios.put(API_ENDPOINTS.UPDATE_GINGIVAL_DESCRIPTION(id), gingivalData,{withCredentials: true}),
        ]);
        
        loadingMessage();
        messageApi.success('Dental assessment updated successfully');
        
        setTimeout(() => {
          navigate(`/patient/${id}`);
        }, 1500);
      } else {
        await Promise.all([
          axios.post(API_ENDPOINTS.CREATE_OCCLUSION(id), occlusionData,{withCredentials: true}),
          axios.post(API_ENDPOINTS.CREATE_PLAQUE_ENAMEL(id), plaqueData,{withCredentials: true}),
          axios.post(API_ENDPOINTS.CREATE_GINGIVAL_DESCRIPTION(id), gingivalData,{withCredentials: true}),
        ]);
        
        loadingMessage();
        messageApi.success('Dental assessment saved successfully');
        
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

  if (isLoading) {
    return (
      <div className="content-wrapper d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dental assessment data...</p>
        </div>
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
                {isEdit ? 'Edit Dental Assessment' : 'Dental Assessment - Occlusion & Plaque'}
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
                Please document the patient's occlusion classification, plaque assessment, 
                enamel conditions, and gingival description for comprehensive treatment planning.
              </p>
              
              <Form onSubmit={handleSubmit}>
                {/* Occlusion Section */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Occlusion Classification</h5>
                </div>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Select Occlusion Class:</Form.Label>
                  <div className="checkbox-options">
                    {['Class I', 'Class II Div 1', 'Class II Div 2', 'Class III'].map((option) => {
                      const optionName = option
                        .replace(/\b(Class|Div)\b/g, (match) => match.toLowerCase())
                        .replace(/\s+/g, '_');
                      
                      return (
                        <div key={option} className="option-item">
                          <Form.Check
                            type="checkbox"
                            name={optionName}
                            id={optionName}
                            checked={state[optionName] || false}
                            onChange={handleChange}
                            className="custom-checkbox"
                          />
                          <label 
                            htmlFor={optionName} 
                            className="custom-checkbox-label"
                          >
                            {option}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </Form.Group>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Other Occlusal Abnormalities</Form.Label>
                      <Form.Control
                        type="text"
                        name="other_occlusal_abnormalities"
                        value={state.other_occlusal_abnormalities || ''}
                        onChange={handleChange}
                        placeholder="e.g., Crossbite, Open bite, Deep bite"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Parafunctional Oral Habits</Form.Label>
                      <Form.Control
                        type="text"
                        name="parafunctional_oral_habits"
                        value={state.parafunctional_oral_habits || ''}
                        onChange={handleChange}
                        placeholder="e.g., Bruxism, Nail biting, Clenching"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Plaque Assessment Section */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Plaque Assessment</h5>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Plaque Level & Distribution:</Form.Label>
                  <div className="checkbox-options">
                    {['Light', 'Moderate', 'Heavy'].map((option) => (
                      <div key={option} className="option-item">
                        <Form.Check
                          type="radio"
                          name="plaque"
                          id={`plaque-${option}`}
                          checked={state.plaque === option}
                          onChange={handlePlaqueChange}
                          className="custom-checkbox"
                        />
                        <label 
                          htmlFor={`plaque-${option}`} 
                          className="custom-checkbox-label"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                    
                    {['Generalized', 'Localized'].map((option) => (
                      <div key={option} className="option-item">
                        <Form.Check
                          type="radio"
                          name="distribution"
                          id={`distribution-${option}`}
                          checked={state.distribution === option}
                          onChange={handlePlaqueChange}
                          className="custom-checkbox"
                        />
                        <label 
                          htmlFor={`distribution-${option}`} 
                          className="custom-checkbox-label"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                {/* Enamel Conditions Section */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Enamel Conditions</h5>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Select all that apply:</Form.Label>
                  <div className="checkbox-options">
                    {['Erosion', 'Demineralization', 'Attrition', 'Abfraction', 'Fluorosis', 'Abrasion'].map((option) => {
                      const optionName = option.toLowerCase();
                      return (
                        <div key={option} className="option-item">
                          <Form.Check
                            type="checkbox"
                            name={optionName}
                            id={`enamel-${optionName}`}
                            checked={state.enamel_conditions?.[optionName] || false}
                            onChange={handleEnamelChange}
                            className="custom-checkbox"
                          />
                          <label 
                            htmlFor={`enamel-${optionName}`} 
                            className="custom-checkbox-label"
                          >
                            {option}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </Form.Group>

                {/* Gingival Description Section */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Gingival Description</h5>
                </div>

                <Form.Group className="mb-4">
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Color</Form.Label>
                      <Form.Control
                        type="text"
                        name="color"
                        value={state.color || ''}
                        onChange={handleChange}
                        placeholder="e.g., Pink, Red, Pale pink"
                        className="form-control"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Consistency</Form.Label>
                      <Form.Control
                        type="text"
                        name="consistency"
                        value={state.consistency || ''}
                        onChange={handleChange}
                        placeholder="e.g., Firm, Soft, Spongy"
                        className="form-control"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Contour</Form.Label>
                      <Form.Control
                        type="text"
                        name="contour"
                        value={state.contour || ''}
                        onChange={handleChange}
                        placeholder="e.g., Knife-edge, Rolled margins"
                        className="form-control"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Texture</Form.Label>
                      <Form.Control
                        type="text"
                        name="texture"
                        value={state.texture || ''}
                        onChange={handleChange}
                        placeholder="e.g., Stippled, Smooth, Rough"
                        className="form-control"
                      />
                    </Col>
                  </Row>
                </Form.Group>

                {/* Action Buttons */}
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

export default DentalHistory3;