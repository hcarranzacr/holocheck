-- HoloCheck - Implementación SQL para Inicialización de Tenants
-- Este script contiene todas las tablas y funciones necesarias para la inicialización automática de tenants

-- ============================================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TIPOS ENUM PARA INICIALIZACIÓN
-- ============================================================================

CREATE TYPE initialization_step_status AS ENUM (
  'pending', 'in_progress', 'completed', 'failed', 'skipped'
);

CREATE TYPE parameter_category_type AS ENUM (
  'system', 'analysis', 'ui_branding', 'security', 'compliance', 
  'integration', 'notification', 'reporting', 'data_retention'
);

CREATE TYPE parameter_value_type AS ENUM (
  'string', 'number', 'boolean', 'object', 'array', 'color', 'url', 'email'
);

CREATE TYPE template_type_enum AS ENUM (
  'basic_insurance', 'premium_insurance', 'enterprise_insurance', 
  'health_focused', 'life_insurance', 'custom'
);

-- ============================================================================
-- TABLAS DE INICIALIZACIÓN
-- ============================================================================

-- Tabla para tracking del estado de inicialización
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

-- Tabla de parámetros por tenant
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

-- Tabla de parámetros por empresa
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

-- Tabla de templates de inicialización
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

-- ============================================================================
-- FUNCIONES DE INICIALIZACIÓN
-- ============================================================================

