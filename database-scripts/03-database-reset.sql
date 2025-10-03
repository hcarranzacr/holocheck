-- ============================================================================
-- HOLOCHECK DATABASE - RESET SCRIPT
-- ============================================================================
-- Purpose: Clean reset of HoloCheck database while preserving structure
-- Prerequisites: Existing HoloCheck database that needs to be cleared
-- Use Case: Development/testing reset, tenant data cleanup, fresh start
-- WARNING: This will DELETE ALL DATA but preserve table structure
-- Execution: Copy and paste this entire script into Supabase SQL Editor
-- Expected Result: All data cleared, tables and structure preserved
-- Estimated Time: 30 seconds - 1 minute
-- ============================================================================

-- SAFETY CHECK - Uncomment the line below to confirm you want to proceed
-- SET LOCAL force_reset = 'yes';

-- Verify safety confirmation
DO $$ 
BEGIN
    -- Check if user confirmed the reset
    IF current_setting('force_reset', true) IS NULL OR current_setting('force_reset', true) != 'yes' THEN
        RAISE EXCEPTION 'SAFETY CHECK: Uncomment the SET LOCAL force_reset = ''yes''; line above to confirm database reset.';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE RESET STARTING...';
    RAISE NOTICE '⚠️  WARNING: ALL DATA WILL BE DELETED';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- STEP 1: DISABLE FOREIGN KEY CHECKS TEMPORARILY
-- ============================================================================
-- Note: PostgreSQL doesn't have a global FK disable, so we'll delete in proper order

-- ============================================================================
-- STEP 2: DELETE DATA IN DEPENDENCY ORDER
-- ============================================================================

-- Delete data from dependent tables first (respecting foreign key constraints)
DELETE FROM audit_logs;
DELETE FROM analysis_results;
DELETE FROM biometric_data;
DELETE FROM user_profiles;
DELETE FROM company_config;
DELETE FROM tenant_config;
DELETE FROM companies;
DELETE FROM tenant_parameters;
DELETE FROM parameter_categories;
DELETE FROM tenants;

-- Clear system config (optional - uncomment if you want to reset system settings too)
-- DELETE FROM system_config WHERE config_key NOT IN ('app_name', 'app_version');

-- ============================================================================
-- STEP 3: RESET SEQUENCES (if any auto-increment columns exist)
-- ============================================================================
-- Note: We use UUIDs, so no sequences to reset

-- ============================================================================
-- STEP 4: RESET SYSTEM CONFIGURATION TO DEFAULTS
-- ============================================================================

-- Clear all system config and restore defaults
DELETE FROM system_config;

INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
    ('app_name', '"HoloCheck"', 'system', 'Application name'),
    ('app_version', '"1.0.0"', 'system', 'Application version'),
    ('hipaa_compliance_enabled', 'true', 'security', 'HIPAA compliance enabled'),
    ('multi_tenant_enabled', 'true', 'system', 'Multi-tenant mode enabled'),
    ('default_tenant_plan', '"basic"', 'system', 'Default subscription plan for new tenants'),
    ('max_tenants', '100', 'system', 'Maximum number of tenants allowed'),
    ('data_retention_default_months', '24', 'system', 'Default data retention period in months'),
    ('reset_date', to_jsonb(NOW()::text), 'system', 'Last database reset date');

-- ============================================================================
-- STEP 5: VERIFICATION AND COMPLETION
-- ============================================================================

-- Verify reset results
DO $$ 
DECLARE
    table_count INTEGER;
    total_records INTEGER := 0;
    tenant_count INTEGER;
    company_count INTEGER;
    user_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('tenants', 'parameter_categories', 'tenant_parameters', 'companies', 
                       'user_profiles', 'biometric_data', 'analysis_results', 'audit_logs', 
                       'system_config', 'tenant_config', 'company_config');
    
    -- Count remaining data
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO user_count FROM user_profiles;
    
    total_records := tenant_count + company_count + user_count;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE RESET COMPLETED!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables preserved: % out of 11 expected', table_count;
    RAISE NOTICE 'Remaining data records: %', total_records;
    RAISE NOTICE 'Tenants: %', tenant_count;
    RAISE NOTICE 'Companies: %', company_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Reset operations completed:';
    RAISE NOTICE '✅ All tenant data deleted';
    RAISE NOTICE '✅ All company data deleted';
    RAISE NOTICE '✅ All user profiles deleted';
    RAISE NOTICE '✅ All biometric data deleted';
    RAISE NOTICE '✅ All analysis results deleted';
    RAISE NOTICE '✅ All audit logs deleted';
    RAISE NOTICE '✅ All configuration data deleted';
    RAISE NOTICE '✅ System config reset to defaults';
    RAISE NOTICE '✅ Table structure preserved';
    RAISE NOTICE '✅ Indexes and constraints preserved';
    RAISE NOTICE '✅ RLS policies preserved';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Database is now clean and ready for fresh data';
    RAISE NOTICE '2. All table structures are intact';
    RAISE NOTICE '3. You can immediately start creating new tenants';
    RAISE NOTICE '4. No migration or setup scripts needed';
    RAISE NOTICE '============================================================================';
    
    IF table_count = 11 AND total_records = 0 THEN
        RAISE NOTICE 'STATUS: ✅ SUCCESS - Database reset completed successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠️  WARNING - Some data may remain or tables missing';
    END IF;
END $$;

-- Final success confirmation
SELECT 'HoloCheck database reset completed successfully! All data cleared, structure preserved.' as result;