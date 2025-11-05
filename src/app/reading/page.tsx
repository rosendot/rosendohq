'use client';

import { useState, useEffect, useRef } from 'react';
import { Book, BookStatus, BookFormat } from '@/types/database.types';

export default function ReadingTracker() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
    const [filterFormat, setFilterFormat] = useState<BookFormat | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);

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

    // Filter books by search query
    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.notes?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Group books by status
    const groupedBooks = {
        reading: filteredBooks.filter(b => b.status === 'reading'),
        planned: filteredBooks.filter(b => b.status === 'planned'),
        finished: filteredBooks.filter(b => b.status === 'finished'),
        on_hold: filteredBooks.filter(b => b.status === 'on_hold'),
        dropped: filteredBooks.filter(b => b.status === 'dropped'),
    };

    const openModal = (book?: Book) => {
        setEditingBook(book || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
    };

    const handleSave = async (bookData: Partial<Book>) => {
        try {
            if (editingBook) {
                // Update existing book
                await fetch(`/api/books/${editingBook.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData),
                });
            } else {
                // Create new book
                await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData),
                });
            }
            fetchBooks();
            closeModal();
        } catch (error) {
            console.error('Error saving book:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await fetch(`/api/books/${id}`, { method: 'DELETE' });
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <div className="bg-gray-950 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">Reading Tracker</h1>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            + Add Book
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search books, authors, notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
                            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Formats</option>
                            <option value="physical">Physical</option>
                            <option value="ebook">eBook</option>
                            <option value="audiobook">Audiobook</option>
                        </select>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mt-4 text-sm text-gray-400">
                        <span>Reading: {groupedBooks.reading.length}</span>
                        <span>Planned: {groupedBooks.planned.length}</span>
                        <span>Finished: {groupedBooks.finished.length}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {groupedBooks.reading.length > 0 && (
                    <BookCarousel
                        title="Continue Reading"
                        books={groupedBooks.reading}
                        onEdit={openModal}
                        onDelete={handleDelete}
                    />
                )}

                {groupedBooks.planned.length > 0 && (
                    <BookCarousel
                        title="Plan to Read"
                        books={groupedBooks.planned}
                        onEdit={openModal}
                        onDelete={handleDelete}
                    />
                )}

                {groupedBooks.finished.length > 0 && (
                    <BookCarousel
                        title="Completed"
                        books={groupedBooks.finished}
                        onEdit={openModal}
                        onDelete={handleDelete}
                    />
                )}

                {groupedBooks.on_hold.length > 0 && (
                    <BookCarousel
                        title="On Hold"
                        books={groupedBooks.on_hold}
                        onEdit={openModal}
                        onDelete={handleDelete}
                    />
                )}

                {groupedBooks.dropped.length > 0 && (
                    <BookCarousel
                        title="Dropped"
                        books={groupedBooks.dropped}
                        onEdit={openModal}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <BookModal
                    book={editingBook}
                    onSave={handleSave}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

// Book Carousel Component
function BookCarousel({
    title,
    books,
    onEdit,
    onDelete,
}: {
    title: string;
    books: Book[];
    onEdit: (book: Book) => void;
    onDelete: (id: string) => void;
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
        <div className="relative">
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
                        <BookCard
                            key={book.id}
                            book={book}
                            onEdit={() => onEdit(book)}
                            onDelete={() => onDelete(book.id)}
                        />
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

// Book Card Component
function BookCard({
    book,
    onEdit,
    onDelete,
}: {
    book: Book;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    const progressPercentage = book.total_pages && book.current_page
        ? Math.round((book.current_page / book.total_pages) * 100)
        : null;

    return (
        <div
            className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Book Cover Placeholder */}
            <div className="h-40 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center relative">
                <div className="text-center p-4">
                    <p className="text-white font-bold text-lg line-clamp-3">{book.title}</p>
                </div>

                {isHovered && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2">
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                )}
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
        </div>
    );
}

// Book Modal Component
function BookModal({
    book,
    onSave,
    onClose,
}: {
    book: Book | null;
    onSave: (data: Partial<Book>) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<Partial<Book>>({
        title: book?.title || '',
        author: book?.author || '',
        status: book?.status || 'planned',
        current_page: book?.current_page || 0,
        total_pages: book?.total_pages || null,
        format: book?.format || null,
        rating: book?.rating || null,
        notes: book?.notes || '',
        started_at: book?.started_at || null,
        finished_at: book?.finished_at || null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {book ? 'Edit Book' : 'Add New Book'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Author
                            </label>
                            <input
                                type="text"
                                value={formData.author || ''}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status and Format */}
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
                                    value={formData.format || ''}
                                    onChange={(e) => setFormData({ ...formData, format: e.target.value as BookFormat || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select format</option>
                                    <option value="physical">Physical</option>
                                    <option value="ebook">eBook</option>
                                    <option value="audiobook">Audiobook</option>
                                </select>
                            </div>
                        </div>

                        {/* Pages */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Current Page
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.current_page || 0}
                                    onChange={(e) => setFormData({ ...formData, current_page: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Total Pages
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.total_pages || ''}
                                    onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Rating
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="text-3xl focus:outline-none"
                                    >
                                        {formData.rating && star <= formData.rating ? '★' : '☆'}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: null })}
                                    className="ml-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Started
                                </label>
                                <input
                                    type="date"
                                    value={formData.started_at || ''}
                                    onChange={(e) => setFormData({ ...formData, started_at: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Finished
                                </label>
                                <input
                                    type="date"
                                    value={formData.finished_at || ''}
                                    onChange={(e) => setFormData({ ...formData, finished_at: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                rows={3}
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {book ? 'Update' : 'Add'} Book
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}