-- Función para inicializar parámetros del sistema
CREATE OR REPLACE FUNCTION initialize_system_parameters(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  param_count INTEGER := 0;
BEGIN
  -- Parámetros de aplicación
  INSERT INTO tenant_parameters (
    tenant_id, parameter_category, parameter_group, parameter_key, 
    parameter_value, parameter_type, description, is_system_parameter, is_user_configurable
  ) VALUES
  (p_tenant_id, 'system', 'application', 'app_name', '"HoloCheck"', 'string', 'Nombre de la aplicación', true, false),
  (p_tenant_id, 'system', 'application', 'version', '"1.3.0"', 'string', 'Versión de la aplicación', true, false),
  (p_tenant_id, 'system', 'application', 'environment', '"production"', 'string', 'Entorno de ejecución', true, false),
  
  -- Parámetros de sesión
  (p_tenant_id, 'system', 'session', 'timeout_minutes', '60', 'number', 'Tiempo de expiración de sesión en minutos', false, true),
  (p_tenant_id, 'system', 'session', 'max_concurrent_sessions', '3', 'number', 'Máximo de sesiones concurrentes por usuario', false, true),
  (p_tenant_id, 'system', 'session', 'session_refresh_threshold', '15', 'number', 'Minutos antes de expiración para refrescar sesión', false, true),
  
  -- Parámetros de base de datos
  (p_tenant_id, 'system', 'database', 'connection_pool_size', '10', 'number', 'Tamaño del pool de conexiones', true, false),
  (p_tenant_id, 'system', 'database', 'query_timeout_seconds', '30', 'number', 'Timeout para queries en segundos', true, false),
  
  -- Parámetros de logging
  (p_tenant_id, 'system', 'logging', 'log_level', '"info"', 'string', 'Nivel de logging', false, true),
  (p_tenant_id, 'system', 'logging', 'log_retention_days', '30', 'number', 'Días de retención de logs', false, true);
  
  GET DIAGNOSTICS param_count = ROW_COUNT;
  RETURN param_count;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar parámetros de análisis
CREATE OR REPLACE FUNCTION initialize_analysis_parameters(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  param_count INTEGER := 0;
BEGIN
  INSERT INTO tenant_parameters (
    tenant_id, parameter_category, parameter_group, parameter_key, 
    parameter_value, parameter_type, description, validation_rules
  ) VALUES
  -- Parámetros biométricos
  (p_tenant_id, 'analysis', 'biometric', 'supported_types', '["facial", "voice", "vital_signs"]', 'array', 'Tipos de análisis biométrico soportados', NULL),
  (p_tenant_id, 'analysis', 'biometric', 'min_capture_duration_seconds', '30', 'number', 'Duración mínima de captura en segundos', '{"min": 10, "max": 300}'),
  (p_tenant_id, 'analysis', 'biometric', 'max_capture_duration_seconds', '120', 'number', 'Duración máxima de captura en segundos', '{"min": 30, "max": 600}'),
  
  -- Umbrales de confianza
  (p_tenant_id, 'analysis', 'thresholds', 'confidence_threshold', '0.8', 'number', 'Umbral de confianza para análisis', '{"min": 0.1, "max": 1.0}'),
  (p_tenant_id, 'analysis', 'thresholds', 'face_detection_threshold', '0.9', 'number', 'Umbral para detección facial', '{"min": 0.5, "max": 1.0}'),
  (p_tenant_id, 'analysis', 'thresholds', 'voice_quality_threshold', '0.7', 'number', 'Umbral de calidad de voz', '{"min": 0.1, "max": 1.0}'),
  
  -- Parámetros cardiovasculares
  (p_tenant_id, 'analysis', 'cardiovascular', 'heart_rate_normal_range', '{"min": 60, "max": 100}', 'object', 'Rango normal de frecuencia cardíaca', NULL),
  (p_tenant_id, 'analysis', 'cardiovascular', 'hrv_analysis_enabled', 'true', 'boolean', 'Habilitar análisis de variabilidad cardíaca', NULL),
  (p_tenant_id, 'analysis', 'cardiovascular', 'blood_pressure_estimation', 'true', 'boolean', 'Habilitar estimación de presión arterial', NULL),
  
  -- Parámetros de procesamiento
  (p_tenant_id, 'analysis', 'processing', 'max_processing_time_ms', '30000', 'number', 'Tiempo máximo de procesamiento en milisegundos', '{"min": 5000, "max": 120000}'),
  (p_tenant_id, 'analysis', 'processing', 'parallel_processing_enabled', 'true', 'boolean', 'Habilitar procesamiento paralelo', NULL),
  (p_tenant_id, 'analysis', 'processing', 'gpu_acceleration_enabled', 'false', 'boolean', 'Habilitar aceleración GPU', NULL);
  
  GET DIAGNOSTICS param_count = ROW_COUNT;
  RETURN param_count;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar parámetros de branding
CREATE OR REPLACE FUNCTION initialize_branding_parameters(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  param_count INTEGER := 0;
BEGIN
  INSERT INTO tenant_parameters (
    tenant_id, parameter_category, parameter_group, parameter_key, 
    parameter_value, parameter_type, description
  ) VALUES
  -- Colores
  (p_tenant_id, 'ui_branding', 'colors', 'primary_color', '"#3B82F6"', 'color', 'Color primario de la interfaz'),
  (p_tenant_id, 'ui_branding', 'colors', 'secondary_color', '"#10B981"', 'color', 'Color secundario de la interfaz'),
  (p_tenant_id, 'ui_branding', 'colors', 'accent_color', '"#F59E0B"', 'color', 'Color de acento'),
  (p_tenant_id, 'ui_branding', 'colors', 'background_color', '"#F9FAFB"', 'color', 'Color de fondo'),
  (p_tenant_id, 'ui_branding', 'colors', 'text_primary_color', '"#111827"', 'color', 'Color de texto primario'),
  (p_tenant_id, 'ui_branding', 'colors', 'text_secondary_color', '"#6B7280"', 'color', 'Color de texto secundario'),
  
  -- Logo y branding
  (p_tenant_id, 'ui_branding', 'logo', 'company_logo_url', '""', 'url', 'URL del logo de la empresa'),
  (p_tenant_id, 'ui_branding', 'logo', 'favicon_url', '""', 'url', 'URL del favicon'),
  (p_tenant_id, 'ui_branding', 'logo', 'logo_width_px', '200', 'number', 'Ancho del logo en píxeles'),
  (p_tenant_id, 'ui_branding', 'logo', 'logo_height_px', '60', 'number', 'Alto del logo en píxeles'),
  
  -- Textos personalizados
  (p_tenant_id, 'ui_branding', 'text', 'welcome_message', '"Bienvenido a su plataforma de análisis biométrico"', 'string', 'Mensaje de bienvenida personalizado'),
  (p_tenant_id, 'ui_branding', 'text', 'company_tagline', '"Tecnología avanzada para su bienestar"', 'string', 'Eslogan de la empresa'),
  (p_tenant_id, 'ui_branding', 'text', 'footer_text', '"© 2024 HoloCheck. Todos los derechos reservados."', 'string', 'Texto del pie de página'),
  
  -- Configuración de UI
  (p_tenant_id, 'ui_branding', 'layout', 'sidebar_collapsed_default', 'false', 'boolean', 'Sidebar colapsado por defecto'),
  (p_tenant_id, 'ui_branding', 'layout', 'dark_mode_available', 'true', 'boolean', 'Permitir modo oscuro'),
  (p_tenant_id, 'ui_branding', 'layout', 'language_selector_visible', 'true', 'boolean', 'Mostrar selector de idioma');
  
  GET DIAGNOSTICS param_count = ROW_COUNT;
  RETURN param_count;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar parámetros de seguridad
CREATE OR REPLACE FUNCTION initialize_security_parameters(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  param_count INTEGER := 0;
BEGIN
  INSERT INTO tenant_parameters (
    tenant_id, parameter_category, parameter_group, parameter_key, 
    parameter_value, parameter_type, description, is_system_parameter, validation_rules
  ) VALUES
  -- Autenticación
  (p_tenant_id, 'security', 'authentication', 'password_min_length', '8', 'number', 'Longitud mínima de contraseña', false, '{"min": 6, "max": 128}'),
  (p_tenant_id, 'security', 'authentication', 'password_require_uppercase', 'true', 'boolean', 'Requerir mayúsculas en contraseña', false, NULL),
  (p_tenant_id, 'security', 'authentication', 'password_require_lowercase', 'true', 'boolean', 'Requerir minúsculas en contraseña', false, NULL),
  (p_tenant_id, 'security', 'authentication', 'password_require_numbers', 'true', 'boolean', 'Requerir números en contraseña', false, NULL),
  (p_tenant_id, 'security', 'authentication', 'password_require_symbols', 'false', 'boolean', 'Requerir símbolos en contraseña', false, NULL),
  (p_tenant_id, 'security', 'authentication', 'max_login_attempts', '5', 'number', 'Máximo número de intentos de login', false, '{"min": 3, "max": 10}'),
  (p_tenant_id, 'security', 'authentication', 'lockout_duration_minutes', '15', 'number', 'Duración del bloqueo en minutos', false, '{"min": 5, "max": 1440}'),
  (p_tenant_id, 'security', 'authentication', 'two_factor_required', 'false', 'boolean', 'Requerir autenticación de dos factores', false, NULL),
  
  -- Encriptación
  (p_tenant_id, 'security', 'encryption', 'data_encryption_enabled', 'true', 'boolean', 'Habilitar encriptación de datos', true, NULL),
  (p_tenant_id, 'security', 'encryption', 'encryption_algorithm', '"AES-256"', 'string', 'Algoritmo de encriptación', true, NULL),
  (p_tenant_id, 'security', 'encryption', 'key_rotation_days', '90', 'number', 'Días para rotación de claves', true, '{"min": 30, "max": 365}'),
  
  -- Auditoría
  (p_tenant_id, 'security', 'audit', 'audit_level', '"full"', 'string', 'Nivel de auditoría del sistema', false, NULL),
  (p_tenant_id, 'security', 'audit', 'log_failed_attempts', 'true', 'boolean', 'Registrar intentos fallidos', false, NULL),
  (p_tenant_id, 'security', 'audit', 'log_data_access', 'true', 'boolean', 'Registrar acceso a datos', false, NULL),
  
  -- Sesiones
  (p_tenant_id, 'security', 'session', 'secure_cookies_only', 'true', 'boolean', 'Solo cookies seguras', true, NULL),
  (p_tenant_id, 'security', 'session', 'session_token_length', '32', 'number', 'Longitud del token de sesión', true, '{"min": 16, "max": 64}');
  
  GET DIAGNOSTICS param_count = ROW_COUNT;
  RETURN param_count;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar parámetros de cumplimiento
CREATE OR REPLACE FUNCTION initialize_compliance_parameters(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  param_count INTEGER := 0;
BEGIN
  INSERT INTO tenant_parameters (
    tenant_id, parameter_category, parameter_group, parameter_key, 
    parameter_value, parameter_type, description, is_system_parameter
  ) VALUES
  -- HIPAA
  (p_tenant_id, 'compliance', 'hipaa', 'hipaa_compliance_enabled', 'true', 'boolean', 'Habilitar cumplimiento HIPAA', true),
  (p_tenant_id, 'compliance', 'hipaa', 'minimum_necessary_standard', 'true', 'boolean', 'Aplicar estándar de necesidad mínima', true),
  (p_tenant_id, 'compliance', 'hipaa', 'breach_notification_enabled', 'true', 'boolean', 'Habilitar notificación de brechas', true),
  (p_tenant_id, 'compliance', 'hipaa', 'business_associate_agreements', 'true', 'boolean', 'Requerir acuerdos de asociados comerciales', false),
  
  -- Retención de datos
  (p_tenant_id, 'compliance', 'data_retention', 'biometric_data_retention_months', '24', 'number', 'Meses de retención de datos biométricos', false),
  (p_tenant_id, 'compliance', 'data_retention', 'analysis_results_retention_months', '12', 'number', 'Meses de retención de resultados de análisis', false),
  (p_tenant_id, 'compliance', 'data_retention', 'audit_log_retention_months', '84', 'number', 'Meses de retención de logs de auditoría (7 años HIPAA)', false),
  (p_tenant_id, 'compliance', 'data_retention', 'auto_delete_expired_data', 'true', 'boolean', 'Eliminar automáticamente datos expirados', false),
  (p_tenant_id, 'compliance', 'data_retention', 'deletion_notification_days', '30', 'number', 'Días de notificación antes de eliminación', false),
  
  -- Consentimiento
  (p_tenant_id, 'compliance', 'consent', 'require_explicit_consent', 'true', 'boolean', 'Requerir consentimiento explícito', true),
  (p_tenant_id, 'compliance', 'consent', 'consent_withdrawal_enabled', 'true', 'boolean', 'Permitir retiro de consentimiento', true),
  (p_tenant_id, 'compliance', 'consent', 'consent_version_tracking', 'true', 'boolean', 'Rastrear versiones de consentimiento', true),
  (p_tenant_id, 'compliance', 'consent', 'minor_consent_required', 'true', 'boolean', 'Requerir consentimiento para menores', false),
  
  -- Privacidad
  (p_tenant_id, 'compliance', 'privacy', 'data_anonymization_enabled', 'true', 'boolean', 'Habilitar anonimización de datos', false),
  (p_tenant_id, 'compliance', 'privacy', 'right_to_be_forgotten', 'true', 'boolean', 'Derecho al olvido', false),
  (p_tenant_id, 'compliance', 'privacy', 'data_portability_enabled', 'true', 'boolean', 'Habilitar portabilidad de datos', false);
  
  GET DIAGNOSTICS param_count = ROW_COUNT;
  RETURN param_count;
END;
$$ LANGUAGE plpgsql;

-- Función principal de inicialización de tenant
CREATE OR REPLACE FUNCTION initialize_tenant_complete(
  p_tenant_id UUID,
  p_template_type template_type_enum DEFAULT 'basic_insurance'
)
RETURNS JSONB AS $$
DECLARE
  system_params INTEGER;
  analysis_params INTEGER;
  branding_params INTEGER;
  security_params INTEGER;
  compliance_params INTEGER;
  total_params INTEGER;
  result JSONB;
BEGIN
  -- Inicializar parámetros del sistema
  SELECT initialize_system_parameters(p_tenant_id) INTO system_params;
  
  -- Inicializar parámetros de análisis
  SELECT initialize_analysis_parameters(p_tenant_id) INTO analysis_params;
  
  -- Inicializar parámetros de branding
  SELECT initialize_branding_parameters(p_tenant_id) INTO branding_params;
  
  -- Inicializar parámetros de seguridad
  SELECT initialize_security_parameters(p_tenant_id) INTO security_params;
  
  -- Inicializar parámetros de cumplimiento
  SELECT initialize_compliance_parameters(p_tenant_id) INTO compliance_params;
  
  -- Calcular total
  total_params := system_params + analysis_params + branding_params + security_params + compliance_params;
  
  -- Construir resultado
  result := jsonb_build_object(
    'tenant_id', p_tenant_id,
    'template_type', p_template_type,
    'total_parameters_created', total_params,
    'parameters_by_category', jsonb_build_object(
      'system', system_params,
      'analysis', analysis_params,
      'ui_branding', branding_params,
      'security', security_params,
      'compliance', compliance_params
    ),
    'initialization_timestamp', NOW(),
    'status', 'completed'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES DE GESTIÓN DE PARÁMETROS
-- ============================================================================

-- Función para obtener parámetro con fallback
CREATE OR REPLACE FUNCTION get_parameter(
  p_tenant_id UUID,
  p_category parameter_category_type,
  p_group VARCHAR(100),
  p_key VARCHAR(100),
  p_company_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  param_value JSONB;
  param_type parameter_value_type;
BEGIN
  -- Buscar primero en parámetros de empresa (si aplica)
  IF p_company_id IS NOT NULL THEN
    SELECT parameter_value, parameter_type 
    INTO param_value, param_type
    FROM company_parameters
    WHERE company_id = p_company_id
      AND parameter_category = p_category
      AND parameter_group = p_group
      AND parameter_key = p_key;
  END IF;
  
  -- Si no se encuentra en empresa, buscar en tenant
  IF param_value IS NULL THEN
    SELECT parameter_value, parameter_type 
    INTO param_value, param_type
    FROM tenant_parameters
    WHERE tenant_id = p_tenant_id
      AND parameter_category = p_category
      AND parameter_group = p_group
      AND parameter_key = p_key;
  END IF;
  
  -- Si no se encuentra, retornar null
  IF param_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retornar valor con metadatos
  RETURN jsonb_build_object(
    'value', param_value,
    'type', param_type,
    'source', CASE WHEN p_company_id IS NOT NULL AND EXISTS(
      SELECT 1 FROM company_parameters 
      WHERE company_id = p_company_id 
        AND parameter_category = p_category 
        AND parameter_group = p_group 
        AND parameter_key = p_key
    ) THEN 'company' ELSE 'tenant' END
  );
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar parámetro
CREATE OR REPLACE FUNCTION update_parameter(
  p_tenant_id UUID,
  p_category parameter_category_type,
  p_group VARCHAR(100),
  p_key VARCHAR(100),
  p_new_value JSONB,
  p_company_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  table_name TEXT;
  id_field TEXT;
  id_value UUID;
  rows_affected INTEGER;
BEGIN
  -- Determinar tabla y campos
  IF p_company_id IS NOT NULL THEN
    table_name := 'company_parameters';
    id_field := 'company_id';
    id_value := p_company_id;
  ELSE
    table_name := 'tenant_parameters';
    id_field := 'tenant_id';
    id_value := p_tenant_id;
  END IF;
  
  -- Ejecutar actualización dinámicamente
  EXECUTE format('
    UPDATE %I 
    SET parameter_value = $1, updated_at = NOW() 
    WHERE %I = $2 
      AND parameter_category = $3 
      AND parameter_group = $4 
      AND parameter_key = $5',
    table_name, id_field
  ) USING p_new_value, id_value, p_category, p_group, p_key;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================================

-- Índices para tenant_initialization_status
CREATE INDEX idx_tenant_init_status_tenant ON tenant_initialization_status(tenant_id, step_status);
CREATE INDEX idx_tenant_init_status_order ON tenant_initialization_status(tenant_id, step_order);

-- Índices para tenant_parameters
CREATE INDEX idx_tenant_params_category ON tenant_parameters(tenant_id, parameter_category);
CREATE INDEX idx_tenant_params_lookup ON tenant_parameters(tenant_id, parameter_category, parameter_group, parameter_key);
CREATE INDEX idx_tenant_params_configurable ON tenant_parameters(tenant_id, is_user_configurable) WHERE is_user_configurable = true;

-- Índices para company_parameters
CREATE INDEX idx_company_params_category ON company_parameters(company_id, parameter_category);
CREATE INDEX idx_company_params_lookup ON company_parameters(company_id, parameter_category, parameter_group, parameter_key);
CREATE INDEX idx_company_params_tenant ON company_parameters(tenant_id);

-- Índices para initialization_templates
CREATE INDEX idx_init_templates_type ON initialization_templates(template_type, is_active);
CREATE INDEX idx_init_templates_active ON initialization_templates(is_active) WHERE is_active = true;

-- ============================================================================
-- DATOS INICIALES DE TEMPLATES
-- ============================================================================

-- Template básico de seguro
INSERT INTO initialization_templates (
  template_name, template_type, description, initialization_steps, default_parameters
) VALUES (
  'basic_insurance_template',
  'basic_insurance',
  'Template básico para compañías de seguros',
  '[
    "validate_tenant_data",
    "create_tenant_record", 
    "setup_database_schema",
    "initialize_parameter_tables",
    "configure_default_parameters",
    "setup_branding_parameters",
    "configure_security_parameters", 
    "setup_compliance_parameters",
    "create_admin_user",
    "initialize_audit_system",
    "validate_initialization"
  ]'::jsonb,
  '{
    "branding": {
      "primary_color": "#3B82F6",
      "secondary_color": "#10B981"
    },
    "analysis": {
      "confidence_threshold": 0.8,
      "supported_types": ["facial", "voice", "vital_signs"]
    },
    "security": {
      "password_min_length": 8,
      "max_login_attempts": 5
    }
  }'::jsonb
);

-- Template premium
INSERT INTO initialization_templates (
  template_name, template_type, description, initialization_steps, default_parameters
) VALUES (
  'premium_insurance_template',
  'premium_insurance', 
  'Template premium con características avanzadas',
  '[
    "validate_tenant_data",
    "create_tenant_record",
    "setup_database_schema", 
    "initialize_parameter_tables",
    "configure_default_parameters",
    "setup_branding_parameters",
    "configure_security_parameters",
    "setup_compliance_parameters",
    "configure_advanced_analytics",
    "setup_integrations",
    "create_admin_user",
    "initialize_audit_system",
    "validate_initialization"
  ]'::jsonb,
  '{
    "branding": {
      "primary_color": "#7C3AED",
      "secondary_color": "#059669"
    },
    "analysis": {
      "confidence_threshold": 0.85,
      "supported_types": ["facial", "voice", "vital_signs", "gait", "eye_tracking"]
    },
    "security": {
      "password_min_length": 10,
      "max_login_attempts": 3,
      "two_factor_required": true
    }
  }'::jsonb
);

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE tenant_initialization_status IS 'Tracking del estado de inicialización de tenants';
COMMENT ON TABLE tenant_parameters IS 'Parámetros de configuración específicos por tenant (NO hardcoded values)';
COMMENT ON TABLE company_parameters IS 'Parámetros de configuración específicos por empresa dentro de un tenant';
COMMENT ON TABLE initialization_templates IS 'Templates predefinidos para diferentes tipos de inicialización';

COMMENT ON FUNCTION initialize_tenant_complete(UUID, template_type_enum) IS 'Función principal para inicialización completa de tenant con todos los parámetros';
COMMENT ON FUNCTION get_parameter(UUID, parameter_category_type, VARCHAR, VARCHAR, UUID) IS 'Obtener parámetro con fallback de empresa a tenant';
COMMENT ON FUNCTION update_parameter(UUID, parameter_category_type, VARCHAR, VARCHAR, JSONB, UUID) IS 'Actualizar parámetro en tenant o empresa';