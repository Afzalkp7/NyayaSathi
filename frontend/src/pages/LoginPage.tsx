// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { ScalesIcon } from '../components/icons'; // Assuming icons.tsx is in components folder

// --- Reusable Components (Consider moving to a separate components/ui folder) ---
const LoadingSpinner = ({ color = 'border-white' }: { color?: string }) => (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${color} mx-auto`}></div>
);

const ErrorDisplay = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div role="alert" className="text-red-700 bg-red-100 p-3 my-4 rounded-md text-center text-sm border border-red-300">
            <strong>Error:</strong> {message}
        </div>
    );
};
// --- End Reusable Components ---


const LoginPage: React.FC = () => {
    const { login } = useAuth(); // Get the login function from context
    const navigate = useNavigate();
    const location = useLocation();
    // Determine where to redirect after login (intended page or default to homepage)
    const from = location.state?.from?.pathname || "/";

    // State for form fields, loading indicators, and error messages
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isGuestLoading, setIsGuestLoading] = useState(false); // Separate loading for guest
    const [error, setError] = useState<string | null>(null);

    // Update form state on input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Handle REGULAR form submission (Email/Password) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent submission if already loading
        if (isLoginLoading || isGuestLoading) return;

        setIsLoginLoading(true); // Show loading indicator for login button
        setError(null); // Clear previous errors

        // Basic frontend validation
        if (!formData.email || !formData.password) {
            setError("Please enter both email and password.");
            setIsLoginLoading(false);
            return;
        }

        try {
            // --- FIX: Use the full API URL ---
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), // Send email and password
            });
            // --- END FIX ---

            const data = await response.json(); // Parse the JSON response

            if (!response.ok) {
                // If response status is not 2xx, throw an error with the message from backend
                throw new Error(data.msg || 'Login failed. Please check your credentials.');
            }

            // On successful login (response.ok):
            // Call the login function from AuthContext with the received token and user data
            if (data.token && data.user) {
                login(data.token, data.user);
                // Redirect the user to the page they were trying to access, or the homepage.
                // navigate(from, { replace: true }); // 'replace' prevents going back to login page
                navigate("/")
            } else {
                // Handle unexpected successful response without token/user
                throw new Error("Login response was successful but missing data.");
            }

        } catch (err: any) {
            // Set error state to display the message to the user
            setError(err.message || "An unexpected error occurred during login.");
            console.error("Login Error:", err);
        } finally {
            setIsLoginLoading(false); // Hide loading indicator regardless of success/failure
        }
    };

    // --- FIX: Handle GUEST LOGIN button click ---
    const handleGuestLogin = async () => {
        if (isLoginLoading || isGuestLoading) return;
        setIsGuestLoading(true);
        setError(null);

        try {
            // Fix: Use single /api path since we have Vite proxy configured
            const response = await fetch('/api/auth/guest-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Read response text once
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response:', text);
                throw new Error('Server returned invalid JSON');
            }

            if (!response.ok) {
                throw new Error(data?.message || `Request failed (${response.status})`);
            }

            if (!data?.token || !data?.user) {
                throw new Error('Response missing required data');
            }

            login(data.token, data.user);
            navigate(from, { replace: true });

        } catch (err: any) {
            setError(err.message || 'Failed to create guest session');
            console.error('Guest Login Error:', err);
        } finally {
            setIsGuestLoading(false);
        }
    };
    // --- END FIX ---


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ScalesIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Sign in to NyayaSathi
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Display Error Message */}
                    <ErrorDisplay message={error} />

                    {/* Regular Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email" // Should match state key and backend expectation
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password" // Should match state key and backend expectation
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                            {/* Optional: Add Forgot Password link here */}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                // Disable if either login or guest login is in progress
                                disabled={isLoginLoading || isGuestLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoginLoading ? <LoadingSpinner color="border-white" /> : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
                        </div>
                    </div>

                    {/* Guest login button */}
                    <div className="mt-6">
                        <button
                            onClick={handleGuestLogin} // Now calls the fixed function
                            // Disable if either login or guest login is in progress
                            disabled={isLoginLoading || isGuestLoading}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        >
                             {isGuestLoading ? <LoadingSpinner color="border-gray-600" /> : 'Continue as Guest'}
                        </button>
                         <p className="mt-2 text-xs text-center text-gray-500">Guest access has limited features and usage.</p>
                    </div>

                    {/* Sign up option */}
                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-500">
                            Don’t have an account?{' '}
                            <Link
                                to="/signup" // Correct path to your signup page
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Sign up for NyayaSathi
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;