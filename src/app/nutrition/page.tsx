// src/app/nutrition/page.tsx
'use client';

import { useState } from 'react';

interface FoodItem {
    id: string;
    name: string;
    serving_size?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    notes?: string;
    created_at: string;
}

interface Meal {
    id: string;
    meal_date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    created_at: string;
}

interface MealEntry {
    id: string;
    meal_id: string;
    food_item_id?: string;
    custom_name?: string;
    servings: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    created_at: string;
}

interface NutritionTarget {
    id: string;
    start_date: string;
    end_date?: string;
    calories_target?: number;
    protein_g_target?: number;
    carbs_g_target?: number;
    fat_g_target?: number;
    notes?: string;
    created_at: string;
}

// Mock data for development
const mockFoodItems: FoodItem[] = [
    {
        id: '1',
        name: 'Chicken Breast',
        serving_size: '100g',
        calories: 165,
        protein_g: 31,
        carbs_g: 0,
        fat_g: 3.6,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        name: 'Brown Rice',
        serving_size: '1 cup cooked',
        calories: 216,
        protein_g: 5,
        carbs_g: 45,
        fat_g: 1.8,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '3',
        name: 'Broccoli',
        serving_size: '1 cup',
        calories: 31,
        protein_g: 2.6,
        carbs_g: 6,
        fat_g: 0.3,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '4',
        name: 'Greek Yogurt',
        serving_size: '1 cup',
        calories: 100,
        protein_g: 17,
        carbs_g: 6,
        fat_g: 0.7,
        notes: 'Non-fat plain',
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '5',
        name: 'Almonds',
        serving_size: '1 oz (28g)',
        calories: 164,
        protein_g: 6,
        carbs_g: 6,
        fat_g: 14,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '6',
        name: 'Banana',
        serving_size: '1 medium',
        calories: 105,
        protein_g: 1.3,
        carbs_g: 27,
        fat_g: 0.4,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '7',
        name: 'Eggs',
        serving_size: '1 large',
        calories: 72,
        protein_g: 6,
        carbs_g: 0.4,
        fat_g: 5,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '8',
        name: 'Oatmeal',
        serving_size: '1/2 cup dry',
        calories: 150,
        protein_g: 5,
        carbs_g: 27,
        fat_g: 3,
        created_at: '2025-01-01T10:00:00Z'
    }
];

const mockMeals: Meal[] = [
    {
        id: '1',
        meal_date: '2025-01-05',
        meal_type: 'breakfast',
        created_at: '2025-01-05T08:00:00Z'
    },
    {
        id: '2',
        meal_date: '2025-01-05',
        meal_type: 'lunch',
        created_at: '2025-01-05T12:30:00Z'
    },
    {
        id: '3',
        meal_date: '2025-01-05',
        meal_type: 'dinner',
        created_at: '2025-01-05T19:00:00Z'
    },
    {
        id: '4',
        meal_date: '2025-01-05',
        meal_type: 'snack',
        created_at: '2025-01-05T15:00:00Z'
    }
];

