// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddLawModal from '../../components/AddLawModal';

const StatCard: React.FC<{label:string,value:string,accent:string}> = ({label,value,accent}) => (
    <div className="bg-white border rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        <div className="text-3xl font-bold text-gray-800 flex items-end gap-2">
            {value}
            <span className={`inline-flex items-center justify-center w-8 h-8 text-white rounded ${accent}`}></span>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = React.useState<{ totalLaws: number; totalUsers: number } | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [categories, setCategories] = React.useState<string[]>([]);

    React.useEffect(() => {
        let isMounted = true;
        const run = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const [statsRes, catsRes] = await Promise.all([
                    fetch('/api/admin/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('/api/laws/categories')
                ]);
                
                if (!statsRes.ok) {
                    const t = await statsRes.text();
                    throw new Error(t || `Failed (${statsRes.status})`);
                }
                
                const [statsData, catsData] = await Promise.all([
                    statsRes.json(),
                    catsRes.ok ? catsRes.json() : []
                ]);
                
                if (isMounted) {
                    setStats({ totalLaws: statsData.totalLaws ?? 0, totalUsers: statsData.totalUsers ?? 0 });
                    setCategories(Array.isArray(catsData) ? catsData : []);
                }
            } catch (e: any) {
                if (isMounted) setError(e?.message || 'Failed to load stats');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        run();
        return () => { isMounted = false; };
    }, [token]);

    const format = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '—');

    const handleModalSuccess = () => {
        // Refresh stats after adding a new law
        setStats(prev => prev ? { ...prev, totalLaws: prev.totalLaws + 1 } : null);
        // Navigate to manage laws page to see the new law
        navigate('/admin/manage-laws');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>

            {error && (
                <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Laws" value={loading ? '…' : format(stats?.totalLaws)} accent="bg-blue-500" />
                <StatCard label="Total Users" value={loading ? '…' : format(stats?.totalUsers)} accent="bg-emerald-500" />
                <StatCard label="Flagged Queries" value={"—"} accent="bg-rose-500" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="space-y-3">
                        {[
                            {t:'New user registered', d:'2 minutes ago'},
                            {t:'Law database updated', d:'1 hour ago'},
                            {t:'Query flagged for review', d:'3 hours ago'},
                        ].map((i)=> (
                            <li key={i.t} className="flex items-center justify-between">
                                <span className="text-gray-700">{i.t}</span>
                                <span className="text-sm text-gray-500">{i.d}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full block"
                        >
                            <div className="flex items-center justify-between bg-blue-50 text-blue-800 px-4 py-3 rounded hover:bg-blue-100"> 
                                <span>+ Add New Law</span>
                                <span>→</span>
                            </div>
                        </button>
                        <Link to="/admin/flagged" className="block">
                            <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 px-4 py-3 rounded hover:bg-emerald-100"> 
                                <span>○ Review Flagged Content</span>
                                <span>→</span>
                            </div>
                        </Link>
                        <div className="flex items-center justify-between bg-violet-50 text-violet-800 px-4 py-3 rounded"> 
                            <span>↓ Export Reports</span>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            </div>

            <AddLawModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                token={token}
                categories={categories}
            />
        </div>
    );
};

export default AdminDashboard;


