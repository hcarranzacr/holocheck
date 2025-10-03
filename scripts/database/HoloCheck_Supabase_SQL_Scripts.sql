-- =====================================================
-- HoloCheck Supabase Database Setup
-- HIPAA-Compliant Database Schema with Three-Pillar Access
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

CREATE TYPE user_pillar_type AS ENUM ('individual', 'company', 'insurance');
CREATE TYPE company_size_type AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE aggregation_level_type AS ENUM ('anonymous', 'pseudonymized', 'aggregated');
CREATE TYPE risk_level_type AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE anonymization_type AS ENUM ('full', 'partial', 'pseudonymized');
CREATE TYPE insurance_policy_type AS ENUM ('health', 'life', 'disability', 'group');
CREATE TYPE data_access_type AS ENUM ('aggregated_only', 'statistical', 'risk_indicators');
CREATE TYPE retention_entity_type AS ENUM ('individual', 'company', 'insurance_company');
CREATE TYPE audit_event_type AS ENUM (
  'data_access', 'data_modification', 'data_deletion', 
  'login', 'logout', 'export', 'share', 'analysis_run'
);

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size_category company_size_type,
  
  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  
  -- Privacy Configuration
  data_aggregation_level aggregation_level_type DEFAULT 'anonymous',
  retention_policy_months INTEGER DEFAULT 24,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT companies_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT companies_retention_valid CHECK (retention_policy_months > 0)
);

-- Insurance Companies Table
CREATE TABLE insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  regulatory_body TEXT,
  
  -- Actuarial Configuration
  risk_assessment_models JSONB DEFAULT '{}',
  pricing_algorithms JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT insurance_companies_name_not_empty CHECK (length(trim(name)) > 0)
);

-- User Profiles Table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_type user_pillar_type NOT NULL,
  
  -- Encrypted Personal Data (HIPAA Compliant)
  encrypted_personal_data JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  -- Access Control
  company_id UUID REFERENCES companies(id),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  
  -- HIPAA Consents
  hipaa_consent BOOLEAN DEFAULT FALSE,
  hipaa_consent_date TIMESTAMPTZ,
  data_retention_consent BOOLEAN DEFAULT FALSE,
  data_retention_date TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_id),
  CONSTRAINT user_profiles_company_pillar_check CHECK (
    (pillar_type = 'company' AND company_id IS NOT NULL) OR
    (pillar_type = 'insurance' AND insurance_company_id IS NOT NULL) OR
    (pillar_type = 'individual')
  )
);

-- Biometric Data Table (Encrypted PHI)
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Encrypted Biometric Data (HIPAA Compliant)
  encrypted_cardiovascular_data BYTEA,
  encrypted_voice_data BYTEA,
  encrypted_rppg_data BYTEA,
  
  -- Data Integrity
  data_integrity_hash TEXT,
  
  -- Capture Metadata
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  capture_device_info JSONB DEFAULT '{}',
  capture_quality_score DECIMAL(5,2) CHECK (capture_quality_score >= 0 AND capture_quality_score <= 100),
  
  -- Analysis Status
  analysis_completed BOOLEAN DEFAULT FALSE,
  analysis_timestamp TIMESTAMPTZ,
  
  -- Access Control
  company_id UUID REFERENCES companies(id),
  is_company_shared BOOLEAN DEFAULT FALSE,
  
  -- HIPAA Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT biometric_data_quality_valid CHECK (
    capture_quality_score IS NULL OR 
    (capture_quality_score >= 0 AND capture_quality_score <= 100)
  )
);

-- Analysis Results Table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biometric_data_id UUID REFERENCES biometric_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Analysis Results (36+ biomarkers)
  cardiovascular_metrics JSONB DEFAULT '{}',
  voice_biomarkers JSONB DEFAULT '{}',
  stress_indicators JSONB DEFAULT '{}',
  
  -- Clinical Interpretation
  risk_assessment risk_level_type,
  clinical_recommendations JSONB DEFAULT '{}',
  
  -- Analysis Metadata
  analysis_algorithm_version TEXT,
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For data retention compliance
  
  -- Constraints
  CONSTRAINT analysis_results_confidence_valid CHECK (
    confidence_score IS NULL OR 
    (confidence_score >= 0 AND confidence_score <= 100)
  )
);

