// Habits & Goals Types
export interface Habit {
  id: string;
  owner_id: string;
  name: string;
  unit: string | null;
  target_value: number | null;
  is_active: boolean | null;
  category: string | null;
  period: string | null;
  sort_order: number | null;
  every_n_days: number;
  target_per_day: number | null;
  anchor_date: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  owner_id: string;
  habit_id: string;
  log_date: string;
  value: number;
  note: string | null;
  time_of_day: string | null;
  mood: number | null; // 1-5
  created_at: string;
}

export type GoalStatus = "active" | "completed" | "abandoned" | "on_hold";
export type GoalProgressSource = "habit" | "manual";

export interface Goal {
  id: string;
  owner_id: string;
  name: string;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: GoalStatus | null;
  category: string | null;
  progress_source: GoalProgressSource;
  habit_id: string | null;
  created_at: string;
}

export type HabitInsert = Omit<Habit, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type HabitUpdate = Partial<Omit<Habit, "id" | "owner_id" | "created_at">>;

export type HabitLogInsert = Omit<HabitLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type HabitLogUpdate = Partial<Omit<HabitLog, "id" | "owner_id" | "created_at">>;

export type GoalInsert = Omit<Goal, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type GoalUpdate = Partial<Omit<Goal, "id" | "owner_id" | "created_at">>;
