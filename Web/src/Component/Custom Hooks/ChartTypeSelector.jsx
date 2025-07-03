import React from 'react';

const ChartTypeSelector = ({ chartType, setChartType }) => {
  return (
    <div className="chart-type-selector">
      <h3 className="selector-title">Save chart as..</h3>
      <div className="selector-options">
        <label className="selector-option">
          <input
            type="radio"
            name="chartType"
            value="initial"
            checked={chartType === 'initial'}
            onChange={() => setChartType('initial')}
          />
          <span>Initial Diagnosis</span>
        </label>

        <label className="selector-option">
          <input
            type="radio"
            name="chartType"
            value="followup"
            checked={chartType === 'followup'}
            onChange={() => setChartType('followup')}
          />
          <span>Accomplished Procedures</span>
        </label>
      </div>
    </div>
  );
};

export default ChartTypeSelector;