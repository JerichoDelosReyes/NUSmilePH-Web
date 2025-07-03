import React, { useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { UserContext } from '../Context/UserContext';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import TitleHead from '../Custom Hooks/TitleHead';
import '../Views/Styles/AppointmentForm.css';
import '../Views/Styles/AllPatientDashboard.css';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { API_URL } from '../../config/api';
import {App} from 'antd';

// Create a wrapper component to use navigation context
const AppointmentForm = () => {
  TitleHead('Set Appointment');
  const { user, loading } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const {message} = App.useApp();
  const [searchParams] = useSearchParams();

  // Add loading state for form submission
  const [submitting, setSubmitting] = useState(false);

  // Add validation states
  const [errors, setErrors] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    phone_no: '',
    clinical_room: '',
    date: '',
    time: '',
    notes: '',
    treatment_type: ''
  });

  // Add touched state to track which fields the user has interacted with
  const [touched, setTouched] = useState({
    firstname: false,
    middlename: false,
    lastname: false,
    email: false,
    phone_no: false,
    clinical_room: false,
    date: false,
    time: false,
    notes: false,
    treatment_type: false
  });

  const [formValid, setFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(id !== '');

  const getAppointmentPatient = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clinician/patient/appointment/${id}`);
      console.log(res.data);
      setPatientData({
        firstname: res.data.appointment.firstname || '',
        middlename: res.data.appointment.middlename || '',
        lastname: res.data.appointment.lastname || '',
        email: res.data.appointment.email || '',
        phone_no: res.data.appointment.phone_no || '',
        clinical_room: res.data.appointment.clinical_room || '',
        date: res.data.appointment.date.split('T')[0] || '',
        time: res.data.appointment.time.split('T')[1] || '',
        notes: res.data.appointment.notes || '',
        treatment_type: res.data.appointment.treatment_type || '',
        clinicalID: user.id || ''
      });
    } catch (err) {
      console.log(err);
      message.error('Failed to load appointment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      // Get date from URL parameters
      const dateFromUrl = searchParams.get('date');
      
      setPatientData({
        ...patientData,
        clinicalID: user.id,
        date: dateFromUrl || patientData.date // Use URL date if available
      });
      
      if (id !== '') {
        getAppointmentPatient();
      }
    }
  }, [user, loading]);

  const [patientData, setPatientData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    phone_no: '',
    clinical_room: '',
    date: '',
    time: '',
    notes: '',
    treatment_type: '',
    clinicalID: ''
  });

  const isTimeWithinAllowedHours = (timeString) => {
    const [hours] = timeString.split(':').map(Number);
    return hours >= 6 && hours < 21; // 6 AM to 9 PM
  };

  const checkTimeConflict = async (date, time) => {
    try {
      const response = await axios.get(`${API_URL}/clinician/${user.id}/patient/get/appointments`);
      const appointments = response.data.appointments || [];
      
      // Convert new appointment time to Date object for comparison
      const newAppointmentTime = new Date(`${date}T${time}`);
      const newAppointmentEnd = new Date(newAppointmentTime.getTime() + 60 * 60000); // Add 1 hour
      
      return appointments.some(appointment => {
        // Skip checking against the current appointment being edited
        if (id && appointment._id === id) return false;

        // Convert existing appointment time to Date object
        const existingTime = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
        const existingEnd = new Date(existingTime.getTime() + 60 * 60000); // Add 1 hour

        // Check for overlap conditions:
        // 1. New appointment starts during existing appointment
        // 2. New appointment ends during existing appointment
        // 3. New appointment completely encompasses existing appointment
        return (
          (newAppointmentTime >= existingTime && newAppointmentTime < existingEnd) ||
          (newAppointmentEnd > existingTime && newAppointmentEnd <= existingEnd) ||
          (newAppointmentTime <= existingTime && newAppointmentEnd >= existingEnd)
        );
      });
    } catch (error) {
      console.error('Error checking time conflicts:', error);
      return false;
    }
  };

  const checkDailyAppointmentLimit = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/clinician/${user.id}/patient/get/appointments`);
      const appointments = response.data.appointments || [];
      
      // Count appointments for the given date, excluding the current appointment being edited
      const appointmentsForDay = appointments.filter(appointment => {
        // Skip counting the current appointment being edited
        if (id && appointment._id === id) return false;
        
        // Compare dates without time
        const appointmentDate = appointment.date.split('T')[0];
        return appointmentDate === date;
      });

      return appointmentsForDay.length >= 6;
    } catch (error) {
      console.error('Error checking daily appointment limit:', error);
      return false;
    }
  };

  // Validation function - validate form fields but only display errors for touched fields
  const validateForm = async () => {
    let valid = true;
    const newErrors = { ...errors };

    // Name validations
    if (!patientData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(patientData.firstname)) {
      newErrors.firstname = 'First name should only contain letters';
      valid = false;
    } else {
      newErrors.firstname = '';
    }

    if (!patientData.middlename.trim()) {
      newErrors.middlename = 'Middle name is required';
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(patientData.middlename)) {
      newErrors.middlename = 'Middle name should only contain letters';
      valid = false;
    } else {
      newErrors.middlename = '';
    }

    if (!patientData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(patientData.lastname)) {
      newErrors.lastname = 'Last name should only contain letters';
      valid = false;
    } else {
      newErrors.lastname = '';
    }

    // Email validation
    if (!patientData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(patientData.email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    } else {
      newErrors.email = '';
    }

    // Phone validation - Updated for Philippine format (11 digits starting with 09)
    if (!patientData.phone_no.trim()) {
      newErrors.phone_no = 'Phone number is required';
      valid = false;
    } else if (!/^09\d{9}$/.test(patientData.phone_no.replace(/\s+/g, ''))) {
      newErrors.phone_no = 'Must be a valid Philippine mobile number (09XXXXXXXXX)';
      valid = false;
    } else {
      newErrors.phone_no = '';
    }

    // Clinical room validation - only check if it's empty
    if (!patientData.clinical_room.trim()) {
      newErrors.clinical_room = 'Clinical room is required';
      valid = false;
    } else {
      newErrors.clinical_room = '';
    }

    // Date validation
    if (!patientData.date) {
      newErrors.date = 'Date is required';
      valid = false;
    } else {
      const selectedDate = new Date(patientData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
        valid = false;
      } else {
        // Check daily appointment limit
        const reachedDailyLimit = await checkDailyAppointmentLimit(patientData.date);
        if (reachedDailyLimit) {
          newErrors.date = 'Maximum appointments reached for this date (limit: 6)';
          valid = false;
        } else {
          newErrors.date = '';
        }
      }
    }

    // Time validation
    if (!patientData.time) {
      newErrors.time = 'Time is required';
      valid = false;
    } else if (!isTimeWithinAllowedHours(patientData.time)) {
      newErrors.time = 'Appointments can only be scheduled between 6 AM and 9 PM';
      valid = false;
    } else {
      // Check for time conflicts only if we have both date and time
      if (patientData.date && patientData.time) {
        const hasConflict = await checkTimeConflict(patientData.date, patientData.time);
        if (hasConflict) {
          newErrors.time = 'This time slot conflicts with another appointment';
          valid = false;
        } else {
          newErrors.time = '';
        }
      }
    }

    // Notes validation
    if (!patientData.notes.trim()) {
      newErrors.notes = 'Notes are required';
      valid = false;
    } else if (patientData.notes.length < 10) {
      newErrors.notes = 'Notes should be at least 10 characters';
      valid = false;
    } else {
      newErrors.notes = '';
    }

    // Treatment type validation
    if (!patientData.treatment_type.trim()) {
      newErrors.treatment_type = 'Treatment type is required';
      valid = false;
    } else if (patientData.treatment_type.length < 5) {
      newErrors.treatment_type = 'Treatment type should be at least 5 characters';
      valid = false;
    } else {
      newErrors.treatment_type = '';
    }

    setErrors(newErrors);
    setFormValid(valid);
    return valid;
  };

  // Effect to validate form whenever patientData changes
  useEffect(() => {
    validateForm();
  }, [patientData]);

  // Handle field blur - mark field as touched when user leaves it
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(touched).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate before submission
    const isValid = await validateForm();
    if (!isValid) {
      message.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true); // Start loading state

    try {
      if (id !== '') {
        const res = await axios.put(`${API_URL}/clinician/patient/update/appointment/${id}`, patientData);
        console.log(res.data);
        message.success('Updated Successfully!');
        navigate('/appointments');
      } else {
        const res = await axios.post(`${API_URL}/clinician/${user.id}/patient/appointment`, patientData);
        console.log(res.data);
        message.success(res.data.message);
        setPatientData({
          firstname: '',
          middlename: '',
          lastname: '',
          email: '',
          phone_no: '',
          clinical_room: '',
          date: '',
          time: '',
          notes: '',
          treatment_type: ''
        });
        navigate('/appointments');
      }
    } catch (err) {
      console.log(err);
      message.error('Something went wrong! Please try again later.');
    } finally {
      setSubmitting(false); // End loading state
    }
  };

  // Handle phone number input with formatting and validation
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    
    // Allow only digits and limit to 11 characters
    const numbersOnly = input.replace(/\D/g, '').slice(0, 11);
    
    setPatientData({ ...patientData, phone_no: numbersOnly });
  };

  const handleChange = async ({ target: input }) => {
    if (input.name === 'phone_no') {
      handlePhoneChange({ target: input });
      return;
    }
    
    const newPatientData = { ...patientData, [input.name]: input.value };
    setPatientData(newPatientData);

    // Trigger validation immediately for date and time changes
    if (input.name === 'date' || input.name === 'time') {
      if (newPatientData.date && newPatientData.time) {
        await validateForm();
      }
    }
  };

  const generatePatient = () => {
    // Mark all fields as touched when generating data
    const allTouched = Object.keys(touched).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Generate a Philippine format phone number
    const generatePhilippineNumber = () => {
      return '09' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    };

    setPatientData({
      ...patientData,
      firstname: faker.person.firstName(),
      middlename: faker.person.middleName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      phone_no: generatePhilippineNumber(),
      clinical_room: faker.number.int({ min: 1, max: 10 }).toString(),
      date: faker.date.soon({ days: 5 }).toISOString().split('T')[0],
      time: faker.date.soon({ days: 5 }).toISOString().slice(0, 16).split('T')[1],
      notes: faker.lorem.sentences(),
      treatment_type: faker.lorem.sentences()
    });
  };

  // If we're loading initial data for editing
  if (isLoading) {
    return (
      <div className="appointment-form-wrapper d-flex justify-content-center align-items-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-form-wrapper">
      <div className="appointment-form-side">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="compact-back-btn"
          disabled={submitting}
        >
          <FiArrowLeft size={16} />
          <span className="ms-1">Back</span>
        </Button>

        <form onSubmit={handleSubmit}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">{id ? 'Edit Appointment' : 'New Appointment'}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstname"
                      value={patientData.firstname}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstname')}
                      required
                      isInvalid={touched.firstname && !!errors.firstname}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstname}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="middlename"
                      value={patientData.middlename}
                      onChange={handleChange}
                      onBlur={() => handleBlur('middlename')}
                      required
                      isInvalid={touched.middlename && !!errors.middlename}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.middlename}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastname"
                      value={patientData.lastname}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastname')}
                      required
                      isInvalid={touched.lastname && !!errors.lastname}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastname}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={patientData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      required
                      isInvalid={touched.email && !!errors.email}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone_no"
                      value={patientData.phone_no}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone_no')}
                      required
                      isInvalid={touched.phone_no && !!errors.phone_no}
                      placeholder="09XXXXXXXXX"
                      maxLength={11}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone_no}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Philippine format (09XXXXXXXXX)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Clinical Room</Form.Label>
                    <Form.Control
                      type="text"
                      name="clinical_room"
                      value={patientData.clinical_room}
                      onChange={handleChange}
                      onBlur={() => handleBlur('clinical_room')}
                      required
                      isInvalid={touched.clinical_room && !!errors.clinical_room}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.clinical_room}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={patientData.date}
                      onChange={handleChange}
                      onBlur={() => handleBlur('date')}
                      required
                      isInvalid={touched.date && !!errors.date}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={patientData.time}
                      onChange={handleChange}
                      onBlur={() => handleBlur('time')}
                      required
                      isInvalid={touched.time && !!errors.time}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.time}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={patientData.notes}
                      onChange={handleChange}
                      onBlur={() => handleBlur('notes')}
                      required
                      isInvalid={touched.notes && !!errors.notes}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.notes}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Treatment Type</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="treatment_type"
                      value={patientData.treatment_type}
                      onChange={handleChange}
                      onBlur={() => handleBlur('treatment_type')}
                      required
                      isInvalid={touched.treatment_type && !!errors.treatment_type}
                      disabled={submitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.treatment_type}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="text-center mb-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!formValid || submitting}
              className="px-4 py-2"
            >
              {submitting ? (
                <>
                  <Spinner 
                    as="span" 
                    animation="border" 
                    size="sm" 
                    role="status" 
                    aria-hidden="true" 
                    className="me-2"
                  />
                  {id !== '' ? 'Updating...' : 'Scheduling...'}
                </>
              ) : (
                <>
                  <FiCalendar className="me-2" />
                  {id !== '' ? 'Update Appointment' : 'Schedule Appointment'}
                </>
              )}
            </Button>
          </div>
        </form>
        <div className="text-center mb-5">
          <Button 
            variant="secondary" 
            onClick={generatePatient}
            disabled={submitting}
          >
            Generate Patient
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;