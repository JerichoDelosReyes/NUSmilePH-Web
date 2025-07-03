import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Views/Styles/PhysicalAssessment.css';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { App } from 'antd';
import { periodontalReducer, INITIAL_STATE } from '../Reducers/PeriodontalReducer';
import TitleHead from '../Custom Hooks/TitleHead';
import API_ENDPOINTS from '../../config/api';

// Fake data generator for testing periodontal diagnosis
const generateFakePeriodontalData = () => {
  const nucdClassifications = [
    "Generalized Chronic Periodontitis - Moderate",
    "Localized Aggressive Periodontitis - Severe", 
    "Gingivitis - Plaque Induced",
    "Chronic Periodontitis - Stage II Grade A",
    "Necrotizing Ulcerative Gingivitis",
    "Periodontitis - Stage III Grade B",
    "Drug-Induced Gingival Enlargement",
    "Chronic Periodontitis - Stage I Grade A"
  ];

  const aapClassifications = [
    "Periodontitis Stage I Grade A - Localized",
    "Periodontitis Stage II Grade B - Generalized", 
    "Periodontitis Stage III Grade C - Generalized",
    "Periodontitis Stage IV Grade A - Localized",
    "Gingivitis - Dental Biofilm Induced",
    "Periodontitis Stage I Grade B - Generalized",
    "Necrotizing Periodontal Disease",
    "Periodontitis Stage II Grade A - Localized"
  ];

  const instructors = [
    "Dr. Maria Santos",
    "Prof. John Rodriguez", 
    "Dr. Sarah Kim",
    "Dr. Michael Chen",
    "Prof. Linda Garcia",
    "Dr. Robert Johnson",
    "Dr. Anna Martinez",
    "Prof. David Wilson"
  ];

  const asaTypes = ['I', 'II', 'III', 'IV'];

  const probingOptions = ['none', 'localized', 'generalized'];
  const subMarginalOptions = ['none', 'light', 'moderate', 'heavy', 'dense'];
  const supraMarginalOptions = ['none', 'light', 'medium', 'heavy'];
  const oralHygieneOptions = ['none', 'light', 'moderate', 'heavy'];
  
  // Periodontal tissue options
  const perioStatusOptions = ['gingivitis', 'perio_maintenance'];
  const periodontitisStages = [
    'periodontitis_stage_1', 
    'periodontitis_stage_2', 
    'periodontitis_stage_3', 
    'periodontitis_stage_4'
  ];

  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomBoolean = () => Math.random() < 0.7; // 70% chance

  // Generate periodontal tissues object
  const generatePeriodontalTissues = () => {
    const tissues = {
      gingivitis: false,
      periodontitis_stage_1: false,
      periodontitis_stage_2: false,
      periodontitis_stage_3: false,
      periodontitis_stage_4: false,
      perio_maintenance: false
    };

    // Randomly choose between perio status or periodontitis stage
    if (getRandomBoolean()) {
      // Set periodontal status
      const status = getRandomElement(perioStatusOptions);
      tissues[status] = true;
    } else {
      // Set periodontitis stage
      const stage = getRandomElement(periodontitisStages);
      tissues[stage] = true;
    }

    return tissues;
  };

  // Generate selection objects for other fields
  const generateSelectionObject = (options) => {
    const obj = {};
    options.forEach(option => obj[option] = false);
    
    // Randomly select one option
    const selectedOption = getRandomElement(options);
    obj[selectedOption] = true;
    
    return obj;
  };

  return {
    nucd_classification: {
      classification: getRandomElement(nucdClassifications),
      instructor: getRandomElement(instructors),
      total_points: 0 // Will be calculated automatically
    },
    aap_classification: getRandomElement(aapClassifications),
    asa_type: getRandomElement(asaTypes),
    probing_exploring: generateSelectionObject(probingOptions),
    sub_marginal: generateSelectionObject(subMarginalOptions),
    supra_marginal: generateSelectionObject(supraMarginalOptions),
    periodontal_tissues: generatePeriodontalTissues(),
    oral_hygiene: generateSelectionObject(oralHygieneOptions)
  };
};

