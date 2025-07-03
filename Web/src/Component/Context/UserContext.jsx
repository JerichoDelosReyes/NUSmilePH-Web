import axios from "axios";
import { createContext, useReducer, useEffect, useState } from "react";
import API_ENDPOINTS from "../../config/api";

export const UserContext = createContext({});

export const UserReducer = (state, action)=>{
    switch(action.type){
        case 'LOGIN':
            return {user:action.payload}
        case 'LOGOUT':
            return {user: null}
        default:
            return state
    }
}

export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(UserReducer, {
        user: null
    })
    const [loading, setLoading] = useState(true)
    console.log('UserContext state:', state);

    const loggedUser = async ()=>{
      try {
        const res = await axios.get(`${API_ENDPOINTS.GET_SESSION_USER}`, {withCredentials:true})
        if(res.data){
          dispatch({type:'LOGIN', payload: res.data})
        }
      } catch (error) {
        dispatch({type:'LOGOUT'})
        console.error("Error fetching logged user:", error);  
      }
      setLoading(false);

    }

    useEffect(()=>{
      loggedUser();
    },[])

    if(loading) return null;
        return (
            <UserContext.Provider value={{...state, dispatch, loading}}>
                {children}
            </UserContext.Provider>
        );
}