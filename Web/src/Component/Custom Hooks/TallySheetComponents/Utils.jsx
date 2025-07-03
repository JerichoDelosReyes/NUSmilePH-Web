import { replace } from "react-router";
import { API_URL } from "../../../config/api";
import { TALLY_SHEET_MODELS } from "./TallySheetModels";

export const formatNames = (str) => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getGradeColor = (grade) => {
  if (!grade) return "";

  const firstChar = grade.charAt(0).toUpperCase();
  switch (firstChar) {
    case "A":
      return "text-success";
    case "B":
      return "text-primary";
    case "C":
      return "text-warning";
    case "D":
    case "F":
      return "text-danger";
    default:
      return "";
  }
};

export const handleYearChange = (
  year,
  dispatch,
  navigate,
  message,
  mode = "progress"
) => {
  dispatch({ type: "HANDLE_SELECTED_YEAR", payload: year });
  message.info(`Loading data for year: ${year}`);
  // navigate(`/tally-sheet/${year}`, { replace: true }); // 'replace: true' ensures a new navigation event is triggered even if the same URL

  const baseRoutes = {
    progress: year === "IA" ? "/progress/IA" : `/progress/${year}`,
    grading: `/case-grading/${year}`,
    remarks: `/remarks${year}`,
  };
  // const routeMap = {
  // progress:{
  //   IA: '/progress',
  //   IB: '/progressIB',
  //   IIA: '/progressIIA',
  //   IIB: '/progressIIB',
  //   IIIA: '/progressIIIA',
  //   IIIB: '/progressIIIB',
  //   IVA: '/progressIVA',
  //   IVB: '/progressIVB',
  // },
  // grading:{
  //   IA: '/case-grading/IA',
  //   IB: '/case-grading/IB',
  //   IIA: '/case-grading/IIA',
  //   IIB: '/case-grading/IIB',
  //   IIIA: '/case-grading/IIIA',
  //   IIIB: '/case-grading/IIIB',
  // }
  // };
  const selectedRoute = baseRoutes[mode] || baseRoutes.progress;
  // const selectedRouting = routeMap[year] || routeMap.progress;
  // console.log('Selected Route:', currentState);
  navigate(selectedRoute, { replace: false });
};

// // This function correctly calculates pending procedures
export const calculatePendingProcedures = () => {
  let count = 0;
  // categories.forEach(category => {
  //   category.procedures.forEach(proc => {
  //     // A procedure is pending if it has no completed targets
  //     if (proc.completion === 0) count++;
  //   });
  // });
  return count;
};

// This function correctly calculates in-progress procedures
export const calculateInProgressProcedures = () => {
  let count = 0;
  // categories.forEach(category => {
  //   category.procedures.forEach(proc => {
  //     // A procedure is in progress if it has some completed targets but not all
  //     if (proc.completion > 0 && proc.completion < 100) count++;
  //   });
  // });
  return count;
};

export const calculateCompletedProcedures = () => {
  let count = 0;
  // state.categories.forEach(category => {
  //   category.procedures.forEach(proc => {
  //     // Count each completed target within procedures
  //     if (proc.targets) {
  //       proc.targets.forEach(target => {
  //         if (target.completed) {
  //           count++;
  //         }
  //       });
  //     }
  //   });
  // });
  return count;
};

export const calculateTotalProcedures = () => {
  let count = 0;
  // categories.forEach(category => {
  //   category.procedures.forEach(proc => {
  //     // Count each procedure based on its requirement value
  //     count += proc.requirement;
  //   });
  // });
  return count;
};

export const toggleCategory = (categoryId, state, dispatch) => {
  console.log("Toggling category:", categoryId);
  dispatch({ type: "TOGGLE_EXPAND", payload: { name: categoryId } });
};

export const navigateToRemarks = (
  navigate,
  level,
  clinicianName,
  remarks,
  courseCode,
  tallysheetID = "",
  tallyData
) => {
  navigate(`/remarks/${level}`, {
    state: {
      year: level,
      clinicianName,
      remarks,
      courseCode,
      tallysheetID,
      tallyData,
    },
    replace: false,
  });
};

export const calculatePercentCompletion = (cases) => {
  if (!cases || typeof cases !== "object") {
    return { percent: 0, completed: 0, total: 0 };
  }

  const validCases = Object.values(cases).filter(
    (caseItem) => caseItem && typeof caseItem === "object"
  );

  const total = validCases.length;
  const completed = validCases.filter(
    (caseItem) => caseItem.rating && parseInt(caseItem.rating) > 0
  ).length;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { percent, completed, total };
};

export const renderStatusBadge = (procedureData) => {
  if (!procedureData || Object.keys(procedureData).length === 0) {
    return { badgeBG: "danger", text: "Not Started" };
  }

  const { percent } = calculatePercentCompletion(procedureData);

  if (percent === 100) {
    return { badgeBG: "success", text: "Completed" };
  } else if (percent > 0) {
    return { badgeBG: "warning", text: "In Progress" };
  } else {
    return { badgeBG: "danger", text: "Not Started" };
  }
};

