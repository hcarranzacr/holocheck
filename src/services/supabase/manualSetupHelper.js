// Manual Setup Helper - Complete solution for database creation
class ManualSetupHelper {
  
  // Complete SQL schema for manual execution
  static getCompleteSQL() {
    return `-- HoloCheck Multi-Tenant Database Setup
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS TABLE (Insurance Companies)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    regulatory_body VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    max_companies INTEGER DEFAULT 50,
    max_employees_per_company INTEGER DEFAULT 500,
    data_retention_months INTEGER DEFAULT 24,
    subscription_tier VARCHAR(50) DEFAULT 'standard',
    billing_email VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PARAMETER CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS parameter_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 3. TENANT PARAMETERS TABLE
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

-- 4. COMPANIES TABLE (Insured Companies)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) NOT NULL,
    industry VARCHAR(100),
    employee_count INTEGER DEFAULT 0,
    size_category VARCHAR(50) CHECK (size_category IN ('small', 'medium', 'large', 'enterprise')),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address JSONB,
    settings JSONB DEFAULT '{}',
    data_aggregation_level VARCHAR(50) DEFAULT 'anonymous',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, company_code)
);

-- 5. USER PROFILES TABLE (Employee Profiles)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'employee',
    employee_id VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    encrypted_personal_data JSONB,
    hipaa_consent BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, company_id, employee_id)
);

-- 6. BIOMETRIC DATA TABLE
CREATE TABLE IF NOT EXISTS biometric_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    encrypted_data BYTEA,
    data_hash VARCHAR(255) NOT NULL,
    capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    capture_quality_score DECIMAL(5,2),
    device_info JSONB,
    analysis_completed BOOLEAN DEFAULT false,
    retention_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- 7. ANALYSIS RESULTS TABLE
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biometric_data_id UUID NOT NULL REFERENCES biometric_data(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    cardiovascular_metrics JSONB,
    voice_biomarkers JSONB,
    stress_indicators JSONB,
    health_score DECIMAL(5,2),
    risk_assessment VARCHAR(50),
    clinical_recommendations JSONB,
    algorithm_version VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5,2),
    processing_time_ms INTEGER,
    reviewed_by_professional BOOLEAN DEFAULT false,
    professional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    user_id UUID NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action_performed VARCHAR(255) NOT NULL,
    data_accessed JSONB,
    access_reason VARCHAR(255),
    phi_accessed BOOLEAN DEFAULT false,
    minimum_necessary_standard BOOLEAN DEFAULT true,
    business_justification TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SYSTEM CONFIG TABLE
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TENANT CONFIG TABLE
CREATE TABLE IF NOT EXISTS tenant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, config_key)
);

-- 11. COMPANY CONFIG TABLE
CREATE TABLE IF NOT EXISTS company_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, config_key)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_parameter_categories_tenant_id ON parameter_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_tenant_id ON tenant_parameters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_category ON tenant_parameters(category);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_tenant_id ON biometric_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_tenant_id ON analysis_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Enable read access for all users" ON system_config FOR SELECT USING (true);

-- Tenant-specific RLS policies
CREATE POLICY "Tenants can view their own data" ON tenants FOR SELECT USING (true);
CREATE POLICY "Tenants can update their own data" ON tenants FOR UPDATE USING (true);

-- Insert default config
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
    ('app_name', '"HoloCheck"', 'system', 'Application name'),
    ('app_version', '"1.0.0"', 'system', 'Application version'),
    ('hipaa_compliance_enabled', 'true', 'security', 'HIPAA compliance enabled'),
    ('multi_tenant_enabled', 'true', 'system', 'Multi-tenant functionality enabled')
ON CONFLICT (config_key) DO NOTHING;

-- Success message
SELECT 'HoloCheck multi-tenant database setup completed successfully! 11 tables created.' as result;`;
  }

  // Test basic Supabase connection
  static async testConnection() {
    try {
      const { supabase } = await import('./supabaseClient');
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          details: 'Client is null or undefined'
        };
      }

