// src/components/AdvicePage.tsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

// Define an interface for the relevant section structure
// This should match the JSON structure from your backend
interface RelevantSection {
    chapter: string;
    section_number: string;
    section_title: string;
    simple_explanation: string;
    legal_text: string;
    punishment: string;
}

// Define an interface for the main advice object
interface AdviceData {
    legalInformation: string;
    relevantSections: RelevantSection[];
    nextSteps: {
        suggestions: string;
        disclaimer: string;
    };
}

const AdvicePage: React.FC = () => {
    const location = useLocation();
    
    // Get the advice data passed from DescribePage
    // We type-cast it to our interface
    const advice: AdviceData = location.state?.advice;

    // If no advice data is present (e.g., user navigated here directly)
    // redirect them back to the describe page.
    if (!advice) {
        return <Navigate to="/describe" replace />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Your Legal Information</h1>
            
            {/* Legal Information (from AI) */}
            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Summary</h3>
                <p className="text-green-700 whitespace-pre-wrap">
                    {advice.legalInformation}
                </p>
            </div>

            {/* Relevant Laws (from Database) */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Relevant Laws & Sections</h3>
                <div className="space-y-4">
                    {advice.relevantSections.map((section, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-800">
                                {section.section_title} (Section {section.section_number})
                            </h4>
                            
                            <p className="text-gray-700 mb-3">
                                <strong>Simple Explanation:</strong> {section.simple_explanation}
                            </p>
                            <p className="text-gray-700 mb-3">
                                <strong>Legal Text (BNS):</strong> {section.legal_text}
                            </p>
                            <p className="text-red-700">
                                <strong>Punishment:</strong> {section.punishment}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Next Steps (from AI) */}
            <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">Recommended Next Steps</h3>
                {/* We use whitespace-pre-wrap to respect newlines from the AI's response */}
                <p className="text-orange-700 whitespace-pre-wrap">
                    {advice.nextSteps.suggestions}
                </p>
            </div>

             {/* Disclaimer (from AI) */}
             <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Disclaimer</h3>
                <p className="text-sm text-gray-600">
                    {advice.nextSteps.disclaimer}
                </p>
            </div>

            <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Save Advice
            </button>
        </div>
    );
};

export default AdvicePage;