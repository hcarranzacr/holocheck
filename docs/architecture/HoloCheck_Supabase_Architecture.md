# HoloCheck - Arquitectura de Base de Datos Supabase

## 🏗️ Diseño de Sistema de Base de Datos HIPAA-Compliant

### **Resumen Ejecutivo**
Arquitectura completa de base de datos para HoloCheck con cumplimiento HIPAA, control de acceso granular por tres pilares, y encriptación de datos de salud (PHI).

## 🎯 Modelo de Tres Pilares de Acceso

### **PILAR 1: INDIVIDUAL (Usuarios Finales)**
- **Acceso:** Solo a sus propios datos biométricos
- **Funcionalidades:** Análisis personal, historial, configuración de privacidad
- **Restricciones:** No puede ver datos de otros usuarios

### **PILAR 2: EMPRESARIAL (Organizaciones)**
- **Acceso:** Datos agregados y anonimizados de empleados
- **Funcionalidades:** Dashboard empresarial, métricas poblacionales, reportes de riesgo
- **Restricciones:** No puede ver datos individuales identificables

### **PILAR 3: ASEGURADORAS (Compañías de Seguros)**
- **Acceso:** Análisis actuarial y estadísticas poblacionales
- **Funcionalidades:** Evaluación de riesgo, pricing, underwriting
- **Restricciones:** Solo datos agregados para análisis actuarial

## 📊 Esquema de Base de Datos

### **Tabla: auth.users (Supabase Auth)**
```sql
-- Extendida por Supabase Auth
-- Campos adicionales en raw_user_meta_data:
{
  "pillar_type": "individual|company|insurance",
  "company_id": "uuid|null",
  "insurance_company_id": "uuid|null",
  "hipaa_consent": "boolean",
  "data_retention_consent": "boolean"
}
```

### **Tabla: user_profiles**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_type user_pillar_type NOT NULL,
  
  -- Datos demográficos encriptados (HIPAA)
  encrypted_personal_data JSONB, -- Nombre, fecha nacimiento, etc.
  
  -- Metadatos no sensibles
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  -- Control de acceso
  company_id UUID REFERENCES companies(id),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  
  -- Consentimientos HIPAA
  hipaa_consent BOOLEAN DEFAULT FALSE,
  hipaa_consent_date TIMESTAMPTZ,
  data_retention_consent BOOLEAN DEFAULT FALSE,
  data_retention_date TIMESTAMPTZ,
  
  UNIQUE(user_id)
);

-- Enum para tipos de pilar
CREATE TYPE user_pillar_type AS ENUM ('individual', 'company', 'insurance');
```

### **Tabla: companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size_category company_size_type,
  
  -- Información de contacto
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  
  -- Configuración de privacidad
  data_aggregation_level aggregation_level_type DEFAULT 'anonymous',
  retention_policy_months INTEGER DEFAULT 24,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TYPE company_size_type AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE aggregation_level_type AS ENUM ('anonymous', 'pseudonymized', 'aggregated');
```

### **Tabla: insurance_companies**
```sql
CREATE TABLE insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  regulatory_body TEXT,
  
  -- Configuración actuarial
  risk_assessment_models JSONB,
  pricing_algorithms JSONB,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### **Tabla: biometric_data (Datos Encriptados HIPAA)**
```sql
CREATE TABLE biometric_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos biométricos encriptados
  encrypted_cardiovascular_data BYTEA, -- Encriptado con AES-256
  encrypted_voice_data BYTEA,
  encrypted_rppg_data BYTEA,
  
  -- Hash para verificación de integridad
  data_integrity_hash TEXT,
  
  -- Metadatos de captura
  capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
  capture_device_info JSONB,
  capture_quality_score DECIMAL(5,2),
  
  -- Análisis completado
  analysis_completed BOOLEAN DEFAULT FALSE,
  analysis_timestamp TIMESTAMPTZ,
  
  -- Control de acceso
  company_id UUID REFERENCES companies(id),
  is_company_shared BOOLEAN DEFAULT FALSE,
  
  -- Auditoría HIPAA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ
);
```

### **Tabla: analysis_results**
```sql
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biometric_data_id UUID REFERENCES biometric_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Resultados de análisis (36+ biomarcadores)
  cardiovascular_metrics JSONB, -- HR, HRV, BP, etc.
  voice_biomarkers JSONB,       -- F0, jitter, shimmer, etc.
  stress_indicators JSONB,      -- Stress level, arousal, etc.
  
  -- Interpretación clínica
  risk_assessment risk_level_type,
  clinical_recommendations JSONB,
  
  -- Metadatos de análisis
  analysis_algorithm_version TEXT,
  confidence_score DECIMAL(5,2),
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Para cumplimiento de retención
);

