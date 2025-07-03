import React from 'react';

const diagnosisMap = {
  1: 'Caries/Defects',
  2: 'Restorations',
  3: 'Missing Tooth',
  4: 'Root Canal',
  // Extend as needed
};

const DiagnosisSummary = ({ data }) => {
  if (!data || !data.teeth || Object.keys(data.teeth).length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-sm text-gray-500">
        No diagnosis data available.
      </div>
    );
  }

  const renderDiagnosisList = () => {
    return Object.entries(data.teeth).map(([toothId, toothData]) => {
      const surfaces = toothData.surfaces || toothData;
      const surfaceEntries = Object.entries(surfaces).filter(
        ([_, v]) => v?.diagnosis || v?.status || v?.colorState || v?.procedure
      );

      if (surfaceEntries.length === 0) return null;

      return (
        <div key={toothId} className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-1">Tooth {toothId}</h4>
          <ul className="pl-4 list-disc text-sm text-gray-700">
            {surfaceEntries.map(([surface, surfaceData]) => {
              const diagnosisValue =
                surfaceData.diagnosis || surfaceData.status || surfaceData.colorState;
              const readableDiagnosis =
                diagnosisMap[diagnosisValue] || `Code ${diagnosisValue}`;
              const procedure = surfaceData.procedure;

              return (
                <li key={surface}>
                  <span className="font-medium capitalize">{surface}:</span>{' '}
                  {readableDiagnosis}
                  {procedure && (
                    <span className="text-gray-600">
                      {' '}
                      Procedure: <span className="italic">{procedure}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow text-sm max-h-[300px] overflow-y-auto">
      <h3 className="font-bold text-lg mb-2">Diagnosis Summary</h3>
      {renderDiagnosisList()}

      {/* Overall Notes Section */}
      {data.overallNotes && data.overallNotes.trim() !== '' && (
        <div className="mt-4 p-3 border-t border-gray-200 text-gray-700 whitespace-pre-wrap">
          <h4 className="font-semibold mb-1">Overall Notes</h4>
          <p className="text-sm">{data.overallNotes}</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosisSummary;
