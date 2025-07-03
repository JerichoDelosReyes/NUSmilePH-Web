import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
} from "react";
import "../Views/Styles/ProgressTracker.css";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { useLocation, useNavigate, useParams } from "react-router";
import { App } from "antd";
import axios from "axios";
import { Card, Row, Col, Button, Container, Dropdown } from "react-bootstrap";
import {
  caseGradingReducer,
  INITIAL_STATE,
} from "../Reducers/casegrading/CaseGradingReducer";
import { GradeModal } from "../Custom Hooks/CaseGradingComponents/GradeModal";
import { CaseGradingCard } from "../Custom Hooks/CaseGradingComponents/CaseGradingCard";
import { PediatricDentistryCaseGradingCard } from "../Custom Hooks/CaseGradingComponents/PediatricDentistryCaseGradingCard";
import { handleSaveGrade } from "../Custom Hooks/CaseGradingComponents/CaseGradingHelper";
import {
  cleanData,
  handleYearChange,
  SectionsOnly,
} from "../Custom Hooks/TallySheetComponents/Utils";
import { ProgressStatistics } from "../Custom Hooks/TallySheetComponents/Progress_Statistics";
import { ClinicianSheet } from "../Context/CaseContext";
import { IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import API_ENDPOINTS, { API_URL } from "../../config/api";

const CaseGrading = () => {
  const { year = "IA" } = useParams(); //useParams for dynamic routing
  TitleHead(`Case Grading - ${year}`);
  const { user, loading } = useContext(UserContext);
  const { clinicianInfo, setClinicianInfo } = useContext(ClinicianSheet);
  const navigate = useNavigate();
  const location = useLocation();
  const { message: messageApi } = App.useApp();
  const [state, dispatch] = useReducer(caseGradingReducer, INITIAL_STATE);
  const { clinicianName, clinicianProfile, clinicianCollege, tallySheetID } =
    clinicianInfo;

  const clinicianID = tallySheetID ? tallySheetID[year] : null;
  const [id, setId] = useState(null);
  const { selectedYear, clinicalChair } = state;
  // Check if user is clinical chair
  const isClinicalChair = user?.role === "Clinical Chair";

  const getClinicianData = async () => {
    console.log("CaseGrading - getClinicianData called");
    console.log("Clinician ID:", clinicianID);
    if (!clinicianID) {
      messageApi.error(`Clinician ID is missing for ${year}`);
      return;
    }

    try {
      // Handle different endpoint patterns for pediatric dentistry
      let response;
      try {
        if(year === 'PediatricDentistry') {
          console.log("Fetching PediatricDentistry data with ID:", clinicianID);
          response = await axios.get(`${API_URL}/getPediatricDentistry/${clinicianID}`);
        } else {
          console.log(`Fetching ${year} data with ID:`, clinicianID);
          response = await axios.get(`${API_URL}/get${year}/${clinicianID}`);
        }
      } catch (fetchError) {
        console.error(`Error fetching ${year} data:`, fetchError);
        if (year === 'PediatricDentistry') {
          messageApi.error("Pediatric Dentistry data not found. The tally sheet may not have been created yet.");
        } else {
          messageApi.error(`Error fetching ${year} data: ${fetchError.message}`);
        }
        return;
      }
      
      console.log("Clinician Data fetched:", response.data);

      const { clinicianID: cID, _id, __v, ...tallyData } = response.data;
      setId(cID);

      // Set the expanded property on each category to make them visible by default
      const dataWithExpanded = {};
      Object.keys(tallyData).forEach((key) => {
        if (
          typeof tallyData[key] === "object" &&
          tallyData[key] !== null &&
          !Array.isArray(tallyData[key])
        ) {
          dataWithExpanded[key] = { ...tallyData[key], expanded: true };
        } else {
          dataWithExpanded[key] = tallyData[key];
        }
      });

      dispatch({ type: "GET_DATA", payload: dataWithExpanded });
      dispatch({
        type: "HANDLE_CLINICAL_CHAIR",
        payload: tallyData.clinicalChair,
      });

      messageApi.success("Clinician data loaded successfully", 2);
    } catch (err) {
      console.error("Error fetching clinician data:", err);
      messageApi.error("Failed to load clinician data", 2);
    }
  };

  const handleExportPdf = async () => {
    if (!clinicianID) {
      messageApi.error("Clinician ID is missing. Cannot export PDF.", 2);
      return;
    }

    // Store the message key so we can close it later
    const loadingKey = "pdfExport";

    try {
      // Show loading message and retain control of it
      messageApi.loading({
        content: "Generating PDF report...",
        key: loadingKey,
        duration: 0, // Don't auto-dismiss
      });

      const response = await axios.get(
        `${API_URL}/export/tallysheet/${id}/${year}/pdf`,
        {
          responseType: "blob", // Important for handling binary data
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `TallySheet_${clinicianName}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the URL object

      // Success: Close loading message and show success
      messageApi.success({
        content: "PDF exported successfully",
        key: loadingKey,
        duration: 2,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);

      // Error: Close loading message and show error
      messageApi.error({
        content: "Failed to export PDF. Please try again.",
        key: loadingKey,
        duration: 2,
      });
    }
  };

  const handleExportExcel = async () => {
    if (!clinicianID) {
      messageApi.error("Clinician ID is missing. Cannot export Excel file.", 2);
      return;
    }

    try {
      messageApi.loading("Generating Excel report...", 1);

      const response = await axios.get(
        `${API_URL}/export/tallysheet/${id}/${year}/excel`,
        {
          responseType: "blob", // Important for handling binary data
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `TallySheet_${clinicianName}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the URL object

      messageApi.success("Excel file exported successfully", 2);
    } catch (error) {
      console.error("Error exporting Excel file:", error);
      messageApi.error("Failed to export Excel file. Please try again.", 2);
    }
  };

  const handleNavigateToRemarks = () => {
    navigate(`/remarks/${year}`, {
      state: {
        clinicianName,
        remarks: remarksDescription,
        courseCode,
        tallysheetID: clinicianID,
        tallyData: state.data, // Pass the full data object
        clinicLevel: year, // Pass the clinic level
      },
    });
  };

  useEffect(() => {
    if (
      (!clinicianInfo || !clinicianInfo.tallySheetID) &&
      sessionStorage.getItem("clinicianInfo")
    ) {
      setClinicianInfo(JSON.parse(sessionStorage.getItem("clinicianInfo")));
    }
  }, []);

  useEffect(() => {
    dispatch({ type: "HANDLE_SELECTED_YEAR", payload: year });
    if (clinicianInfo && clinicianInfo.tallySheetID) {
      sessionStorage.setItem("clinicianInfo", JSON.stringify(clinicianInfo));
    }
  }, [year, clinicianInfo]);

  useEffect(() => {
    if (!loading && clinicianID) {
      getClinicianData();
    }
  }, [selectedYear, loading, clinicianID]);

  // Process data using the TallySheetModels for this year level
  const { sections, procedures } = cleanData(state.data || {}, selectedYear);
  const remarksDescription = sections?.remarks || "";
  const courseCode = sections?.courseCode || "";
  const sectionForRemarks = SectionsOnly(sections);
  const remarksSections = { sectionForRemarks, clinicalChair };

  // Debug the data structure
  useEffect(() => {
    if (selectedYear === 'PediatricDentistry') {
      console.log(`Data for ${selectedYear}:`, state.data);
      console.log(`Cleaned procedures:`, procedures);
      console.log(`Sections:`, sections);
    }
  }, [state.data, selectedYear, procedures, sections]);

  const handleGradeModal = (category, procedure, caseKey, caseData) => {
    const isPenalty = category === "penalty";

    const selectedProcedure = {
      id: isPenalty
        ? `${category}-${procedure}`
        : `${category}-${procedure}-${caseKey}`,
      name: isPenalty ? "Penalty Case" : procedure,
    };

    const selectedPath = isPenalty
      ? `${category}.${procedure}`
      : `${category}.${procedure}.${caseKey}`;

    const selectedCase = {
      id: isPenalty
        ? `${category}-${procedure}`
        : `${category}-${procedure}-${caseKey}`,
      case: procedure,
      ...caseData,
    };

    const updatedState = {
      selectedProcedure,
      selectedCase,
      selectedPath,
      grade: "",
      signatory: "",
      completionDate: "",
      feedback: "",
      showGradeModal: true,
    };

    if (caseData?.rating || caseData?.case) {
      updatedState.grade = caseData.rating || "";
      updatedState.signatory = caseData.clinicalInstructor || "";
      updatedState.completionDate = caseData.date || "";
      updatedState.feedback = caseData.feedback || "";
    }
    dispatch({ type: "SET_MODAL_DATA", payload: updatedState });
    dispatch({
      type: "HANDLE_FILE_UPLOAD",
      payload:
        (caseData?.rating || caseData?.case) && caseData.signature
          ? caseData.signature
          : null,
    });
  };

  const saveGrade = () => {
    handleSaveGrade({
      state,
      dispatch,
      clinicianID,
      messageApi,
      clinicalInstructorID: user?.id,
    });
  };

  return (
    <Container fluid className="py-4">
      {/* Clinician Information Card */}
      <Card className="shadow mb-4 clinician-card border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center">
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              className="me-2"
              sx={{ color: "#6c757d" }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <h5 className="mb-0 fw-bold">Clinician Details</h5>
          </div>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-primary"
              id="year-dropdown"
              size="sm"
              className="rounded-pill px-3"
            >
              <span
                className="material-symbols-outlined me-1"
                style={{ fontSize: "14px", verticalAlign: "middle" }}
              >
                calendar_month
              </span>
              Year: {selectedYear}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0">
              {["IA", "IB", "IIA", "IIB", "IIIA", "IIIB", "IVA", "IVB", "PediatricDentistry"].map(
                (yearOption) => (
                  <Dropdown.Item
                    key={yearOption}
                    onClick={() =>
                      handleYearChange(
                        yearOption,
                        dispatch,
                        navigate,
                        messageApi,
                        "grading"
                      )
                    }
                    active={yearOption === selectedYear}
                  >
                    {yearOption}
                  </Dropdown.Item>
                )
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>

        <Card.Body className="pt-3 pb-4">
          <Row>
            <Col xs={12} md={8} lg={8}>
              <div className="d-flex align-items-center mb-3">
                <div
                  className="clinician-avatar rounded-circle bg-primary bg-opacity-10 d-flex justify-content-center align-items-center me-3"
                  style={{ width: "60px", height: "60px" }}
                >
                  {clinicianProfile ? (
                    <img
                      src={API_ENDPOINTS.GET_USER_PROFILE_IMAGE(
                        clinicianProfile
                      )}
                      alt="Clinician Avatar"
                      className="rounded-circle"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML = `
          <div class="d-flex justify-content-center align-items-center h-100 w-100">
            <span class="material-symbols-outlined" style="font-size: 30px; color: #0d6efd;">
              person
            </span>
          </div>
        `;
                      }}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 w-100">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "30px", color: "#0d6efd" }}
                      >
                        person
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="h4 mb-1 fw-bold">
                    {clinicianName || "No Name Available"}
                  </h3>
                  <p className="mb-0 text-muted d-flex align-items-center">
                    <span
                      className="material-symbols-outlined me-1"
                      style={{ fontSize: "16px" }}
                    >
                      school
                    </span>
                    {clinicianCollege || "No College Information"}
                  </p>
                </div>
              </div>

              <div className="clinician-details p-3 bg-light rounded mb-3">
                <Row>
                  <Col xs={12} sm={6}>
                    <div className="mb-2 mb-sm-0">
                      <label className="text-muted small mb-1 d-block">
                        Date Issued
                      </label>
                      <p className="mb-0 fw-medium">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div>
                      <label className="text-muted small mb-1 d-block">
                        Issuing Personnel
                      </label>
                      <p className="mb-0 fw-medium">
                        {user?.name || "Not specified"}
                      </p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col
              xs={12}
              md={4}
              lg={4}
              className="d-flex flex-column justify-content-center"
            >
              <div className="actions-panel p-3 border border-light rounded">
                <h6 className="text-muted small text-uppercase mb-3">
                  Actions
                </h6>

                {isClinicalChair && (
                  <div className="d-grid gap-2 mb-3">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        className="d-flex align-items-center justify-content-center w-100"
                        size="sm"
                      >
                        <span
                          className="material-symbols-outlined me-2"
                          style={{ fontSize: "16px" }}
                        >
                          download
                        </span>
                        Export Report
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100">
                        <Dropdown.Item
                          onClick={handleExportPdf}
                          disabled={!clinicianID}
                          className="d-flex align-items-center"
                        >
                          <span
                            className="material-symbols-outlined me-2"
                            style={{ fontSize: "18px", color: "#dc3545" }}
                          >
                            picture_as_pdf
                          </span>
                          Export as PDF
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={handleExportExcel}
                          disabled={!clinicianID}
                          className="d-flex align-items-center"
                        >
                          <span
                            className="material-symbols-outlined me-2"
                            style={{ fontSize: "18px", color: "#198754" }}
                          >
                            table_view
                          </span>
                          Export as Excel
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleNavigateToRemarks}
                >
                  <span
                    className="material-symbols-outlined me-2"
                    style={{ fontSize: "16px" }}
                  >
                    edit_note
                  </span>
                  View Remarks
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Progress Statistics */}
      <ProgressStatistics clinicianId={id} clinicLevel={year} />

      {/* Procedure Categories */}
      {procedures && Object.keys(procedures).length > 0 ? (
        Object.keys(procedures).map((category) => {
          // Get expansion state from the original data
          const isExpanded =
            state.data && state.data[category]
              ? state.data[category].expanded || false
              : false;

          // Find fixedPartialDentures if they exist
          const fixedPartialDentures =
            state.data && state.data.fixedPartialDentures
              ? state.data.fixedPartialDentures
              : {};

          // Check if we're in PediatricDentistry year and this is a pediatric category
          const isPediatricCategory = selectedYear === "PediatricDentistry" && 
            ['OralRehabilitation', 'OralProphylaxisAndTopicalFluoride', 'PitAndFissueSealants', 
             'Pulpotomy', 'StainlessSteelCrowns', 'StripOffCrown', 'Restorations', 'Extractions', 'penalty'].includes(category);

          if (isPediatricCategory) {
            return (
              <PediatricDentistryCaseGradingCard
                key={category}
                category={category}
                categoryData={procedures[category] || {}}
                expanded={isExpanded}
                stateData={state.data || {}}
                dispatch={dispatch}
                handleGradeModal={handleGradeModal}
                yearLevel={selectedYear}
              />
            );
          }

          return (
            <CaseGradingCard
              key={category}
              category={category}
              categoryData={procedures[category] || {}}
              expanded={isExpanded}
              stateData={state.data || {}}
              fixedPartialDentures={fixedPartialDentures}
              dispatch={dispatch}
              handleGradeModal={handleGradeModal}
              yearLevel={selectedYear}
            />
          );
        })
      ) : (
        <Card className="shadow-sm mb-4">
          <Card.Body className="py-4 text-center">
            <div className="text-muted">
              <span
                className="material-symbols-outlined d-block mb-3"
                style={{ fontSize: "48px" }}
              >
                search_off
              </span>
              <h5>No procedures found for {selectedYear}</h5>
              <p className="mb-0">
                There may be no data for this year level, or the data structure
                doesn't match the expected format.
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal for grading cases */}
      <GradeModal
        showGradeModal={state.showGradeModal}
        selectedCase={state.selectedCase}
        dispatch={dispatch}
        selectedProcedure={state.selectedProcedure}
        grade={state.grade}
        completionDate={state.completionDate}
        signatory={state.signatory}
        feedback={state.feedback}
        handleSaveGrade={saveGrade}
        signatureImg={state.signatureImg}
        showSignaturePad={state.showSignaturePad}
        penaltyCaseName={state.penaltyCaseName}
      />
    </Container>
  );
};

export default CaseGrading;
