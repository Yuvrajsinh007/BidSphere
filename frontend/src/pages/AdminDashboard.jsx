import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, Package, Gavel, Timer, Archive, Ban, 
  TrendingUp, Activity, DollarSign
} from 'lucide-react';

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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 mt-1">Monitor platform performance and metrics</p>
        </div>
        {/* Buttons Removed as requested */}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats && (
          <>
            <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
            <StatCard icon={Package} title="Total Items" value={stats.totalItems} color="bg-purple-500" />
            <StatCard icon={DollarSign} title="Total Bids" value={stats.totalBids} color="bg-green-500" />
            <StatCard icon={Timer} title="Active Auctions" value={stats.activeAuctions} color="bg-amber-500" />
            <StatCard icon={Archive} title="Ended Auctions" value={stats.endedAuctions} color="bg-gray-500" />
            <StatCard icon={Ban} title="Banned Users" value={stats.bannedUsers} color="bg-red-500" />
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> New Users
            </h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {recentActivity?.users?.map(user => (
              <div key={user._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'Seller' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" /> New Items
            </h3>
            <Link to="/admin/items" className="text-sm text-purple-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {recentActivity?.items?.map(item => (
              <div key={item._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-full h-full p-2 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs">by {item.seller?.name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold text-sm">${item.currentBid || item.basePrice}</p>
                  <p className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Recent Bids
            </h3>
            <Link to="/admin/bids" className="text-sm text-green-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {recentActivity?.bids?.map(bid => (
              <div key={bid._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-bold text-sm">${bid.amount}</p>
                  <p className="text-gray-500 text-xs truncate">
                    <span className="font-medium text-gray-700">{bid.bidder?.name}</span> on {bid.item?.title}
                  </p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {new Date(bid.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;