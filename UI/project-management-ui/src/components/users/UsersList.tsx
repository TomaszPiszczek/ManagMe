import { useState, useEffect } from 'react';
import { userService, User } from '../../services/userService';
import { toast } from 'react-toastify';

const UsersList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'ADMIN' | 'DEVELOPER' | 'DEVOPS'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const fetchedUsers = await userService.getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to remove ${userName} from the team? This action cannot be undone.`)) {
            try {
                await userService.softDeleteUser(userId);
                toast.success(`${userName} has been removed from the team`);
                fetchUsers(); // Refresh the list
            } catch (error) {
                toast.error(`Failed to remove ${userName}`);
            }
        }
    };

    const filteredUsers = users.filter(user => {
        // Filter out inactive/hidden users
        if (!user.activated) return false;
        
        if (filter === 'all') return true;
        return user.role?.name === filter;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'DEVELOPER': return 'bg-blue-100 text-blue-800';
            case 'DEVOPS': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (activated: boolean) => {
        return activated 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Team Members
                    </h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            All ({users.filter(u => u.activated).length})
                        </button>
                        <button
                            onClick={() => setFilter('ADMIN')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Admins ({users.filter(u => u.role?.name === 'ADMIN' && u.activated).length})
                        </button>
                        <button
                            onClick={() => setFilter('DEVELOPER')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'DEVELOPER'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Developers ({users.filter(u => u.role?.name === 'DEVELOPER' && u.activated).length})
                        </button>
                        <button
                            onClick={() => setFilter('DEVOPS')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'DEVOPS'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            DevOps ({users.filter(u => u.role?.name === 'DEVOPS' && u.activated).length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow relative group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 min-w-12 min-h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {user.email}
                                    </p>
                                </div>
                                {/* Remove button - only for non-admin users */}
                                {user.role?.name !== 'ADMIN' && (
                                    <button
                                        onClick={() => handleRemoveUser(user.id, user.name)}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 flex-shrink-0"
                                        title="Remove team member"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(user.role?.name || 'Unknown')}`}>
                                    {user.role?.name || 'No Role'}
                                </span>
                                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(user.activated)}`}>
                                    {user.activated ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                                <p>Joined: {new Date(user.creationTimestamp).toLocaleDateString()}</p>
                                <p>Updated: {new Date(user.modificationTimestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No team members found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {filter === 'all' ? 'There are no users in the system yet.' : `No users with role ${filter} found.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersList;