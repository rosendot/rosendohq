// Home Tracker Types

// Enums
export type HomeMaintenanceStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "skipped"
  | "cancelled";
export type HomeProjectStatus =
  | "planning"
  | "budgeting"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";
export type HomeProjectTaskStatus = "pending" | "in_progress" | "completed" | "skipped" | "blocked";
export type HomeUtilityType =
  | "electricity"
  | "gas"
  | "water"
  | "sewer"
  | "trash"
  | "internet"
  | "phone"
  | "cable"
  | "hoa"
  | "security"
  | "other";
export type HomeDocumentType =
  | "warranty"
  | "manual"
  | "receipt"
  | "contract"
  | "insurance"
  | "inspection"
  | "permit"
  | "hoa"
  | "deed"
  | "mortgage"
  | "tax"
  | "photo"
  | "other";

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

export type HomePropertyInsert = Omit<HomeProperty, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomePropertyUpdate = Partial<Omit<HomeProperty, "id" | "owner_id" | "created_at">>;

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

export type HomeAreaInsert = Omit<HomeArea, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeAreaUpdate = Partial<Omit<HomeArea, "id" | "owner_id" | "created_at">>;

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

export type HomeApplianceInsert = Omit<HomeAppliance, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeApplianceUpdate = Partial<Omit<HomeAppliance, "id" | "owner_id" | "created_at">>;

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

export type HomeMaintenanceTemplateInsert = Omit<
  HomeMaintenanceTemplate,
  "id" | "owner_id" | "created_at"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeMaintenanceTemplateUpdate = Partial<
  Omit<HomeMaintenanceTemplate, "id" | "owner_id" | "created_at">
>;

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

export type HomeMaintenanceRecordInsert = Omit<
  HomeMaintenanceRecord,
  "id" | "owner_id" | "created_at"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeMaintenanceRecordUpdate = Partial<
  Omit<HomeMaintenanceRecord, "id" | "owner_id" | "created_at">
>;

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

export type HomeSupplyItemInsert = Omit<HomeSupplyItem, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeSupplyItemUpdate = Partial<Omit<HomeSupplyItem, "id" | "owner_id" | "created_at">>;

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

export type HomeSupplyStockInsert = Omit<
  HomeSupplyStock,
  "id" | "owner_id" | "created_at" | "updated_at"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type HomeSupplyStockUpdate = Partial<
  Omit<HomeSupplyStock, "id" | "owner_id" | "created_at">
>;

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

export type HomeSupplyPurchaseInsert = Omit<
  HomeSupplyPurchase,
  "id" | "owner_id" | "created_at"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeSupplyPurchaseUpdate = Partial<
  Omit<HomeSupplyPurchase, "id" | "owner_id" | "created_at">
>;

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

export type HomeSupplyUsageInsert = Omit<HomeSupplyUsage, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeSupplyUsageUpdate = Partial<
  Omit<HomeSupplyUsage, "id" | "owner_id" | "created_at">
>;

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

export type HomeContractorInsert = Omit<HomeContractor, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeContractorUpdate = Partial<
  Omit<HomeContractor, "id" | "owner_id" | "created_at">
>;

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

export type HomeUtilityBillInsert = Omit<HomeUtilityBill, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeUtilityBillUpdate = Partial<
  Omit<HomeUtilityBill, "id" | "owner_id" | "created_at">
>;

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

export type HomeProjectInsert = Omit<
  HomeProject,
  "id" | "owner_id" | "created_at" | "updated_at"
> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type HomeProjectUpdate = Partial<Omit<HomeProject, "id" | "owner_id" | "created_at">>;

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

export type HomeProjectTaskInsert = Omit<HomeProjectTask, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeProjectTaskUpdate = Partial<
  Omit<HomeProjectTask, "id" | "owner_id" | "created_at">
>;

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

export type HomeDocumentInsert = Omit<HomeDocument, "id" | "owner_id" | "created_at"> & {
  id?: string;
  owner_id?: string;
  created_at?: string;
};

export type HomeDocumentUpdate = Partial<Omit<HomeDocument, "id" | "owner_id" | "created_at">>;

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
