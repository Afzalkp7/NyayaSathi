// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the hook

// Simple full-page loading spinner component
const FullPageSpinner = () => (
    <div className="flex justify-center items-center h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
    </div>
);

// Component to wrap routes that should only be accessible to logged-in users.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Get the current authentication status and loading state from our context.
    const { token, isLoading } = useAuth();
    const location = useLocation(); // Gets the current URL path

    // While the AuthContext is performing the initial check for a token
    // (e.g., on page load or after login/logout), show a loading indicator.
    if (isLoading) {
        return <FullPageSpinner />;
    }

    // If loading is finished and there's NO token, the user is not authenticated.
    // Redirect them to the login page.
    if (!token) {
        // We save the page the user was *trying* to access in the router's 'state'.
        // This allows the LoginPage to redirect them back to the intended page
        // after they successfully log in. 'replace' ensures the login page
        // isn't added to the browser's history stack.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If loading is done and a token exists, the user is authenticated.
    // Render the actual page component that was passed in as 'children'.
    return <>{children}</>;
};

export default ProtectedRoute;