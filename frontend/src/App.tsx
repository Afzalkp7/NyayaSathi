// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import the providers and components
import { AuthProvider } from './context/AuthContext'; // Wraps the app
import ProtectedRoute from './components/ProtectedRoute'; // Protects routes
import Header from './components/Header'; // Your existing Header
import ChatModal from './components/ChatModal'; // Your existing ChatModal

// Import your page components
import HomePage from './pages/HomePage';
import DescribePage from './pages/DescribePage';
import LawLibraryPage from './pages/LawLibraryPage';
import AdvicePage from './pages/AdvicePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SectionDetailPage from './pages/SectionDetailPage';

const App: React.FC = () => {
    // State for ChatModal can remain here
    const [isChatModalOpen, setChatModalOpen] = React.useState(false);
    const handleOpenChat = () => setChatModalOpen(true);

    return (
        // 1. Wrap the ENTIRE application with AuthProvider.
        // This makes the authentication state (token, user, login, logout, isLoading)
        // available to all components inside via the useAuth() hook.
        <AuthProvider>
            <div className="min-h-screen bg-slate-100 flex flex-col">
                {/* Header is rendered within AuthProvider so it can use useAuth() */}
                <Header />

                {/* Main content area */}
                {/* Use flex-grow to make sure footer (if added) stays at bottom */}
                <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <Routes>
                        {/* --- Public Routes --- */}
                        {/* These routes are accessible whether the user is logged in or not */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* --- Protected Routes --- */}
                        {/* These routes are wrapped with <ProtectedRoute> */}
                        {/* If the user is not logged in, they will be redirected to /login */}
                        {/* The 'children' prop of ProtectedRoute is the page component */}
                        <Route
                            path="/" // Homepage
                            element={
                                <ProtectedRoute>
                                    <HomePage onOpenChat={handleOpenChat} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/describe" // Describe legal issue page
                            element={
                                <ProtectedRoute>
                                    <DescribePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/advice" // Page to display RAG results
                            element={
                                <ProtectedRoute>
                                    <AdvicePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/library" // Law library page
                            element={
                                <ProtectedRoute>
                                    <LawLibraryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/laws/:id" // Section detail page
                            element={
                                <ProtectedRoute>
                                    <SectionDetailPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/law-library" element={<LawLibraryPage />} />

                        {/* --- Catch-all Route --- */}
                        {/* Redirect any unknown paths to the homepage */}
                        {/* Ensure this is the LAST route defined */}
                        <Route path="*" element={<Navigate to="/" replace />} />

                    </Routes>
                </main>

                {/* ChatModal rendered outside Routes to overlay */}
                {/* It might need access to auth state via useAuth() if its functionality depends on login status */}
                <ChatModal
                    isOpen={isChatModalOpen}
                    onClose={() => setChatModalOpen(false)}
                />

                {/* Optional: Add a Footer component here */}
                {/* <Footer /> */}
            </div>
        </AuthProvider>
    );
};

export default App;