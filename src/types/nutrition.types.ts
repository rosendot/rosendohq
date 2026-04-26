// Nutrition Module Types

export type MealName = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  id: string;
  owner_id: string;
  name: string;
  serving_size: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
}

export interface Meal {
  id: string;
  owner_id: string;
  meal_date: string;
  name: MealName;
  created_at: string;
}

export interface MealEntry {
  id: string;
  owner_id: string;
  meal_id: string;
  food_item_id: string | null;
  custom_name: string | null;
  servings: number;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
}

export interface NutritionTarget {
  id: string;
  owner_id: string;
  start_date: string;
  end_date: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
}

export interface DailyMacros {
  owner_id: string;
  day: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  target_calories: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
}

export type FoodItemInsert = Omit<FoodItem, "id" | "owner_id" | "created_at">;
export type FoodItemUpdate = Partial<FoodItemInsert>;
export type MealInsert = Omit<Meal, "id" | "owner_id" | "created_at">;
export type MealUpdate = Partial<MealInsert>;
export type MealEntryInsert = Omit<MealEntry, "id" | "owner_id" | "created_at">;
export type MealEntryUpdate = Partial<Omit<MealEntryInsert, "meal_id">>;
export type NutritionTargetInsert = Omit<NutritionTarget, "id" | "owner_id" | "created_at">;
export type NutritionTargetUpdate = Partial<NutritionTargetInsert>;
