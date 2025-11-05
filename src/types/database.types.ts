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

export type BookInsert = Omit<Book, 'id' | 'created_at' | 'updated_at'>;
export type BookUpdate = Partial<Omit<Book, 'id' | 'owner_id' | 'created_at'>>;

export type ReadingLogInsert = Omit<ReadingLog, 'id' | 'created_at'>;

export type VehicleStatus = 'active' | 'sold' | 'traded' | 'totaled';
export type FuelType = 'regular' | 'premium' | 'diesel' | 'electric';
export type MaintenancePriority = 'critical' | 'recommended' | 'optional';

export interface Vehicle {
    id: string;
    owner_id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    vin: string | null;
    nickname: string | null;
    license_plate: string | null;
    color: string | null;
    purchase_date: string | null;
    purchase_price_cents: number | null;
    purchase_mileage: number | null;
    status: VehicleStatus;
    insurance_provider: string | null;
    insurance_policy_number: string | null;
    insurance_renewal_date: string | null;
    insurance_premium_cents: number | null;
    created_at: string;
}

export interface OdometerLog {
    id: string;
    owner_id: string;
    vehicle_id: string;
    log_date: string;
    mileage: number;
    note: string | null;
    created_at: string;
}

export interface FuelLog {
    id: string;
    owner_id: string;
    vehicle_id: string;
    fill_date: string;
    odometer: number | null;
    gallons: number | null;
    total_cents: number | null;
    fuel_type: FuelType | null;
    is_full_tank: boolean;
    station_name: string | null;
    price_per_gallon_cents: number | null;
    trip_miles: number | null;
    mpg: number | null;
    created_at: string;
}

export interface MaintenanceTemplate {
    id: string;
    owner_id: string;
    name: string;
    interval_miles: number | null;
    interval_months: number | null;
    priority: MaintenancePriority;
    category: string | null;
    estimated_cost_cents: number | null;
    notes: string | null;
    created_at: string;
}

export interface MaintenanceRecord {
    id: string;
    owner_id: string;
    vehicle_id: string;
    template_id: string | null;
    item: string;
    service_date: string;
    mileage: number | null;
    cost_cents: number | null;
    vendor: string | null;
    notes: string | null;
    warranty_work: boolean;
    receipt_file_id: string | null;
    next_due_date: string | null;
    next_due_mileage: number | null;
    parts_cost_cents: number | null;
    labor_cost_cents: number | null;
    is_diy: boolean;
    created_at: string;
}

// Insert types for Car Tracker
export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type VehicleUpdate = Partial<Omit<Vehicle, 'id' | 'owner_id' | 'created_at'>>;

export type OdometerLogInsert = Omit<OdometerLog, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type FuelLogInsert = Omit<FuelLog, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type MaintenanceTemplateInsert = Omit<MaintenanceTemplate, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type MaintenanceTemplateUpdate = Partial<Omit<MaintenanceTemplate, 'id' | 'owner_id' | 'created_at'>>;

export type MaintenanceRecordInsert = Omit<MaintenanceRecord, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type MaintenanceRecordUpdate = Partial<Omit<MaintenanceRecord, 'id' | 'owner_id' | 'created_at'>>;

// Habits & Goals Types
export interface HabitSchedule {
    days: number[];
    target_per_day: number | null;
}

export interface Habit {
    id: string;
    owner_id: string;
    name: string;
    unit: string | null;
    target_value: number | null;
    is_active: boolean | null;
    category: string | null;
    time_of_day: string | null;
    sort_order: number | null;
    schedule: HabitSchedule | null;
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

export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'on_hold';
export type GoalProgressSource = 'habit' | 'manual';

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

export type HabitInsert = Omit<Habit, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type HabitUpdate = Partial<Omit<Habit, 'id' | 'owner_id' | 'created_at'>>;

export type HabitLogInsert = Omit<HabitLog, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type HabitLogUpdate = Partial<Omit<HabitLog, 'id' | 'owner_id' | 'created_at'>>;

export type GoalInsert = Omit<Goal, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type GoalUpdate = Partial<Omit<Goal, 'id' | 'owner_id' | 'created_at'>>;

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
            vehicle: {
                Row: Vehicle;
                Insert: VehicleInsert;
                Update: VehicleUpdate;
            };
            odometer_log: {
                Row: OdometerLog;
                Insert: OdometerLogInsert;
                Update: Partial<OdometerLogInsert>;
            };
            fuel_log: {
                Row: FuelLog;
                Insert: FuelLogInsert;
                Update: Partial<FuelLogInsert>;
            };
            maintenance_template: {
                Row: MaintenanceTemplate;
                Insert: MaintenanceTemplateInsert;
                Update: MaintenanceTemplateUpdate;
            };
            maintenance_record: {
                Row: MaintenanceRecord;
                Insert: MaintenanceRecordInsert;
                Update: MaintenanceRecordUpdate;
            };
            habit: {
                Row: Habit;
                Insert: HabitInsert;
                Update: HabitUpdate;
            };
            habit_log: {
                Row: HabitLog;
                Insert: HabitLogInsert;
                Update: HabitLogUpdate;
            };
            goal: {
                Row: Goal;
                Insert: GoalInsert;
                Update: GoalUpdate;
            };
        };
    };
}