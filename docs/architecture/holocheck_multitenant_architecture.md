# HoloCheck Multi-Tenant Architecture Design

## Executive Summary

This document presents a complete architectural redesign for HoloCheck to address critical issues:
1. **Anti-pattern removal**: Database creation on every app load
2. **Multi-tenant architecture**: Proper tenant isolation for insurance companies
3. **Configuration management**: Database-driven parameters instead of hardcoded values
4. **Admin-controlled setup**: Proper initialization process

## Current Problems Identified

### 🚨 Critical Anti-Patterns
- ❌ Database schema creation runs on every application startup
- ❌ No tenant isolation (single-tenant design for multi-tenant platform)
- ❌ Hardcoded configuration values and fallback data in code
- ❌ No proper admin controls for system initialization

### 🏢 Missing Business Model Support
- ❌ No support for multiple insurance companies (tenants)
- ❌ No company-to-employee hierarchy management
- ❌ No contract/agreement management between insurers and companies

## Proposed Multi-Tenant Architecture

### 1. Tenant Hierarchy Model

```
INSURANCE COMPANY (Tenant Level 1)
├── Configuration & Branding
├── HIPAA Policies & Compliance Settings
├── CONTRACTED COMPANIES (Tenant Level 2)
│   ├── Company A
│   │   ├── Contract Terms & Coverage
│   │   ├── EMPLOYEES/COLLABORATORS (End Users)
│   │   │   ├── Employee 1 (Biometric Data)
│   │   │   ├── Employee 2 (Biometric Data)
│   │   │   └── Employee N (Biometric Data)
│   │   └── Company Admin Users
│   ├── Company B
│   │   └── [Same structure]
│   └── Company N
└── Insurance Company Admin Users
```

### 2. Database Schema Design

#### Core Tenant Management Tables

```sql
-- TENANT (INSURANCE COMPANY) MANAGEMENT
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'axa', 'mapfre', 'zurich'
  company_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE, -- e.g., 'axa.holocheck.com'
  status tenant_status DEFAULT 'active',
  hipaa_encryption_key TEXT NOT NULL, -- Tenant-specific encryption
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Compliance & Configuration
  data_retention_years INTEGER DEFAULT 7,
  audit_level audit_level_enum DEFAULT 'full',
  allowed_biometric_types TEXT[] DEFAULT ARRAY['facial', 'voice', 'vital_signs']
);

-- CONTRACTED COMPANIES (PER TENANT)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_code VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  
  -- Contract Information
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  coverage_type coverage_type_enum NOT NULL,
  max_employees INTEGER,
  
  -- Status & Configuration
  status company_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, company_code)
);

-- USER MANAGEMENT WITH PROPER HIERARCHY
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password TEXT,
  
  -- User Classification
  user_type user_type_enum NOT NULL, -- 'tenant_admin', 'company_admin', 'employee'
  pillar_access pillar_access_enum[] DEFAULT ARRAY['individual'], -- 'individual', 'company', 'insurance'
  
  -- Personal Information (Encrypted)
  encrypted_personal_data JSONB,
  employee_id VARCHAR(100),
  department VARCHAR(100),
  
  -- Status & Timestamps
  status user_status DEFAULT 'active',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- HIPAA Compliance
  hipaa_consent_date TIMESTAMPTZ,
  data_retention_until TIMESTAMPTZ,
  
  UNIQUE(tenant_id, email),
  UNIQUE(company_id, employee_id)
);
```

#### Configuration Management Tables

```sql
-- TENANT-SPECIFIC CONFIGURATION
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  config_category config_category_enum NOT NULL, -- 'branding', 'analysis', 'security', 'compliance'
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array'
  
  -- Metadata
  description TEXT,
  is_system_config BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, config_category, config_key)
);

-- COMPANY-SPECIFIC CONFIGURATION
CREATE TABLE company_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  config_category config_category_enum NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, config_category, config_key)
);

-- SYSTEM-WIDE CONFIGURATION (Non-tenant specific)
CREATE TABLE system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  
  -- Metadata
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be accessed by frontend
  requires_admin BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Biometric Data with Tenant Isolation

```sql
-- BIOMETRIC DATA (TENANT ISOLATED)
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session Information
  session_id VARCHAR(100) NOT NULL,
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Encrypted Biometric Data (using tenant-specific key)
  encrypted_biometric_data JSONB NOT NULL,
  data_hash VARCHAR(256) NOT NULL, -- For integrity verification
  
  -- Metadata
  capture_device_info JSONB,
  capture_location JSONB,
  data_quality_score DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure data belongs to correct tenant hierarchy
  CONSTRAINT fk_user_tenant CHECK (
    (SELECT tenant_id FROM users WHERE id = user_id) = tenant_id
  ),
  CONSTRAINT fk_user_company CHECK (
    (SELECT company_id FROM users WHERE id = user_id) = company_id
  )
);

