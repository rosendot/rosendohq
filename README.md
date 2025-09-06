# Personal Website — Project Plan & Checklist

## Tech Stack & Integrations

* **Framework**: Next.js 15.5.2 with TypeScript, Tailwind CSS v4, Turbopack
* **Database & Auth**: Supabase (Postgres, Auth, Storage, RLS)
* **Deployment**: Vercel
* **Error Monitoring**: Sentry (frontend, backend, and edge runtime monitoring)
* **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Integration Ecosystem

### Core Platform Connections ✅
* **GitHub** ↔ **Supabase**: Automated deployments and database migrations
* **GitHub** ↔ **Vercel**: Continuous deployment pipeline
* **GitHub** ↔ **Sentry**: Source code integration and release tracking

### Monitoring & Notifications ✅
* **Sentry** ↔ **Discord**: Real-time error alerts and notifications
* **Sentry** ↔ **GitHub**: Issue creation and commit tracking for error resolution

### Sentry Configuration ✅

**Project Details**
* **DSN**: `https://bedcd4d7ec8c8fd30e70515e22ea09cc@o4509970890227712.ingest.us.sentry.io/4509970900123648`
* **Organization**: rosendot
* **Project**: rosendohq

**Coverage**
* **Client-side**: `src/instrumentation-client.ts` - Browser error tracking
* **Server-side**: `sentry.server.config.ts` - Node.js runtime monitoring  
* **Edge Runtime**: `sentry.edge.config.ts` - Middleware and Edge Functions
* **Global Error Boundary**: `src/app/global-error.tsx` - Fallback error handling
* **Request Instrumentation**: `src/instrumentation.ts` - Auto-capture request errors

**Features Enabled**
* Error capture and reporting to Discord
* Performance monitoring (100% trace sampling)
* Source map uploads for better stack traces
* Request tunneling through `/monitoring` route
* Automatic Vercel Cron Monitors
* GitHub issue creation for errors
* Discord notifications for critical errors

**Test Endpoint**
* `/sentry-example-page` - Test error reporting flow
* `/api/sentry-example-api` - Backend error testing

## Phase 0 — Foundations (Week 1)

**Status (done)**

