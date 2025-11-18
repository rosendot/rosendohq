// components/DeleteConfirmationModal.tsx
'use client';

import { Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    itemCount?: number;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemCount,
    title = 'Confirm Delete',
    message,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    const getDefaultMessage = () => {
        if (message) return message;

        if (itemCount && itemCount > 0) {
            return `Are you sure you want to delete ${itemCount} item${itemCount > 1 ? 's' : ''}? This action cannot be undone.`;
        }

        if (itemName) {
            return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
        }

        return 'Are you sure you want to delete this item? This action cannot be undone.';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>

                <p className="text-gray-300 mb-6">
                    {getDefaultMessage()}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
