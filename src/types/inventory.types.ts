// Inventory Types
export interface InventoryItem {
  id: string;
  owner_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  location: string | null;
  category: string | null;
  purchase_price_cents: number | null;
  acquired_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InventoryItemInsert = Omit<
  InventoryItem,
  "id" | "owner_id" | "created_at" | "updated_at"
>;
export type InventoryItemUpdate = Partial<Omit<InventoryItem, "id" | "owner_id" | "created_at">>;
