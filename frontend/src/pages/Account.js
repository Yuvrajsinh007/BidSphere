import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Account.css';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Delete account state
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmText: ''
  });
  
  // Profile picture state
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
      setProfilePicPreview(user.profilePic);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/auth/profile', profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local user data
      localStorage.setItem('user', JSON.stringify(response.data));
      window.location.reload(); // Refresh to update context
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePic) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('profilePic', profilePic);

    try {
      const response = await api.post('/auth/profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setProfilePicPreview(response.data.profilePic);
      setProfilePic(null);
      
      // Update local user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      currentUser.profilePic = response.data.profilePic;
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload profile picture' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (deleteData.confirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      setLoading(false);
      return;
    }

    try {
      await api.delete('/auth/account', {
        data: { password: deleteData.password }
      });
      
      setMessage({ type: 'success', text: 'Account deleted successfully!' });
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete account' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileTab = () => (
    <div className="tab-content">
      <h2>Profile Information</h2>
      <form onSubmit={handleProfileUpdate} className="account-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            rows="4"
            placeholder="Tell us about yourself..."
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="tab-content">
      <h2>Change Password</h2>
      <form onSubmit={handlePasswordChange} className="account-form">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            required
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            required
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );

  const renderProfilePicTab = () => (
    <div className="tab-content">
      <h2>Profile Picture</h2>
      <div className="profile-pic-section">
        <div className="current-pic">
          <h3>Current Profile Picture</h3>
          <div className="profile-pic-container">
            {profilePicPreview ? (
              <img 
                src={profilePicPreview} 
                alt="Profile" 
                className="profile-pic"
              />
            ) : (
              <div className="no-pic">No profile picture</div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleProfilePicUpload} className="upload-form">
          <div className="form-group">
            <label>Upload New Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <small>Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
          </div>
          
          {profilePicPreview && profilePic && (
            <div className="preview">
              <h4>Preview:</h4>
              <img src={profilePicPreview} alt="Preview" className="preview-pic" />
            </div>
          )}
          
          <button type="submit" disabled={loading || !profilePic} className="btn btn-primary">
            {loading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="tab-content">
      <h2>Delete Account</h2>
      <div className="delete-warning">
        <div className="warning-box">
          <h3>⚠️ Warning</h3>
          <p>This action cannot be undone. All your data, including:</p>
          <ul>
            <li>Profile information</li>
            <li>Created items (if seller)</li>
            <li>Bid history</li>
            <li>Account settings</li>
          </ul>
          <p>will be permanently deleted.</p>
        </div>
      </div>
      
      <form onSubmit={handleDeleteAccount} className="account-form">
        <div className="form-group">
          <label>Enter your password to confirm</label>
          <input
            type="password"
            value={deleteData.password}
            onChange={(e) => setDeleteData({...deleteData, password: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Type "DELETE" to confirm</label>
          <input
            type="text"
            value={deleteData.confirmText}
            onChange={(e) => setDeleteData({...deleteData, confirmText: e.target.value})}
            placeholder="DELETE"
            required
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn btn-danger">
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </form>
    </div>
  );

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="account-content">
          <div className="sidebar">
            <div className="user-info">
              <div className="user-avatar">
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={user.name} 
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <nav className="account-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span>👤</span> Profile
              </button>
              <button
                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <span>🔒</span> Password
              </button>
              <button
                className={`nav-item ${activeTab === 'profile-pic' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile-pic')}
              >
                <span>📷</span> Profile Picture
              </button>
              <button
                className={`nav-item ${activeTab === 'delete' ? 'active' : ''}`}
                onClick={() => setActiveTab('delete')}
              >
                <span>🗑️</span> Delete Account
              </button>
            </nav>
          </div>

          <div className="main-content">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'password' && renderPasswordTab()}
            {activeTab === 'profile-pic' && renderProfilePicTab()}
            {activeTab === 'delete' && renderDeleteTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;