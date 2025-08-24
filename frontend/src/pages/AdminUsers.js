import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import './AdminUsers.css';
import debounce from '../utils/debounce';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const searchInputRef = useRef(null);
  
  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchUsers();
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
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isBanned: !user.isBanned }
          : user
      ));
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
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      alert(response.data.message);
    } catch (error) {
      alert('Failed to update user role');
      console.error('Role update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-header">
        <h1>Manage Users</h1>
        <p>View and manage all registered users</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search users by name or email..."
            ref={searchInputRef}
            defaultValue={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="search-input"
          />

        </form>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                    disabled={updating === user._id}
                    className="role-select"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleBanToggle(user._id)}
                    disabled={updating === user._id || user.role === 'Admin'}
                    className={`btn ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                  >
                    {updating === user._id ? 'Updating...' : (user.isBanned ? 'Unban' : 'Ban')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="no-data">
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
