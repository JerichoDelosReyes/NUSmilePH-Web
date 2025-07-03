import React, { useContext, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Table,
  Badge,
  Button,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { useNavigate, useParams } from "react-router";
import { App, Descriptions } from "antd";
import axios from "axios";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  Person,
  MedicalInformation,
  Healing,
  Group,
  Female,
  Emergency,
  EmergencyRecording,
  Check 
} from "@mui/icons-material";
import { TbDental } from "react-icons/tb";
import { GiSaberTooth, GiHealthCapsule } from "react-icons/gi";
import { LiaTeethSolid } from "react-icons/lia";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Checkbox,
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import FinalDentalChartViewer from '../Custom Hooks/FinalDentalChartViewer'
import { API_URL } from "../../config/api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function allyProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const SubmittedCaseInfoClinician = () => {
  TitleHead("Submitted Case Information");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id = "", caseId = "" } = useParams();
  const {message:messageApi} = App.useApp();
  const [tabValue, setTabValue] = useState(0);
  const [patientData, setPatientData] = useState({});
  const [socialHistory, setSocialHistory] = useState({});
  const [femaleData, setFemaleData] = useState({});
  const [physicalAssessment, setPhysicalAssessment] = useState({});
  const [medicalHealth, setMedicalHealth] = useState({});
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [dentalHistory, setDentalHistory] = useState({});
  const [dentalQuestion, setDentalQuestion] = useState({});
  const [extraoralIntraoral, setExtraoralIntraoral] = useState({});
  const [occlusion, setOcclusion] = useState({});
  const [gingivalDescription, setGingivalDescription] = useState({});
  const [plaqueEnamel, setPlaqueEnamel] = useState({});
  const [periodontalDiagnosis, setPeriodontalDiagnosis] = useState({});
  const [diagnosisAndTreatment, setDiagnosisAndTreatment] = useState({});
  const [dentalChart, setDentalChart] = useState({});
  const [periodontalChart, setPeriodontalChart] = useState({});
  const [caseHeader, setCaseHeader] = useState();
  const [loading, setLoading] = useState(true);
  const [dentalChartData, setDentalChartData] = useState(null);
  const [finalChartData, setFinalChartData] = useState(null);
  

  useEffect(() => {
    fetchCaseInfo();
  }, [caseId]);

  const fetchCaseInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/get/submission/${id}`
      );
      setCaseHeader(response.data.data);
      setPatientData(response.data.data.patient);
      setSocialHistory(response.data.data.patient.socialHistory);
      setFemaleData(response.data.data.patient.female);
      setPhysicalAssessment(response.data.data.patient.physicalAssesment);
      setMedicalHealth(response.data.data.patient.medicalHealth);
      setTreatmentHistory(response.data.data.patient.treatmentRecord);
      setDentalHistory(response.data.data.patient.dentalHistory);
      setDentalQuestion(response.data.data.patient.dentalQuestion);
      setExtraoralIntraoral(response.data.data.patient.extraoralIntraoral);
      setOcclusion(response.data.data.patient.occlusion);
      setGingivalDescription(response.data.data.patient.gingivalDescription);
      setPlaqueEnamel(response.data.data.patient.plaqueEnamel);
      setPeriodontalDiagnosis(response.data.data.patient.periodontalDiagnosis);
      setDiagnosisAndTreatment(
        response.data.data.patient.diagnosisAndTreatment
      );
      setDentalChart(response.data.data.patient.dentalChart);
      setPeriodontalChart(response.data.data.patient.periodontalChart);
      
      // Structure the dental chart data for the viewer
      const structuredDentalData = {
        teeth: response.data.data.patient.dentalChart?.teeth || {},
        diagnosis: response.data.data.patient.dentalChart?.diagnosis || [],
        patientID: id
      };
      
      // Structure the final chart data
      const structuredFinalData = {
        teeth: response.data.data.patient.dentalChart?.teeth || {},
        diagnosis: response.data.data.patient.dentalChart?.diagnosis || [],
        chartStage: response.data.data.patient.dentalChart?.chartStage,
        progressStatus: response.data.data.patient.dentalChart?.progressStatus,
        procedureSummary: response.data.data.patient.dentalChart?.procedureSummary,
        generalRemarks: response.data.data.patient.dentalChart?.generalRemarks,
        patientID: id
      };

      setDentalChartData(structuredDentalData);
      setFinalChartData(structuredFinalData);
      setLoading(false);
    } catch (err) {
      console.log(err);
      messageApi.error("Failed to load case information");
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFormsClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="content-wrapper patient-information-container">
      <Box sx={{ width: "100%" }}>
        <Tabs
          variant="fullWidth"
          onChange={handleTabChange}
          value={tabValue}
          indicatorColor="primary"
          textColor="inherit"
        >
          <Tab
            label="Personal Details"
            icon={<Person />}
            {...allyProps(0)}
          />
          <Tab
            label="Medical Health"
            icon={<MedicalInformation />}
            {...allyProps(1)}
          />
          <Tab
            label="Dental Health"
            icon={<TbDental />}
            {...allyProps(2)}
          />
          <Tab
            label="Treatment Plan"
            icon={<Healing />}
            {...allyProps(3)}
          />
          <Tab 
            label="Dental Chart"
            icon={<Check />}
            {...allyProps(4)}
          />
          
        </Tabs>
      </Box>

      {/* Personal Details Tab */}
      <TabPanel value={tabValue} index={0}>
        <Button variant="contained">Grade Case</Button>
        <Box className="patient-header">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tally Sheet">
              <span style={{ color: "green", fontWeight: "500" }}>
                {caseHeader?.tallySheet}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Section">
              <span style={{ color: "green", fontWeight: "500" }}>
                {caseHeader?.section}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Case Title">
              <span style={{ color: "green", fontWeight: "500" }}>
                {caseHeader?.caseTitle}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Procedure">
              <span style={{ color: "green", fontWeight: "500" }}>
                {caseHeader?.procedure}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Additional Description">
              <span style={{ color: "green", fontWeight: "500" }}>
                {caseHeader?.description}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Box>
        <Descriptions title="Personal Details" bordered>
          <Descriptions.Item label="Patient Status" span={3}>
            <span style={{ color: "green" }}>Active</span>
          </Descriptions.Item>
          <Descriptions.Item label="Name">
            {patientData.firstname +
              " " +
              (patientData.middlename
                ? patientData.middlename + " "
                : "") +
              patientData.lastname}
          </Descriptions.Item>
          <Descriptions.Item label="Age">
            {patientData.age}
          </Descriptions.Item>
          <Descriptions.Item label="Birthdate">
            {patientData.dob
              ? format(new Date(patientData.dob), "MM-dd-yyyy")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {patientData.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Marital Status">
            {patientData.marital_status}
          </Descriptions.Item>
          <Descriptions.Item label="Height (cm)">
            {patientData.height}
          </Descriptions.Item>
          <Descriptions.Item label="Weight (kg)">
            {patientData.weight}
          </Descriptions.Item>
          <Descriptions.Item label="Religion">
            {patientData.religion}
          </Descriptions.Item>
          <Descriptions.Item label="Occupation">
            {patientData.occupation}
          </Descriptions.Item>
        </Descriptions>
        <br />
        <Descriptions title="Contact Information" bordered>
          <Descriptions.Item label="Contact Number" span={2}>
            {patientData.contact_no}
          </Descriptions.Item>
          <Descriptions.Item label="Email Address" span={2}>
            {patientData.email_address}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={1}>
            {patientData.permanent_address}
          </Descriptions.Item>
        </Descriptions>
        <br />
        <Box>
          <Typography variant="h6" component="h6">
            Patient Charts
          </Typography>
          <Box>
            <Button
              type="button"
              variant="contained"
              sx={{ margin: "1em 0" }}
              onClick={(e) => handleFormsClick(e, `/dentalChart/${id}`)}
            >
              Dental Chart
            </Button>
            <Button
              type="button"
              variant="contained"
              sx={{ margin: "1em 0" }}
              onClick={(e) =>
                handleFormsClick(e, `/periodontalAssesment/${id}`)
              }
            >
              Periodontal Chart
            </Button>
          </Box>
        </Box>
        <Descriptions title="Social History">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Do you ?</TableCell>
                  <TableCell>Kind</TableCell>
                  <TableCell>Often</TableCell>
                  <TableCell>Years</TableCell>
                  <TableCell>Stopped?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Tobacco/Cigarettes/E-Cigarettes (Vaping):
                  </TableCell>
                  <TableCell>
                    {socialHistory?.smoking?.uses ? "Yes" : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.smoking?.kind
                      ? socialHistory.smoking.kind
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.smoking?.frequency
                      ? socialHistory.smoking.frequency
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.smoking?.duration_years
                      ? socialHistory.smoking.duration_years
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.smoking?.has_stopped ? "Yes" : "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Drink Alcohol Beverages:</TableCell>
                  <TableCell>
                    {socialHistory?.alcohol?.uses ? "Yes" : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.alcohol?.kind
                      ? socialHistory.alcohol.kind
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.alcohol?.frequency
                      ? socialHistory.alcohol.frequency
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.alcohol?.duration_years
                      ? socialHistory.alcohol.duration_years
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.alcohol?.has_stopped ? "Yes" : "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Drugs for Recreation:</TableCell>
                  <TableCell>
                    {socialHistory?.drug?.uses ? "Yes" : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.drug?.kind
                      ? socialHistory.drug.kind
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.drug?.frequency
                      ? socialHistory.drug.frequency
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.drug?.duration_years
                      ? socialHistory.drug.duration_years
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {socialHistory?.drug?.has_stopped ? "Yes" : "-"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Descriptions>
        <br />
        <Descriptions
          title="Emergency Contact Details"
          bordered
          size="middle"
        >
          <Descriptions.Item label="Name">
            {patientData.emergency_person}
          </Descriptions.Item>
          <Descriptions.Item label="Relationship with Patient">
            {patientData.relationship_to_patient}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Number" span={2}>
            {patientData.emergency_contact_no}
          </Descriptions.Item>
          <Descriptions.Item label="Email Address" span={1}>
            {patientData.emergency_email
              ? patientData.emergency_email
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={3}>
            {patientData.emergency_address}
          </Descriptions.Item>
        </Descriptions>
      </TabPanel>

      {/* Medical Health Tab */}
      <TabPanel value={tabValue} index={1}>
        <Descriptions title="Medical Health" bordered>
          <Descriptions.Item label="Patient Status" span={3}>
            <span style={{ color: "green" }}>Active</span>
          </Descriptions.Item>
          <Descriptions.Item label="Name">
            {patientData.firstname +
              " " +
              (patientData.middlename
                ? patientData.middlename + " "
                : "") +
              patientData.lastname}
          </Descriptions.Item>
          <Descriptions.Item label="Age">
            {patientData.age}
          </Descriptions.Item>
          <Descriptions.Item label="Birthdate">
            {patientData.dob
              ? format(new Date(patientData.dob), "MM-dd-yyyy")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {patientData.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Marital Status">
            {patientData.marital_status}
          </Descriptions.Item>
          <Descriptions.Item label="Height (cm)">
            {patientData.height}
          </Descriptions.Item>
          <Descriptions.Item label="Weight (kg)">
            {patientData.weight}
          </Descriptions.Item>
          <Descriptions.Item label="Religion">
            {patientData.religion}
          </Descriptions.Item>
          <Descriptions.Item label="Occupation">
            {patientData.occupation}
          </Descriptions.Item>
        </Descriptions>
        <br />
        <Descriptions title="Physical Assessment" bordered column={2}>
          <Descriptions.Item label="Date Taken">
            {physicalAssessment?.date
              ? format(new Date(physicalAssessment.date), "MM-dd-yyyy")
              : "-"}
            <br />
            {physicalAssessment?.time ? physicalAssessment.time : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Vital Signs">
            {physicalAssessment ? (
              <>
                Blood Pressure: {physicalAssessment.bp}
                <br />
                Pulse Rate: {physicalAssessment.pr}
                <br />
                Respiratory Rate: {physicalAssessment.rr}
                <br />
                Temperature: {physicalAssessment.temp}
              </>
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
        <br />
        <Descriptions
          title="Medical History"
          bordered
          column={2}
          layout="vertical"
        >
          <Descriptions.Item label="Physical Care">
            {medicalHealth?.physical_care
              ? medicalHealth.physical_care
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Hospitalization">
            {medicalHealth?.hospitalization
              ? medicalHealth.hospitalization
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Allergies">
            {medicalHealth?.allergy_information ? (
              <List>
                {medicalHealth.allergy_information.map((item, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Checkbox edge="end" checked={true} disabled />
                    }
                  >
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            ) : (
              "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Illnesses">
            {medicalHealth?.illness ? medicalHealth.illness : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="List of INR or HbA1c if known">
            {medicalHealth?.Inr_or_HbA1C
              ? medicalHealth.Inr_or_HbA1C
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="List of medications, vitamins, or herbal supplements">
            {medicalHealth?.medications ? medicalHealth.medications : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Childhood Disease History">
            {medicalHealth?.childhood_disease_history
              ? medicalHealth.childhood_disease_history
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Patient is diagnosed with">
            {medicalHealth?.diagnosed_conditions
              ? medicalHealth.diagnosed_conditions.map((item, index) => (
                  <List key={index}>
                    <ListItem>
                      <ListItemText primary={item} />
                    </ListItem>
                  </List>
                ))
              : "-"}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Reproductive Health" bordered>
          <Descriptions.Item label="Pregnant" span={2}>
            {femaleData?.pregnant ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item
            label="If pregnant, how many months?"
            span={2}
          >
            {femaleData?.pregnantMonths ? femaleData.pregnantMonths : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Breastfeeding" span={2}>
            {femaleData?.breast_feeding ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Menopause" span={2}>
            {femaleData?.menopause ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item
            label="Under hormone replacement therapy?"
            span={2}
          >
            {femaleData?.hormone_replacement ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>
      </TabPanel>

      {/* Dental Chart Tab */}
      <TabPanel value={tabValue} index={2}>
        {/* 3D Dental Model and Periodontal Chart will go here */}
        <Descriptions title="Dental Health" bordered>
          <Descriptions.Item label="Date of Last Visit">
            {dentalHistory?.last_visit
              ? format(new Date(dentalHistory.last_visit), "MM-dd-yyyy")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Frequency of Dental Visits">
            {dentalHistory?.frequency_visit
              ? dentalHistory.frequency_visit
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Procedure Done on Last Visit">
            {dentalHistory?.last_procedure
              ? dentalHistory.last_procedure
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Exposure and Response to Local Anesthesia">
            {dentalHistory?.local_anesthesia
              ? dentalHistory.local_anesthesia
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Complications During and After Dental Procedures">
            {dentalHistory?.complication
              ? dentalHistory.complication
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Dental Hygiene Routine">
            <>
              Patient Brushes:{" "}
              {dentalHistory?.no_brush ? dentalHistory.no_brush : 0} a day
              <br />
              Patient Flosses:{" "}
              {dentalHistory?.no_floss ? dentalHistory.no_floss : 0} a day
              <br />
              Patient Uses Mouthwash:{" "}
              {dentalHistory?.no_mouthwash
                ? dentalHistory.no_mouthwash
                : 0}{" "}
              a day
              <br />
              Toothbrush Brand/Type:{" "}
              {dentalHistory?.toothbrush
                ? dentalHistory.no_brush
                : "None"}
              <br />
              Toothpaste Brand/Type:{" "}
              {dentalHistory?.toothpaste
                ? dentalHistory.toothpaste
                : "None"}
            </>
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Dental Health Questionnaire" bordered>
          <Descriptions.Item label="Like to Smile?">
            {dentalQuestion?.likeSmile?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.likeSmile?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.likeSmile?.details
                ? dentalQuestion.likeSmile.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Had Tooth Extraction?">
            {dentalQuestion?.experiencedExtraction?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.experiencedExtraction?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.experiencedExtraction?.details
                ? dentalQuestion.experiencedExtraction.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Bled too much after Tooth Extraction?">
            {dentalQuestion?.bleedingAfterExtraction?.answer
              ? "Yes"
              : "No"}
          </Descriptions.Item>
          {dentalQuestion?.bleedingAfterExtraction?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.bleedingAfterExtraction?.details
                ? dentalQuestion.bleedingAfterExtraction.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Had Orthodontic Treatment?">
            {dentalQuestion?.orthodonticTreatment?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.orthodonticTreatment?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.orthodonticTreatment?.details
                ? dentalQuestion.orthodonticTreatment.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Teeth Sensitive to hot, cold, sweets, and pressure?">
            {dentalQuestion?.sensitiveTeeth?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.sensitiveTeeth?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.sensitiveTeeth?.details
                ? dentalQuestion.sensitiveTeeth.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Had any periodontal (gum) problems?">
            {dentalQuestion?.periodontalProblems?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.periodontalProblems?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.periodontalProblems?.details
                ? dentalQuestion.periodontalProblems.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Gums bleed spontaneously?">
            {dentalQuestion?.spontaneousBleeding?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.spontaneousBleeding?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.spontaneousBleeding?.details
                ? dentalQuestion.spontaneousBleeding.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label=" Uses Fluoridated toothpaste?">
            {dentalQuestion?.fluoridatedToothpaste?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.fluoridatedToothpaste?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.fluoridatedToothpaste?.details
                ? dentalQuestion.fluoridatedToothpaste.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Wear any dentures?">
            {dentalQuestion?.wearsDenture?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.wearsDenture?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.wearsDenture?.details
                ? dentalQuestion.wearsDenture.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Experience Jaw Pain?">
            {dentalQuestion?.jawPain?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.jawPain?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.jawPain?.details
                ? dentalQuestion.jawPain.details
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Food catch between teeth?">
            {dentalQuestion?.foodCatching?.answer ? "Yes" : "No"}
          </Descriptions.Item>
          {dentalQuestion?.foodCatching?.answer && (
            <Descriptions.Item label="Details">
              {dentalQuestion?.foodCatching?.details
                ? dentalQuestion.foodCatching.details
                : "-"}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Descriptions title="Extraoral/Intraoral Examination" bordered>
          <Descriptions.Item label="Skin">
            {extraoralIntraoral?.skin?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>

          {extraoralIntraoral?.skin?.normal === "Abnormal" && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.skin?.abnormal_description
                ? extraoralIntraoral.skin.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Eyes">
            {extraoralIntraoral?.eyes?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.eyes?.normal === "Abnormal" && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.eyes?.abnormal_description
                ? extraoralIntraoral.eyes.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Neck">
            {extraoralIntraoral?.neck?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.neck?.normal === "Abnormal" && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.neck?.abnormal_description
                ? extraoralIntraoral.neck.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="TMJ">
            {extraoralIntraoral?.tmj?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.tmj?.normal == false && (
            <>
              <Descriptions.Item label="Description">
                {extraoralIntraoral?.tmj.abnormal_description
                  ? extraoralIntraoral.tmj.abnormal_description
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Crepitus Left">
                {extraoralIntraoral?.tmj.crepitus_left ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Crepitus Right">
                {extraoralIntraoral?.tmj.crepitus_right ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Deflection">
                {extraoralIntraoral?.tmj.deflection ? "Yes" : "No"}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Lymph Node">
            {extraoralIntraoral?.lymph_node?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.lymph_node?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.lymph_node?.abnormal_description
                ? extraoralIntraoral.lymph_node.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Lips">
            {extraoralIntraoral?.lips?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.lips?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.lips?.abnormal_description
                ? extraoralIntraoral.lips.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Buccal Mucosa">
            {extraoralIntraoral?.buccal_mucosa?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.buccal_mucosa?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.buccal_mucosa?.abnormal_description
                ? extraoralIntraoral.buccal_mucosa.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Vestibule">
            {extraoralIntraoral?.vestibule?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.vestibule?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.vestibule?.abnormal_description
                ? extraoralIntraoral.vestibule.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Alveolar Ridge">
            {extraoralIntraoral?.alveolar_ridge?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.alveolar_ridge?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.alveolar_ridge.abnormal_description
                ? extraoralIntraoral.alveolar_ridge.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Hard/Soft Palate">
            {extraoralIntraoral?.hard_soft_palate?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.hard_soft_palate?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.hard_soft_palate?.abnormal_description
                ? extraoralIntraoral.hard_soft_palate.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Oro Pharynx">
            {extraoralIntraoral?.oro_pharynx?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.oro_pharynx?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.oro_pharynx?.abnormal_description
                ? extraoralIntraoral.oro_pharynx.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Tongue">
            {extraoralIntraoral?.tongue?.normal ? "Normal" : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.tongue?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.tongue?.abnormal_description
                ? extraoralIntraoral.tongue.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Floor of Mouth">
            {extraoralIntraoral?.floor_of_mouth?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.floor_of_mouth?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.floor_of_mouth?.abnormal_description
                ? extraoralIntraoral.floor_of_mouth.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Salivary Glands">
            {extraoralIntraoral?.salivary_glands?.normal
              ? "Normal"
              : "Abnormal"}
          </Descriptions.Item>
          {extraoralIntraoral?.salivary_glands?.normal == false && (
            <Descriptions.Item label="Description">
              {extraoralIntraoral?.salivary_glands?.abnormal_description
                ? extraoralIntraoral.salivary_glands.abnormal_description
                : "-"}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Descriptions title="Dental History 3" bordered>
          <Descriptions.Item label="Occlusion">
            {occlusion ? (
              <>
                Class I: {occlusion?.class_I ? "Yes" : "No"}
                <br />
                Class II Div 1: {occlusion?.class_II_div_1 ? "Yes" : "No"}
                <br />
                Class II Div 2: {occlusion?.class_II_div_2 ? "Yes" : "No"}
                <br />
                Class III: {occlusion?.class_III ? "Yes" : "No"}
              </>
            ) : (
              "-"
            )}
          </Descriptions.Item>
          {occlusion?.other_occlussal_abno && (
            <Descriptions.Item label="Other Occlusal Abnormalities">
              {occlusion?.other_occlussal_abno
                ? occlusion.other_occlussal_abno
                : "-"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Parafunctional Habits">
            {occlusion?.parafunctional_oral_habits
              ? occlusion.parafunctional_oral_habits
              : "-"}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions title="Plaque & Enamel" bordered>
          {plaqueEnamel?.enamel_conditions
            ? Object.keys(plaqueEnamel.enamel_conditions).map(
                (key, index) => (
                  <Descriptions.Item
                    key={index}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                  >
                    {plaqueEnamel.enamel_conditions[key] ? "Yes" : "No"}
                  </Descriptions.Item>
                )
              )
            : "-"}
          <Descriptions.Item label="Plaque">
            {plaqueEnamel?.plaque && plaqueEnamel?.distribution ? (
              <>
                Distribution: {plaqueEnamel.plaque.distribution}
                <br />
                Plaque: {plaqueEnamel.plaque}
              </>
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Gingival Descriptions" bordered column={2}>
          <Descriptions.Item label="Color">
            {gingivalDescription?.color ? gingivalDescription.color : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Consistency">
            {gingivalDescription?.consistency
              ? gingivalDescription.consistency
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Contour">
            {gingivalDescription?.contour
              ? gingivalDescription.contour
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Texture">
            {gingivalDescription?.texture
              ? gingivalDescription.texture
              : "-"}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Periodontal Diagnosis" bordered>
          <Descriptions.Item label="Total Points">
            {periodontalDiagnosis?.nucd_classification?.total_points
              ? periodontalDiagnosis.nucd_classification.total_points
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="NUCD Classification">
            {periodontalDiagnosis?.nucd_classification?.classification
              ? periodontalDiagnosis.nucd_classification.classification
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="ASA Classification">
            {periodontalDiagnosis?.asa_type
              ? periodontalDiagnosis.asa_type
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Instructor">
            {periodontalDiagnosis?.nucd_classification?.instructor
              ? periodontalDiagnosis.nucd_classification.instructor
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="AAP Classification">
            {periodontalDiagnosis?.aap_classification
              ? periodontalDiagnosis.aap_classification
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Bleeding on Probing">
            {periodontalDiagnosis?.probing_exploring?.generalized
              ? periodontalDiagnosis.probing_exploring.generalized
              : periodontalDiagnosis?.probing_exploring?.localized
              ? periodontalDiagnosis.probing_exploring.localized
              : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Calculus Sub-Marginal">
            {periodontalDiagnosis?.sub_marginal?.moderate
              ? "Moderate"
              : periodontalDiagnosis?.sub_marginal?.heavy
              ? "Heavy"
              : periodontalDiagnosis?.sub_marginal?.mild
              ? "Mild"
              : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Calculus Supra-Marginal">
            {periodontalDiagnosis?.supra_marginal_calculus?.moderate
              ? "Moderate"
              : periodontalDiagnosis?.supra_marginal_calculus?.heavy
              ? "Heavy"
              : periodontalDiagnosis?.supra_marginal_calculus?.mild
              ? "Mild"
              : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Periodontal Status">
            {periodontalDiagnosis?.periodontal_tissues?.gingivitis
              ? "Gingivitis"
              : periodontalDiagnosis?.periodontal_tissues
                  ?.perio_maintenance
              ? "Perio Maintenance"
              : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Periodontitis">
            {periodontalDiagnosis?.periodontal_tissues
              ?.periodontitis_stage_1
              ? "Stage 1"
              : periodontalDiagnosis?.periodontal_tissues
                  ?.periodontitis_stage_2
              ? "Stage 2"
              : periodontalDiagnosis?.periodontal_tissues
                  ?.periodontitis_stage_3
              ? "Stage 3"
              : periodontalDiagnosis?.periodontal_tissues
                  ?.periodontitis_stage_4
              ? "Stage 4"
              : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Extrinsic Stain">
            {periodontalDiagnosis?.oral_hygiene?.light
              ? "Light"
              : periodontalDiagnosis?.oral_hygiene?.moderate
              ? "Moderate"
              : periodontalDiagnosis?.oral_hygiene?.heavy
              ? "Heavy"
              : "None"}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Diagnosis and Treatment Plan" bordered>
          <Descriptions.Item label="Diagnosis">
            {diagnosisAndTreatment?.diagnosis
              ? diagnosisAndTreatment.diagnosis
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Treatment Plan">
            {diagnosisAndTreatment?.treatmentPlan
              ? diagnosisAndTreatment.treatmentPlan
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Consented?">
            {diagnosisAndTreatment?.consentGiven ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>
      </TabPanel>

      {/* Treatment Plan Tab */}
      <TabPanel value={tabValue} index={3}>
        <h1>Treatment History Record</h1>
        <br />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Procedures</TableCell>
                <TableCell>Patient's Signature</TableCell>
                <TableCell>Clinician</TableCell>
                <TableCell>Clinical Instructor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatmentHistory && treatmentHistory.length !== 0 ? (
                treatmentHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(item.date), "MM-dd-yyyy")}
                    </TableCell>
                    <TableCell>{item.procedures}</TableCell>
                    <TableCell>
                      <img
                        src={`${API_URL}/getFile/patient_signature/${item.patientSignature}`}
                        alt="Patient Signature"
                        className="signatures"
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={`${API_URL}/getFile/clinician_signature/${item.clinicianSignature}`}
                        alt="Clinician Signature"
                        className="signatures"
                      />
                    </TableCell>
                    <TableCell>{item.clinicalInstructor}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    style={{ fontWeight: 500, color: "#000" }}
                  >
                    No Treatment History Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Temporary Button */}
        <Button
          variant="contained"
          onClick={() => console.log(treatmentHistory)}
        >
          Check Treatment Record
        </Button>
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <FinalDentalChartViewer 
          dentalChartData={dentalChartData}
          finalChartData={finalChartData} 
        />
      </TabPanel>
    </div>
  );
};


export default SubmittedCaseInfoClinician;