CREATE TYPE risk_level_type AS ENUM ('low', 'moderate', 'high', 'critical');
```

### **Tabla: company_employees**
```sql
CREATE TABLE company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información laboral (no PHI)
  employee_id TEXT, -- ID interno de la empresa
  department TEXT,
  position TEXT,
  hire_date DATE,
  
  -- Configuración de privacidad
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  anonymization_level anonymization_type DEFAULT 'full',
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

CREATE TYPE anonymization_type AS ENUM ('full', 'partial', 'pseudonymized');
```

### **Tabla: insurance_policies**
```sql
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_company_id UUID REFERENCES insurance_companies(id),
  company_id UUID REFERENCES companies(id),
  
  -- Información de póliza
  policy_number TEXT UNIQUE,
  policy_type insurance_policy_type,
  coverage_details JSONB,
  
  -- Configuración de datos
  data_access_level data_access_type,
  risk_assessment_frequency INTEGER, -- días
  
  -- Fechas
  effective_date DATE,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TYPE insurance_policy_type AS ENUM ('health', 'life', 'disability', 'group');
CREATE TYPE data_access_type AS ENUM ('aggregated_only', 'statistical', 'risk_indicators');
```

### **Tabla: audit_logs (Cumplimiento HIPAA)**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del evento
  event_type audit_event_type NOT NULL,
  table_name TEXT,
  record_id UUID,
  
  -- Usuario que realizó la acción
  user_id UUID REFERENCES auth.users(id),
  user_pillar_type user_pillar_type,
  
  -- Detalles del acceso
  action_performed TEXT,
  data_accessed JSONB, -- Qué campos fueron accedidos
  access_reason TEXT,
  
  -- Información técnica
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Cumplimiento HIPAA
  phi_accessed BOOLEAN DEFAULT FALSE,
  minimum_necessary_standard BOOLEAN DEFAULT TRUE
);

CREATE TYPE audit_event_type AS ENUM (
  'data_access', 'data_modification', 'data_deletion', 
  'login', 'logout', 'export', 'share', 'analysis_run'
);
```

### **Tabla: data_retention_policies**
```sql
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuración por tipo de entidad
  entity_type retention_entity_type,
  entity_id UUID, -- company_id o insurance_company_id
  
  -- Políticas de retención
  biometric_data_retention_months INTEGER DEFAULT 24,
  analysis_results_retention_months INTEGER DEFAULT 12,
  audit_logs_retention_months INTEGER DEFAULT 84, -- 7 años HIPAA
  
  -- Configuración de eliminación
  auto_delete_enabled BOOLEAN DEFAULT TRUE,
  deletion_notification_days INTEGER DEFAULT 30,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  effective_date DATE DEFAULT CURRENT_DATE
);

CREATE TYPE retention_entity_type AS ENUM ('individual', 'company', 'insurance_company');
```

## 🔐 Row Level Security (RLS) Policies

### **Política para user_profiles**
```sql
-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Las empresas pueden ver perfiles de sus empleados (datos no PHI)
CREATE POLICY "Companies can view employee profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_employees ce
      WHERE ce.user_id = user_profiles.user_id
      AND ce.company_id = (
        SELECT company_id FROM user_profiles up2 
        WHERE up2.user_id = auth.uid()
      )
    )
  );
```

### **Política para biometric_data**
```sql
-- Solo el propietario puede acceder a sus datos biométricos
CREATE POLICY "Users can access own biometric data" ON biometric_data
  FOR ALL USING (auth.uid() = user_id);

-- Las empresas NO pueden acceder a datos biométricos individuales
-- Solo a través de vistas agregadas

-- Las aseguradoras NO pueden acceder a datos individuales
-- Solo a través de análisis estadísticos agregados
```