const mockMealEntries: MealEntry[] = [
    // Breakfast
    {
        id: '1',
        meal_id: '1',
        food_item_id: '8',
        servings: 1,
        calories: 150,
        protein_g: 5,
        carbs_g: 27,
        fat_g: 3,
        created_at: '2025-01-05T08:00:00Z'
    },
    {
        id: '2',
        meal_id: '1',
        food_item_id: '6',
        servings: 1,
        calories: 105,
        protein_g: 1.3,
        carbs_g: 27,
        fat_g: 0.4,
        created_at: '2025-01-05T08:00:00Z'
    },
    {
        id: '3',
        meal_id: '1',
        food_item_id: '7',
        servings: 2,
        calories: 144,
        protein_g: 12,
        carbs_g: 0.8,
        fat_g: 10,
        created_at: '2025-01-05T08:00:00Z'
    },
    // Lunch
    {
        id: '4',
        meal_id: '2',
        food_item_id: '1',
        servings: 1.5,
        calories: 247.5,
        protein_g: 46.5,
        carbs_g: 0,
        fat_g: 5.4,
        created_at: '2025-01-05T12:30:00Z'
    },
    {
        id: '5',
        meal_id: '2',
        food_item_id: '2',
        servings: 1,
        calories: 216,
        protein_g: 5,
        carbs_g: 45,
        fat_g: 1.8,
        created_at: '2025-01-05T12:30:00Z'
    },
    {
        id: '6',
        meal_id: '2',
        food_item_id: '3',
        servings: 1,
        calories: 31,
        protein_g: 2.6,
        carbs_g: 6,
        fat_g: 0.3,
        created_at: '2025-01-05T12:30:00Z'
    },
    // Snack
    {
        id: '7',
        meal_id: '4',
        food_item_id: '4',
        servings: 1,
        calories: 100,
        protein_g: 17,
        carbs_g: 6,
        fat_g: 0.7,
        created_at: '2025-01-05T15:00:00Z'
    },
    {
        id: '8',
        meal_id: '4',
        food_item_id: '5',
        servings: 1,
        calories: 164,
        protein_g: 6,
        carbs_g: 6,
        fat_g: 14,
        created_at: '2025-01-05T15:00:00Z'
    },
    // Dinner
    {
        id: '9',
        meal_id: '3',
        food_item_id: '1',
        servings: 2,
        calories: 330,
        protein_g: 62,
        carbs_g: 0,
        fat_g: 7.2,
        created_at: '2025-01-05T19:00:00Z'
    },
    {
        id: '10',
        meal_id: '3',
        custom_name: 'Mixed Vegetables',
        servings: 2,
        calories: 100,
        protein_g: 4,
        carbs_g: 20,
        fat_g: 1,
        created_at: '2025-01-05T19:00:00Z'
    }
];

const mockTargets: NutritionTarget[] = [
    {
        id: '1',
        start_date: '2025-01-01',
        calories_target: 2000,
        protein_g_target: 150,
        carbs_g_target: 200,
        fat_g_target: 67,
        notes: 'Maintenance with high protein',
        created_at: '2025-01-01T10:00:00Z'
    }
];

const mealTypeColors = {
    breakfast: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900',
    lunch: 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-900',
    dinner: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-900',
    snack: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-900'
};

const mealTypeLabels = {
    breakfast: '🍳 Breakfast',
    lunch: '🥗 Lunch',
    dinner: '🍽️ Dinner',
    snack: '🍎 Snack'
};

const mealTypeOrder = ['breakfast', 'lunch', 'snack', 'dinner'];

