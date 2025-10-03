# HoloCheck Database Scripts

This directory contains properly separated SQL scripts for HoloCheck database management, following best practices for database architecture and change management.

## 📁 Script Overview

| Script | Purpose | Use Case | Risk Level |
|--------|---------|----------|------------|
| `01-database-creation.sql` | Complete database setup | New installations | Low |
| `02-database-migration.sql` | Add missing columns/tables | Existing databases with missing schema | Medium |
| `03-database-reset.sql` | Clear all data, preserve structure | Development/testing reset | High |
| `04-database-rollback.sql` | Revert migration changes | Migration caused issues | High |

## 🚀 Quick Start

### For New Installations
```sql
-- Use this for brand new HoloCheck setups
-- Copy and paste: 01-database-creation.sql
```

### For Existing Installations with Missing Columns
```sql
-- Use this if you get "Could not find the 'domain' column" error
-- Copy and paste: 02-database-migration.sql
```

## 📋 Detailed Script Guide

### 1. Database Creation Script
**File:** `01-database-creation.sql`
**Purpose:** Complete database setup for new HoloCheck installations
**Prerequisites:** Empty Supabase database
**Creates:** 11 tables with full multi-tenant support

**What it does:**
- ✅ Creates all 11 required tables
- ✅ Sets up proper indexes for performance
- ✅ Enables Row Level Security (RLS)
- ✅ Inserts default system configuration
- ✅ Includes verification and success confirmation

**When to use:**
- New HoloCheck installation
- Starting from scratch
- Want to ensure clean, complete setup

### 2. Database Migration Script
**File:** `02-database-migration.sql`
**Purpose:** Add missing columns and tables to existing installations
**Prerequisites:** Existing HoloCheck database with some tables
**Fixes:** "Could not find the 'domain' column" error

**What it does:**
- ✅ Adds missing `domain` column to `tenants` table
- ✅ Adds missing `subscription_plan`, `settings`, `status` columns
- ✅ Adds missing `employee_count`, `settings` to `companies`
- ✅ Creates `parameter_categories` and `tenant_parameters` tables
- ✅ Updates existing data with default values
- ✅ Preserves all existing data

**When to use:**
- Getting "domain column not found" error
- Have existing tenants/companies data
- Need to upgrade schema without losing data

### 3. Database Reset Script
**File:** `03-database-reset.sql`
**Purpose:** Clean reset while preserving table structure
**Prerequisites:** Existing HoloCheck database
**⚠️ WARNING:** Deletes ALL data

**What it does:**
- ❌ Deletes all tenant, company, user data
- ❌ Clears all biometric and analysis data
- ❌ Removes all audit logs
- ✅ Preserves table structure and indexes
- ✅ Resets system config to defaults
- ✅ Maintains RLS policies

**When to use:**
- Development/testing environment reset
- Need fresh start with same structure
- Clear all data but keep database schema

### 4. Database Rollback Script
**File:** `04-database-rollback.sql`
**Purpose:** Revert migration changes if issues occur
**Prerequisites:** Database that has been migrated
**⚠️ WARNING:** Removes migration changes

**What it does:**
- ❌ Removes columns added in migration
- ❌ Drops parameter tables
- ❌ Removes migration-specific indexes
- ✅ Creates temporary backup of essential data
- ✅ Returns database to pre-migration state

**When to use:**
- Migration caused unexpected issues
- Need to return to previous schema
- Want to try different migration approach

## 🔧 Execution Instructions

### Step-by-Step Process:

1. **Choose the right script** based on your situation
2. **Copy the entire script** from the appropriate file
3. **Open Supabase Dashboard** → SQL Editor
4. **Paste the script** into the editor
5. **Read the safety warnings** in the script comments
6. **Uncomment safety confirmations** if required (reset/rollback scripts)
7. **Click "Run"** to execute
8. **Check the output messages** for success confirmation
9. **Return to HoloCheck admin panel** to verify results

### Safety Features:

- **Pre-execution checks:** Scripts verify prerequisites
- **Safety confirmations:** High-risk scripts require explicit confirmation
- **Detailed logging:** All operations are logged with status messages
- **Verification steps:** Scripts verify their own success
- **Rollback capability:** Migration changes can be reverted if needed

## 🔍 Troubleshooting

### Common Issues:

**"Could not find the 'domain' column"**
- **Solution:** Use `02-database-migration.sql`
- **Cause:** Missing columns in existing installation

**"Tables already exist" warning**
- **Solution:** Use `02-database-migration.sql` instead of creation script
- **Cause:** Trying to create tables that already exist

**Migration script fails**
- **Solution:** Use `04-database-rollback.sql` then try creation script
- **Cause:** Corrupted migration state

**Reset script won't run**
- **Solution:** Uncomment the `SET LOCAL force_reset = 'yes';` line
- **Cause:** Safety check preventing accidental data loss

### Verification Commands:

```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%tenant%' OR table_name LIKE '%compan%';

-- Check for domain column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'domain';

-- Check system config
SELECT config_key, config_value FROM system_config;
```

## 📞 Support

If you encounter issues:

1. **Check the script output messages** - they contain detailed status information
2. **Verify prerequisites** - ensure you're using the right script for your situation
3. **Review the troubleshooting section** above
4. **Check HoloCheck admin panel** - it will show table status after script execution

## 🏗️ Architecture Notes

These scripts follow database best practices:

- **Separation of concerns:** Each script has a single, clear purpose
- **Idempotent operations:** Scripts can be run multiple times safely
- **Proper dependency handling:** Foreign key constraints respected
- **Comprehensive logging:** Detailed status and progress messages
- **Safety mechanisms:** Confirmations required for destructive operations
- **Verification built-in:** Scripts verify their own success