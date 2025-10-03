-- HoloCheck Multi-Tenant Database Schema
-- This replaces the current single-tenant schema with proper multi-tenant architecture

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE company_status AS ENUM ('active', 'suspended', 'inactive', 'contract_expired');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_activation');
CREATE TYPE user_type_enum AS ENUM ('super_admin', 'tenant_admin', 'company_admin', 'employee');
CREATE TYPE pillar_access_enum AS ENUM ('individual', 'company', 'insurance');
CREATE TYPE coverage_type_enum AS ENUM ('basic', 'premium', 'enterprise', 'custom');
CREATE TYPE config_category_enum AS ENUM ('branding', 'analysis', 'security', 'compliance', 'ui', 'integration');
CREATE TYPE config_type_enum AS ENUM ('string', 'number', 'boolean', 'object', 'array');
CREATE TYPE audit_level_enum AS ENUM ('minimal', 'standard', 'full', 'forensic');
CREATE TYPE audit_action_enum AS ENUM ('login', 'logout', 'create', 'read', 'update', 'delete', 'export', 'analysis');

-- ============================================================================
-- CORE TENANT MANAGEMENT
-- ============================================================================

-- INSURANCE COMPANIES (TENANTS)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'axa', 'mapfre', 'zurich'
  company_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE, -- e.g., 'axa.holocheck.com'
  
  -- Contact Information
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  address JSONB,
  
  -- Status & Configuration
  status tenant_status DEFAULT 'active',
  hipaa_encryption_key TEXT NOT NULL, -- Tenant-specific encryption key
  
  -- Compliance Settings
  data_retention_years INTEGER DEFAULT 7,
  audit_level audit_level_enum DEFAULT 'full',
  allowed_biometric_types TEXT[] DEFAULT ARRAY['facial', 'voice', 'vital_signs'],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_tenant_code CHECK (tenant_code ~ '^[a-z0-9_]+$'),
  CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9-]+$')
);

-- CONTRACTED COMPANIES (PER TENANT)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Company Information
  company_code VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100),
  
  -- Contact Information
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  address JSONB,
  
  -- Contract Information
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  coverage_type coverage_type_enum NOT NULL DEFAULT 'basic',
  max_employees INTEGER DEFAULT 100,
  
  -- Status & Configuration
  status company_status DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, company_code),
  CONSTRAINT valid_company_code CHECK (company_code ~ '^[a-z0-9_]+$'),
  CONSTRAINT valid_contract_dates CHECK (contract_end_date IS NULL OR contract_end_date > contract_start_date)
);

-- USERS WITH PROPER HIERARCHY
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password TEXT,
  
  -- User Classification
  user_type user_type_enum NOT NULL DEFAULT 'employee',
  pillar_access pillar_access_enum[] DEFAULT ARRAY['individual'],
  
  -- Personal Information (Encrypted per tenant)
  encrypted_personal_data JSONB,
  employee_id VARCHAR(100),
  department VARCHAR(100),
  job_title VARCHAR(100),
  
  -- Status & Timestamps
  status user_status DEFAULT 'pending_activation',
  last_login TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- HIPAA Compliance
  hipaa_consent_date TIMESTAMPTZ,
  hipaa_consent_version VARCHAR(20),
  data_retention_until TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(tenant_id, email),
  UNIQUE(company_id, employee_id),
  
  -- Business Rules
  CONSTRAINT company_required_for_employees CHECK (
    (user_type IN ('super_admin', 'tenant_admin')) OR (company_id IS NOT NULL)
  ),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- CONFIGURATION MANAGEMENT
-- ============================================================================

-- TENANT-SPECIFIC CONFIGURATION
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuration Details
  config_category config_category_enum NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  
  -- Metadata
  description TEXT,
  is_system_config BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, config_category, config_key)
);

-- COMPANY-SPECIFIC CONFIGURATION
CREATE TABLE company_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuration Details
  config_category config_category_enum NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  
  -- Metadata
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(company_id, config_category, config_key)
);

-- SYSTEM-WIDE CONFIGURATION (Non-tenant specific)
CREATE TABLE system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration Details
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  
  -- Metadata
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be accessed by frontend
  requires_admin BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BIOMETRIC DATA WITH TENANT ISOLATION
-- ============================================================================

-- BIOMETRIC DATA (TENANT ISOLATED)
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session Information
  session_id VARCHAR(100) NOT NULL,
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Encrypted Biometric Data (using tenant-specific key)
  encrypted_biometric_data JSONB NOT NULL,
  data_hash VARCHAR(256) NOT NULL, -- For integrity verification
  biometric_types TEXT[] NOT NULL, -- ['facial', 'voice', 'vital_signs']
  
  -- Metadata
  capture_device_info JSONB,
  capture_location JSONB,
  data_quality_score DECIMAL(3,2),
  processing_duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For automatic data purging
  
  -- Constraints to ensure data belongs to correct tenant hierarchy
  CONSTRAINT fk_user_tenant CHECK (
    (SELECT tenant_id FROM users WHERE id = user_id) = tenant_id
  ),
  CONSTRAINT fk_user_company CHECK (
    (SELECT company_id FROM users WHERE id = user_id) = company_id
  ),
  CONSTRAINT valid_quality_score CHECK (data_quality_score >= 0 AND data_quality_score <= 1)
);

