export const INITIAL_STATE = {
    pregnant: false,
    breast_feeding: false,
    menopause: false,
    hormone_replacement: false,
    pregnantMonths: '',
}

export const femaleReducer = (state, action) => {
    switch(action.type){
        case 'HANDLE_INPUT':
            return{
                ...state,
                [action.payload.name]: action.payload.type === 'checkbox' ? 
                    action.payload.checked : action.payload.value,
            }
        case 'GET_DATA':
            return action.payload
        default:
            return state;
    }
}