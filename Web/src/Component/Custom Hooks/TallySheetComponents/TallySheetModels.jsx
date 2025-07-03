/**
 * Schema model for tally sheets
 * Defines the allowed categories and subcategories for each year level
 * Use this for validation in the UI to prevent showing invalid categories
 */
export const TALLY_SHEET_MODELS = {
  IA: {
    categories: {
      typodont: {
        subcategories: [
          "class2maxPrepAndCO",
          "class2mandPrepAndCO",
          "class1AmPrep",
          "class2AmPrep",
          "class1PrepAndCO",
          "class2PrepAndCO",
        ],
      },
      fixedPartialDentures: {
        subcategories: [
          "maxillaryAnterior",
          "maxillaryPosterior",
          "mandibularAnterior",
          "mandibularPosterior",
        ],
      },
      scalingAndPolishing: {
        subcategories: ["moderate"],
      },
      prosthodontics: {
        subcategories: [
          "maxillaryRPDbilateral",
          "mandibularRPDbilateral",
          "porcelainMetalCrownAnterior",
          "allAcrylicCrownAnterior",
        ],
      },
      restorativeDentistry: {
        subcategories: ["class1CO", "class2CO"],
      },
      penalty: {
        subcategories: ["one", "two", "three", "four", "five"],
      },
    },
  },
  IB: {
    categories: {
      typodont: {
        subcategories: ["class3CO", "class4CO", "class5CO"],
      },
      porcelainFusedToMetalCrown: {
        subcategories: ["anterior", "posterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderate"],
      },
      prosthodontics: {
        subcategories: ["completeDenture"],
      },
      restorativeDentistry: {
        subcategories: ["class3CO", "class4CO", "class5CO"],
      },
      penalty: {
        subcategories: ["one", "two", "three", "four", "five", "six", "seven"],
      },
    },
  },
  IIA: {
    categories: {
      typodont: {
        subcategories: ["class2Prep", "class2maxPrepAndCO"],
      },
      fixedPartialDentures: {
        subcategories: ["maxillaryAnterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderateSevere"],
      },
      prosthodontics: {
        subcategories: ["porcelainMetalCrownAnterior"],
      },
      restorativeDentistry: {
        subcategories: ["class1CO"],
      },
      oralDiagnosis: {
        subcategories: ["caseDiscussion"],
      },
      endodontics: {
        subcategories: ["anteriorMonoRooted"],
      },
      oralSurgery: {
        subcategories: ["maxAnt", "mandAnt"],
      },
      penalty: {
        subcategories: ["one", "two", "three", "four", "five", "six", "seven"],
      },
    },
  },
  IIB: {
    categories: {
      typodont: {
        subcategories: [
          "class2MandPrepAndCO",
          "class3CO",
          "class4CO",
          "class5CO",
        ],
      },
      fixedPartialDentures: {
        subcategories: ["maxillaryAnterior", "maxillaryPosterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderateSevere"],
      },
      prosthodontics: {
        subcategories: [
          "maxillaryRPDBilateral",
          "mandibularRPDBilateral",
          "completeDenture",
        ],
      },
      restorativeDentistry: {
        subcategories: ["class2CO", "class3CO", "class4CO", "class5CO"],
      },
      oralDiagnosis: {
        subcategories: ["oralRehab"],
      },
      oralSurgery: {
        subcategories: ["maxPost", "mandPost"],
      },
      pediatricDentistry: {
        subcategories: [
          "OralRehabilitation",
          "OralProphylaxisAndTopicalFluoride",
          "PitAndFissueSealants",
          "Pulpotomy",
          "StainlessSteelCrowns",
          "StripOffCrown",
          "Restorations",
          "Extractions",
        ],
      },
      penalty: {
        subcategories: [
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten",
          "eleven",
          "twelve",
          "thirteen",
        ],
      },
    },
  },
  IIIA: {
    categories: {
      typodont: {
        subcategories: [
          "class2maxPrepAndCO",
          "class2mandPrepAndCO",
          "class1AmPrep",
          "class2AmPrep",
        ],
      },
      fixedPartialDentures: {
        subcategories: ["posterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderateSevere", "nonSurgicalRootPlaning"],
      },
      prosthodontics: {
        subcategories: [
          "fixedPartialDenturesPosterior",
          "porcelainFusedMetalCrownAnterior",
          "porcelainFusedMetalCrownPosterior",
        ],
      },
      restorativeDentistry: {
        subcategories: ["class1CO", "class2CO"],
      },
      oralDiagnosis: {
        subcategories: ["caseDiscussion"],
      },
      endodontics: {
        subcategories: ["posteriorMultiRooted"],
      },
      oralSurgery: {
        subcategories: ["maxAnt", "mandAnt"],
      },
      pediatricDentistry: {
        subcategories: [
          "OralRehabilitation",
          "OralProphylaxisAndTopicalFluoride",
          "PitAndFissueSealants",
          "Pulpotomy",
          "StainlessSteelCrowns",
          "StripOffCrown",
          "Restorations",
          "Extractions",
        ],
      },
      penalty: {
        subcategories: ["one", "two"],
      },
    },
  },
  IIIB: {
    categories: {
      typodont: {
        subcategories: ["class3CO", "class5CO"],
      },
      fixedPartialDentures: {
        subcategories: ["anterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderateSevere", "crownLenthening"],
      },
      prosthodontics: {
        subcategories: ["RPDMandMax", "completeDenture"],
      },
      restorativeDentistry: {
        subcategories: ["class3CO", "class4CO", "class5CO"],
      },
      oralDiagnosis: {
        subcategories: ["oralRehab"],
      },
      oralSurgery: {
        subcategories: ["maxPost", "mandPost", "specialCaseOpenFlap"],
      },
      orthodontics: {
        subcategories: ["interceptiveAppliance"],
      },
      pediatricDentistry: {
        subcategories: [
          "OralRehabilitation",
          "OralProphylaxisAndTopicalFluoride",
          "PitAndFissueSealants",
          "Pulpotomy",
          "StainlessSteelCrowns",
          "StripOffCrown",
          "Restorations",
          "Extractions",
        ],
      },
      penalty: {
        subcategories: ["one", "two"],
      },
    },
  },
  IVA: {
    categories: {
      typodont: {
        subcategories: ["class2maxPrepOnly", "class2mandPrepOnly"],
      },
      fixedPartialDentures: {
        subcategories: ["anterior", "posterior"],
      },
      scalingAndPolishing: {
        subcategories: ["moderate"],
      },
      prosthodontics: {
        subcategories: ["FPDAntPostAbu", "maxillaryRPD", "mandibularRPD"],
      },
      restorativeDentistry: {
        subcategories: ["class1CO"],
      },
      endodontics: {
        subcategories: ["immediateRotary"],
      },
      oralSurgery: {
        subcategories: ["maxPost", "mandPost", "odontectomy"],
      },
      orthodontics: {
        subcategories: ["interceptiveAppliance", "cephalometricRadiograph"],
      },
      pediatricDentistry: {
        subcategories: [
          "OralRehabilitation",
          "OralProphylaxisAndTopicalFluoride",
          "PitAndFissueSealants",
          "Pulpotomy",
          "StainlessSteelCrowns",
          "StripOffCrown",
          "Restorations",
          "Extractions",
        ],
      },
      penalty: {
        subcategories: ["one", "two"],
      },
    },
  },
  IVB: {
    categories: {
      prosthodontics: {
        subcategories: [
          "fixedPartialDentureCPET",
          "completeDentureCPET",
          "RPDCPET",
        ],
      },
      restorativeDentistry: {
        subcategories: ["class1CPET", "class2CPET"],
      },
      penalty: {
        subcategories: [
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
        ],
      },
      revalida: {
        subcategories: [],
      },
    },
    specialSections: ["revalida"],
  },
  PediatricDentistry: {
    categories: {
      OralRehabilitation: {
        subcategories: ["cases"],
      },
      OralProphylaxisAndTopicalFluoride: {
        subcategories: ["cases"],
      },
      PitAndFissueSealants: {
        subcategories: ["cases"],
      },
      Pulpotomy: {
        subcategories: ["cases"],
      },
      StainlessSteelCrowns: {
        subcategories: ["cases"],
      },
      StripOffCrown: {
        subcategories: ["cases"],
      },
      Restorations: {
        subcategories: ["class1", "class2", "class3"],
      },
      Extractions: {
        subcategories: ["cases"],
      },
      penalty: {
        subcategories: ["one", "two", "three", "four", "five", "six"],
      },
    },
  },
};

