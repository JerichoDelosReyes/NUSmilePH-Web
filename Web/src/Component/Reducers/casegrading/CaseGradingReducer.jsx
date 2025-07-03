export const INITIAL_STATE = {
    data: {},
    selectedProcedure: null,
    selectedCase: null,
    selectedPath: null,
    grade: "",
    signatory: "",
    completionDate: "",
    feedback: "",
    showGradeModal: false,
    signatureImg: "",
    showSignaturePad: false,
    penaltyCaseName: "",
    selectedYear: '',
    clinicalChair: {
        sign: null
    },
};

export const caseGradingReducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_EXPAND':
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.payload.name]: {
                        ...state.data[action.payload.name],
                        expanded: !state.data[action.payload.name]?.expanded
                    }
                }
            };
        case 'GET_DATA':
            // Add expanded property to all categories
            const dataWithExpanded = {};
            Object.keys(action.payload).forEach(key => {
                if (typeof action.payload[key] === 'object' && 
                    action.payload[key] !== null && 
                    !Array.isArray(action.payload[key])) {
                    dataWithExpanded[key] = { 
                        ...action.payload[key], 
                        expanded: action.payload[key]?.expanded || true 
                    };
                } else {
                    dataWithExpanded[key] = action.payload[key];
                }
            });
            return {
                ...state,
                data: dataWithExpanded
            };
        case 'HANDLE_SELECTED_YEAR':
            return {
                ...state,
                selectedYear: action.payload
            };
        case 'HANDLE_CLINICAL_CHAIR':
            return {
                ...state,
                clinicalChair: action.payload
            };
        case 'SET_MODAL_DATA':
            return {
                ...state,
                ...action.payload
            };
        case 'HANDLE_MODAL':
            return {
                ...state,
                showGradeModal: action.payload
            };
        case 'HANDLE_SIGNATURE_PAD':
            return {
                ...state,
                showSignaturePad: action.payload
            };
        case 'HANDLE_FILE_UPLOAD':
            return {
                ...state,
                signatureImg: action.payload
            };
        case 'HANDLE_CHANGE':
            return {
                ...state,
                [action.payload.name]: action.payload.value
            };
        default:
            return state;
    }
};