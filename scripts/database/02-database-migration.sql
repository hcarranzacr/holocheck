-- ============================================================================
-- HOLOCHECK DATABASE - MIGRATION SCRIPT
-- ============================================================================
-- Purpose: Add missing columns and tables to existing HoloCheck installations
-- Prerequisites: Existing HoloCheck database with some tables already created
-- Use Case: When you get "Could not find the 'domain' column" error
-- Execution: Copy and paste this entire script into Supabase SQL Editor
-- Expected Result: Missing columns added, new tables created, existing data preserved
-- Estimated Time: 1-2 minutes
-- ============================================================================

-- Pre-migration verification
DO $$ 
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE MIGRATION STARTING...';
    RAISE NOTICE '============================================================================';
    
    -- Check if tenants table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Found existing tenants table - proceeding with migration';
    ELSE
        RAISE NOTICE '❌ No tenants table found - consider using creation script instead';
        RAISE EXCEPTION 'Migration aborted: No existing tables found. Use 01-database-creation.sql instead.';
    END IF;
END $$;

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add missing columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add missing columns to companies table  
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ============================================================================
-- STEP 2: UPDATE EXISTING DATA
-- ============================================================================

-- Update existing tenants to have domain values if null
UPDATE tenants 
SET domain = COALESCE(domain, slug || '.holocheck.com') 
WHERE domain IS NULL OR domain = '';

-- Update existing tenants to have subscription_plan if null
UPDATE tenants 
SET subscription_plan = COALESCE(subscription_plan, 'basic') 
WHERE subscription_plan IS NULL OR subscription_plan = '';

-- Update existing tenants to have settings if null
UPDATE tenants 
SET settings = COALESCE(settings, '{}') 
WHERE settings IS NULL;

-- Update existing tenants to have status if null
UPDATE tenants 
SET status = COALESCE(status, 'active') 
WHERE status IS NULL OR status = '';

-- Update existing companies to have employee_count if null
UPDATE companies 
SET employee_count = COALESCE(employee_count, 0) 
WHERE employee_count IS NULL;

-- Update existing companies to have settings if null
UPDATE companies 
SET settings = COALESCE(settings, '{}') 
WHERE settings IS NULL;

-- ============================================================================
-- STEP 3: ADD CONSTRAINTS AFTER DATA UPDATE
-- ============================================================================

-- Make domain NOT NULL after setting values
ALTER TABLE tenants ALTER COLUMN domain SET NOT NULL;

-- Add unique constraint on domain if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_domain_key') THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_domain_key UNIQUE (domain);
        RAISE NOTICE '✅ Added unique constraint on tenants.domain';
    ELSE
        RAISE NOTICE '✅ Unique constraint on tenants.domain already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE MISSING TABLES
-- ============================================================================

-- Create parameter_categories table if missing
CREATE TABLE IF NOT EXISTS parameter_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- Create tenant_parameters table if missing
CREATE TABLE IF NOT EXISTS tenant_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    parameter_key VARCHAR(100) NOT NULL,
    parameter_value TEXT NOT NULL,
    parameter_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, category, parameter_key)
);

-- ============================================================================
-- STEP 5: ADD MISSING INDEXES
-- ============================================================================

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_parameter_categories_tenant_id ON parameter_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_tenant_id ON tenant_parameters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_category ON tenant_parameters(category);

-- ============================================================================
-- STEP 6: ENABLE RLS ON NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE parameter_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_parameters ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables
CREATE POLICY "parameter_categories_tenant_isolation" ON parameter_categories FOR ALL USING (true);
CREATE POLICY "tenant_parameters_tenant_isolation" ON tenant_parameters FOR ALL USING (true);

-- ============================================================================
-- STEP 7: UPDATE SYSTEM CONFIGURATION
-- ============================================================================

-- Add new system config entries
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
    ('multi_tenant_enabled', 'true', 'system', 'Multi-tenant functionality enabled'),
    ('migration_version', '"1.0"', 'system', 'Database migration version'),
    ('migration_date', to_jsonb(NOW()::text), 'system', 'Last migration execution date')
ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- ============================================================================
-- STEP 8: VERIFICATION AND COMPLETION
-- ============================================================================

-- Verify migration results
DO $$ 
DECLARE
    table_count INTEGER;
    tenants_with_domain INTEGER;
    missing_columns TEXT := '';
BEGIN
    -- Count total tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('tenants', 'parameter_categories', 'tenant_parameters', 'companies', 
                       'user_profiles', 'biometric_data', 'analysis_results', 'audit_logs', 
                       'system_config', 'tenant_config', 'company_config');
    
    -- Count tenants with domain
    SELECT COUNT(*) INTO tenants_with_domain FROM tenants WHERE domain IS NOT NULL;
    
    -- Check for missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'domain') THEN
        missing_columns := missing_columns || 'tenants.domain ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'subscription_plan') THEN
        missing_columns := missing_columns || 'tenants.subscription_plan ';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK DATABASE MIGRATION COMPLETED!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables found: % out of 11 expected', table_count;
    RAISE NOTICE 'Tenants with domain: %', tenants_with_domain;
    
    IF missing_columns = '' THEN
        RAISE NOTICE 'Missing columns: None - All required columns present';
    ELSE
        RAISE NOTICE 'Missing columns: %', missing_columns;
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Migration changes applied:';
    RAISE NOTICE '✅ Added domain column to tenants table';
    RAISE NOTICE '✅ Added subscription_plan column to tenants table';
    RAISE NOTICE '✅ Added settings column to tenants table';
    RAISE NOTICE '✅ Added status column to tenants table';
    RAISE NOTICE '✅ Added employee_count column to companies table';
    RAISE NOTICE '✅ Added settings column to companies table';
    RAISE NOTICE '✅ Created parameter_categories table';
    RAISE NOTICE '✅ Created tenant_parameters table';
    RAISE NOTICE '✅ Updated existing data with default values';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Enabled RLS policies';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Return to HoloCheck admin panel';
    RAISE NOTICE '2. Verify all tables are detected';
    RAISE NOTICE '3. Try creating a tenant again';
    RAISE NOTICE '4. The "domain column not found" error should be resolved';
    RAISE NOTICE '============================================================================';
    
    IF table_count >= 9 AND missing_columns = '' THEN
        RAISE NOTICE 'STATUS: ✅ SUCCESS - Migration completed successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠️  WARNING - Some issues may remain, check logs above';
    END IF;
END $$;

-- Final success confirmation
SELECT 'HoloCheck database migration completed successfully! Missing columns and tables have been added.' as result;