export const getRatingLabel = (numericRating) => {
  if (numericRating >= 75) return "pass";
  if (numericRating > 0) return "incomplete";
  return "fail";
};

export const getRatingValue = (label) => {
  switch (label) {
    case "pass":
      return 100;
    case "incomplete":
      return 50;
    case "fail":
      return 0;
    default:
      return 0;
  }
};

export const handleImageSource = (source, field, type = "signature") => {
  const image = field ? source[field] : source;

  if (!image) {
    return null;
  }
  if (typeof image !== "string") {
    return null;
  }
  if (image.startsWith("data:image/") || image.startsWith("blob:")) {
    return image;
  }

  return `${API_URL}/getFile/clinical_instructor_signature/${image}`;
};

export const handleSections = (data) => {
  if (!data || typeof data !== "object") return [];

  return Object.keys(data).filter((key) => {
    const value = data[key];

    const sectionByName =
      key.toLowerCase().includes("section") ||
      key.toLowerCase().includes("remarks") ||
      key.toLowerCase().includes("chair") ||
      key.toLowerCase().includes("course") ||
      key.toLowerCase().includes("level");

    const sectionStructure =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value.hasOwnProperty("clinicalInstructor") ||
        value.hasOwnProperty("date") ||
        value.hasOwnProperty("status") ||
        value.hasOwnProperty("sign"));
    const isSimpleField =
      typeof value === "string" || typeof value === "number";
    return sectionByName || sectionStructure || isSimpleField;
  });
};

// Add this function to validate categories and subcategories based on year level
export const isValidCategory = (yearLevel, category) => {
  if (!yearLevel || !TALLY_SHEET_MODELS[yearLevel]) return false;
  return !!TALLY_SHEET_MODELS[yearLevel].categories[category];
};

export const isValidSubcategory = (yearLevel, category, subcategory) => {
  if (!isValidCategory(yearLevel, category)) return false;
  return TALLY_SHEET_MODELS[yearLevel].categories[
    category
  ].subcategories.includes(subcategory);
};

// Updated cleanData function that uses the model for validation
export const cleanData = (data, yearLevel) => {
  const sections = {};
  const procedures = {};

  if (!data || !yearLevel || !TALLY_SHEET_MODELS[yearLevel]) {
    return { sections, procedures };
  }

  // Process non-procedure sections
  ["remarks", "courseCode", "clinicalChair"].forEach((key) => {
    if (data[key]) sections[key] = data[key];
  });

  // Get the model for this year level
  const yearModel = TALLY_SHEET_MODELS[yearLevel];

  // Process only valid categories from the model
  Object.keys(yearModel.categories).forEach((categoryKey) => {
    // Skip if the category doesn't exist in data
    if (!data[categoryKey]) {
      return;
    }

    // Extract category data (excluding expanded property)
    const { expanded, ...categoryData } = data[categoryKey] || {};

    // Initialize the category
    procedures[categoryKey] = {};

    // Process only valid subcategories from the model
    yearModel.categories[categoryKey].subcategories.forEach(
      (subcategoryKey) => {
        // Only include if it exists in the data
        if (
          categoryData[subcategoryKey] &&
          typeof categoryData[subcategoryKey] === "object"
        ) {
          procedures[categoryKey][subcategoryKey] =
            categoryData[subcategoryKey];
        }
      }
    );

    // Remove empty categories
    if (Object.keys(procedures[categoryKey]).length === 0) {
      delete procedures[categoryKey];
    }
  });

  return { sections, procedures };
};
// Improve the format procedure name function to handle special cases
export const formatProcedureName = (str) => {
  if (!str) return "";

  // Handle special cases with lookup table to ensure exact naming
  const specialCases = {
    fixedPartialDenturesPosterior: "Fixed Partial Dentures Posterior",
    porcelainFusedMetalCrownAnterior: "Porcelain Fused Metal Crown Anterior",
    porcelainFusedMetalCrownPosterior: "Porcelain Fused Metal Crown Posterior",
    posteriorMultiRooted: "Posterior Multi Rooted",
    immediateRotary: "Immediate Rotary",
    // Pediatric Dentistry category names
    OralRehabilitation: "Oral Rehabilitation",
    OralProphylaxisAndTopicalFluoride: "Oral Prophylaxis and Topical Fluoride",
    PitAndFissueSealants: "Pit and Fissure Sealants",
    Pulpotomy: "Pulpotomy",
    StainlessSteelCrowns: "Stainless Steel Crowns",
    StripOffCrown: "Strip Off Crown",
    Restorations: "Restorations",
    Extractions: "Extractions",
    // Add more special cases as needed
  };

  // Check if this is a special case
  if (specialCases[str]) {
    return specialCases[str];
  }

  // Normal case formatting
  return str
    .replace(/([A-Z])/g, " $1") // Insert space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .replace(/([a-zA-Z])(\d+)/g, "$1 $2") // Add space between letters and numbers
    .trim();
};

