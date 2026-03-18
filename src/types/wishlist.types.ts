// Wishlist Item
export interface WishlistItem {
  id: string;
  owner_id: string;
  title: string;
  category: string | null;
  status: "wanted" | "considering" | "on_hold" | "purchased" | "declined";
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

export type WishlistItemInsert = Omit<WishlistItem, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type WishlistItemUpdate = Partial<Omit<WishlistItem, "id" | "created_at">>;
