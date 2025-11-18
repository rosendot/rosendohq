# Personal Website — Project Plan & Checklist

## Tech Stack & Integrations

* **Framework**: Next.js 15.5.2 with TypeScript, Tailwind CSS v4, Turbopack
* **Database**: Supabase (Postgres, Storage)
* **Deployment**: Vercel (personal use only)
* **Error Monitoring**: Sentry (frontend, backend, and edge runtime monitoring)
* **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Integration Ecosystem

### Core Platform Connections ✅
* **GitHub** ↔ **Supabase**: Database migrations and schema management
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
* Client-side, server-side, and edge runtime monitoring
* Global error boundary and request instrumentation
* Performance monitoring (100% trace sampling)
* Source map uploads for better stack traces
* Discord notifications for critical errors

---

## Module Status

### 🟢 Shopping Lists — **LIVE** ✅

**Status:** Fully functional with real data

**Features:**
* ✅ Multiple list management with sidebar navigation
* ✅ Add items with full details (quantity, unit, category, aisle, priority, notes, needed-by date)
* ✅ Mark items as purchased/completed with automatic timestamp
* ✅ Delete items with confirmation
* ✅ Active/completed item sections
* ✅ Search across item names and notes
* ✅ Category filtering
* ✅ Priority indicators (1-3 with color coding)
* ✅ Quick stats dashboard (total, active, completed, high priority)
* ✅ Optimized loading: all lists and items fetched in parallel on mount
* ✅ Instant list switching (no API calls)

**Live Data:** 2 lists, 87 items

**Database:** `shopping_list`, `shopping_list_item`

**Performance:**
* Parallel data fetching for fast initial load
* Client-side list switching with no API calls
* Selective refresh only on item modifications

**Remaining:**
* [ ] Edit existing items
* [ ] Bulk operations (mark all as done, delete completed)
* [ ] CSV import/export

---

### 🟢 Wishlist — **LIVE** ✅

**Status:** Fully functional with real data

**Features:**
* Grid view with category/status filters
* Priority-based sorting
* URL links and purchase tracking
* Search functionality

**Live Data:** 3 items with pricing

**Database:** `wishlist_item`

**Remaining:**
* [ ] CSV import/export

---

### 🟢 Media Tracker — **LIVE** ✅

**Status:** Fully functional with real data

**Features:**
* Multi-type support (movies, TV, games, music)
* Status tracking and rating system
* Progress tracking for TV shows
* Genre and format filtering

**Live Data:** 122 items

**Database:** `media_item`, `media_log` | Views: `v_media_episodes_per_week`

**Remaining:**
* [ ] CSV import/export

---

### 🟡 Car Tracker — **PARTIAL DATA**

**Status:** Backend connected, limited usage

**Features:**
* Vehicle management
* Maintenance records timeline
* Cost tracking and averages
* Vendor tracking

**Live Data:** 1 vehicle, 15 templates, 2 records, 1 odometer log

**Database:** `vehicle`, `odometer_log`, `maintenance_template`, `maintenance_record`, `fuel_log` | Views: `v_vehicle_last_odo`, `v_maintenance_next_due`

**Remaining:**
* [ ] CSV import/export

---

### 🟡 Reading Tracker — **PARTIAL DATA**

**Status:** Backend connected, limited usage

**Features:**
* Book status tracking with progress
* Rating system (1-5 stars)
* Format filtering (physical, ebook, audiobook)
* Start/completion date tracking

**Live Data:** 2 books

**Database:** `book`, `reading_log` | Views: `v_reading_pace_week`

**Remaining:**
* [ ] CSV import/export

---

### 🔴 Finance Module — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Account cards with balances
* Monthly summary stats
* Transaction list with categories
* Budget progress and spending breakdown

**Backend Needed:**
* [ ] API routes for accounts, transactions, budgets
* [ ] Supabase client integration
* [ ] Balance calculations and categorization
* [ ] CSV import/export

**Database:** `account`, `category`, `transaction`, `subscription`, `merchant`, `transfer` | Views: `v_spend_by_month`

---

### 🔴 Inventory — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Item grid with categories and locations
* Total value calculations
* Location-based filtering
* Purchase date tracking

**Backend Needed:**
* [ ] API routes and Supabase integration
* [ ] Value aggregation queries
* [ ] CSV import/export

**Database:** `inventory_item`

---

### 🔴 House Tracker — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Room management
* Maintenance task tracking
* Supply tracking with low-stock alerts
* Quick stats dashboard

**Backend Needed:**
* [ ] API routes for properties, areas, maintenance, supplies
* [ ] Supabase client integration
* [ ] Next-due maintenance calculations
* [ ] CSV import/export

**Database:** `home_property`, `home_area`, `home_appliance`, `home_maintenance_template`, `home_maintenance_record`, `home_supply_item`, `home_supply_stock`, `home_supply_purchase`, `home_supply_usage` | Views: `v_home_maintenance_next_due`, `v_home_supply_usage_month`

---

### 🔴 Habits & Goals — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Daily habit tracking with progress bars
* Streak calculations
* Goal tracking with progress visualization
* Priority-based sorting

**Backend Needed:**
* [ ] API routes for habits, logs, goals
* [ ] Supabase client integration
* [ ] Streak calculation logic
* [ ] CSV import/export

**Database:** `habit`, `habit_log`, `habit_schedule`, `goal` | Views: `v_habit_daily_totals`, `v_goal_progress`

---

### 🔴 Notes / Knowledge Base — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Note list with search
* Tag-based filtering
* Markdown editor
* Created/updated timestamps