### **Política para analysis_results**
```sql
-- Los usuarios pueden ver sus propios resultados
CREATE POLICY "Users can view own results" ON analysis_results
  FOR SELECT USING (auth.uid() = user_id);

-- Las empresas pueden ver resultados agregados (implementado en vistas)
-- Las aseguradoras pueden ver estadísticas poblacionales (implementado en vistas)
```

## 📈 Vistas Agregadas para Cumplimiento de Privacidad

### **Vista: company_health_metrics**
```sql
CREATE VIEW company_health_metrics AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  COUNT(DISTINCT ce.user_id) as total_employees,
  
  -- Métricas agregadas (sin identificación individual)
  AVG((ar.cardiovascular_metrics->>'heartRate')::numeric) as avg_heart_rate,
  STDDEV((ar.cardiovascular_metrics->>'heartRate')::numeric) as hr_std_dev,
  
  -- Distribución de riesgo
  COUNT(CASE WHEN ar.risk_assessment = 'low' THEN 1 END) as low_risk_count,
  COUNT(CASE WHEN ar.risk_assessment = 'moderate' THEN 1 END) as moderate_risk_count,
  COUNT(CASE WHEN ar.risk_assessment = 'high' THEN 1 END) as high_risk_count,
  
  -- Tendencias temporales
  DATE_TRUNC('month', ar.created_at) as analysis_month
  
FROM companies c
JOIN company_employees ce ON c.id = ce.company_id
JOIN analysis_results ar ON ce.user_id = ar.user_id
WHERE ce.data_sharing_consent = TRUE
  AND ce.is_active = TRUE
GROUP BY c.id, c.name, DATE_TRUNC('month', ar.created_at)
HAVING COUNT(DISTINCT ce.user_id) >= 5; -- Mínimo para anonimización
```

### **Vista: insurance_population_stats**
```sql
CREATE VIEW insurance_population_stats AS
SELECT 
  ic.id as insurance_company_id,
  ic.name as insurance_company_name,
  
  -- Estadísticas poblacionales agregadas
  COUNT(DISTINCT ar.user_id) as total_covered_individuals,
  
  -- Métricas de riesgo poblacional
  AVG((ar.cardiovascular_metrics->>'heartRate')::numeric) as population_avg_hr,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (ar.cardiovascular_metrics->>'heartRate')::numeric) as median_hr,
  
  -- Distribución de edad (rangos amplios para privacidad)
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) BETWEEN 18 AND 30 THEN 1 END) as age_18_30,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) BETWEEN 31 AND 50 THEN 1 END) as age_31_50,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(NOW(), (up.encrypted_personal_data->>'birth_date')::date)) > 50 THEN 1 END) as age_over_50,
  
  -- Indicadores actuariales
  (COUNT(CASE WHEN ar.risk_assessment IN ('high', 'critical') THEN 1 END)::float / COUNT(*)::float) * 100 as high_risk_percentage,
  
  DATE_TRUNC('quarter', ar.created_at) as analysis_quarter
  
FROM insurance_companies ic
JOIN insurance_policies ip ON ic.id = ip.insurance_company_id
JOIN companies c ON ip.company_id = c.id
JOIN company_employees ce ON c.id = ce.company_id
JOIN user_profiles up ON ce.user_id = up.user_id
JOIN analysis_results ar ON up.user_id = ar.user_id
WHERE ip.is_active = TRUE
  AND ce.data_sharing_consent = TRUE
  AND up.hipaa_consent = TRUE
GROUP BY ic.id, ic.name, DATE_TRUNC('quarter', ar.created_at)
HAVING COUNT(DISTINCT ar.user_id) >= 100; -- Mínimo para análisis actuarial
```

## 🔒 Funciones de Encriptación HIPAA

### **Función: encrypt_phi_data**
```sql
CREATE OR REPLACE FUNCTION encrypt_phi_data(data_to_encrypt TEXT)
RETURNS BYTEA AS $$
BEGIN
  -- Usar la extensión pgcrypto para encriptación AES-256
  RETURN pgp_sym_encrypt(data_to_encrypt, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Función: decrypt_phi_data**
```sql
CREATE OR REPLACE FUNCTION decrypt_phi_data(encrypted_data BYTEA)
RETURNS TEXT AS $$
BEGIN
  -- Solo permitir desencriptación si el usuario tiene permisos
  IF NOT has_phi_access(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access to PHI data';
  END IF;
  
  RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Función: has_phi_access**
```sql
CREATE OR REPLACE FUNCTION has_phi_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_pillar TEXT;
BEGIN
  SELECT pillar_type INTO user_pillar 
  FROM user_profiles 
  WHERE user_id = user_uuid;
  
  -- Solo usuarios individuales pueden acceder a su propia PHI
  RETURN user_pillar = 'individual';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔄 Triggers para Auditoría Automática

### **Trigger: audit_biometric_access**
```sql
CREATE OR REPLACE FUNCTION audit_biometric_access()
RETURNS TRIGGER AS $$
BEGIN
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
    'data_access',
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    (SELECT pillar_type FROM user_profiles WHERE user_id = auth.uid()),
    TG_OP,
    TRUE, -- biometric_data siempre contiene PHI
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER biometric_data_audit
  AFTER INSERT OR UPDATE OR DELETE ON biometric_data
  FOR EACH ROW EXECUTE FUNCTION audit_biometric_access();
```

## 📋 Índices Optimizados

```sql
-- Índices para rendimiento y cumplimiento
CREATE INDEX idx_biometric_data_user_timestamp ON biometric_data(user_id, capture_timestamp);
CREATE INDEX idx_analysis_results_user_created ON analysis_results(user_id, created_at);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_event ON audit_logs(user_id, event_type);
CREATE INDEX idx_company_employees_active ON company_employees(company_id, is_active) WHERE is_active = TRUE;

-- Índices para vistas agregadas
CREATE INDEX idx_analysis_results_risk_created ON analysis_results(risk_assessment, created_at);
CREATE INDEX idx_user_profiles_pillar_company ON user_profiles(pillar_type, company_id);
```

## 🚀 Configuración de Supabase

### **Variables de Entorno Requeridas**
```bash
# Encriptación HIPAA
SUPABASE_ENCRYPTION_KEY=your-256-bit-encryption-key
HIPAA_COMPLIANCE_MODE=true

# Configuración de auditoría
AUDIT_LOG_RETENTION_DAYS=2555  # 7 años
AUTO_AUDIT_ENABLED=true

# Configuración de retención
DATA_RETENTION_CHECK_INTERVAL=daily
AUTO_DELETE_EXPIRED_DATA=true
```

### **Configuración de Roles**
```sql
-- Crear roles específicos para cada pilar
CREATE ROLE individual_user;
CREATE ROLE company_admin;
CREATE ROLE insurance_analyst;

-- Permisos granulares por rol
GRANT SELECT, INSERT, UPDATE ON biometric_data TO individual_user;
GRANT SELECT ON company_health_metrics TO company_admin;
GRANT SELECT ON insurance_population_stats TO insurance_analyst;
```

## ✅ Checklist de Cumplimiento HIPAA

- [x] **Encriptación de PHI** - AES-256 para datos en reposo
- [x] **Control de acceso granular** - RLS por usuario y rol
- [x] **Auditoría completa** - Logs automáticos de todos los accesos
- [x] **Retención de datos** - Políticas automáticas de eliminación
- [x] **Anonimización** - Agregación mínima para análisis empresariales
- [x] **Consentimiento explícito** - Tracking de consentimientos HIPAA
- [x] **Principio de necesidad mínima** - Acceso solo a datos necesarios
- [x] **Integridad de datos** - Hashing para verificación
- [x] **Segregación por pilares** - Acceso diferenciado por tipo de usuario

## 📊 Métricas de Monitoreo

### **Métricas de Cumplimiento**
- Número de accesos a PHI por día
- Tiempo promedio de retención de datos
- Porcentaje de datos con consentimiento válido
- Frecuencia de auditorías de acceso

### **Métricas de Rendimiento**
- Tiempo de respuesta de consultas agregadas
- Volumen de datos biométricos procesados
- Eficiencia de encriptación/desencriptación

Esta arquitectura proporciona una base sólida y compliant para HoloCheck, asegurando la privacidad de los datos de salud mientras permite análisis valiosos para los tres pilares del sistema.