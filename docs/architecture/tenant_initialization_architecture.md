# HoloCheck - Arquitectura de Inicialización de Tenants

## 🏗️ Sistema de Inicialización Multi-Tenant

### **Resumen Ejecutivo**
Diseño completo para la inicialización automática de tenants (aseguradoras) con creación de base de datos, tablas de parámetros y configuración inicial del sistema.

## 🎯 Objetivos de Inicialización

### **1. INICIALIZACIÓN DE TENANT**
- ✅ Creación automática de tenant (aseguradora)
- ✅ Configuración de base de datos específica
- ✅ Tablas de parámetros inicializadas
- ✅ Configuración de branding y políticas

### **2. ESTRUCTURA JERÁRQUICA**
```
TENANT (ASEGURADORA)
├── Configuración Base
│   ├── Parámetros del Sistema
│   ├── Políticas HIPAA
│   └── Configuración de Branding
├── EMPRESAS CONTRATADAS
│   ├── Empresa A
│   │   ├── Configuración Específica
│   │   ├── Parámetros de Análisis
│   │   └── COLABORADORES
│   └── Empresa B
└── USUARIOS ADMINISTRATIVOS
```

## 📊 Esquema de Inicialización

### **Tabla: tenant_initialization_status**
```sql
CREATE TABLE tenant_initialization_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Estado de inicialización
  initialization_step VARCHAR(100) NOT NULL,
  step_status initialization_step_status DEFAULT 'pending',
  step_order INTEGER NOT NULL,
  
  -- Detalles del paso
  step_description TEXT,
  step_config JSONB,
  
  -- Resultados
  execution_result JSONB,
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, initialization_step)
);

CREATE TYPE initialization_step_status AS ENUM (
  'pending', 'in_progress', 'completed', 'failed', 'skipped'
);
```

### **Tabla: tenant_parameters**
```sql
CREATE TABLE tenant_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Categorización de parámetros
  parameter_category parameter_category_type NOT NULL,
  parameter_group VARCHAR(100) NOT NULL,
  parameter_key VARCHAR(100) NOT NULL,
  parameter_value JSONB NOT NULL,
  parameter_type parameter_value_type NOT NULL,
  
  -- Metadatos
  description TEXT,
  is_system_parameter BOOLEAN DEFAULT false,
  is_user_configurable BOOLEAN DEFAULT true,
  requires_restart BOOLEAN DEFAULT false,
  
  -- Validación
  validation_rules JSONB,
  default_value JSONB,
  
  -- Versionado
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, parameter_category, parameter_group, parameter_key)
);

CREATE TYPE parameter_category_type AS ENUM (
  'system', 'analysis', 'ui_branding', 'security', 'compliance', 
  'integration', 'notification', 'reporting', 'data_retention'
);

CREATE TYPE parameter_value_type AS ENUM (
  'string', 'number', 'boolean', 'object', 'array', 'color', 'url', 'email'
);
```

### **Tabla: company_parameters**
```sql
CREATE TABLE company_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Parámetros específicos de empresa
  parameter_category parameter_category_type NOT NULL,
  parameter_group VARCHAR(100) NOT NULL,
  parameter_key VARCHAR(100) NOT NULL,
  parameter_value JSONB NOT NULL,
  parameter_type parameter_value_type NOT NULL,
  
  -- Herencia de tenant
  inherits_from_tenant BOOLEAN DEFAULT true,
  tenant_override_allowed BOOLEAN DEFAULT true,
  
  -- Metadatos
  description TEXT,
  is_user_configurable BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, parameter_category, parameter_group, parameter_key),
  
  -- Constraint para asegurar que company pertenece al tenant
  CONSTRAINT fk_company_tenant CHECK (
    (SELECT tenant_id FROM companies WHERE id = company_id) = tenant_id
  )
);
```

### **Tabla: initialization_templates**
```sql
CREATE TABLE initialization_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del template
  template_name VARCHAR(100) UNIQUE NOT NULL,
  template_version VARCHAR(20) DEFAULT '1.0',
  template_type template_type_enum NOT NULL,
  
  -- Configuración del template
  initialization_steps JSONB NOT NULL, -- Array de pasos ordenados
  default_parameters JSONB NOT NULL,   -- Parámetros por defecto
  
  -- Metadatos
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE template_type_enum AS ENUM (
  'basic_insurance', 'premium_insurance', 'enterprise_insurance', 
  'health_focused', 'life_insurance', 'custom'
);
```

