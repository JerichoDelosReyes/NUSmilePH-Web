import React, { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';

const MultiSelectDropdown = ({ label, items, onChange, value = [] }) => {
  const selectedItems = items.filter(item => value.includes(item.value));

  const [isOpen, setIsOpen] = useState(false);

  const handleItemToggle = (item) => {
    const isSelected = value.includes(item.value);
    
    let newSelectedItems;
    if (isSelected) {
      newSelectedItems = value.filter(value => value !== item.value);
    }
    else{
      newSelectedItems = [...value, item.value];
    }

    // setSelectedItems(newSelectedItems);
    
    // Call the onChange prop with the new selected items
    if (onChange) {
      onChange(newSelectedItems);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    const newSelectedItems = selectedItems.filter(
      (item) => item.value !== itemToRemove.value
    );
    
    setSelectedItems(newSelectedItems);
    
    // Call the onChange prop with the updated selected items
    if (onChange) {
      onChange(newSelectedItems.map(item => item.value));
    }
  };

  return (
    <div className="dropdown-container mb-3">
      <span className="dropdown-label">{label}</span>
      <Dropdown 
        show={isOpen} 
        onToggle={(isOpen) => setIsOpen(isOpen)}
      >
        <Dropdown.Toggle 
          variant="outline-secondary" 
          id={`dropdown-${label.replace(/\s+/g, '-')}`}
          className="w-100"
        >
          {selectedItems.length > 0 
            ? `${selectedItems.length} selected` 
            : 'Select...'}
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100">
          {items.map((item, index) => (
            <Dropdown.Item 
              key={index} 
              onClick={() => handleItemToggle(item)}
              className="d-flex align-items-center"
            >
              <Form.Check 
                type="checkbox"
                checked={selectedItems.some(
                  (selectedItem) => selectedItem.value === item.value
                )}
                readOnly
                className="me-2"
              />
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Display selected items as tags */}
      {selectedItems.length > 0 && (
        <div className="multi-select-selected">
          {selectedItems.map((item, index) => (
            <div key={index} className="selected-option">
              <span className="selected-option-text">{item.label}</span>
              <span 
                className="selected-option-remove"
                onClick={() => handleRemoveItem(item)}
              >
                &times;
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;