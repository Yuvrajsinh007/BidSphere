import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import axios from "axios"; 

const TabWrapper = ({ children }) => (
  <div className="space-y-6 animate-fadeIn">{children}</div>
);

const AdminAccount = () => {
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

  const [adminSettings, setAdminSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    autoBanSuspiciousUsers: false,
    requireApprovalForItems: false,
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

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

  const handleAdminSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setMessage({ type: "success", text: "Admin settings updated successfully!" });
        setLoading(false);
    }, 800);
  };

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
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      
      const response = await axios.post(`${baseURL}/auth/profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: "success", text: "Profile picture updated successfully!" });
      setProfilePicPreview(response.data.profilePic);
      setProfilePic(null);
      
      const currentUser = JSON.parse(localStorage.getItem("user"));
      currentUser.profilePic = response.data.profilePic;
      localStorage.setItem("user", JSON.stringify(currentUser));
      
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!user || user.role !== "Admin") {
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Account Settings</h1>
          <p className="text-gray-500">Manage system preferences and personal details</p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
              message.type === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="font-bold">
              ×
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-6 bg-white rounded-xl shadow-md overflow-hidden min-h-[500px]">
          {/* Sidebar */}
          <div className="bg-gradient-to-b from-red-700 to-red-900 text-white p-6">
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-red-600">
              <div className="w-24 h-24 rounded-full border-4 border-red-400 overflow-hidden mb-3 bg-white">
                {profilePicPreview || user.profilePic ? (
                  <img
                    src={profilePicPreview || user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-800 text-3xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-red-200 text-sm">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-red-800/80 border border-red-500 uppercase tracking-wide">
                Admin
              </span>
            </div>

            <nav className="space-y-2">
              {[
                { id: "profile", icon: "👤", label: "Profile Info" },
                { id: "password", icon: "🔒", label: "Security" },
                { id: "admin-settings", icon: "⚙️", label: "System Config" },
                { id: "profile-pic", icon: "📷", label: "Profile Picture" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage({ type: "", text: "" });
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-red-900 font-semibold shadow-md"
                      : "hover:bg-red-800 text-red-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-xl">
                  {["name", "email", "phone"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                        value={profileData[field]}
                        onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                        // ✅ FIX: Email is disabled/read-only
                        disabled={field === "email"}
                        className={`w-full p-2.5 border rounded-lg outline-none ${
                          field === "email" 
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" 
                            : "focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-200"
                        }`}
                      />
                    </div>
                  ))}
                  {["address", "bio"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field}
                      </label>
                      <textarea
                        value={profileData[field]}
                        onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                        rows={field === "bio" ? 4 : 2}
                        placeholder={field === "bio" ? "Tell us about yourself..." : ""}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </TabWrapper>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  {["currentPassword", "newPassword", "confirmPassword"].map((field, idx) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {idx === 0
                          ? "Current Password"
                          : idx === 1
                          ? "New Password"
                          : "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordData[field]}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, [field]: e.target.value })
                        }
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        required
                        minLength={field === "newPassword" ? 6 : undefined}
                      />
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </TabWrapper>
            )}

            {/* Admin Settings Tab */}
            {activeTab === "admin-settings" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">System Configuration</h2>
                <form onSubmit={handleAdminSettingsUpdate} className="space-y-5 max-w-lg">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    {Object.keys(adminSettings).map((key) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={adminSettings[key]}
                          onChange={() =>
                            setAdminSettings({ ...adminSettings, [key]: !adminSettings[key] })
                          }
                          className="w-5 h-5 accent-red-600 rounded"
                        />
                        <span className="text-gray-700 font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
                </form>
              </TabWrapper>
            )}

            {/* Profile Picture Tab */}
            {activeTab === "profile-pic" && (
              <TabWrapper>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Update Profile Picture</h2>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg mb-6 border-4 border-white">
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-xs text-center space-y-4">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                      />
                    </label>
                    <button
                      onClick={handleProfilePicUpload}
                      disabled={loading || !profilePic}
                      className="w-full px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Uploading..." : "Upload New Picture"}
                    </button>
                    <p className="text-xs text-gray-400">JPG, PNG, JPEG allowed</p>
                  </div>
                </div>
              </TabWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;