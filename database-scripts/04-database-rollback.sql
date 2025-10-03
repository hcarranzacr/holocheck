-- ============================================================================
-- HOLOCHECK DATABASE - ROLLBACK SCRIPT
-- ============================================================================
-- Purpose: Rollback recent migration changes if issues occur
-- Prerequisites: Database that has been migrated and needs to be reverted
-- Use Case: Migration caused issues, need to return to previous state
-- WARNING: This will remove columns and tables added in migration
-- Execution: Copy and paste this entire script into Supabase SQL Editor
-- Expected Result: Database returned to pre-migration state
-- Estimated Time: 1 minute
-- ============================================================================

-- SAFETY CHECK - Uncomment the line below to confirm you want to proceed
-- SET LOCAL force_rollback = 'yes';

-- Verify safety confirmation
DO $$ 
BEGIN
    -- Check if user confirmed the rollback
    IF current_setting('force_rollback', true) IS NULL OR current_setting('force_rollback', true) != 'yes' THEN
        RAISE EXCEPTION 'SAFETY CHECK: Uncomment the SET LOCAL force_rollback = ''yes''; line above to confirm rollback.';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE ROLLBACK STARTING...';
    RAISE NOTICE '⚠️  WARNING: MIGRATION CHANGES WILL BE REVERTED';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- STEP 1: BACKUP CRITICAL DATA (Optional)
-- ============================================================================
-- Create temporary backup of tenant data before rollback
CREATE TEMP TABLE IF NOT EXISTS tenant_backup AS 
SELECT id, name, slug, license_number, regulatory_body, billing_email, 
       is_active, created_at, updated_at
FROM tenants;

RAISE NOTICE '✅ Created temporary backup of essential tenant data';

-- ============================================================================
-- STEP 2: DROP NEW TABLES ADDED IN MIGRATION
-- ============================================================================

-- Drop parameter-related tables (these were added in migration)
DROP TABLE IF EXISTS tenant_parameters CASCADE;
DROP TABLE IF EXISTS parameter_categories CASCADE;

RAISE NOTICE '✅ Dropped parameter tables added in migration';

-- ============================================================================
-- STEP 3: REMOVE COLUMNS ADDED IN MIGRATION
-- ============================================================================

-- Remove columns added to tenants table
ALTER TABLE tenants DROP COLUMN IF EXISTS domain;
ALTER TABLE tenants DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE tenants DROP COLUMN IF EXISTS settings;
ALTER TABLE tenants DROP COLUMN IF EXISTS status;

-- Remove columns added to companies table
ALTER TABLE companies DROP COLUMN IF EXISTS employee_count;
ALTER TABLE companies DROP COLUMN IF EXISTS settings;

RAISE NOTICE '✅ Removed columns added in migration';

-- ============================================================================
-- STEP 4: DROP INDEXES ADDED IN MIGRATION
-- ============================================================================

-- Drop indexes that were added for new columns/tables
DROP INDEX IF EXISTS idx_tenants_domain;
DROP INDEX IF EXISTS idx_tenants_status;
DROP INDEX IF EXISTS idx_tenants_subscription_plan;
DROP INDEX IF EXISTS idx_parameter_categories_tenant_id;
DROP INDEX IF EXISTS idx_tenant_parameters_tenant_id;
DROP INDEX IF EXISTS idx_tenant_parameters_category;

RAISE NOTICE '✅ Removed indexes added in migration';

-- ============================================================================
-- STEP 5: REMOVE MIGRATION-SPECIFIC SYSTEM CONFIG
-- ============================================================================

-- Remove system config entries added during migration
DELETE FROM system_config 
WHERE config_key IN ('multi_tenant_enabled', 'migration_version', 'migration_date');

RAISE NOTICE '✅ Removed migration-specific configuration';

-- ============================================================================
-- STEP 6: VERIFICATION AND COMPLETION
-- ============================================================================

-- Verify rollback results
DO $$ 
DECLARE
    table_count INTEGER;
    domain_column_exists BOOLEAN := FALSE;
    param_tables_exist BOOLEAN := FALSE;
    backup_records INTEGER;
BEGIN
    -- Count remaining tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('tenants', 'companies', 'user_profiles', 'biometric_data', 
                       'analysis_results', 'audit_logs', 'system_config', 
                       'tenant_config', 'company_config');
    
    -- Check if domain column still exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'domain'
    ) INTO domain_column_exists;
    
    -- Check if parameter tables still exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('parameter_categories', 'tenant_parameters')
    ) INTO param_tables_exist;
    
    -- Count backup records
    SELECT COUNT(*) INTO backup_records FROM tenant_backup;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE ROLLBACK COMPLETED!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables remaining: % (expected: 9)', table_count;
    RAISE NOTICE 'Domain column exists: %', domain_column_exists;
    RAISE NOTICE 'Parameter tables exist: %', param_tables_exist;
    RAISE NOTICE 'Tenant data backed up: % records', backup_records;
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Rollback operations completed:';
    RAISE NOTICE '✅ Removed tenant_parameters table';
    RAISE NOTICE '✅ Removed parameter_categories table';
    RAISE NOTICE '✅ Removed domain column from tenants';
    RAISE NOTICE '✅ Removed subscription_plan column from tenants';
    RAISE NOTICE '✅ Removed settings columns from tenants and companies';
    RAISE NOTICE '✅ Removed status column from tenants';
    RAISE NOTICE '✅ Removed employee_count column from companies';
    RAISE NOTICE '✅ Removed migration-specific indexes';
    RAISE NOTICE '✅ Cleaned up migration configuration';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Important notes:';
    RAISE NOTICE '⚠️  Tenant creation will now fail with "domain column not found" error';
    RAISE NOTICE '⚠️  This is expected behavior after rollback';
    RAISE NOTICE '⚠️  To fix: Either re-run migration or use creation script';
    RAISE NOTICE '⚠️  Essential tenant data is preserved in tenant_backup temp table';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Database is now in pre-migration state';
    RAISE NOTICE '2. If rollback was successful, re-evaluate migration approach';
    RAISE NOTICE '3. Consider using creation script for clean setup';
    RAISE NOTICE '4. Temp backup table will be available until session ends';
    RAISE NOTICE '============================================================================';
    
    IF NOT domain_column_exists AND NOT param_tables_exist THEN
        RAISE NOTICE 'STATUS: ✅ SUCCESS - Rollback completed successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠️  WARNING - Some migration changes may remain';
    END IF;
END $$;

-- Final success confirmation
SELECT 'HoloCheck database rollback completed successfully! Migration changes have been reverted.' as result;