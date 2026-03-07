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
    current_season: number | null;
    total_seasons: number | null;
    episodes_in_season: number | null;
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
export type MediaItemInsert = Omit<MediaItem, 'id' | 'owner_id' | 'created_at' | 'updated_at'> & {
    id?: string;
    owner_id?: string;
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
    highlights: Array<{ location: string; text: string; created_at: string }> | null;
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

export type ReadingLogInsert = Omit<ReadingLog, 'id' | 'owner_id' | 'created_at'> & { owner_id?: string };
export type ReadingLogUpdate = Partial<Omit<ReadingLog, 'id' | 'owner_id' | 'created_at'>>;

export interface Highlight {
    location: string;
    text: string;
    created_at: string;
}

export type VehicleStatus = 'active' | 'sold' | 'traded' | 'totaled';
export type FuelType = 'regular' | 'premium' | 'diesel' | 'electric';
export type MaintenancePriority = 'critical' | 'recommended' | 'optional';
export type MaintenanceRecordType = 'maintenance' | 'incident' | 'ticket' | 'toll' | 'parking' | 'other';
export type TireStatus = 'active' | 'removed' | 'sold' | 'disposed';

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
    // Registration fields
    registration_expiration_date: string | null;
    registration_state: string | null;
    registration_cost_cents: number | null;
    // Inspection/Emissions fields
    inspection_expiration_date: string | null;
    emissions_expiration_date: string | null;
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
    // New fields for record types
    record_type: MaintenanceRecordType;
    incident_date: string | null;
    insurance_claim_number: string | null;
    at_fault: boolean | null;
    created_at: string;
}

// Tire Set for tracking tires
export interface TireSet {
    id: string;
    owner_id: string;
    vehicle_id: string;
    brand: string | null;
    model: string | null;
    size: string | null;
    purchase_date: string | null;
    purchase_price_cents: number | null;
    mileage_installed: number | null;
    mileage_removed: number | null;
    tread_depth_initial: number | null;
    tread_depth_current: number | null;
    position: string | null; // 'all', 'front', 'rear'
    status: TireStatus;
    notes: string | null;
    created_at: string;
}

// Insert types for Car Tracker
export type VehicleInsert = Omit<Vehicle, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
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

export type TireSetInsert = Omit<TireSet, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type TireSetUpdate = Partial<Omit<TireSet, 'id' | 'owner_id' | 'created_at'>>;

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

// ============================================
// TRAVEL TYPES
// ============================================

export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed';
export type ItineraryType = 'flight' | 'accommodation' | 'activity' | 'transport' | 'dining' | 'todo' | 'other';

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

export type TripInsert = Omit<Trip, 'id' | 'owner_id' | 'created_at'>;
export type TripUpdate = Partial<TripInsert>;

export type ItineraryItemInsert = Omit<ItineraryItem, 'id' | 'owner_id' | 'created_at'>;
export type ItineraryItemUpdate = Partial<ItineraryItemInsert>;

export type TripEntryInsert = Omit<TripEntry, 'id' | 'owner_id' | 'created_at'>;
export type TripEntryUpdate = Partial<TripEntryInsert>;

export type TripPackingItemInsert = Omit<TripPackingItem, 'id' | 'owner_id' | 'created_at'>;
export type TripPackingItemUpdate = Partial<TripPackingItemInsert>;

export type TripExpenseInsert = Omit<TripExpense, 'id' | 'owner_id' | 'created_at'>;
export type TripExpenseUpdate = Partial<TripExpenseInsert>;

export type TripDocumentInsert = Omit<TripDocument, 'id' | 'owner_id' | 'created_at'>;
export type TripDocumentUpdate = Partial<TripDocumentInsert>;

// ============================================
// NOTES TYPES
// ============================================

export type NoteCategory = 'reference' | 'idea' | 'guide' | 'journal' | 'finance' | 'health' | 'work' | 'personal' | 'archive' | 'other';

export interface Note {
    id: string;
    owner_id: string;
    title: string;
    content_md: string | null;
    tags: string[];
    category: NoteCategory;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

export type NoteInsert = Omit<Note, 'id' | 'owner_id' | 'created_at' | 'updated_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type NoteUpdate = Partial<Omit<Note, 'id' | 'owner_id' | 'created_at'>>;

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
            tire_set: {
                Row: TireSet;
                Insert: TireSetInsert;
                Update: TireSetUpdate;
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
            note: {
                Row: Note;
                Insert: NoteInsert;
                Update: NoteUpdate;
            };
        };
    };
}

