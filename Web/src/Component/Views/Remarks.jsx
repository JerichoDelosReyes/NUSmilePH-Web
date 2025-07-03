import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Container,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Table, message } from "antd";
import "../Views/Styles/RemarksIA.css";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router";
import { App } from "antd";
import axios from "axios";
import { convertImageBase64ToBlob } from "../Custom Hooks/ConvertImageBlob";
import { remarksReducer } from "../Reducers/remarks/RemarksReducer";
import { INITIAL_STATE } from "../Reducers/remarks/Remarks_State";
import { format, isValid } from "date-fns";
import {
  cleanData,
  formatNames,
  getRatingLabel,
  getRatingValue,
  validateSectionCompletion,
} from "../Custom Hooks/TallySheetComponents/Utils";
import { SectionStatus } from "../Custom Hooks/RemarksComponents/SectionStatus";
import { RemarksModal } from "../Custom Hooks/RemarksComponents/RemarksModal";
import { IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { API_URL } from "../../config/api";

/*
Sample JSON structure for section averages:
{
  "periodonticsSection": {
    "status": "ObjectId_or_null",
    "average": 85.5,
    "clinicalInstructor": "ObjectId_or_null",
    "date": "2025-01-15T00:00:00.000Z"
  },
  "restorativeSection": {
    "status": "ObjectId_or_null", 
    "average": 92.0,
    "clinicalInstructor": "ObjectId_or_null",
    "date": "2025-01-15T00:00:00.000Z"
  },
  "prosthodonticsSection": {
    "status": "ObjectId_or_null",
    "average": 78.3,
    "clinicalInstructor": "ObjectId_or_null", 
    "date": "2025-01-15T00:00:00.000Z"
  }
}
*/

// Helper function to get available sections for each year level based on backend models
const getSectionsForYearLevel = (yearLevel) => {
  // Define available sections for each year level based on the backend models
  const yearSections = {
    "IA": ["periodonticsSection", "restorativeSection", "prosthodonticsSection"],
    "IB": ["periodonticsSection", "restorativeSection", "prosthodonticsSection"],
    "IIA": ["periodonticsSection", "restorativeSection", "prosthodonticsSection", "oralSurgerySection", 
           "oralDiagnosisSection", "endodonticsSection"],
    "IIB": ["periodonticsSection", "restorativeSection", "prosthodonticsSection", "oralSurgerySection", 
           "oralDiagnosisSection", "pediatricSection"],
    "IIIA": ["periodonticsSection", "restorativeSection", "prosthodonticsSection", "oralSurgerySection", 
            "oralDiagnosisSection", "endodonticsSection", "pediatricSection"],
    "IIIB": ["periodonticsSection", "restorativeSection", "prosthodonticsSection", "oralSurgerySection", 
            "oralDiagnosisSection", "orthodonticsSection", "pediatricSection"],
    "IVA": ["periodonticsSection", "restorativeSection", "prosthodonticsSection", "oralSurgerySection", 
           "endodonticsSection", "pediatricSection", "orthodonticsSection"],
    "IVB": ["restorativeSection", "prosthodonticsSection", "revalida"]
  };

  return yearSections[yearLevel] || [];
};

// Helper function to determine if a section should be displayed for specific year level
const shouldDisplaySectionForYear = (sectionKey, yearLevel) => {
  const availableSections = getSectionsForYearLevel(yearLevel);
  return availableSections.includes(sectionKey);
};

// Modified SectionsOnly function to extract all sections
const SectionsOnly = (data, yearLevel) => {
  console.log("SectionsOnly input data:", data);
  const result = {};
  
  if (!data) {
    console.error("Data is undefined in SectionsOnly");
    return result;
  }
  
  // Get the list of sections that should be available for this year level
  const expectedSections = getSectionsForYearLevel(yearLevel);
  console.log(`Expected sections for ${yearLevel}:`, expectedSections);
  
  // Check for each expected section
  expectedSections.forEach(sectionKey => {
    if (data[sectionKey]) {
      console.log(`Found section ${sectionKey} directly in data`);
      // Preserve all section data including average, status, clinicalInstructor, and date
      result[sectionKey] = {
        status: data[sectionKey].status || null,
        average: data[sectionKey].average || 0,
        clinicalInstructor: data[sectionKey].clinicalInstructor || null,
        date: data[sectionKey].date || null,
        // Include any other properties that might exist
        ...data[sectionKey]
      };
    }
  });
  
  console.log("Extracted sections:", Object.keys(result));
  console.log("Sections with averages:", result);
  return result;
};

// Updated cleanData function that preserves all sections
const enhancedCleanData = (data) => {
  if (!data) return { sections: {} };
  
  // If data already has a sections property, return it directly
  if (data.sections) return { sections: data.sections };
  
  // Otherwise return the whole data object as sections
  return { sections: data };
};

const Remarks = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { year = "IA" } = useParams();
  TitleHead(`Clinician Remarks - ${year}`);
  const { message } = App.useApp();
  const [state, dispatch] = useReducer(remarksReducer, INITIAL_STATE);
  const [rawApiData, setRawApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clinicianName, courseCode, remarks, tallysheetID } =
    location.state || {};

  // Helper function to calculate overall average from all sections
  const calculateOverallAverage = (sections) => {
    if (!sections || Object.keys(sections).length === 0) return 0;
    
    const validAverages = Object.values(sections)
      .map(section => section?.average || 0)
      .filter(avg => avg > 0);
    
    if (validAverages.length === 0) return 0;
    
    const sum = validAverages.reduce((total, avg) => total + avg, 0);
    return Math.round((sum / validAverages.length) * 100) / 100;
  };

  const displayedName = clinicianName || "Clinician";

  const getUpdatedFetched = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/get${year}/${tallysheetID}`);
      console.log("Raw API Response:", response.data);
      
      // Save raw data for debugging
      setRawApiData(response.data);
      
      const { clinicianID, _id, __v, ...tallyData } = response.data;
      
      // Extract sections using the enhanced clean data function
      const { sections } = enhancedCleanData(tallyData);
      console.log("Extracted sections:", sections);
      
      // Get clinical chair section
      const clinicalChairSection = sections.clinicalChair?.sign || {};
      
      // Process sections for this year level
      const updatedSections = SectionsOnly(sections, year);
      
      // Log section keys in various formats for debugging
      console.log("All section keys:", Object.keys(sections));
      console.log("Filtered section keys:", Object.keys(updatedSections));
      console.log("Section averages:", Object.fromEntries(
        Object.entries(updatedSections).map(([key, data]) => [key, data?.average || 0])
      ));
      
      // Process clinical chair data
      const clinicalChairData = {
        clinicalChairSignature: clinicalChairSection.signature || null,
        rating: clinicalChairSection.rating || 0,
        clinicalInstructorName: clinicalChairSection.clinicalInstructorName || null,
        date: clinicalChairSection.date
          ? format(new Date(clinicalChairSection.date), "yyyy-MM-dd")
          : "",
      };
      
      dispatch({ type: "HANDLE_CHAIR_DATA", payload: clinicalChairData });
      dispatch({ type: "GET_DATA", payload: updatedSections });
    } catch (error) {
      console.error("Error fetching updated data:", error);
      message.error("Failed to load remarks data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUpdatedFetched();
  }, []);

  useEffect(() => {
    if (state.save_success) {
      getUpdatedFetched();
      dispatch({ type: "SET_SAVE", payload: false });
    }
  }, [state.save_success]);

  const handleChange = (e) => {
    dispatch({ type: "HANDLE_INPUTS", payload: e.target });
  };

  const handleUploadSignature = (field) => (e) => {
    console.log("Uploading signature for field:", field);
    if (e.target.files && e.target.files[0]) {
      dispatch({
        type: "HANDLE_SIGNATURE",
        payload: {
          field: field,
          signature: URL.createObjectURL(e.target.files[0]),
        },
      });
    }
  };

  const handleChairUploadSignature = (e) => {
    e.preventDefault();
    console.log("Uploading clinical chair signature");
    if (e.target.files && e.target.files[0]) {
      dispatch({
        type: "HANDLE_CHAIR_SIGNATURE",
        payload: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  
  const handleImageSource = (imageValue, directImg = false) => {
    if (imageValue === "Not Started" || !imageValue) {
      return null;
    }
    if (directImg) {
      return `${API_URL}/getFile/clinical_instructor_signature/${imageValue}`;
    }
    if (typeof imageValue !== "string") {
      return null;
    }
    if (
      imageValue.startsWith("data:image/") ||
      imageValue.startsWith("blob:")
    ) {
      return imageValue;
    }

    return `${API_URL}/getFile/clinical_instructor_signature/${imageValue}`;
  };

  // Custom function to get properly formatted section title
  const getSectionTitle = (sectionKey) => {
    // Special case for revalida
    if (sectionKey === "revalida") {
      return "Revalida";
    }
    
    // Use the existing formatNames function for other sections
    return formatNames(sectionKey);
  };

  // Helper function to get human-readable requirements for a section
  const getSectionRequirements = (sectionKey, clinicLevel) => {
    const requirements = {
      IA: {
        restorativeSection: ["Complete all Typodont procedures", "Complete all Restorative Dentistry cases"],
        prosthodonticsSection: ["Complete all Fixed Partial Dentures", "Complete all Prosthodontics cases"],
        periodonticsSection: ["Complete all Scaling and Polishing procedures"],
      },
      IB: {
        restorativeSection: ["Complete all Typodont procedures", "Complete all Restorative Dentistry cases"],
        prosthodonticsSection: ["Complete all Fixed Partial Dentures", "Complete all Prosthodontics cases"],
        periodonticsSection: ["Complete all Scaling and Polishing procedures"],
      },
      IIA: {
        restorativeSection: ["Complete all Typodont procedures", "Complete all Restorative Dentistry cases"],
        prosthodonticsSection: ["Complete all Fixed Partial Dentures", "Complete all Prosthodontics cases"],
        periodonticsSection: ["Complete all Scaling and Polishing procedures"],
        oralSurgerySection: ["Complete all Oral Surgery procedures"],
        oralDiagnosisSection: ["Complete all Oral Diagnosis cases"],
        endodonticsSection: ["Complete all Endodontics procedures"],
      },
      // Add other levels as needed...
    };
    
    return requirements[clinicLevel]?.[sectionKey] || ["Complete all required procedures"];
  };

  const handleSectionSave = async (section) => {
    const newSignature = state.sectionForRemarks[section].status || null;

    console.log(`Saving section ${section}`);

    if (!newSignature) {
      message.error("Please upload a signature before saving.");
      return;
    }

    // Get the full tallysheet data from the raw API response or location state
    const tallyData = rawApiData || location.state?.tallyData || {};
    // Get clinic level from URL params or location state
    const clinicLevel = location.state?.clinicLevel || year;

    console.log('Validating section completion for:', section);
    console.log('Using tally data:', Object.keys(tallyData));
    console.log('Clinic level:', clinicLevel);

    // Validate section completion before allowing signature
    const validationResult = validateSectionCompletion(
      section,
      tallyData,
      clinicLevel
    );

    if (!validationResult.isValid) {
      // Show a more detailed error message with recommendations
      const errorDetails = validationResult.message || 'Section requirements not met';
      
      message.error({
        content: (
          <div>
            <strong>🚫 Cannot Sign Section</strong>
            <br />
            <span>{errorDetails}</span>
            <br />
            <small style={{ opacity: 0.8 }}>
              Complete all required procedures before signing this section.
            </small>
          </div>
        ),
        duration: 6,
        style: {
          marginTop: '10vh',
        },
      });
      
      console.warn('Section validation failed:', {
        section,
        message: validationResult.message,
        clinicLevel,
        availableData: Object.keys(tallyData)
      });
      
      return;
    }

    // Continue with existing save logic...
    const formData = new FormData();
    formData.append("clinicalInstructorId", user?.id);

    try {
      const imageSrc = handleImageSource(newSignature);
      if (imageSrc && imageSrc.startsWith("data:image/")) {
        const image = convertImageBase64ToBlob(imageSrc);
        console.log("Appending image from If Statement:", image);
        formData.append(
          `clinical_instructor_signature`,
          image,
          `${displayedName}-${section.toLowerCase()}-signature.png`
        );
      } else {
        const blobFile = await axios.get(newSignature, {
          responseType: "blob",
        });
        formData.append(
          `clinical_instructor_signature`,
          blobFile.data,
          `${displayedName}-${section.toLowerCase()}-signature.png`
        );
      }
      
      console.log("FormData:", formData);
      
      // Special handling for revalida section if needed
      const endpoint = section === "revalida" 
        ? `${API_URL}/${year}/${tallysheetID}/revalida/sign/remarks`
        : `${API_URL}/${year}/${tallysheetID}/${section}/sign/remarks`;
        
      const saveSection = await axios.post(
        endpoint,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (saveSection.status === 200) {
        console.log("Section saved successfully:", saveSection.data);
        message.success(
          `${getSectionTitle(section)} signature saved successfully.`
        );
        dispatch({ type: "SET_SAVE", payload: true });
      }
    } catch (err) {
      console.error("Error saving section:", err);
      message.error(`Failed to save ${getSectionTitle(section)} signature.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rating, date, clinicalChairSignature } = state;

    if (!rating) {
      return message.error("Please provide a rating before saving.");
    }
    if (!date || !isValid(new Date(date))) {
      return message.error("Please provide a valid date before saving.");
    }
    if (!clinicalChairSignature) {
      return message.error(
        "Please upload a clinical chair signature before saving."
      );
    }

    if (clinicalChairSignature) {
      const clinicalChairData = new FormData();
      clinicalChairData.append("clinicalInstructorId", user?.id);
      clinicalChairData.append("rating", rating);
      clinicalChairData.append("date", date);
      clinicalChairData.append("sectionPath", "clinicalChair.sign");
      clinicalChairData.append("iaId", tallysheetID);

      try {
        const imageSrc = handleImageSource(clinicalChairSignature);

        if (imageSrc && imageSrc.startsWith("data:image/")) {
          const image = convertImageBase64ToBlob(imageSrc);
          clinicalChairData.append(
            "clinical_instructor_signature",
            image,
            `${displayedName}-clinical-chair-signature.png`
          );
        } else {
          const FileImg = await axios.get(imageSrc, { responseType: "blob" });
          clinicalChairData.append(
            "clinical_instructor_signature",
            FileImg.data
          );
        }

        const clinicalChairRes = await axios.post(
          `${API_URL}/${year}/sign/section`,
          clinicalChairData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        message.success("Clinical Chair signature saved successfully.");
        dispatch({ type: "SET_SAVE", payload: true });
        console.log(
          "Clinical Chair signature saved successfully:",
          clinicalChairRes.data
        );
      } catch (err) {
        console.error("Error saving clinical chair signature:", err);
        message.error("Failed to save Clinical Chair signature.");
      }
    }
  };

  const openSignatureModal = (field) => {
    console.log("Opening signature modal for field:", field);
    dispatch({
      type: "HANDLE_MODAL",
      payload: {
        visible: true,
        field: field,
      },
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      getUpdatedFetched();
      message.success("Form has been reset.");
    }
  };

  // For debugging only - manually add missing sections
  const addMissingSections = () => {
    const availableSections = getSectionsForYearLevel(year);
    const updatedSections = {...state.sectionForRemarks};
    let added = false;
    
    availableSections.forEach(section => {
      if (!updatedSections[section]) {
        updatedSections[section] = { status: null, date: null };
        added = true;
      }
    });
    
    if (added) {
      dispatch({ type: "GET_DATA", payload: updatedSections });
      message.info("Added missing sections for testing");
    } else {
      message.info("No missing sections to add");
    }
  };

  return (
    <div className="remarks-page-container">
      <div className="remarks-content-wrapper">
        
        {/* Loading State */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-skeleton" style={{ height: '200px', marginBottom: '2rem' }}></div>
              <div className="loading-skeleton" style={{ height: '300px', marginBottom: '2rem' }}></div>
              <div className="loading-skeleton" style={{ height: '400px' }}></div>
            </div>
          </div>
        )}
        
        {/* Main Content - Hidden during loading */}
        <div style={{ display: isLoading ? 'none' : 'block' }}>
        
        {/* Header with Back Button */}
        <div className="remarks-header">
          <a href="#" onClick={() => navigate(-1)} className="back-button">
            <ArrowBack fontSize="small" />
            Back to Dashboard
          </a>
        </div>

        {/* Clinician Information Card */}
        <Card className="clinician-info-card animate-slide-in">
          <Card.Body>
            <div className="clinician-info-wrapper">
              <div className="clinician-details">
                <h1 className="clinician-name">{displayedName}</h1>
                <p className="clinician-program">{user?.program}</p>
                {/* Display Overall Average */}
                {state.sectionForRemarks && Object.keys(state.sectionForRemarks).length > 0 && (
                  <div className="overall-average-badge">
                    📊 Overall Average: {calculateOverallAverage(state.sectionForRemarks) > 0 
                      ? `${calculateOverallAverage(state.sectionForRemarks)}%`
                      : 'Not Available'
                    }
                  </div>
                )}
              </div>
              <div className="course-info">
                <h2 className="course-title">
                  <span>CLINICAL DENTISTRY {year}</span>
                  <span className="course-code">{courseCode}</span>
                </h2>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Performance Overview Table */}
        {state.sectionForRemarks && Object.keys(state.sectionForRemarks).length > 0 && (
          <Card className="performance-overview-card animate-slide-in">
            <div className="performance-header">
              <h3 className="performance-title">📈 Clinical Performance Overview</h3>
            </div>
            <div className="performance-table-container">
              <Table
                dataSource={[
                  // Regular sections
                  ...Object.entries(state.sectionForRemarks)
                    .filter(([sectionKey]) => shouldDisplaySectionForYear(sectionKey, year))
                    .map(([sectionKey, sectionData]) => {
                      const average = sectionData?.average || 0;
                      const title = getSectionTitle(sectionKey);
                      
                      // Check validation status for this section
                      const tallyData = rawApiData || location.state?.tallyData || {};
                      const clinicLevel = location.state?.clinicLevel || year;
                      const validationResult = validateSectionCompletion(
                        sectionKey,
                        tallyData,
                        clinicLevel
                      );
                      
                      // Determine score class based on average
                      let scoreClass = 'score-pending';
                      if (average >= 80) scoreClass = 'score-excellent';
                      else if (average >= 70) scoreClass = 'score-good';  
                      else if (average > 0) scoreClass = 'score-poor';
                      
                      // Determine status based on signature and validation
                      let statusText = 'In Progress';
                      let statusClass = 'status-in-progress';
                      
                      if (sectionData?.status) {
                        statusText = 'Completed';
                        statusClass = 'status-completed';
                      } else if (!validationResult.isValid) {
                        statusText = 'Requirements Incomplete';
                        statusClass = 'status-blocked';
                      }
                      
                      // Check if user can sign
                      const canSign = validationResult.isValid && user?.role !== "Clinician";
                      const hasSignature = sectionData?.status;
                      
                      return {
                        key: sectionKey,
                        section: title,
                        sectionKey,
                        average,
                        scoreClass,
                        hasSignature,
                        sectionData,
                        statusText,
                        statusClass,
                        canSign,
                        validationResult,
                        type: 'section'
                      };
                    }),
                  // Clinical Chair row
                  {
                    key: 'clinical-chair',
                    section: '👨‍⚕️ Clinical Chair',
                    average: state.rating || 0,
                    scoreClass: 'score-chair',
                    hasSignature: state.clinicalChairSignature,
                    statusText: state.clinicalChairSignature && state.rating && state.date ? 'Completed' : 'In Progress',
                    statusClass: state.clinicalChairSignature && state.rating && state.date ? 'status-completed' : 'status-in-progress',
                    canSign: user?.role !== "Clinician" && user?.role !== "Clinical Instructor",
                    type: 'clinical-chair'
                  },
                  // Overall Summary row
                  {
                    key: 'overall-summary',
                    section: '🎯 OVERALL PERFORMANCE',
                    average: calculateOverallAverage(state.sectionForRemarks),
                    scoreClass: 'overall-score',
                    type: 'summary'
                  }
                ]}
                columns={[
                  {
                    title: 'Section',
                    dataIndex: 'section',
                    key: 'section',
                    width: 200,
                    render: (text, record) => (
                      <div className="section-name-cell">
                        {record.type === 'section' && !record.validationResult?.isValid && (
                          <span className="validation-icon" title={record.validationResult?.message}>
                            🚫
                          </span>
                        )}
                        <span className={record.type === 'summary' ? 'overall-section-name' : 'section-name'}>
                          {text}
                        </span>
                      </div>
                    ),
                  },
                  {
                    title: 'Average Score',
                    dataIndex: 'average',
                    key: 'average',
                    width: 140,
                    align: 'center',
                    render: (average, record) => (
                      <div className="score-cell">
                        <span className={`score-badge ${record.scoreClass}`}>
                          {record.type === 'summary' 
                            ? (average > 0 ? `${average}%` : 'Not Available')
                            : (average > 0 ? `${average}%` : 'Pending')
                          }
                        </span>
                        {record.type !== 'summary' && average > 0 && (
                          <div className="score-progress-bar">
                            <div 
                              className="score-progress-fill"
                              style={{ 
                                width: `${Math.min(average, 100)}%`,
                                backgroundColor: average >= 80 ? '#28a745' : average >= 60 ? '#ffc107' : '#dc3545'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: 'Signature Image',
                    key: 'signature',
                    width: 140,
                    align: 'center',
                    render: (_, record) => {
                      if (record.type === 'summary') {
                        return <span>-</span>;
                      }
                      
                      const signatureSource = record.type === 'clinical-chair' 
                        ? state.clinicalChairSignature 
                        : record.sectionData?.status;
                      
                      return record.hasSignature ? (
                        <div className="signature-preview-table">
                          <img
                            src={handleImageSource(signatureSource)}
                            alt={`${record.section} Signature`}
                            onClick={() => {
                              window.open(handleImageSource(signatureSource), '_blank');
                            }}
                            title="Click to view larger"
                          />
                        </div>
                      ) : (
                        <div className="signature-status no-signature">
                          No Signature
                        </div>
                      );
                    },
                  },
                  {
                    title: 'Sign By',
                    key: 'signBy',
                    width: 160,
                    render: (_, record) => {
                      if (record.type === 'summary') {
                        return <span>-</span>;
                      }
                      
                      if (record.type === 'clinical-chair') {
                        return state.clinicalInstructorName ? (
                          <div className="instructor-info">
                            <span className="instructor-name">{state.clinicalInstructorName}</span>
                            <span className="instructor-role">Clinical Chair</span>
                          </div>
                        ) : user?.name ? (
                          <div className="instructor-info">
                            <span className="instructor-name">{user.name}</span>
                            <span className="instructor-role">Current User</span>
                          </div>
                        ) : (
                          <div className="signature-status no-signature">Not Signed</div>
                        );
                      }
                      
                      return record.sectionData?.clinicalInstructorName ? (
                        <div className="instructor-info">
                          <span className="instructor-name">{record.sectionData.clinicalInstructorName}</span>
                          <span className="instructor-role">Clinical Instructor</span>
                        </div>
                      ) : (
                        <div className="signature-status no-signature">Not Signed</div>
                      );
                    },
                  },
                  {
                    title: 'Date',
                    key: 'date',
                    width: 120,
                    align: 'center',
                    render: (_, record) => {
                      if (record.type === 'summary') {
                        return <span>-</span>;
                      }
                      
                      const dateValue = record.type === 'clinical-chair' 
                        ? state.date 
                        : record.sectionData?.date;
                      
                      const hasSignature = record.type === 'clinical-chair' 
                        ? state.clinicalChairSignature 
                        : record.sectionData?.status;
                      
                      if (!hasSignature) {
                        return <span className="text-muted">Not Signed</span>;
                      }
                      
                      return dateValue ? (
                        <span className="signature-date">
                          {new Date(dateValue).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-muted">Not Signed</span>
                      );
                    },
                  },
                  {
                    title: 'Status',
                    key: 'status',
                    width: 130,
                    align: 'center',
                    render: (_, record) => {
                      if (record.type === 'summary') {
                        return <strong>CLINICAL DENTISTRY {year} - FINAL ASSESSMENT</strong>;
                      }
                      
                      return (
                        <span className={`status-badge ${record.statusClass}`}>
                          {record.statusText}
                        </span>
                      );
                    },
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 280,
                    align: 'center',
                    render: (_, record) => {
                      if (record.type === 'summary') {
                        return <span>-</span>;
                      }
                      
                      if (record.type === 'clinical-chair') {
                        // Check if all sections are signed
                        const allSectionsSigned = Object.entries(state.sectionForRemarks)
                          .filter(([sectionKey]) => shouldDisplaySectionForYear(sectionKey, year))
                          .every(([, sectionData]) => sectionData?.status);
                        
                        const hasRoleAccess = user?.role !== "Clinician" && user?.role !== "Clinical Instructor";
                        const canSignChair = hasRoleAccess && allSectionsSigned;
                        
                        return (
                          <div className="section-actions">
                            <div className="primary-actions d-flex align-items-center gap-2 mb-2">
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id="tooltip-chair-sign">
                                    {!hasRoleAccess ? 'Access denied' : 
                                     !allSectionsSigned ? 'All sections must be signed first' :
                                     state.clinicalChairSignature ? 'Update digital signature' : 'Create digital signature'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant={state.clinicalChairSignature ? "outline-primary" : "primary"}
                                  onClick={() => openSignatureModal("clinicalChairSignature")}
                                  disabled={!canSignChair}
                                >
                                  {state.clinicalChairSignature ? '✏️' : '✍️'}
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id="tooltip-chair-upload">
                                    {!hasRoleAccess ? 'Access denied' : 
                                     !allSectionsSigned ? 'All sections must be signed first' : 'Upload signature image file'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => document.getElementById(`chair-file-input`).click()}
                                  disabled={!canSignChair}
                                >
                                  📎
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id="tooltip-chair-save">
                                    {!hasRoleAccess ? 'Access denied' :
                                     !allSectionsSigned ? 'All sections must be signed first' :
                                     !state.clinicalChairSignature ? 'Sign section first' : 
                                     !state.rating ? 'Enter rating first' : 
                                     !state.date ? 'Select date first' : 'Save clinical chair evaluation'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant={state.clinicalChairSignature && state.rating && state.date && canSignChair ? "success" : "outline-secondary"}
                                  onClick={handleSubmit}
                                  disabled={!state.clinicalChairSignature || !state.rating || !state.date || !canSignChair}
                                  className="flex-grow-1"
                                >
                                  {!allSectionsSigned ? '🚫 Blocked' : 
                                   !state.clinicalChairSignature || !state.rating || !state.date ? '⏳ Pending' : '💾 Save Chair'}
                                </Button>
                              </OverlayTrigger>
                            </div>
                            
                            <input
                              id="chair-file-input"
                              type="file"
                              accept="image/*"
                              onChange={handleChairUploadSignature}
                              style={{ display: 'none' }}
                            />
                            
                            {!allSectionsSigned ? (
                              <small className="validation-message text-danger d-block">
                                All sections must be signed first
                              </small>
                            ) : (!state.clinicalChairSignature || !state.rating || !state.date) && (
                              <small className="validation-message text-warning d-block">
                                Complete all fields to save
                              </small>
                            )}
                          </div>
                        );
                      }
                      
                      // Regular section actions
                      return (
                        <div className="section-actions">
                          <div className="action-buttons-group">
                            <div className="primary-actions d-flex align-items-center gap-2 mb-2">
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id={`tooltip-${record.sectionKey}-sign`}>
                                    {!record.validationResult?.isValid ? 'Complete all requirements first' : 
                                     user?.role === "Clinician" ? 'Access denied' : 
                                     record.hasSignature ? 'Update digital signature' : 'Create digital signature'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant={record.hasSignature ? "outline-primary" : "primary"}
                                  onClick={() => openSignatureModal(record.sectionKey)}
                                  disabled={!record.canSign}
                                >
                                  {record.hasSignature ? '✏️' : '✍️'}
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id={`tooltip-${record.sectionKey}-upload`}>
                                    {!record.validationResult?.isValid ? 'Complete all requirements first' : 
                                     user?.role === "Clinician" ? 'Access denied' : 'Upload signature image file'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => document.getElementById(`${record.sectionKey}-file-input`).click()}
                                  disabled={!record.canSign}
                                >
                                  📎
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={
                                  <Tooltip id={`tooltip-${record.sectionKey}-save`}>
                                    {!record.validationResult?.isValid ? 'Complete requirements first' : 
                                     !record.hasSignature ? 'Sign section first' : 
                                     user?.role === "Clinician" ? 'Access denied' : 'Save section signature'}
                                  </Tooltip>
                                }
                              >
                                <Button
                                  size="sm"
                                  variant={record.hasSignature && record.canSign ? "success" : "outline-secondary"}
                                  onClick={() => handleSectionSave(record.sectionKey)}
                                  disabled={!record.canSign || !record.hasSignature}
                                  className="flex-grow-1"
                                >
                                  {!record.validationResult?.isValid ? '🚫 Blocked' : record.hasSignature && record.canSign ? '💾 Save' : record.hasSignature ? '✅ Signed' : '⏳ Pending'}
                                </Button>
                              </OverlayTrigger>
                            </div>
                            
                            <input
                              id={`${record.sectionKey}-file-input`}
                              type="file"
                              accept="image/*"
                              onChange={handleUploadSignature(record.sectionKey)}
                              style={{ display: 'none' }}
                            />
                            
                            {!record.validationResult?.isValid && (
                              <small className="validation-message text-danger d-block">
                                Complete requirements first
                              </small>
                            )}
                          </div>
                        </div>
                      );
                    },
                  },
                ]}
                rowKey="key"
                pagination={false}
                size="middle"
                className="performance-table-antd"
                rowClassName={(record) => {
                  if (record.type === 'summary') return 'overall-summary-row';
                  if (record.type === 'clinical-chair') return 'clinical-chair-row';
                  if (record.sectionKey === 'revalida') return 'revalida-row';
                  return '';
                }}
              />
            </div>
          </Card>
        )}

        {/* Signature Modal */}
        <RemarksModal
          state={state}
          dispatch={dispatch}
          title={
            state.currentSignatureField
              ? `✍️ ${getSectionTitle(state.currentSignatureField)} Signature`
              : "Digital Signature"
          }
        />
        
        </div> {/* End main content wrapper */}
      </div>
    </div>
  );
};

export default Remarks;