const PeriodontalDiagnosis = () => {
  TitleHead('Periodontal Diagnosis');
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('action') === 'edit';
  const {message:messageAPI}= App.useApp();
  const [state, dispatch] = useReducer(periodontalReducer, INITIAL_STATE);

  // Fake data generator function
  const handleGenerateFakeData = () => {
    const fakeData = generateFakePeriodontalData();
    
    // Dispatch the fake data to populate the form
    dispatch({ type: 'GET_DATA', payload: fakeData });
    
    messageAPI.success("Fake periodontal diagnosis data generated successfully! 🎲");
  };

  const POINTS = {
    probing_exploring: { none: 0, localized: 1, generalized: 2 },
    sub_marginal: { none: 0, light: 2, moderate: 5, heavy: 6, dense: 7 },
    supra_marginal: { none: 0, light: 1, medium: 2, heavy: 4 },
    periodontal_tissues: {
      gingivitis: 0,
      periodontitis_stage_1: 2,
      periodontitis_stage_2: 3,
      periodontitis_stage_3: 5,
      periodontitis_stage_4: 7,
      perio_maintenance: 2,
    },
    oral_hygiene: { none: 0, light: 1, moderate: 2, heavy: 3 },
  };

  const calculateTotalPoints = useCallback(()=>{
    let total = 0;
    Object.entries(POINTS).forEach(([key, value])=>{
      const selectedOption = state[key];
      if(key === 'periodontal_tissues'){
        for (const [opt, val] of Object.entries(selectedOption)) {
          if (val) total += value[opt] ?? 0
        }
      }
      else{
        for (const [opt, val] of Object.entries(selectedOption)) {
          if (val){
            total += value[opt] ?? 0;
            break;
          }
        }
      }
    })
    return total
  },[state])

  const getPerioData = async ()=>{
    await axios.get(`${API_ENDPOINTS.GET_PERIODONTAL_DIAGNOSIS(id)}`)
    .then((res)=>{
      console.log(res.data)
      dispatch({type: 'GET_DATA', payload: res.data})
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  useEffect(()=>{
    if(isEdit){
      getPerioData();
    }
  }, [])

  useEffect(() => {
    const points = calculateTotalPoints();
    if(state.nucd_classification.total_points !== points){
      dispatch({type:'HANDLE_TOTAL_POINTS', payload: points})
    }
    
  }, [calculateTotalPoints, state.nucd_classification.total_points]);

  const handleChange = (e) => {
    dispatch({type:'HANDLE_INPUT', payload: e.target})
  };
  
  const handleSelectChange = (e)=>{
    const {name, value} = e.target
    dispatch({type:'HANDLE_PROBING_EXPLORING', payload:{name, value}})
  }

  const handlePerioStatus = (e)=>{
    const {value} = e.target
    if(value === ''){
      return dispatch({type:'CLEAR_PERIODONTAL_STATUS'})
    }
    dispatch({type:'HANDLE_PERIODONTAL_STATUS', payload:value})
    console.log(state.periodontal_tissues)
  }

  const handlePerioChanges = (e)=>{
    const {value} = e.target
    console.log(e.target)
    if(value === ''){
      return dispatch({type:'CLEAR_PERIODONTAL_INPUTS'})
    }
    dispatch({type:'HANDLE_PERIODONTAL_INPUTS', payload: value})
    console.log(state.periodontal_tissues)
  }
  
  const handleObjectChange = (e, field)=>{
    const {name, value} = e.target
    dispatch({type:'HANDLE_OBJECT_INPUT', payload:{name, field, value}})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isEdit){
      await axios.put(`${API_ENDPOINTS.UPDATE_PERIODONTAL_DIAGNOSIS(id)}`, state, { withCredentials: true })
      .then((res)=>{
        console.log(res.data)
        messageAPI.success('Periodontal Diagnosis updated successfully!', 3);
        navigate(`/patient/${id}`);
      })
      .catch((err)=>{
        console.log(err)
        messageAPI.error('Error updating Periodontal Diagnosis!', 3);
      })
    }
    else{
      await axios.post(`${API_ENDPOINTS.CREATE_PERIODONTAL_DIAGNOSIS(id)}`,state, { withCredentials: true })
      .then((res)=>{
        console.log(res.data)
        messageAPI.success('Periodontal Diagnosis saved successfully!', 3);
        navigate(`/patient/${id}`);
      })
      .catch((err)=>{
        console.log(err)
        messageAPI.error('Error saving Periodontal Diagnosis!', 3);
      })
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fs-5">Periodontal Diagnosis</h4>
              
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
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>NUCD Classification</Form.Label>
                  <Form.Control
                    type="text"
                    name="nucd_classification"
                    value={state.nucd_classification.classification}
                    onChange={(e)=> handleObjectChange(e, 'classification')}
                    placeholder="Enter NUCD Classification"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Total Points</Form.Label>
                      <Form.Control
                        type="number"
                        name="total_points"
                        value={state.nucd_classification.total_points}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Points are calculated automatically based on your selections.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ASA Classification</Form.Label>
                      <Form.Control
                        as="select"
                        name="asa_type"
                        value={state.asa_type}
                        onChange={handleChange}
                      >
                        <option value="">Select Classification</option>
                        <option value='I'>I - Healthy</option>
                        <option value='II'>II - Mild Systemic Disease</option>
                        <option value='III'>III - Severe Systemic Disease</option>
                        <option value='IV'>IV - Severe Systemic Disease (Constant Threat to Life)</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Instructor</Form.Label>
                  <Form.Control
                    type="text"
                    name="nucd_classification"
                    value={state.nucd_classification.instructor}
                    onChange={(e)=> handleObjectChange(e, 'instructor')}
                    placeholder="Enter Instructor's Name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>AAP Classification</Form.Label>
                  <Form.Control
                    type="text"
                    name="aap_classification"
                    value={state.aap_classification}
                    onChange={handleChange}
                    placeholder="Enter AAP Classification"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bleeding on Probing</Form.Label>
                  <Form.Control
                    as="select"
                    name="probing_exploring"
                    value={Object.entries(state.probing_exploring).find(([_, val])=> val === true)?.[0] || ''}
                    onChange={(e)=> handleSelectChange(e)}
                  >
                    <option value="">Select Option</option>
                    <option value='none'>None (0 pts)</option>
                    <option value='localized'>Localized (1 pt)</option>
                    <option value='generalized'>Generalized (2 pts)</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Calculus Sub-Marginal</Form.Label>
                  <Form.Control
                    as="select"
                    name="sub_marginal"
                    value={Object.entries(state.sub_marginal).find(([_, val])=> val === true)?.[0] || ''}
                    onChange={(e)=> handleSelectChange(e)}
                  >
                    <option value="">Select Option</option>
                    <option value='none'>None (0 pt)</option>
                    <option value='light'>Light (2 pts)</option>
                    <option value='moderate'>Moderate (5 pts)</option>
                    <option value='heavy'>Heavy (6 pts)</option>
                    <option value='dense'>Dense (7 pts)</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Calculus Supra-Marginal</Form.Label>
                  <Form.Control
                    as="select"
                    name="supra_marginal"
                    value={Object.entries(state.supra_marginal).find(([_, val])=> val === true)?.[0] || ''}
                    onChange={(e)=> handleSelectChange(e)}
                  >
                    <option value="">Select Option</option>
                    <option value='none'>None (0 pts)</option>
                    <option value='light'>Light (1 pt)</option>
                    <option value='medium'>Medium (2 pts)</option>
                    <option value='heavy'>Heavy (4 pts)</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Periodontal Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="periodontal_tissues"
                    value={state.periodontal_tissues.gingivitis ? 
                      'gingivitis' : state.periodontal_tissues.perio_maintenance ? 
                      'perio_maintenance' : ''}
                    onChange={(e)=> handlePerioStatus(e)}
                  >
                    <option value="">Select Status</option>
                    <option value='gingivitis'>Gingivitis (0 pts)</option>
                    <option value='perio_maintenance'>Perio Maintenance (2 pts)</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Periodontitis</Form.Label>
                  <Form.Control
                    as="select"
                    name="periodontal_tissues"
                    value={Object.entries(state.periodontal_tissues).
                      find(([key, val])=> 
                        key.startsWith('periodontitis_stage') && val === true)?.[0] || ''}
                    onChange={(e)=> handlePerioChanges(e)}
                  >
                    <option value="">Select Status</option>
                    <option value='periodontitis_stage_1'>Stage I (2 pts)</option>
                    <option value='periodontitis_stage_2'>Stage II (3 pts)</option>
                    <option value='periodontitis_stage_3'>Stage III (5 pts)</option>
                    <option value='periodontitis_stage_4'>Stage IV (7 pts)</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Extrinsic Stain</Form.Label>
                  <Form.Control
                    as="select"
                    name="oral_hygiene"
                    value={Object.entries(state.oral_hygiene).find(([_, val])=> val === true)?.[0] || ''}
                    onChange={(e)=> handleSelectChange(e)}
                  >
                    <option value="">Select Option</option>
                    <option value='none'>None (0 pts)</option>
                    <option value='light'>Light (1 pt)</option>
                    <option value='moderate'>Medium (2 pt)</option>
                    <option value='heavy'>Heavy (3 pt)</option>
                  </Form.Control>
                </Form.Group>

                <div className="form-action-buttons mt-4">
                  <div className="row g-2">
                    <div className="col-12 col-md-6 order-md-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 btn-submit"
                      >
                        Save and Continue
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-1">
                      <Button 
                        variant="secondary" 
                        className="w-100 btn-back"
                        onClick={()=> navigate(-1)}
                      >
                        Back
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

export default PeriodontalDiagnosis;