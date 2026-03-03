import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import NotificationList from './notification-list'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { course: { select: { name: true } } },
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <NotificationList
          notifications={notifications.map((n) => ({
            id: n.id,
            message: n.message,
            read: n.read,
            createdAt: n.createdAt.toISOString(),
            courseName: n.course?.name ?? null,
          }))}
          hasUnread={unreadCount > 0}
        />
      )}
    </div>
  )
}