// ============================================
// HOME TRACKER TYPES
// ============================================

// Home Tracker Enums
export type HomeMaintenanceStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
export type HomeProjectStatus = 'planning' | 'budgeting' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type HomeProjectTaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
export type HomeUtilityType = 'electricity' | 'gas' | 'water' | 'sewer' | 'trash' | 'internet' | 'phone' | 'cable' | 'hoa' | 'security' | 'other';
export type HomeDocumentType = 'warranty' | 'manual' | 'receipt' | 'contract' | 'insurance' | 'inspection' | 'permit' | 'hoa' | 'deed' | 'mortgage' | 'tax' | 'photo' | 'other';

// Home Property
export interface HomeProperty {
    id: string;
    owner_id: string;
    name: string;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    notes: string | null;
    created_at: string;
}

export type HomePropertyInsert = Omit<HomeProperty, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomePropertyUpdate = Partial<Omit<HomeProperty, 'id' | 'owner_id' | 'created_at'>>;

// Home Area (Rooms, Zones)
export interface HomeArea {
    id: string;
    owner_id: string;
    property_id: string;
    name: string;
    type: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeAreaInsert = Omit<HomeArea, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeAreaUpdate = Partial<Omit<HomeArea, 'id' | 'owner_id' | 'created_at'>>;

// Home Appliance
export interface HomeAppliance {
    id: string;
    owner_id: string;
    property_id: string;
    area_id: string | null;
    name: string;
    manufacturer: string | null;
    model: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    purchase_price_cents: number | null;
    warranty_months: number | null;
    notes: string | null;
    created_at: string;
}

export type HomeApplianceInsert = Omit<HomeAppliance, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeApplianceUpdate = Partial<Omit<HomeAppliance, 'id' | 'owner_id' | 'created_at'>>;

// Home Maintenance Template
export interface HomeMaintenanceTemplate {
    id: string;
    owner_id: string;
    property_id: string | null;
    name: string;
    interval_months: number | null;
    interval_days: number | null;
    priority: number | null; // 1-5
    estimated_cost_cents: number | null;
    category: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeMaintenanceTemplateInsert = Omit<HomeMaintenanceTemplate, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeMaintenanceTemplateUpdate = Partial<Omit<HomeMaintenanceTemplate, 'id' | 'owner_id' | 'created_at'>>;

// Home Maintenance Record
export interface HomeMaintenanceRecord {
    id: string;
    owner_id: string;
    property_id: string;
    area_id: string | null;
    appliance_id: string | null;
    template_id: string | null;
    item: string;
    service_date: string;
    cost_cents: number | null;
    vendor: string | null;
    status: HomeMaintenanceStatus;
    is_diy: boolean;
    contractor_id: string | null;
    project_id: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeMaintenanceRecordInsert = Omit<HomeMaintenanceRecord, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeMaintenanceRecordUpdate = Partial<Omit<HomeMaintenanceRecord, 'id' | 'owner_id' | 'created_at'>>;

// Home Supply Item (Catalog)
export interface HomeSupplyItem {
    id: string;
    owner_id: string;
    name: string;
    unit: string | null;
    category: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeSupplyItemInsert = Omit<HomeSupplyItem, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeSupplyItemUpdate = Partial<Omit<HomeSupplyItem, 'id' | 'owner_id' | 'created_at'>>;

// Home Supply Stock
export interface HomeSupplyStock {
    id: string;
    owner_id: string;
    property_id: string;
    area_id: string | null;
    supply_item_id: string;
    quantity: number;
    min_quantity: number;
    updated_at: string;
    created_at: string;
}

export type HomeSupplyStockInsert = Omit<HomeSupplyStock, 'id' | 'owner_id' | 'created_at' | 'updated_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type HomeSupplyStockUpdate = Partial<Omit<HomeSupplyStock, 'id' | 'owner_id' | 'created_at'>>;

// Home Supply Purchase
export interface HomeSupplyPurchase {
    id: string;
    owner_id: string;
    property_id: string | null;
    area_id: string | null;
    supply_item_id: string;
    purchase_date: string;
    quantity: number;
    unit_cost_cents: number | null;
    vendor: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeSupplyPurchaseInsert = Omit<HomeSupplyPurchase, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeSupplyPurchaseUpdate = Partial<Omit<HomeSupplyPurchase, 'id' | 'owner_id' | 'created_at'>>;

// Home Supply Usage
export interface HomeSupplyUsage {
    id: string;
    owner_id: string;
    property_id: string | null;
    area_id: string | null;
    supply_item_id: string;
    use_date: string;
    quantity: number;
    notes: string | null;
    created_at: string;
}

export type HomeSupplyUsageInsert = Omit<HomeSupplyUsage, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeSupplyUsageUpdate = Partial<Omit<HomeSupplyUsage, 'id' | 'owner_id' | 'created_at'>>;

// Home Contractor
export interface HomeContractor {
    id: string;
    owner_id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    specialty: string | null;
    rating: number | null; // 1-5
    is_preferred: boolean;
    notes: string | null;
    created_at: string;
}

export type HomeContractorInsert = Omit<HomeContractor, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeContractorUpdate = Partial<Omit<HomeContractor, 'id' | 'owner_id' | 'created_at'>>;

// Home Utility Bill
export interface HomeUtilityBill {
    id: string;
    owner_id: string;
    property_id: string;
    utility_type: HomeUtilityType;
    provider: string | null;
    account_number: string | null;
    bill_date: string;
    due_date: string | null;
    period_start: string | null;
    period_end: string | null;
    amount_cents: number;
    usage_quantity: number | null;
    usage_unit: string | null;
    is_paid: boolean;
    paid_date: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeUtilityBillInsert = Omit<HomeUtilityBill, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeUtilityBillUpdate = Partial<Omit<HomeUtilityBill, 'id' | 'owner_id' | 'created_at'>>;

// Home Project
export interface HomeProject {
    id: string;
    owner_id: string;
    property_id: string;
    area_id: string | null;
    name: string;
    description: string | null;
    status: HomeProjectStatus;
    priority: number | null; // 1-5
    category: string | null;
    estimated_cost_cents: number | null;
    actual_cost_cents: number | null;
    budget_cents: number | null;
    start_date: string | null;
    target_end_date: string | null;
    actual_end_date: string | null;
    contractor_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type HomeProjectInsert = Omit<HomeProject, 'id' | 'owner_id' | 'created_at' | 'updated_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type HomeProjectUpdate = Partial<Omit<HomeProject, 'id' | 'owner_id' | 'created_at'>>;

// Home Project Task
export interface HomeProjectTask {
    id: string;
    owner_id: string;
    project_id: string;
    name: string;
    description: string | null;
    status: HomeProjectTaskStatus;
    sort_order: number | null;
    estimated_cost_cents: number | null;
    actual_cost_cents: number | null;
    due_date: string | null;
    completed_date: string | null;
    assigned_to: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeProjectTaskInsert = Omit<HomeProjectTask, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeProjectTaskUpdate = Partial<Omit<HomeProjectTask, 'id' | 'owner_id' | 'created_at'>>;

// Home Document
export interface HomeDocument {
    id: string;
    owner_id: string;
    property_id: string | null;
    appliance_id: string | null;
    project_id: string | null;
    document_type: HomeDocumentType;
    name: string;
    description: string | null;
    file_url: string | null;
    file_id: string | null;
    expiration_date: string | null;
    issue_date: string | null;
    notes: string | null;
    created_at: string;
}

export type HomeDocumentInsert = Omit<HomeDocument, 'id' | 'owner_id' | 'created_at'> & {
    id?: string;
    owner_id?: string;
    created_at?: string;
};

export type HomeDocumentUpdate = Partial<Omit<HomeDocument, 'id' | 'owner_id' | 'created_at'>>;

// Home Supply Stock with joined item (for frontend)
export interface HomeSupplyStockWithItem extends HomeSupplyStock {
    home_supply_item: HomeSupplyItem;
    home_area?: HomeArea | null;
}

// Home Maintenance Record with joins (for frontend)
export interface HomeMaintenanceRecordWithJoins extends HomeMaintenanceRecord {
    home_maintenance_template?: HomeMaintenanceTemplate | null;
    home_area?: HomeArea | null;
    home_appliance?: HomeAppliance | null;
    home_contractor?: HomeContractor | null;
}