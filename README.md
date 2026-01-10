# RosendoHQ — Personal Life Management Platform

A comprehensive full-stack application for managing all aspects of personal life, from shopping lists to media tracking, built with modern web technologies.

## 🚀 Tech Stack

### Core Framework
* **Next.js** 15.5.2 with TypeScript 5
* **React** 19.1.0
* **Turbopack** - Next.js bundler for development and production
* **Tailwind CSS** 4 - Utility-first CSS framework
* **Lucide React** 0.544.0 - Icon library

### Backend & Database
* **Supabase** 2.57.0 - Postgres database with real-time capabilities
* **Supabase Auth Helpers** 0.10.0 - Authentication integration
* Type-safe database operations with generated TypeScript types

### Development & Quality
* **TypeScript** 5 with strict mode enabled
* **ESLint** 9 with eslint-config-next
* **Prettier** 3.6.2 with prettier-plugin-tailwindcss
* **PostCSS** 4 for CSS processing

### Monitoring & Deployment
* **Sentry** 10.10.0 - Full-stack error monitoring (client, server, edge runtime)
* **Vercel** - Continuous deployment with GitHub integration
* Performance monitoring with 100% trace sampling

## 🔗 Integration Ecosystem

### Core Platform Connections ✅
* **GitHub** ↔ **Supabase** - Database migrations and schema management
* **GitHub** ↔ **Vercel** - Continuous deployment pipeline
* **GitHub** ↔ **Sentry** - Source code integration and release tracking

### Monitoring & Notifications ✅
* **Sentry** ↔ **Discord** - Real-time error alerts and notifications
* **Sentry** ↔ **GitHub** - Issue creation and commit tracking

### Sentry Configuration ✅
* **DSN**: `https://bedcd4d7ec8c8fd30e70515e22ea09cc@o4509970890227712.ingest.us.sentry.io/4509970900123648`
* **Organization**: rosendot
* **Project**: rosendohq
* Coverage: Client-side, server-side, and edge runtime monitoring
* Source map uploads with tunnel route `/monitoring` for ad-blocker circumvention

---

## 📱 Application Features

### 🏠 Dashboard (`/dashboard`)
Central hub providing an overview of all modules with quick stats, recent activity, and upcoming items.

**Components:**
* Module grid with 13 color-coded cards
* QuickStats component for key metrics
* RecentActivity feed
* UpcomingItems timeline

---

## 🟢 Fully Functional Modules (Live with Real Data)

### 1. Shopping Lists — **LIVE** ✅

**Status:** Production-ready with 87 items across 2 lists

**Features:**
* ✅ Multiple list management with sidebar navigation
* ✅ Add/edit items with comprehensive details:
  - Item name, quantity, unit (predefined dropdown)
  - Category (predefined dropdown: Produce, Meat, Dairy, Bakery, Frozen, Pantry, Snacks, Beverages, Personal Care, Household, Other)
  - Aisle location and store preference
  - Priority rating (1-5 scale with color coding)
  - Notes and needed-by date
* ✅ Quick priority rating (click to set 1-5, click again to reset to default)
* ✅ Priority-based category sorting (weighted by priority × 0.6 + item count × 0.4)
* ✅ Mark items complete/incomplete with automatic timestamp
* ✅ Bulk operations:
  - Long-press (500ms) to enter selection mode
  - Select multiple items with tap
  - Bulk complete, uncomplete, or delete
  - "Select All" buttons for active and completed sections
* ✅ Advanced filtering:
  - Real-time search across item names and notes
  - Category filter dropdown
  - Combined category + search filtering
* ✅ Smart organization:
  - Active items grouped by category with headers
  - Categories sorted by weighted score (priority + item count)
  - Items sorted by priority > name within categories
  - Completed items in flat list with purchase date
* ✅ Delete confirmation modals
* ✅ Performance optimizations:
  - Parallel loading of all lists and items on mount
  - Client-side list switching (no API calls)
  - Selective refresh after modifications
  - Bulk API operations (single call for multiple items)

**Database:** `shopping_list`, `shopping_list_item`

