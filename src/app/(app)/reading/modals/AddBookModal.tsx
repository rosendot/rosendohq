"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { BookStatus, BookFormat } from "@/types/reading.types";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    status: "planned" as BookStatus,
    format: "" as BookFormat | "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        author: "",
        status: "planned",
        format: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          author: formData.author.trim() || null,
          status: formData.status,
          format: formData.format || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create book");

      onSuccess();
    } catch (error) {
      console.error("Error creating book:", error);
      alert("Failed to create book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Book"
      onSubmit={handleSubmit}
      submitLabel="Add Book"
      loadingLabel="Creating..."
      loading={saving}
      submitDisabled={!formData.title.trim()}
      submitColor="blue"
      maxWidth="md"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Book title"
          autoFocus
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Author</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Author name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="planned">Plan to Read</option>
            <option value="reading">Reading</option>
            <option value="finished">Finished</option>
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Format</label>
          <select
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value as BookFormat | "" })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select format</option>
            <option value="physical">Physical</option>
            <option value="ebook">Ebook</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        You can add more details like pages, rating, notes, and highlights after creating the book.
      </p>
    </BaseFormModal>
  );
}