export const SectionsOnly = (sections) => {
  // Create a copy of the sections object with only the section entries
  const result = {};
  const specialSections = [
    "periodonticsSection", 
    "restorativeSection", 
    "prosthodonticsSection", 
    "oralSurgerySection", 
    "oralDiagnosisSection", 
    "endodonticsSection", 
    "pediatricSection", 
    "orthodonticsSection",
    "revalida" // Add revalida here to include it
  ];
  
  if (sections) {
    specialSections.forEach(sectionKey => {
      if (sections[sectionKey]) {
        result[sectionKey] = sections[sectionKey];
      }
    });
  }
  
  return result;
};

/**
 * Utility functions for validating section completion status
 */

// Requirements mapping for each section by clinic level
const REQUIREMENTS_BY_LEVEL = {
  IA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
  },
  IB: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
  },
  IIA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
    endodonticsSection: ["endodontics"],
  },
  IIB: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
  },
  IIIA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
    endodonticsSection: ["endodontics"],
  },
  IIIB: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
    orthodonticsSection: ["orthodontics"],
  },
  IVA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    endodonticsSection: ["endodontics"],
    orthodonticsSection: ["orthodontics"],
  },
  IVB: {
    restorativeSection: ["restorativeDentistry"],
    prosthodonticsSection: ["prosthodontics"],
    revalida: [],
  },
};

/**
 * Checks if a procedure is complete (has a signature)
 * @param {Object} procedure - The procedure object to check
 * @returns {boolean} - True if the procedure is complete
 */
const isProcedureComplete = (procedure) => {
  // Skip if procedure doesn't exist
  if (!procedure) return false;

  // Check if procedure has cases (one, two, etc.)
  const keys = Object.keys(procedure);
  for (const key of keys) {
    const caseItem = procedure[key];
    // Skip metadata fields
    if (["clinicalInstructor", "date", "status"].includes(key)) continue;

    // If any case is null, procedure is incomplete
    if (!caseItem || !caseItem.signature) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a category is complete (all procedures have signatures)
 * @param {Object} category - The category object to check
 * @returns {boolean} - True if all procedures in the category are complete
 */
const isCategoryComplete = (category) => {
  // Skip if category doesn't exist
  if (!category) return false;

  // Check each procedure in the category
  const procedureKeys = Object.keys(category);
  // Skip metadata fields
  const relevantProcedures = procedureKeys.filter(
    (key) => !["clinicalInstructor", "date", "status", "sign"].includes(key)
  );

  // If no relevant procedures, consider complete
  if (relevantProcedures.length === 0) return true;

  // Check each procedure
  for (const procKey of relevantProcedures) {
    if (!isProcedureComplete(category[procKey])) {
      return false;
    }
  }

  return true;
};

/**
 * Validates if a section can be signed based on clinic level and requirements
 * @param {string} sectionKey - The section key (e.g., "restorativeSection")
 * @param {Object} data - The full tallysheet data
 * @param {string} clinicLevel - The clinic level (IA, IB, etc.)
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateSectionCompletion = (sectionKey, data, clinicLevel) => {
  console.log(`Validating ${sectionKey} for clinic level ${clinicLevel}`);
  console.log("Data structure:", Object.keys(data));

  // Default to allowing signature if we can't validate
  if (sectionKey === "revalida") {
    return { isValid: true, message: "" }; // You can add specific validation here
  }
  const defaultResponse = { isValid: true, message: "" };

  // If no clinic level provided, we can't validate
  if (!clinicLevel) {
    console.warn("No clinic level provided, skipping validation");
    return defaultResponse;
  }

  // Get requirements for this clinic level
  const levelRequirements = REQUIREMENTS_BY_LEVEL[clinicLevel];
  if (!levelRequirements) {
    console.warn(`No requirements defined for clinic level ${clinicLevel}`);
    return defaultResponse;
  }

  // Get requirements for this section
  const sectionRequirements = levelRequirements[sectionKey];
  if (!sectionRequirements || sectionRequirements.length === 0) {
    console.log(
      `No specific requirements for ${sectionKey} at level ${clinicLevel}`
    );
    return defaultResponse;
  }

  console.log(`Required categories for ${sectionKey}:`, sectionRequirements);

  // Check each required category
  const incompleteCategories = [];
  for (const categoryKey of sectionRequirements) {
    // Check if category exists in data
    if (!data[categoryKey]) {
      console.log(`Category ${categoryKey} not found in data`);
      continue;
    }

    // Check if category is complete
    if (!isCategoryComplete(data[categoryKey])) {
      incompleteCategories.push(categoryKey);
    }
  }

  // If any categories are incomplete
  if (incompleteCategories.length > 0) {
    return {
      isValid: false,
      message: `Cannot sign ${sectionKey}. The following categories are incomplete: ${incompleteCategories.join(
        ", "
      )}`,
    };
  }

  // All required categories are complete
  return defaultResponse;
};
