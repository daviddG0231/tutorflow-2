'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  FolderOpen,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Users,
  Star,
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role
      router.replace(role === 'STUDENT' ? '/student' : '/teacher')
    }
  }, [status, session, router])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-pulse text-sky-500 text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-sky-500" />
            <span className="text-xl font-bold text-gray-900">TutorFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-sky-50 via-white to-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="h-4 w-4" />
            Built for IGCSE Tutors
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            The Smarter Way to Manage{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">
              IGCSE Tutoring
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Create courses, assign and grade work with IGCSE boundaries, and track student progress — all in one
            streamlined platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/30"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Purpose-built tools for IGCSE tutoring, from course creation to final grades.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Course Management',
                desc: 'Create IGCSE-aligned courses with modules and enrollment codes for easy student onboarding.',
              },
              {
                icon: ClipboardCheck,
                title: 'Assignment & Grading',
                desc: 'Create assignments, grade with IGCSE boundaries (A*–U), and use mark schemes.',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                desc: 'Monitor student progress, completion rates, and estimated grades at a glance.',
              },
              {
                icon: GraduationCap,
                title: 'Student Portal',
                desc: 'Students join courses, submit work, and track their own grades and feedback.',
              },
              {
                icon: FolderOpen,
                title: 'File Management',
                desc: 'Upload and organize resources, handouts, and past papers for each course.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure & Private',
                desc: 'Role-based access with complete teacher/student isolation for data privacy.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-500 text-lg">Three simple steps to get started.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', icon: PlusCircle, title: 'Create a Course', desc: 'Set up your IGCSE course with modules, resources, and an enrollment code.' },
              { step: '2', icon: Users, title: 'Students Join', desc: 'Share the code. Students sign up and join your course instantly.' },
              { step: '3', icon: ClipboardCheck, title: 'Teach & Grade', desc: 'Assign work, grade with IGCSE boundaries, and track progress.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-sky-500 to-sky-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to streamline your tutoring?</h2>
          <p className="mt-4 text-sky-100 text-lg">
            Join TutorFlow today and focus on what matters — teaching.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 bg-white text-sky-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-sky-50 shadow-lg transition-all"
          >
            Create Your Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="h-5 w-5 text-sky-400" />
          <span className="font-semibold text-white">TutorFlow</span>
        </div>
        <p className="text-gray-400 text-sm">
          © 2026 TutorFlow Platform. Specialized IGCSE Curriculum Support.
        </p>
      </footer>
    </div>
  )
}
