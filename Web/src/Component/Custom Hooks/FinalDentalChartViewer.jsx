import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DentalModel from './DentalModel';
import '../Views/Styles/DentalChartViewer.css';

const teethConfig = {
  // Set of all interactive parts for better management
  interactiveParts: new Set([
    // Occlusal parts
    "T38_occlusal", "T37_occlusal", "T36_occlusal", "T35_occlusal", "T34_occlusal",
    "T48_occlusal", "T47_occlusal", "T46_occlusal", "T45_occlusal", "T44_occlusal",
    "T28_occlusal", "T27_occlusal", "T26_occlusal", "T25_occlusal", "T24_occlusal",
    "T18_occlusal", "T17_occlusal", "T16_occlusal", "T15_occlusal", "T14_occlusal",

    // Buccal parts
    "T38_buccal", "T37_buccal", "T36_buccal", "T35_buccal", "T34_buccal",
    "T48_buccal", "T47_buccal", "T46_buccal", "T45_buccal", "T44_buccal",
    "T28_buccal", "T27_buccal", "T26_buccal", "T25_buccal", "T24_buccal",
    "T18_buccal", "T17_buccal", "T16_buccal", "T15_buccal", "T14_buccal",

    // Distal parts
    "T38_distal", "T37_distal", "T36_distal", "T35_distal", "T34_distal",
    "T48_distal", "T47_distal", "T46_distal", "T45_distal", "T44_distal",
    "T28_distal", "T27_distal", "T26_distal", "T25_distal", "T24_distal",
    "T18_distal", "T17_distal", "T16_distal", "T15_distal", "T14_distal",

    // Mesial parts
    "T38_mesial", "T37_mesial", "T36_mesial", "T35_mesial", "T34_mesial",
    "T48_mesial", "T47_mesial", "T46_mesial", "T45_mesial", "T44_mesial",
    "T28_mesial", "T27_mesial", "T26_mesial", "T25_mesial", "T24_mesial",
    "T18_mesial", "T17_mesial", "T16_mesial", "T15_mesial", "T14_mesial",

    // Lingual parts
    "T38_lingual", "T37_lingual", "T36_lingual", "T35_lingual", "T34_lingual",
    "T48_lingual", "T47_lingual", "T46_lingual", "T45_lingual", "T44_lingual",
    "T28_lingual", "T27_lingual", "T26_lingual", "T25_lingual", "T24_lingual",
    "T18_lingual", "T17_lingual", "T16_lingual", "T15_lingual", "T14_lingual",

    // Labial parts (and matching lingual, mesial, distal, incisal)
    "T13_labial", "T12_labial", "T11_labial",
    "T43_labial", "T42_labial", "T41_labial",
    "T31_labial", "T32_labial", "T33_labial",
    "T21_labial", "T22_labial", "T23_labial",

    "T13_lingual", "T12_lingual", "T11_lingual",
    "T43_lingual", "T42_lingual", "T41_lingual",
    "T31_lingual", "T32_lingual", "T33_lingual",
    "T21_lingual", "T22_lingual", "T23_lingual",

    "T13_mesial", "T12_mesial", "T11_mesial",
    "T43_mesial", "T42_mesial", "T41_mesial",
    "T31_mesial", "T32_mesial", "T33_mesial",
    "T21_mesial", "T22_mesial", "T23_mesial",

    "T13_distal", "T12_distal", "T11_distal",
    "T43_distal", "T42_distal", "T41_distal",
    "T31_distal", "T32_distal", "T33_distal",
    "T21_distal", "T22_distal", "T23_distal",

    // Incisal parts
    "T13_incisal", "T12_incisal", "T11_incisal",
    "T43_incisal", "T42_incisal", "T41_incisal",
    "T31_incisal", "T32_incisal", "T33_incisal",
    "T21_incisal", "T22_incisal", "T23_incisal",

    // Additional parts for the Pediatric model
    "T51_labial", "T51_lingual", "T51_mesial", "T51_distal", "T51_incisal",
    "T52_labial", "T52_lingual", "T52_mesial", "T52_distal", "T52_incisal",
    "T53_labial", "T53_lingual", "T53_mesial", "T53_distal", "T53_incisal",
    "T54_buccal", "T54_lingual", "T54_mesial", "T54_distal", "T54_occlusal",
    "T55_buccal", "T55_lingual", "T55_mesial", "T55_distal", "T55_occlusal",

    "T61_labial", "T61_lingual", "T61_mesial", "T61_distal", "T61_incisal",
    "T62_labial", "T62_lingual", "T62_mesial", "T62_distal", "T62_incisal",
    "T63_labial", "T63_lingual", "T63_mesial", "T63_distal", "T63_incisal",
    "T64_buccal", "T64_lingual", "T64_mesial", "T64_distal", "T64_occlusal",
    "T65_buccal", "T65_lingual", "T65_mesial", "T65_distal", "T65_occlusal",

    "T71_labial", "T71_lingual", "T71_mesial", "T71_distal", "T71_incisal",
    "T72_labial", "T72_lingual", "T72_mesial", "T72_distal", "T72_incisal",
    "T73_labial", "T73_lingual", "T73_mesial", "T73_distal", "T73_incisal",
    "T74_buccal", "T74_lingual", "T74_mesial", "T74_distal", "T74_occlusal",
    "T75_buccal", "T75_lingual", "T75_mesial", "T75_distal", "T75_occlusal",

    "T81_labial", "T81_lingual", "T81_mesial", "T81_distal", "T81_incisal",
    "T82_labial", "T82_lingual", "T82_mesial", "T82_distal", "T82_incisal",
    "T83_labial", "T83_lingual", "T83_mesial", "T83_distal", "T83_incisal",
    "T84_buccal", "T84_lingual", "T84_mesial", "T84_distal", "T84_occlusal",
    "T85_buccal", "T85_lingual", "T85_mesial", "T85_distal", "T85_occlusal",

  ]),
  
  // Default visibility settings
  defaultVisibility: {
    Tongue: true,
    Throat: true
  }
};

