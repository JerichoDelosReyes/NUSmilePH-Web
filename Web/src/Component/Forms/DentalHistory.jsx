import React, { useEffect, useReducer, useContext } from 'react';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import '../Views/Styles/DentalHistory.css';
import TitleHead from '../Custom Hooks/TitleHead';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { App } from 'antd';
import { dentalHistoryReducer, INITIAL_STATE } from '../Reducers/DentalHistoryReducer';
import { format } from 'date-fns';
import API_ENDPOINTS from '../../config/api';

// Fake data generator utility
const generateFakeDentalHistory = () => {
  const dentalProcedures = [
    "Dental cleaning and prophylaxis",
    "Tooth filling (composite)",
    "Root canal treatment",
    "Tooth extraction",
    "Dental crown placement",
    "Periodontal therapy",
    "Teeth whitening",
    "Orthodontic adjustment",
    "Dental implant consultation",
    "Oral surgery",
    "Fluoride treatment",
    "Sealant application",
  ];

  const toothbrushTypes = [
    "Soft bristle manual",
    "Medium bristle manual",
    "Electric (Oral-B)",
    "Electric (Philips Sonicare)",
    "Bamboo toothbrush",
    "Ultrasonic toothbrush",
    "Disposable travel brush",
  ];

  const toothpasteTypes = [
    "Fluoride toothpaste (Colgate)",
    "Whitening toothpaste (Crest)",
    "Sensitive teeth (Sensodyne)",
    "Natural toothpaste (Tom's)",
    "Tartar control (Aquafresh)",
    "Herbal toothpaste",
    "Children's toothpaste",
  ];

  const anesthesiaResponses = [
    "No adverse reactions",
    "Normal response, no issues",
    "Mild swelling post-procedure",
    "Takes longer to numb than usual",
    "Brief tingling sensation",
    "No complications noted",
    "Excellent tolerance",
  ];

  const complications = [
    "None reported",
    "Minor bleeding for 2 hours",
    "Mild discomfort for 24 hours",
    "Temporary sensitivity",
    "Slight swelling resolved in 2 days",
    "No complications",
    "Brief numbness, resolved naturally",
  ];

  const visitFrequencies = [
    "Every 6 months",
    "Once a year",
    "Every 3-4 months",
    "Twice a year",
    "Only when needed",
    "Every 9 months",
    "Quarterly visits",
  ];

  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomDate = () => {
    const start = new Date(2022, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  return {
    // Dental History
    last_visit: format(getRandomDate(), 'yyyy-MM-dd'),
    frequency_visit: getRandomElement(visitFrequencies),
    last_procedure: getRandomElement(dentalProcedures),
    local_anesthesia: getRandomElement(anesthesiaResponses),
    complication: getRandomElement(complications),
    no_brush: getRandomNumber(1, 3),
    no_floss: getRandomNumber(0, 2),
    no_mouthwash: getRandomNumber(0, 2),
    toothbrush: getRandomElement(toothbrushTypes),
    toothpaste: getRandomElement(toothpasteTypes),
    
    // Dental Questionnaire
    likeSmile: {
      answer: Math.random() > 0.5,
      details: Math.random() > 0.5 ? "Satisfied with current smile" : "Would like whiter teeth"
    },
    experiencedExtraction: {
      answer: Math.random() > 0.3,
      details: Math.random() > 0.5 ? "Wisdom tooth extraction last year" : "Multiple extractions in childhood"
    },
    bleedingAfterExtraction: {
      answer: Math.random() > 0.7,
      details: Math.random() > 0.5 ? "Normal bleeding, stopped within hours" : "Excessive bleeding required additional care"
    },
    orthodonticTreatment: {
      answer: Math.random() > 0.6,
      details: Math.random() > 0.5 ? "Braces for 2 years during teens" : "Clear aligners treatment completed"
    },
    sensitiveTeeth: {
      answer: Math.random() > 0.4,
      details: Math.random() > 0.5 ? "Sensitive to cold drinks and ice cream" : "Pain when eating sweets"
    },
    periodontalProblems: {
      answer: Math.random() > 0.7,
      details: Math.random() > 0.5 ? "Mild gingivitis treated with deep cleaning" : "Recurring gum inflammation"
    },
    spontaneousBleeding: {
      answer: Math.random() > 0.8,
      details: Math.random() > 0.5 ? "Occasional bleeding when brushing" : "Bleeding when flossing"
    },
    fluoridatedToothpaste: {
      answer: Math.random() > 0.2,
      details: Math.random() > 0.5 ? "Always use fluoride toothpaste" : "Switched to fluoride-free recently"
    },
    wearsDenture: {
      answer: Math.random() > 0.9,
      details: Math.random() > 0.5 ? "Partial denture for missing molars" : "Complete upper denture"
    },
    jawPain: {
      answer: Math.random() > 0.6,
      details: Math.random() > 0.5 ? "TMJ pain when chewing hard foods" : "Morning jaw stiffness"
    },
    foodCatching: {
      answer: Math.random() > 0.5,
      details: Math.random() > 0.5 ? "Food gets stuck between back teeth" : "Frequent food trapping in lower molars"
    }
  };
};

const DentalHistory = () => {
  TitleHead('Dental History');
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('action') === 'edit';
  const [state, dispatch] = useReducer(dentalHistoryReducer, INITIAL_STATE);
  const {message:messageAPI} = App.useApp();

  useEffect(() => {
    if (isEdit) {
      getDentalHistoryData();
    }
  }, []);

  const getDentalHistoryData = async () => {
    try {
      const [history, question] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_DENTAL_HISTORY(id)),
        axios.get(API_ENDPOINTS.GET_DENTAL_QUESTION(id))
      ]);

      console.log('Dental History:', history.data);
      console.log('Dental Questionnaire:', question.data);

      const lastVisit = format(new Date(history.data.last_visit), 'yyyy-MM-dd');
      const combinedData = {
        ...history.data,
        ...question.data,
        last_visit: lastVisit,
      };
      dispatch({ type: 'GET_DATA', payload: combinedData });
      
    } catch (err) {
      console.log(err);
      messageAPI.error('Failed to load dental history data');
    }
  };

  const handleFakeDataGenerate = () => {
    const fakeData = generateFakeDentalHistory();
    dispatch({ type: 'GET_DATA', payload: fakeData });
    messageAPI.success('Fake data generated successfully! 🎲');
  };

  const handleChange = (e) => {
    dispatch({ type: 'HANDLE_INPUT', payload: e.target });
  };

  const handleQuestionChange = (e, field) => {
    const payload = {
      name: e.target.name,
      value: e.target.value,
      field: field
    };
    dispatch({ type: 'HANDLE_QUESTION', payload: payload });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Add loading state
  const loadingMessage = messageAPI.loading('Saving dental history...', 0);
  
  try {
    const { 
      last_visit, frequency_visit, last_procedure, 
      local_anesthesia, complication, no_brush, no_floss, 
      no_mouthwash, toothbrush, toothpaste, bleedingAfterExtraction,
      experiencedExtraction, fluoridatedToothpaste, foodCatching,
      jawPain, likeSmile, orthodonticTreatment, periodontalProblems,
      sensitiveTeeth, spontaneousBleeding, wearsDenture 
    } = state;

    // Validate required fields
    if (!last_visit) {
      messageAPI.error('Please select the date of last visit');
      loadingMessage();
      return;
    }

    const dentalHistoryData = {
      complication: complication || '', 
      frequency_visit: frequency_visit || '', 
      last_procedure: last_procedure || '',
      last_visit, 
      local_anesthesia: local_anesthesia || '', 
      no_brush: parseInt(no_brush) || 0, 
      no_floss: parseInt(no_floss) || 0, 
      no_mouthwash: parseInt(no_mouthwash) || 0, 
      toothbrush: toothbrush || '', 
      toothpaste: toothpaste || ''
    };

    const dentalQuestionnaireData = {
      bleedingAfterExtraction: bleedingAfterExtraction || { answer: false, details: '' }, 
      experiencedExtraction: experiencedExtraction || { answer: false, details: '' }, 
      fluoridatedToothpaste: fluoridatedToothpaste || { answer: false, details: '' },
      foodCatching: foodCatching || { answer: false, details: '' }, 
      jawPain: jawPain || { answer: false, details: '' }, 
      likeSmile: likeSmile || { answer: false, details: '' }, 
      orthodonticTreatment: orthodonticTreatment || { answer: false, details: '' }, 
      periodontalProblems: periodontalProblems || { answer: false, details: '' },
      sensitiveTeeth: sensitiveTeeth || { answer: false, details: '' }, 
      spontaneousBleeding: spontaneousBleeding || { answer: false, details: '' }, 
      wearsDenture: wearsDenture || { answer: false, details: '' }
    };

    console.log('Sending dental history data:', dentalHistoryData);
    console.log('Sending questionnaire data:', dentalQuestionnaireData);

    if (isEdit) {
      // Update existing records
      const [historyResponse, questionResponse] = await Promise.all([
        axios.put(API_ENDPOINTS.UPDATE_DENTAL_HISTORY(id), dentalHistoryData, {withCredentials: true}),
        axios.put(API_ENDPOINTS.UPDATE_DENTAL_QUESTION(id), dentalQuestionnaireData, {withCredentials: true})
      ]);
      
      console.log('Update responses:', { historyResponse, questionResponse });
      loadingMessage();
      messageAPI.success('Dental History and Questionnaire updated successfully');
    } else {
      // Create new records
      const [historyResponse, questionResponse] = await Promise.all([
        axios.post(API_ENDPOINTS.CREATE_DENTAL_HISTORY(id), dentalHistoryData, {withCredentials: true}),
        axios.post(API_ENDPOINTS.CREATE_DENTAL_QUESTION(id), dentalQuestionnaireData, {withCredentials: true})
      ]);
      
      console.log('Create responses:', { historyResponse, questionResponse });
      loadingMessage();
      messageAPI.success('Dental History and Questionnaire saved successfully');
    }
    
    // Navigate after successful save
    setTimeout(() => {
      navigate(`/patient/${id}`);
    }, 1500);
    
  } catch (err) {
    loadingMessage();
    console.error('Error submitting form:', err);
    
    // Better error handling
    if (err.response) {
      const status = err.response.status;
      const errorMessage = err.response.data?.message || err.response.data?.error || 'Unknown server error';
      
      switch (status) {
        case 400:
          messageAPI.error(`Validation Error: ${errorMessage}`);
          break;
        case 401:
          messageAPI.error('Unauthorized: Please log in again');
          break;
        case 403:
          messageAPI.error('Permission denied');
          break;
        case 404:
          messageAPI.error('Patient not found');
          break;
        case 500:
          messageAPI.error('Server error: Please try again later');
          break;
        default:
          messageAPI.error(`Error: ${errorMessage}`);
      }
      
      console.error('Server response:', err.response.data);
    } else if (err.request) {
      messageAPI.error('Network error: Please check your connection');
      console.error('Network error:', err.request);
    } else {
      messageAPI.error('Error: Something went wrong');
      console.error('Error:', err.message);
    }
  }
};

  // Question rendering helper function
  const renderQuestionWithDetails = (field, label) => (
    <div key={field} className="mb-4">
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">{label}</Form.Label>
        <Form.Control
          as="select"
          name="answer"
          value={state[field]?.answer ?? ''}
          onChange={(e) => handleQuestionChange(e, field)}
          className="form-select"
        >
          <option value="">Select an answer</option>
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </Form.Control>
      </Form.Group>
      
      {state[field]?.answer !== '' && state[field]?.answer && (
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Provide details</Form.Label>
          <Form.Control
            type="text"
            name="details"
            value={state[field]?.details || ''}
            onChange={(e) => handleQuestionChange(e, field)}
            placeholder="Enter additional details..."
            className="form-control"
          />
        </Form.Group>
      )}
    </div>
  );

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          {/* Header Card */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fs-5">
                {isEdit ? 'Edit Dental History' : 'Dental History Form'}
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
                Please provide comprehensive information about the patient's dental care history. 
                This information helps us provide the most appropriate dental recommendations and treatment.
              </p>
              
              <Form onSubmit={handleSubmit}>
                {/* Basic Dental History */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Basic Dental History</h5>
                </div>
                
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Date of Last Visit</Form.Label>
                      <Form.Control
                        type="date"
                        name="last_visit"
                        value={state.last_visit || ''}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Frequency of Dental Visits</Form.Label>
                      <Form.Control
                        type="text"
                        name="frequency_visit"
                        value={state.frequency_visit || ''}
                        onChange={handleChange}
                        placeholder="e.g., Every 6 months"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Procedure Done on Last Visit</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_procedure"
                        value={state.last_procedure || ''}
                        onChange={handleChange}
                        placeholder="e.g., Cleaning, Filling, etc."
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Response to Local Anesthesia</Form.Label>
                      <Form.Control
                        type="text"
                        name="local_anesthesia"
                        value={state.local_anesthesia || ''}
                        onChange={handleChange}
                        placeholder="Any allergic reactions or complications"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Complications During/After Procedures</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="complication"
                        value={state.complication || ''}
                        onChange={handleChange}
                        placeholder="Describe any complications experienced"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Dental Hygiene Routine */}
                <div className="section-divider mb-4">
                  <h5 className="section-title text-primary mb-3">Dental Hygiene Routine</h5>
                </div>

                <Row className="mb-4">
                  <Col xs={12} sm={4} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Brushing Frequency</Form.Label>
                      <Form.Control
                        type="number"
                        name="no_brush"
                        value={state.no_brush || ''}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="10"
                        className="form-control"
                      />
                      <Form.Text className="text-muted">times per day</Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} sm={4} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Flossing Frequency</Form.Label>
                      <Form.Control
                        type="number"
                        name="no_floss"
                        value={state.no_floss || ''}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="10"
                        className="form-control"
                      />
                      <Form.Text className="text-muted">times per day</Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} sm={4} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Mouthwash Usage</Form.Label>
                      <Form.Control
                        type="number"
                        name="no_mouthwash"
                        value={state.no_mouthwash || ''}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="10"
                        className="form-control"
                      />
                      <Form.Text className="text-muted">times per day</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Toothbrush Brand/Type</Form.Label>
                      <Form.Control
                        type="text"
                        name="toothbrush"
                        value={state.toothbrush || ''}
                        onChange={handleChange}
                        placeholder="e.g., Soft bristle, Electric, etc."
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Toothpaste Brand/Type</Form.Label>
                      <Form.Control
                        type="text"
                        name="toothpaste"
                        value={state.toothpaste || ''}
                        onChange={handleChange}
                        placeholder="e.g., Fluoride, Whitening, etc."
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Dental Health Questionnaire */}
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-secondary text-white">
                    <h5 className="mb-0 fs-6">Dental Health Questionnaire</h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted mb-4">
                      Please answer the following questions about your dental health experience.
                    </p>
                    
                    {renderQuestionWithDetails('likeSmile', '1. Do you like your smile?')}
                    {renderQuestionWithDetails('experiencedExtraction', '2. Have you ever had tooth extraction?')}
                    {renderQuestionWithDetails('bleedingAfterExtraction', '3. Have you experienced excessive bleeding after tooth extraction?')}
                    {renderQuestionWithDetails('orthodonticTreatment', '4. Have you ever had orthodontic treatment?')}
                    {renderQuestionWithDetails('sensitiveTeeth', '5. Are your teeth sensitive to temperature or pressure?')}
                    {renderQuestionWithDetails('periodontalProblems', '6. Have you had any gum problems?')}
                    {renderQuestionWithDetails('spontaneousBleeding', '7. Do your gums bleed spontaneously?')}
                    {renderQuestionWithDetails('fluoridatedToothpaste', '8. Do you use fluoridated toothpaste?')}
                    {renderQuestionWithDetails('wearsDenture', '9. Do you wear any type of denture?')}
                    {renderQuestionWithDetails('jawPain', '10. Do you experience jaw pain?')}
                    {renderQuestionWithDetails('foodCatching', '11. Does food frequently catch in your teeth?')}
                  </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Button 
                    variant="outline-secondary" 
                    className="me-md-2" 
                    onClick={() => navigate(-1)}
                  >
                    ← Back
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="px-4"
                  >
                    {isEdit ? 'Update Information' : 'Save and Continue'} →
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DentalHistory;