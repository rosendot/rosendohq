'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, CheckCircle } from 'lucide-react';
import type { HomeUtilityBill, HomeUtilityBillInsert, HomeUtilityType } from '@/types/database.types';

interface UtilitiesTabProps {
    bills: HomeUtilityBill[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function UtilitiesTab({ bills, propertyId, onRefresh }: UtilitiesTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingBill, setEditingBill] = useState<HomeUtilityBill | null>(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

    const [formData, setFormData] = useState<HomeUtilityBillInsert>({
        property_id: propertyId || '',
        utility_type: 'electricity',
        provider: null,
        account_number: null,
        bill_date: new Date().toISOString().split('T')[0],
        period_start: null,
        period_end: null,
        due_date: null,
        amount_cents: 0,
        usage_quantity: null,
        usage_unit: null,
        is_paid: false,
        paid_date: null,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            property_id: propertyId || '',
            utility_type: 'electricity',
            provider: null,
            account_number: null,
            bill_date: new Date().toISOString().split('T')[0],
            period_start: null,
            period_end: null,
            due_date: null,
            amount_cents: 0,
            usage_quantity: null,
            usage_unit: null,
            is_paid: false,
            paid_date: null,
            notes: null,
        });
        setEditingBill(null);
    };

    const openModal = (bill?: HomeUtilityBill) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                property_id: bill.property_id,
                utility_type: bill.utility_type,
                provider: bill.provider,
                account_number: bill.account_number,
                bill_date: bill.bill_date,
                period_start: bill.period_start,
                period_end: bill.period_end,
                due_date: bill.due_date,
                amount_cents: bill.amount_cents || 0,
                usage_quantity: bill.usage_quantity,
                usage_unit: bill.usage_unit,
                is_paid: bill.is_paid,
                paid_date: bill.paid_date,
                notes: bill.notes,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingBill
                ? `/api/house/utilities/${editingBill.id}`
                : '/api/house/utilities';
            const method = editingBill ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save bill');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving bill:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bill?')) return;

        try {
            const response = await fetch(`/api/house/utilities/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting bill:', error);
        }
    };

    const handleMarkPaid = async (bill: HomeUtilityBill) => {
        try {
            const response = await fetch(`/api/house/utilities/${bill.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_paid: true,
                    paid_date: new Date().toISOString().split('T')[0],
                }),
            });
            if (!response.ok) throw new Error('Failed to update');
            onRefresh();
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const getUtilityColor = (type: HomeUtilityType) => {
        const colors: Record<HomeUtilityType, string> = {
            electricity: 'text-yellow-400',
            gas: 'text-orange-400',
            water: 'text-blue-400',
            sewer: 'text-gray-400',
            trash: 'text-green-400',
            internet: 'text-purple-400',
            phone: 'text-cyan-400',
            cable: 'text-pink-400',
            hoa: 'text-indigo-400',
            security: 'text-red-400',
            other: 'text-gray-400',
        };
        return colors[type] || 'text-gray-400';
    };

    const utilityTypes: HomeUtilityType[] = [
        'electricity',
        'gas',
        'water',
        'sewer',
        'trash',
        'internet',
        'phone',
        'cable',
        'hoa',
        'security',
        'other',
    ];

    const filteredBills = bills.filter((bill) => {
        if (filter === 'paid') return bill.is_paid;
        if (filter === 'unpaid') return !bill.is_paid;
        return true;
    });

    const totalUnpaid = bills
        .filter((b) => !b.is_paid)
        .reduce((sum, b) => sum + (b.amount_cents || 0), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">Utility Bills</h2>
                    <p className="text-sm text-gray-400">
                        Unpaid: {formatCurrency(totalUnpaid)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'unpaid' | 'paid')}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Bills</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Bill
                    </button>
                </div>
            </div>

            {filteredBills.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">
                        {filter === 'all' ? 'No bills recorded yet' : `No ${filter} bills`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBills.map((bill) => {
                        const isOverdue =
                            !bill.is_paid && bill.due_date && new Date(bill.due_date) < new Date();

                        return (
                            <div
                                key={bill.id}
                                className={`p-4 bg-gray-900 rounded-lg border transition-colors ${
                                    isOverdue
                                        ? 'border-red-500/30'
                                        : bill.is_paid
                                        ? 'border-green-500/20'
                                        : 'border-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className={`font-semibold capitalize ${getUtilityColor(
                                                    bill.utility_type
                                                )}`}
                                            >
                                                {bill.utility_type}
                                            </span>
                                            {bill.provider && (
                                                <span className="text-gray-400 text-sm">
                                                    {bill.provider}
                                                </span>
                                            )}
                                            {bill.is_paid && (
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Paid
                                                </span>
                                            )}
                                            {isOverdue && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            {bill.period_start && bill.period_end && (
                                                <span>
                                                    Period:{' '}
                                                    {new Date(
                                                        bill.period_start
                                                    ).toLocaleDateString()}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        bill.period_end
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                            {bill.due_date && (
                                                <span
                                                    className={isOverdue ? 'text-red-400' : ''}
                                                >
                                                    Due:{' '}
                                                    {new Date(bill.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {bill.usage_quantity && (
                                                <span>
                                                    Usage: {bill.usage_quantity} {bill.usage_unit || ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">
                                                {formatCurrency(bill.amount_cents)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!bill.is_paid && (
                                                <button
                                                    onClick={() => handleMarkPaid(bill)}
                                                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                                    title="Mark as paid"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openModal(bill)}
                                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill.id)}
                                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingBill ? 'Edit Bill' : 'Add Bill'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Utility Type *
                                    </label>
                                    <select
                                        value={formData.utility_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                utility_type: e.target.value as HomeUtilityType,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {utilityTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Provider
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.provider || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                provider: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., ConEd"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Amount ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount_cents ? formData.amount_cents / 100 : ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount_cents: e.target.value
                                                ? Math.round(parseFloat(e.target.value) * 100)
                                                : 0,
                                        })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Period Start
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.period_start || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                period_start: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Period End
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.period_end || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                period_end: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.due_date || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            due_date: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Usage Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.usage_quantity || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                usage_quantity: e.target.value
                                                    ? parseFloat(e.target.value)
                                                    : null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Usage Unit
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.usage_unit || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                usage_unit: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., kWh, gallons"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_paid"
                                        checked={formData.is_paid}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_paid: e.target.checked })
                                        }
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_paid" className="text-sm text-gray-300">
                                        Paid
                                    </label>
                                </div>

                                {formData.is_paid && (
                                    <div className="flex-1">
                                        <input
                                            type="date"
                                            value={formData.paid_date || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    paid_date: e.target.value || null,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            placeholder="Paid date"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingBill ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
