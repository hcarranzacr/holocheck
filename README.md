# HoloCheck - Sistema de Análisis Biométrico Multi-Tenant

## 🏥 **Descripción General**

HoloCheck es una plataforma avanzada de análisis biométrico que utiliza tecnologías de **rPPG (fotopletismografía remota)** y **análisis de voz** para proporcionar evaluaciones de salud no invasivas. La versión 1.4.0 introduce una **arquitectura de 4 pilares** con **aislamiento multi-tenant completo** para aseguradoras.

### **🎯 Características Principales**
- ✅ **Análisis biométrico sin contacto** usando cámara y micrófono
- ✅ **Arquitectura multi-tenant** con aislamiento completo de datos
- ✅ **4 tipos de usuarios especializados** con permisos granulares
- ✅ **Cumplimiento HIPAA** con auditoría completa
- ✅ **Integración con IA** para recomendaciones personalizadas
- ✅ **Dashboard específicos** por tipo de usuario

---

## 🏗️ **Arquitectura de 4 Pilares**

### **PILAR 1: Usuario Final/Familiar** 👨‍👩‍👧‍👦
**Propósito:** Personas que realizan análisis biométricos personales
- Dashboard personal de resultados de salud
- Gestión de familiares (si es empleado principal)
- Visualización de tendencias y métricas
- Acceso solo a sus propios datos

### **PILAR 2: Empresa Asegurada** 🏢
**Propósito:** Compañías que contratan seguros para empleados
- Administración de empleados y departamentos
- Estadísticas agregadas de salud empresarial
- Programas de bienestar corporativo
- Reportes de participación y engagement

### **PILAR 3: Aseguradora** 🏦
**Propósito:** Compañías de seguros (tenants independientes)
- Gestión de múltiples empresas aseguradas
- Análisis actuarial y evaluación de riesgos
- Reportes de siniestralidad y tendencias
- Administración de colaboradores internos

### **PILAR 4: Administrador de Plataforma** ⚙️
**Propósito:** Control y administración global del sistema
- Gestión de todas las aseguradoras (tenants)
- Configuración global del sistema
- Monitoreo de performance y uso
- Soporte técnico y mantenimiento

---

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+ y pnpm
- Cuenta de Supabase configurada
- Claves API de OpenAI (opcional para IA)

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/hcarranzacr/holocheck.git
cd holocheck
git checkout MejorasV1
```

### **2. Instalar Dependencias**
```bash
pnpm install
```

### **3. Configurar Variables de Entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_OPENAI_API_KEY=tu_openai_key (opcional)
```

### **4. Configurar Base de Datos**
```bash
# 1. Ejecutar script de creación inicial
# Copiar y pegar database-scripts/01-database-creation.sql en Supabase SQL Editor

# 2. Ejecutar migración de 4 pilares
# Copiar y pegar database-scripts/05-four-pillars-redesign.sql en Supabase SQL Editor

# 3. Crear usuarios de demostración
node create-four-pillar-users.js
```

### **5. Ejecutar la Aplicación**
```bash
pnpm run dev
```

La aplicación estará disponible en: http://localhost:3001/

---

## 👥 **Usuarios de Demostración**

### **Credenciales de Acceso:**

| Pilar | Usuario | Email | Password | Rol |
|-------|---------|--------|----------|-----|
| 🏛️ **Plataforma** | Admin Sistema | `admin@holocheck.com` | `HoloAdmin2024!` | Super Admin |
| 🏦 **Aseguradora** | Director Seguros | `seguro@demo-insurance.com` | `InsuranceAdmin2024!` | Insurance Admin |
| 🏢 **Empresa** | Gerente RH | `empresa@demo-company.com` | `CompanyAdmin2024!` | Company Admin |
| 👤 **Usuario Final** | Juan Pérez | `usuario@demo-family.com` | `EndUser2024!` | End User |

### **URLs de Acceso:**
- **Aplicación Principal:** http://localhost:3001/
- **Panel Administrativo:** http://localhost:3001/admin

---

## 🗄️ **Estructura de Base de Datos**

### **Tablas Principales (11):**
- `tenants` - Aseguradoras (tenants)
- `companies` - Empresas aseguradas
- `system_config` - Configuración global
- `tenant_config` - Configuración por tenant
- `company_config` - Configuración por empresa
- `parameter_categories` - Categorías de parámetros
- `tenant_parameters` - Parámetros específicos por tenant
- `biometric_data` - Datos biométricos encriptados
- `analysis_results` - Resultados de análisis IA
- `audit_logs` - Logs de auditoría HIPAA

### **Tablas de Pilares (4):**
- `platform_admins` - Administradores de plataforma
- `tenant_staff` - Personal de aseguradoras
- `company_staff` - Personal de empresas
- `end_users` - Usuarios finales y familiares

### **Características de Seguridad:**
- **Row Level Security (RLS)** en todas las tablas
- **Encriptación PHI** para datos sensibles
- **Aislamiento completo** entre tenants
- **Auditoría HIPAA** de todos los accesos

---

## 🔐 **Sistema de Seguridad**

### **Multi-Tenant Isolation**
- Cada aseguradora es un **tenant independiente**
- **Aislamiento completo** de datos entre aseguradoras
- **RLS policies** específicas por tipo de usuario
- **Acceso controlado** por roles y permisos

