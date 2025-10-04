// src/app/reading/page.tsx
'use client';

import { useState } from 'react';

type BookStatus = 'planned' | 'reading' | 'finished' | 'on_hold' | 'dropped';

interface Book {
    id: string;
    title: string;
    author?: string;
    status: BookStatus;
    started_at?: string;
    finished_at?: string;
    rating?: number;
    created_at: string;
}

interface ReadingLog {
    id: string;
    book_id: string;
    log_date: string;
    pages?: number;
    minutes?: number;
    note?: string;
    created_at: string;
}

interface Highlight {
    id: string;
    book_id: string;
    location?: string;
    text: string;
    created_at: string;
}

// Mock data for development
const mockBooks: Book[] = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        status: 'reading',
        started_at: '2025-01-01',
        rating: 5,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt, David Thomas',
        status: 'finished',
        started_at: '2024-11-01',
        finished_at: '2024-12-15',
        rating: 5,
        created_at: '2024-11-01T10:00:00Z'
    },
    {
        id: '3',
        title: 'Deep Work',
        author: 'Cal Newport',
        status: 'reading',
        started_at: '2024-12-20',
        rating: 4,
        created_at: '2024-12-20T10:00:00Z'
    },
    {
        id: '4',
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        status: 'planned',
        created_at: '2024-12-01T10:00:00Z'
    },
    {
        id: '5',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        status: 'on_hold',
        started_at: '2024-10-01',
        created_at: '2024-10-01T10:00:00Z'
    }
];

const mockReadingLogs: ReadingLog[] = [
    {
        id: '1',
        book_id: '1',
        log_date: '2025-01-05',
        pages: 25,
        minutes: 45,
        note: 'Chapter on habit stacking',
        created_at: '2025-01-05T20:00:00Z'
    },
    {
        id: '2',
        book_id: '1',
        log_date: '2025-01-04',
        pages: 30,
        minutes: 50,
        created_at: '2025-01-04T19:30:00Z'
    },
    {
        id: '3',
        book_id: '1',
        log_date: '2025-01-03',
        pages: 20,
        minutes: 40,
        created_at: '2025-01-03T21:00:00Z'
    },
    {
        id: '4',
        book_id: '3',
        log_date: '2025-01-05',
        pages: 15,
        minutes: 30,
        created_at: '2025-01-05T18:00:00Z'
    },
    {
        id: '5',
        book_id: '3',
        log_date: '2025-01-02',
        pages: 20,
        minutes: 35,
        created_at: '2025-01-02T22:00:00Z'
    }
];

const mockHighlights: Highlight[] = [
    {
        id: '1',
        book_id: '1',
        location: 'Page 42',
        text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
        created_at: '2025-01-03T19:00:00Z'
    },
    {
        id: '2',
        book_id: '1',
        location: 'Page 87',
        text: 'Every action you take is a vote for the type of person you wish to become.',
        created_at: '2025-01-04T20:00:00Z'
    },
    {
        id: '3',
        book_id: '2',
        location: 'Chapter 1',
        text: 'Good programmers write code that humans can understand.',
        created_at: '2024-12-10T15:00:00Z'
    }
];

const statusColors = {
    planned: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-900',
    reading: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
    finished: 'bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 text-violet-900',
    on_hold: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900',
    dropped: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-900'
};

const statusLabels = {
    planned: 'Want to Read',
    reading: 'Currently Reading',
    finished: 'Finished',
    on_hold: 'On Hold',
    dropped: 'Dropped'
};

