import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [adminSettings, setAdminSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    autoBanSuspiciousUsers: false,
    requireApprovalForItems: false
  });

  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmText: ''
  });

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
      localStorage.setItem('user', JSON.stringify(response.data));
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      setMessage({ type: 'success', text: 'Admin settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update admin settings' });
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setProfilePicPreview(response.data.profilePic);
      setProfilePic(null);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      currentUser.profilePic = response.data.profilePic;
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload profile picture' });
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
      await api.delete('/auth/account', { data: { password: deleteData.password } });
      setMessage({ type: 'success', text: 'Account deleted successfully!' });
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Account Settings</h1>
          <p className="text-gray-500 text-lg">Manage your admin account and system preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-[300px_1fr] gap-6 bg-white rounded-xl shadow-md overflow-hidden">
          {/* Sidebar */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 flex flex-col">
            <div className="text-center mb-6 pb-6 border-b border-white/20">
              {user.profilePic ? (
                <img src={`http://localhost:5000${user.profilePic}`} alt={user.name} className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-white/30 mb-2"/>
              ) : (
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center text-2xl font-bold mb-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm opacity-90">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-700/80 uppercase">{user.role}</span>
            </div>

            <nav className="flex flex-col gap-2">
              {[
                { key: 'profile', label: 'Profile', icon: '👤' },
                { key: 'password', label: 'Password', icon: '🔒' },
                // { key: 'admin-settings', label: 'Admin Settings', icon: '⚙️' },
                { key: 'profile-pic', label: 'Profile Picture', icon: '📷' },
                // { key: 'delete', label: 'Delete Account', icon: '🗑️' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`flex items-center gap-2 p-3 rounded-lg text-left text-white text-sm font-medium transition-all duration-300 ${activeTab === tab.key ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="max-w-lg space-y-4">
                  {['name', 'email', 'phone'].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-800 font-semibold mb-1 capitalize">{field}</label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        value={profileData[field]}
                        onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                        required
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
                      />
                    </div>
                  ))}
                  {['address', 'bio'].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-800 font-semibold mb-1 capitalize">{field}</label>
                      <textarea
                        value={profileData[field]}
                        onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                        rows={field === 'bio' ? 4 : 3}
                        placeholder={field === 'bio' ? 'Tell us about yourself...' : ''}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="max-w-lg space-y-4">
                  {['currentPassword', 'newPassword', 'confirmPassword'].map((field, idx) => (
                    <div key={field}>
                      <label className="block text-gray-800 font-semibold mb-1">
                        {idx === 0 ? 'Current Password' : idx === 1 ? 'New Password' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        value={passwordData[field]}
                        onChange={(e) => setPasswordData({ ...passwordData, [field]: e.target.value })}
                        required
                        minLength={field === 'newPassword' ? 6 : undefined}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Admin Settings Tab */}
            {activeTab === 'admin-settings' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Settings</h2>
                <form onSubmit={handleAdminSettingsUpdate} className="max-w-lg space-y-4">
                  {Object.keys(adminSettings).map((key) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminSettings[key]}
                        onChange={() => setAdminSettings({ ...adminSettings, [key]: !adminSettings[key] })}
                        className="w-5 h-5 accent-red-600"
                      />
                      <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Settings'}
                  </button>
                </form>
              </div>
            )}

            {/* Profile Picture Tab */}
            {activeTab === 'profile-pic' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Picture</h2>
                <div className="flex flex-col items-center gap-4">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"/>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-400 text-2xl font-bold">
                      ?
                    </div>
                  )}
                  <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"/>
                  <button
                    onClick={handleProfilePicUpload}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delete Account</h2>
                <p className="mb-4 text-gray-600">Type <span className="font-bold text-red-600">DELETE</span> to confirm account deletion. This action cannot be undone.</p>
                <form onSubmit={handleDeleteAccount} className="max-w-lg space-y-4">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={deleteData.password}
                    onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
                  />
                  <input
                    type="text"
                    placeholder='Type "DELETE" to confirm'
                    value={deleteData.confirmText}
                    onChange={(e) => setDeleteData({ ...deleteData, confirmText: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;