**Backend Needed:**
* [ ] API routes and Supabase integration
* [ ] Full-text search integration
* [ ] Tag management
* [ ] CSV/Markdown import/export

**Database:** `note` (with FTS) | Views: `note_search`

---

### 🔴 Travel Planner — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Trip management with status tracking
* Itinerary timeline
* Journal entries
* Countdown to trips

**Backend Needed:**
* [ ] API routes for trips, itinerary, entries
* [ ] Supabase client integration
* [ ] Countdown calculations
* [ ] CSV import/export

**Database:** `trip`, `itinerary_item`, `trip_entry`, `packing_template`

---

### 🔴 Nutrition Tracker — **BACKEND NEEDED**

**Frontend:** ✅ Complete
* Daily macro tracking
* Meal type organization
* Water intake tracking
* Macro progress bars vs. goals

**Backend Needed:**
* [ ] API routes for food items, meals, entries, targets
* [ ] Supabase client integration
* [ ] Daily macro aggregation
* [ ] CSV import/export

**Database:** `food_item`, `meal`, `meal_entry`, `nutrition_target`, `recipe` | Views: `v_daily_macros`, `v_daily_macros_vs_target`

---

## Current State

### Active Modules (5)
* **Shopping Lists**: 2 lists, 87 items
* **Wishlist**: 3 items
* **Media Tracker**: 122 items
* **Car Tracker**: 1 vehicle with maintenance data
* **Reading Tracker**: 2 books

### Database Architecture
* All tables created for all modules
* Simplified structure: removed unused tables (`author`, `highlight`, `merchant_alias`, `packing_template_item`, `recipe_ingredient`, `transaction_split`)
* Child tables consolidated into parent tables as jsonb arrays
* Removed simple filter views that can be done in frontend

### Shared Infrastructure
* Tag system via `tag_map` (supports all modules)
* Import/export framework tables ready: `import_run`, `import_error`, `import_mapping_preset`
* File storage support via `file` table

---

## Next Steps

### Priority 1: Expand Usage of Active Modules
* Continue using Shopping, Wishlist, and Media daily
* Add more vehicles and maintenance records
* Add more books to reading tracker
* Implement CSV import/export for these modules

### Priority 2: Connect Next Module
Choose based on need:
* **Habits** - daily tracking and streak calculations
* **Finance** - expense tracking and budgeting

### Priority 3: Import/Export Framework
* Build CSV upload and mapping interface
* Implement validation and preview
* Add batch processing with error handling
* Create "Export All" functionality

### Priority 4: Dashboard Integration
* Connect dashboard stats to real data
* Add recent activity feed
* Build upcoming items aggregation
* Implement global search across modules

---

## CSV Headers Reference

### Finance
* **Accounts**: `name,type,institution,currency`
* **Categories**: `name,parent`
* **Transactions**: `date,description,amount,category,account`
* **Subscriptions**: `name,amount,currency,cadence,nextRenewal,account,notes`

### Media
* **Media Items**: `title,type,status,totalEpisodes,tags`
* **Media Logs**: `mediaTitle,date,progress,note`

### Reading
* **Books**: `title,author,status,startedAt,finishedAt,rating,tags`
* **Reading Logs**: `book,date,pages,minutes,note`

### Car
* **Vehicles**: `make,model,year,vin,nickname`
* **Odometer Logs**: `vehicle,date,mileage`
* **Maintenance Templates**: `name,intervalMiles,intervalMonths,notes`
* **Maintenance Records**: `vehicle,item,serviceDate,mileage,cost,vendor,notes`
* **Fuel Logs**: `vehicle,fillDate,odometer,gallons,total`

### House
* **Properties**: `name,address1,address2,city,state,postalCode,country,notes`
* **Areas/Rooms**: `property,name,type,notes`
* **Appliances**: `property,area,name,manufacturer,model,serialNumber,purchaseDate,warrantyMonths,notes`
* **Maintenance Templates**: `property,name,intervalMonths,intervalDays,notes`
* **Maintenance Records**: `property,area,appliance,item,template,serviceDate,cost,vendor,notes`
* **Supply Items**: `name,unit,notes`
* **Supply Stock**: `property,area,supply,quantity,minQuantity`
* **Supply Purchases**: `property,area,supply,purchaseDate,quantity,unitCost,vendor,notes`
* **Supply Usage**: `property,area,supply,useDate,quantity,notes`

### Travel
* **Trips**: `name,location,startDate,endDate,tags`
* **Itinerary Items**: `trip,datetime,type,title,details`
* **Trip Entries**: `trip,entryDate,contentMD`
* **Packing Templates**: `name` (items stored as jsonb)

### Habits & Goals
* **Habits**: `name,unit,tags`
* **Habit Logs**: `habit,date,value,note`
* **Goals**: `name,targetValue,unit,dueDate,progressSource,habit`

### Nutrition
* **Food Items**: `name,servingSize,calories,protein,carbs,fat`
* **Meals**: `mealDate,name`
* **Meal Entries**: `meal,food,customName,servings,calories,protein,carbs,fat`
* **Nutrition Targets**: `startDate,endDate,calories,protein,carbs,fat`
* **Recipes**: `name,servings,notes` (ingredients stored as jsonb)

### Lists
* **Shopping Lists**: `name,notes`
* **Shopping List Items**: `list,itemName,quantity,unit,neededBy,priority,notes,tags`
* **Inventory Items**: `name,quantity,unit,location,acquiredAt,notes,tags`
* **Wishlist Items**: `title,category,status,url,notes,priority,tags`