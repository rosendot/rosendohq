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

---

## Current Implementation Status

### Phase 0 — Foundations ✅ **COMPLETE**

**Completed:**
* Next.js scaffold (TS, ESLint, Prettier, Tailwind v4, Turbopack), GitHub, local dev
* Vercel project + environment variables configured
* **Sentry integration**: Full error monitoring with Discord notifications
* **GitHub integrations**: Connected to Supabase, Vercel, and Sentry
* Supabase: Postgres database with **Storage** (`files`, `images optional`)
* Shared DB: `tag`, `note` (+FTS), `tag_map`, `import_run`, `import_error`, `file`, `import_mapping_preset`
* **Tags**: `tag_map` extended to support cross-module tagging (entity types include `note`, `media_item`, `book`, `vehicle`, `trip`, `habit`, `food_item`, `shopping_item`, `inventory_item`, `wishlist_item`)
* **All database tables created** for all modules
* **All views created** for all modules
* **Dark theme UI** with collapsible sidebar navigation
* **Dashboard page** with module cards, stats, and quick links
* **All 12 module pages built** with complete UI/UX (running on mock data)

**Pending:**
* Import framework (Upload → Map → Preview → Commit → Report)
* Save/recall **mapping presets** per source
* Rollback by `import_run_id`
* Export All: server action to stream a single JSON zip of all user data

---

## Module Implementation Status

### 🟢 Finance Module — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/finance`)
* Account cards with balances and types
* Monthly summary stats (income, expenses, net)
* Recent transactions list with categories
* Budget progress tracking
* Spending by category breakdown
* Quick stats (avg daily spending, largest expense)
* Month selector for historical data

**Backend Needed:**
* [ ] API routes for accounts CRUD
* [ ] API routes for transactions CRUD
* [ ] API routes for budgets CRUD
* [ ] Supabase client integration
* [ ] Real-time balance calculations
* [ ] Transaction categorization logic
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `account`, `category`, `transaction`, `subscription`
* Views: `v_spend_by_month`, `v_upcoming_renewals`
* Dedupe function + trigger

---

### 🟢 Shopping Lists — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/shopping`)
* List sidebar with item counts
* Active/completed item sections
* Search and filter functionality
* Quick stats dashboard
* Mark items as done
* Priority indicators

**Backend Needed:**
* [ ] API routes for shopping lists CRUD
* [ ] API routes for shopping items CRUD
* [ ] Supabase client integration
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `shopping_list`, `shopping_list_item`
* Views: `v_shopping_open_items`

---

### 🟢 Wishlist — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/wishlist`)
* Grid view of wishlist items
* Category and status filters
* Priority-based sorting
* URL links to products
* Search functionality
* Purchase tracking

**Backend Needed:**
* [ ] API routes for wishlist items CRUD
* [ ] Supabase client integration
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `wishlist_item`
* Views: `v_wishlist_active`

---

### 🟢 Inventory — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/inventory`)
* Item grid with categories and locations
* Total value calculations
* Location-based filtering
* Purchase date tracking
* Search and filter

**Backend Needed:**
* [ ] API routes for inventory items CRUD
* [ ] Supabase client integration
* [ ] Value aggregation queries
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `inventory_item`
* Views: `v_inventory_summary`

---

### 🟢 Car Tracker — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/car`)
* Vehicle selector sidebar
* Maintenance records timeline
* Cost tracking and averages
* Quick stats dashboard
* Vendor tracking

**Backend Needed:**
* [ ] API routes for vehicles CRUD
* [ ] API routes for maintenance records CRUD
* [ ] API routes for odometer logs CRUD
* [ ] API routes for fuel logs CRUD
* [ ] Supabase client integration
* [ ] Next-due calculations (by mileage/time)
* [ ] Cost aggregation queries
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `vehicle`, `odometer_log`, `maintenance_template`, `maintenance_record`, `fuel_log`
* Views: `v_vehicle_last_odo`, `v_maintenance_next_due`

---

### 🟢 House Tracker — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/house`)
* Room management
* Maintenance task tracking with status/priority
* Supply tracking with low-stock alerts
* Quick stats dashboard
* Upcoming tasks sidebar

