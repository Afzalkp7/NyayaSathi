// src/components/WelcomeBanner.tsx
import React from 'react';

// This component receives one prop: a function to call when the "Get Help Now" button is clicked.
interface WelcomeBannerProps {
    onGetHelp: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onGetHelp }) => (
    <div className="bg-blue-600 rounded-xl p-8 md:p-12 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome to NyayaSathi</h1>
        <p className="mt-2 text-lg text-blue-100">Get instant legal advice and know your rights</p>
        <button
            onClick={onGetHelp}
            className="mt-6 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
        >
            Get Help Now
        </button>
    </div>
);

export default WelcomeBanner;