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
          <div key={idx} className="bg-white p-6 rounded-xl shadow border border-gray-200 flex items-center gap-4">
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
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
          >
            <span>👥</span> Manage Users
          </Link>
          <Link
            to="/admin/items"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
          >
            <span>📦</span> Manage Items
          </Link>
          <Link
            to="/admin/bids"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
          >
            <span>💰</span> View Bids
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200">Recent Users</h3>
            <div className="divide-y divide-gray-100">
              {recentActivity?.users.map(user => (
                <div key={user._id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">👤</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.email} • {user.role}</p>
                    <p className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200">Recent Items</h3>
            <div className="divide-y divide-gray-100">
              {recentActivity?.items.map(item => (
                <div key={item._id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">📦</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{item.title}</p>
                    <p className="text-gray-500 text-sm">${item.currentBid || 0} • {item.seller.name}</p>
                    <p className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bids */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200">Recent Bids</h3>
            <div className="divide-y divide-gray-100">
              {recentActivity?.bids.map(bid => (
                <div key={bid._id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm">💰</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">${bid.amount}</p>
                    <p className="text-gray-500 text-sm">{bid.bidder.name} on {bid.item.title}</p>
                    <p className="text-gray-400 text-xs">{new Date(bid.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;