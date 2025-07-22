"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        router.push('/auth/login?message=Registration successful! Please sign in.');
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed');
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
            <h1 className="text-xl font-bold text-black mt-4 mb-2">Create Account</h1>
            <p className="text-sm text-gray-600">Join Summa to explore perspectives</p>
          </div>

          {/* Form */}
          <div className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 field-error">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-black mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-black mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black bg-white"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>

              {/* Social Login Options */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Register Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-full text-black font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-black font-medium hover:text-gray-800 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
  );
}
