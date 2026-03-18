# House Module

## Overview

The House Tracker module manages properties and all home-related data: areas/rooms, appliances, maintenance tasks (with recurring templates), supplies inventory, utility bills, projects with tasks, contractors, and documents. It's the largest module in the app with 9 tabs and 13+ database tables.

## Architecture

### Frontend

- **Page**: `src/app/house/page.tsx` — Property selector, 9-tab interface, property creation modal
- **Tabs** (all in `src/app/house/components/`):
  - `DashboardTab.tsx` — Overview stats (pending tasks, overdue, low stock, active projects, unpaid bills), upcoming maintenance, low stock alerts, unpaid bills, active projects
  - `MaintenanceTab.tsx` — Chores & tasks with status workflow, recurring templates sub-tab, quick-add from templates
  - `SuppliesTab.tsx` — Inventory tracking with stock levels per property, supply items catalog (global), low-stock alerts
  - `ProjectsTab.tsx` — Home improvement projects with nested tasks, budget tracking, contractor assignment, expandable project cards
  - `AreasTab.tsx` — Rooms/areas CRUD with type classification (bedroom, kitchen, garage, etc.)
  - `AppliancesTab.tsx` — Appliance registry with warranty tracking (expiring/expired alerts), linked to areas
  - `UtilitiesTab.tsx` — Utility bill tracking with paid/unpaid filter, usage quantity logging
  - `ContractorsTab.tsx` — Contractor directory with contact info, specialty, rating, preferred flag (NOT property-scoped)
  - `DocumentsTab.tsx` — Property documents with type classification (warranty, manual, receipt, contract, deed, etc.), expiration tracking

### API Routes

