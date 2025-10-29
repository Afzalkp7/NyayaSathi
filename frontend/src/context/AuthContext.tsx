// src/context/AuthContext.tsx

import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types'; // Import User type

// Shape of the context value
interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => void; // Login now accepts user data
  logout: () => void;
  isLoading: boolean; // Indicates if initial auth check is happening
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state from localStorage
    const [token, setToken] = useState<string | null>(localStorage.getItem('nyayasathi_token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('nyayasathi_user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            console.error("Failed to parse stored user data");
            localStorage.removeItem('nyayasathi_user'); // Clean up bad data
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true); // Start loading

    // Effect to verify token and fetch/confirm user data on initial load or token change
    useEffect(() => {
        const verifyTokenAndConfirmUser = async (authToken: string) => {
            if (!user) setIsLoading(true);
            try {
                // Add proper error handling and response parsing
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                // Read response text once
                const text = await response.text();
                let userData: User | null = null;

                try {
                    if (text) {
                        userData = JSON.parse(text);
                    }
                } catch (e) {
                    console.error('Failed to parse user data:', text);
                    throw new Error('Invalid response format');
                }

                if (!response.ok) {
                    throw new Error(`Auth verification failed (${response.status})`);
                }

                if (!userData) {
                    throw new Error('No user data received');
                }

                // Update state and localStorage only if data differs
                if (!user || JSON.stringify(user) !== JSON.stringify(userData)) {
                    setUser(userData);
                    localStorage.setItem('nyayasathi_user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error("Error verifying token or fetching user data:", error);
                handleLogout();
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            verifyTokenAndConfirmUser(token);
        } else {
            // No token exists, ensure user state is cleared and stop loading
            if (user) setUser(null); // Clear user state if there was one
            localStorage.removeItem('nyayasathi_user'); // Ensure storage is clear
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Rerun this effect ONLY when the token value itself changes

    // Login function: Stores token and user data received from backend
    const handleLogin = (newToken: string, userData: User) => {
        localStorage.setItem('nyayasathi_token', newToken);
        localStorage.setItem('nyayasathi_user', JSON.stringify(userData));
        setUser(userData); // Update user state immediately
        setToken(newToken); // Update token state (triggers useEffect for consistency, though user is set)
    };

    // Logout function: Clears token and user data from storage and state
    const handleLogout = () => {
        localStorage.removeItem('nyayasathi_token');
        localStorage.removeItem('nyayasathi_user');
        setToken(null); // Update token state (triggers useEffect)
        setUser(null); // Update user state
    };

    // Value object provided by the context
    const value = { token, user, login: handleLogin, logout: handleLogout, isLoading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context easily in components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Ensures hook is used within the provider
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};