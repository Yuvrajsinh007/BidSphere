import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-lg">Manage your auction platform</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats && [
          { icon: '👥', title: 'Total Users', value: stats.totalUsers },
          { icon: '📦', title: 'Total Items', value: stats.totalItems },
          { icon: '💰', title: 'Total Bids', value: stats.totalBids },
          { icon: '⏰', title: 'Active Auctions', value: stats.activeAuctions },
          { icon: '🏁', title: 'Ended Auctions', value: stats.endedAuctions },
          { icon: '🚫', title: 'Banned Users', value: stats.bannedUsers },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow border border-gray-200 flex items-center gap-4 hover:shadow-md transition">
            <div className="text-3xl">{card.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-gray-500 uppercase text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-sm"
          >
            <span>👥</span> Manage Users
          </Link>
          <Link
            to="/admin/items"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-sm"
          >
            <span>📦</span> Manage Items
          </Link>
          <Link
            to="/admin/bids"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-sm"
          >
            <span>💰</span> View Bids
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200 bg-gray-50">Recent Users</h3>
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-96">
              {recentActivity?.users?.length > 0 ? (
                recentActivity.users.map(user => (
                  <div key={user._id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium truncate">{user.name || 'Unknown User'}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email || 'No Email'}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{user.role}</span>
                        <span className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">No recent users</div>
              )}
            </div>
          </div>

          {/* Recent Items */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200 bg-gray-50">Recent Items</h3>
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-96">
              {recentActivity?.items?.length > 0 ? (
                recentActivity.items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-xl">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium truncate">{item.title || 'Untitled Item'}</p>
                      {/* FIX: Added safe check for item.seller */}
                      <p className="text-gray-500 text-xs truncate">
                        Seller: <span className="font-semibold">{item.seller?.name || 'Unknown'}</span>
                      </p>
                      <div className="flex justify-between mt-1 items-center">
                        <span className="text-green-600 font-bold text-sm">${item.currentBid || item.basePrice || 0}</span>
                        <span className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">No recent items</div>
              )}
            </div>
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200 bg-gray-50">Recent Bids</h3>
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-96">
              {recentActivity?.bids?.length > 0 ? (
                recentActivity.bids.map(bid => (
                  <div key={bid._id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl">💰</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-bold text-lg">${bid.amount}</p>
                      {/* FIX: Added safe checks for bidder and item */}
                      <p className="text-gray-600 text-xs">
                        by <span className="font-semibold">{bid.bidder?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        on {bid.item?.title || 'Deleted Item'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 text-right">{new Date(bid.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">No recent bids</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;