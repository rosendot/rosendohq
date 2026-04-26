'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import { Book, BookStatus, BookFormat, ReadingLog, Highlight } from '@/types/reading.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
    const router = useRouter();
    const [bookId, setBookId] = useState<string>('');
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Book>>({});
    const [saving, setSaving] = useState(false);

    // Reading logs state
    const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
    const [showAddLog, setShowAddLog] = useState(false);
    const [newLog, setNewLog] = useState({ log_date: new Date().toISOString().split('T')[0], pages: '', minutes: '', note: '' });
    const [savingLog, setSavingLog] = useState(false);

    // Highlights state
    const [showAddHighlight, setShowAddHighlight] = useState(false);
    const [newHighlight, setNewHighlight] = useState({ text: '', location: '' });

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Resolve params
    useEffect(() => {
        params.then(p => setBookId(p.bookId));
    }, [params]);

    // Fetch book data
    useEffect(() => {
        if (!bookId) return;
        fetchBook();
        fetchReadingLogs();
    }, [bookId]);

    const fetchBook = async () => {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            if (!response.ok) throw new Error('Book not found');
            const data = await response.json();
            setBook(data);
            setFormData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load book');
        } finally {
            setLoading(false);
        }
    };

    const fetchReadingLogs = async () => {
        try {
            const response = await fetch(`/api/books/${bookId}/logs`);
            if (response.ok) {
                const data = await response.json();
                setReadingLogs(data);
            }
        } catch (err) {
            console.error('Error fetching reading logs:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to save');
            const updatedBook = await response.json();
            setBook(updatedBook);
            setFormData(updatedBook);
            setIsEditMode(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData(book || {});
        setIsEditMode(false);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            router.push('/reading');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    const handleAddLog = async () => {
        setSavingLog(true);
        try {
            const response = await fetch(`/api/books/${bookId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    log_date: newLog.log_date,
                    pages: newLog.pages ? parseInt(newLog.pages) : null,
                    minutes: newLog.minutes ? parseInt(newLog.minutes) : null,
                    note: newLog.note || null,
                }),
            });
            if (response.ok) {
                setNewLog({ log_date: new Date().toISOString().split('T')[0], pages: '', minutes: '', note: '' });
                setShowAddLog(false);
                fetchReadingLogs();
            }
        } catch (err) {
            console.error('Error adding log:', err);
        } finally {
            setSavingLog(false);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            await fetch(`/api/books/logs/${logId}`, { method: 'DELETE' });
            fetchReadingLogs();
        } catch (err) {
            console.error('Error deleting log:', err);
        }
    };

    const handleAddHighlight = () => {
        if (!newHighlight.text.trim()) return;
        const highlight: Highlight = {
            text: newHighlight.text.trim(),
            location: newHighlight.location.trim() || '',
            created_at: new Date().toISOString(),
        };
        const currentHighlights = formData.highlights || [];
        const updatedHighlights = [...currentHighlights, highlight];
        setFormData({ ...formData, highlights: updatedHighlights });
        setNewHighlight({ text: '', location: '' });
        setShowAddHighlight(false);

        // Auto-save highlights
        fetch(`/api/books/${bookId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ highlights: updatedHighlights }),
        }).then(res => {
            if (res.ok) {
                res.json().then(data => setBook(data));
            }
        });
    };

    const handleDeleteHighlight = (index: number) => {
        const currentHighlights = formData.highlights || [];
        const updatedHighlights = currentHighlights.filter((_, i) => i !== index);
        setFormData({ ...formData, highlights: updatedHighlights });

        // Auto-save highlights
        fetch(`/api/books/${bookId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ highlights: updatedHighlights }),
        }).then(res => {
            if (res.ok) {
                res.json().then(data => setBook(data));
            }
        });
    };

    const progressPercentage = book?.total_pages && book?.current_page
        ? Math.round((book.current_page / book.total_pages) * 100)
        : null;

    const statusColors: Record<BookStatus, string> = {
        reading: 'bg-blue-500/20 text-blue-400',
        planned: 'bg-gray-500/20 text-gray-400',
        finished: 'bg-green-500/20 text-green-400',
        on_hold: 'bg-yellow-500/20 text-yellow-400',
        dropped: 'bg-red-500/20 text-red-400',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-gray-950 p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-red-400">{error || 'Book not found'}</p>
                    <Link href="/reading" className="text-blue-400 hover:underline mt-4 inline-block">
                        ← Back to Reading Tracker
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/reading"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Reading
                    </Link>
                    <div className="flex items-center gap-2">
                        {isEditMode ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Edit book"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete book"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Book Info Section */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Cover Placeholder */}
                        <div className="flex-shrink-0 w-24 h-32 sm:w-32 sm:h-48 bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg flex items-center justify-center">
                            <span className="text-white text-center text-sm font-medium px-2 line-clamp-3">
                                {book.title}
                            </span>
                        </div>

                        {/* Book Details */}
                        <div className="flex-1 min-w-0">
                            {isEditMode ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full text-2xl font-bold bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Book title"
                                    />
                                    <input
                                        type="text"
                                        value={formData.author || ''}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Author"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <select
                                            value={formData.status || 'planned'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="reading">Reading</option>
                                            <option value="finished">Finished</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="dropped">Dropped</option>
                                        </select>
                                        <select
                                            value={formData.format || ''}
                                            onChange={(e) => setFormData({ ...formData, format: e.target.value as BookFormat || null })}
                                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">No format</option>
                                            <option value="physical">Physical</option>
                                            <option value="ebook">eBook</option>
                                            <option value="audiobook">Audiobook</option>
                                        </select>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: formData.rating === star ? null : star })}
                                                    className="text-2xl focus:outline-none"
                                                >
                                                    {formData.rating && star <= formData.rating ? '★' : '☆'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold text-white mb-1">{book.title}</h1>
                                    {book.author && <p className="text-gray-400 mb-3">by {book.author}</p>}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {book.rating && (
                                            <span className="text-yellow-500 text-lg">
                                                {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                                            </span>
                                        )}
                                        {book.format && (
                                            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                                                {book.format}
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 rounded text-sm ${statusColors[book.status]}`}>
                                            {book.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Progress */}
                            {isEditMode ? (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Current Page</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.current_page || 0}
                                            onChange={(e) => setFormData({ ...formData, current_page: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Total Pages</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.total_pages || ''}
                                            onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) || null })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : progressPercentage !== null ? (
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{book.current_page} / {book.total_pages} pages ({progressPercentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {/* Dates */}
                            {isEditMode ? (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Started</label>
                                        <input
                                            type="date"
                                            value={formData.started_at || ''}
                                            onChange={(e) => setFormData({ ...formData, started_at: e.target.value || null })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Finished</label>
                                        <input
                                            type="date"
                                            value={formData.finished_at || ''}
                                            onChange={(e) => setFormData({ ...formData, finished_at: e.target.value || null })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (book.started_at || book.finished_at) ? (
                                <div className="flex gap-4 mt-4 text-sm text-gray-400">
                                    {book.started_at && (
                                        <span>Started: {new Date(book.started_at).toLocaleDateString()}</span>
                                    )}
                                    {book.finished_at && (
                                        <span>Finished: {new Date(book.finished_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Notes */}
                    {(isEditMode || book.notes) && (
                        <div className="mt-4">
                            <h3 className="text-xs font-medium text-gray-400 mb-1">Notes</h3>
                            {isEditMode ? (
                                <textarea
                                    rows={3}
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add notes about this book..."
                                />
                            ) : (
                                <p className="text-gray-400 text-sm whitespace-pre-line">{book.notes}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Reading Log Section */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-white">
                            Reading Log ({readingLogs.length})
                        </h2>
                        {!showAddLog && (
                            <button
                                onClick={() => setShowAddLog(true)}
                                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Session
                            </button>
                        )}
                    </div>

                    {/* Add Log Form */}
                    {showAddLog && (
                        <div className="bg-gray-800 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newLog.log_date}
                                        onChange={(e) => setNewLog({ ...newLog, log_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Pages Read</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 30"
                                        value={newLog.pages}
                                        onChange={(e) => setNewLog({ ...newLog, pages: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Minutes</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 45"
                                        value={newLog.minutes}
                                        onChange={(e) => setNewLog({ ...newLog, minutes: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Note</label>
                                    <input
                                        type="text"
                                        placeholder="Quick note..."
                                        value={newLog.note}
                                        onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddLog(false)}
                                    className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLog}
                                    disabled={savingLog || (!newLog.pages && !newLog.minutes)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                                >
                                    {savingLog ? 'Saving...' : 'Add Entry'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Log List */}
                    {readingLogs.length === 0 ? (
                        <p className="text-gray-500 text-sm">No reading sessions logged yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {readingLogs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <div>
                                        <p className="text-white text-sm">
                                            {new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {log.pages && <span className="text-gray-400 ml-2">{log.pages} pages</span>}
                                            {log.minutes && <span className="text-gray-400 ml-2">{log.minutes} min</span>}
                                        </p>
                                        {log.note && <p className="text-gray-500 text-xs mt-1">{log.note}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Highlights Section */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-white">
                            Highlights ({(formData.highlights || []).length})
                        </h2>
                        {!showAddHighlight && (
                            <button
                                onClick={() => setShowAddHighlight(true)}
                                className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Highlight
                            </button>
                        )}
                    </div>

                    {/* Add Highlight Form */}
                    {showAddHighlight && (
                        <div className="bg-gray-800 rounded-lg p-4 mb-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Quote / Text</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Enter the quote or highlighted text..."
                                        value={newHighlight.text}
                                        onChange={(e) => setNewHighlight({ ...newHighlight, text: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Page 42, Chapter 3"
                                        value={newHighlight.location}
                                        onChange={(e) => setNewHighlight({ ...newHighlight, location: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddHighlight(false)}
                                        className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddHighlight}
                                        disabled={!newHighlight.text.trim()}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                                    >
                                        Add Highlight
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Highlights List */}
                    {(formData.highlights || []).length === 0 ? (
                        <p className="text-gray-500 text-sm">No highlights saved yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {(formData.highlights || []).map((highlight, index) => (
                                <div key={index} className="p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-white text-sm italic">&quot;{highlight.text}&quot;</p>
                                            {highlight.location && (
                                                <p className="text-xs text-gray-400 mt-2">{highlight.location}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteHighlight(index)}
                                            className="p-2 hover:bg-gray-700 rounded transition-colors ml-2 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={book.title}
                title="Delete Book"
            />
        </div>
    );
}
