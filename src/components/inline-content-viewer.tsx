'use client'

import { Download, ExternalLink } from 'lucide-react'

interface InlineContentViewerProps {
  fileUrl: string | null
  fileType: string
  textContent?: string | null
  title: string
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  return null
}

export default function InlineContentViewer({ fileUrl, fileType, textContent, title }: InlineContentViewerProps) {
  // Notes
  if (fileType === 'NOTE' && textContent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
          {textContent}
        </div>
      </div>
    )
  }

  if (!fileUrl) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
        No content available
      </div>
    )
  }

  // Embeddable video (YouTube etc)
  const embedUrl = getEmbedUrl(fileUrl)
  if (embedUrl) {
    return (
      <div className="space-y-2">
        <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <ActionBar fileUrl={fileUrl} />
      </div>
    )
  }

  // Image
  if (fileType === 'IMAGE') {
    return (
      <div className="space-y-2">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex justify-center">
          <img src={fileUrl} alt={title} className="max-w-full max-h-[500px] object-contain rounded" />
        </div>
        <ActionBar fileUrl={fileUrl} />
      </div>
    )
  }

  // Video file
  if (fileType === 'VIDEO') {
    return (
      <div className="space-y-2">
        <div className="bg-black rounded-lg overflow-hidden">
          <video src={fileUrl} controls className="w-full max-h-[500px]" preload="metadata">
            Your browser does not support video playback.
          </video>
        </div>
        <ActionBar fileUrl={fileUrl} />
      </div>
    )
  }

  // PDF — Google Docs viewer for Cloudinary URLs
  if (fileType === 'PDF' || fileUrl.toLowerCase().includes('.pdf')) {
    const viewerUrl = fileUrl.includes('cloudinary')
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
      : fileUrl
    return (
      <div className="space-y-2">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <iframe src={viewerUrl} className="w-full h-full border-0" />
        </div>
        <ActionBar fileUrl={fileUrl} />
      </div>
    )
  }

  // Slides / Documents — Google Docs viewer
  if (fileType === 'SLIDE' || fileType === 'DOCUMENT') {
    return (
      <div className="space-y-2">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
          />
        </div>
        <ActionBar fileUrl={fileUrl} />
      </div>
    )
  }

  // Fallback
  return (
    <div className="space-y-2">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="w-full h-full border-0"
        />
      </div>
      <ActionBar fileUrl={fileUrl} />
    </div>
  )
}

function ActionBar({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="flex items-center gap-3">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sky-600 transition"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Open in new tab
      </a>
      <a
        href={fileUrl}
        download
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-sky-600 transition"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </a>
    </div>
  )
}