**Backend Needed:**
* [ ] API routes for properties CRUD
* [ ] API routes for areas/rooms CRUD
* [ ] API routes for maintenance tasks CRUD
* [ ] API routes for supplies CRUD
* [ ] Supabase client integration
* [ ] Next-due maintenance calculations
* [ ] Low-stock alert queries
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `home_property`, `home_area`, `home_appliance`, `home_maintenance_template`, `home_maintenance_record`, `home_supply_item`, `home_supply_stock`, `home_supply_purchase`, `home_supply_usage`
* Views: `v_home_maintenance_next_due`, `v_home_supply_low_stock`, `v_home_supply_usage_month`

---

### 🟢 Media Tracker — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/media`)
* Multi-type support (movies, TV, games, music)
* Status tracking (planning, in-progress, completed, on-hold, dropped)
* Rating system (1-5 stars)
* Progress tracking for TV shows (episode counts)
* Genre and format filtering
* Release year tracking

**Backend Needed:**
* [ ] API routes for media items CRUD
* [ ] API routes for media logs CRUD
* [ ] Supabase client integration
* [ ] Progress calculation queries
* [ ] Continue watching logic
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `media_item`, `media_log`
* Views: `v_media_continue_watching`, `v_media_episodes_per_week`

---

### 🟢 Reading Tracker — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/reading`)
* Book status tracking (want-to-read, reading, completed, on-hold, dropped)
* Reading progress (current/total pages)
* Rating system (1-5 stars)
* Genre and format filtering (physical, ebook, audiobook)
* Start/completion date tracking
* Notes and reviews

**Backend Needed:**
* [ ] API routes for books CRUD
* [ ] API routes for reading logs CRUD
* [ ] API routes for highlights CRUD
* [ ] Supabase client integration
* [ ] Reading pace calculations
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `book`, `reading_log`, `highlight`
* Views: `v_reading_pace_week`

---

### 🟢 Habits & Goals — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/habits`)
* Daily habit tracking with progress bars
* Streak calculations
* Quick increment buttons
* Goal tracking with progress visualization
* Priority-based goal sorting
* Days remaining countdown

**Backend Needed:**
* [ ] API routes for habits CRUD
* [ ] API routes for habit logs CRUD
* [ ] API routes for goals CRUD
* [ ] Supabase client integration
* [ ] Streak calculation logic
* [ ] Goal progress aggregation
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `habit`, `habit_log`, `goal`
* Views: `v_habit_daily_totals`, `v_goal_progress`

---

### 🟢 Notes / Knowledge Base — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/notes`)
* Note list with search
* Tag-based filtering
* Markdown editor (plain textarea)
* Note viewer
* Created/updated timestamps

**Backend Needed:**
* [ ] API routes for notes CRUD
* [ ] Supabase client integration
* [ ] Full-text search integration
* [ ] Tag management
* [ ] CSV import endpoint (or .md file import)
* [ ] CSV export endpoint (or .md file export)

**Database:** ✅ Complete
* Tables: `note` (with FTS)
* Tag support via `tag_map`

---

### 🟢 Travel Planner — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/travel`)
* Trip management with status (planning, upcoming, active, completed)
* Itinerary timeline by date/time
* Journal entries per trip
* Countdown to trips

**Backend Needed:**
* [ ] API routes for trips CRUD
* [ ] API routes for itinerary items CRUD
* [ ] API routes for trip entries CRUD
* [ ] Supabase client integration
* [ ] Countdown calculations
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `trip`, `itinerary_item`, `trip_entry`
* Views: `v_trip_countdowns`

---

### 🟢 Nutrition Tracker — **UI Complete, Backend Pending**

**Frontend Status:** ✅ Complete (`/nutrition`)
* Daily macro tracking (calories, protein, carbs, fat)
* Meal type organization (breakfast, lunch, dinner, snack)
* Water intake tracking
* Macro progress bars vs. goals
* Calorie remaining/over calculations

