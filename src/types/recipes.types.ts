// Recipes Module Types

export type RecipeDifficulty = "easy" | "medium" | "hard";
export type RecipeStatus = "want_to_try" | "tried" | "regular_rotation";

export interface Recipe {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  cuisine: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  difficulty: RecipeDifficulty | null;
  source_url: string | null;
  notes: string | null;
  is_favorite: boolean;
  status: RecipeStatus;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  group_label: string | null;
  sort_order: number;
  is_optional: boolean;
  created_at: string;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
}

export interface RecipeCookLog {
  id: string;
  recipe_id: string;
  owner_id: string;
  cooked_on: string;
  servings_made: number | null;
  rating: number | null;
  notes: string | null;
  linked_meal_id: string | null;
  created_at: string;
}

export type RecipeInsert = Omit<Recipe, "id" | "owner_id" | "created_at" | "updated_at">;
export type RecipeUpdate = Partial<RecipeInsert>;
export type RecipeIngredientInsert = Omit<RecipeIngredient, "id" | "created_at">;
export type RecipeIngredientUpdate = Partial<Omit<RecipeIngredient, "id" | "recipe_id" | "created_at">>;
export type RecipeStepInsert = Omit<RecipeStep, "id" | "created_at">;
export type RecipeStepUpdate = Partial<Omit<RecipeStep, "id" | "recipe_id" | "created_at">>;
export type RecipeCookLogInsert = Omit<RecipeCookLog, "id" | "owner_id" | "created_at">;
export type RecipeCookLogUpdate = Partial<Omit<RecipeCookLog, "id" | "recipe_id" | "owner_id" | "created_at">>;
