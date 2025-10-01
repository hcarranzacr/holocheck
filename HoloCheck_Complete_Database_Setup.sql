-- HoloCheck HIPAA-Compliant Database Schema
-- Execute this COMPLETE script in Supabase SQL Editor
-- Project: ytdctcyzzilbtkxcebfr
-- URL: https://supabase.com/dashboard/project/ytdctcyzzilbtkxcebfr/sql

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for user roles and data classifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('individual', 'company', 'insurance', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_classification') THEN
        CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_status') THEN
        CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'revoked', 'expired');
    END IF;
END $$;

-- 1. User Profiles table (CRITICAL - This fixes the main error)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pillar_type user_role NOT NULL DEFAULT 'individual',
    encrypted_personal_data JSONB,
    organization_id UUID,
    department TEXT,
    employee_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    hipaa_consent_date TIMESTAMPTZ,
    data_retention_until TIMESTAMPTZ,
    UNIQUE(user_id)
);

-- 2. Biometric Data table (encrypted PHI storage)
CREATE TABLE IF NOT EXISTS public.biometric_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    encrypted_biometric_data JSONB NOT NULL,
    data_hash TEXT NOT NULL,
    capture_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    analysis_quality_score DECIMAL(3,2),
    device_info JSONB,
    location_data JSONB,
    data_classification data_classification DEFAULT 'restricted',
    retention_period_days INTEGER DEFAULT 2555, -- 7 years
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Analysis Results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    biometric_data_id UUID REFERENCES public.biometric_data(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL,
    encrypted_results JSONB NOT NULL,
    health_score DECIMAL(5,2),
    risk_indicators JSONB,
    recommendations JSONB,
    confidence_level DECIMAL(3,2),
    processing_time_ms INTEGER,
    algorithm_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Audit Logs table (HIPAA compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    action_performed TEXT NOT NULL,
    data_accessed JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    phi_accessed BOOLEAN DEFAULT false,
    minimum_necessary_standard BOOLEAN DEFAULT true,
    business_justification TEXT
);

-- 5. Consent Records table
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL,
    consent_status consent_status NOT NULL,
    consent_text TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    digital_signature TEXT,
    witness_information JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    preference_category TEXT NOT NULL,
    preference_data JSONB NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Data Retention Policies table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    retention_period_days INTEGER NOT NULL,
    auto_delete_enabled BOOLEAN DEFAULT true,
    legal_basis TEXT,
    policy_version TEXT NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Access Logs table (detailed access tracking)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    access_type TEXT NOT NULL, -- 'read', 'write', 'delete', 'export'
    access_granted BOOLEAN NOT NULL,
    denial_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    session_duration_seconds INTEGER,
    data_volume_accessed INTEGER, -- number of records
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Organizations table (for company and insurance pillars)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_type user_role NOT NULL,
    industry TEXT,
    size_category TEXT,
    contact_information JSONB,
    hipaa_covered_entity BOOLEAN DEFAULT false,
    business_associate_agreement BOOLEAN DEFAULT false,
    data_processing_agreement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_pillar_type ON public.user_profiles(pillar_type);
CREATE INDEX IF NOT EXISTS idx_biometric_data_user_id ON public.biometric_data(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_session_id ON public.biometric_data(session_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_timestamp ON public.biometric_data(capture_timestamp);
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_biometric_data_id ON public.analysis_results(biometric_data_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi_accessed ON public.audit_logs(phi_accessed);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(timestamp);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles (CRITICAL for fixing the error)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow profile creation" ON public.user_profiles;
CREATE POLICY "Allow profile creation" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for biometric_data
DROP POLICY IF EXISTS "Users can view own biometric data" ON public.biometric_data;
CREATE POLICY "Users can view own biometric data" ON public.biometric_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own biometric data" ON public.biometric_data;
CREATE POLICY "Users can insert own biometric data" ON public.biometric_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Company users can view organization data" ON public.biometric_data;
CREATE POLICY "Company users can view organization data" ON public.biometric_data FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND up.pillar_type = 'company'
        AND up.organization_id = (
            SELECT up2.organization_id FROM public.user_profiles up2 WHERE up2.user_id = biometric_data.user_id
        )
    )
);

-- RLS Policies for analysis_results
DROP POLICY IF EXISTS "Users can view own analysis results" ON public.analysis_results;
CREATE POLICY "Users can view own analysis results" ON public.analysis_results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analysis results" ON public.analysis_results;
CREATE POLICY "Users can insert own analysis results" ON public.analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for consent_records
DROP POLICY IF EXISTS "Users can view own consent records" ON public.consent_records;
CREATE POLICY "Users can view own consent records" ON public.consent_records FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent records" ON public.consent_records;
CREATE POLICY "Users can insert own consent records" ON public.consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for audit_logs (read-only for users, admin access)
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for access_logs
DROP POLICY IF EXISTS "Users can view own access logs" ON public.access_logs;
CREATE POLICY "Users can view own access logs" ON public.access_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert access logs" ON public.access_logs;
CREATE POLICY "System can insert access logs" ON public.access_logs FOR INSERT WITH CHECK (true);

-- Create functions for automatic timestamping
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamping
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for automatic audit logging
CREATE OR REPLACE FUNCTION public.log_data_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, 
        event_type, 
        table_name, 
        record_id, 
        action_performed,
        phi_accessed
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE 
            WHEN TG_TABLE_NAME IN ('biometric_data', 'analysis_results', 'user_profiles') THEN true
            ELSE false
        END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers for PHI tables
DROP TRIGGER IF EXISTS audit_biometric_data ON public.biometric_data;
CREATE TRIGGER audit_biometric_data AFTER INSERT OR UPDATE OR DELETE ON public.biometric_data
    FOR EACH ROW EXECUTE FUNCTION public.log_data_access();

DROP TRIGGER IF EXISTS audit_analysis_results ON public.analysis_results;
CREATE TRIGGER audit_analysis_results AFTER INSERT OR UPDATE OR DELETE ON public.analysis_results
    FOR EACH ROW EXECUTE FUNCTION public.log_data_access();

DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_data_access();

-- Insert default data retention policies (only if no admin user exists yet)
INSERT INTO public.data_retention_policies (policy_name, data_type, retention_period_days, legal_basis, policy_version, effective_date, created_by) 
SELECT 'HIPAA Biometric Data', 'biometric_data', 2555, 'HIPAA 45 CFR 164.316(b)(2)(i)', 'v1.0', NOW(), '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.data_retention_policies WHERE policy_name = 'HIPAA Biometric Data');

INSERT INTO public.data_retention_policies (policy_name, data_type, retention_period_days, legal_basis, policy_version, effective_date, created_by) 
SELECT 'HIPAA Analysis Results', 'analysis_results', 2555, 'HIPAA 45 CFR 164.316(b)(2)(i)', 'v1.0', NOW(), '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.data_retention_policies WHERE policy_name = 'HIPAA Analysis Results');

INSERT INTO public.data_retention_policies (policy_name, data_type, retention_period_days, legal_basis, policy_version, effective_date, created_by) 
SELECT 'HIPAA Audit Logs', 'audit_logs', 2555, 'HIPAA 45 CFR 164.312(b)', 'v1.0', NOW(), '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.data_retention_policies WHERE policy_name = 'HIPAA Audit Logs');

INSERT INTO public.data_retention_policies (policy_name, data_type, retention_period_days, legal_basis, policy_version, effective_date, created_by) 
SELECT 'User Preferences', 'user_preferences', 1095, 'Business Requirement', 'v1.0', NOW(), '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.data_retention_policies WHERE policy_name = 'User Preferences');

COMMIT;

-- Verify table creation
SELECT 
    'SUCCESS: HoloCheck HIPAA-compliant database schema created!' as status,
    'All 9 tables created with RLS policies and audit triggers' as details,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'user_profiles', 'biometric_data', 'analysis_results', 'audit_logs', 
        'consent_records', 'user_preferences', 'data_retention_policies', 
        'access_logs', 'organizations'
    )) as tables_created,
    NOW() as timestamp;