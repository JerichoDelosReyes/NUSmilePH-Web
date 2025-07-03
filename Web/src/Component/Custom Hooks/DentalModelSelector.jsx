import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import DentalModel from './DentalModel'; // Assuming this is the path to your DentalModel component

const DentalModelSelector = () => {
  // State to track the current model type
  const [modelType, setModelType] = useState('adult');
  const [showModelSelectorModal, setShowModelSelectorModal] = useState(false);

  const openModelSelectorModal = () => {
    setShowModelSelectorModal(true);
  };


  // Function to toggle between adult and pediatric models
  const toggleModelType = () => {
    setModelType(prevType => prevType === 'adult' ? 'pediatric' : 'adult');
  };

  // Dummy functions to match the props expected by DentalModel
  const handleSelect = (part) => {
    console.log('Selected part:', part);
  };

  const getColor = () => 'white';

  const setHoveredTooth = (tooth) => {
    console.log('Hovered tooth:', tooth);
  };

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* Model Type Toggle Button */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
          padding: '5px 10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
      >
        <span style={{ marginRight: '10px' }}>
          Model: {modelType === 'adult' ? 'Adult' : 'Pediatric'}
        </span>
        <button 
          onClick={toggleModelType}
          style={{
            backgroundColor: modelType === 'adult' ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Switch to {modelType === 'adult' ? 'Pediatric' : 'Adult'}
        </button>
      </div>

      {/* 3D Canvas with Dental Model */}
      <Canvas camera={{ position: [0, 2, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <DentalModel
          modelType={modelType}
          onSelect={handleSelect}
          getColor={getColor}
          setHoveredTooth={setHoveredTooth}
          isVisible={{
            Tongue: true,
            Throat: true
          }}
        />
      </Canvas>
    </div>
  );
};

export default DentalModelSelector;