**API Endpoints:**
* `GET/POST /api/shopping/lists` - Manage shopping lists
* `GET/POST /api/shopping/lists/[listId]/items` - Manage list items
* `GET/PATCH/DELETE /api/shopping/items/[itemId]` - Individual item operations
* `PATCH/DELETE /api/shopping/items/bulk` - Bulk operations

**Remaining:**
* [ ] List creation/editing/deletion UI
* [ ] CSV import/export

---

### 2. Wishlist — **LIVE** ✅

**Status:** Production-ready with 3 items

**Features:**
* ✅ Grid view with comprehensive item details
* ✅ Priority-based sorting (1-5 scale)
* ✅ Category and status filtering
* ✅ URL links for items
* ✅ Purchase tracking with timestamps
* ✅ Multi-currency price support (stored as cents)
* ✅ Product details: vendor, brand, color, size, image URL
* ✅ Add/edit/delete functionality with modals
* ✅ Real-time search across titles and notes

**Database:** `wishlist_item`

**API Endpoints:**
* `GET/POST /api/wishlist` - List and create items
* `GET/PUT/DELETE /api/wishlist/[id]` - Individual item operations

**Remaining:**
* [ ] CSV import/export
* [ ] Price tracking history

---

### 3. Media Tracker — **LIVE** ✅

**Status:** Production-ready with 122 items

**Features:**
* ✅ Multi-type support (Movies, TV Shows, Anime)
* ✅ Status tracking (Planned, Watching, Completed, On Hold, Dropped)
* ✅ Rating system (1-5 stars with quick rating buttons)
* ✅ Progress tracking:
  - Episode and season tracking for TV shows
  - Current episode / total episodes display
  - Episodes per season tracking
* ✅ Platform badges with brand colors:
  - Netflix (red), Disney+ (blue), Hulu (green), Amazon Prime (teal)
  - HBO Max, Apple TV+, Crunchyroll, and more
* ✅ Type filter tabs (All, Anime, Shows, Movies)
* ✅ Status filter dropdown
* ✅ Add/edit/delete functionality
* ✅ Grid view with hover effects
* ✅ Real-time search

**Database:** `media_item`, `media_log`

**API Endpoints:**
* `GET /api/media` - Query items (supports `?status=*` and `?type=*`)
* `POST /api/media` - Create item
* `GET/PUT/DELETE /api/media/[id]` - Individual item operations

**Views:** `v_media_episodes_per_week`

**Remaining:**
* [ ] Progress logging UI
* [ ] Episode history tracking
* [ ] CSV import/export

---

### 4. Car Tracker — **LIVE** ✅

**Status:** Production-ready with tabbed interface (1 vehicle, 15 templates, 2 records)

**Features:**
* ✅ **Tabbed Interface**: Dashboard, Maintenance, Fuel, Tires, Incidents
* ✅ **Dashboard Tab**:
  - Alerts for expiring insurance, registration, inspection, emissions (30-day warnings)
  - Quick stats: Current mileage, Avg MPG, Service count, Spending (YTD/all-time), Active tires
  - Recent activity feed (last 5 maintenance records)
  - Upcoming maintenance section
  - Vehicle summary with all dates
* ✅ **Vehicle management**:
  - Add/edit/delete vehicles
  - Track make, model, year, VIN, license plate
  - Purchase details (date, price, mileage)
  - Insurance information with renewal date
  - Registration state and expiration date
  - Inspection and emissions expiration dates
  - Vehicle status (active, sold, etc.)
* ✅ **Maintenance Tab**:
  - Maintenance records filtered by record_type
  - Quick add from templates dropdown
  - Service records with timeline view
  - Cost tracking (parts + labor)
  - Vendor history and warranty work indicator
  - Next due date/mileage calculations
  - DIY maintenance flag
* ✅ **Fuel Tab**:
  - Fuel log management with add/edit/delete
  - Auto-calculated MPG and price per gallon
  - Stats: Avg MPG, Total gallons, Total spent, Avg $/gallon
  - Station and fuel type tracking
  - Full tank indicator
* ✅ **Tires Tab**:
  - Tire set management (brand, model, size)
  - Status tracking: active, removed, sold, disposed
  - Purchase info and mileage tracking
  - Tread depth monitoring (initial/current)
  - Quick status change buttons
