import React, { useRef, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

const PeriodontalTable = ({ toothNumbers, categories, state, handleChange, tableLabel = "Maxilla", prefix = "" }) => {
  // Ref to store matrix of input refs
  const inputRefs = useRef([]);
  const [selectedCell, setSelectedCell] = useState(null);

  // Initialize inputRefs matrix on component mount
  useEffect(() => {
    inputRefs.current = Array(categories.length)
      .fill()
      .map(() => Array(toothNumbers.length).fill(null));
  }, [categories.length, toothNumbers.length]);

  // Handle keyboard navigation between cells without blocking typing
  const handleKeyDown = (e, rowIndex, colIndex) => {
    // Don't prevent default on typing keys to allow normal input
    if (e.key.length === 1 || 
        e.key === 'Backspace' || 
        e.key === 'Delete' || 
        e.key === 'Home' || 
        e.key === 'End') {
      return; // Allow normal typing behavior
    }
    
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      
      // Move to next cell (right or down to next row)
      if (colIndex < toothNumbers.length - 1) {
        inputRefs.current[rowIndex][colIndex + 1].focus();
      } else if (rowIndex < categories.length - 1) {
        inputRefs.current[rowIndex + 1][0].focus();
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      
      // Move to previous cell (left or up to previous row)
      if (colIndex > 0) {
        inputRefs.current[rowIndex][colIndex - 1].focus();
      } else if (rowIndex > 0) {
        inputRefs.current[rowIndex - 1][toothNumbers.length - 1].focus();
      }
    } else if (e.key === 'ArrowUp' && rowIndex > 0) {
      e.preventDefault();
      inputRefs.current[rowIndex - 1][colIndex].focus();
    } else if (e.key === 'ArrowDown' && rowIndex < categories.length - 1) {
      e.preventDefault();
      inputRefs.current[rowIndex + 1][colIndex].focus();
    } else if (e.key === 'ArrowLeft') {
      // Only prevent default if at beginning of input
      const input = e.target;
      if (input.selectionStart === 0 && input.selectionEnd === 0 && colIndex > 0) {
        e.preventDefault();
        inputRefs.current[rowIndex][colIndex - 1].focus();
      }
    } else if (e.key === 'ArrowRight') {
      // Only prevent default if at end of input
      const input = e.target;
      if (input.selectionStart === input.value.length && colIndex < toothNumbers.length - 1) {
        e.preventDefault();
        inputRefs.current[rowIndex][colIndex + 1].focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      // Move down or to beginning of next row
      if (rowIndex < categories.length - 1) {
        inputRefs.current[rowIndex + 1][colIndex].focus();
      } else if (colIndex < toothNumbers.length - 1) {
        inputRefs.current[0][colIndex + 1].focus();
      } else {
        inputRefs.current[0][0].focus();
      }
    }
  };

  // Handle cell focus and blur for visual feedback
  const handleCellFocus = (rowIndex, colIndex) => {
    setSelectedCell({ rowIndex, colIndex });
  };

  const handleCellBlur = () => {
    setSelectedCell(null);
  };

  // Cursor will automatically select all text on click (Excel-like behavior)
  const handleCellClick = (e) => {
    e.target.select();
  };

  // Generate unique cell name based on prefix if provided
  const getCellName = (category, toothNumber) => {
    return prefix ? `${prefix}-${category}-${toothNumber}` : `${category}-${toothNumber}`;
  };

  return (
    <div className="table-responsive periodontal-table-wrapper mb-4">
      <table className="table table-bordered text-center periodontal-table">
        <thead className="table-light">
          <tr>
            <th className="category-header">{tableLabel}</th>
            {toothNumbers.map((num) => (
              <th key={num} className="tooth-number">{num}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, rowIndex) => (
            <tr key={`${tableLabel}-${cat}`}>
              <td className="fw-bold category-cell">{cat}</td>
              {toothNumbers.map((num, colIndex) => {
                const cellName = getCellName(cat, num);
                const isSelected = selectedCell && 
                                  selectedCell.rowIndex === rowIndex && 
                                  selectedCell.colIndex === colIndex;
                
                return (
                  <td key={cellName} className={`cell-wrapper ${isSelected ? 'selected-cell' : ''}`}>
                    <Form.Control
                      type="text"
                      name={cellName}
                      value={state[cellName] || ''}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onFocus={() => handleCellFocus(rowIndex, colIndex)}
                      onBlur={handleCellBlur}
                      onClick={handleCellClick}
                      ref={(el) => {
                        if (inputRefs.current[rowIndex]) {
                          inputRefs.current[rowIndex][colIndex] = el;
                        }
                      }}
                      className="text-center periodontal-input"
                      autoComplete="off"
                      data-region={prefix.split('-')[0]}
                      data-view={prefix.split('-')[1]}
                      data-category={cat}
                      data-tooth={num}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeriodontalTable;