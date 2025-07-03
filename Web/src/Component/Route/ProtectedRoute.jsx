import React, { useContext } from 'react'
import { UserContext } from '../Context/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user, loading } = useContext(UserContext);
    const location = useLocation();
    
    if (loading) return null;
    
    // If no user, redirect to login
    if (!user) {
        return <Navigate to='/login' replace 
            state={{ message: 'You must be logged in to access this page' }} />;
    }
    
    // If user has pending status and requires profile completion
    if (user.status === 'pending' && user.requiresProfileCompletion && !user.termsAccepted) {
        // Don't redirect if already on terms and conditions page
        if (location.pathname !== '/terms-and-conditions') {
            return <Navigate to='/terms-and-conditions' replace 
                state={{ message: 'Please complete your profile to continue' }} />;
        }
    }

    // If user is trying to access terms and conditions but doesn't need it
    if (location.pathname === '/terms-and-conditions' && 
        (!user.requiresProfileCompletion || user.status !== 'pending')) {
        return <Navigate to='/dashboard' replace />;
    }
    
    return <Outlet />;
}

export default ProtectedRoute