* ✅ **Incidents Tab**:
  - Track incidents, tickets, tolls, parking, other expenses
  - Type filter tabs
  - At-fault and insurance claim tracking
  - Cost and date tracking
* ✅ Delete confirmation modals throughout
* ✅ Odometer logging

**Database:** `vehicle`, `odometer_log`, `maintenance_template`, `maintenance_record`, `fuel_log`, `tire_set`

**API Endpoints:**
* `GET/POST /api/car/vehicles` - Manage vehicles
* `GET/PUT/DELETE /api/car/vehicles/[id]` - Individual vehicle operations
* `GET/POST /api/car/odometer` - Odometer logs
* `GET/PATCH/DELETE /api/car/odometer/[id]` - Individual odometer operations
* `GET/POST /api/car/fuel` - Fuel entries
* `GET/PATCH/DELETE /api/car/fuel/[id]` - Individual fuel operations
* `GET/POST /api/car/maintenance/records` - Maintenance records
* `GET/PUT/DELETE /api/car/maintenance/records/[id]` - Individual records
* `GET/POST /api/car/maintenance/templates` - Maintenance templates
* `GET/POST /api/car/tires` - Tire sets
* `GET/PATCH/DELETE /api/car/tires/[id]` - Individual tire operations

**Views:** `v_vehicle_last_odo`, `v_maintenance_next_due`, `v_vehicle_alerts`, `v_fuel_efficiency`

**Remaining:**
* [ ] Service history charts
* [ ] CSV import/export

---

### 5. Reading Tracker — **LIVE** ✅

**Status:** Partial data (2 books)

**Features:**
* ✅ Book status tracking (Planned, Reading, Finished, On Hold, Dropped)
* ✅ Rating system (1-5 stars with quick rating)
* ✅ Format filtering (Physical, eBook, Audiobook)
* ✅ Progress tracking:
  - Current page / total pages
  - Progress percentage display
  - Start and completion date tracking
* ✅ Book highlights feature:
  - Store highlights as JSON array
  - Display highlights with book details
* ✅ Add/edit/delete functionality with modals
* ✅ Grid view with book cards
* ✅ Status filter dropdown
* ✅ Delete confirmation modal
* ✅ Real-time search

**Database:** `book`, `reading_log`

**API Endpoints:**
* `GET /api/books` - Query books (supports `?status=*` and `?format=*`)
* `POST /api/books` - Create book
* `GET/PUT/DELETE /api/books/[id]` - Individual book operations

**Views:** `v_reading_pace_week`

**Remaining:**
* [ ] Reading log UI for tracking daily progress
* [ ] Reading statistics and charts
* [ ] CSV import/export

---

### 6. Habits & Goals — **LIVE** ✅

**Status:** Backend connected, needs more data entry

**Features:**
* ✅ Daily habit tracking:
  - Categories (Oral Care, Beard Care, Hair Care, Skincare, Body Care, Mental Health, etc.)
  - Time-of-day organization (Morning, Midday, Evening)
  - Progress bars showing completion
  - Streak tracking
  - Target values with units
  - Sort order customization
* ✅ Habit logging:
  - Daily value entry
  - Notes and mood (1-5 scale)
  - Time-of-day tracking
* ✅ Goal tracking:
  - Goal name, target value, unit
  - Progress tracking (current vs. target)
  - Status (Active, Completed, Abandoned, On Hold)
  - Due date tracking
  - Link to related habits for automatic progress updates
* ✅ Today/Goals tabs for organization
* ✅ Stats section with summary

**Database:** `habit`, `habit_log`, `goal`

**API Endpoints:**
* `GET/POST /api/habits` - Manage habits
* `GET/PUT/DELETE /api/habits/[id]` - Individual habits
* `GET/POST /api/habits/logs` - Habit logs (supports `?date=YYYY-MM-DD`)
* `GET/PUT/DELETE /api/habits/logs/[id]` - Individual logs
* `GET/POST /api/habits/goals` - Goal management
* `GET/PUT/DELETE /api/habits/goals/[id]` - Individual goals

**Views:** `v_habit_daily_totals`, `v_goal_progress`

**Remaining:**
* [ ] Habit editing UI
* [ ] Goal editing UI
* [ ] Habit streak calculations
* [ ] CSV import/export

