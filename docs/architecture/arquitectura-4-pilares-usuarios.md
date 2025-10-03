# HOLOCHECK - ARQUITECTURA DE 4 PILARES DE USUARIOS

## 📋 ANÁLISIS DEL PROBLEMA ACTUAL

### Problema Identificado por el Usuario:
El usuario ha señalado correctamente que la plataforma debe soportar **4 tipos de usuarios distintos** (pilares), pero el sistema actual no refleja claramente esta estructura:

### 4 Pilares Requeridos:
1. **👨‍👩‍👧‍👦 Usuario Final/Familiar** - Personas que realizan chequeos biométricos
2. **🏢 Empresa Asegurada** - Empresas que contratan seguros para sus empleados  
3. **🏦 Aseguradora** - Compañías de seguros que venden pólizas (tenants)
4. **⚙️ Administrador de Plataforma** - Controla tenants y configuración global

## 🚨 PROBLEMAS EN LA ARQUITECTURA ACTUAL

### 1. Roles de Usuario Insuficientes
```javascript
// ACTUAL - Solo 4 roles básicos genéricos
USER_ROLES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company', 
  INSURANCE: 'insurance',
  ADMIN: 'admin'
}
```

**Problemas:**
- No hay separación clara entre tipos de entidades
- Los roles no reflejan la jerarquía real del negocio
- Confunde conceptos (company vs empresa asegurada)

### 2. Estructura de Base de Datos Confusa
```sql
-- ACTUAL - Tabla user_profiles mezcla conceptos
CREATE TABLE user_profiles (
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    role VARCHAR(50) DEFAULT 'employee',
    -- Todos los usuarios requieren tenant_id Y company_id
)
```

**Problemas:**
- Todos los usuarios requieren tanto tenant_id como company_id
- No hay clara separación entre administradores de plataforma y usuarios de tenant
- Los usuarios finales están forzados a pertenecer a una empresa

### 3. Configuración Inicial Limitada
- Solo se crean 2 usuarios de prueba genéricos
- No representa los 4 pilares claramente
- Falta demostración de flujos completos por tipo de usuario

## ✅ SOLUCIÓN PROPUESTA - ARQUITECTURA DE 4 PILARES

### 1. Redefinición Completa de Roles

```javascript
// NUEVO - 4 pilares claramente definidos con sub-roles
USER_PILLARS = {
  // PILAR 1: Usuario Final/Familiar
  END_USER: {
    INDIVIDUAL: 'individual_user',        // Usuario individual
    FAMILY_MEMBER: 'family_member',       // Familiar de empleado
    EMPLOYEE: 'employee_user'             // Empleado que se hace análisis
  },
  
  // PILAR 2: Empresa Asegurada  
  INSURED_COMPANY: {
    COMPANY_ADMIN: 'company_admin',       // Administrador de empresa
    HR_MANAGER: 'hr_manager',             // Gerente de RH
    DEPARTMENT_HEAD: 'department_head',   // Jefe de departamento
    COMPANY_EMPLOYEE: 'company_employee'  // Empleado con acceso admin
  },
  
  // PILAR 3: Aseguradora (Tenant)
  INSURANCE_COMPANY: {
    INSURANCE_ADMIN: 'insurance_admin',       // Director de aseguradora
    UNDERWRITER: 'underwriter',               // Suscriptor de pólizas
    AGENT: 'insurance_agent',                 // Agente de seguros
    ANALYST: 'insurance_analyst',             // Analista de datos
    MEDICAL_REVIEWER: 'medical_reviewer'      // Revisor médico
  },
  
  // PILAR 4: Administrador de Plataforma
  PLATFORM_ADMIN: {
    SUPER_ADMIN: 'super_admin',           // Super administrador
    PLATFORM_ADMIN: 'platform_admin',    // Administrador de plataforma
    SUPPORT_AGENT: 'support_agent',       // Agente de soporte
    SYSTEM_MONITOR: 'system_monitor'      // Monitor del sistema
  }
}
```

### 2. Nueva Estructura de Base de Datos

#### Jerarquía Clara:
```
PLATAFORMA HOLOCHECK
├── PLATFORM_ADMINS (Pilar 4) - Administradores del Sistema
├── TENANTS (Pilar 3) - Aseguradoras
│   ├── TENANT_STAFF - Personal de la Aseguradora
│   ├── COMPANIES (Pilar 2) - Empresas Aseguradas
│   │   ├── COMPANY_STAFF - Personal Administrativo de Empresa
│   │   └── END_USERS (Pilar 1) - Empleados y Familiares
│   └── INDIVIDUAL_USERS (Pilar 1) - Usuarios Individuales
```

