"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeUtilityBill, HomeUtilityBillInsert, HomeUtilityType } from "@/types/house.types";

interface UtilityBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBill: HomeUtilityBill | null;
  propertyId: string | null;
  onSuccess: () => void;
}

const utilityTypes: HomeUtilityType[] = [
  "electricity",
  "gas",
  "water",
  "sewer",
  "trash",
  "internet",
  "phone",
  "cable",
  "hoa",
  "security",
  "other",
];

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = (propertyId: string | null): HomeUtilityBillInsert => ({
  property_id: propertyId || "",
  utility_type: "electricity",
  provider: null,
  account_number: null,
  bill_date: today(),
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

export default function UtilityBillModal({
  isOpen,
  onClose,
  editingBill,
  propertyId,
  onSuccess,
}: UtilityBillModalProps) {
  const [formData, setFormData] = useState<HomeUtilityBillInsert>(EMPTY_FORM(propertyId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingBill) {
      setFormData({
        property_id: editingBill.property_id,
        utility_type: editingBill.utility_type,
        provider: editingBill.provider,
        account_number: editingBill.account_number,
        bill_date: editingBill.bill_date,
        period_start: editingBill.period_start,
        period_end: editingBill.period_end,
        due_date: editingBill.due_date,
        amount_cents: editingBill.amount_cents,
        usage_quantity: editingBill.usage_quantity,
        usage_unit: editingBill.usage_unit,
        is_paid: editingBill.is_paid,
        paid_date: editingBill.paid_date,
        notes: editingBill.notes,
      });
    } else {
      setFormData(EMPTY_FORM(propertyId));
    }
  }, [isOpen, editingBill, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBill
        ? `/api/house/utilities/${editingBill.id}`
        : "/api/house/utilities";
      const method = editingBill ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save utility bill");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving utility bill:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBill ? "Edit Bill" : "Add Bill"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingBill ? "Update" : "Create"}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Utility Type</label>
          <select
            value={formData.utility_type}
            onChange={(e) =>
              setFormData({ ...formData, utility_type: e.target.value as HomeUtilityType })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {utilityTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Provider</label>
          <input
            type="text"
            value={formData.provider || ""}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount_cents ? formData.amount_cents / 100 : ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              amount_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Period Start</label>
          <input
            type="date"
            value={formData.period_start || ""}
            onChange={(e) =>
              setFormData({ ...formData, period_start: e.target.value || null })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Period End</label>
          <input
            type="date"
            value={formData.period_end || ""}
            onChange={(e) =>
              setFormData({ ...formData, period_end: e.target.value || null })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Due Date</label>
        <input
          type="date"
          value={formData.due_date || ""}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Usage Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.usage_quantity ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                usage_quantity: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Usage Unit</label>
          <input
            type="text"
            value={formData.usage_unit || ""}
            onChange={(e) => setFormData({ ...formData, usage_unit: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="e.g., kWh, gallons"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={formData.is_paid}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_paid: e.target.checked,
                paid_date: e.target.checked ? formData.paid_date || today() : null,
              })
            }
            className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          Paid
        </label>

        {formData.is_paid && (
          <div className="flex-1">
            <input
              type="date"
              value={formData.paid_date || ""}
              onChange={(e) => setFormData({ ...formData, paid_date: e.target.value || null })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>
    </BaseFormModal>
  );
}