---

## 🟡 Frontend Complete (Mock Data Only)

The following modules have fully functional UIs but are using mock data and need backend integration:

### 7. Finance — **LIVE** ✅

**Status:** Production-ready with automated CSV import pipeline

**Features:**
* ✅ Multi-account management:
  - Add accounts via modal form (name, type, institution, currency)
  - Support for checking, savings, credit, investment, and loan accounts
  - Real-time account list with type icons
* ✅ Automated CSV upload system:
  - Support for 6 different CSV formats (Capital One 360 Checking/Savings, Savor, Venture X, Chase Amazon, Discover IT)
  - Upload modal with account selection and source type dropdown
  - Automatic normalization of different CSV formats into unified structure
  - Database triggers for automatic processing (raw → normalized → transaction)
  - No deduplication (imports all transactions as-is)
* ✅ Transaction tracking with real-time API:
  - Monthly filtering with accurate date range handling
  - Category and account joins for rich transaction data
  - Income/expense calculations in Quick Stats sidebar
  - Spending breakdown by category
* ✅ Three-tier data pipeline:
  - **Raw tables**: Store original CSV data unchanged (6 separate tables for different sources)
  - **finance_normalized**: Unified transaction format from all sources
  - **transaction**: Final transaction table powering the UI
* ✅ Upload batch tracking with metadata
* ✅ Month selector with dynamic date calculations
* ✅ Real-time transaction display with all data

**Database:** `account`, `category`, `transaction`, `merchant`, `subscription`, `transfer`, `import_run`, `import_error`, `import_mapping_preset`, `csv_upload_batch`, `raw_capital_one_360_checking`, `raw_capital_one_360_savings`, `raw_capital_one_savor`, `raw_capital_one_venture_x`, `raw_chase_amazon`, `raw_discover_it`, `finance_normalized`

**API Endpoints:**
* `GET /api/finance/accounts` - List all accounts
* `POST /api/finance/accounts` - Create new account
* `GET /api/finance/transactions?month=YYYY-MM` - Get transactions by month
* `GET /api/finance/categories` - List all categories
* `POST /api/finance/csv-upload` - Upload and process CSV files

**Views:** `v_spend_by_month`

**Database Triggers:**
* `normalize_capital_one_360_checking()` - Auto-normalize checking CSV
* `normalize_capital_one_360_savings()` - Auto-normalize savings CSV
* `normalize_capital_one_savor()` - Auto-normalize Savor credit card CSV
* `normalize_capital_one_venture_x()` - Auto-normalize Venture X credit card CSV
* `normalize_chase_amazon()` - Auto-normalize Chase Amazon CSV
* `normalize_discover_it()` - Auto-normalize Discover IT CSV
* `auto_import_to_transaction()` - Auto-import normalized data to transaction table

**Remaining:**
* [ ] Enable smart deduplication (currently disabled for testing)
* [ ] Category auto-assignment based on merchant patterns
* [ ] Budget tracking UI
* [ ] Transaction editing/categorization
* [ ] Export functionality

---

### 8. House Tracker — **LIVE** ✅

**Status:** Production-ready with 1 property, 7 areas, 6 chore templates

**Features:**
* ✅ Property management with full address details
* ✅ Room/area organization by floor and type
* ✅ Maintenance task tracking:
  - Status (pending, scheduled, in_progress, completed, skipped, cancelled)
  - DIY flag and contractor assignment
  - Cost tracking with vendor history
* ✅ Recurring chore templates:
  - Interval in days or months
  - Priority levels (1-5)
  - Category organization
  - Create tasks from templates
* ✅ Supply inventory:
  - Stock levels with min quantity alerts
  - Purchase and usage tracking
* ✅ Appliance tracking with warranty info
* ✅ Contractor management with ratings
* ✅ Utility bill tracking
* ✅ Home improvement projects with tasks
* ✅ Document storage (warranties, manuals, receipts)
* ✅ Tabbed interface: Dashboard, Maintenance, Supplies, Appliances, Projects, Utilities, Contractors, Documents

