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

// Media types from database enum
export type MediaType = 'anime' | 'show' | 'movie';
export type MediaStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped';

// Media Item - matches database schema
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
    created_at: string;
    updated_at: string;
}

// Media Log - matches database schema
export interface MediaLog {
    id: string;
    owner_id: string;
    media_item_id: string;
    log_date: string;
    progress: number;
    note: string | null;
    created_at: string;
}

// Insert and Update types
export type MediaItemInsert = Omit<MediaItem, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
};

export type MediaItemUpdate = Partial<Omit<MediaItem, 'id' | 'owner_id' | 'created_at'>>;

export type MediaLogInsert = Omit<MediaLog, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

// Reading Tracker Types
export type BookStatus = 'planned' | 'reading' | 'finished' | 'on_hold' | 'dropped';
export type BookFormat = 'physical' | 'ebook' | 'audiobook';

export interface Book {
    id: string;
    owner_id: string;
    title: string;
    author: string | null;
    status: BookStatus;
    started_at: string | null;
    finished_at: string | null;
    rating: number | null;
    current_page: number | null;
    total_pages: number | null;
    format: BookFormat | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ReadingLog {
    id: string;
    owner_id: string;
    book_id: string;
    log_date: string;
    pages: number | null;
    minutes: number | null;
    note: string | null;
    created_at: string;
}

export interface Highlight {
    id: string;
    owner_id: string;
    book_id: string;
    location: string | null;
    text: string;
    created_at: string;
}

export type BookInsert = Omit<Book, 'id' | 'created_at' | 'updated_at'>;
export type BookUpdate = Partial<Omit<Book, 'id' | 'owner_id' | 'created_at'>>;

export type ReadingLogInsert = Omit<ReadingLog, 'id' | 'created_at'>;
export type HighlightInsert = Omit<Highlight, 'id' | 'created_at'>;

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
            media_item: {
                Row: MediaItem;
                Insert: MediaItemInsert;
                Update: MediaItemUpdate;
            };
            media_log: {
                Row: MediaLog;
                Insert: MediaLogInsert;
                Update: Partial<MediaLogInsert>;
            };
            book: {
                Row: Book;
                Insert: BookInsert;
                Update: BookUpdate;
            };
            reading_log: {
                Row: ReadingLog;
                Insert: ReadingLogInsert;
                Update: Partial<ReadingLogInsert>;
            };
            highlight: {
                Row: Highlight;
                Insert: HighlightInsert;
                Update: Partial<HighlightInsert>;
            };
        };
    };
}