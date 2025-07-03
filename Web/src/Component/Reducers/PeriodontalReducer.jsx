export const INITIAL_STATE = {
    nucd_classification: {
      total_points: 0,
      classification: "",
      instructor: "",
    },
    asa_type: "",
    probing_exploring: {
        none: true, 
        localized: false, 
        generalized: false 
    },
    sub_marginal: { //calculusSubMarginal
      none: false,
      light: false,
      moderate: false,
      heavy: false,
      dense: false,
    },
    supra_marginal: { //calculusSupraMarginal
        none: true, 
        light: false, 
        medium: false, 
        heavy: false 
    },
    periodontal_tissues: {
      gingivitis: false, //periodontalStatus
      periodontitis_stage_1: false, //periodontitis
      periodontitis_stage_2: false, //periodontitis
      periodontitis_stage_3: false, //periodontitis
      periodontitis_stage_4: false, //periodontitis
      perio_maintenance: false, //periodontalStatus
    },
    oral_hygiene: { //extrinsicStains
        none: true, 
        light: false, 
        moderate: false, 
        heavy: false 
    },
    aap_classification: "",
}

export const periodontalReducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUT':
            return{
                ...state,
                [action.payload.name]:action.payload.value
            }
        case 'HANDLE_TOTAL_POINTS':
            return{
                ...state,
                nucd_classification:{
                    ...state.nucd_classification,
                    total_points: action.payload
                }
            }
        case 'HANDLE_OBJECT_INPUT':
            return{
                ...state,
                [action.payload.name]:{
                    ...state[action.payload.name],
                    [action.payload.field]: action.payload.value
                }
            }
        case 'HANDLE_PERIODONTAL_INPUTS':
            return{
                ...state,
                periodontal_tissues:{
                    ...state.periodontal_tissues,
                    periodontitis_stage_1: false,
                    periodontitis_stage_2: false,
                    periodontitis_stage_3: false,
                    periodontitis_stage_4: false,
                    [action.payload]: true
                }
            }
        case 'HANDLE_PERIODONTAL_STATUS':
            return{
                ...state,
                periodontal_tissues:{
                    ...state.periodontal_tissues,
                    gingivitis: false,
                    perio_maintenance: false,
                    [action.payload]:true
                }
            }
        case 'CLEAR_PERIODONTAL_STATUS':
            return{
                ...state,
                periodontal_tissues:{
                    ...state.periodontal_tissues,
                    gingivitis: false,
                    perio_maintenance: false,
                }
            }
        case 'CLEAR_PERIODONTAL_INPUTS':
            return{
                ...state,
                periodontal_tissues:{
                    ...state.periodontal_tissues,
                    periodontitis_stage_1: false,
                    periodontitis_stage_2: false,
                    periodontitis_stage_3: false,
                    periodontitis_stage_4: false,
                }
            }
        case 'HANDLE_PROBING_EXPLORING':
            return{
                ...state,
                [action.payload.name]:
                    Object.keys(state[action.payload.name])
                    .reduce((acc, key)=> {
                        acc[key] = key === action.payload.value;
                        return acc;
                    }, {}),
                
            }
        case 'RESET_INPUTS':
            return INITIAL_STATE
        case 'GET_DATA':
            return {
                ...state,
                ...action.payload
            }
        default:
            return state
    }
}