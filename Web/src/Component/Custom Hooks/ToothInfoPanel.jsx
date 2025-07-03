import React from 'react';

// Enhanced component to display information about a selected tooth
// and show a summary of all diagnosed teeth when no tooth is selected
const ToothInfoPanel = ({ toothId, data }) => {
  // Parse the tooth ID from format T38_occlusal to get tooth number and surface
  const parseToothInfo = (toothId) => {
    if (!toothId) return { number: null, surface: null };
    
    // Match the format T38_occlusal
    const match = toothId.match(/T(\d+)_(\w+)/i);
    if (!match) return { number: null, surface: null };
    
    return {
      number: match[1],
      surface: match[2].toLowerCase() // Normalize surface to lowercase
    };
  };

  // Function to get color from colorState code
  const getColorFromState = (colorState) => {
    if (colorState === '1' || colorState === 1) return 'red';
    if (colorState === '2' || colorState === 2) return 'blue';
    return colorState; // Return the original value if it's already a color
  };

  // Process all teeth data to create a summary
  const processDiagnosedTeeth = () => {
    // Get teeth data from either teeth or teethRecords property
    const teethData = data?.teeth || data?.teethRecords || {};
    const diagnosedTeeth = [];
    
    // Loop through all teeth in the data
    Object.entries(teethData).forEach(([toothNumber, toothData]) => {
      // Handle different possible data structures
      const surfaces = toothData.surfaces || toothData;
      
      // Check each surface of the tooth
      Object.entries(surfaces).forEach(([surface, surfaceData]) => {
        // Only include surfaces with diagnosis or treatment
        if (surfaceData.diagnosis || surfaceData.treatment || surfaceData.notes) {
          // Determine color display
          const colorState = surfaceData.colorState || surfaceData.color || surfaceData.status;
          const displayColor = getColorFromState(colorState);
          
          // Add to the list of diagnosed teeth
          diagnosedTeeth.push({
            toothNumber,
            surface,
            diagnosis: surfaceData.diagnosis || 'No diagnosis',
            treatment: surfaceData.treatment || 'No treatment',
            notes: surfaceData.notes || '',
            colorState: displayColor
          });
        }
      });
    });
    
    return diagnosedTeeth;
  };

  // Group teeth by number for better organization
  const groupTeethByNumber = (teeth) => {
    const grouped = {};
    
    teeth.forEach(tooth => {
      if (!grouped[tooth.toothNumber]) {
        grouped[tooth.toothNumber] = [];
      }
      grouped[tooth.toothNumber].push(tooth);
    });
    
    return grouped;
  };

  // Get tooth number and surface from selected tooth
  const { number, surface } = parseToothInfo(toothId);
  
  // If a specific tooth is selected, show its details
  if (number && surface) {
    // Get teeth data from either teeth or teethRecords property
    const teethData = data?.teeth || data?.teethRecords || {};
    
    // Get the tooth data
    const toothData = teethData[number] || {};
    
    // Handle different data structures - tooth might have surfaces property or direct surfaces
    const surfaces = toothData.surfaces || toothData;
    
    // Get the surface data - try both provided case and lowercase
    const surfaceData = surfaces[surface] || surfaces[surface.toLowerCase()] || {};
    
    // Extract the data we need with fallbacks
    const diagnosis = surfaceData.diagnosis || 'No diagnosis';
    const treatment = surfaceData.treatment || 'No treatment';
    const colorState = surfaceData.colorState || surfaceData.color || surfaceData.status || 'None';
    const displayColor = getColorFromState(colorState);
    const notes = surfaceData.notes || '';
    
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-3">Tooth {number}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong className="text-gray-700">Surface:</strong>
          </div>
          <div className="capitalize">{surface}</div>
          
          <div>
            <strong className="text-gray-700">Diagnosis:</strong>
          </div>
          <div>{diagnosis}</div>
          
          <div>
            <strong className="text-gray-700">Treatment:</strong>
          </div>
          <div>{treatment}</div>
          
          <div>
            <strong className="text-gray-700">Status:</strong>
          </div>
          <div className="flex items-center">
            <span 
              className="inline-block w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: displayColor }}
            />
            {displayColor}
          </div>
          
          {notes && (
            <>
              <div>
                <strong className="text-gray-700">Notes:</strong>
              </div>
              <div>{notes}</div>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // If no tooth is selected, show a summary of all diagnosed teeth
  const diagnosedTeeth = processDiagnosedTeeth();
  const groupedTeethByNumber = groupTeethByNumber(diagnosedTeeth);
  
  // Calculate counts for red and blue teeth
  const redCount = diagnosedTeeth.filter(t => t.colorState === 'red').length;
  const blueCount = diagnosedTeeth.filter(t => t.colorState === 'blue').length;
  
  // If no diagnosed teeth, show a message
  if (diagnosedTeeth.length === 0) {
    return (
      <div className="bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Dental Chart</h3>
        <p className="text-gray-500">No diagnosed teeth found. Select a tooth to view details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-auto max-h-screen">
      <h3 className="text-lg font-bold mb-3">Dental Chart Summary</h3>
      
      {/* Display count of diagnosed teeth */}
      <div className="mb-4 text-sm">
        <div className="font-medium">Diagnosed surfaces: {diagnosedTeeth.length}</div>
        <div className="flex items-center mt-1">
          <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: 'red' }}></span>
          <span>Red (Requires treatment): {redCount}</span>
          <span className="inline-block w-3 h-3 rounded-full mx-2" style={{ backgroundColor: 'blue' }}></span>
          <span>Blue (Monitoring): {blueCount}</span>
        </div>
      </div>
      
      {/* Diagnosis List - Enhanced to more prominently display diagnoses */}
      <h4 className="font-bold mb-2 text-lg border-b pb-1">Diagnosis List</h4>
      <div className="mb-4">
        {diagnosedTeeth.length > 0 ? (
          <div className="space-y-2">
            {diagnosedTeeth.map((tooth, idx) => (
              <div 
                key={idx} 
                className="mb-2 p-2 rounded border-l-4 transition-all hover:bg-gray-50"
                style={{ 
                  borderLeftColor: tooth.colorState,
                  backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tooth {tooth.toothNumber} ({tooth.surface})</span>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">{tooth.colorState === 'red' ? 'Requires treatment' : 'Monitoring'}</span>
                    <span 
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: tooth.colorState }}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium">{tooth.diagnosis}</div>
                {tooth.treatment !== 'No treatment' && (
                  <div className="text-xs text-gray-600 mt-1">
                    Treatment: {tooth.treatment}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No diagnoses found</div>
        )}
      </div>
      
      {/* Detailed List - grouped by tooth number */}
      <h4 className="font-bold mb-2 text-lg border-b pb-1">Complete Details</h4>
      <div className="space-y-4">
        {Object.entries(groupedTeethByNumber).map(([toothNumber, surfaces]) => (
          <div key={toothNumber} className="border-b pb-3">
            <h4 className="font-bold mb-2">Tooth {toothNumber}</h4>
            
            {surfaces.map((surface, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-1">
                <div>
                  <span className="capitalize font-semibold">{surface.surface}</span>: {surface.diagnosis}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-0">
                  Treatment: {surface.treatment}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Overall Notes Section */}
      {data?.overallNotes && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h4 className="font-bold mb-2 text-lg border-b pb-1">Overall Notes</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{data.overallNotes}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        <p>Select a tooth on the model for detailed information</p>
      </div>
    </div>
  );
};

export default ToothInfoPanel;
