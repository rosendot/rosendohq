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

// Mock data for development
const mockNotes: Note[] = [
    {
        id: '1',
        title: 'Project Ideas',
        content: `# Project Ideas for 2025

## Web Apps
- Personal finance tracker with AI insights
- Habit tracker with streak gamification
- Recipe organizer with meal planning

## Learning Goals
- Master Next.js 15 and Server Components
- Deep dive into PostgreSQL optimization
- Learn Rust for systems programming

## Side Projects
- Build a Markdown-based note-taking app
- Create a Chrome extension for productivity
- Develop a CLI tool for file organization`,
        tags: ['ideas', 'projects', 'planning'],
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-03T15:30:00Z'
    },
    {
        id: '2',
        title: 'Meeting Notes - Team Sync',
        content: `# Weekly Team Sync - Jan 5, 2025

## Attendees
- Alice (Team Lead)
- Bob (Backend Dev)
- Carol (Frontend Dev)
- Me

## Key Decisions
1. Moving to microservices architecture
2. Adopting TypeScript for new projects
3. Weekly code review sessions on Fridays

## Action Items
- [ ] Research containerization options (Bob)
- [ ] Create TypeScript migration guide (Carol)
- [ ] Set up code review process (Alice)
- [ ] Update documentation (Me)

## Next Meeting
Friday, Jan 12 at 2 PM`,
        tags: ['meetings', 'work', 'team'],
        created_at: '2025-01-05T14:00:00Z',
        updated_at: '2025-01-05T16:30:00Z'
    },
    {
        id: '3',
        title: 'Book Summary: Atomic Habits',
        content: `# Atomic Habits by James Clear

## Key Takeaways

### The Four Laws of Behavior Change
1. **Make it Obvious** - Design your environment
2. **Make it Attractive** - Bundle habits with things you enjoy
3. **Make it Easy** - Reduce friction for good habits
4. **Make it Satisfying** - Use immediate rewards

### Important Quotes
> "You do not rise to the level of your goals. You fall to the level of your systems."

> "Every action you take is a vote for the type of person you wish to become."

### Implementation Ideas
- Start with 2-minute habits
- Use habit stacking (after [CURRENT HABIT], I will [NEW HABIT])
- Track habits visually with a calendar
- Focus on identity-based habits ("I am a runner" vs "I want to run")

### Rating: ⭐⭐⭐⭐⭐`,
        tags: ['books', 'habits', 'self-improvement', 'summary'],
        created_at: '2025-01-02T20:00:00Z',
        updated_at: '2025-01-02T22:15:00Z'
    },
    {
        id: '4',
        title: 'Recipe: Homemade Pizza Dough',
        content: `# Perfect Pizza Dough Recipe

## Ingredients
- 500g bread flour
- 325ml warm water
- 2 tsp salt
- 1 tsp sugar
- 2 tsp active dry yeast
- 2 tbsp olive oil

## Instructions
1. Mix yeast and sugar in warm water, let sit 5 minutes
2. Combine flour and salt in large bowl
3. Add yeast mixture and olive oil
4. Knead for 10 minutes until smooth
5. Let rise 1-2 hours until doubled
6. Divide into 2-3 portions
7. Roll out and add toppings
8. Bake at 475°F for 12-15 minutes

## Tips
- Use a pizza stone if available
- Pre-heat oven for at least 30 minutes
- Don't overload with toppings
- Fresh mozzarella is key!`,
        tags: ['recipes', 'cooking', 'italian'],
        created_at: '2024-12-28T18:00:00Z',
        updated_at: '2024-12-28T18:30:00Z'
    },
    {
        id: '5',
        title: 'TypeScript Best Practices',
        content: `# TypeScript Best Practices

## Type Definitions
\`\`\`typescript
// Use interfaces for object shapes
interface User {
    id: string;
    name: string;
    email: string;
}

// Use type for unions and intersections
type Status = 'active' | 'inactive' | 'pending';
\`\`\`

## Avoid Any
- Use \`unknown\` instead of \`any\` when type is truly unknown
- Use generics for reusable type-safe functions
- Enable \`strict\` mode in tsconfig.json

## Utility Types
- \`Partial<T>\` - Make all properties optional
- \`Required<T>\` - Make all properties required
- \`Pick<T, K>\` - Select specific properties
- \`Omit<T, K>\` - Exclude specific properties

## Key Principles
1. Prefer type inference over explicit types
2. Use const assertions for literal types
3. Discriminated unions for complex types
4. Never use \`as any\` unless absolutely necessary`,
        tags: ['typescript', 'programming', 'best-practices', 'development'],
        created_at: '2025-01-04T11:00:00Z',
        updated_at: '2025-01-04T12:45:00Z'
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

    const startEditing = (note: Note) => {
        setEditingNote(note);
        setNewNote({
            title: note.title,
            content: note.content,
            tags: note.tags.join(', ')
        });
        setIsCreating(false);
    };

    const cancelEdit = () => {
        setIsCreating(false);
        setEditingNote(null);
        setNewNote({ title: '', content: '', tags: '' });
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTags([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Knowledge Base
                    </h1>
                    <p className="text-gray-600">Your personal notes and documentation</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search notes by title, content, or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md whitespace-nowrap"
                            >
                                + New Note
                            </button>
                        </div>

                        {/* Tag Filters */}
                        {allTags.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
                                    {selectedTags.length > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${selectedTags.includes(tag)
                                                ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Results count */}
                        <div className="text-sm text-gray-600">
                            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notes List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                {isCreating || editingNote ? 'All Notes' : 'Recent Notes'}
                            </h2>
                            <div className="space-y-2">
                                {filteredNotes.map(note => (
                                    <button
                                        key={note.id}
                                        onClick={() => {
                                            setSelectedNote(note);
                                            setIsCreating(false);
                                            setEditingNote(null);
                                        }}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${selectedNote?.id === note.id
                                            ? 'bg-gradient-to-r from-emerald-50 to-violet-50 border-emerald-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gradient-to-r hover:from-emerald-25 hover:to-violet-25 hover:border-emerald-100'
                                            }`}
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {note.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {note.content.substring(0, 100)}...
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1">
                                                {note.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {note.tags.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                        +{note.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(note.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                ))}

                                {filteredNotes.length === 0 && (
                                    <div className="text-center text-gray-500 py-8">
                                        <p>No notes found.</p>
                                        <p className="text-sm">Try adjusting your search or filters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Note Editor/Viewer */}
                    <div className="lg:col-span-2">
                        {(isCreating || editingNote) ? (
                            // Edit/Create Form
                            <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {editingNote ? 'Edit Note' : 'Create New Note'}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title*
                                        </label>
                                        <input
                                            type="text"
                                            value={newNote.title}
                                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="Enter note title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={newNote.tags}
                                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="work, ideas, recipes, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Content* (Markdown supported)
                                        </label>
                                        <textarea
                                            value={newNote.content}
                                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
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
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : selectedNote ? (
                            // Note Viewer
                            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {selectedNote.title}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Created: {new Date(selectedNote.created_at).toLocaleDateString()}</span>
                                            <span>Updated: {new Date(selectedNote.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedNote.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditing(selectedNote)}
                                            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteNote(selectedNote.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="prose prose-emerald max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                        {selectedNote.content}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No note selected
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Select a note from the list or create a new one
                                </p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                                >
                                    Create Your First Note
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}