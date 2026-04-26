"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { NutritionTarget } from "@/types/nutrition.types";

interface SetGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  current: NutritionTarget | null;
  onSuccess: (target: NutritionTarget) => void;
}

export default function SetGoalsModal({ isOpen, onClose, current, onSuccess }: SetGoalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCalories(current?.calories?.toString() ?? "");
    setProteinG(current?.protein_g?.toString() ?? "");
    setCarbsG(current?.carbs_g?.toString() ?? "");
    setFatG(current?.fat_g?.toString() ?? "");
    setError(null);
  }, [isOpen, current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        calories: calories ? Number(calories) : null,
        protein_g: proteinG ? Number(proteinG) : null,
        carbs_g: carbsG ? Number(carbsG) : null,
        fat_g: fatG ? Number(fatG) : null,
      };

      let res: Response;
      if (current) {
        res = await fetch(`/api/nutrition/targets/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/nutrition/targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            start_date: new Date().toISOString().split("T")[0],
            end_date: null,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save goals");
      }

      const saved: NutritionTarget = await res.json();
      onSuccess(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Nutrition Goals"
      subtitle="Daily macro targets"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitColor="blue"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Calories</label>
        <input
          type="number"
          min="0"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Protein g</label>
          <input
            type="number"
            min="0"
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Carbs g</label>
          <input
            type="number"
            min="0"
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Fat g</label>
          <input
            type="number"
            min="0"
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
