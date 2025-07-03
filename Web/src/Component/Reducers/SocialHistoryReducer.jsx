export const INITIAL_STATE = {
    smoking: {
        uses: false,
        kind: '',
        frequency: '',
        duration_years: '',
        has_stopped: false,
        stopped_duration: '',
    },
    alcohol: {
        uses: false,
        kind: '',
        frequency: '',
        duration_years: '',
        has_stopped: false,
        stopped_duration: '',
    },
    drug: {
        uses: false,
        frequency: '',
        duration_years: '',
        has_stopped: false,
        stopped_duration: '',
    },
}

export const socialHistoryReducer = (state, action)=>{
    switch(action.type){
        case 'HANDLE_INPUTS':
            return{
                ...state,
                [action.payload.field]: {
                    ...state[action.payload.field],
                    [action.payload.name]: action.payload.type === 'checkbox' ?
                        action.payload.checked : action.payload.value
                }
            }
        case 'HANDLE_UPDATE_SOCIAL_HISTORY':
            return action.payload
        case 'RESET':
            return INITIAL_STATE
        default:
            return state
    }
}