-- ============================================================================
-- HOLOCHECK - REDISEÑO DE 4 PILARES
-- ============================================================================
-- Purpose: Rediseñar la arquitectura para reflejar claramente los 4 pilares
-- Pillars: 1) Usuario Final/Familiar, 2) Empresa Asegurada, 3) Aseguradora, 4) Admin Plataforma
-- ============================================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: CREATE NEW PILLAR-SPECIFIC TABLES
-- ============================================================================

-- PILAR 4: PLATFORM ADMINISTRATORS (Administradores de Plataforma)
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References auth.users
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'platform_admin' CHECK (role IN ('platform_admin', 'platform_support')),
    permissions JSONB DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PILAR 3: TENANT STAFF (Personal de Aseguradoras)
CREATE TABLE IF NOT EXISTS tenant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References auth.users
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'insurance_agent' CHECK (role IN ('insurance_admin', 'insurance_agent', 'insurance_underwriter', 'insurance_analyst')),
    department VARCHAR(100),
    position VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    territory JSONB, -- Geographic or client territory
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- PILAR 2: COMPANY STAFF (Personal de Empresas Aseguradas)
CREATE TABLE IF NOT EXISTS company_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References auth.users
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    role VARCHAR(50) DEFAULT 'company_employee' CHECK (role IN ('company_admin', 'company_hr', 'company_manager', 'company_employee')),
    department VARCHAR(100),
    position VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    manager_id UUID REFERENCES company_staff(id),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, company_id, employee_id)
);

-- PILAR 1: END USERS (Usuarios Finales y Familiares)
CREATE TABLE IF NOT EXISTS end_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE, -- References auth.users
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL for individual users
    company_staff_id UUID REFERENCES company_staff(id) ON DELETE CASCADE, -- Link to employee if family member
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'end_user' CHECK (user_type IN ('end_user', 'family_member', 'individual_subscriber')),
    relationship VARCHAR(50), -- 'self', 'spouse', 'child', 'parent', etc.
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),
    emergency_contact JSONB,
    medical_conditions JSONB,
    encrypted_personal_data JSONB,
    hipaa_consent BOOLEAN DEFAULT false,
    hipaa_consent_date TIMESTAMP WITH TIME ZONE,
    data_sharing_consent BOOLEAN DEFAULT false,
    data_sharing_date TIMESTAMP WITH TIME ZONE,
    privacy_settings JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Platform admins indexes
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON platform_admins(email);
CREATE INDEX IF NOT EXISTS idx_platform_admins_role ON platform_admins(role);

-- Tenant staff indexes
CREATE INDEX IF NOT EXISTS idx_tenant_staff_user_id ON tenant_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_staff_tenant_id ON tenant_staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_staff_email ON tenant_staff(email);
CREATE INDEX IF NOT EXISTS idx_tenant_staff_role ON tenant_staff(role);

-- Company staff indexes
CREATE INDEX IF NOT EXISTS idx_company_staff_user_id ON company_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_company_staff_tenant_id ON company_staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_staff_company_id ON company_staff(company_id);
CREATE INDEX IF NOT EXISTS idx_company_staff_email ON company_staff(email);
CREATE INDEX IF NOT EXISTS idx_company_staff_role ON company_staff(role);
CREATE INDEX IF NOT EXISTS idx_company_staff_manager_id ON company_staff(manager_id);

-- End users indexes
CREATE INDEX IF NOT EXISTS idx_end_users_user_id ON end_users(user_id);
CREATE INDEX IF NOT EXISTS idx_end_users_tenant_id ON end_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_end_users_company_id ON end_users(company_id);
CREATE INDEX IF NOT EXISTS idx_end_users_company_staff_id ON end_users(company_staff_id);
CREATE INDEX IF NOT EXISTS idx_end_users_email ON end_users(email);
CREATE INDEX IF NOT EXISTS idx_end_users_user_type ON end_users(user_type);

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for initial setup)
CREATE POLICY "platform_admins_full_access" ON platform_admins FOR ALL USING (true);
CREATE POLICY "tenant_staff_tenant_isolation" ON tenant_staff FOR ALL USING (true);
CREATE POLICY "company_staff_tenant_isolation" ON company_staff FOR ALL USING (true);
CREATE POLICY "end_users_tenant_isolation" ON end_users FOR ALL USING (true);

-- ============================================================================
-- STEP 4: INSERT DEMO DATA FOR 4 PILLARS
-- ============================================================================

