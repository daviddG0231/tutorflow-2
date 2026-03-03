// ============================================================
// app/(auth)/register/page.tsx — Registration Page
//
// New users create an account by choosing Teacher or Student.
// After registering, they're automatically signed in.
// ============================================================

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Wrapper needed because useSearchParams requires Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#64748b]">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-select role if coming from landing page CTA
  const preselectedRole = searchParams.get("role")?.toUpperCase() || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(
    preselectedRole === "TEACHER" || preselectedRole === "STUDENT"
      ? preselectedRole
      : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select whether you're a Teacher or Student");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register (create account)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Step 2: Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Account created but sign-in failed — go to login
        router.push("/login");
        return;
      }

      // Redirect based on role
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
          <p className="text-[#64748b] mt-2">Create your account</p>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Sign Up</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-5">
            <label className="block text-sm text-[#64748b] mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`py-3 rounded-lg border text-sm font-semibold transition ${
                  role === "TEACHER"
                    ? "border-[#7c5cfc] bg-[#7c5cfc]/10 text-[#7c5cfc]"
                    : "border-[#e2e8f0] text-[#64748b] hover:border-[#7c5cfc]"
                }`}
              >
                👩‍🏫 Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-3 rounded-lg border text-sm font-semibold transition ${
                  role === "STUDENT"
                    ? "border-[#7c5cfc] bg-[#7c5cfc]/10 text-[#7c5cfc]"
                    : "border-[#e2e8f0] text-[#64748b] hover:border-[#7c5cfc]"
                }`}
              >
                🎓 Student
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm text-[#64748b] mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7c5cfc] transition"
              placeholder="John Doe"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c5cfc] text-white rounded-lg py-3 font-semibold hover:bg-[#6b4ce0] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-[#64748b] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7c5cfc] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
