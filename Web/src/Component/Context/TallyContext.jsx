import { createContext } from "react";

export const TallyContext = createContext({});

export const TallyProvider = ({children}) =>{
    return(
        <TallyContext.Provider value={{}}>
            {children}
        </TallyContext.Provider>
    )
}