**Database:** `home_property`, `home_area`, `home_appliance`, `home_contractor`, `home_maintenance_template`, `home_maintenance_record`, `home_supply_item`, `home_supply_stock`, `home_supply_purchase`, `home_supply_usage`, `home_utility_bill`, `home_project`, `home_project_task`, `home_document`

**API Endpoints:**
* `GET/POST /api/house/properties` - Manage properties
* `GET/PUT/DELETE /api/house/properties/[id]` - Individual property operations
* `GET/POST /api/house/areas` - Manage areas/rooms
* `GET/PUT/DELETE /api/house/areas/[id]` - Individual area operations
* `GET/POST /api/house/appliances` - Manage appliances
* `GET/POST /api/house/contractors` - Manage contractors
* `GET/POST /api/house/maintenance/templates` - Recurring chore templates
* `GET/POST /api/house/maintenance/records` - Maintenance tasks
* `GET /api/house/maintenance/upcoming` - Upcoming maintenance
* `GET/POST /api/house/supplies/items` - Supply catalog
* `GET/POST /api/house/supplies/stock` - Stock levels
* `GET/POST /api/house/supplies/purchases` - Purchase history
* `GET/POST /api/house/supplies/usage` - Usage tracking
* `GET/POST /api/house/utilities` - Utility bills
* `GET/POST /api/house/projects` - Home projects
* `GET/POST /api/house/projects/[id]/tasks` - Project tasks
* `GET/POST /api/house/documents` - Documents

**Remaining:**
* [ ] CSV import/export
* [ ] Next-due maintenance calculations view

---

### 9. Inventory — **UI COMPLETE** 🔴

**Frontend Features:**
* Item grid with images
* Category and location filtering
* Total value calculations
* Purchase date and quantity tracking
* Search functionality

**Database Ready:** `inventory_item`

**Backend Needed:**
* [ ] API routes and Supabase integration
* [ ] Value aggregation queries
* [ ] CSV import/export

---

### 10. Notes / Knowledge Base — **UI COMPLETE** 🔴

**Frontend Features:**
* Note list with grid view
* Real-time search
* Tag-based filtering
* Markdown editor support
* Created/updated timestamps
* Favorite notes

**Database Ready:** `note` (with full-text search)

**Views Ready:** `note_search`

**Backend Needed:**
* [ ] API routes and Supabase integration
* [ ] Full-text search integration
* [ ] Tag management system
* [ ] Markdown/CSV import/export

---

### 11. Travel Planner — **UI COMPLETE** 🔴

**Frontend Features:**
* Trip management with status (Planning, Upcoming, Active, Completed, Cancelled)
* Itinerary timeline with event types
* Journal entries with date tracking
* Countdown to upcoming trips
* Location and date range tracking

**Database Ready:** `trip`, `itinerary_item`, `trip_entry`

**Backend Needed:**
* [ ] API routes for trips, itinerary, entries
* [ ] Supabase client integration
* [ ] Countdown calculations
* [ ] CSV import/export

---

### 12. Nutrition Tracker — **UI COMPLETE** 🔴

**Frontend Features:**
* Daily macro tracking (Calories, Protein, Carbs, Fat)
* Meal type organization (Breakfast, Lunch, Dinner, Snacks)
* Water intake tracking with goal
* Macro progress bars vs. daily goals
* Date-based navigation
* Summary cards with percentages

**Database Ready:** `food_item`, `meal`, `meal_entry`, `nutrition_target`, `recipe`

**Views Ready:** `v_daily_macros`, `v_daily_macros_vs_target`

**Backend Needed:**
* [ ] API routes for food items, meals, entries, targets
* [ ] Supabase client integration
* [ ] Daily macro aggregation
* [ ] CSV import/export

---

## 🎨 UI/UX Features

### Navigation
* **Responsive Sidebar** with:
  - 6 grouped navigation sections:
    1. Overview (Dashboard)
    2. Shopping & Lists (Shopping, Wishlist)
    3. Home & Assets (Car, House, Inventory)
    4. Finance & Health (Finance, Nutrition)
    5. Personal Growth (Habits, Reading, Media)
    6. Planning (Travel, Notes)
  - Desktop: Hover to expand labels
  - Mobile: Swipeable drawer (left-edge swipe to open, swipe-left to close)
  - Active route highlighting with purple accent
  - Import/Export button in footer