-- ANALYSIS RESULTS (TENANT ISOLATED)
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  biometric_data_id UUID REFERENCES biometric_data(id) ON DELETE CASCADE,
  
  -- Analysis Results (Encrypted)
  encrypted_results JSONB NOT NULL,
  health_score DECIMAL(5,2),
  risk_indicators TEXT[],
  
  -- AI Analysis Metadata
  analysis_model_version VARCHAR(50),
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tenant consistency constraints
  CONSTRAINT fk_biometric_tenant CHECK (
    (SELECT tenant_id FROM biometric_data WHERE id = biometric_data_id) = tenant_id
  )
);
```

#### Audit & Compliance (Per Tenant)

```sql
-- AUDIT LOGS (TENANT SEPARATED)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Audit Information
  action audit_action_enum NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  
  -- HIPAA Compliance
  phi_accessed BOOLEAN DEFAULT false,
  phi_data_types TEXT[], -- 'biometric', 'personal', 'health'
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional metadata
  metadata JSONB
);

-- ACCESS LOGS (TENANT SEPARATED)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Access Information
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Row Level Security (RLS) Implementation

```sql
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

-- Tenant isolation policies
CREATE POLICY tenant_isolation_policy ON tenants
  FOR ALL USING (
    id = (current_setting('app.current_tenant_id', true))::uuid
  );

CREATE POLICY company_tenant_isolation ON companies
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
  );

CREATE POLICY user_tenant_isolation ON users
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
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
```

## Implementation Architecture

### 1. Admin-Only Database Setup Process

#### Database Initialization Tool
```javascript
// /admin/tools/DatabaseSetupTool.js
class DatabaseSetupTool {
  constructor() {
    this.requireSuperAdminAuth();
  }

  async initializeSystemDatabase() {
    // 1. Create system tables
    // 2. Setup default system configurations
    // 3. Create first super admin user
    // 4. Initialize audit system
  }

  async createTenant(tenantData) {
    // 1. Create tenant record
    // 2. Generate tenant-specific encryption keys
    // 3. Setup tenant default configurations
    // 4. Create tenant admin user
    // 5. Initialize tenant-specific audit logs
  }

  async addCompanyToTenant(tenantId, companyData) {
    // 1. Validate tenant exists and is active
    // 2. Create company record
    // 3. Setup company configurations
    // 4. Create company admin user
    // 5. Setup company-specific policies
  }
}
```

#### Tenant Onboarding Process
```javascript
// /admin/workflows/TenantOnboarding.js
class TenantOnboardingWorkflow {
  async onboardInsuranceCompany(insuranceData) {
    const steps = [
      'validateInsuranceCompanyData',
      'createTenantRecord',
      'setupTenantEncryption',
      'createDefaultConfigurations',
      'setupBrandingConfiguration',
      'createTenantAdminUser',
      'initializeTenantAuditSystem',
      'setupInitialPolicies',
      'validateTenantSetup'
    ];

    return await this.executeWorkflow(steps, insuranceData);
  }
}
```

### 2. Configuration Management System

#### Configuration Service
```javascript
// /src/services/ConfigurationService.js
class ConfigurationService {
  constructor(tenantId, companyId = null) {
    this.tenantId = tenantId;
    this.companyId = companyId;
  }

  async getConfiguration(category, key) {
    // Priority order:
    // 1. Company-specific configuration
    // 2. Tenant-specific configuration  
    // 3. System default configuration
    // NO HARDCODED FALLBACKS
  }

  async updateConfiguration(category, key, value, scope = 'tenant') {
    // Admin-only configuration updates
    // Validate permissions based on user role
    // Log configuration changes for audit
  }

  async getBiometricAnalysisConfig() {
    // Get tenant-specific analysis parameters
    // No hardcoded analysis thresholds
  }

  async getUIBrandingConfig() {
    // Get tenant-specific branding
    // Colors, logos, terminology
  }
}
```

