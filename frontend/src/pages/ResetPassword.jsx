import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-indigo-500 to-purple-600">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Password Reset Successful
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been updated successfully.
          </p>

          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 text-sm">
            You can now log in with your new password.
          </div>

          <Link
            to="/login"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-500 text-base">
            Enter your new password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-semibold text-sm text-gray-800"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your new password"
              minLength="6"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="font-semibold text-sm text-gray-800"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
              minLength="6"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-lg text-base shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-indigo-500 font-medium hover:text-purple-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;