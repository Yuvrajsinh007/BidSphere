import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import axios from "axios";

// Component defined outside to prevent refreshing
const TabWrapper = ({ children }) => (
  <div className="space-y-6 animate-fadeIn">{children}</div>
);

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteData, setDeleteData] = useState({
    password: "",
    confirmText: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
      setProfilePicPreview(user.profilePic);
    }
  }, [user]);

  // --- Handlers ---

  // 1. Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.put("/auth/profile", profileData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Profile Picture Upload
  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePic) {
      setMessage({ type: "error", text: "Please select an image first" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("profilePic", profilePic);

    try {
      const token = localStorage.getItem("token");
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${baseURL}/auth/profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setMessage({ type: "success", text: "Profile picture updated!" });
      setProfilePicPreview(response.data.profilePic);
      setProfilePic(null);
      
      const updatedUser = { ...user, profilePic: response.data.profilePic };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to upload profile picture",
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteData.confirmText !== "DELETE") {
      setMessage({ type: "error", text: "Please type DELETE to confirm" });
      return;
    }

    setLoading(true);
    try {
      await api.delete("/auth/account", {
        data: { password: deleteData.password }, 
      });

      setMessage({ type: "success", text: "Account deleted. Goodbye!" });
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete account",
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
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-500">Manage your profile and preferences</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
            message.type === "success" 
              ? "bg-green-100 border-green-400 text-green-700" 
              : "bg-red-100 border-red-400 text-red-700"
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="font-bold">×</button>
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-6 bg-white rounded-xl shadow-md overflow-hidden min-h-[500px]">
          <div className="bg-gradient-to-b from-indigo-800 to-indigo-900 text-white p-6">
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-indigo-700">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-400 overflow-hidden mb-3 bg-white">
                 {profilePicPreview || user.profilePic ? (
                   <img 
                     src={profilePicPreview || user.profilePic} 
                     alt="Profile" 
                     className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-indigo-800 text-3xl font-bold">
                     {user.name?.charAt(0).toUpperCase()}
                   </div>
                 )}
              </div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-indigo-300 text-sm">{user.email}</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: "profile", icon: "👤", label: "Profile Info" },
                { id: "password", icon: "🔒", label: "Security" },
                { id: "profile-pic", icon: "📷", label: "Profile Picture" },
                { id: "delete", icon: "⚠️", label: "Delete Account" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage({type:"", text:""}); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id 
                      ? "bg-white text-indigo-900 font-semibold shadow-md" 
                      : "hover:bg-indigo-700 text-indigo-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "profile" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-xl">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled={true} // ✅ FIX: Email is read-only
                        className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows="4"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </TabWrapper>
            )}

            {activeTab === "password" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength="6"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </TabWrapper>
            )}

            {activeTab === "profile-pic" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Update Profile Picture</h2>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg mb-6 border-4 border-white">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  <div className="w-full max-w-xs text-center space-y-4">
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                      />
                    </label>
                    <button
                      onClick={handleProfilePicUpload}
                      disabled={loading || !profilePic}
                      className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Uploading..." : "Upload New Picture"}
                    </button>
                    <p className="text-xs text-gray-400">Supported formats: JPG, PNG, JPEG</p>
                  </div>
                </div>
              </TabWrapper>
            )}

            {activeTab === "delete" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-red-600 border-b pb-4 mb-6">Delete Account</h2>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <h3 className="font-bold text-red-800 mb-2">Warning: This action is irreversible</h3>
                  <p className="text-red-600 mb-6 text-sm">
                    Deleting your account will remove all your data, bids, and listed items. Please be certain.
                  </p>
                  
                  <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter Password to Confirm</label>
                      <input
                        type="password"
                        required
                        value={deleteData.password}
                        onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type "DELETE"</label>
                      <input
                        type="text"
                        required
                        placeholder="DELETE"
                        value={deleteData.confirmText}
                        onChange={(e) => setDeleteData({ ...deleteData, confirmText: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-medium"
                      >
                        {loading ? "Deleting Account..." : "Permanently Delete Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </TabWrapper>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;