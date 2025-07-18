"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[419px] min-w-[320px] bg-white rounded-[30px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] hover-lift smooth-transition overflow-hidden mx-auto auth-card-enter">
          {/* Header */}
          <div className="text-center pt-8 pb-6 px-6">
            <Link href="/search" className="text-2xl font-bold text-black">
              Summa
            </Link>
            <h1 className="text-xl font-bold text-black mt-4 mb-2">
              {isSuccess ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className="text-sm text-gray-600">
              {isSuccess 
                ? "We've sent password reset instructions to your email" 
                : "Enter your email to reset your password"
              }
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-8">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center success-check">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    If an account with that email exists, you&apos;ll receive password reset instructions shortly.
                  </p>
                  <p className="text-xs text-gray-500">
                    Didn&apos;t receive an email? Check your spam folder or try again.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <Link 
                href="/auth/login" 
                className="text-sm text-gray-600 hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
  );
}
