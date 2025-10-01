import { supabase } from './supabaseClient';

// Multi-tenant database setup service
// Implements Bob's architectural recommendations
class MultiTenantSetup {
  
  // Check if multi-tenant database is properly set up
  static async checkDatabaseStatus() {
    try {
      const requiredTables = [
        'tenants',
        'companies', 
        'user_profiles',
        'biometric_data',
        'analysis_results',
        'audit_logs',
        'system_config',
        'tenant_config',
        'company_config'
      ];

      let existingTables = 0;
      const tableStatus = {};

      for (const table of requiredTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables++;
            tableStatus[table] = true;
          } else {
            tableStatus[table] = false;
          }
        } catch (err) {
          tableStatus[table] = false;
        }
      }

      // Get stats if database is complete
      let stats = { tenants: 0, companies: 0, users: 0 };
      if (existingTables === requiredTables.length) {
        try {
          const [tenantsResult, companiesResult, usersResult] = await Promise.all([
            supabase.from('tenants').select('*', { count: 'exact', head: true }),
            supabase.from('companies').select('*', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('*', { count: 'exact', head: true })
          ]);

          stats = {
            tenants: tenantsResult.count || 0,
            companies: companiesResult.count || 0,
            users: usersResult.count || 0
          };
        } catch (err) {
          console.log('Could not fetch stats:', err.message);
        }
      }

      return {
        isComplete: existingTables === requiredTables.length,
        existingTables,
        totalTables: requiredTables.length,
        tableStatus,
        stats
      };

    } catch (error) {
      console.error('Database status check failed:', error);
      return {
        isComplete: false,
        existingTables: 0,
        totalTables: 9,
        error: error.message
      };
    }
  }

  // Get complete SQL schema for manual execution
  static getCompleteSQL() {
    return `-- HoloCheck Multi-Tenant Database Schema
-- Execute this complete script in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- MULTI-TENANT CORE TABLES
-- =====================================================

-- 1. TENANTS TABLE (Insurance Companies)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    license_number TEXT UNIQUE,
    regulatory_body TEXT,
    
    -- Tenant Configuration
    max_companies INTEGER DEFAULT 100,
    max_employees_per_company INTEGER DEFAULT 1000,
    data_retention_months INTEGER DEFAULT 24,
    
    -- Subscription & Billing
    subscription_tier TEXT DEFAULT 'standard',
    billing_email TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT tenants_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 2. COMPANIES TABLE (Per Tenant)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    company_code TEXT NOT NULL,
    
    -- Company Details
    industry TEXT,
    size_category TEXT CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    
    -- Contact Information
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    
    -- Privacy Configuration
    data_aggregation_level TEXT DEFAULT 'anonymous' CHECK (data_aggregation_level IN ('anonymous', 'pseudonymized', 'aggregated')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, company_code),
    CONSTRAINT companies_name_not_empty CHECK (length(trim(name)) > 0)
);

-- 3. USER PROFILES TABLE (Multi-tenant aware)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- User Role in Multi-tenant Context
    role TEXT NOT NULL CHECK (role IN ('tenant_admin', 'company_admin', 'employee', 'super_admin')),
    
    -- Employee Information
    employee_id TEXT,
    department TEXT,
    position TEXT,
    
    -- Encrypted Personal Data (HIPAA Compliant)
    encrypted_personal_data JSONB DEFAULT '{}',
    
    -- Consent Management
    hipaa_consent BOOLEAN DEFAULT false,
    hipaa_consent_date TIMESTAMPTZ,
    data_sharing_consent BOOLEAN DEFAULT false,
    data_sharing_consent_date TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    UNIQUE(user_id),
    UNIQUE(tenant_id, company_id, employee_id)
);

-- 4. BIOMETRIC DATA TABLE (Tenant isolated)
CREATE TABLE IF NOT EXISTS public.biometric_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Session Information
    session_id TEXT NOT NULL,
    
    -- Encrypted Biometric Data (HIPAA Compliant)
    encrypted_cardiovascular_data BYTEA,
    encrypted_voice_data BYTEA,
    encrypted_rppg_data BYTEA,
    
    -- Data Integrity
    data_hash TEXT NOT NULL,
    
    -- Capture Metadata
    capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
    capture_device_info JSONB DEFAULT '{}',
    capture_quality_score DECIMAL(5,2) CHECK (capture_quality_score >= 0 AND capture_quality_score <= 100),
    
    -- Analysis Status
    analysis_completed BOOLEAN DEFAULT false,
    analysis_timestamp TIMESTAMPTZ,
    
    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ
);

-- 5. ANALYSIS RESULTS TABLE (Tenant isolated)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biometric_data_id UUID REFERENCES public.biometric_data(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Analysis Results (36+ biomarkers)
    cardiovascular_metrics JSONB DEFAULT '{}',
    voice_biomarkers JSONB DEFAULT '{}',
    stress_indicators JSONB DEFAULT '{}',
    
    -- Clinical Assessment
    health_score DECIMAL(5,2) CHECK (health_score >= 0 AND health_score <= 100),
    risk_assessment TEXT CHECK (risk_assessment IN ('low', 'moderate', 'high', 'critical')),
    clinical_recommendations JSONB DEFAULT '{}',
    
    -- Analysis Metadata
    algorithm_version TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 6. AUDIT LOGS TABLE (Tenant isolated)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Event Information
    event_type TEXT NOT NULL CHECK (event_type IN ('data_access', 'data_modification', 'data_deletion', 'login', 'logout', 'export', 'share', 'analysis_run')),
    table_name TEXT,
    record_id UUID,
    
    -- User Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_role TEXT,
    
    -- Action Details
    action_performed TEXT NOT NULL,
    data_accessed JSONB DEFAULT '{}',
    access_reason TEXT,
    
    -- Technical Information
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- HIPAA Compliance
    phi_accessed BOOLEAN DEFAULT false,
    minimum_necessary_standard BOOLEAN DEFAULT true,
    business_justification TEXT,
    
    -- Timestamp
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SYSTEM CONFIGURATION TABLE (Global settings)
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type TEXT DEFAULT 'system' CHECK (config_type IN ('system', 'security', 'feature', 'integration')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TENANT CONFIGURATION TABLE (Per-tenant settings)
CREATE TABLE IF NOT EXISTS public.tenant_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    config_type TEXT DEFAULT 'tenant' CHECK (config_type IN ('tenant', 'privacy', 'analysis', 'reporting')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, config_key)
);

-- 9. COMPANY CONFIGURATION TABLE (Per-company settings)
CREATE TABLE IF NOT EXISTS public.company_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    config_type TEXT DEFAULT 'company' CHECK (config_type IN ('company', 'employee', 'analysis', 'privacy')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, config_key)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Multi-tenant)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_config ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM public.user_profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM public.user_profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.user_profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANTS POLICIES
CREATE POLICY "Super admins can manage all tenants" ON public.tenants
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "Tenant admins can view own tenant" ON public.tenants
    FOR SELECT USING (id = get_user_tenant_id());

-- COMPANIES POLICIES
CREATE POLICY "Users can view companies in their tenant" ON public.companies
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant admins can manage companies in their tenant" ON public.companies
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND 
        get_user_role() IN ('tenant_admin', 'super_admin')
    );

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow profile creation" ON public.user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- BIOMETRIC DATA POLICIES (Strictest - Individual access only)
CREATE POLICY "Users can access own biometric data" ON public.biometric_data
    FOR ALL USING (user_id = auth.uid());

-- ANALYSIS RESULTS POLICIES
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analysis results" ON public.analysis_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS POLICIES
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- CONFIGURATION POLICIES
CREATE POLICY "Super admins can manage system config" ON public.system_config
    FOR ALL USING (get_user_role() = 'super_admin');

CREATE POLICY "All users can read system config" ON public.system_config
    FOR SELECT USING (true);

CREATE POLICY "Tenant admins can manage tenant config" ON public.tenant_config
    FOR ALL USING (
        tenant_id = get_user_tenant_id() AND 
        get_user_role() IN ('tenant_admin', 'super_admin')
    );

CREATE POLICY "Company admins can manage company config" ON public.company_config
    FOR ALL USING (
        company_id = get_user_company_id() AND 
        get_user_role() IN ('company_admin', 'tenant_admin', 'super_admin')
    );

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Multi-tenant indexes
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON public.companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON public.user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_tenant_id ON public.biometric_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_tenant_id ON public.analysis_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_biometric_data_user_timestamp ON public.biometric_data(user_id, capture_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_created ON public.analysis_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_tenant_config_tenant_key ON public.tenant_config(tenant_id, config_key);
CREATE INDEX IF NOT EXISTS idx_company_config_company_key ON public.company_config(company_id, config_key);

-- =====================================================
-- INSERT DEFAULT CONFIGURATION
-- =====================================================

-- System Configuration
INSERT INTO public.system_config (config_key, config_value, config_type, description) VALUES
('app_name', '"HoloCheck"', 'system', 'Application name'),
('app_version', '"1.0.0"', 'system', 'Application version'),
('max_tenants', '100', 'system', 'Maximum number of tenants allowed'),
('default_data_retention_months', '24', 'system', 'Default data retention period in months'),
('hipaa_compliance_enabled', 'true', 'security', 'HIPAA compliance features enabled'),
('encryption_algorithm', '"AES-256"', 'security', 'Encryption algorithm for PHI data'),
('audit_log_retention_months', '84', 'security', 'Audit log retention period (7 years for HIPAA)'),
('max_file_upload_size_mb', '50', 'system', 'Maximum file upload size in MB'),
('supported_analysis_types', '["cardiovascular", "voice", "stress", "rppg"]', 'feature', 'Supported biometric analysis types'),
('default_quality_threshold', '0.7', 'feature', 'Default quality threshold for analysis')
ON CONFLICT (config_key) DO NOTHING;

COMMIT;

-- Success message
SELECT 
    'SUCCESS: HoloCheck multi-tenant database created!' as status,
    'Architecture: Insurance Companies → Companies → Employees' as hierarchy,
    'Features: Tenant isolation, RLS policies, configuration management' as features,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'tenants', 'companies', 'user_profiles', 'biometric_data', 
        'analysis_results', 'audit_logs', 'system_config', 'tenant_config', 'company_config'
    )) as tables_created,
    NOW() as timestamp;`;
  }

  // Initialize multi-tenant database with progress callback
  static async initializeMultiTenantDatabase(progressCallback = () => {}) {
    try {
      progressCallback('🚀 Iniciando configuración multi-tenant...');
      
      // Since direct SQL execution is failing, we'll use a different approach
      // Try to verify if tables exist first
      progressCallback('🔍 Verificando estado actual de la base de datos...');
      
      const status = await this.checkDatabaseStatus();
      
      if (status.isComplete) {
        progressCallback('✅ Base de datos ya está configurada');
        return {
          success: true,
          tablesCreated: status.existingTables,
          totalTables: status.totalTables,
          message: 'Database already initialized'
        };
      }

      // If not complete, provide manual setup instructions
      progressCallback('⚠️ Creación automática no disponible - se requiere setup manual');
      
      return {
        success: false,
        tablesCreated: status.existingTables,
        totalTables: status.totalTables,
        requiresManualSetup: true,
        sqlScript: this.getCompleteSQL(),
        error: 'Automatic table creation failed. Manual SQL execution required.',
        instructions: [
          '1. Copie el script SQL completo',
          '2. Vaya a Supabase SQL Editor: https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql',
          '3. Pegue y ejecute el script completo',
          '4. Verifique que las 9 tablas se hayan creado correctamente'
        ]
      };

    } catch (error) {
      console.error('Multi-tenant setup failed:', error);
      return {
        success: false,
        tablesCreated: 0,
        totalTables: 9,
        requiresManualSetup: true,
        sqlScript: this.getCompleteSQL(),
        error: error.message
      };
    }
  }

  // Get system configuration
  static async getSystemConfig(key) {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get system config ${key}:`, error);
      return null;
    }
  }

  // Get tenant configuration
  static async getTenantConfig(tenantId, key) {
    try {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('tenant_id', tenantId)
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get tenant config ${key}:`, error);
      return null;
    }
  }

  // Get company configuration
  static async getCompanyConfig(companyId, key) {
    try {
      const { data, error } = await supabase
        .from('company_config')
        .select('config_value')
        .eq('company_id', companyId)
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get company config ${key}:`, error);
      return null;
    }
  }
}

export default MultiTenantSetup;