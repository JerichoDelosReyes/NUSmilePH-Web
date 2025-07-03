export const INITIAL_STATE = {
    // Occlusion
    class_I: false,
    class_II_div_1: false,
    class_II_div_2: false,
    class_III: false,
    other_occlusal_abnormalities: "",
    parafunctional_oral_habits: "",
    // Plaque Enamel
    plaque: "",
    distribution: "",
    enamel_conditions: {
      erosion: false,
      demineralization: false,
      attrition: false,
      abfraction: false,
      fluorosis: false,
      abrasion: false,
    },
    // Gingival
    color: "",
    consistency: "",
    contour: "",
    texture: "",
}

export const dentalHistory2Reducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUTS':
            return{
                ...state,
                [action.payload.name]: action.payload.type === 'checkbox' ? 
                action.payload.checked : action.payload.value
            }
        case 'HANDLE_PLAQUE_INPUTS':
            return{
                ...state,
                [action.payload.name]: action.payload.id
            }
        case 'HANDLE_ENAMEL_INPUTS':
            return{
                ...state,
                enamel_conditions: {
                    ...state.enamel_conditions,
                    [action.payload.name]: action.payload.checked
                }
            }
        case 'CLEAR_INPUTS':
            return INITIAL_STATE
        case 'GET_DATA':
            return {
                ...state,
                ...action.payload,
                enamel_conditions:{
                    ...action.payload.enamel_conditions,
                }
            }
        default:
            return state
    }
}