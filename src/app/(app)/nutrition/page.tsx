"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Flame, Activity, Trash2, Target } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import AddMealEntryModal from "./modals/AddMealEntryModal";
import SetGoalsModal from "./modals/SetGoalsModal";
import type { FoodItem, Meal, MealEntry, MealName, NutritionTarget } from "@/types/nutrition.types";

const MEAL_NAMES: MealName[] = ["breakfast", "lunch", "dinner", "snack"];

interface MealWithEntries extends Meal {
  entries: MealEntry[];
}

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState<MealWithEntries[]>([]);
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealName | undefined>(undefined);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState<MealEntry | null>(null);

  const fetchDay = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsRes, targetRes, foodsRes] = await Promise.allSettled([
        fetch(`/api/nutrition/meals?date=${selectedDate}`),
        fetch("/api/nutrition/targets?active=true"),
        fetch("/api/nutrition/foods"),
      ]);

      let mealsData: Meal[] = [];
      if (mealsRes.status === "fulfilled" && mealsRes.value.ok) {
        mealsData = await mealsRes.value.json();
      }

      const entriesByMeal = await Promise.all(
        mealsData.map(async (m) => {
          const r = await fetch(`/api/nutrition/meals/${m.id}/entries`);
          if (!r.ok) return [];
          return (await r.json()) as MealEntry[];
        }),
      );

      setMeals(mealsData.map((m, i) => ({ ...m, entries: entriesByMeal[i] })));

      if (targetRes.status === "fulfilled" && targetRes.value.ok) {
        const targets: NutritionTarget[] = await targetRes.value.json();
        setTarget(targets[0] ?? null);
      }

      if (foodsRes.status === "fulfilled" && foodsRes.value.ok) {
        setFoods(await foodsRes.value.json());
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const allEntries = meals.flatMap((m) => m.entries);
  const totalCalories = allEntries.reduce((s, e) => s + (Number(e.calories) || 0), 0);
  const totalProtein = allEntries.reduce((s, e) => s + (Number(e.protein_g) || 0), 0);
  const totalCarbs = allEntries.reduce((s, e) => s + (Number(e.carbs_g) || 0), 0);
  const totalFat = allEntries.reduce((s, e) => s + (Number(e.fat_g) || 0), 0);

  const goalCal = Number(target?.calories) || 2000;
  const goalProtein = Number(target?.protein_g) || 150;
  const goalCarbs = Number(target?.carbs_g) || 200;
  const goalFat = Number(target?.fat_g) || 65;

  const entriesByMeal = (name: MealName): MealEntry[] => {
    const meal = meals.find((m) => m.name === name);
    return meal ? meal.entries : [];
  };

  const handleDeleteEntry = async () => {
    if (!deleteEntry) return;
    const res = await fetch(`/api/nutrition/entries/${deleteEntry.id}`, { method: "DELETE" });
    if (res.ok) {
      setMeals((prev) =>
        prev.map((m) => ({ ...m, entries: m.entries.filter((e) => e.id !== deleteEntry.id) })),
      );
    }
    setDeleteEntry(null);
  };

  const openAddForMeal = (name: MealName) => {
    setDefaultMeal(name);
    setShowEntryModal(true);
  };

  const MacroProgress = ({
    label,
    current,
    goal,
    color,
  }: {
    label: string;
    current: number;
    goal: number;
    color: string;
  }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-300">
            {Math.round(current)}g / {goal}g
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Nutrition Tracker</h1>
            <p className="text-gray-400">Track your meals and macros</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGoalsModal(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              <Target className="h-4 w-4" />
              Set Goals
            </button>
            <button
              onClick={() => {
                setDefaultMeal(undefined);
                setShowEntryModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Daily Summary
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(totalCalories)}</div>
                    <div className="text-sm text-gray-400">/ {goalCal} cal</div>
                    <div className="mt-1 text-xs text-gray-500">Calories</div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{Math.round(totalProtein)}g</div>
                    <div className="text-sm text-gray-400">/ {goalProtein}g</div>
                    <div className="mt-1 text-xs text-gray-500">Protein</div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.round(totalCarbs)}g</div>
                    <div className="text-sm text-gray-400">/ {goalCarbs}g</div>
                    <div className="mt-1 text-xs text-gray-500">Carbs</div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Math.round(totalFat)}g</div>
                    <div className="text-sm text-gray-400">/ {goalFat}g</div>
                    <div className="mt-1 text-xs text-gray-500">Fat</div>
                  </div>
                </div>
              </div>

              {MEAL_NAMES.map((mealName) => {
                const entries = entriesByMeal(mealName);
                const cal = entries.reduce((s, e) => s + (Number(e.calories) || 0), 0);
                return (
                  <div key={mealName} className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold capitalize text-white">{mealName}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{Math.round(cal)} cal</span>
                        <button
                          onClick={() => openAddForMeal(mealName)}
                          className="rounded-lg bg-gray-800 p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {entries.length === 0 ? (
                      <p className="text-sm text-gray-500">No entries logged</p>
                    ) : (
                      <div className="space-y-3">
                        {entries.map((entry) => {
                          const food = foods.find((f) => f.id === entry.food_item_id);
                          const displayName = food?.name || entry.custom_name || "Unnamed";
                          return (
                            <div
                              key={entry.id}
                              className="flex items-start justify-between rounded-lg border border-gray-700 bg-gray-800 p-3"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-white">{displayName}</div>
                                <div className="mt-1 text-sm text-gray-400">
                                  {entry.servings}× • {Math.round(Number(entry.calories) || 0)} cal
                                  {entry.protein_g != null && ` • P: ${Math.round(Number(entry.protein_g))}g`}
                                  {entry.carbs_g != null && ` • C: ${Math.round(Number(entry.carbs_g))}g`}
                                  {entry.fat_g != null && ` • F: ${Math.round(Number(entry.fat_g))}g`}
                                </div>
                              </div>
                              <button
                                onClick={() => setDeleteEntry(entry)}
                                className="ml-2 rounded p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Activity className="h-5 w-5 text-green-400" />
                  Macro Progress
                </h3>
                <div className="space-y-4">
                  <MacroProgress label="Protein" current={totalProtein} goal={goalProtein} color="bg-blue-500" />
                  <MacroProgress label="Carbs" current={totalCarbs} goal={goalCarbs} color="bg-green-500" />
                  <MacroProgress label="Fat" current={totalFat} goal={goalFat} color="bg-yellow-500" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Calorie Progress</h3>
                <div className="mb-4 text-center">
                  <div className="text-4xl font-bold text-white">{Math.round(totalCalories)}</div>
                  <div className="text-gray-400">/ {goalCal} cal</div>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-700">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                    style={{ width: `${Math.min((totalCalories / goalCal) * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-center text-sm text-gray-400">
                  {goalCal - totalCalories > 0
                    ? `${Math.round(goalCal - totalCalories)} cal remaining`
                    : `${Math.round(totalCalories - goalCal)} cal over`}
                </div>
              </div>

              {!target && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300">
                  No goals set yet. Click <strong>Set Goals</strong> to define daily targets.
                </div>
              )}
            </div>
          </div>
        )}

        <AddMealEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          date={selectedDate}
          defaultMeal={defaultMeal}
          foods={foods}
          onSuccess={fetchDay}
          onFoodCreated={(food) => setFoods((prev) => [...prev, food].sort((a, b) => a.name.localeCompare(b.name)))}
        />

        <SetGoalsModal
          isOpen={showGoalsModal}
          onClose={() => setShowGoalsModal(false)}
          current={target}
          onSuccess={(t) => setTarget(t)}
        />

        <DeleteConfirmationModal
          isOpen={deleteEntry !== null}
          onClose={() => setDeleteEntry(null)}
          onConfirm={handleDeleteEntry}
          itemName={deleteEntry?.custom_name || foods.find((f) => f.id === deleteEntry?.food_item_id)?.name || "this entry"}
        />
      </div>
    </div>
  );
}
