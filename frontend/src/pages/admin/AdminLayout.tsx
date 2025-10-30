// src/pages/admin/AdminLayout.tsx
import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Top bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-800">NyayaSathi Admin Panel</h1>
                    <button 
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
                {/* Sidebar (always left) */}
                <aside className="w-60 shrink-0">
                    <nav className="bg-white rounded-lg border p-2 space-y-1 sticky top-20">
                        <NavLink to="/admin/dashboard" className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive? 'bg-blue-50 text-blue-700 font-medium':'text-gray-700 hover:bg-gray-50'}`}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700">▣</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/manage-laws" className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive? 'bg-blue-50 text-blue-700 font-medium':'text-gray-700 hover:bg-gray-50'}`}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-indigo-100 text-indigo-700">▤</span>
                            Manage Laws
                        </NavLink>
                        <NavLink to="/admin/users" className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive? 'bg-blue-50 text-blue-700 font-medium':'text-gray-700 hover:bg-gray-50'}`}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 text-emerald-700">👤</span>
                            View Users
                        </NavLink>
                        <NavLink to="/admin/flagged" className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive? 'bg-blue-50 text-blue-700 font-medium':'text-gray-700 hover:bg-gray-50'}`}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-rose-100 text-rose-700">⚑</span>
                            Flagged Queries
                        </NavLink>
                        {/* <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-600">←</span>
                            Back to site
                        </Link> */}
                    </nav>
                </aside>

                {/* Content */}
                <section className="flex-1 min-w-0">
                    <Outlet />
                </section>
            </div>
        </div>
    );
};

export default AdminLayout;