-- ANALYSIS RESULTS (TENANT ISOLATED)
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  biometric_data_id UUID REFERENCES biometric_data(id) ON DELETE CASCADE NOT NULL,
  
  -- Analysis Results (Encrypted using tenant key)
  encrypted_results JSONB NOT NULL,
  health_score DECIMAL(5,2),
  risk_indicators TEXT[],
  recommendations TEXT[],
  
  -- AI Analysis Metadata
  analysis_model_version VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  analysis_parameters JSONB, -- Configuration used for this analysis
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For automatic data purging
  
  -- Constraints for tenant consistency
  CONSTRAINT fk_biometric_tenant CHECK (
    (SELECT tenant_id FROM biometric_data WHERE id = biometric_data_id) = tenant_id
  ),
  CONSTRAINT fk_biometric_company CHECK (
    (SELECT company_id FROM biometric_data WHERE id = biometric_data_id) = company_id
  ),
  CONSTRAINT fk_biometric_user CHECK (
    (SELECT user_id FROM biometric_data WHERE id = biometric_data_id) = user_id
  ),
  CONSTRAINT valid_health_score CHECK (health_score >= 0 AND health_score <= 100),
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- ============================================================================
-- AUDIT & COMPLIANCE (PER TENANT)
-- ============================================================================

-- AUDIT LOGS (TENANT SEPARATED)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Audit Information
  action audit_action_enum NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  resource_details JSONB,
  
  -- HIPAA Compliance
  phi_accessed BOOLEAN DEFAULT false,
  phi_data_types TEXT[], -- ['biometric', 'personal', 'health', 'analysis']
  
  -- Context Information
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  request_id VARCHAR(100),
  
  -- Result Information
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional metadata
  metadata JSONB
);

-- ACCESS LOGS (TENANT SEPARATED)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request Information
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  
  -- Security Information
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional context
  query_parameters JSONB,
  headers JSONB
);

-- CONSENT RECORDS (TENANT SEPARATED)
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Consent Information
  consent_type VARCHAR(100) NOT NULL, -- 'hipaa', 'biometric_analysis', 'data_sharing'
  consent_version VARCHAR(20) NOT NULL,
  consent_granted BOOLEAN NOT NULL,
  consent_text TEXT NOT NULL,
  
  -- Legal Information
  ip_address INET,
  user_agent TEXT,
  digital_signature TEXT,
  witness_user_id UUID REFERENCES users(id),
  
  -- Timestamps
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_consent_dates CHECK (
    expires_at IS NULL OR expires_at > granted_at
  ),
  CONSTRAINT valid_revocation CHECK (
    revoked_at IS NULL OR revoked_at > granted_at
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenant and Company indexes
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX idx_companies_status ON companies(tenant_id, status);

-- User indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(tenant_id, user_type);
CREATE INDEX idx_users_status ON users(tenant_id, status);

-- Configuration indexes
CREATE INDEX idx_tenant_config_category ON tenant_configurations(tenant_id, config_category);
CREATE INDEX idx_company_config_category ON company_configurations(company_id, config_category);
CREATE INDEX idx_system_config_public ON system_configurations(is_public);

-- Biometric data indexes
CREATE INDEX idx_biometric_data_tenant ON biometric_data(tenant_id, created_at DESC);
CREATE INDEX idx_biometric_data_user ON biometric_data(user_id, created_at DESC);
CREATE INDEX idx_biometric_data_session ON biometric_data(session_id);
CREATE INDEX idx_biometric_data_expires ON biometric_data(expires_at) WHERE expires_at IS NOT NULL;

-- Analysis results indexes
CREATE INDEX idx_analysis_results_tenant ON analysis_results(tenant_id, created_at DESC);
CREATE INDEX idx_analysis_results_user ON analysis_results(user_id, created_at DESC);
CREATE INDEX idx_analysis_results_biometric ON analysis_results(biometric_data_id);

-- Audit and access log indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_phi ON audit_logs(tenant_id, phi_accessed, timestamp DESC) WHERE phi_accessed = true;
CREATE INDEX idx_access_logs_tenant ON access_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_access_logs_user ON access_logs(user_id, timestamp DESC);

-- Consent records indexes
CREATE INDEX idx_consent_records_tenant ON consent_records(tenant_id, granted_at DESC);
CREATE INDEX idx_consent_records_user ON consent_records(user_id, consent_type);
CREATE INDEX idx_consent_records_active ON consent_records(user_id, consent_type) 
  WHERE consent_granted = true AND (expires_at IS NULL OR expires_at > NOW()) AND revoked_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_policy ON tenants
  FOR ALL USING (
    id = (current_setting('app.current_tenant_id', true))::uuid
    OR (current_setting('app.current_user_type', true)) = 'super_admin'
  );

CREATE POLICY company_tenant_isolation ON companies
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
  );