const IntegratedDentalChartViewer = ({ dentalChartData, finalChartData }) => {
  const [partColors, setPartColors] = useState({});
  const [hoveredTooth, setHoveredTooth] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState({ Tongue: true });
  const [modelType, setModelType] = useState('adult');
  const [showModelModal, setShowModelModal] = useState(false);

  const [initialPartColors, setInitialPartColors] = useState({});
  const [finalPartColors, setFinalPartColors] = useState({});
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [proceduresList, setProceduresList] = useState([]);

  const processTeethColors = (chartData) => {
    if (!chartData?.teeth) return {};

    const colorStates = {};
    Object.entries(chartData.teeth).forEach(([toothId, surfaces]) => {
      Object.entries(surfaces).forEach(([surface, data]) => {
        const partId = `T${toothId}_${surface.toLowerCase()}`;
        if (teethConfig.interactiveParts.has(partId)) {
          colorStates[partId] = data.colorState;
          console.log(`Part ${partId} has colorState: ${data.colorState}`);
        }
      });
    });

    return colorStates;
  };

  // Extract diagnosis from dental chart data
  const extractDiagnosis = (chartData) => {
    const diagnosisItems = [];
    
    if (chartData?.teeth) {
      Object.entries(chartData.teeth).forEach(([toothNumber, surfaces]) => {
        Object.entries(surfaces).forEach(([surface, data]) => {
          if (data.diagnosis) {
            diagnosisItems.push({
              tooth: toothNumber,
              surface: surface,
              diagnosis: data.diagnosis,
              date: data.diagnosisDate?.$date || data.diagnosisDate || "N/A",
              remarks: data.remarks || ""
            });
          }
        });
      });
    }
    
    // Also check for top-level diagnosis array
    if (chartData?.diagnosis && Array.isArray(chartData.diagnosis)) {
      chartData.diagnosis.forEach((item) => {
        diagnosisItems.push({
          code: item.code || 'N/A',
          description: item.description || 'No description available',
          tooth: item.tooth || 'General',
          surface: item.surface || 'N/A'
        });
      });
    }
    
    return diagnosisItems;
  };

  // Extract procedures from final chart data
  const extractProcedures = (chartData) => {
    const procedureItems = [];
    
    if (chartData?.teeth) {
      Object.entries(chartData.teeth).forEach(([toothNumber, surfaces]) => {
        Object.entries(surfaces).forEach(([surface, data]) => {
          if (data.procedure) {
            procedureItems.push({
              tooth: toothNumber,
              surface: surface,
              procedure: data.procedure,
              date: data.procedureDate?.$date || data.procedureDate || "N/A",
              remarks: data.remarks || ""
            });
          }
        });
      });
    }
    
    // Also check for top-level procedures array
    if (chartData?.procedures && Array.isArray(chartData.procedures)) {
      chartData.procedures.forEach((item) => {
        procedureItems.push({
          code: item.code || 'N/A',
          description: item.description || 'No description available',
          tooth: item.tooth || 'General',
          surface: item.surface || 'N/A'
        });
      });
    }
    
    return procedureItems;
  };

  useEffect(() => {
    console.group('Dental Charts Data Structure');

    // Initial Dental Chart
    if (dentalChartData) {
      console.group('Initial Dental Chart');
      console.log('Structure:', {
        teeth: dentalChartData.teeth,
        diagnosis: dentalChartData.diagnosis
      });

      // Extract and set diagnosis
      const diagnosis = extractDiagnosis(dentalChartData);
      setDiagnosisList(diagnosis);
      console.log('Extracted Diagnosis:', diagnosis);

      // List diagnosis per tooth
      Object.entries(dentalChartData.teeth || {}).forEach(([toothNumber, surfaces]) => {
        Object.entries(surfaces).forEach(([surface, data]) => {
          if (data.diagnosis) {
            console.log(
              `Tooth ${toothNumber} - Surface: ${surface} | Diagnosis: ${data.diagnosis}`
            );
          }
        });
      });

      console.groupEnd();
    }

    // Final Dental Chart
    if (finalChartData) {
      console.group('Final Dental Chart');
      console.log('Full Data:', finalChartData);
      console.log('Teeth Data:', finalChartData.teeth);
      console.log('Sample Tooth:', Object.entries(finalChartData.teeth || {})[0]);

      // Extract and set procedures
      const procedures = extractProcedures(finalChartData);
      setProceduresList(procedures);
      console.log('Extracted Procedures:', procedures);

      // List procedure per tooth
      Object.entries(finalChartData.teeth || {}).forEach(([toothNumber, surfaces]) => {
        Object.entries(surfaces).forEach(([surface, data]) => {
          if (data.procedure) {
            console.log(
              `Tooth ${toothNumber} - Surface: ${surface} | Procedure: ${data.procedure}`
            );
          }
        });
      });

      console.groupEnd();
    }

    console.groupEnd();

    // Process colors
    if (dentalChartData) {
      const dentalColors = processTeethColors(dentalChartData);
      setInitialPartColors(dentalColors);
    }

    if (finalChartData) {
      const finalColors = processTeethColors(finalChartData);
      setFinalPartColors(finalColors);
    }

    setIsLoading(false);
  }, [dentalChartData, finalChartData]);

  const handleSelect = (toothPart) => {
    if (selectedTooth === toothPart) {
      setSelectedTooth(null);
    } else {
      setSelectedTooth(toothPart);
    }
  };

  const getColor = (partId, chartType = 'initial') => {
    const colors = chartType === 'initial' ? initialPartColors : finalPartColors;
    return colors[partId]?.color || '#FFFFFF';
  };

  const toggleVisibility = (part) => {
    setIsVisible((prev) => ({
      ...prev,
      [part]: !prev[part],
    }));
  };

  // Remove patientId dependency from useEffect
  useEffect(() => {
    setSelectedTooth(null);
  }, []); // Empty dependency array since we only need to run this once

  // Helper function to render diagnosis items vertically
  const renderDiagnosisItems = (itemsArray, fallbackText = "No items found.") => {
    if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
      return <div className="diagnosis-item">{fallbackText}</div>;
    }

    return itemsArray.map((item, index) => (
      <div key={index} className="diagnosis-item">
        {item.code && item.description ? (
          <span><strong>{item.code}</strong> - {item.description}</span>
        ) : (
          <span>
            <strong>Tooth {item.tooth}</strong> ({item.surface}): {item.diagnosis || item.procedure}
            {item.date && item.date !== "N/A" && <span> - {new Date(item.date).toLocaleDateString()}</span>}
            {item.remarks && <span> - {item.remarks}</span>}
          </span>
        )}
      </div>
    ));
  };

  const handleModelChange = (type) => {
    setModelType(type);
    setShowModelModal(false);
    setSelectedTooth(null);
  };

  return (
    <div className="container">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-text">Loading dental charts...</div>
        </div>
      ) : (error) ? (
        <div className="error-container">
          <p className="error-title">Error</p>
          <p>{error}</p>
          <button className="btn-retry" onClick={() => {
            // Retry logic if needed
          }}>
            Retry
          </button>
        </div>
      ) : (
        <div className="content">
          {/* Horizontal Legend at the top */}
          <div className="legend-header">
            <div className="legend-horizontal">
              <div className="legend-section-horizontal">
                <div className="legend-category red-text">
                  <span className="legend-dot red"></span>
                  <span className="legend-category-title">Carries / Defects</span>
                </div>
                <div className="legend-items-horizontal">
                  <span><strong>C</strong> - Carries</span>
                  <span><strong>F</strong> - Fractured</span>
                  <span><strong>Imp</strong> - Impacted</span>
                  <span><strong>MR</strong> - Missing Restoration</span>
                  <span><strong>RC</strong> - Recurrent Carries</span>
                  <span><strong>RF</strong> - Root Fragment</span>
                  <span><strong>X</strong> - Extraction due to Carries</span>
                  <span><strong>XO</strong> - Extraction due to Other Causes</span>
                </div>
              </div>
              <div className="legend-section-horizontal">
                <div className="legend-category blue-text">
                  <span className="legend-dot blue"></span>
                  <span className="legend-category-title">Restorations</span>
                </div>
                <div className="legend-items-horizontal">
                  <span><strong>Ab</strong> - Abutment</span>
                  <span><strong>Am</strong> - Amalgam</span>
                  <span><strong>APC</strong> - All Porcelain Crown</span>
                  <span><strong>Co</strong> - Composite</span>
                  <span><strong>CD</strong> - Complete Denture</span>
                  <span><strong>GC</strong> - Gold Crown</span>
                  <span><strong>Gl</strong> - Glass Ionomer</span>
                  <span><strong>In</strong> - Inlay</span>
                  <span><strong>M</strong> - Missing</span>
                  <span><strong>MC</strong> - Metal Crown</span>
                  <span><strong>P</strong> - Pontic</span>
                  <span><strong>PFG</strong> - Porcelain Fused to Gold</span>
                  <span><strong>PFM</strong> - Porcelain Fused to Metal</span>
                  <span><strong>PFS</strong> - Pit and Fissure Sealant</span>
                  <span><strong>RPD</strong> - Removable Partial Denture</span>
                  <span><strong>SS</strong> - Stainless Steel Crown</span>
                  <span><strong>TF</strong> - Temporary Filling</span>
                  <span><strong>Un</strong> - Unerupted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side by Side Diagnosis Section */}
          <div className="diagnosis-header">
            <div className="diagnosis-side-by-side">
              
              {/* Initial Diagnosis Section - Left */}
              <div className="diagnosis-section-left">
                <div className="diagnosis-category blue-text">
                  <strong>Initial Diagnosis - Model 1</strong>
                </div>
                <div className="diagnosis-items-vertical">
                  {renderDiagnosisItems(diagnosisList, "No initial diagnosis found.")}
                </div>
              </div>
              {/* Final Procedures Section - Right */}
              <div className="diagnosis-section-right">
                <div className="diagnosis-category red-text">
                  <strong>Accomplished Procedures - Model 2</strong>
                </div>
                <div className="diagnosis-items-vertical">
                  {renderDiagnosisItems(proceduresList, "No procedures found.")}
                </div>
              </div>
            </div>
          </div>

          {/* Model Switch Button */}
          <div className="model-switch-container" style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '20px' // Changed from -10px to 20px to add space
          }}>
            <button 
              onClick={() => setShowModelModal(true)} 
              className="model-switch-button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '5px' // Add small margin at bottom of button
              }}
            >
              <span className="material-symbols-outlined">dentistry</span>
              {modelType === 'adult' ? 'Switch to Pediatric Model' : 'Switch to Adult Model'}
            </button>
          </div>

          {/* Dental Chart Models */}
          <div className="models-row">
            {!dentalChartData || Object.keys(dentalChartData).length === 0 ? (
              // Placeholder when no initial data is available
              <div className="model-container" style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: '400px',
                textAlign: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px', 
                  color: '#1976d2' // Changed to blue
                }}>
                  warning
                </span>
                <h3 style={{ 
                  marginBottom: '8px',
                  color: '#1976d2' // Changed to blue
                }}>
                  Uh Oh! You haven't Diagnosed this Patient Yet
                </h3>  
                <p style={{ 
                  color: '#42a5f5' // Lighter blue for subtitle
                }}>
                  Please complete an initial dental examination first.
                </p>
              </div>
            ) : !finalChartData || Object.keys(finalChartData).length === 0 ? (
              // Show only initial chart when final chart is not available
              <div className="model-container" style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '10px',
                width: '100%'
              }}>
                <h3 className="model-title">Initial Dental Chart</h3>
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
                  <DentalModel
                    onSelect={handleSelect}
                    getColor={(partId) => {
                      const state = initialPartColors[partId];
                      return state === 1 ? '#FF0000' : state === 2 ? '#0000FF' : '#FFFFFF';
                    }}
                    partColors={initialPartColors}
                    isVisible={isVisible}
                    setHoveredTooth={setHoveredTooth}
                    modelType={modelType}
                    chartData={dentalChartData}
                  />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  <OrbitControls enablePan enableZoom enableRotate minDistance={0.5} maxDistance={25} />
                </Canvas>
                <div className="overlay">
                  <div className="controls">
                    <button className="btn-blue" onClick={() => toggleVisibility('Tongue')}>
                      {isVisible.Tongue ? 'Hide' : 'Show'} Tongue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Show both charts when both are available
              <>
                {/* Left Model - Dental Chart */}
                <div className="model-container" style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '10px'
                }}>
                  <h3 className="model-title">Initial Diagnosis</h3>
                  <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
                    <DentalModel
                        onSelect={handleSelect}
                        getColor={(partId) => {
                          const state = initialPartColors[partId];
                          return state === 1 ? '#FF0000' : state === 2 ? '#0000FF' : '#FFFFFF';
                        }}
                        partColors={initialPartColors}
                        isVisible={isVisible}
                        setHoveredTooth={setHoveredTooth}
                        modelType={modelType} // Make sure modelType is passed here
                        chartData={dentalChartData}
                    />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <OrbitControls enablePan enableZoom enableRotate minDistance={0.5} maxDistance={25} />
                  </Canvas>
                  <div className="overlay">
                    <div className="controls">
                      <button className="btn-blue" onClick={() => toggleVisibility('Tongue')}>
                        {isVisible.Tongue ? 'Hide' : 'Show'} Tongue
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Model - Final Chart */}
                <div className="model-container" style={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '10px'
                }}>
                  <h3 className="model-title">Accomplished Procedures</h3>
                  <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
                    <DentalModel
                      onSelect={handleSelect}
                      getColor={(partId) => {
                        const state = finalPartColors[partId];
                        return state === 1 ? '#FF0000' : state === 2 ? '#0000FF' : '#FFFFFF';
                      }}
                      partColors={finalPartColors}
                      isVisible={isVisible}
                      setHoveredTooth={setHoveredTooth}
                      modelType={modelType} // Make sure modelType is passed here
                      chartData={finalChartData}
                    />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <OrbitControls enablePan enableZoom enableRotate minDistance={0.5} maxDistance={25} />
                  </Canvas>
                  <div className="overlay">
                    <div className="controls">
                      <button className="btn-blue" onClick={() => toggleVisibility('Tongue')}>
                        {isVisible.Tongue ? 'Hide' : 'Show'} Tongue
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Model Selection Modal */}
          {showModelModal && (
            <div className="modal-overlay">
              <div className="modal-content model-select-modal">
                <h2>Select Dental Model</h2>
                
                <div className="model-options">
                  <div 
                    className={`model-option ${modelType === 'adult' ? 'selected' : ''}`}
                    onClick={() => handleModelChange('adult')}
                  >
                    <div className="model-preview adult-preview"></div>
                    <h3>Adult Model</h3>
                    <p>Full adult dentition (28-32 teeth)</p>
                  </div>
                  
                  <div 
                    className={`model-option ${modelType === 'pediatric' ? 'selected' : ''}`}
                    onClick={() => handleModelChange('pediatric')}
                  >
                    <div className="model-preview pediatric-preview"></div>
                    <h3>Pediatric Model</h3>
                    <p>Primary dentition (20 teeth)</p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button onClick={() => setShowModelModal(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegratedDentalChartViewer;