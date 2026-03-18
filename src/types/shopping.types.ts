// Shopping List
export interface ShoppingList {
  id: string;
  owner_id: string;
  name: string;
  notes: string | null;
  created_at: string;
}

// Shopping List Item
export interface ShoppingListItem {
  id: string;
  owner_id: string;
  list_id: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  needed_by: string | null;
  priority: number | null; // 1-5
  notes: string | null;
  is_done: boolean;
  created_at: string;
  category: string | null;
  store_preference: string | null;
  aisle: string | null;
  last_purchased_at: string | null;
}

export type ShoppingListInsert = Omit<ShoppingList, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type ShoppingListUpdate = Partial<Omit<ShoppingList, "id" | "created_at">>;

export type ShoppingListItemInsert = Omit<ShoppingListItem, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type ShoppingListItemUpdate = Partial<Omit<ShoppingListItem, "id" | "created_at">>;
