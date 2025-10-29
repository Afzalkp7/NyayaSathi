// src/components/ActionCard.tsx
import React from 'react';

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, color, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow text-left w-full flex items-start space-x-4"
        >
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
        </button>
    );
};

export default ActionCard;