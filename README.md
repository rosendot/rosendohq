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

---

## Current Implementation Status

### Phase 0 — Foundations ✅ **COMPLETE**

**Completed:**
* Next.js scaffold (TS, ESLint, Prettier, Tailwind v4, Turbopack), GitHub, local dev
* Vercel project + environment variables configured
* **Sentry integration**: Full error monitoring with Discord notifications
* **GitHub integrations**: Connected to Supabase, Vercel, and Sentry
* Supabase: Postgres, **Auth enabled**, **Storage** (`files`, `images optional`), **RLS** single-owner
* Shared DB: `tag`, `note` (+FTS), `tag_map`, `import_run`, `import_error`, `file`, `import_mapping_preset`
* **Row defaults**: all real tables have `owner_id default auth.uid()` (views excluded; expected)
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
* [ ] List sharing functionality (optional)
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
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
* [ ] Auth-protected data fetching
* [ ] Daily macro aggregation
* [ ] Goal comparison queries
* [ ] CSV import endpoint
* [ ] CSV export endpoint

**Database:** ✅ Complete
* Tables: `food_item`, `meal`, `meal_entry`, `nutrition_target`
* Views: `v_daily_macros`, `v_daily_macros_vs_target`

---

## Global Features Status

### ✅ Completed
* Dark theme UI with Tailwind CSS v4
* Collapsible sidebar navigation
* Dashboard page with module cards
* Consistent page layouts across all modules
* Mock data for development/testing
* Client-side state management
* Responsive design (mobile-friendly)
* Module icons and color coding
* All 12 module pages fully built

### 🔴 Pending — High Priority

#### Authentication & Security
* [ ] Supabase Auth provider setup
* [ ] Login/signup pages
* [ ] Protected routes middleware
* [ ] User session management
* [ ] Auth callbacks
* [ ] RLS policy testing

#### Backend API Layer
* [ ] Create `/api` routes for all modules
* [ ] Supabase client initialization
* [ ] Server-side validation
* [ ] Error handling middleware
* [ ] API response standardization

#### Data Import Framework
* [ ] CSV upload component
* [ ] Column mapping interface
* [ ] Preview/validation step
* [ ] Batch insert with import_run_id
* [ ] Error reporting and download
* [ ] Mapping preset save/load

#### Data Export
* [ ] Per-module CSV export
* [ ] Export All (JSON zip)
* [ ] Download handlers

### 🟡 Pending — Medium Priority

#### Dashboard Integration
* [ ] Real-time stats from all modules
* [ ] Recent activity feed
* [ ] Upcoming items aggregation
* [ ] Module-specific cards with live data

#### Cross-Module Features
* [ ] Global tag management
* [ ] Tag filtering across modules
* [ ] Global search
* [ ] Calendar view (renewals, maintenance, goals, trips)

#### Import History & Rollback
* [ ] Import history page
* [ ] Rollback by import_run_id
* [ ] Import error visualization

### 🟢 Pending — Polish & Optimization
* [ ] Performance optimization (pagination, lazy loading)
* [ ] Index verification in database
* [ ] UX improvements (loading states, error boundaries)
* [ ] Form validation on all inputs
* [ ] Toast notifications
* [ ] Confirmation modals for destructive actions
* [ ] Keyboard shortcuts
* [ ] Accessibility improvements

---

## Implementation Roadmap

### Week 1-2: Core Backend Infrastructure
**Goal:** Auth & API foundation ready

1. **Authentication Setup**
   - [ ] Set up Supabase Auth provider
   - [ ] Create login/signup pages
   - [ ] Implement protected routes middleware
   - [ ] Test RLS policies for all tables
   - [ ] Add session management

2. **API Foundation**
   - [ ] Create base API route structure (`/api/[module]`)
   - [ ] Set up Supabase server client
   - [ ] Implement standard error handling
   - [ ] Create API utilities and helpers
   - [ ] Add request validation

### Week 3-4: Module Backend Integration (Priority Batch 1)
**Goal:** 3 high-value modules fully functional

1. **Finance** (Complex data model, high value)
   - [ ] Implement accounts CRUD API
   - [ ] Implement transactions CRUD API
   - [ ] Implement budgets CRUD API
   - [ ] Add transaction deduplication logic
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

2. **Habits & Goals** (Daily usage, high engagement)
   - [ ] Implement habits CRUD API
   - [ ] Implement habit logs CRUD API
   - [ ] Implement goals CRUD API
   - [ ] Add streak calculation endpoint
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