### Design System
* **Dark theme** with gray-950 background
* **Color-coded modules** for visual distinction
* **Responsive layouts** with Tailwind CSS
* **Icon library** from Lucide React
* **Touch-friendly** UI with mobile optimizations
* **Modal-based** forms for add/edit operations
* **Confirmation dialogs** for destructive actions

### Mobile Optimizations
* Swipe gesture support for sidebar
* Responsive grid layouts
* Touch-friendly buttons (larger hit areas)
* Long-press selection mode (500ms)
* Mobile-optimized inputs and dropdowns

---

## 🗄️ Database Architecture

### Active Tables (30+)
All tables created and ready. 15 actively used, 15+ ready for future features.

**Shopping & Lists:**
* `shopping_list`, `shopping_list_item`
* `wishlist_item`
* `inventory_item`

**Media & Reading:**
* `media_item`, `media_log`
* `book`, `reading_log`

**Car Tracking:**
* `vehicle`, `odometer_log`, `fuel_log`
* `maintenance_template`, `maintenance_record`

**House Management:**
* `home_property`, `home_area`, `home_appliance`
* `home_maintenance_template`, `home_maintenance_record`
* `home_supply_item`, `home_supply_stock`, `home_supply_purchase`, `home_supply_usage`

**Habits & Goals:**
* `habit`, `habit_log`, `goal`

**Finance:**
* `account`, `category`, `transaction`, `merchant`, `subscription`, `transfer`
* `import_run`, `import_error`, `import_mapping_preset`
* `csv_upload_batch` (upload tracking)
* `finance_normalized` (unified transaction format)
* Raw CSV tables: `raw_capital_one_360_checking`, `raw_capital_one_360_savings`, `raw_capital_one_savor`, `raw_capital_one_venture_x`, `raw_chase_amazon`, `raw_discover_it`

**Travel:**
* `trip`, `itinerary_item`, `trip_entry`

**Nutrition:**
* `food_item`, `meal`, `meal_entry`, `nutrition_target`, `recipe`

**Notes:**
* `note` (with full-text search capability)

### Shared Infrastructure
* **Tag system**: `tag`, `tag_map` (supports all modules)
* **File storage**: `file` table for attachments
* **Import/Export**: `import_run`, `import_error`, `import_mapping_preset`

### Database Views
Materialized views for optimized queries:
* `v_media_episodes_per_week`
* `v_vehicle_last_odo`
* `v_maintenance_next_due`
* `v_reading_pace_week`
* `v_habit_daily_totals`
* `v_goal_progress`
* `v_spend_by_month`
* `v_home_maintenance_next_due`
* `v_home_supply_usage_month`
* `v_daily_macros`
* `v_daily_macros_vs_target`
* `note_search` (FTS view)

---

## 📊 Current Live Data

* **Shopping Lists**: 2 lists, 87 items
* **Wishlist**: 3 items
* **Media Tracker**: 122 items
* **Car Tracker**: 1 vehicle, 15 templates, 2 records, 1 odometer log
* **Reading Tracker**: 2 books
* **Habits**: Backend connected, needs data entry
* **Finance**: 1 account (360 Checking), 37 transactions imported
* **House Tracker**: 1 property (Brellon Townhome), 7 areas, 6 chore templates

**Total Items Tracked**: 265+ across all modules

---

## 🚧 Development Roadmap

### Priority 1: Expand Usage of Active Modules
* [ ] Continue daily use of Shopping, Wishlist, and Media
* [ ] Add more vehicles and maintenance records to Car Tracker
* [ ] Add more books to Reading Tracker
* [ ] Populate Habits & Goals with daily tracking
* [ ] Implement CSV import/export for active modules

### Priority 2: Expand Finance Module ✅ (In Progress)
* [✅] CSV upload system with multi-source support
* [✅] Automated normalization pipeline
* [✅] Transaction display with category breakdown
* [ ] Import remaining account CSVs (Savings, Credit Cards)
* [ ] Enable smart deduplication
* [ ] Category auto-assignment logic
* [ ] Budget tracking UI
* [ ] Transaction editing/categorization

