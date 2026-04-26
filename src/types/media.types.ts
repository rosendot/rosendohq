// Media types
export type MediaType = "anime" | "show" | "movie";
export type MediaStatus = "planned" | "watching" | "completed" | "on_hold" | "dropped";

// Media Item
export interface MediaItem {
  id: string;
  owner_id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  total_episodes: number | null;
  notes: string | null;
  platform: string | null;
  current_episode: number | null;
  rating: number | null; // 1-5
  started_at: string | null;
  completed_at: string | null;
  current_season: number | null;
  total_seasons: number | null;
  episodes_in_season: number | null;
  created_at: string;
  updated_at: string;
}

// Media Log
export interface MediaLog {
  id: string;
  owner_id: string;
  media_item_id: string;
  log_date: string;
  progress: number;
  note: string | null;
  created_at: string;
}

export type MediaItemInsert = Omit<MediaItem, "id" | "owner_id" | "created_at" | "updated_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type MediaItemUpdate = Partial<Omit<MediaItem, "id" | "owner_id" | "created_at">>;

export type MediaLogInsert = Omit<MediaLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// Media Reminder
export interface MediaReminder {
  id: string;
  owner_id: string;
  media_item_id: string;
  day_of_week: number; // 0=Sun .. 6=Sat
  time_of_day: string; // "HH:MM" or "HH:MM:SS"
  timezone: string; // IANA tz, e.g. "America/New_York"
  is_active: boolean;
  last_sent_on: string | null; // YYYY-MM-DD in the row's timezone
  created_at: string;
  updated_at: string;
}

export type MediaReminderInsert = Omit<
  MediaReminder,
  "id" | "owner_id" | "created_at" | "updated_at" | "last_sent_on"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  last_sent_on?: string | null;
};

export type MediaReminderUpdate = Partial<
  Omit<MediaReminder, "id" | "owner_id" | "created_at">
>;