3. **Shopping & Wishlist** (Simple, high utility)
   - [ ] Implement shopping lists CRUD API
   - [ ] Implement shopping items CRUD API
   - [ ] Implement wishlist CRUD API
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

### Week 5-6: Module Backend Integration (Priority Batch 2)
**Goal:** 4 more modules functional

4. **Media & Reading** (Similar patterns)
   - [ ] Implement media items/logs CRUD API
   - [ ] Implement books/reading logs CRUD API
   - [ ] Add progress calculation endpoints
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

5. **Car Tracker** (Maintenance tracking)
   - [ ] Implement vehicles CRUD API
   - [ ] Implement maintenance records CRUD API
   - [ ] Add next-due calculation endpoint
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

6. **House Tracker** (Maintenance + supplies)
   - [ ] Implement properties/rooms CRUD API
   - [ ] Implement maintenance tasks CRUD API
   - [ ] Implement supplies CRUD API
   - [ ] Add low-stock alert endpoint
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

### Week 7: Module Backend Integration (Final Batch)
**Goal:** All modules functional

7. **Travel Planner** (Content-heavy)
   - [ ] Implement trips CRUD API
   - [ ] Implement itinerary items CRUD API
   - [ ] Implement trip entries CRUD API
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

8. **Notes** (FTS integration)
   - [ ] Implement notes CRUD API
   - [ ] Add full-text search endpoint
   - [ ] Implement tag management
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

9. **Nutrition** (Aggregation-heavy)
   - [ ] Implement food items CRUD API
   - [ ] Implement meals/entries CRUD API
   - [ ] Add daily macro aggregation endpoint
   - [ ] Connect frontend to APIs
   - [ ] Test RLS policies

10. **Inventory** (Final module)
    - [ ] Implement inventory items CRUD API
    - [ ] Add value aggregation endpoint
    - [ ] Connect frontend to APIs
    - [ ] Test RLS policies

### Week 8-9: Import/Export Framework
**Goal:** Complete data import/export system

1. **Import Framework**
   - [ ] Build reusable CSV upload component
   - [ ] Create column mapping interface
   - [ ] Implement validation and preview
   - [ ] Add batch insert with import_run_id
   - [ ] Create error reporting system
   - [ ] Implement mapping preset storage
   - [ ] Add import endpoints for all modules
   - [ ] Test with real CSV data

2. **Export Framework**
   - [ ] Create per-module CSV export endpoints
   - [ ] Implement Export All (JSON zip)
   - [ ] Add download handlers
   - [ ] Test data integrity

3. **Import History**
   - [ ] Create import history page
   - [ ] Implement rollback functionality
   - [ ] Add import error visualization

### Week 10: Cross-Module Features & Polish
**Goal:** Production-ready application

1. **Dashboard Real Data**
   - [ ] Connect all dashboard stats to APIs
   - [ ] Implement recent activity feed
   - [ ] Add upcoming items aggregation
   - [ ] Create module-specific widgets

2. **Cross-Module Features**
   - [ ] Implement global tag management
   - [ ] Add tag filtering across modules
   - [ ] Create global search
   - [ ] Build calendar view

3. **Performance & Polish**
   - [ ] Add pagination to all lists
   - [ ] Implement lazy loading
   - [ ] Optimize database queries
   - [ ] Add loading states
   - [ ] Implement error boundaries
   - [ ] Add toast notifications
   - [ ] Create confirmation modals
   - [ ] Test on mobile devices

4. **Final Testing**
   - [ ] End-to-end testing all features
   - [ ] Security audit
   - [ ] Performance testing
   - [ ] Bug fixes

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

## Success Criteria

### Minimum Viable Product (MVP)
* [ ] User authentication working
* [ ] At least 3 modules fully functional (Finance, Habits, Shopping recommended)
* [ ] Basic import/export for those modules
* [ ] Dashboard with real data from those modules
* [ ] Mobile responsive
* [ ] Error monitoring active

### Full Launch
* [ ] All 12 modules fully functional with backend
* [ ] Complete import/export framework
* [ ] Global search and filtering
* [ ] Calendar view
* [ ] Performance optimized (all lists paginated)
* [ ] Mobile responsive across all pages
* [ ] Error monitoring and logging
* [ ] Documentation complete
* [ ] Security audit passed
* [ ] E2E tests for critical flows

---

## Monitoring & Alerting Workflow

1. **Development**: Code pushed to GitHub triggers Vercel deployment
2. **Error Detection**: Sentry captures errors across all environments
3. **Notification**: Critical errors automatically posted to Discord
4. **Issue Tracking**: GitHub issues created for recurring errors
5. **Resolution**: Commits linked back to Sentry for error resolution tracking