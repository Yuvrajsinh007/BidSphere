import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
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
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We've sent password reset instructions to <span className="font-medium">{email}</span>
          </p>

          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 text-sm">
            If you don't see the email, check your spam folder. The link will expire in 1 hour.
          </div>

          <Link
            to="/login"
            className="text-indigo-500 font-semibold hover:text-purple-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-gradient-to-tr from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-500 text-base">Enter your email to reset your password</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-sm text-gray-800">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-lg text-base shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;