All under `src/app/api/house/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `properties/` | GET, POST | `home_property` | List/create properties |
| `properties/[id]/` | GET, PATCH, DELETE | `home_property` | Single property CRUD |
| `areas/` | GET, POST | `home_area` | Filterable by `propertyId` |
| `areas/[id]/` | GET, PATCH, DELETE | `home_area` | Full CRUD |
| `appliances/` | GET, POST | `home_appliance` | Filterable by `propertyId` |
| `appliances/[id]/` | GET, PATCH, DELETE | `home_appliance` | Full CRUD |
| `maintenance/records/` | GET, POST | `home_maintenance_record` | Filterable by `propertyId` |
| `maintenance/records/[id]/` | GET, PATCH, DELETE | `home_maintenance_record` | Full CRUD |
| `maintenance/templates/` | GET, POST | `home_maintenance_template` | Filterable by `propertyId` |
| `maintenance/templates/[id]/` | GET, PATCH, DELETE | `home_maintenance_template` | Full CRUD |
| `maintenance/upcoming/` | GET | `home_maintenance_record` | Upcoming tasks query |
| `supplies/items/` | GET, POST | `home_supply_item` | Global catalog (not property-scoped) |
| `supplies/items/[id]/` | GET, PATCH, DELETE | `home_supply_item` | Full CRUD |
| `supplies/stock/` | GET, POST | `home_supply_stock` | Filterable by `propertyId`, joins `home_supply_item` |
| `supplies/stock/[id]/` | GET, PATCH, DELETE | `home_supply_stock` | Full CRUD |
| `supplies/purchases/` | GET, POST | `home_supply_purchase` | Purchase history |
| `supplies/purchases/[id]/` | GET, PATCH, DELETE | `home_supply_purchase` | Full CRUD |
| `supplies/usage/` | GET, POST | `home_supply_usage` | Usage/consumption logs |
| `supplies/usage/[id]/` | GET, PATCH, DELETE | `home_supply_usage` | Full CRUD |
| `utilities/` | GET, POST | `home_utility_bill` | Filterable by `propertyId` |
| `utilities/[id]/` | GET, PATCH, DELETE | `home_utility_bill` | Full CRUD |
| `projects/` | GET, POST | `home_project` | Filterable by `propertyId` |
| `projects/[id]/` | GET, PATCH, DELETE | `home_project` | Full CRUD |
| `projects/[id]/tasks/` | GET, POST | `home_project_task` | Tasks nested under project |
| `projects/[id]/tasks/[taskId]/` | GET, PATCH, DELETE | `home_project_task` | Full CRUD |
| `contractors/` | GET, POST | `home_contractor` | Global (not property-scoped) |
| `contractors/[id]/` | GET, PATCH, DELETE | `home_contractor` | Full CRUD |
| `documents/` | GET, POST | `home_document` | Filterable by `propertyId` |
| `documents/[id]/` | GET, PATCH, DELETE | `home_document` | Full CRUD |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `home_property` | Properties with name, full address (address1, address2, city, state, postal_code, country), notes |
| `home_area` | Rooms/areas within a property with name and type (bedroom, kitchen, garage, etc.) |
| `home_appliance` | Appliances with manufacturer, model, serial number, purchase info, warranty duration in months. Linked to property and optionally to an area |
| `home_maintenance_template` | Recurring chore definitions with interval (days or months), priority, estimated cost, category |
| `home_maintenance_record` | Individual maintenance tasks/chores with status workflow, cost, vendor, DIY flag. Links to property, area, appliance, contractor, project, and template |
| `home_supply_item` | Global supply catalog (not property-scoped) with name, category, unit, notes |
| `home_supply_stock` | Per-property stock levels for supply items with quantity, min_quantity for low-stock alerts |
| `home_supply_purchase` | Purchase history for supplies with date, quantity, cost, store |
| `home_supply_usage` | Consumption/usage logs for supplies with date, quantity, notes |
| `home_contractor` | Contractor directory (global, not property-scoped) with contact info, specialty, rating (1-5), preferred flag |
| `home_utility_bill` | Utility bills with type (electricity, gas, water, etc.), billing period, amount, usage, paid status |
| `home_project` | Home improvement projects with status lifecycle, budget/actual cost, priority, start/end dates. Links to property, area, contractor |
| `home_project_task` | Tasks within a project with status, assigned contractor, due date, cost, sort order |
| `home_document` | Property documents with type classification, file reference, issue/expiration dates. Links to property, appliance, project |

### Types

Defined in `src/types/house.types.ts`:

- **Enums**: `HomeMaintenanceStatus` (pending, scheduled, in_progress, completed, skipped, cancelled), `HomeProjectStatus` (planning, budgeting, in_progress, on_hold, completed, cancelled), `HomeProjectTaskStatus` (pending, in_progress, completed, skipped, blocked), `HomeUtilityType` (electricity, gas, water, sewer, trash, internet, phone, cable, hoa, security, other), `HomeDocumentType` (warranty, manual, receipt, contract, insurance, inspection, permit, hoa, deed, mortgage, tax, photo, other)
- **Interfaces**: `HomeProperty`, `HomeArea`, `HomeAppliance`, `HomeMaintenanceTemplate`, `HomeMaintenanceRecord`, `HomeSupplyItem`, `HomeSupplyStock`, `HomeSupplyPurchase`, `HomeSupplyUsage`, `HomeContractor`, `HomeUtilityBill`, `HomeProject`, `HomeProjectTask`, `HomeDocument`
- **Join types**: `HomeSupplyStockWithItem` (stock + joined supply item), `HomeMaintenanceRecordWithJoins` (record + joined template)
- **Insert/Update types**: Standard pattern — `Omit<T, 'id' | 'owner_id' | 'created_at'>` for inserts, `Partial<...>` for updates

### Database Views

| View | Purpose |
|------|---------|
| `v_home_maintenance_next_due` | Groups completed maintenance records by property and item, calculates next due date from template intervals (months or days). |
| `v_home_maintenance_upcoming` | Extended version of next-due — joins property name, includes template category/priority/estimated cost, and computes `days_until_due`. Only considers completed records. |
| `v_home_project_progress` | Aggregates project tasks to compute total, completed, in-progress, and pending task counts plus `completion_percentage`. Includes budget and cost fields from the project. |
| `v_home_supply_low_stock` | Joins stock with item and property, filters to items where `quantity <= min_quantity`. Adds `stock_status` label (out_of_stock, low_stock, in_stock) and `quantity_diff`. |
| `v_home_supply_usage_month` | Aggregates supply usage by item and month — sums quantity used per month for trend analysis. |
| `v_home_utility_costs_month` | Aggregates utility bills by property, type, and month — sums costs, averages per bill, totals usage, and counts bills. |

## Key Patterns

- Multi-property support — property selector in header, most data is scoped to selected property
- Contractors and supply items are global (not property-scoped) — shared across properties
- Supply system is three-tier: `home_supply_item` (catalog) → `home_supply_stock` (per-property levels) → `home_supply_purchase`/`home_supply_usage` (history)
- Maintenance tasks have a full status workflow: pending → scheduled → in_progress → completed/skipped/cancelled
- Maintenance templates support both day-based and month-based intervals (mutually exclusive)
- Appliance warranty tracking calculates end date from purchase_date + warranty_months, with 3-month expiring alerts
- Projects have nested tasks fetched via `/projects/[id]/tasks/`, with expandable cards in the UI
- Dashboard computes overdue tasks by comparing service_date against today for pending/scheduled records
- Low stock alerts trigger when `quantity <= min_quantity`
- All monetary values stored as cents
- All data fetched per-property in parallel via `Promise.all` in `fetchPropertyData`
- All tabs use shared modal pattern: inline form in a modal overlay with create/edit mode
