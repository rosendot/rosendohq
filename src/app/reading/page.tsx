'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';
import { Book, BookStatus, BookFormat } from '@/types/database.types';

type SortOption = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'author_asc' | 'rating_desc' | 'rating_asc' | 'progress_desc' | 'progress_asc';

export default function ReadingTracker() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
    const [filterFormat, setFilterFormat] = useState<BookFormat | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch books
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterFormat !== 'all') params.append('format', filterFormat);

            const response = await fetch(`/api/books?${params}`);
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sort function
    const sortBooks = (booksToSort: Book[]): Book[] => {
        return [...booksToSort].sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'date_asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                case 'author_asc':
                    return (a.author || '').localeCompare(b.author || '');
                case 'rating_desc':
                    return (b.rating || 0) - (a.rating || 0);
                case 'rating_asc':
                    return (a.rating || 0) - (b.rating || 0);
                case 'progress_desc': {
                    const progressA = a.total_pages ? (a.current_page || 0) / a.total_pages : 0;
                    const progressB = b.total_pages ? (b.current_page || 0) / b.total_pages : 0;
                    return progressB - progressA;
                }
                case 'progress_asc': {
                    const progressA = a.total_pages ? (a.current_page || 0) / a.total_pages : 0;
                    const progressB = b.total_pages ? (b.current_page || 0) / b.total_pages : 0;
                    return progressA - progressB;
                }
                default:
                    return 0;
            }
        });
    };

    // Filter books by search query
    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.notes?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Apply sorting to filtered books
    const sortedBooks = sortBooks(filteredBooks);

    // Group books by status (using sorted books)
    const groupedBooks = {
        reading: sortedBooks.filter(b => b.status === 'reading'),
        planned: sortedBooks.filter(b => b.status === 'planned'),
        finished: sortedBooks.filter(b => b.status === 'finished'),
        on_hold: sortedBooks.filter(b => b.status === 'on_hold'),
        dropped: sortedBooks.filter(b => b.status === 'dropped'),
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Reading Tracker</h1>
                            <p className="text-gray-400">Track your reading progress</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <BookOpen className="w-5 h-5" />
                            Add Book
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="text"
                        placeholder="Search books, authors, notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
                        className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="reading">Reading</option>
                        <option value="planned">Planned</option>
                        <option value="finished">Finished</option>
                        <option value="on_hold">On Hold</option>
                        <option value="dropped">Dropped</option>
                    </select>
                    <select
                        value={filterFormat}
                        onChange={(e) => setFilterFormat(e.target.value as BookFormat | 'all')}
                        className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Formats</option>
                        <option value="physical">Physical</option>
                        <option value="ebook">eBook</option>
                        <option value="audiobook">Audiobook</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="title_asc">Title A-Z</option>
                        <option value="title_desc">Title Z-A</option>
                        <option value="author_asc">Author A-Z</option>
                        <option value="rating_desc">Rating High-Low</option>
                        <option value="rating_asc">Rating Low-High</option>
                        <option value="progress_desc">Progress High-Low</option>
                        <option value="progress_asc">Progress Low-High</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {groupedBooks.reading.length > 0 && (
                    <BookCarousel
                        title={`Continue Reading (${groupedBooks.reading.length})`}
                        books={groupedBooks.reading}
                    />
                )}

                {groupedBooks.planned.length > 0 && (
                    <BookCarousel
                        title={`Plan to Read (${groupedBooks.planned.length})`}
                        books={groupedBooks.planned}
                    />
                )}

                {groupedBooks.finished.length > 0 && (
                    <BookCarousel
                        title={`Completed (${groupedBooks.finished.length})`}
                        books={groupedBooks.finished}
                    />
                )}

                {groupedBooks.on_hold.length > 0 && (
                    <BookCarousel
                        title={`On Hold (${groupedBooks.on_hold.length})`}
                        books={groupedBooks.on_hold}
                    />
                )}

                {groupedBooks.dropped.length > 0 && (
                    <BookCarousel
                        title={`Dropped (${groupedBooks.dropped.length})`}
                        books={groupedBooks.dropped}
                    />
                )}
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <AddBookModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchBooks();
                    }}
                />
            )}
        </div>
    );
}

// Book Carousel Component
function BookCarousel({
    title,
    books,
}: {
    title: string;
    books: Book[];
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const updateArrows = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        updateArrows();
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', updateArrows);
            return () => ref.removeEventListener('scroll', updateArrows);
        }
    }, [books]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 400;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

            <div className="relative group">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-900/90 hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ←
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-900/90 hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        →
                    </button>
                )}
            </div>
        </div>
    );
}

// Book Card Component - Now clickable, navigates to detail page
function BookCard({ book }: { book: Book }) {
    const progressPercentage = book.total_pages && book.current_page
        ? Math.round((book.current_page / book.total_pages) * 100)
        : null;

    return (
        <Link
            href={`/reading/${book.id}`}
            className="group flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer"
        >
            {/* Book Cover Placeholder */}
            <div className="h-40 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center relative">
                <div className="text-center p-4">
                    <p className="text-white font-bold text-lg line-clamp-3">{book.title}</p>
                </div>
            </div>

            {/* Book Info */}
            <div className="p-4">
                <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                    {book.title}
                </h3>
                {book.author && (
                    <p className="text-gray-400 text-xs mb-2 line-clamp-1">{book.author}</p>
                )}

                {/* Progress Bar */}
                {progressPercentage !== null && (
                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{book.current_page} / {book.total_pages} pages</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        {book.format && (
                            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded">
                                {book.format}
                            </span>
                        )}
                        {book.rating && (
                            <span className="text-yellow-500">
                                {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                            </span>
                        )}
                    </div>
                </div>

                {book.notes && (
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{book.notes}</p>
                )}
            </div>
        </Link>
    );
}

// Simple Add Book Modal
function AddBookModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        status: 'planned' as BookStatus,
        format: '' as BookFormat | '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setSaving(true);
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    author: formData.author.trim() || null,
                    status: formData.status,
                    format: formData.format || null,
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating book:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-900 rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Add New Book</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Book title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Author
                        </label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Author name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="planned">Planned</option>
                                <option value="reading">Reading</option>
                                <option value="finished">Finished</option>
                                <option value="on_hold">On Hold</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Format
                            </label>
                            <select
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value as BookFormat | '' })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select format</option>
                                <option value="physical">Physical</option>
                                <option value="ebook">eBook</option>
                                <option value="audiobook">Audiobook</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        You can add more details like pages, rating, notes, and highlights after creating the book.
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !formData.title.trim()}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Creating...' : 'Add Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
