export type WishlistItem = Database['public']['Tables']['wishlist_item']['Row'];
export type WishlistItemInsert = Database['public']['Tables']['wishlist_item']['Insert'];
export type WishlistItemUpdate = Database['public']['Tables']['wishlist_item']['Update'];

// The actual type from your database:
interface WishlistItem {
    id: string;
    owner_id: string;
    title: string;
    category: string | null;
    status: 'wanted' | 'considering' | 'on_hold' | 'purchased' | 'declined';
    url: string | null;
    notes: string | null;
    priority: number | null; // 1-5

    // NEW COLUMNS (after migration)
    price_cents: number | null;      // $19.99 = 1999
    currency: string | null;          // Default 'USD'
    image_url: string | null;         // Product image
    purchased_at: string | null;      // ISO timestamp
    vendor: string | null;            // Store name

    created_at: string;
}