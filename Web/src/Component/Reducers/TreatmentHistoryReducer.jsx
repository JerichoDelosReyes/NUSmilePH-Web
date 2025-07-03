export const INITIAL_STATE = {
    treatmentRecords: [],
    searchTerm:'',
    currentPage: 1,
    filteredRecords:[]
}

export const treatmentHistoryReducer = (state, action)=>{
    switch(action.type){
        case 'GET_TREATMENT_HISTORY':
            return {
                ...state,
                treatmentRecords: action.payload
            }
        case 'HANDLE_PAGINATION':
            return {
                ...state,
                currentPage: action.payload
            }
        case 'HANDLE_SEARCH':
            return {
                ...state,
                searchTerm: action.payload.value
            }
        case 'HANDLE_FILTERED_RECORDS':
            return{
                ...state,
                filteredRecords: action.payload
            }
        default:
            return state
    }
}