      // Test with a simple query that should always work
      const { data, error } = await supabase
        .from('nonexistent_table_test')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205') {
          return {
            success: true,
            message: 'Connection OK - PGRST205 error expected for nonexistent table',
            url: supabase.supabaseUrl,
            keyPreview: supabase.supabaseKey ? supabase.supabaseKey.substring(0, 20) + '...' : 'NOT SET'
          };
        } else {
          return {
            success: false,
            error: 'Connection error',
            details: error.message,
            code: error.code
          };
        }
      }

      return {
        success: true,
        message: 'Unexpected success - connection working',
        url: supabase.supabaseUrl,
        keyPreview: supabase.supabaseKey ? supabase.supabaseKey.substring(0, 20) + '...' : 'NOT SET'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Critical connection error',
        details: error.message,
        stack: error.stack
      };
    }
  }

  // Check if tables exist
  static async checkTablesExist() {
    try {
      const { supabase } = await import('./supabaseClient');
      
      const tables = [
        'tenants', 'parameter_categories', 'tenant_parameters', 'companies', 'user_profiles', 
        'biometric_data', 'analysis_results', 'audit_logs', 'system_config', 'tenant_config', 'company_config'
      ];

      const results = {};
      let existingTables = 0;

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1);
          if (!error) {
            results[table] = true;
            existingTables++;
          } else {
            results[table] = false;
          }
        } catch (err) {
          results[table] = false;
        }
      }

      return {
        success: true,
        existingTables,
        totalTables: tables.length,
        tableStatus: results,
        isComplete: existingTables === tables.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        existingTables: 0,
        totalTables: 11
      };
    }
  }

  // Get manual setup instructions
  static getManualInstructions() {
    return {
      title: 'Manual Database Setup - Complete Multi-Tenant Schema',
      steps: [
        {
          step: 1,
          title: 'Copy SQL Script',
          description: 'Click the "Copy SQL" button below to copy the complete database setup script',
          action: 'copy_sql'
        },
        {
          step: 2,
          title: 'Open Supabase Dashboard',
          description: 'Go to your Supabase project dashboard',
          action: 'open_dashboard'
        },
        {
          step: 3,
          title: 'Open SQL Editor',
          description: 'Click on "SQL Editor" in the left sidebar of your Supabase dashboard',
          action: 'open_sql_editor'
        },
        {
          step: 4,
          title: 'Paste and Execute',
          description: 'Paste the copied SQL script and click "Run" to execute it',
          action: 'execute_sql'
        },
        {
          step: 5,
          title: 'Verify Tables',
          description: 'Check that 11 tables were created successfully',
          action: 'verify_tables'
        },
        {
          step: 6,
          title: 'Return to HoloCheck',
          description: 'Come back to this admin panel and click "Check Tables" to verify',
          action: 'check_tables'
        }
      ],
      estimatedTime: '3-5 minutes',
      difficulty: 'Easy - Copy & Paste',
      tablesCount: 11
    };
  }

  // Get migration instructions for existing databases
  static getMigrationSQL() {
    return `-- MIGRATION SCRIPT: Add missing columns and tables to existing HoloCheck database
-- Execute this if you already have some tables but are missing the 'domain' column and parameter tables

-- Add missing columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Make domain unique if it wasn't before
ALTER TABLE tenants ADD CONSTRAINT tenants_domain_unique UNIQUE (domain);

-- Add missing columns to companies table  
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

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

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_parameter_categories_tenant_id ON parameter_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_tenant_id ON tenant_parameters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_parameters_category ON tenant_parameters(category);

-- Enable RLS on new tables
ALTER TABLE parameter_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_parameters ENABLE ROW LEVEL SECURITY;

-- Update system config
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
    ('multi_tenant_enabled', 'true', 'system', 'Multi-tenant functionality enabled')
ON CONFLICT (config_key) DO NOTHING;

SELECT 'Migration completed successfully! Database updated for multi-tenant operations.' as result;`;
  }
}

export default ManualSetupHelper;