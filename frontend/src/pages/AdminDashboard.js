import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

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
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your auction platform</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.totalBids}</h3>
            <p>Total Bids</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.activeAuctions}</h3>
            <p>Active Auctions</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏁</div>
          <div className="stat-content">
            <h3>{stats.endedAuctions}</h3>
            <p>Ended Auctions</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <h3>{stats.bannedUsers}</h3>
            <p>Banned Users</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/users" className="action-btn">
            <span>👥</span>
            Manage Users
          </Link>
          <Link to="/admin/items" className="action-btn">
            <span>📦</span>
            Manage Items
          </Link>
          <Link to="/admin/bids" className="action-btn">
            <span>💰</span>
            View Bids
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        
        <div className="activity-sections">
          {/* Recent Users */}
          <div className="activity-section">
            <h3>Recent Users</h3>
            <div className="activity-list">
              {recentActivity.users.map(user => (
                <div key={user._id} className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <p className="activity-title">{user.name}</p>
                    <p className="activity-subtitle">{user.email} • {user.role}</p>
                    <p className="activity-time">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          <div className="activity-section">
            <h3>Recent Items</h3>
            <div className="activity-list">
              {recentActivity.items.map(item => (
                <div key={item._id} className="activity-item">
                  <div className="activity-icon">📦</div>
                  <div className="activity-content">
                    <p className="activity-title">{item.title}</p>
                    <p className="activity-subtitle">
                      ${item.currentBid || 0} • {item.seller.name}
                    </p>
                    <p className="activity-time">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bids */}
          <div className="activity-section">
            <h3>Recent Bids</h3>
            <div className="activity-list">
              {recentActivity.bids.map(bid => (
                <div key={bid._id} className="activity-item">
                  <div className="activity-icon">💰</div>
                  <div className="activity-content">
                    <p className="activity-title">${bid.amount}</p>
                    <p className="activity-subtitle">
                      {bid.bidder.name} on {bid.item.title}
                    </p>
                    <p className="activity-time">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </p>
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

