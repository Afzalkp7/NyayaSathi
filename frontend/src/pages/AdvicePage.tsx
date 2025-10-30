// src/components/AdvicePage.tsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import LawInfoModal from '../components/LawInfoModal';

// Define an interface for the relevant section structure
// This should match the JSON structure from your backend
interface RelevantSection {
    act_name?: string;
    law_code?: string;
    section_number: string;
    section_title: string;
    simple_explanation: string;
    legal_text: string;
    punishment: string;
}

// Define an interface for the main advice object
interface AdviceData {
    legalInformation: string;
    punishment?: string; // Top-level punishment summary
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

            {/* Punishment Summary (if available) */}
            {advice.punishment && (
                <div className="bg-red-50 p-6 rounded-lg shadow-sm border-l-4 border-red-600">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">⚖️ Applicable Punishment</h3>
                    <p className="text-red-700 whitespace-pre-wrap font-medium">
                        {advice.punishment}
                    </p>
                </div>
            )}

            {/* Relevant Laws (from Database) */}
                <RelevantSectionsCards sections={advice.relevantSections} />

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

    // --- Subcomponent: Cards + Modal logic ---
    const RelevantSectionsCards: React.FC<{ sections: RelevantSection[] }> = ({ sections }) => {
        const [selected, setSelected] = React.useState<RelevantSection | null>(null);
        const [lawDetail, setLawDetail] = React.useState<any | null>(null);
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState<string | null>(null);
        const [isOpen, setIsOpen] = React.useState(false);

        const openModal = async (sec: RelevantSection) => {
            setSelected(sec);
            setIsOpen(true);
            setLoading(true);
            setError(null);
            setLawDetail(null);

            try {
                const params = new URLSearchParams();
                if (sec.law_code) params.append('law_code', sec.law_code);
                if (sec.act_name) params.append('act_name', sec.act_name);
                params.append('section_number', sec.section_number);

                const res = await fetch(`/api/laws/lookup?${params.toString()}`);
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || `Failed to load law (${res.status})`);
                }
                const data = await res.json();
                setLawDetail(data);
            } catch (e: any) {
                setError(e?.message || 'Failed to load law details');
            } finally {
                setLoading(false);
            }
        };

        const closeModal = () => {
            setIsOpen(false);
            setSelected(null);
            setLawDetail(null);
            setError(null);
        };

        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Relevant Laws & Sections</h3>
                {sections.length === 0 ? (
                    <div className="text-gray-600">No sections returned.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.map((sec, idx) => (
                            <button
                                key={idx}
                                onClick={() => openModal(sec)}
                                className="text-left border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="text-sm text-gray-500 mb-1">
                                    {(sec.act_name || 'Act')} • {(sec.law_code ? `${sec.law_code} ` : '')}{sec.section_number}
                                </div>
                                <div className="font-semibold text-gray-900 mb-1 line-clamp-2">{sec.section_title}</div>
                                <div className="text-gray-700 text-sm line-clamp-3">{sec.simple_explanation}</div>
                            </button>
                        ))}
                    </div>
                )}

                <LawInfoModal isOpen={isOpen} onClose={closeModal} law={lawDetail} loading={loading} error={error} />
            </div>
        );
    };

export default AdvicePage;