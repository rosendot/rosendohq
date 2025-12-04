'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign, Calendar, Upload } from 'lucide-react';
import type { Account, Transaction, Category } from '@/types/database.types';

// Extended transaction type with joined data from API
interface TransactionWithRelations extends Transaction {
    category?: Category | null;
    account?: Pick<Account, 'id' | 'name' | 'type'> | null;
}

export default function FinancePage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Real data from APIs
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);

    // Fetch all data on mount and when month changes
    async function fetchAllData() {
        try {
            setLoading(true);

            // Fetch accounts and transactions in parallel
            const [accountsRes, transactionsRes] = await Promise.all([
                fetch('/api/finance/accounts'),
                fetch(`/api/finance/transactions?month=${selectedMonth}`)
            ]);

            if (!accountsRes.ok || !transactionsRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const [accountsData, transactionsData] = await Promise.all([
                accountsRes.json(),
                transactionsRes.json()
            ]);

            setAccounts(accountsData.accounts || accountsData || []);
            setTransactions(transactionsData || []);
            setError(null);
        } catch (err) {
            console.error('Fetch data error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, [selectedMonth]);

    const handleUploadCSV = async (accountId: string, source: string, file: File) => {
        setImporting(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('accountId', accountId);
            formData.append('source', source);

            const response = await fetch('/api/finance/csv-upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert(`CSV uploaded successfully!\nRows imported: ${result.rowCount}`);
                // Refresh data
                fetchAllData();
                setShowUploadModal(false);
            } else {
                alert(`Upload failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setImporting(false);
        }
    };

    // Calculate statistics
    const monthlyIncome = transactions
        .filter((t) => t.amount_cents > 0)
        .reduce((sum, t) => sum + t.amount_cents, 0) / 100;
    const monthlyExpenses = Math.abs(
        transactions
            .filter((t) => t.amount_cents < 0)
            .reduce((sum, t) => sum + t.amount_cents, 0) / 100
    );

    // Group spending by category
    const spendingByCategory = transactions
        .filter((t) => t.amount_cents < 0)
        .reduce((acc, t) => {
            const categoryName = t.category?.name || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount_cents / 100);
            return acc;
        }, {} as Record<string, number>);

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return <Wallet className="w-5 h-5 text-blue-400" />;
            case 'savings':
                return <DollarSign className="w-5 h-5 text-green-400" />;
            case 'credit':
                return <CreditCard className="w-5 h-5 text-purple-400" />;
            default:
                return <Wallet className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading && accounts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Finance Tracker</h1>
                        <p className="text-gray-400">Manage accounts and track expenses</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload CSV
                        </button>
                        <button
                            onClick={() => setShowAccountModal(true)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                        >
                            Add Account
                        </button>
                        <button
                            onClick={() => setShowTransactionModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        Select Month
                    </label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Accounts */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">Accounts</h2>
                                <span className="text-sm text-gray-400">{accounts.length} accounts</span>
                            </div>

                            <div className="space-y-3">
                                {accounts.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No accounts yet</p>
                                ) : (
                                    accounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getAccountTypeIcon(account.type)}
                                                <div>
                                                    <div className="font-medium text-white">{account.name}</div>
                                                    <div className="text-sm text-gray-400">{account.institution || 'N/A'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-400 capitalize">{account.type}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">Transactions</h2>
                                <span className="text-sm text-gray-400">{transactions.length} this month</span>
                            </div>

                            <div className="space-y-2">
                                {transactions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                                ) : (
                                    transactions.map((transaction) => {
                                        const isIncome = transaction.amount_cents > 0;
                                        const amount = Math.abs(transaction.amount_cents / 100);

                                        return (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                        {isIncome ? (
                                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <TrendingDown className="w-5 h-5 text-red-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{transaction.description}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {formatDate(transaction.posted_date)}
                                                            {transaction.category && ` • ${transaction.category.name}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isIncome ? '+' : '-'}
                                                    {formatCurrency(amount)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Spending by Category */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>

                            <div className="space-y-3">
                                {Object.keys(spendingByCategory).length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No expenses this month</p>
                                ) : (
                                    Object.entries(spendingByCategory)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([category, amount]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-gray-300">{category}</span>
                                                <span className="text-white font-medium">{formatCurrency(amount)}</span>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Monthly Income</span>
                                    <span className="text-green-400 font-medium">{formatCurrency(monthlyIncome)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Monthly Expenses</span>
                                    <span className="text-red-400 font-medium">{formatCurrency(monthlyExpenses)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Net Income</span>
                                    <span className={`font-medium ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(monthlyIncome - monthlyExpenses)}
                                    </span>
                                </div>
                                <div className="border-t border-gray-700 pt-3"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Avg. Transaction</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(transactions.length > 0 ? monthlyExpenses / transactions.filter(t => t.amount_cents < 0).length : 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Largest Expense</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(
                                            Math.max(
                                                ...transactions.filter((t) => t.amount_cents < 0).map((t) => Math.abs(t.amount_cents / 100)),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Transactions</span>
                                    <span className="text-white font-medium">{transactions.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showAccountModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Account</h2>
                            <p className="text-gray-400 mb-4">Account form would go here</p>
                            <button
                                onClick={() => setShowAccountModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showTransactionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Transaction</h2>
                            <p className="text-gray-400 mb-4">Transaction form would go here</p>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showBudgetModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Manage Budgets</h2>
                            <p className="text-gray-400 mb-4">Budget management would go here</p>
                            <button
                                onClick={() => setShowBudgetModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showUploadModal && <CSVUploadModal
                    accounts={accounts}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUploadCSV}
                    uploading={importing}
                />}
            </div>
        </div>
    );
}

function CSVUploadModal({
    accounts,
    onClose,
    onUpload,
    uploading
}: {
    accounts: Account[];
    onClose: () => void;
    onUpload: (accountId: string, source: string, file: File) => void;
    uploading: boolean;
}) {
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const sourceOptions = [
        { value: 'capital-one-360-checking', label: 'Capital One 360 Checking' },
        { value: 'capital-one-360-savings', label: 'Capital One 360 Savings' },
        { value: 'capital-one-savor', label: 'Capital One Savor' },
        { value: 'capital-one-venture-x', label: 'Capital One Venture X' },
        { value: 'chase-amazon', label: 'Chase Amazon' },
        { value: 'discover-it', label: 'Discover IT' },
    ];

    const handleSubmit = () => {
        if (!selectedAccountId || !selectedSource || !selectedFile) {
            alert('Please select an account, source type, and file');
            return;
        }
        onUpload(selectedAccountId, selectedSource, selectedFile);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold text-white mb-4">Upload CSV</h2>

                {/* Account Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account *
                    </label>
                    <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={uploading}
                    >
                        <option value="">Select account...</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} - {account.institution}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Source Type Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        CSV Source Type *
                    </label>
                    <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={uploading}
                    >
                        <option value="">Select source type...</option>
                        {sourceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        CSV File *
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        disabled={uploading}
                    />
                    {selectedFile && (
                        <p className="text-sm text-gray-400 mt-2">
                            Selected: {selectedFile.name}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={uploading || !selectedAccountId || !selectedSource || !selectedFile}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