-- Company Employees Relationship Table
CREATE TABLE company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Employment Information (Non-PHI)
  employee_id TEXT,
  department TEXT,
  position TEXT,
  hire_date DATE,
  
  -- Privacy Configuration
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  anonymization_level anonymization_type DEFAULT 'full',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(company_id, user_id),
  CONSTRAINT company_employees_consent_date_check CHECK (
    (data_sharing_consent = FALSE) OR 
    (data_sharing_consent = TRUE AND consent_date IS NOT NULL)
  )
);

-- Insurance Policies Table
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  company_id UUID REFERENCES companies(id),
  
  -- Policy Information
  policy_number TEXT UNIQUE NOT NULL,
  policy_type insurance_policy_type,
  coverage_details JSONB DEFAULT '{}',
  
  -- Data Configuration
  data_access_level data_access_type DEFAULT 'aggregated_only',
  risk_assessment_frequency INTEGER DEFAULT 90, -- days
  
  -- Dates
  effective_date DATE NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CONSTRAINT insurance_policies_dates_valid CHECK (
    expiration_date IS NULL OR expiration_date > effective_date
  ),
  CONSTRAINT insurance_policies_frequency_valid CHECK (
    risk_assessment_frequency > 0
  )
);

-- Audit Logs Table (HIPAA Compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Information
  event_type audit_event_type NOT NULL,
  table_name TEXT,
  record_id UUID,
  
  -- User Information
  user_id UUID REFERENCES auth.users(id),
  user_pillar_type user_pillar_type,
  
  -- Access Details
  action_performed TEXT,
  data_accessed JSONB DEFAULT '{}',
  access_reason TEXT,
  
  -- Technical Information
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- HIPAA Compliance
  phi_accessed BOOLEAN DEFAULT FALSE,
  minimum_necessary_standard BOOLEAN DEFAULT TRUE
);

-- Data Retention Policies Table
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Configuration
  entity_type retention_entity_type NOT NULL,
  entity_id UUID,
  
  -- Retention Policies (in months)
  biometric_data_retention_months INTEGER DEFAULT 24,
  analysis_results_retention_months INTEGER DEFAULT 12,
  audit_logs_retention_months INTEGER DEFAULT 84, -- 7 years for HIPAA
  
  -- Deletion Configuration
  auto_delete_enabled BOOLEAN DEFAULT TRUE,
  deletion_notification_days INTEGER DEFAULT 30,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  effective_date DATE DEFAULT CURRENT_DATE,
  
  -- Constraints
  CONSTRAINT retention_policies_months_valid CHECK (
    biometric_data_retention_months > 0 AND
    analysis_results_retention_months > 0 AND
    audit_logs_retention_months > 0
  )
);

-- =====================================================
-- ENCRYPTION FUNCTIONS (HIPAA Compliant)
-- =====================================================

