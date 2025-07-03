import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Container,
  Table,
  Badge,
  Dropdown,
  ProgressBar,
} from "react-bootstrap";
import "../Views/Styles/ProgressTracker.css";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { useNavigate, useParams } from "react-router";
import { App } from "antd";
import { format } from "date-fns";
import axios from "axios";
import { PROGRESS_STATE } from "../Reducers/tallysheet/ProgressTrackerState";
import { progressTrackerReducer } from "../Reducers/tallysheet/ProgressTrackerReducer";
import { TallySheetCard } from "../Custom Hooks/TallySheetComponents/TallySheetCard";
import { PediatricDentistryCard } from "../Custom Hooks/TallySheetComponents/PediatricDentistryCard";
import {
  handleYearChange,
  navigateToRemarks,
  toggleCategory,
  handleSections,
  cleanData,
  SectionsOnly,
} from "../Custom Hooks/TallySheetComponents/Utils";
import { ProgressStatistics } from "../Custom Hooks/TallySheetComponents/Progress_Statistics";
import { FiArrowLeft } from "react-icons/fi"; // Changed from Material UI imports
import { API_URL } from "../../config/api";

const ProgressTracker = () => {
  TitleHead("Clinician Progress Tracker");
  const { user, loading } = useContext(UserContext);
  const { year = "IA" } = useParams();
  const { message } = App.useApp();
  const [state, dispatch] = useReducer(progressTrackerReducer, PROGRESS_STATE);
  const navigate = useNavigate();
  const { selectedYear, clinicalChair, tallySheetID } = state;
  const { sections, procedures } = cleanData(state.data || {}, selectedYear);
  const remarksDescription = sections.remarks;
  const courseCode = sections.courseCode;
  const sectionForRemarks = SectionsOnly(sections);

  const getClinician = async () => {
    try {
      const clinicianData = await axios.get(
        `${API_URL}/getUserById/${user?.id}`
      );
      console.log("Clinician Data:", clinicianData.data);

      // Handle different year ID patterns for pediatric dentistry
      let yearID;
      if(selectedYear === 'PediatricDentistry') {
        // For pediatric dentistry, check if there's a specific field or use a different approach
        yearID = clinicianData.data.users.PediatricDentistry || 
                 clinicianData.data.users.pediatricDentistry ||
                 clinicianData.data.users[selectedYear];
      } else {
        yearID = clinicianData.data.users[selectedYear];
      }
      
      console.log("Year ID for", selectedYear, ":", yearID);
      
      // Add error handling if yearID is undefined
      if (!yearID) {
        console.error(`No year ID found for ${selectedYear}. Available keys:`, Object.keys(clinicianData.data.users));
        message.error(`No data found for ${selectedYear}. Please contact administrator.`);
        return;
      }
      
      // Handle different endpoint patterns for pediatric dentistry
      let tallySheetData;
      try {
        if(selectedYear === 'PediatricDentistry') {
          tallySheetData = await axios.get(
            `${API_URL}/getPediatricDentistry/${yearID}`
          );
        } else {
          tallySheetData = await axios.get(
            `${API_URL}/get${selectedYear}/${yearID}`
          );
        }
      } catch (fetchError) {
        console.error(`Error fetching ${selectedYear} data:`, fetchError);
        if (selectedYear === 'PediatricDentistry') {
          message.error("Pediatric Dentistry data not found. The tally sheet may not have been created yet.");
        } else {
          message.error(`Error fetching ${selectedYear} data: ${fetchError.message}`);
        }
        return;
      }
      console.log("Tally Sheet Data:", tallySheetData.data);
      console.log("Selected Year in fetch:", selectedYear);
      console.log("Data clinic level:", tallySheetData.data.clinicLevel);
      
      const { clinicianID, _id, __v, ...tallyData } = tallySheetData.data;

      console.log("Year ID:", yearID);

      const sectionsData = handleSections(tallyData);

      console.log("Tally Sheet Data:", tallyData);
      console.log("Sections Data:", sectionsData);
      dispatch({ type: "FETCH_DATA", payload: tallyData });
      dispatch({
        type: "HANDLE_CLINICAL_CHAIR",
        payload: tallyData.clinicalChair,
      });
      dispatch({ type: "GET_TALLY_SHEET_ID", payload: yearID });
    } catch (err) {
      console.error("Error fetching clinician data:", err);
    }
  };

  useEffect(() => {
    dispatch({ type: "HANDLE_SELECTED_YEAR", payload: year });
  }, [year]);

  useEffect(() => {
    if (!loading) {
      getClinician();
    }
  }, [loading, selectedYear]);

  return (
    <Container fluid className="py-4">
      {/* Updated Back Button to match standard style */}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => navigate(-1)}
        className="compact-back-btn mb-3"
      >
        <FiArrowLeft size={16} />
        <span className="ms-1">Back</span>
      </Button>
      {/* Clinician Information Card */}
      <Card className="shadow-sm mb-4 clinician-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} md={6} lg={7}>
              <h2 className="h4 mb-1">{user?.username ?? "Clinician"} </h2>
              <p className="text-muted mb-1">{user?.program}</p>
              <div className="d-flex flex-column flex-sm-row">
                <small className="text-muted me-0 me-sm-3 mb-1 mb-sm-0">
                  <strong>Date Issue:</strong>
                </small>
                <small className="text-muted">
                  <strong>Issuing Personnel:</strong> _____
                </small>
              </div>
            </Col>
            {/* Year Dropdown with Fixed Styling */}
            <Col xs={12} md={3} lg={3} className="mt-3 mt-md-0">
              <div className="d-flex flex-column h-100 justify-content-center align-items-start align-items-md-end">
                <Dropdown className="mb-2 w-100 w-md-auto year-dropdown-container">
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    id="year-dropdown"
                    size="sm"
                    className="w-100 w-md-auto"
                  >
                    Year: {selectedYear}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="year-dropdown-menu">
                    {[
                      "IA",
                      "IB",
                      "IIA",
                      "IIB",
                      "IIIA",
                      "IIIB",
                      "IVA",
                      "IVB",
                      "PediatricDentistry",
                    ].map((year) => (
                      <Dropdown.Item
                        key={year}
                        onClick={() =>
                          handleYearChange(year, dispatch, navigate, message)
                        }
                      >
                        {year}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100 w-md-auto"
                  onClick={() =>
                    navigateToRemarks(
                      navigate,
                      selectedYear,
                      user?.username,
                      remarksDescription,
                      courseCode,
                      tallySheetID
                    )
                  }
                >
                  Remarks
                </Button>
              </div>
            </Col>
          </Row>
          {/* Progress Statistics */}
          <ProgressStatistics clinicianId={user.id} clinicLevel={year} />
        </Card.Body>
      </Card>
      {/* Procedure Categories */} {/*YearData*/}
      {Object.keys(procedures).map((category) => {
        const isExpanded = state.data[category]?.expanded || false;
        
        // Check if we're in PediatricDentistry year and this is a pediatric category
        const isPediatricCategory = selectedYear === "PediatricDentistry" && 
          ['OralRehabilitation', 'OralProphylaxisAndTopicalFluoride', 'PitAndFissueSealants', 
           'Pulpotomy', 'StainlessSteelCrowns', 'StripOffCrown', 'Restorations', 'Extractions', 'penalty'].includes(category);
        
        if (isPediatricCategory) {
          return (
            <PediatricDentistryCard
              key={category}
              category={category}
              categoryData={procedures[category]}
              expanded={isExpanded}
              state={state}
              dispatch={dispatch}
              yearLevel={selectedYear}
            />
          );
        }
        
        return (
          <TallySheetCard
            key={category}
            category={category}
            categoryData={procedures[category]}
            expanded={isExpanded}
            state={state}
            dispatch={dispatch}
            yearLevel={selectedYear}
          />
        );
      })}
    </Container>
  );
};

export default ProgressTracker;
