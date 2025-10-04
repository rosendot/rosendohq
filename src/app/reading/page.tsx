// app/reading/page.tsx
'use client';

import { useState } from 'react';
import { Plus, BookOpen, Star, Calendar, CheckCircle, Clock, Bookmark, Search, Filter, Trash2, Edit2, TrendingUp } from 'lucide-react';

type ReadingStatus = 'want-to-read' | 'reading' | 'completed' | 'on-hold' | 'dropped';

type Book = {
    id: string;
    title: string;
    author: string;
    status: ReadingStatus;
    rating?: number;
    currentPage?: number;
    totalPages?: number;
    genre?: string;
    format?: 'physical' | 'ebook' | 'audiobook';
    startDate?: string;
    completedDate?: string;
    notes?: string;
    coverUrl?: string;
};

const STATUSES: { value: ReadingStatus; label: string; color: string }[] = [
    { value: 'want-to-read', label: 'Want to Read', color: 'bg-gray-600' },
    { value: 'reading', label: 'Currently Reading', color: 'bg-blue-600' },
    { value: 'completed', label: 'Completed', color: 'bg-green-600' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-600' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-600' }
];

const GENRES = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Fantasy', 'Romance',
    'Thriller', 'Biography', 'History', 'Self-Help', 'Science', 'Philosophy', 'Other'
];

const FORMATS: { value: 'physical' | 'ebook' | 'audiobook'; label: string }[] = [
    { value: 'physical', label: 'Physical' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'audiobook', label: 'Audiobook' }
];