* Next.js scaffold (TS, ESLint, Prettier, Tailwind v4, Turbopack), GitHub, local dev.
* Vercel project + envs (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
* **Sentry integration**: Full error monitoring with Discord notifications
* **GitHub integrations**: Connected to Supabase, Vercel, and Sentry
* Supabase: Postgres, **Auth enabled**, **Storage** (`files`, `images optional`), **RLS** single-owner.
* Shared DB: `tag`, `note` (+FTS), `tag_map`, `import_run`, `import_error`, `file`, `import_mapping_preset`.
* **Row defaults**: all real tables have `owner_id default auth.uid()` (views excluded; expected).
* **Tags**: `tag_map` extended to support cross-module tagging (entity types include `note`, `media_item`, `book`, `vehicle`, `trip`, `habit`, `food_item`, `shopping_item`, `inventory_item`, `wishlist_item`).

**Next steps**

* Import framework (reusable for all modules):
  * Upload → Map → Preview (validation) → Commit (batch insert + `import_run_id`) → Report (with downloadable errors).
  * Save/recall **mapping presets** per source (e.g., Capital One).
  * Rollback by `import_run_id`.
* Export All: server action to stream a single JSON zip of all user data.

**CSV headers (shared)**

* **Tags**: `name,color`
* **Notes**: `title,contentMD,tags`

---

## Monitoring & Alerting Workflow

1. **Development**: Code pushed to GitHub triggers Vercel deployment
2. **Error Detection**: Sentry captures errors across all environments
3. **Notification**: Critical errors automatically posted to Discord
4. **Issue Tracking**: GitHub issues created for recurring errors
5. **Resolution**: Commits linked back to Sentry for error resolution tracking

---

## Phase 1 — Core Trio (Weeks 2–4)

### Week 2 — Finance

**Status (done)**

* Tables: `account`, `category`, `transaction`, `subscription`
* Views: `v_spend_by_month`, `v_upcoming_renewals`
* Dedupe function + trigger for transactions

**Next steps**

* Create mapping preset `finance/capital_one_v1`.
* Build `/finance/transactions` (filters/search) + `/finance/renewals`.
* Dashboard card: monthly spend.

**CSV headers**

* **Accounts**: `name,type,institution,currency`
* **Categories**: `name,parent`
* **Transactions**: `date,description,amount,category,account`
  *(amount signed; → cents)*
* **Subscriptions**: `name,amount,currency,cadence,nextRenewal,account,notes`

---

### Week 3 — Media

**Status (done)**

* Tables: `media_item`, `media_log`
* Views: `v_media_continue_watching`, `v_media_episodes_per_week`

**Next steps**

* Import flow: upsert `media_item`, insert `media_log`, attach `tags`.
* `/media`: Continue Watching, Backlog, **"+1 episode"** action.
* Dashboard: episodes/week.

**CSV headers**

* **Media Items**: `title,type,status,totalEpisodes,tags`
* **Media Logs**: `mediaTitle,date,progress,note`

---

### Week 4 — Habits & Goals

**Status (done)**

* Tables: `habit`, `habit_log`, `goal`
* Views: `v_habit_daily_totals`, `v_goal_progress`

**Next steps**

* Import: habits, logs, goals (link goals → habits if `progressSource=habit`).
* `/habits/today` + streaks; `/goals` with progress.
* Dashboard: today's habits card.

**CSV headers**

* **Habits**: `name,unit,tags`
* **Habit Logs**: `habit,date,value,note`
* **Goals**: `name,targetValue,unit,dueDate,progressSource,habit`

---

## Phase 2 — Knowledge & Reading (Weeks 5–6)

### Week 5 — Knowledge Base

**Status (done)**

* Reuse `note` with FTS

**Next steps**

* Import: CSV (`title,contentMD,tags`) or zip of `.md` files.
* `/notes`: search-first list, tag filters, basic editor.
* Dashboard: recent notes / quick search.

**CSV headers**

* **Notes** (repeat): `title,contentMD,tags`

---

### Week 6 — Reading

**Status (done)**

* Tables: `book`, `reading_log`, `highlight`
* View: `v_reading_pace_week`

**Next steps**

* Import books/logs/highlights; support both pages and minutes.
* `/reading`: Currently Reading, pace chart, highlights list.
* Dashboard: reading pace.

**CSV headers**

* **Books**: `title,author,status,startedAt,finishedAt,rating,tags`
* **Reading Logs**: `book,date,pages,minutes,note`
* **Highlights**: `book,location,text`

---

## Phase 2.5 — Lists (Shopping & Wishlist)

**Status**

* **SQL provided; pending apply**
  * Tables: `shopping_list`, `shopping_list_item`, `inventory_item`, `wishlist_item`
  * Views: `v_shopping_open_items`, `v_inventory_summary`, `v_wishlist_active`
  * Tagging enabled via extended `tag_map` (`shopping_item`, `inventory_item`, `wishlist_item`)

**Next steps**

* Import CSVs for lists/inventory/wishlist.
* Pages:
  * `/shopping`: lists + open items; mark done; quick add.
  * `/inventory`: inventory table with location filter + totals (`v_inventory_summary`).
  * `/wishlist`: active wishlist with sort by priority/status.
* Optional: allow tags and global tag filters across these modules.

**CSV headers**

* **Shopping Lists**: `name,notes`
* **Shopping List Items**: `list,itemName,quantity,unit,neededBy,priority,notes,tags`
* **Inventory Items**: `name,quantity,unit,location,acquiredAt,notes,tags`
* **Wishlist Items**: `title,category,status,url,notes,priority,tags`

---

## Phase 3 — Car, House & Travel (Weeks 7–8)

### Week 7 — Car

**Status (done)**

* Tables: `vehicle`, `odometer_log`, `maintenance_template`, `maintenance_record`, `fuel_log`
* Views: `v_vehicle_last_odo`, `v_maintenance_next_due` (**fixed**)

**Next steps**

* Import odo, templates, records, fuel.
* `/car`: next-due (by miles/time), cost summaries.
* Dashboard: next-due card.

**CSV headers**

* **Vehicles**: `make,model,year,vin,nickname`
* **Odometer Logs**: `vehicle,date,mileage`
* **Maintenance Templates**: `name,intervalMiles,intervalMonths,notes`
* **Maintenance Records**: `vehicle,item,serviceDate,mileage,cost,vendor,notes`
* **Fuel Logs**: `vehicle,fillDate,odometer,gallons,total`

---

### Week 7 (parallel/optional) — House Tracker

**Status**

* **SQL provided; pending apply**
  * Tables: `home_property`, `home_area`, `home_appliance`, `home_maintenance_template`, `home_maintenance_record`, `home_supply_item`, `home_supply_stock`, `home_supply_purchase`, `home_supply_usage`
  * Views: `v_home_maintenance_next_due`, `v_home_supply_low_stock`, `v_home_supply_usage_month`

**Next steps**

* Import areas/appliances/templates/records/supplies.
* `/house`: next-due maintenance, low-stock supplies, areas/rooms.
* Optional: extend `tag_map` later to also tag house entities (e.g., `home_appliance`, `home_supply_item`).

**CSV headers**

* **Properties**: `name,address1,address2,city,state,postalCode,country,notes`
* **Areas/Rooms**: `property,name,type,notes`
* **Appliances**: `property,area,name,manufacturer,model,serialNumber,purchaseDate,warrantyMonths,notes`
* **Maintenance Templates**: `property,name,intervalMonths,intervalDays,notes`
* **Maintenance Records**: `property,area,appliance,item,template,serviceDate,cost,vendor,notes`
* **Supply Items**: `name,unit,notes`
* **Supply Stock**: `property,area,supply,quantity,minQuantity`
* **Supply Purchases**: `property,area,supply,purchaseDate,quantity,unitCost,vendor,notes`
* **Supply Usage**: `property,area,supply,useDate,quantity,notes`

---

### Week 8 — Travel

**Status (done)**

* Tables: `trip`, `itinerary_item`, `trip_entry`
* View: `v_trip_countdowns`

**Next steps**

* Import trips, itinerary, entries (parse `details` JSON if provided).
* `/travel`: countdown + day-by-day timeline.
* Dashboard: next trip countdown.

**CSV headers**

* **Trips**: `name,location,startDate,endDate,tags`
* **Itinerary Items**: `trip,datetime,type,title,details`
* **Trip Entries**: `trip,entryDate,contentMD`

---

## Phase 4 — Nutrition + Cross-Module Polish (Weeks 9–10)

### Week 9 — Nutrition

**Status (done)**

* Tables: `food_item`, `meal`, `meal_entry`, `nutrition_target`
* Views: `v_daily_macros`, `v_daily_macros_vs_target`

**Next steps**

* Import food, meals, meal entries, targets.
* `/nutrition`: daily/weekly summaries & compare to target.
* Dashboard: daily macros.

**CSV headers**

* **Food Items**: `name,servingSize,calories,protein,carbs,fat`
* **Meals**: `mealDate,name` *(breakfast|lunch|dinner|snack)*
* **Meal Entries**: `meal,food,customName,servings,calories,protein,carbs,fat`
* **Nutrition Targets**: `startDate,endDate,calories,protein,carbs,fat`

---

# Cross-Module (Week 10)

**Next steps**

* Dashboard page: cards (spend, renewals, continue watching, pace, habits, next-due, house maintenance/supplies, countdown, macros, lists/wishlist).
* Read-only calendar: renewals, maintenance due (car/house), goal deadlines, trip days.
* Import tooling: rollback by `import_run_id`, duplicate handling (hash + conflict strategies).
* Performance pass: confirm indexes; paginate heavy pages.
* Per-module CSV export endpoints.
* UX polish + error surfaces (show `import_error` with row numbers on preview).
* **Error monitoring**: All critical errors automatically reported to Discord via Sentry

---

## Data Model Summary (entity + log pattern)

**Shared**
✅ `Tag`, `TagMap` (extended types), `Note`, `File`, `ImportRun`, `ImportError`, `ImportMappingPreset`

**Finance**
✅ `Account`, `Category`, `Transaction`, `Subscription`

**Media**
✅ `MediaItem`, `MediaLog`

**Reading**
✅ `Book`, `ReadingLog`, `Highlight`

**Car**
✅ `Vehicle`, `OdometerLog`, `MaintenanceTemplate`, `MaintenanceRecord`, `FuelLog`

**House**
🆕 `HomeProperty`, `HomeArea`, `HomeAppliance`, `HomeMaintenanceTemplate`, `HomeMaintenanceRecord`, `HomeSupplyItem`, `HomeSupplyStock`, `HomeSupplyPurchase`, `HomeSupplyUsage`

**Travel**
✅ `Trip`, `ItineraryItem`, `TripEntry`

**Habits & Goals**
✅ `Habit`, `HabitLog`, `Goal`

**Nutrition**
✅ `FoodItem`, `Meal`, `MealEntry`, `NutritionTarget`

**Lists**
🆕 `ShoppingList`, `ShoppingListItem`, `InventoryItem`, `WishlistItem`

---

## Import UX (consistent across modules)

1. **Upload** (CSV/JSON) → 2) **Auto-detect delimiter & header** →
2. **Field mapping** (save mapping presets per source, e.g., "Capital One Checking") →
3. **Dry-run preview** (show parsed rows + validation flags) →
4. **Commit** (batch insert with duplicate detection) →
5. **Report** (rows imported, skipped, errors downloadable as CSV).

**Validation rules**

* Dates normalized to ISO.
* Amounts normalized to signed integers (cents) where relevant.
* Optional "de-dupe by hash" (e.g., `accountId + date + amount + merchant`).
* Lookups by name → IDs (create-on-missing optional) across modules.
* `tags` column supported for `note`, `media_item`, `book`, `shopping_item`, `inventory_item`, `wishlist_item` (and optionally house later).
* **Error tracking**: Import failures automatically logged to Sentry with Discord notifications

---

## Success Criteria (end of Week 10)

* One dashboard with **live cards from all modules**.
* **Global search** across entities with tag filters.
* **Calendar** of renewals/maintenance/goals/trips.
* **Import** flows working for each module with saved mapping presets.
* **Export All** (JSON) and **per-module CSV export**.
* Clear **Import history** and **rollback**.
* **Comprehensive error monitoring** with real-time Discord alerts for critical issues.
* **Automated issue tracking** linking errors to GitHub for resolution workflow.