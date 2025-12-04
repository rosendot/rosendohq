'use client';

import { useState, useRef } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign, Calendar, Upload } from 'lucide-react';

type TransactionType = 'income' | 'expense';
type TransactionCategory = 'salary' | 'food' | 'transport' | 'utilities' | 'entertainment' | 'shopping' | 'other';

interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    balance: number;
    currency: string;
}

interface Transaction {
    id: string;
    account_id: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    description: string;
    date: string;
    notes?: string;
}

interface Budget {
    id: string;
    category: TransactionCategory;
    limit: number;
    spent: number;
    period: 'monthly';
}

export default function FinancePage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);

        try {
            // Get Capital One 360 account ID
            const accountsResponse = await fetch('/api/finance/accounts');
            const accountsData = await accountsResponse.json();

            const capitalOne360 = accountsData.accounts?.find(
                (a: any) => a.name === '360 Checking' && a.institution === 'Capital One'
            );

            if (!capitalOne360) {
                alert('Capital One 360 Checking account not found');
                setImporting(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('accountId', capitalOne360.id);
            formData.append('source', 'capital-one-360');
            formData.append('dryRun', 'false');

            const response = await fetch('/api/finance/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert(`Import successful!\nTotal: ${result.stats.total}\nImported: ${result.stats.imported}\nDuplicates: ${result.stats.duplicates}`);
                // Refresh the page to show new transactions
                window.location.reload();
            } else {
                alert(`Import failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setImporting(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Minimal mock data
    const [accounts] = useState<Account[]>([
        { id: '1', name: 'Main Checking', type: 'checking', balance: 2500, currency: 'USD' },
        { id: '2', name: 'Savings', type: 'savings', balance: 10000, currency: 'USD' },
    ]);

    const [transactions] = useState<Transaction[]>([
        {
            id: '1',
            account_id: '1',
            type: 'income',
            category: 'salary',
            amount: 5000,
            description: 'Monthly Salary',
            date: '2025-10-01',
        },
        {
            id: '2',
            account_id: '1',
            type: 'expense',
            category: 'food',
            amount: 75,
            description: 'Grocery Shopping',
            date: '2025-10-03',
        },
    ]);

    const [budgets] = useState<Budget[]>([
        { id: '1', category: 'food', limit: 500, spent: 75, period: 'monthly' },
    ]);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyIncome = transactions
        .filter((t) => t.type === 'income' && t.date.startsWith(selectedMonth))
        .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return <Wallet className="w-5 h-5 text-blue-400" />;
            case 'savings':
                return <DollarSign className="w-5 h-5 text-green-400" />;
            case 'credit':
                return <CreditCard className="w-5 h-5 text-purple-400" />;
            case 'investment':
                return <TrendingUp className="w-5 h-5 text-orange-400" />;
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

    const BudgetProgress = ({ budget }: { budget: Budget }) => {
        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
        const isOverBudget = budget.spent > budget.limit;

        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{budget.category}</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-gray-300'}`}>
                        ${budget.spent} / ${budget.limit}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

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
                        <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {importing ? 'Importing...' : 'Import CSV'}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleImportCSV}
                                disabled={importing}
                                className="hidden"
                            />
                        </label>
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Total Balance</span>
                            <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Monthly Income</span>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(monthlyIncome)}</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Monthly Expenses</span>
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400">{formatCurrency(monthlyExpenses)}</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Net Income</span>
                            <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(monthlyIncome - monthlyExpenses)}
                        </div>
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
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getAccountTypeIcon(account.type)}
                                            <div>
                                                <div className="font-medium text-white">{account.name}</div>
                                                <div className="text-sm text-gray-400 capitalize">{account.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">{formatCurrency(account.balance, account.currency)}</div>
                                            <div className="text-xs text-gray-400">{account.currency}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                                <span className="text-sm text-gray-400">{transactions.length} transactions</span>
                            </div>

                            <div className="space-y-2">
                                {transactions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                                ) : (
                                    transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                                                        }`}
                                                >
                                                    {transaction.type === 'income' ? (
                                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{transaction.description}</div>
                                                    <div className="text-sm text-gray-400">
                                                        {transaction.date} • <span className="capitalize">{transaction.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                            >
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Monthly Budget */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Monthly Budgets</h3>
                                <button
                                    onClick={() => setShowBudgetModal(true)}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    Manage
                                </button>
                            </div>

                            <div className="space-y-4">
                                {budgets.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No budgets set</p>
                                ) : (
                                    budgets.map((budget) => <BudgetProgress key={budget.id} budget={budget} />)
                                )}
                            </div>
                        </div>

                        {/* Spending by Category */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>

                            <div className="space-y-3">
                                {Object.entries(
                                    transactions
                                        .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
                                        .reduce((acc, t) => {
                                            acc[t.category] = (acc[t.category] || 0) + t.amount;
                                            return acc;
                                        }, {} as Record<string, number>)
                                ).map(([category, amount]) => (
                                    <div key={category} className="flex justify-between items-center">
                                        <span className="text-gray-300 capitalize">{category}</span>
                                        <span className="text-white font-medium">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                                {transactions.filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth)).length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">No expenses this month</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Avg. Daily Spending</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(monthlyExpenses / new Date().getDate())}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Largest Expense</span>
                                    <span className="text-white font-medium">
                                        {formatCurrency(
                                            Math.max(
                                                ...transactions.filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth)).map((t) => t.amount),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Transactions This Month</span>
                                    <span className="text-white font-medium">
                                        {transactions.filter((t) => t.date.startsWith(selectedMonth)).length}
                                    </span>
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
            </div>
        </div>
    );
}