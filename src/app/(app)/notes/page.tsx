"use client";

import { useState, useEffect, useCallback } from "react";
import type { Note } from "@/types/database.types";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const [formData, setFormData] = useState({ title: "", content_md: "", tags: "" });

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

      const tagMatch =
        selectedTags.length === 0 || selectedTags.every((tag) => (note.tags || []).includes(tag));

      return searchMatch && tagMatch;
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const createNote = async () => {
    if (!formData.title.trim() || !formData.content_md.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          content_md: formData.content_md.trim(),
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to create note");
      const note = await res.json();
      setNotes([note, ...notes]);
      setFormData({ title: "", content_md: "", tags: "" });
      setIsCreating(false);
      setSelectedNote(note);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const updateNote = async () => {
    if (!editingNote || !formData.title.trim() || !formData.content_md.trim()) return;

    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          content_md: formData.content_md.trim(),
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === editingNote.id ? updatedNote : n)));
      setFormData({ title: "", content_md: "", tags: "" });
      setEditingNote(null);
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const deleteNote = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((n) => n.id !== deleteTarget.id));
      if (selectedNote?.id === deleteTarget.id) {
        setSelectedNote(null);
      }
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
    });
    setIsCreating(false);
    setSelectedNote(null);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: "", content_md: "", tags: "" });
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
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-2 h-8 w-64 rounded bg-gray-800" />
            <div className="h-4 w-96 rounded bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <div className="mb-2 h-5 w-40 rounded bg-gray-800" />
                  <div className="h-3 w-24 rounded bg-gray-800" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-12">
                <div className="mx-auto h-5 w-64 rounded bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="mb-2 text-3xl font-bold text-white">Knowledge Base / Notes</h1>
          <p className="text-gray-400">Capture ideas, meeting notes, and important information</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setIsCreating(true);
                setSelectedNote(null);
                setEditingNote(null);
                setFormData({ title: "", content_md: "", tags: "" });
              }}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
            >
              New Note
            </button>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400">Filter by tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Notes List */}
          <div className="space-y-3 lg:col-span-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Notes ({filteredNotes.length})
            </h2>
            <div className="space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsCreating(false);
                    setEditingNote(null);
                  }}
                  className={`cursor-pointer rounded-lg border bg-gray-900 p-4 transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <h3 className="mb-1 font-semibold text-white">{note.title}</h3>
                  <p className="mb-2 text-xs text-gray-400">Updated {formatDate(note.updated_at)}</p>
                  {(note.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="rounded-lg border border-gray-800 bg-gray-900 py-8 text-center text-gray-500">
                  <p>No notes found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Note Editor/Viewer */}
          <div className="lg:col-span-2">
            {isCreating || editingNote ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">
                  {editingNote ? "Edit Note" : "Create Note"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Title*</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Note title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g., ideas, work, personal"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Content* (Markdown supported)
                    </label>
                    <textarea
                      value={formData.content_md}
                      onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      rows={20}
                      placeholder={"# Your note content here\n\nUse **markdown** for formatting..."}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingNote ? updateNote : createNote}
                      disabled={!formData.title.trim() || !formData.content_md.trim()}
                      className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editingNote ? "Update Note" : "Create Note"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="mb-2 text-2xl font-bold text-white">{selectedNote.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Created: {formatDate(selectedNote.created_at)}</span>
                      <span>Updated: {formatDate(selectedNote.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(selectedNote)}
                      className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-400 transition-colors hover:bg-blue-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedNote)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {(selectedNote.tags || []).length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 font-mono text-sm whitespace-pre-wrap text-gray-300">
                    {selectedNote.content_md}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
                <p className="text-lg text-gray-500">Select a note to view or create a new one</p>
              </div>
            )}
          </div>
        </div>
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
