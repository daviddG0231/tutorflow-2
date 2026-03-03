import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-sky-500 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-colors shadow-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
