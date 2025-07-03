import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BeforeAfterDentalModel from "../Custom Hooks/BeforeandAfterDentalModel";
import '../Views/Styles/DentalChart.css';
import { API_URL } from '../../config/api';

const BeforeAfterModal = ({ 
  showModal,
  setShowModal,
  patientId,
  modelType,
  fetchHistoricalData = true // Whether to fetch data or use provided data
}) => {
  const [beforeAfterView, setBeforeAfterView] = useState(null); // 'before', 'after', or null (side-by-side)
  const [beforeData, setBeforeData] = useState({});
  const [afterData, setAfterData] = useState({});
  const [beforeDate, setBeforeDate] = useState('');
  const [afterDate, setAfterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch historical dental chart data on modal open
  useEffect(() => {
    if (showModal && fetchHistoricalData) {
      fetchHistoricalDentalCharts();
    }
  }, [showModal, fetchHistoricalData, patientId]);
  
  // Function to fetch historical dental charts for comparison
  const fetchHistoricalDentalCharts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_URL}/patient/${patientId}/get/dentalChartHistory`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.charts && data.charts.length > 0) {
        // First look for initial and final charts as ideal pair
        const initialChart = data.charts.find(chart => chart.chartType === 'initial');
        const finalChart = data.charts.find(chart => chart.chartType === 'final');
        
        // Fallback to followup chart if final not available
        const followupChart = data.charts.find(chart => chart.chartType === 'followup');
        
        if (initialChart && (finalChart || followupChart)) {
          // Prefer final chart, fallback to followup
          const comparisonChart = finalChart || followupChart;
          
          setBeforeData(initialChart);
          setAfterData(comparisonChart);
          setBeforeDate(new Date(initialChart.chartDate).toLocaleDateString());
          setAfterDate(new Date(comparisonChart.chartDate).toLocaleDateString());
        } else {
          // Fall back to oldest and newest charts
          const sortedCharts = data.charts.sort((a, b) => 
            new Date(a.chartDate) - new Date(b.chartDate)
          );
          
          if (sortedCharts.length >= 2) {
            setBeforeData(sortedCharts[0]);
            setAfterData(sortedCharts[sortedCharts.length - 1]);
            
            setBeforeDate(new Date(sortedCharts[0].chartDate).toLocaleDateString());
            setAfterDate(new Date(sortedCharts[sortedCharts.length - 1].chartDate).toLocaleDateString());
          } else if (sortedCharts.length === 1) {
            setBeforeData(sortedCharts[0]);
            setBeforeDate(new Date(sortedCharts[0].chartDate).toLocaleDateString());
            setAfterData({});
            setAfterDate('No current data');
          }
        }
        
        setBeforeAfterView(null); // Default to side-by-side view
      } else {
        setError("No dental chart history available");
      }
    } catch (error) {
      console.error("Error fetching dental chart history:", error);
      setError(`Failed to load dental chart history: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to switch between views (before, after, or side-by-side)
  const switchBeforeAfterView = (view) => {
    setBeforeAfterView(view);
  };
  
  // Get badge color based on chart type
  const getChartTypeBadgeColor = (chartType) => {
    switch(chartType) {
      case 'initial': return '#e67e22'; // Orange
      case 'followup': return '#3498db'; // Blue
      case 'final': return '#2ecc71';   // Green
      default: return '#95a5a6';        // Gray
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content before-after-modal">
          <h2>Before & After Comparison</h2>
          <div className="loading-indicator">Loading chart data...</div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content before-after-modal">
          <h2>Before & After Comparison</h2>
          <div className="error-message">{error}</div>
          <div className="modal-actions">
            <button 
              onClick={() => setShowModal(false)} 
              className="confirm-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main modal render
  return (
    <div className="modal-overlay">
      <div className="modal-content before-after-modal">
        <h2>Before & After Comparison</h2>
        
        <div className="comparison-header">
          <div 
            className={`comparison-tab ${beforeAfterView === 'before' ? 'active' : ''}`} 
            onClick={() => switchBeforeAfterView('before')}
          >
            Before ({beforeDate})
            {beforeData.chartType && 
              <span 
                className="chart-type-badge"
                style={{ backgroundColor: getChartTypeBadgeColor(beforeData.chartType) }}
              >
                {beforeData.chartType}
              </span>
            }
          </div>
          
          <div 
            className={`comparison-tab ${beforeAfterView === 'after' ? 'active' : ''}`}
            onClick={() => switchBeforeAfterView('after')}
          >
            After ({afterDate})
            {afterData.chartType && 
              <span 
                className="chart-type-badge"
                style={{ backgroundColor: getChartTypeBadgeColor(afterData.chartType) }}
              >
                {afterData.chartType}
              </span>
            }
          </div>
          
          <div 
            className={`comparison-tab ${beforeAfterView === null ? 'active' : ''}`}
            onClick={() => switchBeforeAfterView(null)}
          >
            Side by Side
          </div>
        </div>
        
        <div className="comparison-container">
          {beforeAfterView === null ? (
            // Side by side view
            <div className="side-by-side-view">
              {/* Before Model */}
              <div className="model-container">
                <h3>
                  Before ({beforeDate})
                  {beforeData.chartType && 
                    <span 
                      className="chart-type-badge inline"
                      style={{ backgroundColor: getChartTypeBadgeColor(beforeData.chartType) }}
                    >
                      {beforeData.chartType}
                    </span>
                  }
                </h3>
                <div className="model-wrapper" style={{ height: '400px' }}>
                  {Object.keys(beforeData).length > 0 ? (
                    <Canvas camera={{ position: [0, 2, 5] }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[2, 2, 2]} />
                      <BeforeAfterDentalModel 
                        data={beforeData} 
                        modelType={modelType}
                        isVisible={{ Tongue: true, Back: true }}
                      />
                      <OrbitControls 
                        enablePan={false} 
                        maxPolarAngle={Math.PI / 1.75}
                        minPolarAngle={Math.PI / 6}
                      />
                    </Canvas>
                  ) : (
                    <div className="no-data-message">No previous dental chart data available</div>
                  )}
                </div>
              </div>
              
              {/* After Model */}
              <div className="model-container">
                <h3>
                  After ({afterDate})
                  {afterData.chartType && 
                    <span 
                      className="chart-type-badge inline"
                      style={{ backgroundColor: getChartTypeBadgeColor(afterData.chartType) }}
                    >
                      {afterData.chartType}
                    </span>
                  }
                </h3>
                <div className="model-wrapper" style={{ height: '400px' }}>
                  {Object.keys(afterData).length > 0 ? (
                    <Canvas camera={{ position: [0, 2, 5] }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[2, 2, 2]} />
                      <BeforeAfterDentalModel 
                        data={afterData} 
                        modelType={modelType}
                        isVisible={{ Tongue: true, Back: true }}
                      />
                      <OrbitControls 
                        enablePan={false}
                        maxPolarAngle={Math.PI / 1.75}
                        minPolarAngle={Math.PI / 6}
                      />
                    </Canvas>
                  ) : (
                    <div className="no-data-message">No current dental chart data available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Single view (before or after)
            <div className="full-view">
              <div className="model-wrapper" style={{ height: '500px' }}>
                {beforeAfterView === 'before' ? (
                  Object.keys(beforeData).length > 0 ? (
                    <Canvas camera={{ position: [0, 2, 5] }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[2, 2, 2]} />
                      <BeforeAfterDentalModel 
                        data={beforeData} 
                        modelType={modelType}
                        isVisible={{ Tongue: true, Back: true }}
                      />
                      <OrbitControls 
                        maxPolarAngle={Math.PI / 1.75}
                        minPolarAngle={Math.PI / 6}
                      />
                    </Canvas>
                  ) : (
                    <div className="no-data-message">No previous dental chart data available</div>
                  )
                ) : (
                  Object.keys(afterData).length > 0 ? (
                    <Canvas camera={{ position: [0, 2, 5] }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[2, 2, 2]} />
                      <BeforeAfterDentalModel 
                        data={afterData} 
                        modelType={modelType}
                        isVisible={{ Tongue: true, Back: true }}
                      />
                      <OrbitControls 
                        maxPolarAngle={Math.PI / 1.75}
                        minPolarAngle={Math.PI / 6}
                      />
                    </Canvas>
                  ) : (
                    <div className="no-data-message">No current dental chart data available</div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Differences summary section */}
        <div className="differences-summary">
          <h3>Changes Summary</h3>
          {Object.keys(beforeData).length > 0 && Object.keys(afterData).length > 0 ? (
            <DifferencesTable beforeData={beforeData} afterData={afterData} />
          ) : (
            <p>Not enough data to show comparison</p>
          )}
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={() => setShowModal(false)} 
            className="confirm-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterModal;