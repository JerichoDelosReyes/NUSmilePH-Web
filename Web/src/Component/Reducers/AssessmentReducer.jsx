export const INITIAL_STATE = {
    date: '',
    bp: '',
    pr: '',
    rr: '',
    temp: '',
    physician_care: '',
    hospitalization: '',
    allergy_information:[],
    allergy_inputs:{
        allergies: false,
        aspirin: false,
        penicillin: false,
        latex: false,
        metal: false,
        unknown: false,
        none: false,
        other_info: {
            other:false,
            otherConditions: []
        },
    },
    otherText:'',
    illness: '',
    Inr_or_HbA1C: '',
    medications: '',
    childhood_disease_history: '',
    diagnosed_conditions:[],
    diagnosed_others: false,
    otherDiagnosedConditions:[],
    diagnosedText:'',
}

export const assessmentReducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUT':
            return {
                ...state,
                [action.payload.name]: action.payload.type === 'checkbox' 
                ? action.payload.checked : action.payload.value
            };
        case 'HANDLE_ALLERGY':
            const updatedArray = state.allergy_information.includes(action.payload.name)
            ? state.allergy_information.filter(item => item !== action.payload.name)
            : [...state.allergy_information, action.payload.name]
            return {
                ...state,
                allergy_information:updatedArray,
                allergy_inputs:{
                    ...state.allergy_inputs,
                    [action.payload.name]: action.payload.type === 'checkbox' 
                        ? action.payload.checked : action.payload.value
                }
            }
        case 'HANDLE_OTHER_ALLERGY':
            return {
                ...state,
                allergy_inputs:{
                    ...state.allergy_inputs,
                    other_info:{
                        ...state.allergy_inputs.other_info,
                        [action.payload.name]: action.payload.type === 'checkbox' 
                            ? action.payload.checked : action.payload.value
                    }
                }
            }
        case 'HANDLE_DIAGNOSED':
            return {
                ...state,
                diagnosed_conditions:
                    state.diagnosed_conditions.includes(action.payload) ?
                    state.diagnosed_conditions.filter(item => item !== action.payload)
                    : action.payload
            }
        case 'ADD_OTHER_ALLERGY':
            
            return {
                ...state,
                allergy_information: [
                    ...state.allergy_information,
                    action.payload
                ],
                allergy_inputs:{
                    ...state.allergy_inputs,
                    other_info:{
                        ...state.allergy_inputs.other_info,
                        otherConditions: 
                        [...state.allergy_inputs.other_info.otherConditions, action.payload]
                    }
                },
                otherText: ''
            };
        case 'REMOVE_OTHER_ALLERGY':
            return {
                ...state,
                allergy_information:
                    state.allergy_information.filter(item => item !== action.payload),
                allergy_inputs:{
                    ...state.allergy_inputs,
                    other_info:{
                        ...state.allergy_inputs.other_info,
                        otherConditions: 
                        state.allergy_inputs.other_info.otherConditions
                        .filter(item => item !== action.payload)
                    }
                }
            };
        case 'ADD_OTHER_DIAGNOSED':
            return {
                ...state,
                diagnosed_conditions: [
                    ...state.diagnosed_conditions,
                    action.payload
                ],
                otherDiagnosedConditions:[
                    ...state.otherDiagnosedConditions,
                    action.payload
                ],
                diagnosedText: ''
            };
        case 'REMOVE_OTHER_DIAGNOSED':
            return {
                ...state,
                diagnosed_conditions: 
                    state.diagnosed_conditions.filter(item => item !== action.payload),
                otherDiagnosedConditions:
                    state.otherDiagnosedConditions.filter(item => item !== action.payload)
            };
        case 'HANDLE_INPUT_CLEAR':
            return{
                ...state,
                [action.payload.name]: ''
            }
        case 'CLEAR_ALL_INPUTS':
            return INITIAL_STATE
        case 'GENERATE_DATA':
            return {
                ...state,
                ...action.payload
            }
        case 'HANDLE_EXISTING_PATIENT':
            return action.payload
        
        default:
            return state
    }
}