### 3. Application Startup Process (Fixed)

#### Proper Application Initialization
```javascript
// /src/App.jsx (FIXED VERSION)
function App() {
  const [tenantInfo, setTenantInfo] = useState(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      // 1. Detect tenant from subdomain/domain
      const tenant = await detectTenant();
      
      // 2. Load tenant configuration (NOT create database)
      const config = await loadTenantConfiguration(tenant.id);
      
      // 3. Initialize services with tenant context
      await initializeServices(tenant, config);
      
      // 4. Set application ready
      setTenantInfo(tenant);
      setAppReady(true);
      
    } catch (error) {
      // Handle initialization errors
      // Redirect to setup page if tenant not found
    }
  };

  // NO DATABASE CREATION ON STARTUP
  // NO HARDCODED FALLBACK VALUES
  // TENANT-AWARE INITIALIZATION ONLY
}
```

### 4. User Authentication & Authorization

#### Multi-Tenant Authentication Flow
```javascript
// /src/services/AuthService.js
class MultiTenantAuthService {
  async authenticateUser(email, password, tenantCode) {
    // 1. Validate tenant exists and is active
    // 2. Authenticate user within tenant context
    // 3. Load user permissions and company association
    // 4. Set tenant context in session
    // 5. Initialize user-specific configurations
  }

  async getUserPermissions(userId, tenantId) {
    // Return permissions based on:
    // - User type (tenant_admin, company_admin, employee)
    // - Pillar access (individual, company, insurance)
    // - Company association
    // - Tenant policies
  }
}
```

## Data Flow Architecture

### 1. Request Processing Flow
```
User Request → Tenant Detection → Authentication → Authorization → Data Access
     ↓              ↓                    ↓              ↓             ↓
Subdomain/     Tenant Context      User Validation   Permission    Tenant-Filtered
Domain         Resolution          & Role Loading    Checking      Database Query
```

### 2. Configuration Loading Flow
```
Application Start → Tenant Detection → Configuration Loading → Service Initialization
        ↓                   ↓                    ↓                      ↓
    Domain/Subdomain    Tenant Record      Company Config         Tenant-Aware
    Analysis            Validation         Tenant Config          Services Ready
                                          System Config
```

## Migration Strategy

### Phase 1: Database Schema Migration
1. **Create new multi-tenant schema**
2. **Migrate existing data to tenant structure**
3. **Implement RLS policies**
4. **Create admin tools for tenant management**

### Phase 2: Application Architecture Migration
1. **Remove database creation from app startup**
2. **Implement tenant detection and context**
3. **Replace hardcoded values with configuration system**
4. **Update authentication to be tenant-aware**

### Phase 3: Admin Tools & Processes
1. **Create tenant onboarding workflow**
2. **Build configuration management UI**
3. **Implement proper database setup tools**
4. **Create monitoring and analytics per tenant**

### Phase 4: Testing & Deployment
1. **Multi-tenant isolation testing**
2. **Performance testing with multiple tenants**
3. **Security penetration testing**
4. **HIPAA compliance validation per tenant**

## Quality Assurance Requirements

### 1. Database Setup
- ✅ NO automatic database creation on app startup
- ✅ Admin-only database initialization tools
- ✅ Proper error handling and rollback mechanisms
- ✅ Setup validation and verification processes

### 2. Multi-Tenant Isolation
- ✅ Complete data isolation between tenants
- ✅ Cross-tenant access prevention testing
- ✅ Performance testing with multiple active tenants
- ✅ Security audit of tenant boundaries

### 3. Configuration Management
- ✅ NO hardcoded values in production code
- ✅ All configuration stored in database tables
- ✅ Configuration change audit trails
- ✅ Rollback capabilities for configuration changes

### 4. HIPAA Compliance Per Tenant
- ✅ Tenant-specific encryption keys
- ✅ Separate audit logs per tenant
- ✅ Data retention policies per tenant
- ✅ Access logging and monitoring per tenant

## Conclusion

This architectural redesign addresses all critical issues:

1. **✅ Removes database creation anti-pattern** - Admin-only setup process
2. **✅ Implements proper multi-tenant architecture** - Full tenant isolation
3. **✅ Eliminates hardcoded configurations** - Database-driven configuration
4. **✅ Establishes proper admin controls** - Controlled setup and management

The new architecture supports the business model of insurance companies managing contracted companies and their employees, with proper HIPAA compliance and data isolation at every level.