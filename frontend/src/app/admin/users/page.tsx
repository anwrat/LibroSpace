'use client';

import AdminNav from "@/components/Navbar/AdminNav";
import { getAllUsers, deleteUser } from "@/lib/admin";
import { useEffect, useState } from "react";
import { User, ChevronLeft, ChevronRight, Search, Trash2, Loader2 } from "lucide-react";

interface UserType {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function Users() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const usersPerPage = 5;
    
    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
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

    // Handle user deletion execution block
    const handleDeleteUser = async (userId: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            setDeletingId(userId);
            setError(''); // Reset any existing errors before trying to delete
            await deleteUser(userId);
            
            // Remove the deleted user instantly from global state
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            
            // Adjust pagination window safely if removing the last element of an isolated leaf page
            const remainingFiltered = filteredUsers.filter(user => user.id !== userId);
            const maxRemainingPages = Math.ceil(remainingFiltered.length / usersPerPage) || 1;
            if (currentPage > maxRemainingPages) {
                setCurrentPage(maxRemainingPages);
            }
        } catch (err: any) {
            console.error("User deletion failure:", err);
            alert(err.response?.data?.message || 'Failed to delete the user. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };
    
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14919B] focus:border-transparent font-main bg-white text-gray-900"
                        />
                    </div>
                </div>
                
                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-main w-16">
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
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 font-main w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
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
                                        <td className="px-6 py-4 text-sm text-center font-main">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={deletingId !== null}
                                                title="Delete user profile data record"
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {deletingId === user.id ? (
                                                    <Loader2 size={18} className="animate-spin text-red-600" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
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
                                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                                            px-4 py-2 rounded-lg font-main text-sm font-medium transition-colors cursor-pointer
                                            ${currentPage === page
                                                ? 'bg-[#14919B] text-white'
                                                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
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
                                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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