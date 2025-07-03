import React, {useContext} from 'react'
import { UserContext } from '../Context/UserContext'
import { Navigate, Outlet } from 'react-router';

const PublicRoute = () => {
    const {user, loading} = useContext(UserContext);
    if(loading) return null;

    console.log("User in PublicRoute:", user);

    return user ? 
        <Navigate to={'/dashboard'} replace/> :
        <Outlet />
}

export default PublicRoute
