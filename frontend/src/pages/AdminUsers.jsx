import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import debounce from '../utils/debounce';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);

  const debouncedUpdate = useCallback(
    debounce((value) => {
      setSearch(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedUpdate(value);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?page=${currentPage}&search=${search}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      setError('Failed to load users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId) => {
    try {
      setUpdating(userId);
      const response = await api.put(`/admin/users/${userId}/ban`);
      setUsers(users.map(user => user._id === userId ? { ...user, isBanned: !user.isBanned } : user));
      alert(response.data.message);
    } catch (error) {
      alert('Failed to update user status');
      console.error('Ban toggle error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdating(userId);
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
      alert(response.data.message);
    } catch (error) {
      alert('Failed to update user role');
      console.error('Role update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Users</h1>
        <p className="text-gray-500 text-lg">View and manage all registered users</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>
      )}

      <div className="mb-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-x-auto mb-6">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left text-gray-700 font-semibold">Name</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Email</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Role</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Status</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Joined</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      {/* ✅ FIX: If Admin, show badge. If User, show dropdown with ONLY Buyer/Seller */}
                      {user.role === 'Admin' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          Admin
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                          disabled={updating === user._id}
                          className="p-2 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="Buyer">Buyer</option>
                          <option value="Seller">Seller</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${user.isBanned ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleBanToggle(user._id)}
                        disabled={updating === user._id || user.role === 'Admin'}
                        className={`px-4 py-2 rounded text-white text-sm font-medium ${user.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updating === user._id ? 'Updating...' : (user.isBanned ? 'Unban' : 'Ban')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No users found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;