### Priority 3: Connect Next Backend Module
* [✅] **House** - Maintenance and supply tracking (COMPLETE)
* [ ] **Nutrition** - Daily macro tracking

### Priority 4: Import/Export Framework
* [✅] Build CSV upload interface with account/source selection
* [✅] Automated normalization with database triggers
* [✅] Batch upload tracking with csv_upload_batch table
* [ ] Implement validation and preview before import
* [ ] Create "Export All" functionality
* [ ] Add detailed error handling and reporting

### Priority 5: Dashboard Integration
* [ ] Connect dashboard stats to real data across modules
* [ ] Build recent activity feed aggregation
* [ ] Implement upcoming items timeline
* [ ] Add global search across all modules

### Priority 6: Advanced Features
* [ ] Real-time collaboration on shared lists
* [ ] Mobile app with offline support
* [ ] Barcode scanning for shopping/inventory
* [ ] Recipe integration with shopping lists
* [ ] Analytics dashboards for spending, habits, media consumption
* [ ] API integrations (delivery services, streaming platforms)

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## 📂 Project Structure

```
rosendohq/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # Dashboard hub page
│   │   ├── shopping/             # Shopping lists module
│   │   ├── wishlist/             # Wishlist module
│   │   ├── media/                # Media tracker module
│   │   ├── car/                  # Car tracker module
│   │   │   └── components/       # Tab components (Dashboard, Maintenance, Fuel, Tires, Incidents)
│   │   ├── reading/              # Reading tracker module
│   │   ├── habits/               # Habits & Goals module
│   │   ├── finance/              # Finance module (UI only)
│   │   ├── house/                # House tracker (UI only)
│   │   ├── inventory/            # Inventory (UI only)
│   │   ├── notes/                # Notes/KB (UI only)
│   │   ├── travel/               # Travel planner (UI only)
│   │   ├── nutrition/            # Nutrition tracker (UI only)
│   │   ├── api/                  # API routes
│   │   │   ├── shopping/         # Shopping API
│   │   │   ├── wishlist/         # Wishlist API
│   │   │   ├── media/            # Media API
│   │   │   ├── books/            # Books API
│   │   │   ├── car/              # Car API
│   │   │   ├── habits/           # Habits API
│   │   │   ├── finance/          # Finance API
│   │   │   └── house/            # House Tracker API
│   │   ├── layout.tsx            # Root layout with sidebar
│   │   └── page.tsx              # Home page
│   ├── components/               # Reusable UI components
│   │   ├── dashboard/            # Dashboard components
│   │   └── Sidebar.tsx           # Navigation sidebar
│   ├── lib/                      # Utilities and database client
│   │   └── supabase/
│   │       └── client.ts         # Supabase client
│   ├── types/                    # TypeScript type definitions
│   │   └── database.types.ts     # Generated DB types
│   └── instrumentation.ts        # Sentry instrumentation
├── public/                       # Static assets
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── sentry.client.config.ts       # Sentry client config
├── sentry.server.config.ts       # Sentry server config
├── sentry.edge.config.ts         # Sentry edge config
└── package.json                  # Dependencies
```

---

## 🔐 Environment Variables

Required environment variables (`.env.local`):

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Sentry DSN is configured in Sentry config files.

---

## 📈 Recent Updates

**Latest Features (Last 30 commits):**
* **Finance Module Launch**: Complete CSV import pipeline with automated normalization
* Account management: Add accounts via modal form (checking, savings, credit, etc.)
* Multi-source CSV support (6 different bank/card formats)
* Database triggers for automatic raw → normalized → transaction flow
* Upload modal with account and source selection
* Month selector with dynamic date calculations
* Transaction display with category breakdown and spending analysis
* Quick Stats sidebar with monthly income, expenses, and net income
* Fixed date range queries for all month lengths
* Removed top summary badges for cleaner UI
* Refined UI spacing and sizing for media and shopping pages
* Removed stats sections for cleaner page layouts
* Refactored BookCard action buttons UI
* Added delete confirmation modals across modules
* Added book highlights feature to reading tracker
* Implemented quick priority rating (1-5 scale) for shopping items
* Added media type filter tabs (anime, show, movie)
* Enhanced vehicle management with stats display
* Added season and episode tracking for TV shows
* Implemented platform badges with brand colors
* Mobile optimization with swipe support for sidebar
* Category-based grouping for shopping lists
* Bulk operations with selection mode
* Habits page redesign with stats section

