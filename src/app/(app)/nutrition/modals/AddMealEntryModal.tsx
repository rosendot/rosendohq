"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { FoodItem, MealName } from "@/types/nutrition.types";

const MEAL_NAMES: MealName[] = ["breakfast", "lunch", "dinner", "snack"];

interface AddMealEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  defaultMeal?: MealName;
  foods: FoodItem[];
  onSuccess: () => void;
  onFoodCreated: (food: FoodItem) => void;
}

export default function AddMealEntryModal({
  isOpen,
  onClose,
  date,
  defaultMeal,
  foods,
  onSuccess,
  onFoodCreated,
}: AddMealEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mealName, setMealName] = useState<MealName>(defaultMeal ?? "breakfast");
  const [mode, setMode] = useState<"food" | "custom">("custom");
  const [foodId, setFoodId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [servings, setServings] = useState("1");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [saveAsFood, setSaveAsFood] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMealName(defaultMeal ?? "breakfast");
      setMode("custom");
      setFoodId("");
      setCustomName("");
      setServings("1");
      setCalories("");
      setProteinG("");
      setCarbsG("");
      setFatG("");
      setSaveAsFood(false);
      setError(null);
    }
  }, [isOpen, defaultMeal]);

  useEffect(() => {
    if (mode !== "food" || !foodId) return;
    const f = foods.find((x) => x.id === foodId);
    if (!f) return;
    setCalories(f.calories?.toString() ?? "");
    setProteinG(f.protein_g?.toString() ?? "");
    setCarbsG(f.carbs_g?.toString() ?? "");
    setFatG(f.fat_g?.toString() ?? "");
    if (!customName) setCustomName(f.name);
  }, [foodId, mode, foods, customName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "custom" && !customName.trim()) {
        throw new Error("Food name is required");
      }
      if (mode === "food" && !foodId) {
        throw new Error("Pick a food item");
      }

      let resolvedFoodId = mode === "food" ? foodId : null;

      if (mode === "custom" && saveAsFood) {
        const foodRes = await fetch("/api/nutrition/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customName.trim(),
            serving_size: null,
            calories: calories ? Number(calories) : null,
            protein_g: proteinG ? Number(proteinG) : null,
            carbs_g: carbsG ? Number(carbsG) : null,
            fat_g: fatG ? Number(fatG) : null,
          }),
        });
        if (!foodRes.ok) {
          const data = await foodRes.json();
          throw new Error(data.error || "Failed to save food");
        }
        const newFood: FoodItem = await foodRes.json();
        onFoodCreated(newFood);
        resolvedFoodId = newFood.id;
      }

      const mealRes = await fetch(`/api/nutrition/meals?date=${date}`);
      if (!mealRes.ok) throw new Error("Failed to load meals");
      const dayMeals = await mealRes.json();
      let meal = dayMeals.find((m: { name: MealName }) => m.name === mealName);

      if (!meal) {
        const createRes = await fetch("/api/nutrition/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meal_date: date, name: mealName }),
        });
        if (!createRes.ok) {
          const data = await createRes.json();
          throw new Error(data.error || "Failed to create meal");
        }
        meal = await createRes.json();
      }

      const servingsNum = Number(servings) || 1;
      const entryRes = await fetch(`/api/nutrition/meals/${meal.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_item_id: resolvedFoodId,
          custom_name: resolvedFoodId ? null : customName.trim(),
          servings: servingsNum,
          calories: calories ? Number(calories) * servingsNum : null,
          protein_g: proteinG ? Number(proteinG) * servingsNum : null,
          carbs_g: carbsG ? Number(carbsG) * servingsNum : null,
          fat_g: fatG ? Number(fatG) * servingsNum : null,
        }),
      });

      if (!entryRes.ok) {
        const data = await entryRes.json();
        throw new Error(data.error || "Failed to add entry");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Meal Entry"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Add"
      loadingLabel="Adding..."
      submitColor="blue"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Meal</label>
        <select
          value={mealName}
          onChange={(e) => setMealName(e.target.value as MealName)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MEAL_NAMES.map((m) => (
            <option key={m} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
            mode === "custom" ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => setMode("food")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
            mode === "food" ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
          disabled={foods.length === 0}
        >
          From Library {foods.length > 0 && `(${foods.length})`}
        </button>
      </div>

      {mode === "food" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Food</label>
          <select
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a food...</option>
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Chicken burrito bowl"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Servings</label>
        <input
          type="number"
          step="0.25"
          min="0"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Calories (per serving)</label>
          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Protein g</label>
          <input
            type="number"
            min="0"
            step="0.1"
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
            step="0.1"
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
            step="0.1"
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {mode === "custom" && (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={saveAsFood}
            onChange={(e) => setSaveAsFood(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800"
          />
          Save to food library for reuse
        </label>
      )}
    </BaseFormModal>
  );
}
