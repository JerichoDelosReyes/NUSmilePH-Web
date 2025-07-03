import {createContext, useState} from 'react'

export const ClinicianSheet = createContext({});

export const CaseProvider = ({children})=>{
    const [clinicianInfo, setClinicianInfo] = useState('hello')
    return(
        <ClinicianSheet.Provider value={{clinicianInfo, setClinicianInfo}}>
            {children}
        </ClinicianSheet.Provider>
    )
}