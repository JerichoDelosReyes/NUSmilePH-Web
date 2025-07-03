export const INITIAL_STATE = {
    procedures:'',
    date:'',
    time:'',
    patientName:'',
    patientSignature:null,
    clinicianName:'',
    clinicianSignature:null,
    clinicalInstructorName:'',
    clinicalInstructorSignature:null,
    modalVisible:false,
    currentSigner:null,
    imgURI:null,
    imgURI2:null
}

export const treatmentRecordReducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUT':
            return{
                ...state,
                [action.payload.name]: action.payload.value
            }
        case 'HANDLE_MODAL':
            return {
                ...state,
                modalVisible: action.payload
            }
        case 'HANDLE_SIGNATURE':
            return{ 
                ...state,
                [action.payload.field]: action.payload.value,
                imgURI: null
            }
        case 'UPLOAD_PATIENT_SIGNATURE':
            return{
                ...state,
                patientSignature: null,
                imgURI: action.payload.value
            }
        case 'UPLOAD_CLINICIAN_SIGNATURE':
            return{
                ...state,
                clinicianSignature: null,
                imgURI2: action.payload.value
            }
        case 'HANDLE_CURRENT_SIGNER':
            return{
                ...state,
                currentSigner: action.payload
            }
        case 'RESET':
            return INITIAL_STATE
        default:
            return state
    }
}