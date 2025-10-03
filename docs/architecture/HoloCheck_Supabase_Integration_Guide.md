# HoloCheck - Guía de Integración con Supabase

## 🚀 Configuración Paso a Paso

### **Paso 1: Crear Proyecto Supabase**

1. **Ir a [supabase.com](https://supabase.com)**
2. **Crear cuenta** o iniciar sesión
3. **Crear nuevo proyecto:**
   - Nombre: `holocheck-production`
   - Región: `us-east-1` (o la más cercana)
   - Password: Generar password seguro

### **Paso 2: Configurar Base de Datos**

1. **Ir a SQL Editor en Supabase Dashboard**
2. **Ejecutar el script completo:** `HoloCheck_Supabase_SQL_Scripts.sql`
3. **Verificar que todas las tablas se crearon correctamente**

### **Paso 3: Configurar Variables de Entorno**

Crear archivo `.env.local` en el proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# HIPAA Encryption
SUPABASE_ENCRYPTION_KEY=your-256-bit-encryption-key-here
HIPAA_COMPLIANCE_MODE=true

# GitHub Integration
GITHUB_TOKEN=your-github-token-here
GITHUB_REPO=hcarranzacr/holocheck

# Data Retention
AUTO_DELETE_EXPIRED_DATA=true
AUDIT_LOG_RETENTION_DAYS=2555
```

### **Paso 4: Instalar Dependencias de Supabase**

```bash
cd /workspace/dashboard
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @supabase/auth-helpers-react @supabase/auth-ui-react
```

### **Paso 5: Configurar Cliente Supabase**

Crear `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-HIPAA-Compliant': 'true'
    }
  }
})

// Service role client for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### **Paso 6: Configurar Autenticación**

Crear `components/AuthProvider.jsx`:

```javascript
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### **Paso 7: Servicios de Datos Biométricos**

Crear `services/biometricService.js`:

```javascript
import { supabase } from '../lib/supabase'

export class BiometricService {
  
