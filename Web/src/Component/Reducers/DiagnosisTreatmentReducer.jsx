export const INITIAL_STATE = {
    diagnosis:'',
    treatmentPlan:'',
    consentGiven:null,
    patientName:'',
    patientSignature: null,
    imgURI: null,
    modalVisible: false,
}

export const diagnosisTreatmentReducer = (state, action) => {
    switch(action.type){
        case 'HANDLE_INPUTS':
            return{
                ...state,
                [action.payload.name]: action.payload.type === 'checkbox' ? 
                action.payload.checked : action.payload.value
            }
        case 'HANDLE_PATIENT_NAME':
            return{
                ...state,
                patientName: action.payload
            }
        case 'HANDLE_MODAL':
            return{
                ...state,
                modalVisible: action.payload
            }
        case 'HANDLE_CONSENT':
            return{
                ...state,
                consentGiven: state.consentGiven === action.payload ? null : action.payload
            }
        case 'HANDLE_SIGNATURE':
            return{
                ...state,
                patientSignature: action.payload.signature,
                imgURI: null
            }
        case 'UPLOAD_SIGNATURE':
            return{
                ...state,
                patientSignature: null,
                imgURI: action.payload
            }
        case 'RESET_INPUTS':
            return INITIAL_STATE
        case 'GET_DATA':
            return action.payload
        default:
            return state
    }
}