export default function ReadingTrackerPage() {
    const [books, setBooks] = useState<Book[]>([
        {
            id: '1',
            title: 'Atomic Habits',
            author: 'James Clear',
            status: 'completed',
            rating: 5,
            totalPages: 320,
            currentPage: 320,
            genre: 'Self-Help',
            format: 'physical',
            startDate: '2024-08-01',
            completedDate: '2024-08-15',
            notes: 'Life-changing book about building better habits'
        },
        {
            id: '2',
            title: 'Project Hail Mary',
            author: 'Andy Weir',
            status: 'reading',
            rating: 5,
            totalPages: 476,
            currentPage: 234,
            genre: 'Sci-Fi',
            format: 'ebook',
            startDate: '2024-09-20',
            notes: 'Amazing space adventure!'
        },
        {
            id: '3',
            title: 'The Pragmatic Programmer',
            author: 'David Thomas & Andrew Hunt',
            status: 'want-to-read',
            totalPages: 352,
            genre: 'Non-Fiction',
            format: 'physical'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | 'all'>('all');
    const [selectedGenre, setSelectedGenre] = useState<string>('all');

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        status: 'want-to-read' as ReadingStatus,
        rating: 0,
        currentPage: 0,
        totalPages: 0,
        genre: GENRES[0],
        format: 'physical' as 'physical' | 'ebook' | 'audiobook',
        startDate: '',
        completedDate: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBook) {
            setBooks(books.map(book =>
                book.id === editingBook.id
                    ? { ...book, ...formData }
                    : book
            ));
            setEditingBook(null);
        } else {
            const newBook: Book = {
                id: Date.now().toString(),
                ...formData,
                rating: formData.rating || undefined,
                currentPage: formData.currentPage || undefined,
                totalPages: formData.totalPages || undefined,
                startDate: formData.startDate || undefined,
                completedDate: formData.completedDate || undefined,
                notes: formData.notes || undefined
            };
            setBooks([...books, newBook]);
        }
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            status: 'want-to-read',
            rating: 0,
            currentPage: 0,
            totalPages: 0,
            genre: GENRES[0],
            format: 'physical',
            startDate: '',
            completedDate: '',
            notes: ''
        });
    };

    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            status: book.status,
            rating: book.rating || 0,
            currentPage: book.currentPage || 0,
            totalPages: book.totalPages || 0,
            genre: book.genre || GENRES[0],
            format: book.format || 'physical',
            startDate: book.startDate || '',
            completedDate: book.completedDate || '',
            notes: book.notes || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            setBooks(books.filter(book => book.id !== id));
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
        const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
        return matchesSearch && matchesStatus && matchesGenre;
    });

    const getStatusStats = (status: ReadingStatus) => {
        return books.filter(book => book.status === status).length;
    };

    const getStatusColor = (status: ReadingStatus) => {
        const statusObj = STATUSES.find(s => s.value === status);
        return statusObj ? statusObj.color : 'bg-gray-600';
    };

    const getStatusLabel = (status: ReadingStatus) => {
        const statusObj = STATUSES.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
    };

    const getProgressPercentage = (book: Book) => {
        if (!book.currentPage || !book.totalPages) return 0;
        return Math.round((book.currentPage / book.totalPages) * 100);
    };

    const completedBooks = books.filter(b => b.status === 'completed');
    const averageRating = completedBooks.length > 0
        ? completedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / completedBooks.filter(b => b.rating).length
        : 0;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Reading Tracker</h1>
                        <p className="text-gray-400">Track your reading journey</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBook(null);
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Book
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Total Books</h3>
                        </div>
                        <p className="text-3xl font-bold">{books.length}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Completed</h3>
                        </div>
                        <p className="text-3xl font-bold">{completedBooks.length}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Currently Reading</h3>
                        </div>
                        <p className="text-3xl font-bold">{getStatusStats('reading')}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-6 h-6 text-purple-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Avg Rating</h3>
                        </div>
                        <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Reading Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {STATUSES.map(({ value, label, color }) => (
                            <div key={value} className="text-center">
                                <div className={`${color} rounded-lg p-4 mb-2`}>
                                    <p className="text-2xl font-bold">{getStatusStats(value)}</p>
                                </div>
                                <p className="text-sm text-gray-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search books or authors..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Bookmark className="w-4 h-4" />
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as ReadingStatus | 'all')}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                {STATUSES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Filter className="w-4 h-4" />
                                Genre
                            </label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Genres</option>
                                {GENRES.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map(book => {
                        const progress = getProgressPercentage(book);
                        return (
                            <div key={book.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <span className={`${getStatusColor(book.status)} text-xs px-2 py-1 rounded mb-2 inline-block`}>
                                            {getStatusLabel(book.status)}
                                        </span>
                                        <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
                                        <p className="text-sm text-gray-400 mb-2">by {book.author}</p>
                                        {book.genre && (
                                            <p className="text-xs text-gray-500">{book.genre} • {book.format}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(book)}
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {book.status === 'reading' && book.totalPages && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="font-medium">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {book.currentPage} / {book.totalPages} pages
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    {book.rating && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Rating:</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < book.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {book.totalPages && book.status !== 'reading' && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Pages:</span>
                                            <span className="font-medium">{book.totalPages}</span>
                                        </div>
                                    )}

                                    {book.startDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Started:</span>
                                            <span className="font-medium">
                                                {new Date(book.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {book.completedDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Completed:</span>
                                            <span className="font-medium">
                                                {new Date(book.completedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {book.notes && (
                                        <p className="text-sm text-gray-400 pt-2 border-t border-gray-800">
                                            {book.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No books found</p>
                        <p className="text-gray-500 text-sm">Add your first book to get started</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Author *</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ReadingStatus })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STATUSES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Format</label>
                                    <select
                                        value={formData.format}
                                        onChange={(e) => setFormData({ ...formData, format: e.target.value as 'physical' | 'ebook' | 'audiobook' })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {FORMATS.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Genre</label>
                                <select
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {GENRES.map(genre => (
                                        <option key={genre} value={genre}>{genre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating (1-5 stars)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="p-2 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                    {formData.rating > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: 0 })}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Total Pages</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.totalPages}
                                        onChange={(e) => setFormData({ ...formData, totalPages: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Current Page</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.currentPage}
                                        onChange={(e) => setFormData({ ...formData, currentPage: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Completed Date</label>
                                    <input
                                        type="date"
                                        value={formData.completedDate}
                                        onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Your thoughts, reviews, quotes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingBook(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    {editingBook ? 'Update' : 'Add'} Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}