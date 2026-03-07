# Describe Table

Add descriptions to Supabase tables/views and all their columns.

## Steps

1. Parse `$ARGUMENTS` for the table or view name(s). If none provided, ask the user which table(s) or view(s) to describe.
2. For each table/view, use the Supabase MCP `execute_sql` tool to inspect its structure:

```sql
SELECT
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  col_description(t.oid, c.ordinal_position) AS existing_description
FROM information_schema.columns c
JOIN pg_class t ON t.relname = c.table_name
JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = c.table_schema
WHERE c.table_schema = 'public'
  AND c.table_name = '<TABLE_NAME>'
ORDER BY c.ordinal_position;
```

Also fetch the current table description:

```sql
SELECT obj_description(oid) AS table_description
FROM pg_class
WHERE relname = '<TABLE_NAME>' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

3. Analyze the table structure, column names, types, defaults, and any existing descriptions.
4. Draft a clear, concise description for:
   - The table/view itself (what it stores, its role in the system)
   - Every column (what it represents, its purpose, any important constraints or relationships)
5. Present the drafted descriptions to the user for review before applying.
6. Once approved, apply all descriptions using `execute_sql` with `COMMENT ON` statements:

```sql
COMMENT ON TABLE public.<TABLE_NAME> IS 'Your table description here';
COMMENT ON COLUMN public.<TABLE_NAME>.<COLUMN_NAME> IS 'Your column description here';
```

For views, use `COMMENT ON VIEW` instead of `COMMENT ON TABLE`. Column comments use the same `COMMENT ON COLUMN` syntax for both tables and views.

7. Verify the descriptions were applied by re-running the inspection queries from step 2.

## Rules

- Always inspect the table structure first — never guess at columns
- Draft all descriptions before applying any
- Always ask for user approval before running the COMMENT statements
- Keep descriptions concise but informative (1-2 sentences max per column)
- Mention foreign key relationships in column descriptions when relevant
- For views, describe what the view computes or aggregates
- If a column already has a description, show it and ask if the user wants to update it
- If `$ARGUMENTS` contains multiple table names (comma or space separated), process them all
