// Travel Types
export type TripStatus = "planning" | "upcoming" | "active" | "completed";
export type ItineraryType =
  | "flight"
  | "accommodation"
  | "activity"
  | "transport"
  | "dining"
  | "todo"
  | "other";

export interface Trip {
  id: string;
  owner_id: string;
  name: string;
  destination: string | null;
  start_date: string;
  end_date: string;
  status: TripStatus;
  notes: string | null;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  owner_id: string;
  trip_id: string;
  at: string;
  type: ItineraryType;
  title: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface TripEntry {
  id: string;
  owner_id: string;
  trip_id: string;
  entry_date: string;
  content_md: string | null;
  created_at: string;
}

export interface TripPackingItem {
  id: string;
  owner_id: string;
  trip_id: string;
  item: string;
  qty: number | null;
  packed: boolean;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface TripExpense {
  id: string;
  owner_id: string;
  trip_id: string;
  description: string;
  amount_cents: number;
  currency: string;
  category: string | null;
  expense_date: string;
  notes: string | null;
  created_at: string;
}

export interface TripDocument {
  id: string;
  owner_id: string;
  trip_id: string;
  name: string;
  url: string | null;
  doc_type: string;
  notes: string | null;
  created_at: string;
}

export type TripInsert = Omit<Trip, "id" | "owner_id" | "created_at">;
export type TripUpdate = Partial<TripInsert>;

export type ItineraryItemInsert = Omit<ItineraryItem, "id" | "owner_id" | "created_at">;
export type ItineraryItemUpdate = Partial<ItineraryItemInsert>;

export type TripEntryInsert = Omit<TripEntry, "id" | "owner_id" | "created_at">;
export type TripEntryUpdate = Partial<TripEntryInsert>;

export type TripPackingItemInsert = Omit<TripPackingItem, "id" | "owner_id" | "created_at">;
export type TripPackingItemUpdate = Partial<TripPackingItemInsert>;

export type TripExpenseInsert = Omit<TripExpense, "id" | "owner_id" | "created_at">;
export type TripExpenseUpdate = Partial<TripExpenseInsert>;

export type TripDocumentInsert = Omit<TripDocument, "id" | "owner_id" | "created_at">;
export type TripDocumentUpdate = Partial<TripDocumentInsert>;
