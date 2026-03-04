'use client'

import { X, Download, ExternalLink } from 'lucide-react'

interface ContentViewerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fileUrl: string | null
  fileType: string
  textContent?: string | null
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  return null
}

function isGoogleDocsViewable(url: string): boolean {
  return /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i.test(url) || url.includes('.pdf')
}

export default function ContentViewer({ isOpen, onClose, title, fileUrl, fileType, textContent }: ContentViewerProps) {
  if (!isOpen) return null

  const renderContent = () => {
    // Notes — plain text
    if (fileType === 'NOTE' && textContent) {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
            {textContent}
          </div>
        </div>
      )
    }

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No content available
        </div>
      )
    }

    // Check for embeddable video URLs (YouTube, etc.)
    const embedUrl = getEmbedUrl(fileUrl)
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    // Images — render directly
    if (fileType === 'IMAGE') {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img src={fileUrl} alt={title} className="max-w-full max-h-full object-contain rounded" />
        </div>
      )
    }

    // Video files — HTML5 video player
    if (fileType === 'VIDEO') {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <video src={fileUrl} controls className="max-w-full max-h-full rounded" autoPlay>
            Your browser does not support video playback.
          </video>
        </div>
      )
    }

    // PDFs — try iframe embed, with Google Docs viewer fallback for Cloudinary URLs
    if (fileType === 'PDF' || fileUrl.toLowerCase().includes('.pdf')) {
      // Cloudinary raw URLs don't embed well, use Google Docs viewer
      if (fileUrl.includes('cloudinary') || fileUrl.includes('res.cloudinary.com')) {
        return (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
          />
        )
      }
      return (
        <iframe src={fileUrl} className="w-full h-full border-0" />
      )
    }

    // Slides / Documents — Google Docs viewer
    if (fileType === 'SLIDE' || fileType === 'DOCUMENT' || isGoogleDocsViewable(fileUrl)) {
      return (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="w-full h-full border-0"
        />
      )
    }

    // Fallback — try iframe
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        className="w-full h-full border-0"
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 truncate">{title}</h2>
        <div className="flex items-center gap-2">
          {fileUrl && (
            <>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
              <a
                href={fileUrl}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {renderContent()}
      </div>
    </div>
  )
}
