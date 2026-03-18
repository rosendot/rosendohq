"use client";

import { useState } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
import type { TripExpense } from "@/types/travel.types";
import { formatDate, formatCents } from "./shared";

interface ExpensesTabProps {
  tripId: string;
  expenses: TripExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<TripExpense[]>>;
  onDelete: (type: string, id: string, name: string) => void;
}

export default function ExpensesTab({ tripId, expenses, setExpenses, onDelete }: ExpensesTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "USD",
    category: "",
    expense_date: "",
    notes: "",
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_cents, 0);

  const create = async () => {
    if (!form.description.trim() || !form.amount || !form.expense_date) return;
    const amountCents = Math.round(parseFloat(form.amount) * 100);
    const res = await fetch(`/api/travel/trips/${tripId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        description: form.description.trim(),
        amount_cents: amountCents,
        currency: form.currency,
        category: form.category.trim() || null,
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setExpenses((prev) => [...prev, data]);
      setForm({ description: "", amount: "", currency: "USD", category: "", expense_date: "", notes: "" });
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{formatCents(totalExpenses)}</p>
          <p className="text-sm text-gray-500">{expenses.length} expenses</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Expense</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-300">Description*</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Gas fill-up"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Date*</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Amount ($)*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Gas, Food, Lodging"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={2}
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={!form.description.trim() || !form.amount || !form.expense_date}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm({
                    description: "",
                    amount: "",
                    currency: "USD",
                    category: "",
                    expense_date: "",
                    notes: "",
                  });
                }}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        {[...expenses]
          .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
          .map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-all hover:border-emerald-500/30"
            >
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(expense.expense_date)}
                      {expense.category && ` · ${expense.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">
                      {formatCents(expense.amount_cents, expense.currency)}
                    </p>
                    <button
                      onClick={() => onDelete("expense", expense.id, expense.description)}
                      className="text-gray-600 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expense.notes && <p className="mt-1 text-xs text-gray-500">{expense.notes}</p>}
              </div>
            </div>
          ))}

        {expenses.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
            <DollarSign className="mx-auto mb-2 h-8 w-8" />
            <p>No expenses logged yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
