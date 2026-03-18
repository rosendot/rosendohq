// Car Tracker Types
export type VehicleStatus = "active" | "sold" | "traded" | "totaled";
export type FuelType = "regular" | "premium" | "diesel" | "electric";
export type MaintenancePriority = "critical" | "recommended" | "optional";
export type MaintenanceRecordType =
  | "maintenance"
  | "incident"
  | "ticket"
  | "toll"
  | "parking"
  | "other";
export type TireStatus = "active" | "removed" | "sold" | "disposed";

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
  // Record type fields
  record_type: MaintenanceRecordType;
  incident_date: string | null;
  insurance_claim_number: string | null;
  at_fault: boolean | null;
  created_at: string;
}

// Tire Set
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

// Insert types
export type VehicleInsert = Omit<Vehicle, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type VehicleUpdate = Partial<Omit<Vehicle, "id" | "owner_id" | "created_at">>;

export type OdometerLogInsert = Omit<OdometerLog, "id" | "owner_id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type FuelLogInsert = Omit<FuelLog, "id" | "owner_id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type MaintenanceTemplateInsert = Omit<
  MaintenanceTemplate,
  "id" | "owner_id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type MaintenanceTemplateUpdate = Partial<
  Omit<MaintenanceTemplate, "id" | "owner_id" | "created_at">
>;

export type MaintenanceRecordInsert = Omit<
  MaintenanceRecord,
  "id" | "owner_id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type MaintenanceRecordUpdate = Partial<
  Omit<MaintenanceRecord, "id" | "owner_id" | "created_at">
>;

export type TireSetInsert = Omit<TireSet, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type TireSetUpdate = Partial<Omit<TireSet, "id" | "owner_id" | "created_at">>;
