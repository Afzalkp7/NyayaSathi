// src/pages/LawLibraryPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Law {
    _id: string;
    category: string;
    act_name: string;
    law_code: string;
    section_number: string;
    title: string;
    description: string;
    simplified_description: string;
    punishment?: string;
    keywords: string[];
}

interface LawCardProps {
    law: Law;
    isLast: boolean;
}

const LawLibraryPage: React.FC = () => {
    const [allLaws, setAllLaws] = useState<Law[]>([]);
    const [filteredLaws, setFilteredLaws] = useState<Law[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Popular categories to show as chips
    const popularCategories = ['Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Labour Law'];

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/laws/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data: string[] = await response.json();
                setCategories(['All', ...data]);
            } catch (err: any) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch all laws on mount
    useEffect(() => {
        const fetchLaws = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/laws');
                if (!response.ok) {
                    throw new Error('Failed to fetch laws. Please try again later.');
                }
                const data: Law[] = await response.json();
                setAllLaws(data);
                setFilteredLaws(data);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLaws();
    }, []);

    // Filter laws when category or search changes
    useEffect(() => {
        let filtered = allLaws;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(law => law.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(law =>
                law.title.toLowerCase().includes(query) ||
                law.description.toLowerCase().includes(query) ||
                law.simplified_description.toLowerCase().includes(query) ||
                (law.keywords && law.keywords.some(k => k.toLowerCase().includes(query)))
            );
        }

        // Sort by law_code and section_number in ascending order
        filtered.sort((a, b) => {
            // First sort by law_code
            if (a.law_code !== b.law_code) {
                return a.law_code.localeCompare(b.law_code);
            }
            
            // Extract numeric part from section_number for proper numeric sorting
            const getNumericPart = (section: string) => {
                const match = section.match(/^(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            };
            
            const aNum = getNumericPart(a.section_number);
            const bNum = getNumericPart(b.section_number);
            
            // Compare numeric parts
            if (aNum !== bNum) {
                return aNum - bNum;
            }
            
            // If numeric parts are equal, compare full strings (handles 123A vs 123B)
            return a.section_number.localeCompare(b.section_number, undefined, { numeric: true });
        });

        setFilteredLaws(filtered);
    }, [selectedCategory, searchQuery, allLaws]);

    // Card component: add bg, rounded, shadow; remove border separators
    const LawCard: React.FC<LawCardProps> = ({ law /*, isLast*/ }) => {
        return (
            <Link
                to={`/laws/${law._id}`}   // was "#"
                className="
                    block h-full p-3 bg-white rounded-md shadow-sm
                    hover:shadow-md hover:bg-gray-50 transition-shadow
                "
            >
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 mb-1">
                    {law.law_code} Section {law.section_number}: {law.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                    {law.category} - {law.act_name}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                    {law.simplified_description}
                </p>
                
                {/* Keywords Tags */}
                {law.keywords && law.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5"> {/* was gap-2 */}
                        {law.keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}

                {law.punishment && (
                    <p className="text-xs text-gray-600 mt-2">
                        <strong>Punishment:</strong> {law.punishment}
                    </p>
                )}
            </Link>
        );
    };

    return (
        <div className="space-y-5 text-sm">  {/* was space-y-6; added text-sm to scale down */}
            <h1 className="text-2xl font-bold text-gray-800">Law Library</h1> {/* was text-3xl */}
            <p className="text-gray-600">Browse legal topics and understand your rights.</p>
            
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search legal topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"  // was py-3, rounded-lg
                />
            </div>

            {/* Filter Section */}
            <div className="space-y-3">
                {/* Popular Categories - Filter Chips */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Popular Categories</label>
                    <div className="flex flex-wrap gap-1.5"> {/* was gap-2 */}
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-medium border    /* was px-4 py-2 text-sm */
                                ${selectedCategory === 'All'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }
                                transition-colors
                            `}
                        >
                            All
                        </button>
                        {popularCategories
                            .filter(cat => categories.includes(cat))
                            .map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-medium border
                                        ${selectedCategory === category
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }
                                        transition-colors
                                    `}
                                >
                                    {category}
                                </button>
                            ))}
                    </div>
                </div>

                {/* All Categories - Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or select from all categories</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-56 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"  /* was md:w-64 and rounded-lg */
                    >
                        <option value="All">All Categories</option>
                        {categories.filter(c => c !== 'All').map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-xs text-gray-600">  {/* was text-sm */}
              Showing {filteredLaws.length} of {allLaws.length} laws
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </div>

            {/* Loading/Error States */}
            {isLoading && <p className="text-center py-8">Loading...</p>}
            {error && <p className="text-red-600 text-center py-8">{error}</p>}
            
            {/* Law List */}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredLaws.sort((a, b) => {
                        // keep your numeric sort for sections
                        if (a.law_code !== b.law_code) return a.law_code.localeCompare(b.law_code);
                        const n = (s: string) => (s.match(/^(\d+)/) ? parseInt(RegExp.$1, 10) : 0);
                        const an = n(a.section_number), bn = n(b.section_number);
                        if (an !== bn) return an - bn;
                        return a.section_number.localeCompare(b.section_number, undefined, { numeric: true });
                    }).map((law, index) => (
                        <LawCard key={law._id} law={law} isLast={index === filteredLaws.length - 1} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredLaws.length === 0 && (
                <p className="text-gray-600 text-center py-8">
                    No laws found matching your criteria.
                </p>
            )}
        </div>
    );
};

export default LawLibraryPage;