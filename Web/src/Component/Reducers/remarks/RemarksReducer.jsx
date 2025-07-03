export const remarksReducer = (state, action) => {
  switch (action.type) {
    case "HANDLE_INPUTS":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case "HANDLE_RATING":
      return {
        ...state,
        rating: action.payload,
      };
    case "HANDLE_MODAL":
      return {
        ...state,
        modalVisible: action.payload.visible,
        currentSignatureField:
          action.payload.field || state.currentSignatureField,
      };
    case "HANDLE_SIGNATURE":
      return {
        ...state,
        sectionForRemarks: {
          ...state.sectionForRemarks,
          [action.payload.field]: {
            ...state.sectionForRemarks[action.payload.field],
            status: action.payload.signature,
          },
        },
      };
    case "HANDLE_CHAIR_SIGNATURE":
      return {
        ...state,
        clinicalChairSignature: action.payload,
      };
    case "RESET_INPUTS":
      return {
        ...INITIAL_STATE,
        clinicianName: state.clinicianName,
        college: state.college,
      };
    case "GET_DATA":
      const sectionForRemarks = {};

      // Process all sections including revalida
      Object.entries(action.payload).forEach(([key, value]) => {
        sectionForRemarks[key] = {
          status: value?.status || null,
          date: value?.date || null,
          average: value?.average || null,
          clinicalInstructorName: value?.clinicalInstructorName || null,
        };
      });

      return {
        ...state,
        sectionForRemarks,
      };
    case "HANDLE_CHAIR_DATA":
      return {
        ...state,
        clinicalChairSignature: action.payload.clinicalChairSignature,
        rating: action.payload.rating,
        date: action.payload.date,
        clinicalInstructorName: action.payload.clinicalInstructorName,
      };
    case "SET_SAVE":
      return {
        ...state,
        save_success: action.payload,
      };
    default:
      return state;
  }
};
