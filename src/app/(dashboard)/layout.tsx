import Sidebar from '@/components/sidebar'
import TopBar from '@/components/topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[220px]">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
        <footer className="px-6 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          © 2026 TutorFlow Platform. All rights reserved. Specialized IGCSE Curriculum Support.
        </footer>
      </div>
    </div>
  )
}