#### Nuevas Tablas Especializadas:

```sql
-- PILAR 4: ADMINISTRADORES DE PLATAFORMA
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'platform_admin',
    permissions JSONB DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT false,
    -- NO tenant_id - acceso global
);

-- PILAR 3: PERSONAL DE ASEGURADORAS
CREATE TABLE tenant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'insurance_agent',
    department VARCHAR(100),
    territory JSONB,
    -- Solo tenant_id - acceso a nivel aseguradora
);

-- PILAR 2: PERSONAL DE EMPRESAS ASEGURADAS
CREATE TABLE company_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    role VARCHAR(50) DEFAULT 'company_employee',
    department VARCHAR(100),
    manager_id UUID REFERENCES company_staff(id),
    -- tenant_id + company_id - acceso a nivel empresa
);

-- PILAR 1: USUARIOS FINALES Y FAMILIARES
CREATE TABLE end_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID REFERENCES companies(id), -- NULL para usuarios individuales
    company_staff_id UUID REFERENCES company_staff(id), -- Link a empleado si es familiar
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'end_user',
    relationship VARCHAR(50), -- 'self', 'spouse', 'child', etc.
    date_of_birth DATE,
    medical_conditions JSONB,
    hipaa_consent BOOLEAN DEFAULT false,
    -- Acceso solo a sus propios datos
);
```

### 3. Permisos y Accesos por Pilar

#### PILAR 4: Administradores de Plataforma
```javascript
PLATFORM_ADMIN_PERMISSIONS = {
  // Gestión global
  manage_tenants: true,
  manage_system_config: true,
  view_all_analytics: true,
  manage_platform_users: true,
  
  // Acceso a datos
  access_level: 'GLOBAL',
  data_scope: 'ALL_TENANTS',
  
  // Dashboard específico
  dashboard: 'PlatformAdminDashboard'
}
```

#### PILAR 3: Personal de Aseguradoras
```javascript
INSURANCE_STAFF_PERMISSIONS = {
  // Gestión de tenant
  manage_companies: true,
  manage_policies: true,
  view_tenant_analytics: true,
  manage_tenant_staff: true,
  
  // Acceso a datos
  access_level: 'TENANT',
  data_scope: 'TENANT_COMPANIES',
  
  // Dashboard específico
  dashboard: 'InsuranceDashboard'
}
```

#### PILAR 2: Personal de Empresas
```javascript
COMPANY_STAFF_PERMISSIONS = {
  // Gestión de empresa
  manage_employees: true,
  view_company_analytics: true,
  manage_health_programs: true,
  
  // Acceso a datos
  access_level: 'COMPANY',
  data_scope: 'COMPANY_EMPLOYEES',
  
  // Dashboard específico
  dashboard: 'CompanyDashboard'
}
```

#### PILAR 1: Usuarios Finales
```javascript
END_USER_PERMISSIONS = {
  // Gestión personal
  manage_own_profile: true,
  view_own_results: true,
  manage_family_members: true, // Solo si es empleado principal
  
  // Acceso a datos
  access_level: 'PERSONAL',
  data_scope: 'OWN_DATA_ONLY',
  
  // Dashboard específico
  dashboard: 'PersonalHealthDashboard'
}
```

### 4. Flujos de Autenticación por Pilar

#### Flujo de Login Diferenciado:
```javascript
// 1. Usuario ingresa credenciales
// 2. Sistema identifica el pilar del usuario
// 3. Redirige al dashboard específico del pilar
// 4. Aplica permisos correspondientes

const authenticateUser = async (email, password) => {
  const { user, session } = await supabase.auth.signInWithPassword({email, password});
  
  // Determinar pilar del usuario
  const pillar = await determinePillar(user.id);
  
  // Cargar perfil específico del pilar
  const profile = await loadPillarProfile(user.id, pillar);
  
  // Redirigir al dashboard apropiado
  const dashboard = getDashboardForPillar(pillar);
  
  return { user, session, profile, pillar, dashboard };
};
```

### 5. Dashboards Específicos por Pilar

#### PILAR 4: Dashboard de Administrador de Plataforma
- **Vista:** Gestión global de tenants
- **Métricas:** Uso de la plataforma, performance, ingresos
- **Acciones:** Crear/modificar tenants, configuración global

