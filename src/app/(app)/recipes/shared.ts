import type { RecipeStatus } from "@/types/recipes.types";

export const STATUS_COLORS: Record<RecipeStatus, string> = {
  want_to_try: "bg-blue-900/50 text-blue-400",
  tried: "bg-violet-900/50 text-violet-400",
  regular_rotation: "bg-emerald-900/50 text-emerald-400",
};
