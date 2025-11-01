// src/types/database.types.ts

// Wishlist Item - The actual type from your database
export interface WishlistItem {
    id: string;
    owner_id: string;
    title: string;
    category: string | null;
    status: 'wanted' | 'considering' | 'on_hold' | 'purchased' | 'declined';
    url: string | null;
    notes: string | null;
    priority: number | null; // 1-5
    price_cents: number | null;
    currency: string | null;
    image_url: string | null;
    purchased_at: string | null;
    vendor: string | null;
    brand: string | null;
    color: string | null;
    size: string | null;
    created_at: string;
}

// Shopping List - The actual type from your database
export interface ShoppingList {
    id: string;
    owner_id: string;
    name: string;
    notes: string | null;
    created_at: string;
}

// Shopping List Item - The actual type from your database
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

// Insert and Update types
export type WishlistItemInsert = Omit<WishlistItem, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};
export type WishlistItemUpdate = Partial<Omit<WishlistItem, 'id' | 'created_at'>>;

export type ShoppingListInsert = Omit<ShoppingList, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};
export type ShoppingListUpdate = Partial<Omit<ShoppingList, 'id' | 'created_at'>>;

export type ShoppingListItemInsert = Omit<ShoppingListItem, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};
export type ShoppingListItemUpdate = Partial<Omit<ShoppingListItem, 'id' | 'created_at'>>;

// Database type (for Supabase type inference)
export interface Database {
    public: {
        Tables: {
            wishlist_item: {
                Row: WishlistItem;
                Insert: WishlistItemInsert;
                Update: WishlistItemUpdate;
            };
            shopping_list: {
                Row: ShoppingList;
                Insert: ShoppingListInsert;
                Update: ShoppingListUpdate;
            };
            shopping_list_item: {
                Row: ShoppingListItem;
                Insert: ShoppingListItemInsert;
                Update: ShoppingListItemUpdate;
            };
        };
    };
}