#### PILAR 3: Dashboard de Aseguradora
- **Vista:** Gestión de empresas aseguradas
- **Métricas:** Riesgo de cartera, análisis actuarial, claims
- **Acciones:** Gestionar pólizas, aprobar empresas, análisis de riesgo

#### PILAR 2: Dashboard de Empresa
- **Vista:** Gestión de empleados y programas de salud
- **Métricas:** Salud de empleados, participación, costos
- **Acciones:** Gestionar empleados, configurar programas

#### PILAR 1: Dashboard Personal
- **Vista:** Resultados de salud personal y familiar
- **Métricas:** Tendencias de salud, recomendaciones
- **Acciones:** Ver resultados, agendar análisis, gestionar familia

## 🚀 IMPLEMENTACIÓN REQUERIDA

### Fase 1: Migración de Base de Datos
1. Crear nuevas tablas especializadas por pilar
2. Migrar datos existentes de `user_profiles`
3. Actualizar relaciones y constraints
4. Implementar RLS específico por pilar

### Fase 2: Actualización de Autenticación
1. Redefinir sistema de roles y permisos
2. Actualizar AuthService para 4 pilares
3. Implementar flujos de login diferenciados
4. Crear middleware de autorización por pilar

### Fase 3: Interfaces Diferenciadas
1. Crear dashboards específicos por pilar
2. Implementar navegación contextual
3. Desarrollar componentes especializados
4. Configurar permisos granulares en UI

### Fase 4: Datos de Demostración
1. Crear 4 usuarios representativos (uno por pilar)
2. Configurar tenant, empresa y familia demo
3. Poblar con datos de ejemplo realistas
4. Documentar credenciales y flujos

## 📊 USUARIOS DE DEMOSTRACIÓN PROPUESTOS

### 1. **Administrador de Plataforma** (Pilar 4)
- **Email:** `admin@holocheck.com`
- **Password:** `HoloAdmin2024!`
- **Rol:** `super_admin`
- **Acceso:** Global a toda la plataforma

### 2. **Director de Aseguradora** (Pilar 3)
- **Email:** `director@seguros-demo.com`
- **Password:** `InsuranceAdmin2024!`
- **Rol:** `insurance_admin`
- **Acceso:** Tenant "Seguros Demo" y todas sus empresas

### 3. **Gerente de RH** (Pilar 2)
- **Email:** `rh@empresa-demo.com`
- **Password:** `CompanyAdmin2024!`
- **Rol:** `company_admin`
- **Acceso:** Empresa "Demo Corp" y sus empleados

### 4. **Usuario Final** (Pilar 1)
- **Email:** `juan.perez@empresa-demo.com`
- **Password:** `EndUser2024!`
- **Rol:** `employee_user`
- **Acceso:** Solo sus datos personales y familiares

## 🎯 BENEFICIOS DE LA NUEVA ARQUITECTURA

### 1. **Claridad Conceptual**
- Cada pilar tiene su propósito y responsabilidades claras
- Separación limpia de concerns y permisos
- Fácil comprensión del modelo de negocio

### 2. **Escalabilidad**
- Fácil agregar nuevos roles dentro de cada pilar
- Estructura flexible para crecimiento
- Soporte para múltiples tenants y empresas

### 3. **Seguridad**
- Aislamiento claro entre niveles de acceso
- RLS específico por tipo de usuario
- Principio de menor privilegio aplicado

### 4. **Usabilidad**
- Interfaces específicas por tipo de usuario
- Flujos optimizados para cada pilar
- Experiencia de usuario contextual

### 5. **Mantenimiento**
- Código más organizado y comprensible
- Fácil debugging y troubleshooting
- Documentación clara de responsabilidades

## 📋 PRÓXIMOS PASOS RECOMENDADOS

1. **¿Aprobar el rediseño de 4 pilares?** - Validar la propuesta arquitectónica
2. **¿Proceder con migración de BD?** - Implementar nuevas tablas especializadas
3. **¿Crear usuarios de demostración?** - Generar 4 usuarios representativos
4. **¿Desarrollar dashboards específicos?** - Crear interfaces por pilar

## 🔗 ARCHIVOS RELACIONADOS

- `/workspace/dashboard/database-scripts/05-four-pillars-redesign.sql` - Script de migración
- `/workspace/dashboard/create-four-pillar-users.js` - Creación de usuarios demo
- `/workspace/dashboard/system_design_4_pillars.md` - Diseño técnico detallado

---

**Esta arquitectura refleja correctamente los 4 pilares de usuarios que requiere la plataforma HoloCheck, proporcionando una base sólida para el crecimiento y mantenimiento del sistema.**