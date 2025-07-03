export const INITIAL_STATE = {
    firstname: '',
    middlename: '',
    lastname: '',
    dob: '',
    age: '',
    gender: '',
    marital_status: '',
    prefix: '',
    religion: '',
    height: '',
    weight: '',
    children: '',
    occupation: '',
    permanent_address: '',
    contact_no: '',
    email_address: '',
    emergency_person: '',
    relationship_to_patient: '',
    emergency_contact_no: '',
    emergency_address: '',
    chiefComplaint: '',
    illnessHistory: ''
}

export const patientDataReducer = (state, action) => {
    switch(action.type){
        case 'HANDLE_INPUTS':
            return{
                ...state,
                [action.payload.name]: action.payload.value
            }
        case 'HANDLE_GENERATED_PATIENT':
            return action.payload
        case 'HANDLE_EXISTING_PATIENT':
            return action.payload
        case 'RESET':
            return INITIAL_STATE
        default:
            return state
    }
}