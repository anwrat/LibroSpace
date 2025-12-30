'use client';
import AdminNav from "@/components/Navbar/AdminNav";
import { getAllUsers } from "@/lib/admin";
import { useEffect, useState } from "react";
import { User, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface UserType {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function Users() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const usersPerPage = 5;
    
    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response.data.users);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, []);
    
    // Filter users based on search
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Calculate pagination
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Pagination handlers
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };
    
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminNav />
                <div className="flex-1 flex items-center justify-center ml-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14919B]"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminNav />
                <div className="flex-1 flex items-center justify-center ml-64">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                        <p className="font-main">{error}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminNav />
            
            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-main text-gray-800 mb-2">
                        User Management
                    </h1>
                    <p className="text-gray-600 font-main">
                        Manage and monitor all users in the system
                    </p>
                </div>
                
                {/* Stats Card */}
                <div className="bg-linear-to-r from-[#14919B] to-[#0d6169] rounded-xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-lg">
                            <User size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 font-main text-sm">Total Users</p>
                            <p className="text-white font-bold text-4xl font-main">{totalUsers}</p>
                        </div>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14919B] focus:border-transparent font-main"
                        />
                    </div>
                </div>
                
                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main">
                                    Joined Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {user.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 font-main">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-main">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-main">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-700 font-main">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(endIndex, totalUsers)}</span> of{' '}
                            <span className="font-semibold">{totalUsers}</span> users
                        </p>
                        
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`
                                            px-4 py-2 rounded-lg font-main text-sm font-medium transition-colors
                                            ${currentPage === page
                                                ? 'bg-[#14919B] text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Next Button */}
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}