-- Get demo tenant ID
DO $$
DECLARE
    demo_tenant_id UUID;
    demo_company_id UUID;
    demo_staff_id UUID;
BEGIN
    -- Get or create demo tenant
    SELECT id INTO demo_tenant_id FROM tenants WHERE slug = 'demo-insurance' LIMIT 1;
    
    IF demo_tenant_id IS NULL THEN
        INSERT INTO tenants (name, domain, slug, license_number, regulatory_body, billing_email)
        VALUES ('Demo Insurance Company', 'demo.holocheck.com', 'demo-insurance', 'LIC-DEMO-001', 'Demo Regulatory Body', 'admin@demo.holocheck.com')
        RETURNING id INTO demo_tenant_id;
    END IF;
    
    -- Get or create demo company
    SELECT id INTO demo_company_id FROM companies WHERE tenant_id = demo_tenant_id AND company_code = 'DEMO-CORP' LIMIT 1;
    
    IF demo_company_id IS NULL THEN
        INSERT INTO companies (tenant_id, name, company_code, industry, employee_count, size_category, contact_email, contact_phone)
        VALUES (demo_tenant_id, 'Demo Corporation', 'DEMO-CORP', 'Technology', 150, 'medium', 'empresa@demo-company.com', '+1-555-0123')
        RETURNING id INTO demo_company_id;
    END IF;
    
    -- Note: We'll create the actual auth users through Supabase Auth API
    -- These are placeholder records that will be linked when users are created
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DEMO DATA STRUCTURE CREATED FOR 4 PILLARS';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Demo Tenant ID: %', demo_tenant_id;
    RAISE NOTICE 'Demo Company ID: %', demo_company_id;
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next: Create auth users and link to pillar tables';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- STEP 5: CREATE VIEW FOR UNIFIED USER ACCESS
-- ============================================================================

CREATE OR REPLACE VIEW unified_users AS
SELECT 
    'platform_admin' as pillar,
    pa.id as profile_id,
    pa.user_id,
    pa.full_name,
    pa.email,
    pa.role,
    NULL::UUID as tenant_id,
    NULL::UUID as company_id,
    pa.is_active,
    pa.last_login,
    pa.created_at
FROM platform_admins pa
WHERE pa.is_active = true

UNION ALL

SELECT 
    'tenant_staff' as pillar,
    ts.id as profile_id,
    ts.user_id,
    ts.full_name,
    ts.email,
    ts.role,
    ts.tenant_id,
    NULL::UUID as company_id,
    ts.is_active,
    ts.last_login,
    ts.created_at
FROM tenant_staff ts
WHERE ts.is_active = true

UNION ALL

SELECT 
    'company_staff' as pillar,
    cs.id as profile_id,
    cs.user_id,
    cs.full_name,
    cs.email,
    cs.role,
    cs.tenant_id,
    cs.company_id,
    cs.is_active,
    cs.last_login,
    cs.created_at
FROM company_staff cs
WHERE cs.is_active = true

UNION ALL

SELECT 
    'end_user' as pillar,
    eu.id as profile_id,
    eu.user_id,
    eu.full_name,
    eu.email,
    eu.user_type as role,
    eu.tenant_id,
    eu.company_id,
    eu.is_active,
    eu.last_login,
    eu.created_at
FROM end_users eu
WHERE eu.is_active = true;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('platform_admins', 'tenant_staff', 'company_staff', 'end_users');
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'HOLOCHECK 4-PILLARS REDESIGN COMPLETED!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'New pillar tables created: % out of 4 expected', table_count;
    RAISE NOTICE 'Unified view created: unified_users';
    RAISE NOTICE 'RLS enabled on all pillar tables';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'PILLAR STRUCTURE:';
    RAISE NOTICE '1. Platform Admins (Pilar 4) - System administrators';
    RAISE NOTICE '2. Tenant Staff (Pilar 3) - Insurance company personnel';
    RAISE NOTICE '3. Company Staff (Pilar 2) - Insured company employees';
    RAISE NOTICE '4. End Users (Pilar 1) - Final users and family members';
    RAISE NOTICE '============================================================================';
    
    IF table_count = 4 THEN
        RAISE NOTICE 'STATUS: ✅ SUCCESS - 4-Pillars architecture ready';
    ELSE
        RAISE NOTICE 'STATUS: ⚠️  WARNING - Some pillar tables may not have been created';
    END IF;
END $$;

-- Final confirmation
SELECT '4-Pillars architecture implemented successfully! Ready for user creation and authentication setup.' as result;