"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
  GripVertical,
  Video,
  FileText,
  Presentation,
  Image,
  File,
} from "lucide-react";
import InlineContentViewer from "@/components/inline-content-viewer";

type ContentItem = {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string | null;
  fileType: string;
  textContent?: string | null;
  createdAt: string;
};

type Module = {
  id: string;
  name: string;
  order: number;
  contents: ContentItem[];
};

const FILE_TYPE_ICONS: Record<string, { icon: typeof Video; label: string; emoji: string }> = {
  VIDEO: { icon: Video, label: "Video", emoji: "🎥" },
  PDF: { icon: FileText, label: "Notes/PDF", emoji: "📝" },
  SLIDE: { icon: Presentation, label: "Slides", emoji: "📊" },
  IMAGE: { icon: Image, label: "Image", emoji: "🖼️" },
  DOCUMENT: { icon: File, label: "Document", emoji: "📄" },
};

export default function ModulesContent({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleName, setNewModuleName] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [uploadModal, setUploadModal] = useState<string | null>(null); // moduleId
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    fileType: "VIDEO" as string,
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [deletingContent, setDeletingContent] = useState<string | null>(null);

  const deleteContent = async (contentId: string) => {
    if (!confirm("Delete this content? It will also be removed from cloud storage.")) return;
    setDeletingContent(contentId);
    try {
      const res = await fetch(`/api/content/${contentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      } else {
        await fetchModules();
      }
    } finally {
      setDeletingContent(null);
    }
  };

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/modules?courseId=${courseId}`);
      const data = await res.json();
      setModules(data.modules || []);
      // Auto-expand all on first load
      if (data.modules?.length) {
        setExpandedModules(new Set(data.modules.map((m: Module) => m.id)));
      }
    } catch {
      console.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const toggleExpand = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addModule = async () => {
    if (!newModuleName.trim()) return;
    setAddingModule(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name: newModuleName.trim() }),
      });
      if (res.ok) {
        setNewModuleName("");
        await fetchModules();
      }
    } finally {
      setAddingModule(false);
    }
  };

  const renameModule = async (moduleId: string) => {
    if (!editName.trim()) return;
    await fetch(`/api/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingModule(null);
    await fetchModules();
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Delete this empty module?")) return;
    const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }
    await fetchModules();
  };

  const moveModule = async (moduleId: string, direction: "up" | "down") => {
    const idx = modules.findIndex((m) => m.id === moduleId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;

    await Promise.all([
      fetch(`/api/modules/${modules[idx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: modules[swapIdx].order }),
      }),
      fetch(`/api/modules/${modules[swapIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: modules[idx].order }),
      }),
    ]);
    await fetchModules();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModal || !uploadForm.file || !uploadForm.title.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadForm.file);
      fd.append("courseId", courseId);
      fd.append("moduleId", uploadModal);
      fd.append("title", uploadForm.title.trim());
      fd.append("description", uploadForm.description);
      fd.append("fileType", uploadForm.fileType);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        setUploadModal(null);
        setUploadForm({ title: "", description: "", fileType: "VIDEO", file: null });
        await fetchModules();
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-400">
        Loading modules...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Module */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addModule()}
            placeholder="New module name..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={addModule}
            disabled={addingModule || !newModuleName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-400 text-sm">
          No modules yet. Add your first module above to organize course content.
        </div>
      ) : (
        modules.map((mod, idx) => (
          <div
            key={mod.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Module Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveModule(mod.id, "up")}
                  disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                >
                  <GripVertical className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveModule(mod.id, "down")}
                  disabled={idx === modules.length - 1}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                >
                  <GripVertical className="w-3 h-3" />
                </button>
              </div>

              <button onClick={() => toggleExpand(mod.id)} className="text-gray-400">
                {expandedModules.has(mod.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {editingModule === mod.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameModule(mod.id)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                  />
                  <button onClick={() => renameModule(mod.id)} className="text-green-500">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingModule(null)} className="text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h3
                  className="text-base font-semibold text-gray-900 flex-1 cursor-pointer"
                  onClick={() => toggleExpand(mod.id)}
                >
                  {mod.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {mod.contents.length} item{mod.contents.length !== 1 ? "s" : ""}
                  </span>
                </h3>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUploadModal(mod.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sky-500 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Add Content
                </button>
                <button
                  onClick={() => {
                    setEditingModule(mod.id);
                    setEditName(mod.name);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {mod.contents.length === 0 && (
                  <button
                    onClick={() => deleteModule(mod.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Module Contents */}
            {expandedModules.has(mod.id) && (
              <div className="divide-y divide-gray-50">
                {mod.contents.length === 0 ? (
                  <div className="px-5 py-6 text-center text-gray-400 text-sm">
                    No content yet. Click &quot;Add Content&quot; to upload.
                  </div>
                ) : (
                  mod.contents.map((content) => {
                    const ft = FILE_TYPE_ICONS[content.fileType] || FILE_TYPE_ICONS.DOCUMENT;
                    return (
                      <div key={content.id}>
                        <div
                          className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 group cursor-pointer"
                          onClick={() => setExpandedContent(expandedContent === content.id ? null : content.id)}
                        >
                          {expandedContent === content.id ? (
                            <ChevronDown className="w-4 h-4 text-sky-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span className="text-lg">{ft.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium ${expandedContent === content.id ? "text-sky-600" : "text-gray-900"}`}>
                              {content.title}
                            </span>
                            {content.description && (
                              <p className="text-xs text-gray-400 truncate">{content.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(content.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteContent(content.id); }}
                            disabled={deletingContent === content.id}
                            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                            title="Delete content"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {expandedContent === content.id && (
                          <div className="px-5 pb-4">
                            <InlineContentViewer
                              fileUrl={content.fileUrl}
                              fileType={content.fileType}
                              textContent={content.textContent}
                              title={content.title}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Content to{" "}
              {modules.find((m) => m.id === uploadModal)?.name || "Module"}
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={uploadForm.fileType}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, fileType: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="VIDEO">🎥 Video</option>
                  <option value="PDF">📝 Notes / PDF</option>
                  <option value="SLIDE">📊 Slides</option>
                  <option value="IMAGE">🖼️ Image</option>
                  <option value="DOCUMENT">📄 Document</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Lecture 1 - Introduction"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, file: e.target.files?.[0] || null }))
                  }
                  required
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModal(null);
                    setUploadForm({ title: "", description: "", fileType: "VIDEO", file: null });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