## 🚀 Proceso de Inicialización

### **Clase: TenantInitializer**
```javascript
// /src/services/tenant/TenantInitializer.js
class TenantInitializer {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.initializationSteps = [
      'validate_tenant_data',
      'create_tenant_record',
      'setup_database_schema',
      'initialize_parameter_tables',
      'configure_default_parameters',
      'setup_branding_parameters',
      'configure_security_parameters',
      'setup_compliance_parameters',
      'create_admin_user',
      'initialize_audit_system',
      'validate_initialization'
    ];
  }

  async initializeTenant(tenantData, templateType = 'basic_insurance') {
    const tenantId = await this.createTenantRecord(tenantData);
    
    try {
      // Cargar template de inicialización
      const template = await this.loadInitializationTemplate(templateType);
      
      // Ejecutar pasos de inicialización
      for (const step of this.initializationSteps) {
        await this.executeInitializationStep(tenantId, step, template);
      }
      
      // Marcar inicialización como completada
      await this.markInitializationComplete(tenantId);
      
      return {
        success: true,
        tenantId,
        message: 'Tenant inicializado exitosamente'
      };
      
    } catch (error) {
      await this.handleInitializationError(tenantId, error);
      throw error;
    }
  }

  async executeInitializationStep(tenantId, stepName, template) {
    // Registrar inicio del paso
    await this.updateStepStatus(tenantId, stepName, 'in_progress');
    
    try {
      let result;
      
      switch (stepName) {
        case 'setup_database_schema':
          result = await this.setupDatabaseSchema(tenantId);
          break;
          
        case 'initialize_parameter_tables':
          result = await this.initializeParameterTables(tenantId, template);
          break;
          
        case 'configure_default_parameters':
          result = await this.configureDefaultParameters(tenantId, template);
          break;
          
        case 'setup_branding_parameters':
          result = await this.setupBrandingParameters(tenantId, template);
          break;
          
        case 'configure_security_parameters':
          result = await this.configureSecurityParameters(tenantId);
          break;
          
        case 'setup_compliance_parameters':
          result = await this.setupComplianceParameters(tenantId);
          break;
          
        default:
          result = await this.executeCustomStep(tenantId, stepName, template);
      }
      
      // Marcar paso como completado
      await this.updateStepStatus(tenantId, stepName, 'completed', result);
      
    } catch (error) {
      await this.updateStepStatus(tenantId, stepName, 'failed', null, error.message);
      throw error;
    }
  }

  async initializeParameterTables(tenantId, template) {
    const defaultParameters = template.default_parameters;
    const parameterInserts = [];
    
    // Parámetros del Sistema
    parameterInserts.push(...this.buildSystemParameters(tenantId));
    
    // Parámetros de Análisis
    parameterInserts.push(...this.buildAnalysisParameters(tenantId));
    
    // Parámetros de UI/Branding
    parameterInserts.push(...this.buildBrandingParameters(tenantId));
    
    // Parámetros de Seguridad
    parameterInserts.push(...this.buildSecurityParameters(tenantId));
    
    // Parámetros de Cumplimiento
    parameterInserts.push(...this.buildComplianceParameters(tenantId));
    
    // Insertar todos los parámetros
    const { data, error } = await this.supabase
      .from('tenant_parameters')
      .insert(parameterInserts);
      
    if (error) throw error;
    
    return {
      parametersCreated: parameterInserts.length,
      categories: [...new Set(parameterInserts.map(p => p.parameter_category))]
    };
  }

  buildSystemParameters(tenantId) {
    return [
      {
        tenant_id: tenantId,
        parameter_category: 'system',
        parameter_group: 'application',
        parameter_key: 'app_name',
        parameter_value: '"HoloCheck"',
        parameter_type: 'string',
        description: 'Nombre de la aplicación',
        is_system_parameter: true,
        is_user_configurable: false
      },
      {
        tenant_id: tenantId,
        parameter_category: 'system',
        parameter_group: 'application',
        parameter_key: 'version',
        parameter_value: '"1.3.0"',
        parameter_type: 'string',
        description: 'Versión de la aplicación',
        is_system_parameter: true,
        is_user_configurable: false
      },
      {
        tenant_id: tenantId,
        parameter_category: 'system',
        parameter_group: 'session',
        parameter_key: 'timeout_minutes',
        parameter_value: '60',
        parameter_type: 'number',
        description: 'Tiempo de expiración de sesión en minutos',
        is_user_configurable: true,
        validation_rules: { min: 15, max: 480 }
      },
      {
        tenant_id: tenantId,
        parameter_category: 'system',
        parameter_group: 'database',
        parameter_key: 'connection_pool_size',
        parameter_value: '10',
        parameter_type: 'number',
        description: 'Tamaño del pool de conexiones',
        is_system_parameter: true,
        requires_restart: true
      }
    ];
  }

  buildAnalysisParameters(tenantId) {
    return [
      {
        tenant_id: tenantId,
        parameter_category: 'analysis',
        parameter_group: 'biometric',
        parameter_key: 'supported_types',
        parameter_value: '["facial", "voice", "vital_signs"]',
        parameter_type: 'array',
        description: 'Tipos de análisis biométrico soportados'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'analysis',
        parameter_group: 'thresholds',
        parameter_key: 'confidence_threshold',
        parameter_value: '0.8',
        parameter_type: 'number',
        description: 'Umbral de confianza para análisis',
        validation_rules: { min: 0.1, max: 1.0 }
      },
      {
        tenant_id: tenantId,
        parameter_category: 'analysis',
        parameter_group: 'cardiovascular',
        parameter_key: 'heart_rate_normal_range',
        parameter_value: '{"min": 60, "max": 100}',
        parameter_type: 'object',
        description: 'Rango normal de frecuencia cardíaca'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'analysis',
        parameter_group: 'processing',
        parameter_key: 'max_processing_time_ms',
        parameter_value: '30000',
        parameter_type: 'number',
        description: 'Tiempo máximo de procesamiento en milisegundos'
      }
    ];
  }

  buildBrandingParameters(tenantId) {
    return [
      {
        tenant_id: tenantId,
        parameter_category: 'ui_branding',
        parameter_group: 'colors',
        parameter_key: 'primary_color',
        parameter_value: '"#3B82F6"',
        parameter_type: 'color',
        description: 'Color primario de la interfaz'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'ui_branding',
        parameter_group: 'colors',
        parameter_key: 'secondary_color',
        parameter_value: '"#10B981"',
        parameter_type: 'color',
        description: 'Color secundario de la interfaz'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'ui_branding',
        parameter_group: 'logo',
        parameter_key: 'company_logo_url',
        parameter_value: '""',
        parameter_type: 'url',
        description: 'URL del logo de la empresa'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'ui_branding',
        parameter_group: 'text',
        parameter_key: 'welcome_message',
        parameter_value: '"Bienvenido a su plataforma de análisis biométrico"',
        parameter_type: 'string',
        description: 'Mensaje de bienvenida personalizado'
      }
    ];
  }

  buildSecurityParameters(tenantId) {
    return [
      {
        tenant_id: tenantId,
        parameter_category: 'security',
        parameter_group: 'authentication',
        parameter_key: 'password_min_length',
        parameter_value: '8',
        parameter_type: 'number',
        description: 'Longitud mínima de contraseña'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'security',
        parameter_group: 'authentication',
        parameter_key: 'max_login_attempts',
        parameter_value: '5',
        parameter_type: 'number',
        description: 'Máximo número de intentos de login'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'security',
        parameter_group: 'encryption',
        parameter_key: 'data_encryption_enabled',
        parameter_value: 'true',
        parameter_type: 'boolean',
        description: 'Habilitar encriptación de datos',
        is_system_parameter: true
      },
      {
        tenant_id: tenantId,
        parameter_category: 'security',
        parameter_group: 'audit',
        parameter_key: 'audit_level',
        parameter_value: '"full"',
        parameter_type: 'string',
        description: 'Nivel de auditoría del sistema'
      }
    ];
  }

  buildComplianceParameters(tenantId) {
    return [
      {
        tenant_id: tenantId,
        parameter_category: 'compliance',
        parameter_group: 'hipaa',
        parameter_key: 'hipaa_compliance_enabled',
        parameter_value: 'true',
        parameter_type: 'boolean',
        description: 'Habilitar cumplimiento HIPAA',
        is_system_parameter: true
      },
      {
        tenant_id: tenantId,
        parameter_category: 'compliance',
        parameter_group: 'data_retention',
        parameter_key: 'biometric_data_retention_months',
        parameter_value: '24',
        parameter_type: 'number',
        description: 'Meses de retención de datos biométricos'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'compliance',
        parameter_group: 'data_retention',
        parameter_key: 'audit_log_retention_months',
        parameter_value: '84',
        parameter_type: 'number',
        description: 'Meses de retención de logs de auditoría (7 años HIPAA)'
      },
      {
        tenant_id: tenantId,
        parameter_category: 'compliance',
        parameter_group: 'consent',
        parameter_key: 'require_explicit_consent',
        parameter_value: 'true',
        parameter_type: 'boolean',
        description: 'Requerir consentimiento explícito'
      }
    ];
  }
}
```

