// src/app/finance/page.tsx
'use client';

import { useState } from 'react';

// Types
interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    institution?: string;
    balance: number;
}

interface Category {
    id: string;
    name: string;
    parent_id?: string;
    color?: string;
}

interface Transaction {
    id: string;
    account_id: string;
    date: string;
    description: string;
    amount: number; // negative for expenses, positive for income
    category_id?: string;
}

interface Subscription {
    id: string;
    name: string;
    amount: number;
    cadence: 'monthly' | 'yearly' | 'quarterly';
    next_renewal: string;
    account_id?: string;
    notes?: string;
}

// Minimal mock data
const mockAccounts: Account[] = [
    { id: '1', name: 'Chase Checking', type: 'checking', institution: 'Chase', balance: 3250.50 },
    { id: '2', name: 'Ally Savings', type: 'savings', institution: 'Ally', balance: 15000.00 },
    { id: '3', name: 'Chase Freedom', type: 'credit', institution: 'Chase', balance: -850.25 }
];

const mockCategories: Category[] = [
    { id: '1', name: 'Food & Dining', color: '#f59e0b' },
    { id: '2', name: 'Transportation', color: '#3b82f6' },
    { id: '3', name: 'Entertainment', color: '#8b5cf6' },
    { id: '4', name: 'Bills & Utilities', color: '#ef4444' },
    { id: '5', name: 'Income', color: '#10b981' }
];

const mockTransactions: Transaction[] = [
    { id: '1', account_id: '1', date: '2025-01-04', description: 'Whole Foods', amount: -85.42, category_id: '1' },
    { id: '2', account_id: '3', date: '2025-01-03', description: 'Shell Gas Station', amount: -45.00, category_id: '2' },
    { id: '3', account_id: '1', date: '2025-01-02', description: 'Netflix', amount: -15.99, category_id: '3' },
    { id: '4', account_id: '1', date: '2025-01-01', description: 'Salary Deposit', amount: 3500.00, category_id: '5' },
    { id: '5', account_id: '3', date: '2024-12-31', description: 'Amazon', amount: -124.99, category_id: '3' }
];

const mockSubscriptions: Subscription[] = [
    { id: '1', name: 'Netflix', amount: 15.99, cadence: 'monthly', next_renewal: '2025-02-02', account_id: '1' },
    { id: '2', name: 'Spotify', amount: 10.99, cadence: 'monthly', next_renewal: '2025-01-15', account_id: '1' },
    { id: '3', name: 'Amazon Prime', amount: 139.00, cadence: 'yearly', next_renewal: '2025-08-20', account_id: '3' }
];

