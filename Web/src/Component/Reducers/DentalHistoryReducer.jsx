export const INITIAL_STATE = {
    // Dental History
    complication:'',
    frequency_visit:'',
    last_procedure:'',
    last_visit:'',
    local_anesthesia:'',
    no_brush:0,
    no_floss:0,
    no_mouthwash:0,
    toothbrush:'',
    toothpaste:'',
    // Dental Questionnaires
    bleedingAfterExtraction:{
        answer:'',
        details:''
    },
    experiencedExtraction:{
        answer:'',
        details:''
    },
    fluoridatedToothpaste:{
        answer:'',
        details:''
    },
    foodCatching:{
        answer:'',
        details:''
    },
    jawPain:{
        answer:'',
        details:''
    },
    likeSmile:{
        answer:'',
        details:''
    },
    orthodonticTreatment:{
        answer:'',
        details:''
    },
    periodontalProblems:{
        answer:'',
        details:''
    },
    sensitiveTeeth:{
        answer:'',
        details:''
    },
    spontaneousBleeding:{
        answer:'',
        details:''
    },
    
    wearsDenture:{
        answer:'',
        details:''
    },
}

export const dentalHistoryReducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUT':
            return {
                ...state,
                [action.payload.name]: action.payload.value
            }
        case 'HANDLE_QUESTION':
            return {
                ...state,
                [action.payload.field]:{
                    ...state[action.payload.field],
                    [action.payload.name]: action.payload.value
                }
            }
        case 'CLEAR_INPUTS':
            return INITIAL_STATE
        case 'GET_DATA':
            return action.payload
        default:
            return state
    }
}