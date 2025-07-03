import { useContext } from "react";
import { UserContext } from "./UserContext";

export const userAuth = () =>{
    const context = useContext(UserContext)

    if(!context){
        throw new Error('userAuth must be used within a UserProvider')
    }
    return context
}