export default function FinancePage() {
    const [accounts] = useState<Account[]>(mockAccounts);
    const [categories] = useState<Category[]>(mockCategories);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
    const [selectedView, setSelectedView] = useState<'overview' | 'transactions' | 'subscriptions' | 'accounts'>('overview');

    // Quick transaction form
    const [quickDescription, setQuickDescription] = useState('');
    const [quickAmount, setQuickAmount] = useState('');
    const [quickAccount, setQuickAccount] = useState(accounts[0]?.id || '');
    const [quickCategory, setQuickCategory] = useState('');

    const addQuickTransaction = () => {
        if (!quickDescription.trim() || !quickAmount || !quickAccount) return;

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            account_id: quickAccount,
            date: new Date().toISOString().split('T')[0],
            description: quickDescription.trim(),
            amount: parseFloat(quickAmount),
            category_id: quickCategory || undefined
        };

        setTransactions([newTransaction, ...transactions]);
        setQuickDescription('');
        setQuickAmount('');
        setQuickCategory('');
    };

    // Calculations
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const thisMonthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    });
    const thisMonthSpent = thisMonthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const thisMonthIncome = thisMonthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const upcomingRenewals = subscriptions
        .sort((a, b) => a.next_renewal.localeCompare(b.next_renewal))
        .slice(0, 5);

    const monthlySubscriptionCost = subscriptions
        .filter(s => s.cadence === 'monthly')
        .reduce((sum, s) => sum + s.amount, 0);

    // Category spending
    const categorySpending = thisMonthTransactions
        .filter(t => t.amount < 0 && t.category_id)
        .reduce((acc, t) => {
            const cat = categories.find(c => c.id === t.category_id);
            if (cat) {
                acc[cat.name] = (acc[cat.name] || 0) + Math.abs(t.amount);
            }
            return acc;
        }, {} as Record<string, number>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        Finance Tracker
                    </h1>
                    <p className="text-gray-600">Manage transactions, subscriptions, and accounts</p>
                </div>

                {/* View Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        {(['overview', 'transactions', 'subscriptions', 'accounts'] as const).map(view => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view)}
                                className={`pb-3 px-1 font-medium text-sm capitalize transition-colors ${selectedView === view
                                    ? 'border-b-2 border-green-600 text-green-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview View */}
                {selectedView === 'overview' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-md border border-green-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Balance</p>
                                        <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">This Month Income</p>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            ${thisMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-red-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">This Month Spent</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            ${thisMonthSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Monthly Subscriptions</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${monthlySubscriptionCost.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Category Breakdown */}
                            <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Spending by Category
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {Object.entries(categorySpending)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([category, amount]) => {
                                                const percentage = (amount / thisMonthSpent) * 100;
                                                const cat = categories.find(c => c.name === category);
                                                return (
                                                    <div key={category}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">{category}</span>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                ${amount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    backgroundColor: cat?.color || '#6b7280'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Renewals */}
                            <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Upcoming Renewals
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {upcomingRenewals.map(sub => {
                                            const daysUntil = Math.ceil(
                                                (new Date(sub.next_renewal).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                            return (
                                                <div key={sub.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{sub.name}</p>
                                                        <p className="text-sm text-purple-700">
                                                            {daysUntil > 0 ? `In ${daysUntil} days` : 'Today'} • ${sub.amount}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded capitalize">
                                                        {sub.cadence}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.slice(0, 10).map(tx => {
                                            const account = accounts.find(a => a.id === tx.account_id);
                                            const category = categories.find(c => c.id === tx.category_id);
                                            return (
                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {category && (
                                                            <span
                                                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                                                style={{ backgroundColor: category.color }}
                                                            >
                                                                {category.name}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{account?.name}</td>
                                                    <td className={`px-6 py-4 text-sm text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions View */}
                {selectedView === 'transactions' && (
                    <div className="space-y-6">
                        {/* Quick Add */}
                        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <input
                                    type="text"
                                    value={quickDescription}
                                    onChange={(e) => setQuickDescription(e.target.value)}
                                    placeholder="Description"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={quickAmount}
                                    onChange={(e) => setQuickAmount(e.target.value)}
                                    placeholder="Amount (- for expense)"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <select
                                    value={quickAccount}
                                    onChange={(e) => setQuickAccount(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={quickCategory}
                                    onChange={(e) => setQuickCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">No Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={addQuickTransaction}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* All Transactions */}
                        <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map(tx => {
                                            const account = accounts.find(a => a.id === tx.account_id);
                                            const category = categories.find(c => c.id === tx.category_id);
                                            return (
                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {category && (
                                                            <span
                                                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                                                style={{ backgroundColor: category.color }}
                                                            >
                                                                {category.name}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{account?.name}</td>
                                                    <td className={`px-6 py-4 text-sm text-right font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscriptions View */}
                {selectedView === 'subscriptions' && (
                    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">All Subscriptions</h3>
                            <div className="text-sm text-gray-600">
                                Monthly Total: <span className="font-bold text-purple-600">${monthlySubscriptionCost.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subscriptions.map(sub => {
                                    const daysUntil = Math.ceil(
                                        (new Date(sub.next_renewal).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                    );
                                    const account = accounts.find(a => a.id === sub.account_id);
                                    return (
                                        <div key={sub.id} className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 text-lg">{sub.name}</h4>
                                                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded capitalize">
                                                    {sub.cadence}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Amount:</span> ${sub.amount}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Next Renewal:</span>{' '}
                                                    {new Date(sub.next_renewal).toLocaleDateString()}
                                                    <span className="text-purple-600 ml-1">
                                                        ({daysUntil > 0 ? `${daysUntil} days` : 'Today'})
                                                    </span>
                                                </p>
                                                {account && (
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Account:</span> {account.name}
                                                    </p>
                                                )}
                                                {sub.notes && (
                                                    <p className="text-gray-600 text-xs mt-2">{sub.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Accounts View */}
                {selectedView === 'accounts' && (
                    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">All Accounts</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {accounts.map(account => {
                                    const accountTransactions = transactions.filter(t => t.account_id === account.id);
                                    const thisMonthTx = accountTransactions.filter(t => {
                                        const txDate = new Date(t.date);
                                        const now = new Date();
                                        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
                                    });
                                    const thisMonthActivity = thisMonthTx.reduce((sum, t) => sum + Math.abs(t.amount), 0);

                                    const getAccountIcon = (type: string) => {
                                        switch (type) {
                                            case 'checking':
                                                return (
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                );
                                            case 'savings':
                                                return (
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                );
                                            case 'credit':
                                                return (
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                );
                                            case 'investment':
                                                return (
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                );
                                        }
                                    };

                                    const getTypeColor = (type: string) => {
                                        switch (type) {
                                            case 'checking': return 'blue';
                                            case 'savings': return 'green';
                                            case 'credit': return 'orange';
                                            case 'investment': return 'purple';
                                            default: return 'gray';
                                        }
                                    };

                                    const color = getTypeColor(account.type);

                                    return (
                                        <div key={account.id} className={`p-6 bg-${color}-50 rounded-lg border-2 border-${color}-200`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-12 w-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600`}>
                                                        {getAccountIcon(account.type)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">{account.name}</h4>
                                                        <p className="text-sm text-gray-600">{account.institution}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs font-medium rounded capitalize`}>
                                                    {account.type}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Current Balance</p>
                                                    <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="pt-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">This Month Activity</p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        ${thisMonthActivity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {thisMonthTx.length} transaction{thisMonthTx.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}