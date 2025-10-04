'use client';

import { useState } from 'react';
import { Plus, Droplet, Flame, Activity } from 'lucide-react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Meal {
    id: string;
    name: string;
    meal_type: MealType;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    time: string;
}

interface NutritionGoal {
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
    daily_water: number;
}

export default function NutritionPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showMealModal, setShowMealModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Minimal mock data
    const [goals] = useState<NutritionGoal>({
        daily_calories: 2000,
        daily_protein: 150,
        daily_carbs: 200,
        daily_fat: 65,
        daily_water: 2000,
    });

    const [meals] = useState<Meal[]>([
        {
            id: '1',
            name: 'Oatmeal with berries',
            meal_type: 'breakfast',
            calories: 350,
            protein: 12,
            carbs: 60,
            fat: 8,
            time: '08:00',
        },
    ]);

    const [waterIntake, setWaterIntake] = useState(500); // ml

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

    const addWater = (amount: number) => {
        setWaterIntake((prev) => Math.min(prev + amount, goals.daily_water));
    };

    const getMealsByType = (type: MealType) => meals.filter((m) => m.meal_type === type);

    const MacroProgress = ({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) => {
        const percentage = Math.min((current / goal) * 100, 100);
        return (
            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-300">
                        {current}g / {goal}g
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
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
                        <h1 className="text-3xl font-bold text-white mb-2">Nutrition Tracker</h1>
                        <p className="text-gray-400">Track your meals and macros</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowGoalModal(true)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                        >
                            Set Goals
                        </button>
                        <button
                            onClick={() => setShowMealModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Meal
                        </button>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="mb-6">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Daily Summary */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Daily Summary
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-2xl font-bold text-white">{totalCalories}</div>
                                    <div className="text-sm text-gray-400">/ {goals.daily_calories} cal</div>
                                    <div className="text-xs text-gray-500 mt-1">Calories</div>
                                </div>
                                <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-2xl font-bold text-blue-400">{totalProtein}g</div>
                                    <div className="text-sm text-gray-400">/ {goals.daily_protein}g</div>
                                    <div className="text-xs text-gray-500 mt-1">Protein</div>
                                </div>
                                <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-2xl font-bold text-green-400">{totalCarbs}g</div>
                                    <div className="text-sm text-gray-400">/ {goals.daily_carbs}g</div>
                                    <div className="text-xs text-gray-500 mt-1">Carbs</div>
                                </div>
                                <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-2xl font-bold text-yellow-400">{totalFat}g</div>
                                    <div className="text-sm text-gray-400">/ {goals.daily_fat}g</div>
                                    <div className="text-xs text-gray-500 mt-1">Fat</div>
                                </div>
                            </div>
                        </div>

                        {/* Meals by Type */}
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
                            const typeMeals = getMealsByType(mealType);
                            const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

                            return (
                                <div key={mealType} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-white capitalize">{mealType}</h3>
                                        <span className="text-sm text-gray-400">{typeCalories} cal</span>
                                    </div>

                                    {typeMeals.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No meals logged</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {typeMeals.map((meal) => (
                                                <div key={meal.id} className="flex justify-between items-start p-3 bg-gray-800 rounded-lg border border-gray-700">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-white">{meal.name}</div>
                                                        <div className="text-sm text-gray-400 mt-1">
                                                            {meal.time} • {meal.calories} cal
                                                            {meal.protein && ` • P: ${meal.protein}g`}
                                                            {meal.carbs && ` • C: ${meal.carbs}g`}
                                                            {meal.fat && ` • F: ${meal.fat}g`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Water Intake */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-blue-400" />
                                Water Intake
                            </h3>

                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-white">
                                    {waterIntake}ml
                                </div>
                                <div className="text-sm text-gray-400">/ {goals.daily_water}ml</div>
                            </div>

                            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${(waterIntake / goals.daily_water) * 100}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => addWater(250)}
                                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors border border-gray-700"
                                >
                                    +250ml
                                </button>
                                <button
                                    onClick={() => addWater(500)}
                                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors border border-gray-700"
                                >
                                    +500ml
                                </button>
                                <button
                                    onClick={() => addWater(1000)}
                                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors border border-gray-700"
                                >
                                    +1L
                                </button>
                            </div>
                        </div>

                        {/* Macro Breakdown */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-400" />
                                Macro Progress
                            </h3>

                            <div className="space-y-4">
                                <MacroProgress label="Protein" current={totalProtein} goal={goals.daily_protein} color="bg-blue-500" />
                                <MacroProgress label="Carbs" current={totalCarbs} goal={goals.daily_carbs} color="bg-green-500" />
                                <MacroProgress label="Fat" current={totalFat} goal={goals.daily_fat} color="bg-yellow-500" />
                            </div>
                        </div>

                        {/* Calorie Progress */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Calorie Progress</h3>
                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-white">{totalCalories}</div>
                                <div className="text-gray-400">/ {goals.daily_calories} cal</div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all"
                                    style={{ width: `${Math.min((totalCalories / goals.daily_calories) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="mt-2 text-sm text-gray-400 text-center">
                                {goals.daily_calories - totalCalories > 0
                                    ? `${goals.daily_calories - totalCalories} cal remaining`
                                    : `${totalCalories - goals.daily_calories} cal over`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showMealModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Meal</h2>
                            <p className="text-gray-400 mb-4">Meal form would go here</p>
                            <button
                                onClick={() => setShowMealModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showGoalModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Set Nutrition Goals</h2>
                            <p className="text-gray-400 mb-4">Goals form would go here</p>
                            <button
                                onClick={() => setShowGoalModal(false)}
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