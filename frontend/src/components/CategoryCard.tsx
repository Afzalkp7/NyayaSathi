import React from 'react';

interface CategoryCardProps {
    icon: React.ReactNode;
    name: string;
    color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, name, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center justify-center space-y-3">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <p className="font-medium text-gray-700">{name}</p>
        </div>
    );
};

export default CategoryCard;