// Helper function to get section mappings for each year level
export const SECTION_MAPPINGS = {
  IA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
  },
  IB: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["porcelainFusedToMetalCrown", "prosthodontics"],
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
    pediatricSection: ["pediatricDentistry"],
  },
  IIIA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
    endodonticsSection: ["endodontics"],
    pediatricSection: ["pediatricDentistry"],
  },
  IIIB: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    oralDiagnosisSection: ["oralDiagnosis"],
    orthodonticsSection: ["orthodontics"],
    pediatricSection: ["pediatricDentistry"],
  },
  IVA: {
    restorativeSection: ["typodont", "restorativeDentistry"],
    prosthodonticsSection: ["fixedPartialDentures", "prosthodontics"],
    periodonticsSection: ["scalingAndPolishing"],
    oralSurgerySection: ["oralSurgery"],
    endodonticsSection: ["endodontics"],
    pediatricSection: ["pediatricDentistry"],
    orthodonticsSection: ["orthodontics"],
  },
  IVB: {
    restorativeSection: ["restorativeDentistry"],
    prosthodonticsSection: ["prosthodontics"],
    revalida: [],
  },
};

// Helper function to validate if a category exists for a given year level
export const validateCategory = (yearLevel, category) => {
  return TALLY_SHEET_MODELS[yearLevel]?.categories?.[category] !== undefined;
};

// Helper function to validate if a subcategory exists for a given year level and category
export const validateSubcategory = (yearLevel, category, subcategory) => {
  return (
    TALLY_SHEET_MODELS[yearLevel]?.categories?.[
      category
    ]?.subcategories?.includes(subcategory) === true
  );
};

// Helper function to get all categories for a year level
export const getCategoriesForYearLevel = (yearLevel) => {
  return Object.keys(TALLY_SHEET_MODELS[yearLevel]?.categories || {});
};

// Helper function to get all subcategories for a year level and category
export const getSubcategoriesForCategory = (yearLevel, category) => {
  return (
    TALLY_SHEET_MODELS[yearLevel]?.categories?.[category]?.subcategories || []
  );
};

// Helper function to get special sections for a year level
export const getSpecialSections = (yearLevel) => {
  return TALLY_SHEET_MODELS[yearLevel]?.specialSections || [];
};
