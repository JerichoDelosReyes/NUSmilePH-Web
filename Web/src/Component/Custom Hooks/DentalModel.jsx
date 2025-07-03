import { useGLTF } from "@react-three/drei";
import React, { useState, useEffect, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";

// Configuration data moved to a separate object for better organization
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

// Single mesh component for better performance
const ToothPart = memo(({ node, partKey, isInteractive, onSelect, getColor, isHovered, setHovered, setHoveredTooth }) => {

  return (
    <mesh
      key={partKey}
      geometry={node.geometry}
      onClick={
        isInteractive
          ? (e) => {
              e.stopPropagation();
              onSelect(partKey);
            }
          : undefined
      }
      onPointerOver={
        isInteractive
          ? () => {
              setHovered(partKey);
              setHoveredTooth(partKey); 
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      
      onPointerOut={
        isInteractive
          ? () => {
              setHovered(null);
              setHoveredTooth(null); // ✅ clear hover text
              document.body.style.cursor = "default";
            }
          : undefined
      }
      
    >
      <meshStandardMaterial
        color={isHovered ? "yellow" : getColor(partKey) || `#${node.material.color.getHexString()}`}
        map={node.material.map || null}
        normalMap={node.material.normalMap || null}
        roughnessMap={node.material.roughnessMap || null}
        metalnessMap={node.material.metalnessMap || null}
        roughness={node.material.roughness}
        metalness={node.material.metalness}
        transparent={node.material.transparent}
        opacity={node.material.opacity}
      />
    </mesh>
  );
});

// Animated highlight for selected tooth
const SelectionHighlight = ({ targetKey, nodes }) => {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current && targetKey) {
      const node = nodes[targetKey];
      if (node && node.geometry) {
        // Position the highlight at the target tooth position
        ref.current.position.copy(node.position || new THREE.Vector3(0, 0, 0));
        
        // Make it pulse by scaling
        const scale = 1.05 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        ref.current.scale.set(scale, scale, scale);
      }
    }
  });
  
  // Only render if there's a target
  return targetKey ? (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="yellow" transparent opacity={0.3} />
    </mesh>
  ) : null;
};

const DentalModel = ({ 
  onSelect, 
  getColor, 
  isVisible, 
  setHoveredTooth, 
  modelType = 'adult' // New prop to select model type
}) => {

  const modelPath = modelType === 'adult' 
  ? "/Completed_teeth.glb" 
  : "/Dental_Model_Pediatric.glb";
  // Load the model with error handling
   const { nodes, scene } = useGLTF(modelPath, true);
  const [hovered, setHovered] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);
  
  // Handler for selection that also updates the last selected item
  const handleSelect = (partKey) => {
    onSelect(partKey);
    setLastSelected(partKey);
    
    // Clear the lastSelected after a delay (for highlighting animation)
    setTimeout(() => setLastSelected(null), 2000);
  };

  // Clean up GLTF resources on unmount
  useEffect(() => {
    return () => {
      // Dispose of geometries and materials to prevent memory leaks
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

   return (
    <group>
      {Object.entries(nodes).map(([key, node]) => {
        if (!node.geometry) return null;

        // Skip rendering if parts like Tongue or Throat are hidden
        if ((key === "Tongue" && !isVisible.Tongue) || (key === "Throat" && !isVisible.Throat)) {
          return null;
        }

        const isInteractive = teethConfig.interactiveParts.has(key);
        const isCurrentlyHovered = hovered === key;

        return (
          <ToothPart
            key={key}
            node={node}
            partKey={key}
            isInteractive={isInteractive}
            onSelect={handleSelect}
            getColor={getColor}
            isHovered={isCurrentlyHovered}
            setHovered={setHovered}
            setHoveredTooth={setHoveredTooth} 
          />
        );
      })}
      
      {/* Add visual feedback for selected tooth */}
      <SelectionHighlight targetKey={lastSelected} nodes={nodes} />
    </group>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(DentalModel);