### **Servicio de Gestión de Parámetros**
```javascript
// /src/services/parameters/ParameterManager.js
class ParameterManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async getParameter(tenantId, category, group, key, companyId = null) {
    const cacheKey = `${tenantId}-${companyId || 'tenant'}-${category}-${group}-${key}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.value;
      }
    }
    
    let parameter;
    
    // Buscar primero en parámetros de empresa (si aplica)
    if (companyId) {
      const { data: companyParam } = await this.supabase
        .from('company_parameters')
        .select('parameter_value, parameter_type')
        .eq('company_id', companyId)
        .eq('parameter_category', category)
        .eq('parameter_group', group)
        .eq('parameter_key', key)
        .single();
        
      if (companyParam) {
        parameter = companyParam;
      }
    }
    
    // Si no se encuentra en empresa, buscar en tenant
    if (!parameter) {
      const { data: tenantParam } = await this.supabase
        .from('tenant_parameters')
        .select('parameter_value, parameter_type')
        .eq('tenant_id', tenantId)
        .eq('parameter_category', category)
        .eq('parameter_group', group)
        .eq('parameter_key', key)
        .single();
        
      parameter = tenantParam;
    }
    
    if (!parameter) {
      throw new Error(`Parameter not found: ${category}.${group}.${key}`);
    }
    
    // Parsear valor según tipo
    const value = this.parseParameterValue(parameter.parameter_value, parameter.parameter_type);
    
    // Guardar en cache
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }

  parseParameterValue(value, type) {
    switch (type) {
      case 'string':
        return JSON.parse(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(JSON.parse(value));
      case 'object':
      case 'array':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  async updateParameter(tenantId, category, group, key, newValue, companyId = null) {
    const table = companyId ? 'company_parameters' : 'tenant_parameters';
    const idField = companyId ? 'company_id' : 'tenant_id';
    const idValue = companyId || tenantId;
    
    // Serializar valor
    const serializedValue = typeof newValue === 'string' ? 
      JSON.stringify(newValue) : 
      JSON.stringify(newValue);
    
    const { data, error } = await this.supabase
      .from(table)
      .update({
        parameter_value: serializedValue,
        updated_at: new Date().toISOString()
      })
      .eq(idField, idValue)
      .eq('parameter_category', category)
      .eq('parameter_group', group)
      .eq('parameter_key', key);
      
    if (error) throw error;
    
    // Limpiar cache
    const cacheKey = `${tenantId}-${companyId || 'tenant'}-${category}-${group}-${key}`;
    this.cache.delete(cacheKey);
    
    return data;
  }

  async getParametersByCategory(tenantId, category, companyId = null) {
    const table = companyId ? 'company_parameters' : 'tenant_parameters';
    const idField = companyId ? 'company_id' : 'tenant_id';
    const idValue = companyId || tenantId;
    
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq(idField, idValue)
      .eq('parameter_category', category)
      .order('parameter_group', { ascending: true })
      .order('parameter_key', { ascending: true });
      
    if (error) throw error;
    
    // Agrupar por grupo
    const grouped = {};
    data.forEach(param => {
      if (!grouped[param.parameter_group]) {
        grouped[param.parameter_group] = {};
      }
      grouped[param.parameter_group][param.parameter_key] = {
        value: this.parseParameterValue(param.parameter_value, param.parameter_type),
        type: param.parameter_type,
        description: param.description,
        isUserConfigurable: param.is_user_configurable
      };
    });
    
    return grouped;
  }
}
```

## 🎛️ Panel de Inicialización de Tenant

### **Componente: TenantInitializationPanel**
```jsx
// /src/components/admin/TenantInitializationPanel.jsx
import React, { useState, useEffect } from 'react';
import { TenantInitializer } from '../../services/tenant/TenantInitializer';
import { ParameterManager } from '../../services/parameters/ParameterManager';

const TenantInitializationPanel = () => {
  const [initializationStatus, setInitializationStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [tenantData, setTenantData] = useState({
    name: '',
    subdomain: '',
    contactEmail: '',
    templateType: 'basic_insurance'
  });

  const initializeTenant = async () => {
    setInitializationStatus('initializing');
    
    try {
      const initializer = new TenantInitializer(supabase);
      
      // Configurar listeners para progreso
      initializer.onStepStart = (step) => {
        setCurrentStep(step);
        setProgress(prev => prev + (100 / 11)); // 11 pasos total
      };
      
      const result = await initializer.initializeTenant(tenantData, tenantData.templateType);
      
      setInitializationStatus('completed');
      setProgress(100);
      
    } catch (error) {
      setInitializationStatus('failed');
      console.error('Error initializing tenant:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Inicialización de Tenant</h1>
      
      {/* Formulario de configuración */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuración del Tenant</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la Aseguradora
            </label>
            <input
              type="text"
              value={tenantData.name}
              onChange={(e) => setTenantData({...tenantData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: AXA Seguros"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Subdominio
            </label>
            <input
              type="text"
              value={tenantData.subdomain}
              onChange={(e) => setTenantData({...tenantData, subdomain: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: axa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value={tenantData.contactEmail}
              onChange={(e) => setTenantData({...tenantData, contactEmail: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="admin@axa.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Template
            </label>
            <select
              value={tenantData.templateType}
              onChange={(e) => setTenantData({...tenantData, templateType: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="basic_insurance">Seguro Básico</option>
              <option value="premium_insurance">Seguro Premium</option>
              <option value="enterprise_insurance">Seguro Empresarial</option>
              <option value="health_focused">Enfoque en Salud</option>
              <option value="life_insurance">Seguro de Vida</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Panel de progreso */}
      {initializationStatus !== 'idle' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Progreso de Inicialización</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso General</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Paso actual: <span className="font-medium">{currentStep}</span>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Estado:</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm ${
              initializationStatus === 'initializing' ? 'bg-yellow-100 text-yellow-800' :
              initializationStatus === 'completed' ? 'bg-green-100 text-green-800' :
              initializationStatus === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {initializationStatus === 'initializing' && 'Inicializando...'}
              {initializationStatus === 'completed' && 'Completado'}
              {initializationStatus === 'failed' && 'Error'}
              {initializationStatus === 'idle' && 'Listo para iniciar'}
            </div>
          </div>
        </div>
      )}
      
      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={initializeTenant}
          disabled={initializationStatus === 'initializing' || !tenantData.name || !tenantData.subdomain}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {initializationStatus === 'initializing' ? 'Inicializando...' : 'Inicializar Tenant'}
        </button>
        
        {initializationStatus === 'completed' && (
          <button
            onClick={() => window.location.href = `https://${tenantData.subdomain}.holocheck.com`}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Ir al Tenant
          </button>
        )}
      </div>
    </div>
  );
};

export default TenantInitializationPanel;
```

## ✅ Checklist de Inicialización

### **Pasos de Inicialización Automática**
- [x] **Validación de datos del tenant**
- [x] **Creación del registro de tenant**
- [x] **Configuración del esquema de base de datos**
- [x] **Inicialización de tablas de parámetros**
- [x] **Configuración de parámetros por defecto**
- [x] **Configuración de parámetros de branding**
- [x] **Configuración de parámetros de seguridad**
- [x] **Configuración de parámetros de cumplimiento**
- [x] **Creación de usuario administrador**
- [x] **Inicialización del sistema de auditoría**
- [x] **Validación final de la inicialización**

### **Categorías de Parámetros Incluidas**
- [x] **Sistema** - Configuración básica de la aplicación
- [x] **Análisis** - Parámetros de análisis biométrico
- [x] **UI/Branding** - Personalización de interfaz
- [x] **Seguridad** - Configuración de seguridad
- [x] **Cumplimiento** - Parámetros HIPAA y regulatorios
- [x] **Integración** - Configuración de APIs externas
- [x] **Notificación** - Configuración de notificaciones
- [x] **Reportes** - Configuración de reportes
- [x] **Retención de Datos** - Políticas de retención

Esta arquitectura proporciona un sistema completo de inicialización de tenants con todas las tablas de parámetros necesarias para el funcionamiento del sistema multi-tenant de HoloCheck.