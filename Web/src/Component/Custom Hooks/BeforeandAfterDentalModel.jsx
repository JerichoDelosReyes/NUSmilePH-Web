import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Enhanced component to render dental chart data on the 3D model
const BeforeAfterDentalModel = ({ data, modelType, isVisible }) => {
  const groupRef = useRef();
  const meshRefs = useRef({});
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hoveredTooth, setHoveredTooth] = useState(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to map tooth IDs from data to model part names
  const mapToothIdToModelPart = (toothId, surface) => {
    return `T${toothId}_${surface}`;
  };

  // Function to get color based on diagnosis data
  const getColorFromDiagnosis = (toothId, surface) => {
    if (!data || !data.teeth) return "white";
    
    // Access the teeth data from the passed chart data
    const teeth = data.teeth;
    
    // Check if this tooth has diagnoses
    if (teeth[toothId] && teeth[toothId][surface]) {
      const diagnosis = teeth[toothId][surface];
      // Return color based on colorState (1 = red, 2 = blue)
      return diagnosis.colorState === 1 ? "red" : "blue";
    }
    
    return "white";
  };

  // Get diagnosis label for tooltip
  const getDiagnosisLabel = (toothId, surface) => {
    if (!data || !data.teeth || !data.teeth[toothId] || !data.teeth[toothId][surface]) 
      return "";
    
    const diagnosisInfo = data.teeth[toothId][surface];
    const diagnosisCode = diagnosisInfo.diagnosis;
    const category = diagnosisInfo.colorState === 1 ? "Caries/Defect" : "Restoration";
    
    return `${diagnosisCode} (${category})`;
  };

  // Load the 3D model
  useEffect(() => {
    const loader = new GLTFLoader();
    const modelPath = modelType === 'pediatric' ? '/models/pediatric_teeth.glb' : '/models/adult_teeth.glb';
    
    loader.load(
      modelPath,
      (gltf) => {
        // Process the loaded model
        const model = gltf.scene;
        
        // Clear existing children from the group
        while (groupRef.current && groupRef.current.children.length > 0) {
          groupRef.current.remove(groupRef.current.children[0]);
        }
        
        // Add the model to our group
        if (groupRef.current) {
          groupRef.current.add(model);
        }
        
        // Set up materials and store mesh references
        model.traverse((child) => {
          if (child.isMesh) {
            const partName = child.name;
            
            // Skip parts that should be hidden based on isVisible prop
            if ((partName.includes("Tongue") && !isVisible.Tongue) ||
                (partName.includes("Back") && !isVisible.Back)) {
              child.visible = false;
              return;
            }
            
            // Create a new material for each tooth part with higher quality
            const material = new THREE.MeshStandardMaterial({
              color: "white",
              roughness: 0.4,
              metalness: 0.2,
              envMapIntensity: 1.0,
            });
            
            // Check if this part represents a tooth surface
            if (partName.startsWith("T")) {
              const [_, toothInfo] = partName.split("T");
              const [toothId, surface] = toothInfo.split("_");
              
              // Set color based on diagnosis data
              const color = getColorFromDiagnosis(toothId, surface);
              material.color.set(color);
              
              // Set up hover interaction
              child.userData = {
                isToothPart: true,
                toothId,
                surface,
              };
            }
            
            // Apply the material and store the mesh reference
            child.material = material;
            meshRefs.current[child.name] = child;
            
            // Add hover event handlers for tooth parts
            if (partName.startsWith("T")) {
              // Original material for restoration
              child.userData.originalMaterial = child.material.clone();
            }
          }
        });
        
        setModelLoaded(true);
      },
      (progress) => {
        // Optional loading progress indicator
        // console.log(`Loading model: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );
    
    // Cleanup function
    return () => {
      // Clean up any resources if needed
      Object.values(meshRefs.current).forEach(mesh => {
        if (mesh && mesh.material) {
          mesh.material.dispose();
        }
      });
    };
  }, [modelType, isVisible]);

  // Effect to update colors when data changes
  useEffect(() => {
    if (!modelLoaded || !data || !data.teeth) return;
    
    // Update colors for each diagnosed tooth part
    Object.entries(data.teeth || {}).forEach(([toothId, surfaces]) => {
      Object.entries(surfaces).forEach(([surface, diagnosisInfo]) => {
        const partName = mapToothIdToModelPart(toothId, surface);
        const mesh = meshRefs.current[partName];
        
        if (mesh) {
          // Set color based on diagnosis type
          const color = diagnosisInfo.colorState === 1 ? "red" : "blue";
          mesh.material.color.set(color);
          
          // Store diagnosis info in userData for tooltips
          mesh.userData.diagnosis = diagnosisInfo.diagnosis;
          mesh.userData.colorState = diagnosisInfo.colorState;
        }
      });
    });
  }, [data, modelLoaded]);

  // Handle hover effects and tooltips
  useFrame((state) => {
    // Raycast to detect hover on tooth parts
    if (modelLoaded && groupRef.current) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(state.mouse, state.camera);
      
      // Get all interactive meshes
      const interactiveMeshes = Object.values(meshRefs.current).filter(
        mesh => mesh && mesh.userData && mesh.userData.isToothPart
      );
      
      const intersects = raycaster.intersectObjects(interactiveMeshes);
      
      // Reset all materials first
      interactiveMeshes.forEach(mesh => {
        if (mesh.userData.highlighted) {
          // Restore original material color
          const toothId = mesh.userData.toothId;
          const surface = mesh.userData.surface;
          const color = getColorFromDiagnosis(toothId, surface);
          mesh.material.color.set(color);
          mesh.material.emissive.set("#000000");
          mesh.userData.highlighted = false;
        }
      });
      
      // Handle new intersection if any
      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const { toothId, surface } = intersectedMesh.userData;
        
        // Highlight the mesh
        intersectedMesh.material.emissive.set("#333333");
        intersectedMesh.userData.highlighted = true;
        
        // Set tooltip content
        const diagnosisLabel = getDiagnosisLabel(toothId, surface);
        
        // Only show tooltip if we have a diagnosis
        if (diagnosisLabel) {
          setTooltipContent(`Tooth ${toothId} - ${surface}: ${diagnosisLabel}`);
          setHoveredTooth(`${toothId} (${surface})`);
        }
      } else {
        setHoveredTooth(null);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* The 3D model will be added here by the useEffect */}
      
      {/* Optional: Add visual indicator for which chart type we're viewing */}
      {data && data.chartType && (
        <group position={[0, -2.5, 0]}>
          <mesh>
            <boxGeometry args={[0.001, 0.001, 0.001]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default BeforeAfterDentalModel;