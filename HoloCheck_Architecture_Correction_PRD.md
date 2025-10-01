# PRD: Corrección de Arquitectura HoloCheck - Sistema Multi-Tenant

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **MALA PRÁCTICA: Inicialización de BD en cada carga**
- ❌ **Problema:** La aplicación intenta crear la base de datos cada vez que se carga
- ❌ **Impacto:** Rendimiento degradado, riesgo de corrupción de datos, violación de principios de seguridad
- ✅ **Solución:** Panel de administración dedicado para inicialización única

### 2. **FALTA DE ARQUITECTURA MULTI-TENANT**
- ❌ **Problema:** No hay separación por tenant (aseguradoras)
- ❌ **Impacto:** Violación de privacidad de datos, incumplimiento HIPAA
- ✅ **Solución:** Arquitectura multi-tenant con aislamiento completo

### 3. **DATOS HARDCODEADOS EN APLICACIÓN**
- ❌ **Problema:** Configuraciones y fallbacks en código fuente
- ❌ **Impacto:** Imposible parametrizar sin redeploy
- ✅ **Solución:** Todas las configuraciones en base de datos

## 🏗️ ARQUITECTURA CORREGIDA

### **JERARQUÍA MULTI-TENANT:**
```
🏢 ASEGURADORA (Tenant)
├── 🏭 Empresa Asegurada 1
│   ├── 👤 Colaborador A
│   ├── 👤 Colaborador B
│   └── 👤 Colaborador C
├── 🏭 Empresa Asegurada 2
│   ├── 👤 Colaborador D
│   └── 👤 Colaborador E
└── ⚙️ Configuraciones Tenant
```

### **ROLES Y PERMISOS:**
1. **Super Admin:** Gestión de plataforma y tenants
2. **Tenant Admin (Aseguradora):** Gestión de empresas aseguradas
3. **Company Admin:** Gestión de colaboradores de su empresa
4. **User (Colaborador):** Acceso a sus datos biométricos únicamente

## 📋 REQUERIMIENTOS TÉCNICOS

### **P0 - CRÍTICOS (Debe implementarse)**

#### **1. Panel de Administración Separado**
```javascript
// /admin - Panel administrativo independiente
- Inicialización de base de datos (una sola vez)
- Gestión de tenants (aseguradoras)
- Configuración de sistema
- Monitoreo de salud de la plataforma
```

#### **2. Arquitectura Multi-Tenant**
```sql
-- Todas las tablas deben incluir tenant_id
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Nombre de la aseguradora
  subdomain VARCHAR(100) UNIQUE, -- subdomain.holocheck.com
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  contract_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  company_id UUID REFERENCES companies(id),
  role VARCHAR(50) CHECK (role IN ('tenant_admin', 'company_admin', 'user')),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. Row Level Security (RLS) por Tenant**
```sql
-- Política de seguridad: usuarios solo ven datos de su tenant
CREATE POLICY tenant_isolation ON users
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Aplicar a todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
```

#### **4. Tabla de Configuraciones**
```sql
CREATE TABLE system_configurations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id), -- NULL para configuraciones globales
  config_key VARCHAR(255) NOT NULL,
  config_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);
```

### **P1 - IMPORTANTES (Debe implementarse pronto)**

#### **5. Subdominios por Tenant**
```
- aseguradora1.holocheck.com
- aseguradora2.holocheck.com
- admin.holocheck.com (panel administrativo)
```

#### **6. Audit Trail Completo**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **P2 - DESEABLES (Implementación futura)**

#### **7. Métricas por Tenant**
- Dashboard de uso por aseguradora
- Reportes de cumplimiento HIPAA
- Análisis de costos por tenant

## 🔧 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Corrección Inmediata (Semana 1)**
1. ✅ Crear panel de administración separado (`/admin`)
2. ✅ Remover inicialización automática de BD
3. ✅ Implementar arquitectura multi-tenant básica
4. ✅ Migrar configuraciones hardcodeadas a BD

### **FASE 2: Seguridad y Aislamiento (Semana 2)**
1. ✅ Implementar RLS completo
2. ✅ Configurar subdominios por tenant
3. ✅ Audit trail completo
4. ✅ Testing de aislamiento de datos

### **FASE 3: Optimización (Semana 3)**
1. ✅ Dashboard de métricas por tenant
2. ✅ Herramientas de monitoreo
3. ✅ Documentación completa
4. ✅ Training para administradores

## 📊 CRITERIOS DE ACEPTACIÓN

### **Funcionales:**
- ✅ Un tenant (aseguradora) NO puede ver datos de otro tenant
- ✅ Administradores de empresa solo ven colaboradores de su empresa
- ✅ Colaboradores solo ven sus propios datos biométricos
- ✅ Panel de admin permite gestión completa de tenants
- ✅ Todas las configuraciones son parametrizables desde BD

### **No Funcionales:**
- ✅ Rendimiento: < 2s tiempo de carga por página
- ✅ Seguridad: Cumplimiento HIPAA 100%
- ✅ Escalabilidad: Soporte para 100+ tenants
- ✅ Disponibilidad: 99.9% uptime

## 🚨 RIESGOS Y MITIGACIONES

### **Alto Riesgo:**
- **Migración de datos existentes:** Plan de rollback completo
- **Downtime durante implementación:** Ventana de mantenimiento programada

### **Medio Riesgo:**
- **Curva de aprendizaje:** Training extensivo para usuarios
- **Performance con múltiples tenants:** Optimización de queries

## 📈 MÉTRICAS DE ÉXITO

### **Técnicas:**
- 0 violaciones de aislamiento de datos
- < 100ms tiempo de respuesta promedio
- 100% cobertura de audit trail

### **Negocio:**
- Reducción 90% en tiempo de onboarding de nuevas aseguradoras
- 100% cumplimiento regulatorio HIPAA
- 0 incidentes de seguridad relacionados con multi-tenancy

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **@Mike:** Coordinar implementación de panel de administración
2. **@Alex:** Implementar arquitectura multi-tenant en base de datos
3. **@Bob:** Revisar y aprobar diseño de arquitectura
4. **@Emma:** Validar requerimientos de negocio y compliance

**FECHA LÍMITE:** 7 días para Fase 1 completa

**PRIORIDAD:** 🚨 CRÍTICA - Bloquea el lanzamiento en producción