### **Cumplimiento HIPAA**
- **Encriptación** de todos los datos PHI
- **Logs de auditoría** detallados
- **Principio de acceso mínimo necesario**
- **Consentimiento explícito** para cada uso

### **Protección de Datos**
- **Datos biométricos** nunca salen del dispositivo
- **Solo métricas calculadas** se almacenan
- **Encriptación AES-256** para datos sensibles
- **Tokens JWT** para autenticación

---

## 🛠️ **Desarrollo**

### **Estructura del Proyecto**
```
holocheck/
├── src/
│   ├── components/          # Componentes React
│   ├── services/           # Servicios (Supabase, OpenAI, etc.)
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilidades
│   └── data/               # Datos mock y configuración
├── database-scripts/       # Scripts SQL de migración
├── docs/                   # Documentación técnica
└── public/                 # Assets estáticos
```

### **Scripts Disponibles**
```bash
pnpm run dev          # Servidor de desarrollo
pnpm run build        # Build de producción
pnpm run preview      # Preview del build
pnpm run lint         # Linting del código
```

### **Tecnologías Utilizadas**
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **IA:** OpenAI GPT-4 para recomendaciones
- **Biométricos:** rPPG, análisis de voz
- **Seguridad:** Encriptación AES, JWT, HIPAA

---

## 📊 **Métricas Biométricas**

### **Análisis rPPG (Video)**
- Frecuencia cardíaca en tiempo real
- Variabilidad de la frecuencia cardíaca (HRV)
- Detección de arritmias básicas
- Índices de estrés cardiovascular

### **Análisis de Voz (Audio)**
- Patrones respiratorios
- Indicadores de estrés vocal
- Calidad y estabilidad de la voz
- Métricas de fatiga vocal

### **Métricas Combinadas**
- Puntuación general de salud
- Evaluación de riesgo cardiovascular
- Recomendaciones personalizadas
- Tendencias temporales

---

## 🔧 **Configuración Avanzada**

### **Variables de Entorno Completas**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=your_openai_api_key

# Application Configuration
VITE_APP_NAME=HoloCheck
VITE_APP_VERSION=1.4.0
VITE_ENVIRONMENT=development

# Security Configuration
VITE_ENCRYPTION_KEY=your_encryption_key
VITE_JWT_SECRET=your_jwt_secret

# Feature Flags
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_VOICE_ANALYSIS=true
VITE_ENABLE_HIPAA_LOGGING=true
```

### **Configuración de Supabase**

1. **Crear proyecto en Supabase**
2. **Ejecutar scripts de base de datos** en orden:
   - `01-database-creation.sql`
   - `05-four-pillars-redesign.sql`
3. **Configurar RLS policies** (incluidas en scripts)
4. **Crear usuarios de prueba** con `create-four-pillar-users.js`

---

## 📈 **Monitoreo y Analytics**

### **Métricas del Sistema**
- Uso por tenant y empresa
- Performance de análisis biométricos
- Tasas de éxito/error
- Tiempo de respuesta de APIs

### **Métricas de Negocio**
- Adopción por tipo de usuario
- Engagement con la plataforma
- Tendencias de salud agregadas
- ROI para aseguradoras

---

## 🆘 **Soporte y Troubleshooting**

### **Problemas Comunes**

**1. Error de conexión a Supabase**
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**2. Tablas no encontradas**
```bash
# Ejecutar scripts de base de datos
# 1. database-scripts/01-database-creation.sql
# 2. database-scripts/05-four-pillars-redesign.sql
```

**3. Usuarios no pueden hacer login**
```bash
# Crear usuarios de demostración
node create-four-pillar-users.js
```

**4. Puerto 3001 en uso**
```bash
# Cambiar puerto en vite.config.js o matar proceso
lsof -ti:3001 | xargs kill -9
```

### **Logs y Debugging**
- **Browser DevTools:** Console para errores de frontend
- **Supabase Dashboard:** Logs de base de datos y auth
- **Network Tab:** Verificar llamadas API
- **Application Tab:** LocalStorage y session data

---

## 🤝 **Contribución**

### **Proceso de Desarrollo**
1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request al branch `MejorasV1`

### **Estándares de Código**
- **ESLint** para linting
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **TypeScript** para tipado (en progreso)

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 **Contacto**

- **Repositorio:** https://github.com/hcarranzacr/holocheck
- **Issues:** https://github.com/hcarranzacr/holocheck/issues
- **Email:** support@holocheck.com
- **Documentación:** `/docs/` en el repositorio

---

## 🎉 **Changelog**

### **v1.4.0 - Arquitectura de 4 Pilares Multi-Tenant**
- ✅ Implementación completa de 4 pilares de usuarios
- ✅ Sistema multi-tenant con aislamiento de aseguradoras
- ✅ 15 tablas de base de datos optimizadas
- ✅ 50+ parámetros de configuración cargados
- ✅ Sistema de autenticación renovado
- ✅ Corrección de errores críticos

Ver `CHANGELOG_v1.4.0.md` para detalles completos.

---

**🚀 HoloCheck v1.4.0 - Plataforma de Análisis Biométrico Multi-Tenant Lista para Producción**