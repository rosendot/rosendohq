# Personal Website — Project Plan & Checklist

## Phase 0 — Foundations (Week 1)

**Status (done)**

* Next.js scaffold (TS, ESLint, Prettier, Tailwind v4, Turbopack), GitHub, local dev.
* Vercel project + envs (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
* Supabase: Postgres, **Auth enabled**, **Storage** (`files`, `images optional`), **RLS** single-owner.
* Shared DB: `tag`, `note` (+FTS), `tag_map`, `import_run`, `import_error`, `file`, `import_mapping_preset`.
* **Row defaults**: all real tables have `owner_id default auth.uid()` (views excluded; expected).

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
* `/media`: Continue Watching, Backlog, **“+1 episode”** action.
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
* Dashboard: today’s habits card.

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

## Phase 3 — Car & Travel (Weeks 7–8)

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

### Week 10 — Cross-Module UX & QA

**Next steps**

* Dashboard page: cards (spend, renewals, continue watching, pace, habits, next-due, countdown, macros).
* Read-only calendar: renewals, maintenance due, goal deadlines, trip days.
* Import tooling: rollback by `import_run_id`, duplicate handling (hash + conflict strategies).
* Performance pass: confirm indexes; paginate heavy pages.
* Per-module CSV export endpoints.
* UX polish + error surfaces (show `import_error` with row numbers on preview).

---

# Data Model Summary (entity + log pattern)

**Shared**
✅ `Tag`, `TagMap`, `Note`, `File`, `ImportRun`, `ImportError`, `ImportMappingPreset`

**Finance**
✅ `Account`, `Category`, `Transaction`, `Subscription`

**Media**
✅ `MediaItem`, `MediaLog`

**Reading**
✅ `Book`, `ReadingLog`, `Highlight`

**Car**
✅ `Vehicle`, `OdometerLog`, `MaintenanceTemplate`, `MaintenanceRecord`, `FuelLog`

**Travel**
✅ `Trip`, `ItineraryItem`, `TripEntry`

**Habits & Goals**
✅ `Habit`, `HabitLog`, `Goal`

**Nutrition**
✅ `FoodItem`, `Meal`, `MealEntry`, `NutritionTarget`

---

# Import UX (consistent across modules)

1. **Upload** (CSV/JSON) → 2) **Auto-detect delimiter & header** →
2. **Field mapping** (save mapping presets per source, e.g., “Capital One Checking”) →
3. **Dry-run preview** (show parsed rows + validation flags) →
4. **Commit** (batch insert with duplicate detection) →
5. **Report** (rows imported, skipped, errors downloadable as CSV).

**Validation rules**

* Dates normalized to ISO.
* Amounts normalized to signed integers (cents) where relevant.
* Optional “de-dupe by hash” (e.g., `accountId + date + amount + merchant`).

---

# Risks & Mitigations

* **Free tier pauses (Supabase Free):** acceptable for personal use; upgrade to **Pro** (\~\$25) if it annoys you.
* **Large imports:** chunked inserts + background processing (still fine on Hobby).
* **Data correctness:** keep all imports immutable with an `import_run_id` so you can roll back a bad import in one click.

---

# Success Criteria (end of Week 10)

* One dashboard with **live cards from all 8 modules**.
* **Global search** across all entities with tag filters.
* **Calendar** of renewals, maintenance, goals, trips.
* **Import** flows working for each module with saved mapping presets.
* **Export All** (JSON) and **per-module CSV export**.
* Clear **Import history** and **rollback**.
