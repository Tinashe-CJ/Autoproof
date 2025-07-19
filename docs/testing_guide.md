# Database Schema Testing Guide

This guide explains how to test that the AutoProof database schema implementation worked correctly.

## 🚀 Quick Start Testing

### Option 1: Python Script (Recommended)

1. **Set up your environment:**
   ```bash
   # Make sure you're in the project root
   cd /Users/tinashechangunda/startup/Autoproof
   
   # Install dependencies if not already installed
   pip install -r requirements.txt
   ```

2. **Set your database URL:**
   ```bash
   # For local development
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/autoproof"
   
   # For Supabase (replace with your actual URL)
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Run the Python test script:**
   ```bash
   python3 scripts/test_database_schema.py
   ```

### Option 2: SQL Script

1. **Open your Supabase SQL Editor** or connect via psql
2. **Copy and paste** the contents of `scripts/test_database_sql.sql`
3. **Run the script** and review the results

## 📋 What the Tests Check

### 1. Table Existence
- ✅ All required tables exist (`teams`, `users`, `policy_rules`, `violation_logs`, `usage_logs`, `api_keys`)
- ✅ Stripe integration tables exist (`stripe_customers`, `stripe_subscriptions`, `stripe_orders`)

### 2. Table Structure
- ✅ All required columns exist with correct data types
- ✅ Primary keys and foreign keys are properly defined
- ✅ Default values and constraints are set correctly

### 3. Indexes
- ✅ Performance indexes exist for frequently queried columns
- ✅ Team-based indexes for multi-tenant queries
- ✅ Time-based indexes for analytics queries

### 4. SQLAlchemy Models
- ✅ All models import successfully
- ✅ Enum values are correctly defined
- ✅ Table names match the database schema
- ✅ Relationships are properly configured

### 5. Relationships
- ✅ Foreign key relationships work correctly
- ✅ Teams can have multiple users, policy rules, violations
- ✅ Users belong to teams and can create violations

### 6. Row Level Security (RLS)
- ✅ RLS is enabled on all multi-tenant tables
- ✅ Users can only access their team's data
- ✅ Proper policies are in place for each table

### 7. Data Integrity
- ✅ Enum constraints prevent invalid values
- ✅ Foreign key constraints prevent orphaned records
- ✅ Check constraints enforce business rules

### 8. Sample Data
- ✅ Seed data was inserted successfully
- ✅ Teams, policy rules, and violations exist
- ✅ Data can be queried and relationships work

### 9. Views and Functions
- ✅ `team_compliance_summary` view exists and works
- ✅ `update_updated_at_column` function exists
- ✅ Triggers are properly configured

## 🔧 Manual Testing Steps

If you want to test manually, here are the key things to check:

### 1. Apply the Migration

First, make sure the migration has been applied to your database:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in Supabase SQL Editor
# Copy the contents of: supabase_dir/migrations/20250719112731_compliance_schema.sql
```

### 2. Check Tables Exist

```sql
-- Run this in your SQL editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'users', 'policy_rules', 'violation_logs', 'usage_logs');
```

### 3. Check Sample Data

```sql
-- Check if seed data was inserted
SELECT COUNT(*) FROM teams;
SELECT COUNT(*) FROM policy_rules;
SELECT COUNT(*) FROM violation_logs;
```

### 4. Test Relationships

```sql
-- Test team-user relationship
SELECT t.name as team_name, COUNT(u.id) as user_count
FROM teams t
LEFT JOIN users u ON t.id = u.team_id
GROUP BY t.id, t.name;

-- Test team-policy relationship
SELECT t.name as team_name, COUNT(p.id) as policy_count
FROM teams t
LEFT JOIN policy_rules p ON t.id = p.team_id
GROUP BY t.id, t.name;
```

### 5. Test RLS Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('policy_rules', 'violation_logs', 'usage_logs');
```

## 🐛 Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors:**
   - Make sure the migration was applied
   - Check that you're connected to the right database
   - Verify the migration file was copied correctly

2. **"Permission denied" errors:**
   - Check your database connection string
   - Ensure your user has the necessary permissions
   - Verify RLS policies are configured correctly

3. **"Foreign key constraint" errors:**
   - Make sure all referenced tables exist
   - Check that the data types match between tables
   - Verify the foreign key columns are properly indexed

4. **"Enum constraint" errors:**
   - Check that enum values match exactly (case-sensitive)
   - Verify the enum types are created in the database

### Getting Help

If tests fail, check:

1. **Migration logs** in Supabase dashboard
2. **Database connection** and credentials
3. **SQLAlchemy model imports** and dependencies
4. **Environment variables** and configuration

## 📊 Expected Test Results

When everything is working correctly, you should see:

```
🚀 Starting Database Schema Tests...
==================================================

🔍 Testing Table Existence...
✅ PASS Table 'teams' exists
✅ PASS Table 'users' exists
✅ PASS Table 'policy_rules' exists
✅ PASS Table 'violation_logs' exists
✅ PASS Table 'usage_logs' exists
✅ PASS Table 'api_keys' exists

🔍 Testing Table Structure...
✅ PASS policy_rules.id column exists
✅ PASS policy_rules.team_id column exists
✅ PASS policy_rules.name column exists
...

🔍 Testing Indexes...
✅ PASS Index idx_policy_rules_team_id exists on policy_rules
✅ PASS Index idx_policy_rules_active exists on policy_rules
...

🔍 Testing SQLAlchemy Models...
✅ PASS All models import successfully
✅ PASS PlanType enum values
✅ PASS SeverityLevel enum values
...

==================================================
📊 Test Summary:
✅ Passed: 45/45
❌ Failed: 0/45
🎉 All tests passed! Database schema is working correctly.
```

## 🎯 Next Steps

Once the database schema tests pass:

1. **Move to Task 3**: Authentication and Authorization System
2. **Test API endpoints** that use the new schema
3. **Verify frontend components** work with the new data structure
4. **Run integration tests** to ensure everything works together

The database schema is now ready for the next phase of development! 🚀 