CREATE POLICY user_tenant_isolation ON users
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
  );

-- Configuration access policies
CREATE POLICY tenant_config_access ON tenant_configurations
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
  );

CREATE POLICY company_config_access ON company_configurations
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    )
  );

-- Biometric data access policies
CREATE POLICY biometric_data_access ON biometric_data
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      -- User can access their own data
      user_id = auth.uid()
      OR
      -- Company admin can access company employee data
      (
        (current_setting('app.current_user_type', true)) = 'company_admin'
        AND company_id = (current_setting('app.current_company_id', true))::uuid
      )
      OR
      -- Tenant admin can access all tenant data
      (current_setting('app.current_user_type', true)) = 'tenant_admin'
    )
  );

-- Analysis results access policies
CREATE POLICY analysis_results_access ON analysis_results
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      -- User can access their own results
      user_id = auth.uid()
      OR
      -- Company admin can access company employee results
      (
        (current_setting('app.current_user_type', true)) = 'company_admin'
        AND company_id = (current_setting('app.current_company_id', true))::uuid
      )
      OR
      -- Tenant admin can access all tenant results
      (current_setting('app.current_user_type', true)) = 'tenant_admin'
    )
  );

-- Audit logs access policies (read-only for most users)
CREATE POLICY audit_logs_access ON audit_logs
  FOR SELECT USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      -- Users can see their own audit logs
      user_id = auth.uid()
      OR
      -- Admins can see all logs in their scope
      (current_setting('app.current_user_type', true)) IN ('tenant_admin', 'company_admin')
    )
  );

-- Consent records access policies
CREATE POLICY consent_records_access ON consent_records
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      -- User can access their own consent records
      user_id = auth.uid()
      OR
      -- Admins can access consent records for compliance
      (current_setting('app.current_user_type', true)) IN ('tenant_admin', 'company_admin')
    )
  );

-- ============================================================================
-- FUNCTIONS FOR TENANT CONTEXT MANAGEMENT
-- ============================================================================

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(
  p_tenant_id UUID,
  p_user_type TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
  
  IF p_user_type IS NOT NULL THEN
    PERFORM set_config('app.current_user_type', p_user_type, true);
  END IF;
  
  IF p_company_id IS NOT NULL THEN
    PERFORM set_config('app.current_company_id', p_company_id::text, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tenant from subdomain
CREATE OR REPLACE FUNCTION get_tenant_by_subdomain(p_subdomain TEXT)
RETURNS TABLE(
  tenant_id UUID,
  tenant_code VARCHAR(50),
  company_name VARCHAR(255),
  status tenant_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.tenant_code, t.company_name, t.status
  FROM tenants t
  WHERE t.subdomain = p_subdomain AND t.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL SYSTEM CONFIGURATION DATA
-- ============================================================================

-- Insert default system configurations
INSERT INTO system_configurations (config_key, config_value, config_type, description, is_public) VALUES
('app.version', '"1.3.0"', 'string', 'Application version', true),
('app.name', '"HoloCheck"', 'string', 'Application name', true),
('security.session_timeout_minutes', '60', 'number', 'Session timeout in minutes', false),
('security.password_min_length', '8', 'number', 'Minimum password length', false),
('security.max_login_attempts', '5', 'number', 'Maximum login attempts before lockout', false),
('hipaa.default_retention_years', '7', 'number', 'Default HIPAA data retention period', false),
('analysis.default_confidence_threshold', '0.8', 'number', 'Default confidence threshold for analysis', false),
('biometric.supported_types', '["facial", "voice", "vital_signs"]', 'array', 'Supported biometric types', true);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Insurance companies that use the HoloCheck platform (multi-tenant isolation)';
COMMENT ON TABLE companies IS 'Companies contracted by insurance companies for employee health monitoring';
COMMENT ON TABLE users IS 'All users in the system with proper tenant and company hierarchy';
COMMENT ON TABLE tenant_configurations IS 'Tenant-specific configuration parameters (NO hardcoded values)';
COMMENT ON TABLE company_configurations IS 'Company-specific configuration parameters';
COMMENT ON TABLE system_configurations IS 'System-wide configuration parameters';
COMMENT ON TABLE biometric_data IS 'Encrypted biometric data with tenant isolation';
COMMENT ON TABLE analysis_results IS 'AI analysis results with tenant isolation';
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit logs per tenant';
COMMENT ON TABLE access_logs IS 'API access logs per tenant';
COMMENT ON TABLE consent_records IS 'User consent records for HIPAA compliance';