**Backend Needed:**
* [ ] API routes for food items CRUD
* [ ] API routes for meals CRUD
* [ ] API routes for meal entries CRUD
* [ ] API routes for nutrition targets CRUD
* [ ] Supabase client integration
* [ ] Daily macro aggregation
* [ ] Goal comparison queries
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `food_item`, `meal`, `meal_entry`, `nutrition_target`
* Views: `v_daily_macros`, `v_daily_macros_vs_target`

---

## Next Steps - Priority Order

### 🔴 **Phase 1: Core Backend Integration** (Pick one module to start)

Choose your most-used module to start with. Recommended order based on utility:

1. **Finance** - Track daily expenses and income
2. **Habits** - Daily tracking and streak building
3. **Shopping** - Immediate practical use
4. **Notes** - Quick capture and reference
5. **Media/Reading** - Entertainment tracking
6. Rest of modules as needed

**For each module:**
* [ ] Create API routes (`/api/[module]/route.ts`)
* [ ] Set up Supabase client integration
* [ ] Replace mock data with real database queries
* [ ] Test CRUD operations
* [ ] Verify data persistence

### 🟡 **Phase 2: Import/Export Framework**

Once you have a few modules working with real data:

* [ ] Build CSV upload component
* [ ] Create column mapping interface
* [ ] Implement validation and preview
* [ ] Add batch insert with import_run_id
* [ ] Create error reporting
* [ ] Implement mapping preset storage
* [ ] Add CSV export for each module
* [ ] Create "Export All" functionality (JSON zip)

### 🟢 **Phase 3: Dashboard & Cross-Module Features**

After most modules are functional:

* [ ] Connect dashboard stats to real data
* [ ] Add recent activity feed
* [ ] Build upcoming items aggregation
* [ ] Implement global tag management
* [ ] Create global search across modules
* [ ] Build calendar view (optional)

### 💎 **Phase 4: Polish & Quality of Life**

Enhance as you use the site:

* [ ] Add pagination to long lists
* [ ] Implement loading states
* [ ] Add toast notifications
* [ ] Create confirmation modals
* [ ] Improve mobile responsiveness
* [ ] Add keyboard shortcuts (optional)
* [ ] Performance optimization as needed

---

## Development Workflow

Since this is a personal project with no timeline pressure:

1. **Pick a module** you want to use most
2. **Build the backend** for that module (API routes + Supabase integration)
3. **Test it thoroughly** with real data
4. **Use it daily** to find bugs and improvements
5. **Repeat** for the next module when ready

**Recommended Starting Module:**
* **Finance** if you want to track money immediately
* **Habits** if you want daily tracking and streaks
* **Shopping** if you need practical list management
* **Notes** if you want quick note capture

---

## CSV Headers Reference

### Shared
* **Tags**: `name,color`
* **Notes**: `title,contentMD,tags`

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
* **Highlights**: `book,location,text`

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

### Habits & Goals
* **Habits**: `name,unit,tags`
* **Habit Logs**: `habit,date,value,note`
* **Goals**: `name,targetValue,unit,dueDate,progressSource,habit`

### Nutrition
* **Food Items**: `name,servingSize,calories,protein,carbs,fat`
* **Meals**: `mealDate,name`
* **Meal Entries**: `meal,food,customName,servings,calories,protein,carbs,fat`
* **Nutrition Targets**: `startDate,endDate,calories,protein,carbs,fat`

### Lists
* **Shopping Lists**: `name,notes`
* **Shopping List Items**: `list,itemName,quantity,unit,neededBy,priority,notes,tags`
* **Inventory Items**: `name,quantity,unit,location,acquiredAt,notes,tags`
* **Wishlist Items**: `title,category,status,url,notes,priority,tags`

---

## Quick Start Guide

### Getting Started Today

1. **Choose your first module** based on what you need most
2. **Create the API routes** in `/api/[module]/route.ts`
3. **Set up Supabase client** in the API routes
4. **Replace mock data** in the frontend with API calls
5. **Test with real data** and iterate

### Example: Starting with Finance
```typescript
// 1. Create /api/finance/accounts/route.ts
// 2. Add GET, POST, PUT, DELETE handlers
// 3. Connect to Supabase
// 4. Update /finance/page.tsx to fetch real data
// 5. Start tracking your actual expenses!