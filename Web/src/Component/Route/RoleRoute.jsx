import React, {useContext} from 'react'
import { UserContext } from '../Context/UserContext'
import { Outlet, Navigate } from 'react-router';

const RoleRoute = ({role}) => {
    const {user, loading} = useContext(UserContext);

    if(loading) return null;

    if(!user){
        return <Navigate to="/login" replace state={{message:'You must login first!'}} />
    }

    if(!role.includes(user.role)){
        return <Navigate to='/dashboard' replace 
            state={{message:"You don't have the authoritity to access this page"}}/>
    }

    return <Outlet/>

}

export default RoleRoute
