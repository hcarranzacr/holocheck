# HoloCheck Multi-Tenant Architecture Redesign

## Critical Issues Identified

### 1. **Database Creation Anti-Pattern**
- ❌ **Current Problem**: Database creation runs on every app load
- ❌ **Bad Practice**: Automatic schema creation in production
- ❌ **Security Risk**: Client-side database operations

### 2. **Missing Multi-Tenant Architecture**
- ❌ **Current Problem**: Single-tenant design
- ❌ **Missing**: Insurance company tenant isolation
- ❌ **Missing**: Company-to-employee hierarchy

### 3. **Hardcoded Configuration**
- ❌ **Current Problem**: Fallback data in code
- ❌ **Bad Practice**: Configuration not in database
- ❌ **Missing**: Dynamic parameterization

## Proposed Solution Architecture

### 1. **Multi-Tenant Database Design**

```sql
-- TENANT ISOLATION LAYER
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANY MANAGEMENT (Per Tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  company_name VARCHAR(255) NOT NULL,
  contract_details JSONB,
  status company_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER HIERARCHY (Tenant -> Company -> Employee)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  company_id UUID REFERENCES companies(id),
  user_type user_type_enum NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role_enum NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION CONFIGURATION (Database-Driven)
CREATE TABLE app_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type config_type_enum NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);
```

### 2. **Admin-Only Database Setup Process**

```javascript
// SEPARATE ADMIN TOOL: /admin/database-setup.js
class DatabaseSetupTool {
  constructor() {
    this.requireAdminAuth();
  }

  async initializeTenant(insuranceCompanyData) {
    // 1. Create tenant
    // 2. Setup tenant-specific schemas
    // 3. Create admin user
    // 4. Setup default configurations
  }

  async setupCompany(tenantId, companyData) {
    // 1. Create company under tenant
    // 2. Setup company-specific configurations
    // 3. Create company admin user
  }
}
```

### 3. **Configuration Management System**

```javascript
// CONFIGURATION SERVICE
class ConfigurationService {
  async getTenantConfig(tenantId, configKey) {
    // Fetch from app_configurations table
    // No fallback values in code
  }

  async updateTenantConfig(tenantId, configKey, configValue) {
    // Admin-only configuration updates
  }
}
```

### 4. **User Hierarchy Management**

```
INSURANCE COMPANY (Tenant)
├── COMPANY A (Contract/Agreement)
│   ├── Employee 1
│   ├── Employee 2
│   └── Company Admin
├── COMPANY B (Contract/Agreement)
│   ├── Employee 3
│   └── Company Admin
└── Insurance Admin (Tenant Admin)
```

## Implementation Approach

### Phase 1: Database Architecture
1. **Remove automatic database creation from app startup**
2. **Create proper multi-tenant schema**
3. **Implement tenant isolation with RLS policies**
4. **Create admin-only setup tools**

### Phase 2: Configuration Management
1. **Move all configuration to database tables**
2. **Remove hardcoded fallback values**
3. **Implement dynamic configuration loading**
4. **Create configuration management UI**

### Phase 3: User Management
1. **Implement tenant-company-employee hierarchy**
2. **Create proper authentication flows per user type**
3. **Implement role-based access control**
4. **Create user management interfaces**

### Phase 4: Admin Tools
1. **Create tenant onboarding process**
2. **Build company management tools**
3. **Implement user provisioning**
4. **Create monitoring and analytics**

## Security Considerations

### 1. **Tenant Isolation**
- Row Level Security (RLS) policies per tenant
- Separate encryption keys per tenant
- Audit logging per tenant

### 2. **Admin Access Control**
- Separate admin authentication
- Multi-factor authentication for admin operations
- Admin action audit trails

### 3. **HIPAA Compliance**
- Per-tenant data encryption
- Tenant-specific audit logs
- Data retention policies per tenant

## Data Flow Architecture

```
User Request → Tenant Detection → Authentication → Authorization → Data Access
     ↓              ↓                    ↓              ↓             ↓
Subdomain/     Tenant ID         User Role      Permission    Tenant-Filtered
Domain         Resolution        Validation     Check         Database Query
```

## Quality Assurance Requirements

### 1. **Database Setup**
- ✅ Admin-only database initialization
- ✅ Proper error handling and rollback
- ✅ Setup validation and verification
- ✅ Automated testing of setup process

### 2. **Multi-Tenant Isolation**
- ✅ Tenant data isolation testing
- ✅ Cross-tenant access prevention
- ✅ Performance testing with multiple tenants
- ✅ Security penetration testing

### 3. **Configuration Management**
- ✅ No hardcoded values in production
- ✅ Configuration validation
- ✅ Configuration change audit trails
- ✅ Rollback capabilities

## Migration Strategy

### Step 1: Create New Architecture
- Design and implement new multi-tenant schema
- Create admin setup tools
- Implement configuration management

### Step 2: Remove Anti-Patterns
- Remove automatic database creation from app startup
- Extract hardcoded configurations to database
- Implement proper admin controls

### Step 3: Testing and Validation
- Test tenant isolation
- Validate admin workflows
- Performance and security testing

### Step 4: Deployment
- Gradual migration of existing data
- Admin training and documentation
- Production deployment with monitoring

## Conclusion

The current architecture has fundamental flaws that need immediate correction:

1. **Database creation must be admin-only, not automatic**
2. **Multi-tenant architecture is essential for insurance platform**
3. **All configuration must be database-driven, not hardcoded**
4. **Proper user hierarchy: Insurance → Company → Employee**

This redesign addresses all architectural concerns while maintaining HIPAA compliance and ensuring proper quality assurance.