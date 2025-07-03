import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Views/Styles/PatientData.css';
import '../Views/Styles/AllPatientDashboard.css';
import { UserContext } from '../Context/UserContext';
import { App } from 'antd';
import TitleHead from '../Custom Hooks/TitleHead';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { patientDataReducer, INITIAL_STATE } from '../Reducers/PatientDataReducer';
import { FiArrowLeft } from 'react-icons/fi';
import Footer from '../Custom Hooks/Footer';
import API_ENDPOINTS from '../../config/api';

// Create a wrapper component to use navigation context
const PatientData = () => {
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();

  // Update title based on id presence
  TitleHead(id ? 'Edit Patient' : 'Create Patient');

  const {message: messageAPI} = App.useApp();
  const [state, dispatch] = useReducer(patientDataReducer, INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateInputComplete, setDateInputComplete] = useState(false);
  // Track currently focused field
  const [focusedField, setFocusedField] = useState(null);
  // Track if form was submitted
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      getPatientData();
    }
  }, [id]);

  const resetData = () => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setTouched({});
    setDateInputComplete(false);
    setFormSubmitted(false);
  };

const getPatientData = async () => {
  try {
    const res = await axios.get(`${API_ENDPOINTS.GET_PATIENT_BY_ID(id)}`, { withCredentials: true });
    console.log('Raw patient data:', res.data);
    
    // Handle the children field mapping correctly
    let patientData = { ...res.data };
    
    // Map noChildren from backend to children for frontend
    if (patientData.noChildren !== undefined) {
      patientData.children = patientData.noChildren;
      console.log('Mapped noChildren to children:', patientData.noChildren, '->', patientData.children);
    } else if (patientData.children === undefined) {
      console.warn("Children field is missing in patient data, defaulting to 0");
      patientData.children = 0;
    }
    
    // Ensure children is a number
    patientData.children = Number(patientData.children) || 0;
    
    // Fix date of birth format - extract just the date part from ISO string
    if (patientData.dob) {
      // Convert ISO date string to YYYY-MM-DD format for HTML date input
      const dobDate = new Date(patientData.dob);
      if (!isNaN(dobDate.getTime())) {
        patientData.dob = dobDate.toISOString().split('T')[0];
        console.log('Converted DOB:', res.data.dob, '->', patientData.dob);
      } else {
        console.warn('Invalid date format for DOB:', patientData.dob);
        patientData.dob = '';
      }
    }
    
    console.log('Processed patient data:', patientData);
    
    dispatch({ type: 'HANDLE_EXISTING_PATIENT', payload: patientData });
    
    // Mark the date input as complete if we're loading existing data
    if (patientData.dob) {
      setDateInputComplete(true);
    }
  } catch (err) {
    console.log(err);
    messageAPI.error('Error fetching patient data');
  }
};

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';

    // Skip DOB validation if user is still entering the date
    if (name === 'dob' && !dateInputComplete) {
      return '';
    }

    // Handle empty required fields
    if ((!value && value !== 0) || (typeof value === 'string' && value.trim() === '')) {
      // These fields are required
      if ([
        'firstname', 'lastname', 'middlename', 'dob', 'age', 'gender',
        'marital_status', 'prefix', 'religion', 'height', 'weight',
        'children', 'occupation', 'permanent_address', 'contact_no',
        'email_address', 'emergency_person', 'emergency_address',
        'relationship_to_patient', 'emergency_contact_no',
        'chiefComplaint', 'illnessHistory'
      ].includes(name)) {
        return 'This field is required';
      }
      return '';
    }

    // Field-specific validation
    switch (name) {
      case 'firstname':
      case 'lastname':
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Name should contain only letters, spaces, hyphens and apostrophes';
        } else if (value.length < 2) {
          error = 'Name should be at least 2 characters';
        } else if (value.length > 50) {
          error = 'Name should not exceed 50 characters';
        }
        break;

      case 'middlename':
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Name should contain only letters, spaces, hyphens and apostrophes';
        } else if (value.length < 2) {
          error = 'Name should be at least 2 characters';
        } else if (value.length > 50) {
          error = 'Name should not exceed 50 characters';
        }
        break;

      case 'email_address':
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'contact_no':
      case 'emergency_contact_no':
        if (!/^09\d{9}$/.test(value)) {
          error = 'Please enter a valid Philippine mobile number (format: 09XXXXXXXXX)';
        }
        break;

      case 'height':
        if (isNaN(value) || value < 50 || value > 250) {
          error = 'Height should be between 50 and 250 cm';
        }
        break;

      case 'weight':
        if (isNaN(value) || value < 1 || value > 300) {
          error = 'Weight should be between 1 and 300 kg';
        }
        break;

      case 'children':
        if (isNaN(value) || value < 0 || value > 100 || !Number.isInteger(Number(value))) {
          error = 'Number of children must be a whole number between 0 and 100';
        }
        break;

      case 'dob':
        const birthDate = new Date(value);
        const today = new Date();
        if (isNaN(birthDate.getTime())) {
          error = 'Please enter a valid date';
        } else if (birthDate > today) {
          error = 'Birth date cannot be in the future';
        } else if (birthDate.getFullYear() < 1900) {
          error = 'Birth date should be after 1900';
        }
        break;

      case 'age':
        if (isNaN(value) || value < 0 || value > 120 || !Number.isInteger(Number(value))) {
          error = 'Age should be a whole number between 0 and 120';
        }
        break;

      case 'gender':
        if (!['Male', 'Female', 'Other', 'Prefer not to say'].includes(value)) {
          error = 'Please select a valid gender';
        }
        break;

      case 'marital_status':
        if (!['Single', 'Married', 'Widowed', 'Divorced', 'Separated', 'Annulled', 'Domestic Partnership'].includes(value)) {
          error = 'Please select a valid marital status';
        }
        break;

      case 'prefix':
        if (!/^[a-zA-Z]+$/.test(value)) {
          error = 'Prefix should contain only letters';
        } else if (value.length > 10) {
          error = 'Prefix should not exceed 10 characters';
        }
        break;

      case 'religion':
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Religion should contain only letters and spaces';
        } else if (value.length > 50) {
          error = 'Religion should not exceed 50 characters';
        }
        break;

      case 'occupation':
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Occupation should contain only letters, spaces, hyphens and apostrophes';
        } else if (value.length < 2) {
          error = 'Occupation should be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Occupation should not exceed 100 characters';
        }
        break;

      case 'permanent_address':
      case 'emergency_address':
        if (value.length < 5) {
          error = 'Address should be at least 5 characters';
        } else if (value.length > 200) {
          error = 'Address should not exceed 200 characters';
        }
        break;

      case 'emergency_person':
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Name should contain only letters, spaces, hyphens and apostrophes';
        } else if (value.length < 2) {
          error = 'Name should be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Name should not exceed 100 characters';
        }
        break;

      case 'relationship_to_patient':
        if (!['Spouse', 'Parent', 'Child', 'Sibling', 'Relative', 'Friend', 'Other'].includes(value)) {
          error = 'Please select a valid relationship';
        }
        break;

      case 'chiefComplaint':
        if (value.length > 1000) {
          error = 'Chief complaint should not exceed 1000 characters';
        }
        break;

      case 'illnessHistory':
        if (value.length > 1000) {
          error = 'Illness history should not exceed 1000 characters';
        }
        break;

      default:
        break;
    }
    return error;
  };

  // Validate form - complete validation of all fields
  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // List of all fields to validate
    const fieldsToValidate = [
      'firstname', 'middlename', 'lastname', 'dob', 'age', 'gender',
      'marital_status', 'prefix', 'religion', 'height', 'weight',
      'children', 'occupation', 'permanent_address', 'contact_no',
      'email_address', 'emergency_person', 'relationship_to_patient',
      'emergency_contact_no', 'emergency_address', 'chiefComplaint',
      'illnessHistory'
    ];

    // Validate each field
    fieldsToValidate.forEach(field => {
      const error = validateField(field, state[field]);
      if (error) {
        newErrors[field] = error;
        valid = false;
      } else {
        newErrors[field] = '';
      }
    });

    setErrors(newErrors);
    setFormValid(valid);
    return valid;
  };

  // Effect to validate form whenever state changes
  useEffect(() => {
    validateForm();
  }, [state, dateInputComplete]);

  // Function to check if a date input is complete
  const isValidDateFormat = (dateString) => {
    // Check if it matches YYYY-MM-DD format and all parts are present
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  // Calculate age from date of birth
  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  // Handle field focus to track currently focused field
  const handleFieldFocus = (field) => {
    setFocusedField(field);
  };

  // Handle field blur to mark as touched and validate
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocusedField(null);
    
    // Special handling for DOB
    if (field === 'dob' && state.dob) {
      if (isValidDateFormat(state.dob)) {
        setDateInputComplete(true);
        const age = calculateAge(state.dob);

        if (age !== null) {
          dispatch({
            type: 'HANDLE_INPUTS',
            payload: { name: 'age', value: age }
          });
        }
      } else {
        setDateInputComplete(false);
      }
    }
  };

  // Improved handleChange function to handle date of birth and automatic age calculation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for DOB
    if (name === 'dob') {
      dispatch({
        type: 'HANDLE_INPUTS',
        payload: { name, value }
      });

      // Only calculate age when date is complete and valid
      if (value && isValidDateFormat(value)) {
        const age = calculateAge(value);

        if (age !== null) {
          setDateInputComplete(true);
          dispatch({
            type: 'HANDLE_INPUTS',
            payload: { name: 'age', value: age }
          });
        }
      } else {
        setDateInputComplete(false);
      }
    } else if (name === 'age' && dateInputComplete && isValidDateFormat(state.dob)) {
      // Prevent manual changes to age when DOB is set
      return;
    } else {
      // For all other fields, handle normally
      dispatch({
        type: 'HANDLE_INPUTS',
        payload: { name, value }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSubmitted(true);

    // Set date input as complete for validation
    setDateInputComplete(true);

    // Mark all fields as touched
    const allFields = [
      'firstname', 'middlename', 'lastname', 'dob', 'age', 'gender',
      'marital_status', 'prefix', 'religion', 'height', 'weight',
      'children', 'occupation', 'permanent_address', 'contact_no',
      'email_address', 'emergency_person', 'relationship_to_patient',
      'emergency_contact_no', 'emergency_address', 'chiefComplaint',
      'illnessHistory'
    ];

    const allTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});

    setTouched(allTouched);

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      messageAPI.error('Please fix the errors in the form');

      // Scroll to the first error
      const firstErrorField = document.querySelector('.is-invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    try {
      // Map frontend field names to backend field names
      const formData = {
        ...state,
        noChildren: Number(state.children || 0) // Map children to noChildren for backend
      };

      // Remove the frontend-only children field
      delete formData.children;

      console.log('Submitting form data:', formData);

      if (id) {
        await axios.put(`${API_ENDPOINTS.UPDATE_PATIENT_BY_ID(id)}`, formData, {withCredentials: true});
        messageAPI.success('Patient Data Updated Successfully!');
        resetData();
        navigate('/allpatientdashboard');
      } else {
        await axios.post(`${API_ENDPOINTS.CREATE_PATIENT(user.id)}`, formData, {withCredentials: true});
        messageAPI.success('Patient Data Created Successfully!');
        resetData();
        navigate('/allpatientdashboard');
      }
    } catch (err) {
      console.log('Submit error:', err);
      messageAPI.error(id ? 'Error updating patient data' : 'Error creating patient data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePatient = () => {
    const birthday = faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0];
    const ageInYears = dayjs().diff(dayjs(birthday), 'year');
    const payload = {
      firstname: faker.person.firstName(),
      middlename: faker.person.middleName(),
      lastname: faker.person.lastName(),
      dob: birthday,
      age: ageInYears,
      gender: faker.helpers.arrayElement(["Male", "Female"]),
      marital_status: faker.helpers.arrayElement([
        "Single",
        "Married",
        "Widowed",
        "Divorced",
        "Separated",
        "Annulled",
        "Domestic Partnership"
      ]),
      prefix: faker.person.prefix().replace(/[^a-zA-Z]/g, ''),
      religion: faker.helpers.arrayElement([
        "Roman Catholic",
        "Protestant",
        "Islam",
        "Atheist",
        "Agnostic",
        "Aglipayan",
        "Jehovah"
      ]),
      height: faker.number.int({ min: 150, max: 190 }),
      weight: faker.number.float({ min: 50, max: 95, fractionDigits: 1 }),
      children: faker.number.int({ min: 0, max: 100 }), // Use children for frontend
      occupation: faker.person.jobTitle(),
      permanent_address: faker.location.streetAddress() + ', ' + faker.location.city(),
      contact_no: '09' + faker.string.numeric(9),
      email_address: faker.internet.email(),
      emergency_person: faker.person.fullName(),
      relationship_to_patient: faker.helpers.arrayElement([
        "Parent",
        "Sibling",
        "Spouse",
        "Friend",
        "Relative"
      ]),
      emergency_contact_no: '09' + faker.string.numeric(9),
      emergency_address: faker.location.streetAddress() + ', ' + faker.location.city(),
      chiefComplaint: faker.lorem.sentence(),
      illnessHistory: faker.lorem.paragraph({ min: 1, max: 3 })
    };

    // Make sure children is explicitly a number
    payload.children = Number(payload.children);

    // Mark all fields as touched when generating data
    const allFields = Object.keys(payload);
    const allTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});

    setTouched(allTouched);
    setDateInputComplete(true);
    dispatch({ type: 'HANDLE_GENERATED_PATIENT', payload: payload });
  };

  // Helper function to determine if validation error should display
  const shouldShowError = (field) => {
    return touched[field] && 
           ((focusedField !== field && !!errors[field]) || 
            (formSubmitted && !!errors[field]));
  };

  // Debug function to check state of children field
  useEffect(() => {
    if (id) {
      console.log('Current children value:', state.children);
    }
  }, [state.children, id]);

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          {/* Back Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="compact-back-btn mb-3"
          >
            <FiArrowLeft size={16} />
            <span className="ms-1">Back</span>
          </Button>

          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{id ? 'Edit Patient Information' : 'Create New Patient'}</h4>
              
              {/* Development Tools */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={generatePatient}
                  className="d-flex align-items-center gap-2"
                >
                  Generate Test Data
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate className="patient-form">
                {/* Name Fields - 3 columns */}
                <Row className="three-column-row">
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstname"
                        placeholder="Enter your Legal First Name"
                        value={state.firstname || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstname')}
                        onFocus={() => handleFieldFocus('firstname')}
                        required
                        isInvalid={shouldShowError('firstname')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstname}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Middle Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="middlename"
                        placeholder="Enter your Legal Middle Name"
                        value={state.middlename || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('middlename')}
                        onFocus={() => handleFieldFocus('middlename')}
                        required
                        isInvalid={shouldShowError('middlename')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.middlename}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastname"
                        placeholder="Enter your Legal Last Name"
                        value={state.lastname || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('lastname')}
                        onFocus={() => handleFieldFocus('lastname')}
                        required
                        isInvalid={shouldShowError('lastname')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastname}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Date of Birth and Age - 2 columns */}
                <Row className="three-column-row">
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={state.dob || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('dob')}
                        onFocus={() => handleFieldFocus('dob')}
                        required
                        isInvalid={shouldShowError('dob')}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dob}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter date to automatically calculate age
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        value={state.age || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('age')}
                        onFocus={() => handleFieldFocus('age')}
                        required
                        isInvalid={shouldShowError('age')}
                        readOnly
                        disabled={isValidDateFormat(state.dob || '')}
                        className={isValidDateFormat(state.dob || '') ? "bg-light" : ""}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.age}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {isValidDateFormat(state.dob || '') ?
                          "Automatically calculated from date of birth" :
                          "Will be calculated from date of birth"}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    {/* Empty column to maintain the 3-column grid */}
                  </Col>
                </Row>

                {/* Gender, Marital Status, Prefix - 3 columns */}
                <Row className="three-column-row">
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={state.gender || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('gender')}
                        onFocus={() => handleFieldFocus('gender')}
                        required
                        isInvalid={shouldShowError('gender')}
                        style={{ height: '45px', fontSize: '1rem' }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Marital Status</Form.Label>
                      <Form.Select
                        name="marital_status"
                        value={state.marital_status || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('marital_status')}
                        onFocus={() => handleFieldFocus('marital_status')}
                        required
                        isInvalid={shouldShowError('marital_status')}
                        style={{ height: '45px', fontSize: '1rem' }}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Separated">Separated</option>
                        <option value="Annulled">Annulled</option>
                        <option value="Domestic Partnership">Domestic Partnership</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.marital_status}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Prefix</Form.Label>
                      <Form.Control
                        type="text"
                        name="prefix"
                        placeholder="Ex: Mr, Mrs, Dr"
                        value={state.prefix || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('prefix')}
                        onFocus={() => handleFieldFocus('prefix')}
                        required
                        isInvalid={shouldShowError('prefix')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.prefix}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Religion - Single field spanning full width */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Religion</Form.Label>
                      <Form.Control
                        type="text"
                        name="religion"
                        value={state.religion || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('religion')}
                        onFocus={() => handleFieldFocus('religion')}
                        required
                        isInvalid={shouldShowError('religion')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.religion}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Height, Weight, Children - 3 columns */}
                <Row className="three-column-row">
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Height (Cm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="height"
                        placeholder="Enter height in cm"
                        value={state.height || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('height')}
                        onFocus={() => handleFieldFocus('height')}
                        required
                        isInvalid={shouldShowError('height')}
                        min="50"
                        max="250"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.height}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Weight (Kg)</Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        placeholder="Enter weight in kg"
                        value={state.weight || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('weight')}
                        onFocus={() => handleFieldFocus('weight')}
                        required
                        isInvalid={shouldShowError('weight')}
                        min="1"
                        max="300"
                        step="0.1"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.weight}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>No. of Children</Form.Label>
                      <Form.Control
                        type="number"
                        name="children"
                        placeholder="Enter number of children"
                        value={state.children !== undefined ? state.children : ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('children')}
                        onFocus={() => handleFieldFocus('children')}
                        required
                        isInvalid={shouldShowError('children')}
                        min="0"
                        max="100"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.children}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Occupation - Single field spanning full width */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Occupation</Form.Label>
                      <Form.Control
                        type="text"
                        name="occupation"
                        value={state.occupation || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('occupation')}
                        onFocus={() => handleFieldFocus('occupation')}
                        required
                        isInvalid={shouldShowError('occupation')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.occupation}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Address - Single field spanning full width */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="permanent_address"
                        placeholder="Street name, Barangay, City, State"
                        value={state.permanent_address || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('permanent_address')}
                        onFocus={() => handleFieldFocus('permanent_address')}
                        required
                        isInvalid={shouldShowError('permanent_address')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.permanent_address}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contact and Email - 2 columns with 1 empty */}
                <Row className="three-column-row">
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Contact No</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_no"
                        placeholder="09XXXXXXXXX"
                        value={state.contact_no || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('contact_no')}
                        onFocus={() => handleFieldFocus('contact_no')}
                        required
                        isInvalid={shouldShowError('contact_no')}
                        maxLength="11"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_no}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email_address"
                        placeholder="Enter your email address"
                        value={state.email_address || ''}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email_address')}
                        onFocus={() => handleFieldFocus('email_address')}
                        required
                        isInvalid={shouldShowError('email_address')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email_address}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col className="form-field-col">
                    {/* Empty column to maintain the 3-column grid */}
                  </Col>
                </Row>

                <Card className="mb-4 shadow-sm">
                  <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0">Emergency Contact Person</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="three-column-row">
                      <Col className="form-field-col">
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency_person"
                            placeholder="Last/First/Middle"
                            value={state.emergency_person || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('emergency_person')}
                            onFocus={() => handleFieldFocus('emergency_person')}
                            required
                            isInvalid={shouldShowError('emergency_person')}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.emergency_person}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col className="form-field-col">
                        <Form.Group className="mb-3">
                          <Form.Label>Relationship to Patient</Form.Label>
                          <Form.Select
                            name="relationship_to_patient"
                            value={state.relationship_to_patient || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('relationship_to_patient')}
                            onFocus={() => handleFieldFocus('relationship_to_patient')}
                            required
                            isInvalid={shouldShowError('relationship_to_patient')}
                            style={{ height: '45px', fontSize: '1rem' }}
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Relative">Relative</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.relationship_to_patient}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col className="form-field-col">
                        <Form.Group className="mb-3">
                          <Form.Label>Contact No</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency_contact_no"
                            placeholder="09XXXXXXXXX"
                            value={state.emergency_contact_no || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('emergency_contact_no')}
                            onFocus={() => handleFieldFocus('emergency_contact_no')}
                            required
                            isInvalid={shouldShowError('emergency_contact_no')}
                            maxLength="11"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.emergency_contact_no}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Format: 09XXXXXXXXX (11 digits)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Emergency Contact Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergency_address"
                            placeholder="Street name, Barangay, City, State"
                            value={state.emergency_address || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('emergency_address')}
                            onFocus={() => handleFieldFocus('emergency_address')}
                            required
                            isInvalid={shouldShowError('emergency_address')}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.emergency_address}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Reason for Visit Section */}
                <Card className="mb-4 shadow-sm">
                  <Card.Header className="bg-info text-dark">
                    <h5 className="mb-0">Reason for Visit</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Chief Complaint</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="chiefComplaint"
                            placeholder="Describe your chief complaint"
                            value={state.chiefComplaint || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('chiefComplaint')}
                            onFocus={() => handleFieldFocus('chiefComplaint')}
                            required
                            isInvalid={shouldShowError('chiefComplaint')}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.chiefComplaint}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Maximum 1000 characters
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>History of Present Illness</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="illnessHistory"
                            placeholder="Describe the history of the present illness"
                            value={state.illnessHistory || ''}
                            onChange={handleChange}
                            onBlur={() => handleBlur('illnessHistory')}
                            onFocus={() => handleFieldFocus('illnessHistory')}
                            required
                            isInvalid={shouldShowError('illnessHistory')}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.illnessHistory}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Maximum 1000 characters
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <div className="button-container-responsive">
                  <Button
                    type="submit"
                    variant="primary"
                    className="action-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (id ? 'Update' : 'Save')}
                  </Button>
                  <Button 
                    type="reset" 
                    variant="outline-danger" 
                    className="action-button" 
                    onClick={resetData}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientData;