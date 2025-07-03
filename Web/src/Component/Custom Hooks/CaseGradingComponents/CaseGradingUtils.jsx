// Import utilities from TallySheet to maintain consistency
import { 
    formatProcedureName as formatName, 
    getGradeColor 
} from '../TallySheetComponents/Utils';

// Re-export the formatProcedureName function for consistency
export const formatProcedureName = formatName;

// Calculate completion percentage for cases (identical to TallySheet's calculation)
export const calculateCaseCompletion = (procedureData) => {
  if (!procedureData || typeof procedureData !== 'object') {
    return { percent: 0, completed: 0, total: 0 };
  }
  
  const total = Object.keys(procedureData).length;
  const completed = Object.values(procedureData).filter(item => 
    item && item.rating && parseInt(item.rating) > 0).length;
  
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { percent, completed, total };
};

// Render status badge (identical to TallySheet's logic)
export const renderCaseStatusBadge = (procedureData) => {
  if (!procedureData || Object.keys(procedureData).length === 0) {
    return { badgeBG: 'danger', text: 'Not Started' };
  }
  
  const { percent } = calculateCaseCompletion(procedureData);
  
  if (percent === 100) {
    return { badgeBG: 'success', text: 'Completed' };
  } else if (percent > 0) {
    return { badgeBG: 'warning', text: 'In Progress' };
  } else {
    return { badgeBG: 'danger', text: 'Not Started' };
  }
};

// Toggle category expansion (identical to TallySheet's approach)
export const toggleCaseCategory = (categoryId, state, dispatch) => {
  if (!state || !categoryId) return;
  
  dispatch({
    type: 'TOGGLE_EXPAND',
    payload: { name: categoryId }
  });
};