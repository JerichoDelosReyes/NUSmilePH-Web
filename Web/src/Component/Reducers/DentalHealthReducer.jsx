export const INITIAL_STATE ={
    skin:{
        normal:true,
        abnormal_description:'',
    },
    eyes:{
        normal:true,
        abnormal_description:''
    },
    neck:{
        normal:true,
        abnormal_description:''
    },
    tmj:{
        normal:true,
        crepitus_right:false,
        crepitus_left:false,
        popping:false,
        deflection:false,
        abnormal_description:''
    },
    lymph_nodes:{
        normal:true,
        abnormal_description:''
    },
    lips:{
        normal:true,
        abnormal_description:''
    },
    buccal_mucosa:{
        normal:true,
        abnormal_description:''
    },
    vestibule:{
        normal:true,
        abnormal_description:''
    },
    alveolar_ridge:{
        normal:true,
        abnormal_description:''
    },
    hard_soft_palate:{
        normal:true,
        abnormal_description:''
    },
    oro_pharynx:{
        normal:true,
        abnormal_description:''
    },
    tongue:{
        normal:true,
        abnormal_description:''
    },
    floor_of_mouth:{
        normal:true,
        abnormal_description:''
    },
    salivary_glands:{
        normal:true,
        abnormal_description:''
    },
}

export const dentalHealthReducer = (state, action)=>{
    switch(action.type){
        case 'SET_NORMAL':
            return{
                ...state,
                [action.payload.field]:{
                    ...state[action.payload.field],
                    normal: action.payload.value,
                    abnormal_description:''
                }
            }
        case 'HANDLE_DESCRIPTION':
            return{
                ...state,
                [action.payload.field]:{
                    ...state[action.payload.field],
                    abnormal_description: action.payload.value
                }
            }
        case 'HANDLE_TMJ_INPUTS':
            return{
                ...state,
                tmj:{
                    ...state.tmj,
                    [action.payload.field]: action.payload.type === 'checkbox' ?
                    action.payload.checked : action.payload.value
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