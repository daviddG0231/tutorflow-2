'use client'

import { useSession } from 'next-auth/react'
import { Search, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TopBar() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {})
  }, [session?.user])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses or students..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="text-right">
          <p className="text-sm font-semibold text-gray-800">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-gray-500">{session?.user?.role === 'TEACHER' ? 'Teacher' : 'Student'}</p>
        </span>

        <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-9 h-9 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center">
          {session?.user?.image ? (
            <Image src={session.user.image} alt="" width={36} height={36} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-sky-600">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
