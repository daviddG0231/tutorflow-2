"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const session = await fetch("/api/auth/session").then((r) => r.json());
      const role = session?.user?.role;
      router.push(role === "TEACHER" ? "/teacher" : "/student");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-500 to-sky-600 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">TutorFlow</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            The smarter way to manage IGCSE tutoring
          </h1>
          <p className="text-sky-100 text-lg leading-relaxed">
            Create courses, track progress, grade assignments, and help your students achieve their best — all in one place.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sky-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">✓</div>
              <span>IGCSE-aligned curriculum management</span>
            </div>
            <div className="flex items-center gap-3 text-sky-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">✓</div>
              <span>Built-in grading with mark schemes</span>
            </div>
            <div className="flex items-center gap-3 text-sky-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">✓</div>
              <span>Real-time student progress tracking</span>
            </div>
          </div>
        </div>

        <p className="text-sky-200 text-sm">
          © 2026 TutorFlow Platform. Specialized IGCSE Curriculum Support.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-sky-500">TutorFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-sky-500 font-medium hover:text-sky-600">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
