import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DentalModel from "../Custom Hooks/DentalModel";
import {
  NavigationProvider,
  useNavigation,
} from "../Custom Hooks/NavigationProvider";
import "./Styles/DentalChart.css";
import axios from "axios";
import { useParams } from "react-router";
import ChartTypeSelector from "../Custom Hooks/ChartTypeSelector";
import { useNavigate } from "react-router";
import { API_URL } from "../../config/api";
import TitleHead from "../Custom Hooks/TitleHead";

const CameraControls = ({
  horizontalRotation,
  verticalRotation,
  zoomLevel,
  resetTrigger,
  setHorizontalRotation,
  setVerticalRotation,
}) => {
  const { camera } = useThree();
  const resetOnce = useRef(false);

  // Original camera position
  const originalPosition = useRef([0, 2, 5]);

  useFrame(() => {
    if (resetTrigger && !resetOnce.current) {
      // Reset to the original position
      camera.position.set(...originalPosition.current);
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      resetOnce.current = true;
      return;
    } else if (!resetTrigger) {
      resetOnce.current = false;
    }

    camera.position.x = zoomLevel * Math.sin(horizontalRotation);
    camera.position.z = zoomLevel * Math.cos(horizontalRotation);
    camera.position.y = zoomLevel * Math.sin(verticalRotation);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  return null;
};

const OrbitCameraControls = ({ resetTrigger }) => {
  const { camera, gl } = useThree();
  const controls = useRef();
  const prevReset = useRef(false);

  useEffect(() => {
    if (resetTrigger && !prevReset.current) {
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);
      controls.current?.reset();
    }
    prevReset.current = resetTrigger;
  }, [resetTrigger, camera]);

  return <OrbitControls ref={controls} />;
};

const ME_DentalChart = () => {
  const { id = "" } = useParams();
  TitleHead("Medical Dental Chart");
  //Navigation context
  const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } =
    useNavigation();

  // Add state for Molarbear recommendations
  const [recommendations, setRecommendations] = useState(null);
  const [showRecommendationsModal, setShowRecommendationsModal] =
    useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  // Add this state to your ME_DentalChart component
  const [modelType, setModelType] = useState("adult"); // 'adult' or 'pediatric'
  const [showModelModal, setShowModelModal] = useState(false);

  // State for tracking tooth parts and their colors/conditions
  const [partColors, setPartColors] = useState({});

  // New state for tracking selected teeth for submission
  const [selectedTeeth, setSelectedTeeth] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});

  // State for diagnosis modal
  const [showDiagnoseModal, setShowDiagnoseModal] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({
    toothId: null,
    surface: null,
    diagnosis: "",
  });

  // State for storing diagnoses
  const [diagnoses, setDiagnoses] = useState({});

  const [isVisible, setIsVisible] = useState({
    Tongue: true,
    Back: true,
  });

  //STATE FOR DENTAL CHART
  const [dentalNotes, setDentalNotes] = useState("");
  const [horizontalRotation, setHorizontalRotation] = useState(0);
  const [verticalRotation, setVerticalRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [resetCamera, setResetCamera] = useState(false);
  const [useMouseControl, setUseMouseControl] = useState(false);
  const [hoveredTooth, setHoveredTooth] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [beforeAfterView, setBeforeAfterView] = useState(null); // 'before', 'after', or null
  const [beforeData, setBeforeData] = useState({}); // Store the "before" dental chart data
  const [afterData, setAfterData] = useState({}); // Store the "after" dental chart data
  const [beforeDate, setBeforeDate] = useState("");
  const [afterDate, setAfterDate] = useState("");
  const [chartType, setChartType] = useState("initial");
  const [confirmedChartData, setConfirmedChartData] = React.useState(null);
  const [currentData, setCurrentData] = useState({}); // Store current dental chart data

  // State for showing confirmation feedback
  const [showConfirmation, setShowConfirmation] = useState(false);

  // New state for selected color mode
  const [colorMode, setColorMode] = useState(1); // 1 = red, 2 = blue

  // Diagnosis options
  const diagnosisOptions = {
    red: [
      { value: "C", label: "C - Caries" },
      { value: "F", label: "F - Fractured" },
      { value: "Imp", label: "Imp - Impacted" },
      { value: "MR", label: "MR - Missing Restoration" },
      { value: "RC", label: "RC - Recurrent Caries" },
      { value: "RF", label: "RF - Root Fragment" },
      { value: "X", label: "X - Extraction due to Caries" },
      { value: "XO", label: "XO - Extraction due to Other Causes" },
    ],
    blue: [
      { value: "Ab", label: "Ab - Abutment" },
      { value: "Am", label: "Am - Amalgam" },
      { value: "APC", label: "APC - All Porcelain Crown" },
      { value: "Co", label: "Co - Composite" },
      { value: "CD", label: "CD - Complete Denture" },
      { value: "GC", label: "GC - Gold Crown" },
      { value: "Gl", label: "Gl - Glass Ionomer" },
      { value: "In", label: "In - Inlay" },
      { value: "M", label: "M - Missing" },
      { value: "MC", label: "MC - Metal Crown" },
      { value: "P", label: "P - Pontic" },
      { value: "PFG", label: "PFG - Porcelain Fused to Gold" },
      { value: "PFM", label: "PFM - Porcelain Fused to Metal" },
      { value: "PFS", label: "PFS - Pit and Fissure Sealant" },
      { value: "RPD", label: "RPD - Removable Partial Denture" },
      { value: "SS", label: "SS - Stainless Steel Crown" },
      { value: "TF", label: "TF - Temporary Filling" },
      { value: "Un", label: "Un - Unerupted" },
    ],
  };

  const hInterval = useRef(null);
  const vInterval = useRef(null);

  // Function to handle model change
  const handleModelChange = (type) => {
    setModelType(type);
    setShowModelModal(false);

    // Reset views and selections when changing models
    resetCameraPosition();
    handleClearAll();
  };

  // Rotation functions
  const startRotation = (axis, dir) => {
    if (axis === "horizontal" && !hInterval.current) {
      hInterval.current = setInterval(() => {
        setHorizontalRotation((prev) => prev + dir * 0.02);
      }, 16);
    } else if (axis === "vertical" && !vInterval.current) {
      vInterval.current = setInterval(() => {
        setVerticalRotation((prev) => prev + dir * 0.02);
      }, 16);
    }
  };

  const stopRotation = (axis) => {
    if (axis === "horizontal") {
      clearInterval(hInterval.current);
      hInterval.current = null;
    } else if (axis === "vertical") {
      clearInterval(vInterval.current);
      vInterval.current = null;
    }
  };

  const handleZoomChange = (e) => {
    let newZoomLevel = parseFloat(e.target.value);
    newZoomLevel = Math.min(Math.max(newZoomLevel, 1), 10);
    setZoomLevel(newZoomLevel);
  };

  const resetCameraPosition = () => {
    setResetCamera(true);
    setHorizontalRotation(0); // reset horizontal rotation
    setVerticalRotation(0); // reset vertical rotation
    setZoomLevel(5); // default zoom
    setTimeout(() => setResetCamera(false), 100);
  };

  // Toggle color mode function
  const toggleColorMode = () => {
    setColorMode((prevMode) => (prevMode === 1 ? 2 : 1));
  };
  const fetchTreatmentRecommendations = async () => {
    if (!id) return;

    setIsLoadingRecommendations(true);
    try {
      const response = await axios.get(
        `${API_URL}/molarbear/treatment/${id}/chart/`
      );
      setRecommendations(response.data.data);
      setShowRecommendationsModal(true);
    } catch (error) {
      console.error("Error fetching treatment recommendations:", error);
      alert("Please Fill up the Dental Chart First. Please try again.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  // Enhanced handleSelect to use the selected color mode
  const handleSelect = (part) => {
    // Skip if this is not a tooth part
    if (!part.startsWith("T")) return;

    setPartColors((prev) => {
      const currentState = prev[part] || 0;
      let nextState;

      // If the part is already colored, clicking will clear it (toggle off)
      if (currentState > 0) {
        nextState = 0;
      } else {
        // Otherwise, apply the currently selected color mode
        nextState = colorMode;
      }

      // Extract tooth number and surface from part name
      const [toothId, surface] = part.replace("T", "").split("_");

      // If selecting a tooth part (not deselecting), open diagnosis modal
      if (nextState > 0) {
        // Delay diagnosis modal to allow color change to be visible first
        setTimeout(() => {
          setDiagnosisData({
            toothId,
            surface,
            diagnosis: "",
            colorState: nextState, // 1 = red, 2 = blue
          });
          setShowDiagnoseModal(true);
        }, 100);
      } else {
        // If deselecting, remove diagnosis
        setDiagnoses((prev) => {
          const updatedDiagnoses = { ...prev };
          if (updatedDiagnoses[toothId] && updatedDiagnoses[toothId][surface]) {
            const updatedTooth = { ...updatedDiagnoses[toothId] };
            delete updatedTooth[surface];

            if (Object.keys(updatedTooth).length === 0) {
              delete updatedDiagnoses[toothId];
            } else {
              updatedDiagnoses[toothId] = updatedTooth;
            }
          }
          return updatedDiagnoses;
        });

        // Also remove from selectedTeeth
        setSelectedTeeth((prev) => {
          const updatedTeeth = { ...prev };
          if (updatedTeeth[toothId]) {
            const updatedTooth = { ...updatedTeeth[toothId] };
            delete updatedTooth[surface];

            if (Object.keys(updatedTooth).length === 0) {
              delete updatedTeeth[toothId];
            } else {
              updatedTeeth[toothId] = updatedTooth;
            }
          }
          return updatedTeeth;
        });
      }

      return {
        ...prev,
        [part]: nextState,
      };
    });
  };

  const getColor = (part) => {
    const state = partColors[part] || 0;
    if (state === 1) return "red";
    if (state === 2) return "blue";
    return "white";
  };

  const handleCancelDiagnosis = () => {
    // Extract tooth part identifier from the diagnosis data
    const { toothId, surface } = diagnosisData;
    const partId = `T${toothId}_${surface}`;

    // Reset the color for this specific part
    setPartColors((prev) => ({
      ...prev,
      [partId]: 0, // Set color state back to 0 (white/unselected)
    }));

    // Close the modal
    setShowDiagnoseModal(false);
  };

  const toggleVisibility = () => {
    setIsVisible((prevState) => ({
      Tongue: !prevState.Tongue,
      Back: !prevState.Back,
    }));
  };

  const toggleControlMode = () => {
    setUseMouseControl((prev) => !prev);
  };

  // Function to handle diagnosis selection
  const handleDiagnosisChange = (e) => {
    setDiagnosisData((prev) => ({
      ...prev,
      diagnosis: e.target.value,
    }));
  };

  // Function to save diagnosis
  const handleSaveDiagnosis = () => {
    const { toothId, surface, diagnosis, colorState } = diagnosisData;

    if (!diagnosis) {
      alert("Please select a diagnosis");
      return;
    }

    // Save diagnosis
    setDiagnoses((prev) => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [surface]: {
          diagnosis,
          colorState, // 1 = red, 2 = blue
        },
      },
    }));

    // Also update selectedTeeth to match the diagnosis
    setSelectedTeeth((prev) => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [surface]: colorState === 1 ? "caries" : "filling", // For backward compatibility
      },
    }));

    setShowDiagnoseModal(false);
  };

  // Function to submit selected teeth to backend
  const handleConfirmSelection = () => {
    // Group teeth by treatment type for easier display
    const treatmentGroups = {
      red: [],
      blue: [],
    };

    // Process the data for the modal using diagnoses
    Object.entries(diagnoses).forEach(([toothId, surfaces]) => {
      Object.entries(surfaces).forEach(([surface, details]) => {
        const { diagnosis, colorState } = details;
        const color = colorState === 1 ? "red" : "blue";

        treatmentGroups[color].push({
          toothId,
          surface,
          diagnosis,
        });
      });
    });

    // Format the data for display
    setModalData({
      treatmentGroups,
      totalTeeth: Object.keys(selectedTeeth).length,
      timestamp: new Date().toLocaleString(),
    });

    // Show the modal
    setShowModal(true);
  };

  // Function to fetch historical dental charts for before/after comparison
  const fetchHistoricalDentalCharts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/${id}/get/dentalChartHistory`
      );

      if (
        response.data &&
        response.data.charts &&
        response.data.charts.length > 0
      ) {
        // Sort charts by date to get chronological order
        const sortedCharts = response.data.charts.sort(
          (a, b) => new Date(a.chartDate) - new Date(b.chartDate)
        );

        // Use first chart as "before" (initial)
        const initialChart = sortedCharts[0];
        setBeforeData(initialChart);
        setBeforeDate(new Date(initialChart.chartDate).toLocaleDateString());

        // Convert current state to chart format for "after"
        const currentChart = {
          teeth: diagnoses,
          chartType: "current",
          chartDate: new Date().toISOString(),
          overallNotes: dentalNotes || "Current progress",
        };

        setAfterData(currentChart);
        setAfterDate("Current Progress");
        setCurrentData(currentChart);

        setBeforeAfterView(null);
      } else {
        // No historical data - show empty before and current state as after
        setBeforeData({});
        setBeforeDate("No previous data");

        const currentChart = {
          teeth: diagnoses,
          chartType: "current",
          chartDate: new Date().toISOString(),
          overallNotes: dentalNotes || "Current progress",
        };

        setAfterData(currentChart);
        setAfterDate("Current Progress");
        setCurrentData(currentChart);
      }
    } catch (error) {
      console.error("Error fetching dental chart history:", error);
      // Show current state even if fetch fails
      const currentChart = {
        teeth: diagnoses,
        chartType: "current",
        chartDate: new Date().toISOString(),
        overallNotes: dentalNotes || "Current progress",
      };

      setBeforeData({});
      setBeforeDate("No data available");
      setAfterData(currentChart);
      setAfterDate("Current Progress");
      setCurrentData(currentChart);
    }
  };

  // Function to fetch teeth data from the backend for display
  const fetchTeethData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/${id}/get/dentalChart`
      );

      console.log("Fetched dental chart:", response.data);

      // Check if we got valid data with teeth structure
      if (!response.data || !response.data.teeth) {
        throw new Error("Invalid dental chart data structure");
      }

      // Transform the teeth object into the format your UI expects
      const groupedData = {};
      const newPartColors = {}; // New object for part colors

      // Iterate through each tooth in the teeth object
      Object.entries(response.data.teeth).forEach(([toothId, surfaces]) => {
        groupedData[toothId] = {};

        // Iterate through each surface of the tooth
        Object.entries(surfaces).forEach(([surface, data]) => {
          groupedData[toothId][surface] = {
            diagnosis: data.diagnosis,
            colorState: data.colorState,
          };

          // Create the part identifier in the format your component expects
          const partId = `T${toothId}_${surface}`;
          // Store the color state in the partColors object
          newPartColors[partId] = data.colorState;
        });
      });

      console.log("Processed teeth data:", groupedData);
      console.log("Part colors:", newPartColors);

      // Update your states
      setDiagnoses(groupedData);
      setSelectedTeeth(groupedData);
      setPartColors(newPartColors); // Add this line to update part colors

      // If you're using the dentalChart hook, update that too
      if (updateDentalChart) {
        updateDentalChart({
          ...response.data,
          lastModified: new Date(),
        });
      }
    } catch (error) {
      console.error("Error fetching teeth data:", error);
      // Consider adding user feedback here, e.g.:
      // setError('Failed to load dental chart data');
    }
  };

  // End of Function to fetch teeth data from the backend for display

  useEffect(() => {
    fetchTeethData();
  }, []);

  // Function to clear all selections
  const handleClearAll = () => {
    setPartColors({});
    setSelectedTeeth({});
    setDiagnoses({});
  };

  // Count selected teeth to determine if we should show the confirm button
  const selectedTeethCount = Object.keys(selectedTeeth).length;

  // Helper function to get diagnosis display text
  const getDiagnosisText = (diagnosis) => {
    const redOption = diagnosisOptions.red.find(
      (opt) => opt.value === diagnosis
    );
    if (redOption) return redOption.label;

    const blueOption = diagnosisOptions.blue.find(
      (opt) => opt.value === diagnosis
    );
    if (blueOption) return blueOption.label;

    return diagnosis;
  };

  const handleSaveChart = async () => {
    console.log("Submitting chart for patientID:", id);
    const teethData = {
      patientID: id,
      date: new Date().toISOString(),
      selected_teeth: selectedTeeth,
      diagnoses: diagnoses,
      overallNotes: dentalNotes,
      chartType: chartType,
    };

    try {
      const url =
        chartType === "initial"
          ? `${API_URL}/patient/${id}/create/dentalChart`
          : chartType === "followup"
          ? `${API_URL}/patient/${id}/create/finalDentalChart`
          : null;

      const response = await axios.post(url, teethData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = response.data;

      // Create a shallow copy to remove unwanted fields from the saved chart
      const filteredData = { ...data.data };

      delete filteredData.chartDate;
      delete filteredData.createdAt;
      delete filteredData.lastModified;
      delete filteredData.updatedAt;

      console.log("Dental Chart Data (filtered):", filteredData);

      const savedChart = data.data;

      // Assume you want to close modal and show confirmation here like in handleFinalConfirmation
      setShowModal(false);
      setConfirmedChartData(savedChart);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Error saving dental chart:", error);
    }
  };

  return (
    <div className="main-content-dental">
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          paddingRight: "20rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontWeight: "bold",
            color: "#007bff",
          }}
        >
          {hoveredTooth
            ? ` ${hoveredTooth}`
            : "Hover over a tooth to see its name"}
        </div>

        {/* Color mode indicator */}
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            padding: "5px",
            backgroundColor: colorMode === 1 ? "#fff2f2" : "#f2f5ff",
            border: `2px solid ${colorMode === 1 ? "red" : "blue"}`,
            borderRadius: "5px",
            width: "200px",
            margin: "10px auto",
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              color: colorMode === 1 ? "red" : "blue",
            }}
          >
            {colorMode === 1 ? " CARRIES/DEFECT" : "RESTORATIONS"}
          </span>
        </div>

        <Canvas camera={{ position: [0, 2, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} />
          <DentalModel
            onSelect={handleSelect}
            getColor={getColor}
            isVisible={isVisible}
            setHoveredTooth={setHoveredTooth}
            modelType={modelType} // Pass the model type to the DentalModel component
          />
          {useMouseControl ? (
            <OrbitCameraControls resetTrigger={resetCamera} />
          ) : (
            <CameraControls
              horizontalRotation={horizontalRotation}
              verticalRotation={verticalRotation}
              zoomLevel={zoomLevel}
              resetTrigger={resetCamera}
              setHorizontalRotation={setHorizontalRotation}
              setVerticalRotation={setVerticalRotation}
            />
          )}
        </Canvas>

        <div className="controls-panel">
          <div className="back-button-container">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              Return to previous
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={handleClearAll} className="model-switch-button">
              Clear All
            </button>
            <button onClick={toggleVisibility} className="model-switch-button">
              Toggle Tongue
            </button>
            <button
              onClick={resetCameraPosition}
              className="model-switch-button"
            >
              🔄 Reset View
            </button>
            <button
              onClick={fetchTreatmentRecommendations}
              className="model-switch-button"
              disabled={isLoadingRecommendations}
            >
              {isLoadingRecommendations ? "Loading..." : "Molarbear AI"}
            </button>
          </div>

          {/* Confirmation button - only show when there are selections */}
          {selectedTeethCount > 0 && (
            <button onClick={handleConfirmSelection} className="confirm-button">
              Confirm Selection ({selectedTeethCount} teeth)
            </button>
          )}
        </div>

        {/* Confirmation message */}
        {showConfirmation && (
          <div className="confirmation-message">
            Selection confirmed and sent to backend!
          </div>
        )}
        {showRecommendationsModal && recommendations && (
          <div className="modal-overlay">
            <div className="modal-content large-modal recommendations-modal">
              <h2>Molarbear AI Treatment Recommendations</h2>

              {/* Disclaimer box with styling */}
              <div
                style={{
                  backgroundColor: "#fff9e6",
                  border: "1px solid #ffd966",
                  borderRadius: "6px",
                  padding: "12px 15px",
                  margin: "0 0 20px 0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#f9a825", fontSize: "20px" }}
                >
                  info
                </span>
                <div>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      color: "#5c4500",
                    }}
                  >
                    DISCLAIMER
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "0.85rem",
                      lineHeight: "1.4",
                      color: "#5c4500",
                    }}
                  >
                    These recommendations are generated by an AI system and are
                    intended for educational purposes only. They should not
                    replace professional clinical judgment. Always consult with
                    qualified dental professionals before making treatment
                    decisions. Treatment recommendations may require
                    modification based on the patient's complete medical
                    history, clinical examination findings, and other factors
                    not fully captured in the dental chart.
                  </p>
                </div>
              </div>

              <div className="recommendations-content">
                <h3>Treatment Recommendations</h3>
                <div className="recommendations-list">
                  {recommendations.treatmentRecommendations.map(
                    (rec, index) => (
                      <div
                        key={`rec-${index}`}
                        className={`recommendation priority-${rec.priority.toLowerCase()}`}
                      >
                        <div className="priority-badge">{rec.priority}</div>
                        <h4>{rec.treatment}</h4>
                        <p>
                          <strong>Rationale:</strong> {rec.rationale}
                        </p>
                        {rec.targetTeeth && rec.targetTeeth.length > 0 && (
                          <p>
                            <strong>Target Teeth:</strong>{" "}
                            {rec.targetTeeth.join(", ")}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>

                <h3>Equipment Needed</h3>
                <div className="equipment-list">
                  {recommendations.equipmentNeeded.map((category, idx) => (
                    <div
                      key={`equipment-${idx}`}
                      className="equipment-category"
                    >
                      <h4>{category.category}</h4>
                      <ul>
                        {category.items.map((item, itemIdx) => (
                          <li key={`item-${idx}-${itemIdx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h3>Expected Outcomes</h3>
                <div className="outcomes-section">
                  <div className="outcome-column">
                    <h4>Short Term</h4>
                    <ul>
                      {recommendations.expectedOutcomes.shortTerm.map(
                        (outcome, idx) => (
                          <li key={`st-${idx}`}>{outcome}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="outcome-column">
                    <h4>Long Term</h4>
                    <ul>
                      {recommendations.expectedOutcomes.longTerm.map(
                        (outcome, idx) => (
                          <li key={`lt-${idx}`}>{outcome}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <h3>Timeline</h3>
                <p>{recommendations.timeline}</p>

                <h3>Special Considerations</h3>
                <ul className="special-considerations">
                  {recommendations.specialConsiderations.map(
                    (consideration, idx) => (
                      <li key={`consideration-${idx}`}>{consideration}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowRecommendationsModal(false)}
                  className="confirm-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="controls-wrapper">
          {/* D-pad container with modified buttons */}
          <div className="dpad-container">
            <button
              onMouseDown={() => startRotation("vertical", 1)}
              onMouseUp={() => stopRotation("vertical")}
              onMouseLeave={() => stopRotation("vertical")}
              className={`dpad-button dpad-up ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>

            <button
              onMouseDown={() => startRotation("vertical", -1)}
              onMouseUp={() => stopRotation("vertical")}
              onMouseLeave={() => stopRotation("vertical")}
              className={`dpad-button dpad-down ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">arrow_downward</span>
            </button>

            <button
              onMouseDown={() => startRotation("horizontal", -1)}
              onMouseUp={() => stopRotation("horizontal")}
              onMouseLeave={() => stopRotation("horizontal")}
              className={`dpad-button dpad-left ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <button
              onMouseDown={() => startRotation("horizontal", 1)}
              onMouseUp={() => stopRotation("horizontal")}
              onMouseLeave={() => stopRotation("horizontal")}
              className={`dpad-button dpad-right ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <button
              onMouseDown={() => {
                startRotation("horizontal", -1);
                startRotation("vertical", 1);
              }}
              onMouseUp={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              onMouseLeave={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              className={`dpad-button dpad-up-left ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">north_west</span>
            </button>

            <button
              onMouseDown={() => {
                startRotation("horizontal", 1);
                startRotation("vertical", 1);
              }}
              onMouseUp={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              onMouseLeave={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              className={`dpad-button dpad-up-right ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">north_east</span>
            </button>

            <button
              onClick={toggleControlMode}
              className={`dpad-button ${useMouseControl ? "active-mode" : ""}`}
            >
              <span className="material-symbols-outlined">
                {useMouseControl ? "gamepad" : "pan_tool"}
              </span>
            </button>

            <button
              onMouseDown={() => {
                startRotation("horizontal", -1);
                startRotation("vertical", -1);
              }}
              onMouseUp={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              onMouseLeave={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              className={`dpad-button dpad-down-left ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">south_west</span>
            </button>

            <button
              onMouseDown={() => {
                startRotation("horizontal", 1);
                startRotation("vertical", -1);
              }}
              onMouseUp={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              onMouseLeave={() => {
                stopRotation("horizontal");
                stopRotation("vertical");
              }}
              className={`dpad-button dpad-down-right ${
                useMouseControl ? "disabled-button" : ""
              }`}
              disabled={useMouseControl}
            >
              <span className="material-symbols-outlined">south_east</span>
            </button>

            {/* Color Mode Toggle Button - unchanged */}
            <button
              onClick={toggleColorMode}
              className="dpad-button color-mode-button"
              style={{
                backgroundColor: colorMode === 1 ? "#ffeeee" : "#eeeeff",
                border: `2px solid ${colorMode === 1 ? "red" : "blue"}`,
                position: "absolute",
                bottom: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: colorMode === 1 ? "red" : "blue" }}
              >
                ink_marker
              </span>
              <span style={{ color: colorMode === 1 ? "red" : "blue" }}>
                {colorMode === 1 ? "RED" : "BLUE"}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="zoom-controls">
        {/* Add the model switch button */}
        <button
          onClick={() => setShowModelModal(true)}
          className="model-switch-button"
        >
          <span className="material-symbols-outlined">dentistry</span>
          {modelType === "adult" ? "Change Model" : "Change Model"}
        </button>

        <div className="zoom-slider-wrapper">
          <input
            type="range"
            min="1"
            max="10"
            step="0.01"
            value={zoomLevel}
            onChange={handleZoomChange}
            className="zoom-slider"
          />
          <span>{zoomLevel.toFixed(2)}x</span>
        </div>
      </div>

      {/* Debug panel to show diagnoses (optional) */}
      {Object.keys(diagnoses).length > 0 && (
        <div className="debug-panel">
          <h4>Diagnoses</h4>
          <pre>{JSON.stringify(diagnoses, null, 2)}</pre>
        </div>
      )}

      {showDiagnoseModal && (
        <div className="modal-overlay">
          <div className="modal-content diagnose-modal">
            <h2>Diagnose Tooth</h2>

            <div className="diagnosis-info">
              <p>
                <strong>Tooth:</strong> {diagnosisData.toothId}
              </p>
              <p>
                <strong>Surface:</strong>{" "}
                {diagnosisData.surface.charAt(0).toUpperCase() +
                  diagnosisData.surface.slice(1)}
              </p>
              <p>
                <strong>Condition:</strong>{" "}
                {diagnosisData.colorState === 1
                  ? "Carries/Defects"
                  : "Restorations"}
              </p>
            </div>

            <div className="diagnosis-selection">
              <label htmlFor="diagnosis-select">Select Diagnosis:</label>
              <select
                id="diagnosis-select"
                value={diagnosisData.diagnosis}
                onChange={handleDiagnosisChange}
                className="diagnosis-dropdown"
              >
                <option value="">-- Select a diagnosis --</option>
                {diagnosisData.colorState === 1 ? (
                  <>
                    <optgroup label="Red Conditions">
                      {diagnosisOptions.red.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <>
                    <optgroup label="Blue Conditions">
                      {diagnosisOptions.blue.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={handleCancelDiagnosis} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSaveDiagnosis} className="confirm-button">
                Save Diagnosis
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <h2>Diagnosis</h2>

            <div className="treatment-summary">
              <p>
                <strong>Total Teeth Selected:</strong> {modalData.totalTeeth}
              </p>
              <p>
                <strong>Date:</strong> {modalData.timestamp}
              </p>

              {modalData.treatmentGroups.red &&
                modalData.treatmentGroups.red.length > 0 && (
                  <div className="treatment-group caries">
                    <h3>CARRIES/DEFECTS</h3>
                    <ul>
                      {modalData.treatmentGroups.red.map((item, index) => (
                        <li key={`red-${index}`}>
                          Tooth {item.toothId} -{" "}
                          {item.surface.charAt(0).toUpperCase() +
                            item.surface.slice(1)}{" "}
                          Surface: {getDiagnosisText(item.diagnosis)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {modalData.treatmentGroups.blue &&
                modalData.treatmentGroups.blue.length > 0 && (
                  <div className="treatment-group filling">
                    <h3>RESTORATIONS</h3>
                    <ul>
                      {modalData.treatmentGroups.blue.map((item, index) => (
                        <li key={`blue-${index}`}>
                          Tooth {item.toothId} -{" "}
                          {item.surface.charAt(0).toUpperCase() +
                            item.surface.slice(1)}{" "}
                          Surface: {getDiagnosisText(item.diagnosis)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="notes-section">
              <ChartTypeSelector
                chartType={chartType}
                setChartType={setChartType}
              />

              <h3>Clinical Notes</h3>

              {/* Only show textarea if there are no confirmed notes */}
              {!confirmedChartData?.overallNotes ? (
                <textarea
                  value={dentalNotes}
                  onChange={(e) => setDentalNotes(e.target.value)}
                  placeholder="Add any clinical notes or observations here..."
                  className="dental-notes-input"
                  rows={5}
                />
              ) : (
                <p className="confirmed-notes">
                  {confirmedChartData.overallNotes}
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChart}
                className="confirm-button modal-confirm"
              >
                Confirm and Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="modal-overlay">
          <div className="modal-content model-select-modal">
            <h2>Select Dental Model</h2>

            <div className="model-options">
              <div
                className={`model-option ${
                  modelType === "adult" ? "selected" : ""
                }`}
                onClick={() => handleModelChange("adult")}
              >
                <div className="model-preview adult-preview"></div>
                <h3>Adult Model</h3>
                <p>Full adult dentition (28-32 teeth)</p>
              </div>

              <div
                className={`model-option ${
                  modelType === "pediatric" ? "selected" : ""
                }`}
                onClick={() => handleModelChange("pediatric")}
              >
                <div className="model-preview pediatric-preview"></div>
                <h3>Pediatric Model</h3>
                <p>Primary dentition (20 teeth)</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModelModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ME_DentalChart;
