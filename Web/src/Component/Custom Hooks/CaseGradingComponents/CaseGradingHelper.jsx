import axios from "axios";
import { convertImageBase64ToBlob } from "../ConvertImageBlob";
import {format, isValid, parseISO} from 'date-fns';
import { API_URL } from "../../../config/api";

export const getClinicianData = async (selectedYear,clinicianID, dispatch) =>{
    if(!clinicianID){
        return;
    }
    
    // Handle different endpoint patterns for pediatric dentistry
    let endpoint;
    if(selectedYear === 'PediatricDentistry') {
        endpoint = `${API_URL}/getPediatricDentistry/${clinicianID}`;
    } else {
        endpoint = `${API_URL}/get${selectedYear}/${clinicianID}`;
    }
    
    await axios.get(endpoint)
    .then((res)=>{
        console.log("Clinician Data:", res.data);
        dispatch({type:'GET_DATA', payload: res.data})
    })
    .catch((err)=>{
        console.error("Error fetching clinician data:", err);
    })
}

export const handleSaveGrade = async (props)=>{
    const {state, dispatch, clinicianID,
        clinicalInstructorID, messageApi} = props

    if(!state.signatory){
        return messageApi.error("Please enter a signatory name");
    }
    if(!state.completionDate){
        return messageApi.error("Please select a completion date");
    }
    
    const idParts = state.selectedPath.split('.');
    console.log("ID Parts:", idParts);
    const categoryKey = idParts[0];
    const isPenalty = categoryKey === 'penalty';
    
    // Handle different endpoint patterns for different subjects
    const isPediatricDentistry = state.selectedYear === 'PediatricDentistry' || 
                                 (categoryKey === 'pediatricDentistry');

    if(!isPenalty && !state.grade){
        return messageApi.error("Please enter a grade");
    }
    try{
        messageApi.loading('Saving...');
        const updatedCaseData = {
            clinicalInstructor:state.signatory,
            clinicalInstructorId: clinicalInstructorID,
            date: state.completionDate,
            feedback:state.feedback
        }
        const formData = new FormData();
        formData.append('iaId', clinicianID);
        
        if(isPenalty){
            if(isPediatricDentistry) {
                formData.append('pediatricId', clinicianID);
                formData.append('penaltyPath', state.selectedPath);
                formData.append('caseName', state.penaltyCaseName);
            } else {
                formData.append('penaltyPath', state.selectedPath);
                formData.append('caseName', state.penaltyCaseName);
            }
        }
        else{
            if(isPediatricDentistry) {
                formData.append('pediatricId', clinicianID);
                formData.append('sectionPath', state.selectedPath);
                formData.append('rating', parseInt(state.grade));
            } else {
                formData.append('sectionPath', state.selectedPath);
                formData.append('rating', parseInt(state.grade));
            }
        }
        formData.append('clinicalInstructorId', clinicalInstructorID);


        if(state.signatureImg){
            const signatureType = getSignatureType(state.signatureImg);
            let signatureFile = state.signatureImg;
            if(signatureType === 'data-url' || signatureType === 'blob'){
                const imguri = convertImageBase64ToBlob(state.signatureImg);

                formData.append('clinical_instructor_signature', imguri, `signature-${Date.now()}.png`);
            }
        }

        console.log("Form Data:", formData);
        console.log('Selected Case:', state);
    
    if(isPenalty){
        let penaltyEndpoint;
        if(isPediatricDentistry) {
            penaltyEndpoint = `${API_URL}/PediatricDentistry/sign/penalty`;
        } else {
            penaltyEndpoint = `${API_URL}/${state.selectedYear}/sign/penalty`;
        }
        
        const penaltyCase = await axios.post(penaltyEndpoint, 
            formData, {headers: {'Content-Type': 'multipart/form-data'}})
        console.log("Penalty Case Response:", penaltyCase.data);
    }
    else{
        let signEndpoint;
        if(isPediatricDentistry) {
            signEndpoint = `${API_URL}/PediatricDentistry/sign/section`;
        } else {
            signEndpoint = `${API_URL}/${state.selectedYear}/sign/section`;
        }
        
        const signCase = await axios.post(signEndpoint,
            formData, {headers: {'Content-Type': 'multipart/form-data'}})
        console.log("Sign Case Response:", signCase.data);
    }
    messageApi.success("Grade saved successfully");
    dispatch({type:'HANDLE_MODAL', payload:false})
    } catch(err){
        console.log(err)
        messageApi.error("Error saving grade"); 
    }

}

export const getSignatureType = (signatureValue) =>{
    if(!signatureValue){
        return null;
    }
    if(typeof signatureValue !== 'string'){
        return null;
    }
    if(signatureValue.startsWith('data:image/')){
        return 'data-url';
    }
    if(signatureValue.startsWith('blob:')){
        return 'blob';
    }
    return 'file-id'
        
}

export const formatDateForInput = (dateValue) => {
  // Handle empty values
  if (!dateValue) return '';
  
  try {
    // Try to parse the date
    let dateObject;
    
    // If it's already in YYYY-MM-DD format, use it directly
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // Try to create a date object
    dateObject = new Date(dateValue);
    
    // Check if the date is valid
    if (!isValid(dateObject)) {
      return '';
    }
    
    // Format the date for the input (YYYY-MM-DD)
    return format(dateObject, 'yyyy-MM-dd');
  } catch (error) {
    console.error("Date formatting error:", error);
    return '';
  }
};