---

## 📝 CSV Import/Export Headers Reference

### Shopping Lists
* **Lists**: `name,notes`
* **Items**: `list,itemName,quantity,unit,neededBy,priority,notes,category,aisle,storePreference`

### Wishlist
* **Items**: `title,category,status,url,notes,priority,priceCents,vendor,brand,color,size,imageUrl`

### Media
* **Items**: `title,type,status,totalEpisodes,currentEpisode,rating,platform,totalSeasons,currentSeason`
* **Logs**: `mediaTitle,logDate,progress,note`

### Reading
* **Books**: `title,author,status,startedAt,finishedAt,rating,currentPage,totalPages,format`
* **Logs**: `book,logDate,pages,minutes,note`

### Car
* **Vehicles**: `make,model,year,vin,nickname,licensePlate,color,purchaseDate,purchasePriceCents,purchaseMileage`
* **Odometer**: `vehicle,logDate,mileage`
* **Fuel**: `vehicle,fillDate,odometer,gallons,totalCents,fuelType,isFullTank,stationName`
* **Maintenance Templates**: `name,intervalMiles,intervalMonths,priority,category,estimatedCostCents`
* **Maintenance Records**: `vehicle,serviceDate,mileage,costCents,vendor,warrantyWork,notes`

### Habits & Goals
* **Habits**: `name,unit,targetValue,category,timeOfDay,schedule`
* **Logs**: `habit,logDate,value,note,timeOfDay,mood`
* **Goals**: `name,targetValue,unit,dueDate,status,progressSource,habitId`

### Finance
**Note:** Finance now uses automated CSV upload. See supported formats below:

**Capital One 360 Checking/Savings CSV Format:**
* Headers: `Account Number,Transaction Description,Transaction Date,Transaction Type,Transaction Amount,Balance`
* Date format: MM/DD/YY
* Transaction Type: Credit or Debit

**Capital One Savor/Venture X CSV Format:**
* Headers: `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit`
* Date format: YYYY-MM-DD
* Amounts in Debit or Credit columns (one will be empty)

**Chase Amazon CSV Format:**
* Headers: `Transaction Date,Post Date,Description,Category,Type,Amount,Memo`
* Date format: MM/DD/YYYY
* Amount is signed (negative for expenses)

**Discover IT CSV Format:**
* Headers: `Trans. Date,Post Date,Description,Amount,Category`
* Date format: MM/DD/YYYY
* Amount is signed (negative for expenses)

### House
* **Properties**: `name,address1,city,state,postalCode,country`
* **Areas**: `property,name,type,notes`
* **Maintenance Records**: `property,area,serviceDate,costCents,vendor,notes`
* **Supplies**: `name,unit,minQuantity`

### Nutrition
* **Food Items**: `name,servingSize,calories,protein,carbs,fat`
* **Meals**: `mealDate,type,name`
* **Targets**: `startDate,endDate,calories,protein,carbs,fat`

### Travel
* **Trips**: `name,location,startDate,endDate,status`
* **Itinerary**: `trip,datetime,type,title,details`
* **Entries**: `trip,entryDate,contentMD`

### Notes
* **Notes**: `title,contentMD,tags,isFavorite`

### Inventory
* **Items**: `name,quantity,unit,location,acquiredAt,valueCents,category`

---

## 🎯 Project Goals

**Primary Objective**: Build a comprehensive personal life management system that consolidates shopping, media tracking, reading, habits, finances, and more into a single, unified platform.

**Core Principles**:
* **Privacy-first**: Self-hosted with full data ownership
* **Type-safe**: Strict TypeScript throughout
* **Performance**: Optimized queries and minimal API calls
* **Mobile-friendly**: Touch-optimized with responsive design
* **Extensible**: Modular architecture for easy feature additions

---

## 📄 License

Personal use only. Not licensed for distribution or commercial use.

---

## 🤝 Contributing

This is a personal project not accepting external contributions.

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and Tailwind CSS**