export default function NutritionPage() {
    const [foodItems, setFoodItems] = useState<FoodItem[]>(mockFoodItems);
    const [meals, setMeals] = useState<Meal[]>(mockMeals);
    const [mealEntries, setMealEntries] = useState<MealEntry[]>(mockMealEntries);
    const [targets, setTargets] = useState<NutritionTarget[]>(mockTargets);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState<'today' | 'foods' | 'targets'>('today');
    const [isAddingFood, setIsAddingFood] = useState(false);
    const [isAddingMeal, setIsAddingMeal] = useState(false);
    const [isAddingTarget, setIsAddingTarget] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null);

    const [newFood, setNewFood] = useState({
        name: '',
        serving_size: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        notes: ''
    });

    const [newMealEntry, setNewMealEntry] = useState({
        food_item_id: '',
        custom_name: '',
        servings: '1',
        custom_calories: '',
        custom_protein: '',
        custom_carbs: '',
        custom_fat: ''
    });

    const [newTarget, setNewTarget] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        calories_target: '',
        protein_g_target: '',
        carbs_g_target: '',
        fat_g_target: '',
        notes: ''
    });

    // Get current target
    const currentTarget = targets
        .filter(t => {
            const start = new Date(t.start_date);
            const end = t.end_date ? new Date(t.end_date) : null;
            const current = new Date(selectedDate);
            return current >= start && (!end || current <= end);
        })
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];

    // Get meals for selected date
    const todaysMeals = meals.filter(m => m.meal_date === selectedDate);

    // Calculate daily totals
    const getDailyTotals = (date: string) => {
        const dayMeals = meals.filter(m => m.meal_date === date);
        const dayEntries = mealEntries.filter(e =>
            dayMeals.some(m => m.id === e.meal_id)
        );

        return {
            calories: dayEntries.reduce((sum, e) => sum + (e.calories || 0), 0),
            protein: dayEntries.reduce((sum, e) => sum + (e.protein_g || 0), 0),
            carbs: dayEntries.reduce((sum, e) => sum + (e.carbs_g || 0), 0),
            fat: dayEntries.reduce((sum, e) => sum + (e.fat_g || 0), 0)
        };
    };

    const dailyTotals = getDailyTotals(selectedDate);

    // Get meal entries for a specific meal
    const getMealEntries = (mealId: string) => {
        return mealEntries.filter(e => e.meal_id === mealId);
    };

    // Get meal totals
    const getMealTotals = (mealId: string) => {
        const entries = getMealEntries(mealId);
        return {
            calories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
            protein: entries.reduce((sum, e) => sum + (e.protein_g || 0), 0),
            carbs: entries.reduce((sum, e) => sum + (e.carbs_g || 0), 0),
            fat: entries.reduce((sum, e) => sum + (e.fat_g || 0), 0)
        };
    };

    // Get or create meal
    const getOrCreateMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
        const existing = todaysMeals.find(m => m.meal_type === mealType);
        if (existing) return existing;

        const newMeal: Meal = {
            id: Date.now().toString(),
            meal_date: selectedDate,
            meal_type: mealType,
            created_at: new Date().toISOString()
        };

        setMeals([...meals, newMeal]);
        return newMeal;
    };

    // Add food item
    const addNewFood = () => {
        if (!newFood.name.trim()) return;

        const food: FoodItem = {
            id: Date.now().toString(),
            name: newFood.name.trim(),
            serving_size: newFood.serving_size.trim() || undefined,
            calories: newFood.calories ? Number(newFood.calories) : undefined,
            protein_g: newFood.protein_g ? Number(newFood.protein_g) : undefined,
            carbs_g: newFood.carbs_g ? Number(newFood.carbs_g) : undefined,
            fat_g: newFood.fat_g ? Number(newFood.fat_g) : undefined,
            notes: newFood.notes.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setFoodItems([food, ...foodItems]);
        setNewFood({
            name: '',
            serving_size: '',
            calories: '',
            protein_g: '',
            carbs_g: '',
            fat_g: '',
            notes: ''
        });
        setIsAddingFood(false);
    };

    // Add meal entry
    const addMealEntry = () => {
        if (!selectedMealType || (!newMealEntry.food_item_id && !newMealEntry.custom_name.trim())) {
            return;
        }

        const meal = getOrCreateMeal(selectedMealType);
        const food = newMealEntry.food_item_id
            ? foodItems.find(f => f.id === newMealEntry.food_item_id)
            : null;
        const servings = Number(newMealEntry.servings);

        const entry: MealEntry = {
            id: Date.now().toString(),
            meal_id: meal.id,
            food_item_id: newMealEntry.food_item_id || undefined,
            custom_name: newMealEntry.custom_name.trim() || undefined,
            servings: servings,
            calories: food
                ? (food.calories || 0) * servings
                : newMealEntry.custom_calories
                    ? Number(newMealEntry.custom_calories)
                    : undefined,
            protein_g: food
                ? (food.protein_g || 0) * servings
                : newMealEntry.custom_protein
                    ? Number(newMealEntry.custom_protein)
                    : undefined,
            carbs_g: food
                ? (food.carbs_g || 0) * servings
                : newMealEntry.custom_carbs
                    ? Number(newMealEntry.custom_carbs)
                    : undefined,
            fat_g: food
                ? (food.fat_g || 0) * servings
                : newMealEntry.custom_fat
                    ? Number(newMealEntry.custom_fat)
                    : undefined,
            created_at: new Date().toISOString()
        };

        setMealEntries([...mealEntries, entry]);
        setNewMealEntry({
            food_item_id: '',
            custom_name: '',
            servings: '1',
            custom_calories: '',
            custom_protein: '',
            custom_carbs: '',
            custom_fat: ''
        });
        setIsAddingMeal(false);
        setSelectedMealType(null);
    };

    // Add nutrition target
    const addNewTarget = () => {
        if (!newTarget.start_date) return;

        const target: NutritionTarget = {
            id: Date.now().toString(),
            start_date: newTarget.start_date,
            end_date: newTarget.end_date || undefined,
            calories_target: newTarget.calories_target ? Number(newTarget.calories_target) : undefined,
            protein_g_target: newTarget.protein_g_target ? Number(newTarget.protein_g_target) : undefined,
            carbs_g_target: newTarget.carbs_g_target ? Number(newTarget.carbs_g_target) : undefined,
            fat_g_target: newTarget.fat_g_target ? Number(newTarget.fat_g_target) : undefined,
            notes: newTarget.notes.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setTargets([target, ...targets]);
        setNewTarget({
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            calories_target: '',
            protein_g_target: '',
            carbs_g_target: '',
            fat_g_target: '',
            notes: ''
        });
        setIsAddingTarget(false);
    };

    const deleteFood = (foodId: string) => {
        if (confirm('Delete this food item?')) {
            setFoodItems(foodItems.filter(f => f.id !== foodId));
        }
    };

    const deleteMealEntry = (entryId: string) => {
        if (confirm('Delete this meal entry?')) {
            setMealEntries(mealEntries.filter(e => e.id !== entryId));
        }
    };

    const deleteTarget = (targetId: string) => {
        if (confirm('Delete this nutrition target?')) {
            setTargets(targets.filter(t => t.id !== targetId));
        }
    };

    const getPercentage = (actual: number, target?: number) => {
        if (!target) return 0;
        return Math.min(100, Math.round((actual / target) * 100));
    };

    const getProgressColor = (percentage: number) => {
        if (percentage < 80) return 'bg-blue-500';
        if (percentage < 95) return 'bg-emerald-500';
        if (percentage <= 105) return 'bg-green-500';
        if (percentage <= 120) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Nutrition Tracker
                    </h1>
                    <p className="text-gray-600">Track your meals, macros, and nutrition goals</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'today'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Today's Meals
                        </button>
                        <button
                            onClick={() => setActiveTab('foods')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'foods'
                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Food Database ({foodItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('targets')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'targets'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Targets
                        </button>
                    </div>
                </div>

                {/* Today's Meals Tab */}
                {activeTab === 'today' && (
                    <div className="space-y-6">
                        {/* Date Selector */}
                        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tracking Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Daily Summary vs Target */}
                        {currentTarget && (
                            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Progress</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Calories */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Calories</span>
                                            <span className="text-sm text-gray-600">
                                                {getPercentage(dailyTotals.calories, currentTarget.calories_target)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {Math.round(dailyTotals.calories)}
                                            <span className="text-sm text-gray-500">
                                                {' '}/ {currentTarget.calories_target}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                    getPercentage(dailyTotals.calories, currentTarget.calories_target)
                                                )}`}
                                                style={{
                                                    width: `${getPercentage(dailyTotals.calories, currentTarget.calories_target)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {currentTarget.calories_target! - Math.round(dailyTotals.calories)} remaining
                                        </div>
                                    </div>

                                    {/* Protein */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Protein</span>
                                            <span className="text-sm text-gray-600">
                                                {getPercentage(dailyTotals.protein, currentTarget.protein_g_target)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {Math.round(dailyTotals.protein)}g
                                            <span className="text-sm text-gray-500">
                                                {' '}/ {currentTarget.protein_g_target}g
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                    getPercentage(dailyTotals.protein, currentTarget.protein_g_target)
                                                )}`}
                                                style={{
                                                    width: `${getPercentage(dailyTotals.protein, currentTarget.protein_g_target)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {currentTarget.protein_g_target! - Math.round(dailyTotals.protein)}g remaining
                                        </div>
                                    </div>

                                    {/* Carbs */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Carbs</span>
                                            <span className="text-sm text-gray-600">
                                                {getPercentage(dailyTotals.carbs, currentTarget.carbs_g_target)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {Math.round(dailyTotals.carbs)}g
                                            <span className="text-sm text-gray-500">
                                                {' '}/ {currentTarget.carbs_g_target}g
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                    getPercentage(dailyTotals.carbs, currentTarget.carbs_g_target)
                                                )}`}
                                                style={{
                                                    width: `${getPercentage(dailyTotals.carbs, currentTarget.carbs_g_target)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {currentTarget.carbs_g_target! - Math.round(dailyTotals.carbs)}g remaining
                                        </div>
                                    </div>

                                    {/* Fat */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Fat</span>
                                            <span className="text-sm text-gray-600">
                                                {getPercentage(dailyTotals.fat, currentTarget.fat_g_target)}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                            {Math.round(dailyTotals.fat)}g
                                            <span className="text-sm text-gray-500">
                                                {' '}/ {currentTarget.fat_g_target}g
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                                    getPercentage(dailyTotals.fat, currentTarget.fat_g_target)
                                                )}`}
                                                style={{
                                                    width: `${getPercentage(dailyTotals.fat, currentTarget.fat_g_target)}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {currentTarget.fat_g_target! - Math.round(dailyTotals.fat)}g remaining
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Meals */}
                        <div className="space-y-4">
                            {mealTypeOrder.map(mealType => {
                                const meal = todaysMeals.find(m => m.meal_type === mealType);
                                const entries = meal ? getMealEntries(meal.id) : [];
                                const totals = meal ? getMealTotals(meal.id) : { calories: 0, protein: 0, carbs: 0, fat: 0 };

                                return (
                                    <div
                                        key={mealType}
                                        className={`rounded-xl border p-6 ${mealTypeColors[mealType as keyof typeof mealTypeColors]}`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold">
                                                    {mealTypeLabels[mealType as keyof typeof mealTypeLabels]}
                                                </h3>
                                                {entries.length > 0 && (
                                                    <div className="text-sm mt-1">
                                                        {Math.round(totals.calories)} cal • {Math.round(totals.protein)}g protein • {Math.round(totals.carbs)}g carbs • {Math.round(totals.fat)}g fat
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedMealType(mealType as any);
                                                    setIsAddingMeal(true);
                                                }}
                                                className="px-4 py-2 bg-white/60 hover:bg-white/80 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                + Add Food
                                            </button>
                                        </div>

                                        {entries.length > 0 ? (
                                            <div className="space-y-2">
                                                {entries.map(entry => {
                                                    const food = entry.food_item_id
                                                        ? foodItems.find(f => f.id === entry.food_item_id)
                                                        : null;
                                                    const displayName = food ? food.name : entry.custom_name;

                                                    return (
                                                        <div
                                                            key={entry.id}
                                                            className="bg-white/60 rounded-lg p-3 flex items-center justify-between"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {displayName}
                                                                    {entry.servings !== 1 && (
                                                                        <span className="text-sm text-gray-600 ml-2">
                                                                            × {entry.servings}
                                                                            {food?.serving_size && ` ${food.serving_size}`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-700">
                                                                    {Math.round(entry.calories || 0)} cal • {Math.round(entry.protein_g || 0)}g P • {Math.round(entry.carbs_g || 0)}g C • {Math.round(entry.fat_g || 0)}g F
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteMealEntry(entry.id)}
                                                                className="text-red-500 hover:text-red-700 ml-4 transition-colors"
                                                                title="Delete"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 italic">No food logged yet</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Meal Entry Modal */}
                        {isAddingMeal && selectedMealType && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Add to {mealTypeLabels[selectedMealType]}
                                        </h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Select Food Item
                                                </label>
                                                <select
                                                    value={newMealEntry.food_item_id}
                                                    onChange={(e) =>
                                                        setNewMealEntry({
                                                            ...newMealEntry,
                                                            food_item_id: e.target.value,
                                                            custom_name: ''
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="">-- Select from database or add custom --</option>
                                                    {foodItems.map(food => (
                                                        <option key={food.id} value={food.id}>
                                                            {food.name} ({food.serving_size}) - {food.calories} cal
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {!newMealEntry.food_item_id && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Custom Food Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newMealEntry.custom_name}
                                                            onChange={(e) =>
                                                                setNewMealEntry({
                                                                    ...newMealEntry,
                                                                    custom_name: e.target.value
                                                                })
                                                            }
                                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            placeholder="Enter food name"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Calories
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={newMealEntry.custom_calories}
                                                                onChange={(e) =>
                                                                    setNewMealEntry({
                                                                        ...newMealEntry,
                                                                        custom_calories: e.target.value
                                                                    })
                                                                }
                                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Protein (g)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={newMealEntry.custom_protein}
                                                                onChange={(e) =>
                                                                    setNewMealEntry({
                                                                        ...newMealEntry,
                                                                        custom_protein: e.target.value
                                                                    })
                                                                }
                                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Carbs (g)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={newMealEntry.custom_carbs}
                                                                onChange={(e) =>
                                                                    setNewMealEntry({
                                                                        ...newMealEntry,
                                                                        custom_carbs: e.target.value
                                                                    })
                                                                }
                                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Fat (g)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={newMealEntry.custom_fat}
                                                                onChange={(e) =>
                                                                    setNewMealEntry({
                                                                        ...newMealEntry,
                                                                        custom_fat: e.target.value
                                                                    })
                                                                }
                                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                min="0"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Servings
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newMealEntry.servings}
                                                    onChange={(e) =>
                                                        setNewMealEntry({
                                                            ...newMealEntry,
                                                            servings: e.target.value
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    min="0.1"
                                                    step="0.5"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={addMealEntry}
                                                disabled={
                                                    !newMealEntry.food_item_id && !newMealEntry.custom_name.trim()
                                                }
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md font-medium"
                                            >
                                                Add to Meal
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingMeal(false);
                                                    setSelectedMealType(null);
                                                    setNewMealEntry({
                                                        food_item_id: '',
                                                        custom_name: '',
                                                        servings: '1',
                                                        custom_calories: '',
                                                        custom_protein: '',
                                                        custom_carbs: '',
                                                        custom_fat: ''
                                                    });
                                                }}
                                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Food Database Tab */}
                {activeTab === 'foods' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingFood(true)}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                            >
                                Add Food Item
                            </button>
                        </div>

                        {/* Add Food Form */}
                        {isAddingFood && (
                            <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Food Item</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Food Name*
                                        </label>
                                        <input
                                            type="text"
                                            value={newFood.name}
                                            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            placeholder="e.g., Chicken Breast, Brown Rice"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Serving Size
                                        </label>
                                        <input
                                            type="text"
                                            value={newFood.serving_size}
                                            onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            placeholder="e.g., 100g, 1 cup, 1 medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Calories
                                        </label>
                                        <input
                                            type="number"
                                            value={newFood.calories}
                                            onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Protein (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newFood.protein_g}
                                            onChange={(e) => setNewFood({ ...newFood, protein_g: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Carbs (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newFood.carbs_g}
                                            onChange={(e) => setNewFood({ ...newFood, carbs_g: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fat (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newFood.fat_g}
                                            onChange={(e) => setNewFood({ ...newFood, fat_g: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={newFood.notes}
                                            onChange={(e) => setNewFood({ ...newFood, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            rows={2}
                                            placeholder="Brand, preparation notes, etc."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={addNewFood}
                                        disabled={!newFood.name.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                    >
                                        Add Food
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingFood(false);
                                            setNewFood({
                                                name: '',
                                                serving_size: '',
                                                calories: '',
                                                protein_g: '',
                                                carbs_g: '',
                                                fat_g: '',
                                                notes: ''
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Food Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {foodItems.map(food => (
                                <div
                                    key={food.id}
                                    className="bg-white rounded-lg border border-violet-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg text-gray-900">{food.name}</h3>
                                        <button
                                            onClick={() => deleteFood(food.id)}
                                            className="text-red-500 hover:text-red-700 text-sm transition-colors"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {food.serving_size && (
                                        <div className="text-sm text-gray-600 mb-2">Serving: {food.serving_size}</div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-blue-50 rounded p-2">
                                            <div className="text-blue-600 font-medium">Calories</div>
                                            <div className="text-gray-900">{food.calories || '-'}</div>
                                        </div>
                                        <div className="bg-red-50 rounded p-2">
                                            <div className="text-red-600 font-medium">Protein</div>
                                            <div className="text-gray-900">{food.protein_g || '-'}g</div>
                                        </div>
                                        <div className="bg-yellow-50 rounded p-2">
                                            <div className="text-yellow-600 font-medium">Carbs</div>
                                            <div className="text-gray-900">{food.carbs_g || '-'}g</div>
                                        </div>
                                        <div className="bg-purple-50 rounded p-2">
                                            <div className="text-purple-600 font-medium">Fat</div>
                                            <div className="text-gray-900">{food.fat_g || '-'}g</div>
                                        </div>
                                    </div>
                                    {food.notes && (
                                        <div className="text-sm text-gray-600 italic mt-2 bg-gray-50 p-2 rounded">
                                            {food.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {foodItems.length === 0 && (
                            <div className="text-center text-gray-500 py-12">
                                <p className="text-lg">No food items yet.</p>
                                <p className="text-sm">Add your first food to the database!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Targets Tab */}
                {activeTab === 'targets' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingTarget(true)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                            >
                                Add Nutrition Target
                            </button>
                        </div>

                        {/* Add Target Form */}
                        {isAddingTarget && (
                            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Nutrition Target</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date*
                                        </label>
                                        <input
                                            type="date"
                                            value={newTarget.start_date}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, start_date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newTarget.end_date}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, end_date: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Calories Target
                                        </label>
                                        <input
                                            type="number"
                                            value={newTarget.calories_target}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, calories_target: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Protein Target (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newTarget.protein_g_target}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, protein_g_target: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Carbs Target (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newTarget.carbs_g_target}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, carbs_g_target: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fat Target (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={newTarget.fat_g_target}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, fat_g_target: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={newTarget.notes}
                                            onChange={(e) =>
                                                setNewTarget({ ...newTarget, notes: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                            placeholder="Goal description, dietary approach, etc."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={addNewTarget}
                                        disabled={!newTarget.start_date}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                    >
                                        Add Target
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingTarget(false);
                                            setNewTarget({
                                                start_date: new Date().toISOString().split('T')[0],
                                                end_date: '',
                                                calories_target: '',
                                                protein_g_target: '',
                                                carbs_g_target: '',
                                                fat_g_target: '',
                                                notes: ''
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Targets List */}
                        <div className="space-y-4">
                            {targets
                                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                                .map(target => {
                                    const isActive = target === currentTarget;

                                    return (
                                        <div
                                            key={target.id}
                                            className={`bg-white rounded-lg border p-6 ${isActive
                                                ? 'border-blue-300 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100'
                                                : 'border-gray-200 hover:shadow-md'
                                                } transition-all duration-200`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            Nutrition Target
                                                        </h3>
                                                        {isActive && (
                                                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(target.start_date).toLocaleDateString()}
                                                        {target.end_date && (
                                                            <> - {new Date(target.end_date).toLocaleDateString()}</>
                                                        )}
                                                        {!target.end_date && <> - Ongoing</>}
                                                    </div>
                                                    {target.notes && (
                                                        <div className="text-sm text-gray-700 italic mt-2">
                                                            {target.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteTarget(target.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                    <div className="text-sm font-medium text-blue-700 mb-1">
                                                        Calories
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {target.calories_target || '-'}
                                                    </div>
                                                </div>
                                                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                                    <div className="text-sm font-medium text-red-700 mb-1">Protein</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {target.protein_g_target || '-'}
                                                        <span className="text-sm text-gray-600">g</span>
                                                    </div>
                                                </div>
                                                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                                    <div className="text-sm font-medium text-yellow-700 mb-1">Carbs</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {target.carbs_g_target || '-'}
                                                        <span className="text-sm text-gray-600">g</span>
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                                    <div className="text-sm font-medium text-purple-700 mb-1">Fat</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {target.fat_g_target || '-'}
                                                        <span className="text-sm text-gray-600">g</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {targets.length === 0 && (
                            <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                                <p className="text-lg">No nutrition targets yet.</p>
                                <p className="text-sm">Add your first target to start tracking!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}