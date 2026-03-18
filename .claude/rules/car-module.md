# Car Module

## Overview

The Car Tracker module manages vehicles and all associated data: maintenance records, fuel logs, tire sets, and odometer readings. It also tracks incidents (accidents, tickets, tolls, parking).

## Architecture

### Frontend

- **Page**: `src/app/car/page.tsx` — Main page with vehicle selector and tabbed interface
- **Tabs**: 5 tabs rendered as child components in `src/app/car/components/`:
  - `DashboardTab.tsx` — Overview with alerts (insurance, registration, inspection, emissions, upcoming maintenance), stats (mileage, MPG, spending), recent activity, upcoming maintenance, vehicle summary
  - `MaintenanceTab.tsx` — CRUD for maintenance records, quick-add from templates
  - `FuelTab.tsx` — CRUD for fuel fill-ups, auto-calculates price/gallon and MPG
  - `TiresTab.tsx` — CRUD for tire sets with status lifecycle (active → removed/sold/disposed)
  - `IncidentsTab.tsx` — CRUD for non-maintenance records (incidents, tickets, tolls, parking, other) — uses the same `maintenance_record` table with `record_type` filter

### API Routes

All under `src/app/api/car/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `vehicles/` | GET, POST | `vehicle` | List/create vehicles |
| `vehicles/[id]/` | GET, PATCH, DELETE | `vehicle` | Single vehicle CRUD |
| `maintenance/records/` | GET, POST | `maintenance_record` | Filterable by `vehicleId`, joins `maintenance_template` |
| `maintenance/records/[id]/` | DELETE | `maintenance_record` | Delete only (edits go through records POST) |
| `maintenance/templates/` | GET, POST | `maintenance_template` | Ordered by priority |
| `fuel/` | GET, POST | `fuel_log` | Filterable by `vehicleId` |
| `fuel/[id]/` | GET, PATCH, DELETE | `fuel_log` | Full CRUD |
| `tires/` | GET, POST | `tire_set` | Filterable by `vehicleId` and `status` |
| `tires/[id]/` | GET, PATCH, DELETE | `tire_set` | Full CRUD |
| `odometer/` | GET, POST | `odometer_log` | Filterable by `vehicleId` |
| `odometer/[id]/` | GET, PATCH, DELETE | `odometer_log` | Full CRUD |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `vehicle` | Core vehicle info (year, make, model, VIN, color, license plate, purchase details, insurance, registration, inspection, emissions dates) |
| `maintenance_record` | Unified table for maintenance AND incidents. `record_type` enum: maintenance, incident, ticket, toll, parking, other. Includes cost breakdowns (parts/labor), next-due scheduling, incident-specific fields (at_fault, insurance_claim_number) |
| `maintenance_template` | Predefined service items (e.g., "Oil Change") with estimated cost, interval (miles/months), priority. Used for quick-add in MaintenanceTab |
| `fuel_log` | Fuel fill-up records with gallons, cost, odometer, trip miles, MPG calculation, fuel type enum, station name, full/partial tank flag |
| `tire_set` | Tire lifecycle tracking with brand, model, size, position (all/front/rear), tread depth (initial/current), mileage installed/removed, status lifecycle |
| `odometer_log` | Periodic mileage readings used for dashboard current mileage display |

### Types

Defined in `src/types/car.types.ts`:

- **Enums**: `VehicleStatus`, `FuelType`, `MaintenanceRecordType`, `TireStatus`
- **Interfaces**: `Vehicle`, `OdometerLog`, `FuelLog`, `MaintenanceTemplate`, `MaintenanceRecord`, `TireSet`
- **Insert/Update types**: Standard pattern — `Omit<T, 'id' | 'owner_id' | 'created_at'>` for inserts, `Partial<...>` for updates

### Database Views

| View | Purpose |
|------|---------|
| `v_fuel_efficiency` | Joins `fuel_log` with `vehicle`, adds 5-fill rolling averages for MPG and price per gallon using window functions. Filters to rows where `mpg IS NOT NULL`. |
| `v_maintenance_next_due` | Groups completed maintenance records by vehicle and item, calculates next due date/mileage based on template intervals (miles or months). |
| `v_vehicle_alerts` | Generates alert messages for active vehicles when insurance, registration, inspection, or emissions dates are within 30 days of expiry. |
| `v_vehicle_last_odo` | Simple aggregate — returns the maximum mileage reading per vehicle from `odometer_log`. |

## Key Patterns

- All monetary values stored as cents (`cost_cents`, `total_cents`, `purchase_price_cents`, etc.), displayed as dollars via `Intl.NumberFormat`
- `maintenance_record` is a polymorphic table — MaintenanceTab filters `record_type === 'maintenance'`, IncidentsTab filters `record_type !== 'maintenance'`
- FuelTab auto-calculates `price_per_gallon_cents` and `mpg` client-side when gallons, total, and trip miles are provided
- DashboardTab generates alerts by comparing expiration dates against today (30-day and 7-day thresholds)
- Vehicle selection state lives in `page.tsx` and data is fetched per-vehicle, then passed down to tabs
- All tabs follow the same UI pattern: stats cards → header with add button → list/grid → modal form → delete confirmation
- Odometer logs are fetched but only displayed indirectly (DashboardTab uses `odometerLogs[0]?.mileage` for current mileage)
