"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Lightbulb,
  BookOpen,
  PenLine,
  DollarSign,
  Heart,
  Briefcase,
  User,
  Archive,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  X,
  Download,
  ArrowLeft,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note, NoteCategory } from "@/types/database.types";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

const CATEGORIES: { value: NoteCategory; label: string; icon: typeof FileText; color: string }[] = [
  { value: "reference", label: "Reference", icon: BookOpen, color: "text-blue-400" },
  { value: "idea", label: "Ideas", icon: Lightbulb, color: "text-yellow-400" },
  { value: "guide", label: "Guides", icon: FileText, color: "text-emerald-400" },
  { value: "journal", label: "Journal", icon: PenLine, color: "text-violet-400" },
  { value: "finance", label: "Finance", icon: DollarSign, color: "text-green-400" },
  { value: "health", label: "Health", icon: Heart, color: "text-rose-400" },
  { value: "work", label: "Work", icon: Briefcase, color: "text-orange-400" },
  { value: "personal", label: "Personal", icon: User, color: "text-cyan-400" },
  { value: "archive", label: "Archive", icon: Archive, color: "text-gray-400" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-gray-400" },
];

function getCategoryMeta(category: NoteCategory) {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content_md: "",
    tags: "",
    category: "other" as NoteCategory,
    is_pinned: false,
  });

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Category counts
  const categoryCounts = notes.reduce(
    (acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || []))).sort();

  // Filter notes client-side
  const filteredNotes = notes
    .filter((note) => {
      const q = searchQuery.toLowerCase();
      const searchMatch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        (note.content_md || "").toLowerCase().includes(q) ||
        (note.tags || []).some((tag) => tag.toLowerCase().includes(q));

      const categoryMatch = selectedCategory === "all" || note.category === selectedCategory;

      const tagMatch =
        selectedTags.length === 0 || selectedTags.every((tag) => (note.tags || []).includes(tag));

      return searchMatch && categoryMatch && tagMatch;
    })
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned);

  const createNote = async () => {
    if (!formData.title.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          content_md: formData.content_md.trim() || null,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          category: formData.category,
          is_pinned: formData.is_pinned,
        }),
      });

      if (!res.ok) throw new Error("Failed to create note");
      const note = await res.json();
      setNotes([note, ...notes]);
      resetForm();
      setIsCreating(false);
      setSelectedNote(note);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const updateNote = async () => {
    if (!editingNote || !formData.title.trim()) return;

    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          content_md: formData.content_md.trim() || null,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          category: formData.category,
          is_pinned: formData.is_pinned,
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === editingNote.id ? updatedNote : n)));
      resetForm();
      setEditingNote(null);
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !note.is_pinned }),
      });

      if (!res.ok) throw new Error("Failed to toggle pin");
      const updated = await res.json();
      setNotes(notes.map((n) => (n.id === note.id ? updated : n)));
      if (selectedNote?.id === note.id) setSelectedNote(updated);
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const deleteNote = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((n) => n.id !== deleteTarget.id));
      if (selectedNote?.id === deleteTarget.id) setSelectedNote(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content_md: note.content_md || "",
      tags: (note.tags || []).join(", "),
      category: note.category,
      is_pinned: note.is_pinned,
    });
    setIsCreating(false);
    setSelectedNote(null);
  };

  const resetForm = () => {
    setFormData({ title: "", content_md: "", tags: "", category: "other", is_pinned: false });
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    resetForm();
  };

  const downloadNote = (note: Note) => {
    const content = `# ${note.title}\n\n${note.content_md || ""}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadMd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const fileName = file.name.replace(/\.md$/i, "");

    // Strip leading "# Title" line if present, use it as the title
    let title = fileName;
    let content = text;
    const headingMatch = text.match(/^#\s+(.+)\n/);
    if (headingMatch) {
      title = headingMatch[1].trim();
      content = text.slice(headingMatch[0].length).trim();
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content_md: content || null,
          tags: [],
          category: "reference" as NoteCategory,
          is_pinned: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to upload note");
      const note = await res.json();
      setNotes([note, ...notes]);
      setSelectedNote(note);
      setIsCreating(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Error uploading note:", error);
    }

    // Reset input so the same file can be uploaded again
    e.target.value = "";
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-800" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg border border-gray-800 bg-gray-900" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderNoteCard = (note: Note) => {
    const meta = getCategoryMeta(note.category);
    const Icon = meta.icon;
    return (
      <div
        key={note.id}
        onClick={() => {
          setSelectedNote(note);
          setIsCreating(false);
          setEditingNote(null);
        }}
        className={`group cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
          selectedNote?.id === note.id
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-gray-800 bg-gray-900 hover:border-gray-700"
        }`}
      >
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${meta.color}`} />
            <h3 className="font-semibold text-white line-clamp-1">{note.title}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note);
            }}
            className={`shrink-0 rounded p-1 transition-colors ${
              note.is_pinned
                ? "text-amber-400 hover:text-amber-300"
                : "text-gray-600 opacity-0 group-hover:opacity-100 hover:text-gray-400"
            }`}
          >
            {note.is_pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
          </button>
        </div>
        {note.content_md && (
          <p className="mb-2 text-xs text-gray-500 line-clamp-2">{note.content_md.slice(0, 120)}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{formatDate(note.updated_at)}</span>
          {(note.tags || []).length > 0 && (
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] text-gray-600">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Vault</h1>
              <p className="text-sm text-gray-500">Your personal knowledge base</p>
            </div>
            <div className="flex gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-700 hover:text-white">
                <Upload className="h-4 w-4" />
                Upload .md
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleUploadMd}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedNote(null);
                  setEditingNote(null);
                  resetForm();
                }}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4" />
                New Note
              </button>
            </div>
        </div>

        {/* Category Pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              selectedCategory === "all"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            All
            <span className="text-xs text-gray-600">{notes.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.value] || 0;
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedCategory === cat.value
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${selectedCategory === cat.value ? "text-emerald-400" : cat.color}`} />
                {cat.label}
                {count > 0 && <span className="text-xs text-gray-600">{count}</span>}
              </button>
            );
          })}
        </div>

          {/* Search & Tag Filters */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500">Tags:</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                      selectedTags.includes(tag)
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                        : "border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700 hover:text-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400 hover:bg-red-500/20"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Editor/Viewer Panel */}
          {(isCreating || editingNote) && (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">Title*</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Note title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as NoteCategory })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., tax, insurance, important"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Content (Markdown supported)
                  </label>
                  <textarea
                    value={formData.content_md}
                    onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    rows={16}
                    placeholder={"# Your note content here\n\nUse **markdown** for formatting..."}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    Pin to top
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingNote ? updateNote : createNote}
                      disabled={!formData.title.trim()}
                      className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editingNote ? "Save Changes" : "Create Note"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Note Viewer */}
          {selectedNote && !isCreating && !editingNote && (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <button
                onClick={() => setSelectedNote(null)}
                className="mb-4 flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to notes
              </button>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {(() => {
                      const meta = getCategoryMeta(selectedNote.category);
                      const Icon = meta.icon;
                      return (
                        <span
                          className={`flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs ${meta.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      );
                    })()}
                    {selectedNote.is_pinned && (
                      <span className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <h2 className="mb-1 text-2xl font-bold text-white">{selectedNote.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created {formatDate(selectedNote.created_at)}</span>
                    <span>Updated {formatDate(selectedNote.updated_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(selectedNote)}
                    className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                      selectedNote.is_pinned
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {selectedNote.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => downloadNote(selectedNote)}
                    className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    .md
                  </button>
                  <button
                    onClick={() => startEdit(selectedNote)}
                    className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-400 transition-colors hover:bg-blue-500/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selectedNote)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {(selectedNote.tags || []).length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {selectedNote.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedNote.content_md ? (
                <div className="prose prose-invert max-w-none rounded-lg border border-gray-700 bg-gray-800/50 p-6 prose-headings:text-white prose-headings:font-bold prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-lg prose-p:my-3 prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-emerald-400 prose-strong:text-white prose-code:rounded prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-emerald-300 prose-pre:my-4 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-li:my-1 prose-li:text-gray-300 prose-ul:my-3 prose-ol:my-3 prose-th:text-gray-300 prose-td:text-gray-400 prose-hr:my-6 prose-hr:border-gray-700 prose-blockquote:my-4 prose-blockquote:border-emerald-500/50 prose-blockquote:text-gray-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedNote.content_md}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="italic text-gray-600">No content</p>
              )}
            </div>
          )}

          {/* Notes Grid */}
          {!isCreating && !editingNote && !selectedNote && filteredNotes.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-700" />
              <p className="text-gray-500">
                {notes.length === 0
                  ? "Your vault is empty. Create your first note."
                  : "No notes match your filters."}
              </p>
            </div>
          )}

          {!isCreating && !editingNote && filteredNotes.length > 0 && (
            <div className="space-y-6">
              {/* Pinned Section */}
              {pinnedNotes.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                    <Pin className="h-3 w-3" />
                    Pinned ({pinnedNotes.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {pinnedNotes.map(renderNoteCard)}
                  </div>
                </div>
              )}

              {/* All Notes Section */}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                      {selectedCategory === "all"
                        ? `All Notes (${unpinnedNotes.length})`
                        : `${getCategoryMeta(selectedCategory as NoteCategory).label} (${unpinnedNotes.length})`}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {unpinnedNotes.map(renderNoteCard)}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteNote}
        itemName={deleteTarget?.title || ""}
      />
    </div>
  );
}
