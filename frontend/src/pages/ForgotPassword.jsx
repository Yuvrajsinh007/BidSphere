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
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 text-sm mb-6">
            We've sent password reset instructions to <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
          
          <div className="bg-green-50 text-green-800 text-sm p-4 rounded-lg mb-6 border border-green-100">
            If you don't see the email, check your spam folder. The link will expire in 1 hour.
          </div>

          <Link
            to="/login"
            className="inline-block w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-500 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="name@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition-all transform active:scale-95 disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>←</span> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;