'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import UtilityBillModal from '../modals/UtilityBillModal';
import type { HomeUtilityBill, HomeUtilityType } from '@/types/house.types';

interface UtilitiesTabProps {
    bills: HomeUtilityBill[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function UtilitiesTab({ bills, propertyId, onRefresh }: UtilitiesTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingBill, setEditingBill] = useState<HomeUtilityBill | null>(null);
    const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

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
                        onClick={() => { setEditingBill(null); setShowModal(true); }}
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
                                                onClick={() => { setEditingBill(bill); setShowModal(true); }}
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
            <UtilityBillModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingBill={editingBill}
                propertyId={propertyId}
                onSuccess={onRefresh}
            />
        </div>
    );
}