  // Guardar datos biométricos encriptados
  static async saveBiometricData(userId, biometricData) {
    try {
      // Encriptar datos sensibles
      const encryptedData = await this.encryptBiometricData(biometricData)
      
      const { data, error } = await supabase
        .from('biometric_data')
        .insert({
          user_id: userId,
          encrypted_cardiovascular_data: encryptedData.cardiovascular,
          encrypted_voice_data: encryptedData.voice,
          encrypted_rppg_data: encryptedData.rppg,
          capture_quality_score: biometricData.quality_score,
          capture_device_info: biometricData.device_info,
          data_integrity_hash: await this.generateIntegrityHash(biometricData)
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving biometric data:', error)
      return { success: false, error: error.message }
    }
  }

  // Guardar resultados de análisis
  static async saveAnalysisResults(biometricDataId, userId, analysisResults) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .insert({
          biometric_data_id: biometricDataId,
          user_id: userId,
          cardiovascular_metrics: analysisResults.cardiovascular,
          voice_biomarkers: analysisResults.voice,
          stress_indicators: analysisResults.stress,
          risk_assessment: analysisResults.risk_level,
          clinical_recommendations: analysisResults.recommendations,
          analysis_algorithm_version: analysisResults.algorithm_version,
          confidence_score: analysisResults.confidence,
          processing_time_ms: analysisResults.processing_time
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving analysis results:', error)
      return { success: false, error: error.message }
    }
  }

  // Obtener historial de análisis del usuario
  static async getUserAnalysisHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          biometric_data:biometric_data_id (
            capture_timestamp,
            capture_quality_score
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching analysis history:', error)
      return { success: false, error: error.message }
    }
  }

  // Obtener métricas agregadas para empresas
  static async getCompanyHealthMetrics(companyId) {
    try {
      const { data, error } = await supabase
        .from('company_health_metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('analysis_month', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching company metrics:', error)
      return { success: false, error: error.message }
    }
  }

  // Obtener estadísticas poblacionales para aseguradoras
  static async getInsurancePopulationStats(insuranceCompanyId) {
    try {
      const { data, error } = await supabase
        .from('insurance_population_stats')
        .select('*')
        .eq('insurance_company_id', insuranceCompanyId)
        .order('analysis_quarter', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching insurance stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Funciones de encriptación (lado cliente)
  static async encryptBiometricData(data) {
    // Implementar encriptación AES-256 en el cliente
    // Para máxima seguridad HIPAA
    return {
      cardiovascular: await this.encrypt(JSON.stringify(data.cardiovascular)),
      voice: await this.encrypt(JSON.stringify(data.voice)),
      rppg: await this.encrypt(JSON.stringify(data.rppg))
    }
  }

  static async encrypt(data) {
    // Implementación de encriptación web crypto API
    const encoder = new TextEncoder()
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(process.env.NEXT_PUBLIC_ENCRYPTION_KEY),
      'AES-GCM',
      false,
      ['encrypt']
    )
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    )
    
    return new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  }

  static async generateIntegrityHash(data) {
    const encoder = new TextEncoder()
    const hashBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      encoder.encode(JSON.stringify(data))
    )
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
```

### **Paso 8: Configurar GitHub Actions para Auto-Deploy**

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Supabase

on:
  push:
    branches: [ main, MejorasV1.3 ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./dashboard
    
    - name: Build application
      run: npm run build
      working-directory: ./dashboard
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to Supabase
      run: |
        npx supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        npx supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### **Paso 9: Configurar Políticas de Seguridad Adicionales**

En Supabase Dashboard > Authentication > Settings:

```json
{
  "site_url": "https://your-domain.com",
  "redirect_urls": [
    "http://localhost:3000/**",
    "https://your-domain.com/**"
  ],
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "security_update_password_require_reauthentication": true
}
```

### **Paso 10: Configurar Webhooks para Auditoría**

Crear función Edge para logging automático:

```javascript
// supabase/functions/audit-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { record, type, table } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Log to audit table
    await supabase.from('audit_logs').insert({
      event_type: 'data_access',
      table_name: table,
      record_id: record.id,
      action_performed: type,
      phi_accessed: ['biometric_data', 'analysis_results'].includes(table),
      timestamp: new Date().toISOString()
    })
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## 🔐 Checklist de Seguridad HIPAA

- [ ] **Encriptación habilitada** - AES-256 para datos en reposo
- [ ] **RLS configurado** - Políticas por usuario y rol
- [ ] **Auditoría automática** - Logs de todos los accesos
- [ ] **Consentimientos** - Tracking de consentimientos HIPAA
- [ ] **Retención de datos** - Políticas automáticas configuradas
- [ ] **Acceso mínimo necesario** - Permisos granulares por pilar
- [ ] **Backup seguro** - Encriptación de backups
- [ ] **Monitoreo** - Alertas de acceso anómalo

## 📊 Métricas de Monitoreo Recomendadas

### **Dashboard de Compliance:**
- Número de accesos a PHI por día
- Tiempo promedio de retención de datos
- Porcentaje de datos con consentimiento válido
- Alertas de seguridad por tipo

### **Dashboard de Performance:**
- Tiempo de respuesta de consultas
- Volumen de datos procesados
- Eficiencia de encriptación
- Uso de recursos por pilar

## 🚀 Próximos Pasos

1. **Ejecutar scripts SQL** en Supabase
2. **Configurar variables de entorno**
3. **Instalar dependencias** de Supabase
4. **Integrar autenticación** en componentes existentes
5. **Migrar datos actuales** (localStorage → Supabase)
6. **Configurar GitHub Actions** para auto-deploy
7. **Probar políticas RLS** con diferentes tipos de usuario
8. **Configurar monitoreo** y alertas de seguridad

Esta arquitectura proporciona una base sólida y compliant para HoloCheck, cumpliendo con HIPAA mientras permite análisis valiosos para los tres pilares del sistema.