export const progressTrackerReducer = (state, action)=>{
    switch(action.type){
        case 'TOGGLE_EXPAND':
            return {
                ...state,
                data:{
                    ...state.data,
                    [action.payload.name]:{
                        ...state.data[action.payload.name],
                        expanded: !state.data[action.payload.name].expanded
                    }
                }
            }
        case 'FETCH_DATA':
            return{
                ...state,
                data: action.payload
            }
        case 'GET_DATA':
            return {
                ...state,
                ...action.payload
            }
        case 'GET_TALLY_SHEET_ID':
            return{
                ...state,
                tallySheetID: action.payload
            }
        case 'HANDLE_SELECTED_YEAR':
            return{
                ...state,
                selectedYear: action.payload
            }
        // case 'GET_FIXED_PARTIAL_DENTURES':
        //     return {
        //         ...state,
        //         fixedPartialDentures: action.payload
        //     }
        case 'FIXED_PARTIAL_DENTURES':
            return {
                ...state,
                data: {
                    ...state,
                    fixedPartialDentures: action.payload
                }
            }
        case 'HANDLE_CLINICAL_CHAIR':
            return{
                ...state,
                clinicalChair: action.payload
            }
        default:
            return state;
    }
}