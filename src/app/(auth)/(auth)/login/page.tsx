// ============================================================
// app/(auth)/login/page.tsx — Login Page
//
// Users enter email + password to sign in.
// On success, they're redirected to their role-based dashboard.
//
// "use client" = this component runs in the browser (needed
// for useState, form handling, signIn function)
// ============================================================

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // signIn calls our authorize() function in lib/auth.ts
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't auto-redirect, we handle it
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Fetch session to get user role for redirect
      const session = await fetch("/api/auth/session").then((r) => r.json());
      const role = session?.user?.role;

      if (role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            📚 <span className="text-[#7c5cfc]">Tutor</span>Flow
          </Link>
          <p className="text-[#64748b] mt-2">Welcome back</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-[#64748b] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7c5cfc] transition"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-[#64748b] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7c5cfc] transition"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c5cfc] text-white rounded-lg py-3 font-semibold hover:bg-[#6b4ce0] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-[#64748b] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#7c5cfc] hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
