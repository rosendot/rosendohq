"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { ShoppingList } from "@/types/shopping.types";

interface SendToShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  ingredientCount: number;
}

export default function SendToShoppingModal({
  isOpen,
  onClose,
  recipeId,
  ingredientCount,
}: SendToShoppingModalProps) {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSending(false);
      fetch("/api/shopping/lists")
        .then((res) => res.json())
        .then((lists: ShoppingList[]) => {
          setShoppingLists(lists);
          setSelectedListId(lists.length > 0 ? lists[0].id : "");
        })
        .catch(() => {
          setShoppingLists([]);
          setSelectedListId("");
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${recipeId}/send-to-shopping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: selectedListId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add ingredients to shopping list");
      }

      onClose();
    } catch (err) {
      console.error("Error sending to shopping list:", err);
      setError(err instanceof Error ? err.message : "Failed to add ingredients to shopping list");
    } finally {
      setSending(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Shopping List"
      onSubmit={handleSubmit}
      loading={sending}
      error={error}
      submitLabel="Add Ingredients"
      loadingLabel="Adding..."
      submitColor="amber"
      submitDisabled={!selectedListId}
      maxWidth="sm"
    >
      <p className="text-sm text-gray-300">
        {ingredientCount} ingredient(s) will be added to:
      </p>

      {shoppingLists.length === 0 ? (
        <p className="text-sm text-gray-400">No shopping lists found. Create one first.</p>
      ) : (
        <div>
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={sending}
          >
            {shoppingLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </BaseFormModal>
  );
}
