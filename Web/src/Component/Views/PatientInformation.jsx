import React, { useContext, useEffect, useState } from 'react'
import '../Views/Styles/AllPatientDashboard.css'
import {
  Box, Button, Checkbox, Link,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Paper, Tabs,
  Tab, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TableRow, Typography, Card, Chip, Grid, Divider, Skeleton, CircularProgress
} from '@mui/material'
import {
  Person, MedicalInformation,
  Healing, Check, Group, Female, Emergency,
  EmergencyRecording, ArrowBack, CalendarToday, Edit
} from '@mui/icons-material'
import { TbDental } from 'react-icons/tb'
import { LiaTeethSolid } from 'react-icons/lia'
import { GiSaberTooth, GiHealthCapsule } from 'react-icons/gi'
import { Descriptions } from 'antd'
import { UserContext } from '../Context/UserContext'
import TitleHead from '../Custom Hooks/TitleHead'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router'
import { format, parse, set } from 'date-fns'
import '../Views/Styles/PatientInformation.css'
import FinalDentalChartViewer from '../Custom Hooks/FinalDentalChartViewer'
import { API_URL } from "../../config/api"

const PatientInformation = () => {
  TitleHead("Patient Profile")
  const { id = "" } = useParams()
  const { user, loading: userLoading } = useContext(UserContext)
  const navigate = useNavigate()

  // State variables
  const [tabValue, setTabValue] = useState(0)
  const [patientData, setPatientData] = useState({})
  const [socialHistory, setSocialHistory] = useState({})
  const [femaleData, setFemaleData] = useState({})
  const [physicalAssessment, setPhysicalAssessment] = useState({})
  const [medicalHealth, setMedicalHealth] = useState({})
  const [treatmentHistory, setTreatmentHistory] = useState([])
  const [dentalHistory, setDentalHistory] = useState({})
  const [dentalQuestion, setDentalQuestion] = useState({})
  const [extraoralIntraoral, setExtraoralIntraoral] = useState({})
  const [occlusion, setOcclusion] = useState({})
  const [gingivalDescription, setGingivalDescription] = useState({})
  const [plaqueEnamel, setPlaqueEnamel] = useState({})
  const [periodontalDiagnosis, setPeriodontalDiagnosis] = useState({})
  const [diagnosisAndTreatment, setDiagnosisAndTreatment] = useState({})
  const [dentalChartData, setDentalChartData] = useState(null)
  const [finalChartData, setFinalChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataFetchComplete, setDataFetchComplete] = useState(false)

  useEffect(() => {
    if (!userLoading) {
      if (id) {
        setLoading(true)
        getPatientData()
      } else {
        console.log("No ID provided")
        setLoading(false)
      }
    }
  }, [userLoading, id])

  const getPatientData = async () => {
    try {
      // Add error checking for id
      if (!id || typeof id !== "string") {
        console.error("Invalid patient ID:", id)
        setLoading(false)
        return
      }

      // Clean the ID to remove any whitespace or special characters
      const cleanId = id.trim()

      // Initialize all state with empty data to prevent UI jumps
      setPatientData({})
      setSocialHistory({})
      setFemaleData({})
      setPhysicalAssessment({})
      setMedicalHealth({})
      setTreatmentHistory([])
      setDentalHistory({})
      setDentalQuestion({})
      setExtraoralIntraoral({})
      setOcclusion({})
      setGingivalDescription({})
      setPlaqueEnamel({})
      setPeriodontalDiagnosis({})
      setDiagnosisAndTreatment({})
      setDentalChartData(null)
      setFinalChartData(null)

      // Create all promises
      const fetchPromises = []

      // Add primary patient data promise
      const patientPromise = axios.get(
        `${API_URL}/patient/get/${cleanId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(response => {
        if (response.data) {
          setPatientData(response.data)
        }
      }).catch(err => {
        console.error("Error fetching patient data:", err)
      })

      fetchPromises.push(patientPromise)

      // Add other data promises
      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/socialHistory`)
          .then(response => setSocialHistory(response.data))
          .catch(err => console.log("Social history fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/female`)
          .then(response => setFemaleData(response.data))
          .catch(err => console.log("Female data fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/physicalAssesment`)
          .then(response => setPhysicalAssessment(response.data))
          .catch(err => console.log("Physical assessment fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/medicalHealth`)
          .then(response => setMedicalHealth(response.data))
          .catch(err => console.log("Medical health fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/treatmentRecord`)
          .then(response => setTreatmentHistory(response.data))
          .catch(err => console.log("Treatment record fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/dentalHistory`)
          .then(response => setDentalHistory(response.data))
          .catch(err => console.log("Dental history fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/dentalQuestion`)
          .then(response => setDentalQuestion(response.data))
          .catch(err => console.log("Dental question fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/extraoral/intraoral`)
          .then(response => setExtraoralIntraoral(response.data))
          .catch(err => console.log("Extraoral/intraoral fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/occlusion`)
          .then(response => setOcclusion(response.data))
          .catch(err => console.log("Occlusion fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/gingivalDescription`)
          .then(response => setGingivalDescription(response.data))
          .catch(err => console.log("Gingival description fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/plaque/enamel`)
          .then(response => setPlaqueEnamel(response.data))
          .catch(err => console.log("Plaque enamel fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/periodontalDiagnosis`)
          .then(response => setPeriodontalDiagnosis(response.data))
          .catch(err => console.log("Periodontal diagnosis fetch error:", err))
      )

      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/diagnosisAndTreatment`)
          .then(response => setDiagnosisAndTreatment(response.data))
          .catch(err => console.log("Diagnosis and treatment fetch error:", err))
      )

      // Dental chart fetching
      fetchPromises.push(
        axios.get(`${API_URL}/patient/${id}/get/dentalChart`)
          .then(response => {
            const initialPatientID = response.data?.patientID || id
            const structuredDentalData = {
              teeth: response.data?.teeth || {},
              diagnosis: response.data?.diagnosis || [],
              patientID: initialPatientID,
            }
            setDentalChartData(structuredDentalData)

            // Now get final dental chart
            return axios.get(`${API_URL}/patient/${initialPatientID}/get/finalDentalChart`)
              .then(finalResponse => {
                const structuredFinalData = {
                  teeth: finalResponse.data?.teeth || {},
                  diagnosis: finalResponse.data?.diagnosis || [],
                  chartStage: finalResponse.data?.chartStage,
                  progressStatus: finalResponse.data?.progressStatus,
                  procedureSummary: finalResponse.data?.procedureSummary,
                  generalRemarks: finalResponse.data?.generalRemarks,
                  patientID: initialPatientID,
                }
                setFinalChartData(structuredFinalData)
              })
          })
          .catch(err => {
            console.error("Dental chart fetch error:", err)
            setDentalChartData(null)
            setFinalChartData(null)
          })
      )

      // Wait for all promises to resolve
      await Promise.allSettled(fetchPromises)
      setDataFetchComplete(true)
      setLoading(false)

    } catch (err) {
      console.error("Error in data fetching process:", err)
      setLoading(false)
    }
  }

  const handleEditClick = (e, route) => {
    e.preventDefault()
    navigate(`/${route}/${id}/?action=edit`)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const allyProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      "aria-controls": `full-width-tabpanel-${index}`,
    }
  }

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props
    return (
      <div
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        {...other}
        className="tab-panel"
      >
        {value === index && <div>{children}</div>}
      </div>
    )
  }

  const handleFormsClick = (e, link) => {
    e.preventDefault()
    navigate(link)
  }

  // Handler for the back button
  const handleBack = () => {
    navigate(-1) // Navigate back to previous page
  }

  // Skeleton loader for tables
  const SkeletonTable = ({ rows = 3, columns = 5 }) => (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[...Array(columns)].map((_, idx) => (
          <div key={`header-${idx}`} className="skeleton-table-cell">
            <Skeleton variant="rectangular" height={30} />
          </div>
        ))}
      </div>
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="skeleton-table-row">
          {[...Array(columns)].map((_, colIdx) => (
            <div key={`cell-${rowIdx}-${colIdx}`} className="skeleton-table-cell">
              <Skeleton variant="rectangular" height={24} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'MM-dd-yyyy');
    } catch (error) {
      return dateString;
    }
  }

  if (loading) {
    return (
      <div className="content-wrapper patient-information-container">
        <div className="loading-overlay">
          <div className="loading-content">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" className="loading-text">
              Loading Patient Information...
            </Typography>
          </div>
        </div>

        {/* Skeleton for header */}
        <div className="patient-header">
          <div className="header-actions">
            <Skeleton variant="rectangular" width={100} height={40} style={{ borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <Skeleton variant="rectangular" width={120} height={40} style={{ borderRadius: '8px' }} />
              <Skeleton variant="rectangular" width={120} height={40} style={{ borderRadius: '8px' }} />
            </div>
          </div>

          <div className="patient-identity">
            <div className="patient-name-status">
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="rectangular" width={80} height={30} style={{ borderRadius: '12px' }} />
            </div>
            <div className="patient-meta">
              <Skeleton variant="text" width="30%" height={20} />
            </div>
          </div>
        </div>

        {/* Skeleton for tabs */}
        <Paper className="tabs-container">
          <Skeleton variant="rectangular" height={64} />
        </Paper>

        {/* Skeleton for content */}
        <Card className="info-card">
          <div className="card-header">
            <Skeleton variant="text" width="30%" height={30} />
            <Skeleton variant="rectangular" width={80} height={36} style={{ borderRadius: '6px' }} />
          </div>
          <div className="card-content">
            <SkeletonTable rows={4} columns={3} />
          </div>
        </Card>

        <Card className="info-card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <Skeleton variant="text" width="40%" height={30} />
          </div>
          <div className="card-content">
            <SkeletonTable rows={3} columns={5} />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="content-wrapper patient-information-container">
      {/* Header Section with Back button and Patient Info */}
      <div className="patient-header">
        <div className="header-actions">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            className="back-button"
          >
            Back
          </Button>

          <div className="header-action-buttons">
            <Button
              variant="contained"
              onClick={() => navigate(`/patientdata/${id}`)}
              className="edit-profile-button"
              startIcon={<Edit />}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/submission/${id}`)}
              className="submit-button"
            >
              Submit Treatment
            </Button>
          </div>
        </div>

        <div className="patient-identity">
          <div className="patient-name-status">
            <Typography variant="h4" className="patient-name">
              {patientData.firstname && patientData.lastname ?
                `${patientData.firstname} ${patientData.middlename ? patientData.middlename + ' ' : ''}${patientData.lastname}` :
                'Patient Profile'}
            </Typography>
            <Chip label="Active" color="success" className="status-badge" />
          </div>
          <div className="patient-meta">
            <Typography variant="body2" className="patient-id">
              <CalendarToday fontSize="small" className="icon-small" />
              ID: {id}
            </Typography>
            {patientData.age && patientData.gender && (
              <Typography variant="body2" className="patient-brief">
                {patientData.age} years • {patientData.gender}
              </Typography>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Paper className="tabs-container">
        <Tabs
          variant="fullWidth"
          onChange={handleTabChange}
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          className="navigation-tabs"
        >
          <Tab label="Personal Details" icon={<Person />} className="tab-item" {...allyProps(0)} />
          <Tab label="Medical Health" icon={<MedicalInformation />} className="tab-item" {...allyProps(1)} />
          <Tab label="Dental Health" icon={<TbDental className="tab-icon" />} className="tab-item" {...allyProps(2)} />
          <Tab label="Treatment Plan" icon={<Healing />} className="tab-item" {...allyProps(3)} />
          <Tab label="Dental Chart" icon={<Check />} className="tab-item" {...allyProps(4)} />
        </Tabs>
      </Paper>

      {/* Personal Details Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <div className="tab-content">
          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Personal Details</Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/patientdata/${id}`)}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="personal details table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Full Name</TableCell>
                      <TableCell className="table-cell">
                        {patientData.firstname && patientData.lastname ?
                          `${patientData.firstname} ${patientData.middlename ? patientData.middlename + " " : ""}${patientData.lastname}` : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Age</TableCell>
                      <TableCell className="table-cell">{patientData.age || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Birthdate</TableCell>
                      <TableCell className="table-cell">{formatDate(patientData.dob)}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Gender</TableCell>
                      <TableCell className="table-cell">{patientData.gender || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Marital Status</TableCell>
                      <TableCell className="table-cell">{patientData.marital_status || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Religion</TableCell>
                      <TableCell className="table-cell">{patientData.religion || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Occupation</TableCell>
                      <TableCell className="table-cell">{patientData.occupation || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Height (cm)</TableCell>
                      <TableCell className="table-cell">{patientData.height || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Weight (kg)</TableCell>
                      <TableCell className="table-cell">{patientData.weight || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Contact Information</Typography>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="contact information table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Contact Number</TableCell>
                      <TableCell className="table-cell">{patientData.contact_no || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Email Address</TableCell>
                      <TableCell className="table-cell">{patientData.email_address || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Address</TableCell>
                      <TableCell className="table-cell">{patientData.permanent_address || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Patient Records & Forms</Typography>
            </div>
            <div className="card-content">
              <div className="form-buttons-wrapper">
                <div className="form-category">
                  <Typography variant="subtitle1" className="form-category-title">Medical & Health Records</Typography>
                  <div className="form-buttons-group">
                    <Button
                      variant="outlined"
                      startIcon={<MedicalInformation className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/physicalAssessment/${id}`)}
                    >
                      Physical Assessment
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Group className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/social/${id}`)}
                    >
                      Social History
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Female className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/female/${id}`)}
                    >
                      Reproductive Health
                    </Button>
                  </div>
                </div>

                <Divider className="form-divider" />

                <div className="form-category">
                  <Typography variant="subtitle1" className="form-category-title">Dental Records</Typography>
                  <div className="form-buttons-group">
                    <Button
                      variant="outlined"
                      startIcon={<TbDental className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/dentalHistory/${id}`)}
                    >
                      Dental History
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Check className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/dentalChart/${id}`)}
                    >
                      Dental Chart
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<GiSaberTooth className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/periodontalAssesment/${id}`)}
                    >
                      Periodontal Chart
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LiaTeethSolid className="button-icon" />}
                      className="action-button"
                      onClick={(e) => handleFormsClick(e, `/extra-intraOral/${id}`)}
                    >
                      Extra/Intra Oral
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Emergency className="button-icon" />}
                      className="action-button"
                      onClick={() => navigate(`/occlusion/${id}`)}
                    >
                      Occlusion
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<GiSaberTooth className="button-icon" />}
                      className="action-button"
                      onClick={() => navigate(`/periodontalDiagnosis/${id}`)}
                    >
                      Periodontal Diagnosis
                    </Button>
                  </div>
                </div>

                <Divider className="form-divider" />

                <div className="form-category">
                  <Typography variant="subtitle1" className="form-category-title">Treatment Records</Typography>
                  <div className="form-buttons-group">
                    <Button
                      variant="outlined"
                      startIcon={<GiHealthCapsule className="button-icon" />}
                      className="action-button"
                      onClick={() => navigate(`/diagnosis-treatment/${id}`)}
                    >
                      Diagnosis & Treatment
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EmergencyRecording className="button-icon" />}
                      className="action-button primary-action"
                      onClick={() => navigate(`/record-treatment/${id}`)}
                    >
                      Record Treatment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Social History</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, 'social')}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="social history table" className="data-table bordered-table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header-cell">Habit</TableCell>
                      <TableCell className="table-header-cell" align="center">Status</TableCell>
                      <TableCell className="table-header-cell">Type</TableCell>
                      <TableCell className="table-header-cell">Frequency</TableCell>
                      <TableCell className="table-header-cell">Duration (Years)</TableCell>
                      <TableCell className="table-header-cell" align="center">Stopped</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell">
                        <Typography variant="body2" className="habit-name">Tobacco/Cigarettes/E-Cigarettes</Typography>
                      </TableCell>
                      <TableCell className="table-cell" align="center">
                        <Chip
                          label={socialHistory?.smoking?.uses ? 'Yes' : 'No'}
                          size="small"
                          color={socialHistory?.smoking?.uses ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                      <TableCell className="table-cell">{socialHistory?.smoking?.kind || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.smoking?.frequency || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.smoking?.duration_years || '-'}</TableCell>
                      <TableCell className="table-cell" align="center">
                        {socialHistory?.smoking?.has_stopped ?
                          <Chip label="Yes" size="small" color="success" className="status-chip" /> :
                          <Chip label="No" size="small" color="default" className="status-chip" />
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell">
                        <Typography variant="body2" className="habit-name">Alcohol Beverages</Typography>
                      </TableCell>
                      <TableCell className="table-cell" align="center">
                        <Chip
                          label={socialHistory?.alcohol?.uses ? 'Yes' : 'No'}
                          size="small"
                          color={socialHistory?.alcohol?.uses ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                      <TableCell className="table-cell">{socialHistory?.alcohol?.kind || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.alcohol?.frequency || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.alcohol?.duration_years || '-'}</TableCell>
                      <TableCell className="table-cell" align="center">
                        {socialHistory?.alcohol?.has_stopped ?
                          <Chip label="Yes" size="small" color="success" className="status-chip" /> :
                          <Chip label="No" size="small" color="default" className="status-chip" />
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell">
                        <Typography variant="body2" className="habit-name">Recreational Drugs</Typography>
                      </TableCell>
                      <TableCell className="table-cell" align="center">
                        <Chip
                          label={socialHistory?.drug?.uses ? 'Yes' : 'No'}
                          size="small"
                          color={socialHistory?.drug?.uses ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                      <TableCell className="table-cell">{socialHistory?.drug?.kind || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.drug?.frequency || '-'}</TableCell>
                      <TableCell className="table-cell">{socialHistory?.drug?.duration_years || '-'}</TableCell>
                      <TableCell className="table-cell" align="center">
                        {socialHistory?.drug?.has_stopped ?
                          <Chip label="Yes" size="small" color="success" className="status-chip" /> :
                          <Chip label="No" size="small" color="default" className="status-chip" />
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Emergency Contact Details</Typography>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="emergency contact table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Name</TableCell>
                      <TableCell className="table-cell">{patientData.emergency_person || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Relationship</TableCell>
                      <TableCell className="table-cell">{patientData.relationship_to_patient || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Contact Number</TableCell>
                      <TableCell className="table-cell">{patientData.emergency_contact_no || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Email Address</TableCell>
                      <TableCell className="table-cell">{patientData.emergency_email || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Address</TableCell>
                      <TableCell className="table-cell">{patientData.emergency_address || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Medical Health Tab */}
      <TabPanel value={tabValue} index={1}>
        <div className="tab-content">
          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Medical Health Overview</Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/patientdata/${id}`)}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="medical overview table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Full Name</TableCell>
                      <TableCell className="table-cell">
                        {patientData.firstname && patientData.lastname ?
                          `${patientData.firstname} ${patientData.middlename ? patientData.middlename + " " : ""}${patientData.lastname}` :
                          '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Age</TableCell>
                      <TableCell className="table-cell">{patientData.age || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Gender</TableCell>
                      <TableCell className="table-cell">{patientData.gender || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Height (cm)</TableCell>
                      <TableCell className="table-cell">{patientData.height || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Weight (kg)</TableCell>
                      <TableCell className="table-cell">{patientData.weight || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Physical Assessment</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, 'physicalAssessment')}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="physical assessment table" className="data-table bordered-table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header-cell" colSpan={2}>Assessment Details</TableCell>
                      <TableCell className="table-header-cell" colSpan={2}>Vital Signs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="20%">Date</TableCell>
                      <TableCell className="table-cell" width="30%">{formatDate(physicalAssessment?.date)}</TableCell>
                      <TableCell className="table-cell table-header-cell" width="20%">Blood Pressure</TableCell>
                      <TableCell className="table-cell" width="30%">{physicalAssessment?.bp || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Time</TableCell>
                      <TableCell className="table-cell">{physicalAssessment?.time || '-'}</TableCell>
                      <TableCell className="table-cell table-header-cell">Pulse Rate</TableCell>
                      <TableCell className="table-cell">{physicalAssessment?.pr || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell" colSpan={2}></TableCell>
                      <TableCell className="table-cell table-header-cell">Respiratory Rate</TableCell>
                      <TableCell className="table-cell">{physicalAssessment?.rr || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell" colSpan={2}></TableCell>
                      <TableCell className="table-cell table-header-cell">Temperature</TableCell>
                      <TableCell className="table-cell">{physicalAssessment?.temp || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Medical History</Typography>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="medical history table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Physical Care</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.physical_care || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Hospitalization</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.hospitalization || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Illnesses</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.illness || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">INR or HbA1c Values</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.Inr_or_HbA1C || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Medications & Supplements</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.medications || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Childhood Disease History</TableCell>
                      <TableCell className="table-cell">{medicalHealth?.childhood_disease_history || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Allergies</TableCell>
                      <TableCell className="table-cell">
                        {medicalHealth?.allergy_information ? (
                          <div className="chip-list">
                            {medicalHealth.allergy_information.map((item, index) => (
                              <Chip
                                key={index}
                                label={item}
                                size="small"
                                color="primary"
                                variant="outlined"
                                className="info-chip"
                              />
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Diagnosed Conditions</TableCell>
                      <TableCell className="table-cell">
                        {medicalHealth?.diagnosed_conditions ? (
                          <div className="chip-list">
                            {medicalHealth.diagnosed_conditions.map((item, index) => (
                              <Chip
                                key={index}
                                label={item}
                                size="small"
                                color="primary"
                                variant="outlined" st
                                className="info-chip"
                              />
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Reproductive Health</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, 'female')}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="reproductive health table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Pregnant</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={femaleData?.pregnant ? 'Yes' : 'No'}
                          size="small"
                          color={femaleData?.pregnant ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                    </TableRow>
                    {femaleData?.pregnant && (
                      <TableRow className="table-row alt-row">
                        <TableCell className="table-cell table-header-cell">Months Pregnant</TableCell>
                        <TableCell className="table-cell">{femaleData?.pregnantMonths || '-'}</TableCell>
                      </TableRow>
                    )}
                    <TableRow className={femaleData?.pregnant ? "table-row" : "table-row alt-row"}>
                      <TableCell className="table-cell table-header-cell">Breastfeeding</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={femaleData?.breast_feeding ? 'Yes' : 'No'}
                          size="small"
                          color={femaleData?.breast_feeding ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Menopause</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={femaleData?.menopause ? 'Yes' : 'No'}
                          size="small"
                          color={femaleData?.menopause ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Hormone Replacement Therapy</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={femaleData?.hormone_replacement ? 'Yes' : 'No'}
                          size="small"
                          color={femaleData?.hormone_replacement ? 'primary' : 'default'}
                          className="status-chip"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Dental Health Tab */}
      <TabPanel value={tabValue} index={2}>
        <div className="tab-content">
          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Dental Health</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, 'dentalHistory')}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table aria-label="dental health table" className="data-table bordered-table">
                  <TableBody>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell" width="30%">Date of Last Visit</TableCell>
                      <TableCell className="table-cell">{formatDate(dentalHistory?.last_visit)}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Frequency of Visits</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.frequency_visit || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Last Procedure</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.last_procedure || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Response to Local Anesthesia</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.local_anesthesia || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Procedure Complications</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.complication || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Brushes Daily</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={`${dentalHistory?.no_brush || 0} time(s)`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          className="info-chip"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Flosses Daily</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={`${dentalHistory?.no_floss || 0} time(s)`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          className="info-chip"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Mouthwash Daily</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={`${dentalHistory?.no_mouthwash || 0} time(s)`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          className="info-chip"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Toothbrush Type</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.toothbrush || '-'}</TableCell>
                    </TableRow>
                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Toothpaste Type</TableCell>
                      <TableCell className="table-cell">{dentalHistory?.toothpaste || '-'}</TableCell>
                    </TableRow>

                    {/* Section divider for Dental Questionnaire */}
                    <TableRow>
                      <TableCell colSpan={2} className="table-section-divider">
                        <Typography variant="subtitle1" component="div" className="section-title">
                          Dental Health Questionnaire
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* Dental Questionnaire Rows */}
                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Like to Smile?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.likeSmile?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.likeSmile?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.likeSmile?.answer && dentalQuestion?.likeSmile?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.likeSmile.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Had Tooth Extraction?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.experiencedExtraction?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.experiencedExtraction?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.experiencedExtraction?.answer && dentalQuestion?.experiencedExtraction?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.experiencedExtraction.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Bled too much after Tooth Extraction?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.bleedingAfterExtraction?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.bleedingAfterExtraction?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.bleedingAfterExtraction?.answer && dentalQuestion?.bleedingAfterExtraction?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.bleedingAfterExtraction.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Had Orthodontic Treatment?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.orthodonticTreatment?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.orthodonticTreatment?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.orthodonticTreatment?.answer && dentalQuestion?.orthodonticTreatment?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.orthodonticTreatment.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Teeth Sensitive to hot, cold, sweets, and pressure?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.sensitiveTeeth?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.sensitiveTeeth?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.sensitiveTeeth?.answer && dentalQuestion?.sensitiveTeeth?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.sensitiveTeeth.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Had any periodontal (gum) problems?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.periodontalProblems?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.periodontalProblems?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.periodontalProblems?.answer && dentalQuestion?.periodontalProblems?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.periodontalProblems.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Gums bleed spontaneously?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.spontaneousBleeding?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.spontaneousBleeding?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.spontaneousBleeding?.answer && dentalQuestion?.spontaneousBleeding?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.spontaneousBleeding.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Uses Fluoridated toothpaste?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.fluoridatedToothpaste?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.fluoridatedToothpaste?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.fluoridatedToothpaste?.answer && dentalQuestion?.fluoridatedToothpaste?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.fluoridatedToothpaste.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Wear any dentures?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.wearsDenture?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.wearsDenture?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.wearsDenture?.answer && dentalQuestion?.wearsDenture?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.wearsDenture.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row alt-row">
                      <TableCell className="table-cell table-header-cell">Experience Jaw Pain?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.jawPain?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.jawPain?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.jawPain?.answer && dentalQuestion?.jawPain?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.jawPain.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow className="table-row">
                      <TableCell className="table-cell table-header-cell">Food catch between teeth?</TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={dentalQuestion?.foodCatching?.answer ? 'Yes' : 'No'}
                          size="small"
                          color={dentalQuestion?.foodCatching?.answer ? 'primary' : 'default'}
                          className="status-chip"
                        />
                        {dentalQuestion?.foodCatching?.answer && dentalQuestion?.foodCatching?.details && (
                          <Typography variant="body2" className="details-text">
                            Details: {dentalQuestion.foodCatching.details}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>

          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Extraoral/Intraoral Examination</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, 'extra-intraOral')}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </div>
            <div className="card-content">
              <Descriptions bordered>
                {/* Debug - Remove in production */}
                {/* <Descriptions.Item label="Debug">{JSON.stringify(extraoralIntraoral?.lymph_node)}</Descriptions.Item> */}

                <Descriptions.Item label="Skin">
                  {extraoralIntraoral?.skin?.normal === true || extraoralIntraoral?.skin?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.skin?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Eyes">
                  {extraoralIntraoral?.eyes?.normal === true || extraoralIntraoral?.eyes?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.eyes?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Neck">
                  {extraoralIntraoral?.neck?.normal === true || extraoralIntraoral?.neck?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.neck?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="TMJ">
                  {extraoralIntraoral?.tmj?.normal === true || extraoralIntraoral?.tmj?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      <div>
                        {extraoralIntraoral?.tmj?.abnormal_description || '-'}
                        {/* Only show the options that are true */}
                        {(extraoralIntraoral?.tmj?.crepitus_left === true ||
                          extraoralIntraoral?.tmj?.crepitus_right === true ||
                          extraoralIntraoral?.tmj?.deflection === true) && <br />}

                        {extraoralIntraoral?.tmj?.crepitus_left === true &&
                          <span style={{ marginRight: '15px' }}><strong>Crepitus Left:</strong> Yes</span>}

                        {extraoralIntraoral?.tmj?.crepitus_right === true &&
                          <span style={{ marginRight: '15px' }}><strong>Crepitus Right:</strong> Yes</span>}

                        {extraoralIntraoral?.tmj?.deflection === true &&
                          <span><strong>Deflection:</strong> Yes</span>}
                      </div>
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Lymph Node">
                  {(() => {
                    // Get the lymph node data
                    const lymphNode = extraoralIntraoral?.lymph_node;

                    // Explicitly check for abnormal conditions rather than normal
                    const isAbnormal =
                      lymphNode?.normal === false ||
                      lymphNode?.normal === "false" ||
                      lymphNode?.normal === 0 ||
                      lymphNode?.normal === "0" ||
                      lymphNode?.normal === undefined ||
                      lymphNode?.normal === "" ||
                      lymphNode?.normal === null;

                    // Treat as normal unless explicitly abnormal
                    if (!isAbnormal) {
                      return 'Normal';
                    } else {
                      return (
                        <>
                          <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                          {lymphNode?.abnormal_description || '-'}
                        </>
                      );
                    }
                  })()}
                </Descriptions.Item>

                <Descriptions.Item label="Lips">
                  {extraoralIntraoral?.lips?.normal === true || extraoralIntraoral?.lips?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.lips?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Buccal Mucosa">
                  {extraoralIntraoral?.buccal_mucosa?.normal === true || extraoralIntraoral?.buccal_mucosa?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.buccal_mucosa?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Vestibule">
                  {extraoralIntraoral?.vestibule?.normal === true || extraoralIntraoral?.vestibule?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.vestibule?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Alveolar Ridge">
                  {extraoralIntraoral?.alveolar_ridge?.normal === true || extraoralIntraoral?.alveolar_ridge?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.alveolar_ridge?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Hard/Soft Palate">
                  {extraoralIntraoral?.hard_soft_palate?.normal === true || extraoralIntraoral?.hard_soft_palate?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.hard_soft_palate?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Oro Pharynx">
                  {extraoralIntraoral?.oro_pharynx?.normal === true || extraoralIntraoral?.oro_pharynx?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.oro_pharynx?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Tongue">
                  {extraoralIntraoral?.tongue?.normal === true || extraoralIntraoral?.tongue?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.tongue?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Floor of Mouth">
                  {extraoralIntraoral?.floor_of_mouth?.normal === true || extraoralIntraoral?.floor_of_mouth?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.floor_of_mouth?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>

                <Descriptions.Item label="Salivary Glands">
                  {extraoralIntraoral?.salivary_glands?.normal === true || extraoralIntraoral?.salivary_glands?.normal === "true" ? 'Normal' :
                    <>
                      <Chip label="Abnormal" color="error" size="small" style={{ marginRight: '10px' }} />
                      {extraoralIntraoral?.salivary_glands?.abnormal_description || '-'}
                    </>
                  }
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
          {/* Occlusion Table */}
<Card className="info-card" style={{ marginBottom: '20px' }}>
  <div className="card-header">
    <Typography variant="h6">Occlusion</Typography>
    <Button 
      variant="contained" 
      onClick={(e) => handleEditClick(e, 'occlusion')}
      className="edit-button"
      startIcon={<Edit />}
    >
      Edit
    </Button>
  </div>
  <div className="card-content">
    <TableContainer className="table-container">
      <Table aria-label="occlusion table" className="data-table bordered-table">
        <TableBody>
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell" width="30%">Occlusion</TableCell>
            <TableCell className="table-cell">
              {occlusion ? (
                <>
                  Class I: {occlusion?.class_I ? 'Yes' : 'No'}
                  <br/>
                  Class II Div 1: {occlusion?.class_II_div_1 ? 'Yes' : 'No'}
                  <br/>
                  Class II Div 2: {occlusion?.class_II_div_2 ? 'Yes' : 'No'}
                  <br/>
                  Class III: {occlusion?.class_III ? 'Yes' : 'No'}
                </>
              ) : '-'}
            </TableCell>
          </TableRow>
          
          {occlusion?.other_occlussal_abno && (
            <TableRow className="table-row alt-row">
              <TableCell className="table-cell table-header-cell">Other Occlusal Abnormalities</TableCell>
              <TableCell className="table-cell">{occlusion.other_occlussal_abno}</TableCell>
            </TableRow>
          )}
          
          <TableRow className={occlusion?.other_occlussal_abno ? "table-row" : "table-row alt-row"}>
            <TableCell className="table-cell table-header-cell">Parafunctional Habits</TableCell>
            <TableCell className="table-cell">{occlusion?.parafunctional_oral_habits || '-'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </div>
</Card>

{/* Plaque & Enamel Table */}
<Card className="info-card" style={{ marginBottom: '20px' }}>
  <div className="card-header">
    <Typography variant="h6">Plaque & Enamel</Typography>
  </div>
  <div className="card-content">
    <TableContainer className="table-container">
      <Table aria-label="plaque-enamel table" className="data-table bordered-table">
        <TableHead>
          <TableRow>
            <TableCell className="table-header-cell" colSpan={2}>Enamel Conditions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plaqueEnamel?.enamel_conditions ? 
            Object.keys(plaqueEnamel.enamel_conditions).map((key, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "table-row" : "table-row alt-row"}>
                <TableCell className="table-cell table-header-cell" width="30%">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="table-cell">
                  {plaqueEnamel.enamel_conditions[key] ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow className="table-row">
                <TableCell className="table-cell" colSpan={2} align="center">No enamel conditions data</TableCell>
              </TableRow>
            )
          }
          
          <TableRow className="table-section-divider">
            <TableCell colSpan={2} className="table-cell">
              <Typography variant="subtitle1" component="div" className="section-title">
                Plaque Information
              </Typography>
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell" width="30%">Plaque</TableCell>
            <TableCell className="table-cell">
              {plaqueEnamel?.plaque && plaqueEnamel?.distribution ? (
                <>
                  Distribution: {plaqueEnamel.plaque.distribution}
                  <br/>
                  Plaque: {plaqueEnamel.plaque}
                </>
              ) : '-'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </div>
</Card>

{/* Gingival Description Table */}
<Card className="info-card" style={{ marginBottom: '20px' }}>
  <div className="card-header">
    <Typography variant="h6">Gingival Description</Typography>
  </div>
  <div className="card-content">
    <TableContainer className="table-container">
      <Table aria-label="gingival-description table" className="data-table bordered-table">
        <TableBody>
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell" width="30%">Color</TableCell>
            <TableCell className="table-cell">{gingivalDescription?.color || '-'}</TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Consistency</TableCell>
            <TableCell className="table-cell">{gingivalDescription?.consistency || '-'}</TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">Contour</TableCell>
            <TableCell className="table-cell">{gingivalDescription?.contour || '-'}</TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Texture</TableCell>
            <TableCell className="table-cell">{gingivalDescription?.texture || '-'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </div>
</Card>

{/* Periodontal Diagnosis Table */}
<Card className="info-card" style={{ marginBottom: '20px' }}>
  <div className="card-header">
    <Typography variant="h6">Periodontal Diagnosis</Typography>
    <Button 
      variant="contained" 
      onClick={(e) => handleEditClick(e, 'periodontalDiagnosis')}
      className="edit-button"
      startIcon={<Edit />}
    >
      Edit
    </Button>
  </div>
  <div className="card-content">
    <TableContainer className="table-container">
      <Table aria-label="periodontal-diagnosis table" className="data-table bordered-table">
        <TableBody>
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell" width="30%">Total Points</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.nucd_classification?.total_points || '-'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">NUCD Classification</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.nucd_classification?.classification || '-'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">ASA Classification</TableCell>
            <TableCell className="table-cell">{periodontalDiagnosis?.asa_type || '-'}</TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Instructor</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.nucd_classification?.instructor || '-'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">AAP Classification</TableCell>
            <TableCell className="table-cell">{periodontalDiagnosis?.aap_classification || '-'}</TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Bleeding on Probing</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.probing_exploring?.generalized ? 
                'Generalized' : 
                periodontalDiagnosis?.probing_exploring?.localized ? 
                'Localized' : 'None'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">Calculus Sub-Marginal</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.sub_marginal?.moderate ?
                'Moderate' :
                periodontalDiagnosis?.sub_marginal?.heavy ?
                'Heavy' : 
                periodontalDiagnosis?.sub_marginal?.mild ?
                'Mild' : 'None'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Calculus Supra-Marginal</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.supra_marginal_calculus?.moderate ?
                'Moderate' :
                periodontalDiagnosis?.supra_marginal_calculus?.heavy ?
                'Heavy' : 
                periodontalDiagnosis?.supra_marginal_calculus?.mild ?
                'Mild' : 'None'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">Periodontal Status</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.periodontal_tissues?.gingivitis ?
                'Gingivitis' : 
                periodontalDiagnosis?.periodontal_tissues?.perio_maintenance ?
                'Perio Maintenance' : 'None'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row alt-row">
            <TableCell className="table-cell table-header-cell">Periodontitis</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.periodontal_tissues?.periodontitis_stage_1 ?
                'Stage 1' : 
                periodontalDiagnosis?.periodontal_tissues?.periodontitis_stage_2 ?
                'Stage 2' :
                periodontalDiagnosis?.periodontal_tissues?.periodontitis_stage_3 ?
                'Stage 3' :
                periodontalDiagnosis?.periodontal_tissues?.periodontitis_stage_4 ?
                'Stage 4' : 'None'}
            </TableCell>
          </TableRow>
          
          <TableRow className="table-row">
            <TableCell className="table-cell table-header-cell">Extrinsic Stain</TableCell>
            <TableCell className="table-cell">
              {periodontalDiagnosis?.oral_hygiene?.light ?
                'Light' :
                periodontalDiagnosis?.oral_hygiene?.moderate ?
                'Moderate' :
                periodontalDiagnosis?.oral_hygiene?.heavy ?
                'Heavy' : 'None'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </div>
</Card>
        </div>
               

      </TabPanel>

      {/* Treatment Plan Tab */}
      <TabPanel value={tabValue} index={3}>
        <div className="tab-content">
          <Card className="info-card">
            <div className="card-header">
              <Typography variant="h6">Treatment History Record</Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/record-treatment/${id}`)}
                className="record-new-button"
                startIcon={<EmergencyRecording />}
              >
                Record New Treatment
              </Button>
            </div>
            <div className="card-content">
              <TableContainer className="table-container">
                <Table className="data-table treatment-table bordered-table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header-cell" width="15%">Date</TableCell>
                      <TableCell className="table-header-cell" width="40%">Procedures</TableCell>
                      <TableCell className="table-header-cell" width="15%">Patient's Signature</TableCell>
                      <TableCell className="table-header-cell" width="15%">Clinician</TableCell>
                      <TableCell className="table-header-cell" width="15%">Clinical Instructor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treatmentHistory.length !== 0 ? (
                      treatmentHistory.map((item, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "table-row" : "table-row alt-row"}>
                          <TableCell className="table-cell date-cell">
                            {format(new Date(item.date), "MM-dd-yyyy")}
                          </TableCell>
                          <TableCell className="table-cell procedure-cell">{item.procedures}</TableCell>
                          <TableCell className="table-cell signature-cell">
                            <div className="signature-container">
                              <img
                                src={`${API_URL}/getFile/patient_signature/${item.patientSignature}`}
                                alt="Patient Signature"
                                className="signature-image"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="table-cell signature-cell">
                            <div className="signature-container">
                              <img
                                src={`${API_URL}/getFile/clinician_signature/${item.clinicianSignature}`}
                                alt="Clinician Signature"
                                className="signature-image"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="table-cell signature-cell">
                            {item.clinicalInstructor ? (
                              <div className="signature-container">
                                <img
                                  src={`${API_URL}/getFile/clinician_signature/${item.clinicalInstructor}`}
                                  alt="Clinical Instructor Signature"
                                  className="signature-image"
                                />
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          className="no-data-cell"
                        >
                          <Typography className="no-data-message">No Treatment History Found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Dental Chart Tab */}
      <TabPanel value={tabValue} index={4}>
        <div className="tab-content dental-chart-container">
          <Card className="info-card chart-card">
            <div className="card-header">
              <Typography variant="h6">Dental Chart</Typography>
              <Button
                variant="contained"
                onClick={(e) => handleEditClick(e, "dentalChart")}
                className="edit-button"
                startIcon={<Edit />}
              >
                Edit Chart
              </Button>
            </div>
            <div className="card-content chart-content">
              {!dentalChartData ? (
                <div className="no-chart-message">
                  <Typography variant="body1">No dental chart data available</Typography>
                </div>
              ) : (
                <FinalDentalChartViewer
                  dentalChartData={dentalChartData}
                  finalChartData={finalChartData}
                />
              )}
            </div>
          </Card>
        </div>
      </TabPanel>
    </div>
  )
}

export default PatientInformation