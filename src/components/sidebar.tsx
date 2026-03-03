'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, PlusCircle, ClipboardList, Settings, LogOut, CalendarCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'My Courses', href: '/teacher/courses', icon: BookOpen },
  { label: 'Assignments', href: '/teacher/assignments', icon: ClipboardList },
  { label: 'Create Course', href: '/teacher/courses/new', icon: PlusCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isStudent = pathname?.startsWith('/student')

  const items = isStudent
    ? [
        { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
        { label: 'My Courses', href: '/student/courses', icon: BookOpen },
        { label: 'Assignments', href: '/student/assignments', icon: ClipboardList },
        { label: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
      ]
    : navItems

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-sky-500">TutorFlow</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/teacher' && item.href !== '/student' && pathname?.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                isActive
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
              {item.label === 'Create Course' || item.label === 'Dashboard' ? null : (
                pathname?.startsWith(item.href) && item.href.includes('courses') ? (
                  <span className="ml-auto text-gray-400">›</span>
                ) : null
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  )
}