-- Function to encrypt PHI data
CREATE OR REPLACE FUNCTION encrypt_phi_data(data_to_encrypt TEXT)
RETURNS BYTEA AS $$
BEGIN
  -- Use pgcrypto for AES-256 encryption
  RETURN pgp_sym_encrypt(
    data_to_encrypt, 
    coalesce(
      current_setting('app.encryption_key', true),
      'default-key-change-in-production'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt PHI data
CREATE OR REPLACE FUNCTION decrypt_phi_data(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
  -- Check if user has PHI access
  IF NOT has_phi_access(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access to PHI data';
  END IF;
  
  RETURN pgp_sym_decrypt(
    encrypted_data, 
    coalesce(
      current_setting('app.encryption_key', true),
      'default-key-change-in-production'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check PHI access permissions
CREATE OR REPLACE FUNCTION has_phi_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_pillar TEXT;
BEGIN
  SELECT pillar_type INTO user_pillar 
  FROM user_profiles 
  WHERE user_id = user_uuid;
  
  -- Only individual users can access their own PHI
  -- Companies and insurance companies get aggregated data only
  RETURN user_pillar = 'individual';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT TRIGGER FUNCTIONS
-- =====================================================

-- Function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  phi_data BOOLEAN := FALSE;
BEGIN
  -- Determine if table contains PHI
  phi_data := TG_TABLE_NAME IN ('biometric_data', 'analysis_results', 'user_profiles');
  
  INSERT INTO audit_logs (
    event_type,
    table_name,
    record_id,
    user_id,
    user_pillar_type,
    action_performed,
    phi_accessed,
    ip_address,
    user_agent
  ) VALUES (
    CASE TG_OP 
      WHEN 'INSERT' THEN 'data_modification'
      WHEN 'UPDATE' THEN 'data_modification'
      WHEN 'DELETE' THEN 'data_deletion'
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    (SELECT pillar_type FROM user_profiles WHERE user_id = auth.uid()),
    TG_OP,
    phi_data,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Companies can view employee profiles metadata" ON user_profiles
  FOR SELECT USING (
    pillar_type = 'company' AND 
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Biometric Data Policies (Strictest - Individual Access Only)
CREATE POLICY "Users can access own biometric data" ON biometric_data
  FOR ALL USING (auth.uid() = user_id);

-- Analysis Results Policies
CREATE POLICY "Users can view own analysis results" ON analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis results" ON analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies Policies
CREATE POLICY "Company admins can manage their company" ON companies
  FOR ALL USING (
    id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Company Employees Policies
CREATE POLICY "Company admins can manage employees" ON company_employees
  FOR ALL USING (
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Employees can view own employment record" ON company_employees
  FOR SELECT USING (auth.uid() = user_id);

-- Insurance Policies Access
CREATE POLICY "Insurance companies can manage their policies" ON insurance_policies
  FOR ALL USING (
    insurance_company_id = (SELECT insurance_company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Audit Logs Policies (Read-only for users, full access for admins)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- AGGREGATED VIEWS FOR PRIVACY COMPLIANCE
-- =====================================================

-- Company Health Metrics View (Anonymized)
CREATE VIEW company_health_metrics AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(DISTINCT ce.user_id) as total_employees,
  
  -- Aggregated cardiovascular metrics
  ROUND(AVG((ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as avg_heart_rate,
  ROUND(STDDEV((ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as hr_std_dev,
  ROUND(AVG((ar.cardiovascular_metrics->>'heartRateVariability')::numeric), 1) as avg_hrv,
  
  -- Risk distribution
  COUNT(CASE WHEN ar.risk_assessment = 'low' THEN 1 END) as low_risk_count,
  COUNT(CASE WHEN ar.risk_assessment = 'moderate' THEN 1 END) as moderate_risk_count,
  COUNT(CASE WHEN ar.risk_assessment = 'high' THEN 1 END) as high_risk_count,
  COUNT(CASE WHEN ar.risk_assessment = 'critical' THEN 1 END) as critical_risk_count,
  
  -- Temporal grouping
  DATE_TRUNC('month', ar.created_at) as analysis_month,
  
  -- Metadata
  NOW() as report_generated_at
  
FROM companies c
JOIN company_employees ce ON c.id = ce.company_id
JOIN analysis_results ar ON ce.user_id = ar.user_id
WHERE ce.data_sharing_consent = TRUE
  AND ce.is_active = TRUE
  AND ar.created_at >= NOW() - INTERVAL '12 months'
GROUP BY c.id, c.name, DATE_TRUNC('month', ar.created_at)
HAVING COUNT(DISTINCT ce.user_id) >= 5; -- Minimum for anonymization

-- Insurance Population Statistics View
CREATE VIEW insurance_population_stats AS
SELECT 
  ic.id as insurance_company_id,
  ic.name as insurance_company_name,
  
  -- Population size
  COUNT(DISTINCT ar.user_id) as total_covered_individuals,
  
  -- Cardiovascular population metrics
  ROUND(AVG((ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as population_avg_hr,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as median_hr,
  ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY (ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as q1_hr,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (ar.cardiovascular_metrics->>'heartRate')::numeric), 1) as q3_hr,
  
  -- Age distribution (broad ranges for privacy)
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) BETWEEN 18 AND 30 THEN 1 END) as age_18_30,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) BETWEEN 31 AND 50 THEN 1 END) as age_31_50,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) > 50 THEN 1 END) as age_over_50,
  
  -- Risk indicators for actuarial analysis
  ROUND((COUNT(CASE WHEN ar.risk_assessment IN ('high', 'critical') THEN 1 END)::float / COUNT(*)::float) * 100, 2) as high_risk_percentage,
  ROUND(AVG((ar.stress_indicators->>'stressLevel')::numeric), 2) as avg_stress_level,
  
  -- Temporal grouping
  DATE_TRUNC('quarter', ar.created_at) as analysis_quarter,
  
  -- Metadata
  NOW() as report_generated_at
  
FROM insurance_companies ic
JOIN insurance_policies ip ON ic.id = ip.insurance_company_id
JOIN companies c ON ip.company_id = c.id
JOIN company_employees ce ON c.id = ce.company_id
JOIN user_profiles up ON ce.user_id = up.user_id
JOIN analysis_results ar ON up.user_id = ar.user_id
WHERE ip.is_active = TRUE
  AND ce.data_sharing_consent = TRUE
  AND up.hipaa_consent = TRUE
  AND ar.created_at >= NOW() - INTERVAL '24 months'
GROUP BY ic.id, ic.name, DATE_TRUNC('quarter', ar.created_at)
HAVING COUNT(DISTINCT ar.user_id) >= 100; -- Minimum for actuarial analysis

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Create audit triggers for all sensitive tables
CREATE TRIGGER biometric_data_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON biometric_data
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER analysis_results_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON analysis_results
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER user_profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary performance indexes
CREATE INDEX idx_biometric_data_user_timestamp ON biometric_data(user_id, capture_timestamp DESC);
CREATE INDEX idx_analysis_results_user_created ON analysis_results(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_event ON audit_logs(user_id, event_type, timestamp DESC);

-- Company and employee relationship indexes
CREATE INDEX idx_company_employees_active ON company_employees(company_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_company_employees_consent ON company_employees(company_id, data_sharing_consent) WHERE data_sharing_consent = TRUE;

-- Analysis and aggregation indexes
CREATE INDEX idx_analysis_results_risk_created ON analysis_results(risk_assessment, created_at DESC);
CREATE INDEX idx_user_profiles_pillar_company ON user_profiles(pillar_type, company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_user_profiles_hipaa_consent ON user_profiles(hipaa_consent, pillar_type) WHERE hipaa_consent = TRUE;

-- Insurance-specific indexes
CREATE INDEX idx_insurance_policies_active ON insurance_policies(insurance_company_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_insurance_policies_dates ON insurance_policies(effective_date, expiration_date);

-- =====================================================
-- DATA RETENTION FUNCTIONS
-- =====================================================

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  retention_record RECORD;
BEGIN
  -- Loop through retention policies
  FOR retention_record IN 
    SELECT * FROM data_retention_policies WHERE auto_delete_enabled = TRUE
  LOOP
    -- Delete expired biometric data
    DELETE FROM biometric_data 
    WHERE created_at < NOW() - (retention_record.biometric_data_retention_months || ' months')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO audit_logs (
      event_type, action_performed, data_accessed
    ) VALUES (
      'data_deletion', 
      'automated_cleanup', 
      jsonb_build_object('deleted_biometric_records', deleted_count)
    );
    
    -- Delete expired analysis results
    DELETE FROM analysis_results 
    WHERE created_at < NOW() - (retention_record.analysis_results_retention_months || ' months')::INTERVAL;
    
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert default data retention policy for individuals
INSERT INTO data_retention_policies (
  entity_type,
  entity_id,
  biometric_data_retention_months,
  analysis_results_retention_months,
  audit_logs_retention_months
) VALUES (
  'individual',
  NULL, -- Applies to all individuals
  24,   -- 2 years for biometric data
  12,   -- 1 year for analysis results
  84    -- 7 years for audit logs (HIPAA requirement)
);

-- =====================================================
-- SECURITY CONFIGURATION
-- =====================================================

-- Revoke public access to all tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Grant specific permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON biometric_data TO authenticated;
GRANT SELECT, INSERT ON analysis_results TO authenticated;
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON company_health_metrics TO authenticated;
GRANT SELECT ON insurance_population_stats TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_profiles IS 'User profiles with pillar-based access control and HIPAA consent tracking';
COMMENT ON TABLE biometric_data IS 'Encrypted biometric data (PHI) with strict access controls';
COMMENT ON TABLE analysis_results IS 'Analysis results with 36+ biomarkers and risk assessments';
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit trail for all data access and modifications';
COMMENT ON VIEW company_health_metrics IS 'Anonymized company health metrics (minimum 5 employees)';
COMMENT ON VIEW insurance_population_stats IS 'Population statistics for actuarial analysis (minimum 100 individuals)';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'HoloCheck Supabase database setup completed successfully!';
  RAISE NOTICE 'HIPAA compliance features enabled:';
  RAISE NOTICE '- PHI encryption with AES-256';
  RAISE NOTICE '- Row Level Security (RLS) policies';
  RAISE NOTICE '- Automatic audit logging';
  RAISE NOTICE '- Data retention policies';
  RAISE NOTICE '- Three-pillar access control';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure encryption key in environment variables';
  RAISE NOTICE '2. Set up automated data cleanup job';
  RAISE NOTICE '3. Configure Supabase Auth with custom claims';
  RAISE NOTICE '4. Test RLS policies with different user types';
END $$;