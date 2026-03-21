"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeDocument, HomeDocumentInsert, HomeDocumentType } from "@/types/house.types";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDocument: HomeDocument | null;
  propertyId: string | null;
  onSuccess: () => void;
}

const documentTypes: HomeDocumentType[] = [
  "warranty",
  "manual",
  "receipt",
  "contract",
  "insurance",
  "inspection",
  "permit",
  "hoa",
  "deed",
  "mortgage",
  "tax",
  "photo",
  "other",
];

const EMPTY_FORM = (propertyId: string | null): HomeDocumentInsert => ({
  property_id: propertyId || null,
  appliance_id: null,
  project_id: null,
  document_type: "other",
  name: "",
  description: null,
  file_url: null,
  file_id: null,
  expiration_date: null,
  issue_date: null,
  notes: null,
});

export default function DocumentModal({
  isOpen,
  onClose,
  editingDocument,
  propertyId,
  onSuccess,
}: DocumentModalProps) {
  const [formData, setFormData] = useState<HomeDocumentInsert>(EMPTY_FORM(propertyId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingDocument) {
      setFormData({
        property_id: editingDocument.property_id,
        appliance_id: editingDocument.appliance_id,
        project_id: editingDocument.project_id,
        document_type: editingDocument.document_type,
        name: editingDocument.name,
        description: editingDocument.description,
        file_url: editingDocument.file_url,
        file_id: editingDocument.file_id,
        expiration_date: editingDocument.expiration_date,
        issue_date: editingDocument.issue_date,
        notes: editingDocument.notes,
      });
    } else {
      setFormData(EMPTY_FORM(propertyId));
    }
  }, [isOpen, editingDocument, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingDocument
        ? `/api/house/documents/${editingDocument.id}`
        : "/api/house/documents";
      const method = editingDocument ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save document");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDocument ? "Edit Document" : "Add Document"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingDocument ? "Update" : "Create"}
      submitDisabled={!formData.name.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Home Insurance Policy"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Type</label>
        <select
          value={formData.document_type}
          onChange={(e) =>
            setFormData({ ...formData, document_type: e.target.value as HomeDocumentType })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">File URL</label>
        <input
          type="url"
          value={formData.file_url || ""}
          onChange={(e) => setFormData({ ...formData, file_url: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Issue Date</label>
          <input
            type="date"
            value={formData.issue_date || ""}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Expiration Date</label>
          <input
            type="date"
            value={formData.expiration_date || ""}
            onChange={(e) =>
              setFormData({ ...formData, expiration_date: e.target.value || null })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </BaseFormModal>
  );
}
