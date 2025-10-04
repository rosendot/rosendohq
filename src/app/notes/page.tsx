// src/app/notes/page.tsx
'use client';

import { useState } from 'react';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

// Minimal mock data
const mockNotes: Note[] = [
    {
        id: '1',
        title: 'Project Ideas',
        content: `# Project Ideas for 2025

## Web Apps
- Personal finance tracker with AI insights
- Habit tracker with streak gamification

## Learning Goals
- Master Next.js 15 and Server Components
- Deep dive into PostgreSQL optimization`,
        tags: ['ideas', 'projects', 'planning'],
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-03T15:30:00Z'
    },
    {
        id: '2',
        title: 'Meeting Notes - Team Sync',
        content: `# Weekly Team Sync - Jan 5, 2025

## Key Decisions
1. Moving to microservices architecture
2. Adopting TypeScript for new projects

## Action Items
- [ ] Research containerization options
- [ ] Create TypeScript migration guide`,
        tags: ['meetings', 'work'],
        created_at: '2025-01-05T14:00:00Z',
        updated_at: '2025-01-05T16:30:00Z'
    }
];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        tags: ''
    });

    // Get all unique tags
    const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

    // Filter notes
    const filteredNotes = notes.filter(note => {
        const searchMatch = searchQuery === '' ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const tagMatch = selectedTags.length === 0 ||
            selectedTags.every(tag => note.tags.includes(tag));

        return searchMatch && tagMatch;
    }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const createNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;

        const note: Note = {
            id: Date.now().toString(),
            title: newNote.title.trim(),
            content: newNote.content.trim(),
            tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        setNotes([note, ...notes]);
        setNewNote({ title: '', content: '', tags: '' });
        setIsCreating(false);
        setSelectedNote(note);
    };

    const updateNote = () => {
        if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) return;

        const updatedNote: Note = {
            ...editingNote,
            title: newNote.title.trim(),
            content: newNote.content.trim(),
            tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
            updated_at: new Date().toISOString()
        };

        setNotes(notes.map(n => n.id === editingNote.id ? updatedNote : n));
        setNewNote({ title: '', content: '', tags: '' });
        setEditingNote(null);
        setSelectedNote(updatedNote);
    };

    const deleteNote = (noteId: string) => {
        if (confirm('Are you sure you want to delete this note?')) {
            setNotes(notes.filter(n => n.id !== noteId));
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
            }
        }
    };

    const startEdit = (note: Note) => {
        setEditingNote(note);
        setNewNote({
            title: note.title,
            content: note.content,
            tags: note.tags.join(', ')
        });
        setIsCreating(false);
        setSelectedNote(null);
    };

    const cancelEdit = () => {
        setEditingNote(null);
        setIsCreating(false);
        setNewNote({ title: '', content: '', tags: '' });
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Knowledge Base / Notes</h1>
                    <p className="text-gray-400">Capture ideas, meeting notes, and important information</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setSelectedNote(null);
                                setEditingNote(null);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                        >
                            New Note
                        </button>
                    </div>

                    {/* Tag Filters */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-gray-400">Filter by tags:</span>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedTags.includes(tag)
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Notes List */}
                    <div className="lg:col-span-1 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                            Notes ({filteredNotes.length})
                        </h2>
                        <div className="space-y-2">
                            {filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => {
                                        setSelectedNote(note);
                                        setIsCreating(false);
                                        setEditingNote(null);
                                    }}
                                    className={`bg-gray-900 rounded-lg border p-4 cursor-pointer transition-all duration-200 ${selectedNote?.id === note.id
                                        ? 'border-emerald-500/50 bg-emerald-500/5'
                                        : 'border-gray-800 hover:border-gray-700'
                                        }`}
                                >
                                    <h3 className="font-semibold text-white mb-1">{note.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2">
                                        Updated {formatDate(note.updated_at)}
                                    </p>
                                    {note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {note.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredNotes.length === 0 && (
                                <div className="text-center text-gray-500 py-8 bg-gray-900 rounded-lg border border-gray-800">
                                    <p>No notes found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Note Editor/Viewer */}
                    <div className="lg:col-span-2">
                        {(isCreating || editingNote) ? (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    {editingNote ? 'Edit Note' : 'Create Note'}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Title*
                                        </label>
                                        <input
                                            type="text"
                                            value={newNote.title}
                                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Note title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={newNote.tags}
                                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., ideas, work, personal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Content* (Markdown supported)
                                        </label>
                                        <textarea
                                            value={newNote.content}
                                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                                            rows={20}
                                            placeholder="# Your note content here&#10;&#10;Use **markdown** for formatting..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={editingNote ? updateNote : createNote}
                                            disabled={!newNote.title.trim() || !newNote.content.trim()}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            {editingNote ? 'Update Note' : 'Create Note'}
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : selectedNote ? (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-2">{selectedNote.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>Created: {formatDate(selectedNote.created_at)}</span>
                                            <span>Updated: {formatDate(selectedNote.updated_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(selectedNote)}
                                            className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteNote(selectedNote.id)}
                                            className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {selectedNote.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedNote.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="prose prose-invert max-w-none">
                                    <div className="text-gray-300 whitespace-pre-wrap font-mono text-sm bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                        {selectedNote.content}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                                <p className="text-gray-500 text-lg">Select a note to view or create a new one</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}