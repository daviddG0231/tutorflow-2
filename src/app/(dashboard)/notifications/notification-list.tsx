'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
  courseName: string | null
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationList({
  notifications: initial,
  hasUnread,
}: {
  notifications: Notification[]
  hasUnread: boolean
}) {
  const [notifications, setNotifications] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(() => router.refresh())
  }

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {hasUnread && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllRead}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              n.read
                ? 'bg-white hover:bg-gray-50'
                : 'bg-sky-50 border-l-4 border-sky-500 hover:bg-sky-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {n.message}
                </p>
                {n.courseName && (
                  <p className="text-xs text-gray-400 mt-1">{n.courseName}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                {timeAgo(n.createdAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