export default function ReadingPage() {
    const [books, setBooks] = useState<Book[]>(mockBooks);
    const [logs, setLogs] = useState<ReadingLog[]>(mockReadingLogs);
    const [highlights, setHighlights] = useState<Highlight[]>(mockHighlights);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isAddingBook, setIsAddingBook] = useState(false);
    const [isLoggingReading, setIsLoggingReading] = useState(false);
    const [isAddingHighlight, setIsAddingHighlight] = useState(false);
    const [selectedBookForLog, setSelectedBookForLog] = useState<string>('');
    const [selectedBookForHighlight, setSelectedBookForHighlight] = useState<string>('');

    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        status: 'planned' as BookStatus,
        started_at: '',
        rating: ''
    });

    const [newLog, setNewLog] = useState({
        log_date: new Date().toISOString().split('T')[0],
        pages: '',
        minutes: '',
        note: ''
    });

    const [newHighlight, setNewHighlight] = useState({
        location: '',
        text: ''
    });

    // Get currently reading books
    const currentlyReading = books
        .filter(book => book.status === 'reading')
        .sort((a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime());

    // Filter books
    const filteredBooks = books.filter(book => {
        return selectedStatus === 'all' || book.status === selectedStatus;
    });

    // Calculate reading pace (pages per week over last 7 days)
    const getReadingPace = () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentLogs = logs.filter(log =>
            new Date(log.log_date) >= sevenDaysAgo && log.pages
        );

        const totalPages = recentLogs.reduce((sum, log) => sum + (log.pages || 0), 0);
        return Math.round(totalPages);
    };

    // Get total pages read for a book
    const getTotalPagesRead = (bookId: string) => {
        return logs
            .filter(log => log.book_id === bookId && log.pages)
            .reduce((sum, log) => sum + (log.pages || 0), 0);
    };

    // Get recent activity for a book
    const getRecentActivity = (bookId: string) => {
        const bookLogs = logs
            .filter(log => log.book_id === bookId)
            .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
        return bookLogs[0];
    };

    const addNewBook = () => {
        if (!newBook.title.trim()) return;

        const book: Book = {
            id: Date.now().toString(),
            title: newBook.title.trim(),
            author: newBook.author.trim() || undefined,
            status: newBook.status,
            started_at: newBook.started_at || undefined,
            rating: newBook.rating ? Number(newBook.rating) : undefined,
            created_at: new Date().toISOString()
        };

        setBooks([book, ...books]);
        setNewBook({ title: '', author: '', status: 'planned', started_at: '', rating: '' });
        setIsAddingBook(false);
    };

    const logReading = () => {
        if (!selectedBookForLog || (!newLog.pages && !newLog.minutes)) return;

        const log: ReadingLog = {
            id: Date.now().toString(),
            book_id: selectedBookForLog,
            log_date: newLog.log_date,
            pages: newLog.pages ? Number(newLog.pages) : undefined,
            minutes: newLog.minutes ? Number(newLog.minutes) : undefined,
            note: newLog.note.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setLogs([log, ...logs]);
        setNewLog({ log_date: new Date().toISOString().split('T')[0], pages: '', minutes: '', note: '' });
        setSelectedBookForLog('');
        setIsLoggingReading(false);
    };

    const addHighlight = () => {
        if (!selectedBookForHighlight || !newHighlight.text.trim()) return;

        const highlight: Highlight = {
            id: Date.now().toString(),
            book_id: selectedBookForHighlight,
            location: newHighlight.location.trim() || undefined,
            text: newHighlight.text.trim(),
            created_at: new Date().toISOString()
        };

        setHighlights([highlight, ...highlights]);
        setNewHighlight({ location: '', text: '' });
        setSelectedBookForHighlight('');
        setIsAddingHighlight(false);
    };

    const updateStatus = (bookId: string, newStatus: BookStatus) => {
        setBooks(books.map(book => {
            if (book.id === bookId) {
                const updates: Partial<Book> = { status: newStatus };
                if (newStatus === 'reading' && !book.started_at) {
                    updates.started_at = new Date().toISOString().split('T')[0];
                }
                if (newStatus === 'finished' && !book.finished_at) {
                    updates.finished_at = new Date().toISOString().split('T')[0];
                }
                return { ...book, ...updates };
            }
            return book;
        }));
    };

    const deleteBook = (bookId: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            setBooks(books.filter(book => book.id !== bookId));
            setLogs(logs.filter(log => log.book_id !== bookId));
            setHighlights(highlights.filter(h => h.book_id !== bookId));
        }
    };

    const getStatusCount = (status: string) => {
        if (status === 'all') return books.length;
        return books.filter(book => book.status === status).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Reading Tracker
                    </h1>
                    <p className="text-gray-600">Track your books, reading progress, and highlights</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Currently Reading</div>
                        <div className="text-3xl font-bold text-emerald-600">{currentlyReading.length}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Books Finished</div>
                        <div className="text-3xl font-bold text-violet-600">
                            {books.filter(b => b.status === 'finished').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Pages This Week</div>
                        <div className="text-3xl font-bold text-teal-600">{getReadingPace()}</div>
                    </div>
                </div>

                {/* Currently Reading Section */}
                {currentlyReading.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Currently Reading</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentlyReading.map(book => {
                                const recentActivity = getRecentActivity(book.id);
                                const totalPages = getTotalPagesRead(book.id);

                                return (
                                    <div
                                        key={book.id}
                                        className="bg-white rounded-xl shadow-lg border border-emerald-200 p-5 hover:shadow-xl transition-all duration-200"
                                    >
                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{book.title}</h3>
                                            {book.author && (
                                                <p className="text-sm text-gray-600">by {book.author}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm mb-3">
                                            {book.started_at && (
                                                <div className="text-gray-600">
                                                    Started: {new Date(book.started_at).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="text-gray-700">
                                                <span className="font-medium">{totalPages}</span> pages read
                                            </div>
                                            {recentActivity && (
                                                <div className="text-gray-600">
                                                    Last read: {new Date(recentActivity.log_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBookForLog(book.id);
                                                    setIsLoggingReading(true);
                                                }}
                                                className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md text-sm font-medium"
                                            >
                                                Log Progress
                                            </button>
                                            <button
                                                onClick={() => updateStatus(book.id, 'finished')}
                                                className="px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all duration-200 text-sm font-medium"
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => setIsAddingBook(true)}
                        className="px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md font-medium"
                    >
                        + Add Book
                    </button>
                    <button
                        onClick={() => setIsLoggingReading(true)}
                        className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                    >
                        📖 Log Reading Session
                    </button>
                    <button
                        onClick={() => setIsAddingHighlight(true)}
                        className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md font-medium"
                    >
                        ✨ Add Highlight
                    </button>
                </div>

                {/* Add Book Form */}
                {isAddingBook && (
                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Book</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                                <input
                                    type="text"
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Book title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    value={newBook.author}
                                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Author name..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newBook.status}
                                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value as BookStatus })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="planned">Want to Read</option>
                                    <option value="reading">Currently Reading</option>
                                    <option value="finished">Finished</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Started Date</label>
                                <input
                                    type="date"
                                    value={newBook.started_at}
                                    onChange={(e) => setNewBook({ ...newBook, started_at: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                <input
                                    type="number"
                                    value={newBook.rating}
                                    onChange={(e) => setNewBook({ ...newBook, rating: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    min="1"
                                    max="5"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addNewBook}
                                disabled={!newBook.title.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Add Book
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingBook(false);
                                    setNewBook({ title: '', author: '', status: 'planned', started_at: '', rating: '' });
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Log Reading Form */}
                {isLoggingReading && (
                    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Reading Session</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book*</label>
                                <select
                                    value={selectedBookForLog}
                                    onChange={(e) => setSelectedBookForLog(e.target.value)}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Select a book...</option>
                                    {books.filter(b => b.status === 'reading').map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} {book.author && `by ${book.author}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newLog.log_date}
                                    onChange={(e) => setNewLog({ ...newLog, log_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pages Read</label>
                                <input
                                    type="number"
                                    value={newLog.pages}
                                    onChange={(e) => setNewLog({ ...newLog, pages: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., 25"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minutes Read</label>
                                <input
                                    type="number"
                                    value={newLog.minutes}
                                    onChange={(e) => setNewLog({ ...newLog, minutes: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., 30"
                                    min="0"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={newLog.note}
                                    onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    rows={2}
                                    placeholder="What chapter or section did you read?"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={logReading}
                                disabled={!selectedBookForLog || (!newLog.pages && !newLog.minutes)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Log Session
                            </button>
                            <button
                                onClick={() => {
                                    setIsLoggingReading(false);
                                    setNewLog({ log_date: new Date().toISOString().split('T')[0], pages: '', minutes: '', note: '' });
                                    setSelectedBookForLog('');
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Highlight Form */}
                {isAddingHighlight && (
                    <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Highlight</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book*</label>
                                <select
                                    value={selectedBookForHighlight}
                                    onChange={(e) => setSelectedBookForHighlight(e.target.value)}
                                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="">Select a book...</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} {book.author && `by ${book.author}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={newHighlight.location}
                                    onChange={(e) => setNewHighlight({ ...newHighlight, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="e.g., Page 42, Chapter 3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Text*</label>
                                <textarea
                                    value={newHighlight.text}
                                    onChange={(e) => setNewHighlight({ ...newHighlight, text: e.target.value })}
                                    className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    rows={3}
                                    placeholder="The quote or passage you want to remember..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addHighlight}
                                disabled={!selectedBookForHighlight || !newHighlight.text.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Add Highlight
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingHighlight(false);
                                    setNewHighlight({ location: '', text: '' });
                                    setSelectedBookForHighlight('');
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="all">All Books ({getStatusCount('all')})</option>
                            <option value="reading">Currently Reading ({getStatusCount('reading')})</option>
                            <option value="planned">Want to Read ({getStatusCount('planned')})</option>
                            <option value="finished">Finished ({getStatusCount('finished')})</option>
                            <option value="on_hold">On Hold ({getStatusCount('on_hold')})</option>
                            <option value="dropped">Dropped ({getStatusCount('dropped')})</option>
                        </select>
                    </div>
                </div>

                {/* All Books Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">All Books</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBooks.map(book => {
                            const totalPages = getTotalPagesRead(book.id);

                            return (
                                <div
                                    key={book.id}
                                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${statusColors[book.status]}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                                            {book.author && (
                                                <p className="text-sm opacity-75">by {book.author}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteBook(book.id)}
                                            className="text-red-500 hover:text-red-700 text-sm transition-colors ml-2"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-sm mb-3">
                                        <div className="font-medium">{statusLabels[book.status]}</div>

                                        {book.rating && (
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={i < book.rating! ? 'text-yellow-500' : 'text-gray-300'}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {totalPages > 0 && (
                                            <div className="opacity-90">
                                                {totalPages} pages read
                                            </div>
                                        )}

                                        {book.started_at && (
                                            <div className="opacity-75">
                                                Started: {new Date(book.started_at).toLocaleDateString()}
                                            </div>
                                        )}

                                        {book.finished_at && (
                                            <div className="opacity-75">
                                                Finished: {new Date(book.finished_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        {book.status === 'planned' && (
                                            <button
                                                onClick={() => updateStatus(book.id, 'reading')}
                                                className="flex-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                            >
                                                Start Reading
                                            </button>
                                        )}
                                        {book.status === 'reading' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBookForLog(book.id);
                                                        setIsLoggingReading(true);
                                                    }}
                                                    className="flex-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                                >
                                                    Log Progress
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(book.id, 'finished')}
                                                    className="px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                                >
                                                    Finish
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredBooks.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            <p className="text-lg">No books found.</p>
                            <p className="text-sm">Add your first book to get started!</p>
                        </div>
                    )}
                </div>

                {/* Recent Highlights Section */}
                {highlights.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Highlights</h2>
                        <div className="space-y-4">
                            {highlights.slice(0, 5).map(highlight => {
                                const book = books.find(b => b.id === highlight.book_id);

                                return (
                                    <div
                                        key={highlight.id}
                                        className="bg-white rounded-lg shadow-lg border border-teal-200 p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">✨</div>
                                            <div className="flex-1">
                                                <div className="text-gray-900 italic mb-2 leading-relaxed">
                                                    {highlight.text}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    {book && (
                                                        <>
                                                            <span className="font-medium">{book.title}</span>
                                                            {book.author && <span>by {book.author}</span>}
                                                        </>
                                                    )}
                                                    {highlight.location && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{highlight.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}