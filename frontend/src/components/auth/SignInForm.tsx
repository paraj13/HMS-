"use client";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { loginUser } from "@/services/userService"; // import your login service
import { UserLoginResponse } from "@/types/user";
import { deleteCookie, setCookie } from "cookies-next";


export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data: UserLoginResponse = await loginUser(email, password);

      localStorage.setItem("token", data.refresh_token); 
      setCookie("token", data.refresh_token, { path: "/" });

      // ✅ Store role separately
      localStorage.setItem("role", data.user.role);
      setCookie("role", data.user.role, { path: "/" });

      // redirect based on role (optional)
      window.location.href = "/dashboard";
    
    } catch (error: any) {
  const errData = error.response?.data;

  const errorMessage =
    errData?.errors?.non_field_errors?.[0] || // backend specific error
    errData?.message || // fallback backend message
    "Something went wrong"; // final fallback

  toast.error(errorMessage);
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-error-500">*</span>
            </label>
            <input
              type="email"
              placeholder="info@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-800 dark:text-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Password <span className="text-error-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-800 dark:text-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
