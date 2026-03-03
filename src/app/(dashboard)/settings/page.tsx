'use client'

import { useSession } from 'next-auth/react'
import { User, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your account preferences</p>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-sky-500" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <p className="text-gray-900 font-medium">{session?.user?.name || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {session?.user?.email || '—'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium">
              <Shield className="w-3.5 h-3.5" />
              {session?.user?.role || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <p className="text-sm text-gray-500">Account management features coming soon — password change, notification preferences, and more.</p>
      </div>
    </div>
  )
}
