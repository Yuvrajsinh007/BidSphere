import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] flex items-center justify-center p-6 bg-gradient-to-tr from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-base">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-semibold text-sm text-gray-800"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-semibold text-sm text-gray-800"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-lg text-base shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center">
          {/* <Link
            to="/forgot-password"
            className="text-indigo-500 text-sm font-medium hover:text-purple-600 hover:underline"
          >
            Forgot your password?
          </Link> */}
          <p className="mt-4 text-gray-500 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-500 font-semibold hover:text-purple-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;