import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            BidSphere
          </Link>

          {/* Navigation Links */}
          {user ? (
            <>
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 transition"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 transition"
                >
                  Dashboard
                </Link>
                {user.role === 'Seller' && (
                  <>
                    <Link
                      to="/create-item"
                      className="text-gray-600 hover:text-indigo-600 transition"
                    >
                      Create Item
                    </Link>
                    <Link
                      to="/my-items"
                      className="text-gray-600 hover:text-indigo-600 transition"
                    >
                      My Items
                    </Link>
                  </>
                )}
                {user.role === 'Admin' && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-600 hover:text-indigo-600 transition"
                    >
                      Admin Dashboard
                    </Link>
                    <div className="relative group">
                      <button className="text-gray-600 hover:text-indigo-600 transition flex items-center">
                        Admin Panel
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Manage Users
                        </Link>
                        <Link
                          to="/admin/items"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Manage Items
                        </Link>
                        <Link
                          to="/admin/bids"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Manage Bids
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4 border-l pl-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">
                    Welcome, <span className="text-indigo-600">{user.name}</span>
                  </span>
                  {user.role === 'Admin' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      {user.profilePic ? (
                        <img 
                          src={`http://localhost:5000${user.profilePic}`} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-indigo-600 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to={user.role === 'Admin' ? '/admin-account' : '/account'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-600 font-medium border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;