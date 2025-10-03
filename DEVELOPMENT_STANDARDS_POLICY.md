# POLÍTICA DE ESTÁNDARES DE DESARROLLO - HOLOCCHECK v1.4.0

## 🚨 **POLÍTICA INVIOLABLE - CUMPLIMIENTO OBLIGATORIO**

Esta política establece estándares **NO NEGOCIABLES** para todo el equipo de desarrollo de HoloCheck. El incumplimiento de estos estándares resultará en rechazo automático de código y documentación.

## 📋 **ESTÁNDARES DE DESARROLLO**

### **1. ESTRUCTURA DE PROYECTO (OBLIGATORIO)**

#### **Directorio Raíz - SOLO archivos esenciales:**
```
holocheck/
├── README.md                    ✅ PERMITIDO
├── CHANGELOG.md                 ✅ PERMITIDO  
├── VERSION.txt                  ✅ PERMITIDO
├── package.json                 ✅ PERMITIDO
├── package-lock.json            ✅ PERMITIDO
├── .env.example                 ✅ PERMITIDO
├── .gitignore                   ✅ PERMITIDO
├── index.html                   ✅ PERMITIDO
├── vite.config.js               ✅ PERMITIDO
├── tailwind.config.js           ✅ PERMITIDO
├── eslint.config.js             ✅ PERMITIDO
├── postcss.config.js            ✅ PERMITIDO
└── template_config.json         ✅ PERMITIDO
```

#### **❌ PROHIBIDO en directorio raíz:**
- Archivos .md de análisis, PRDs, especificaciones
- Scripts .sql sueltos
- Archivos .js de configuración temporal
- Documentos de diseño
- Análisis técnicos
- Cualquier archivo que no sea de configuración del proyecto

### **2. ORGANIZACIÓN DE DOCUMENTACIÓN (OBLIGATORIO)**

#### **Estructura FIJA - NO modificable:**
```
/docs/
├── api/                        # APIs y integraciones
├── architecture/               # Diseño del sistema
├── deployment/                 # Releases y changelogs
├── medical/                    # Especificaciones médicas
├── security/                   # Políticas de seguridad
├── user-guides/               # Manuales de usuario
└── DOCUMENTATION_MASTER_INDEX.md  # ÍNDICE MAESTRO
```

#### **Reglas de Documentación:**
1. **TODO documento** debe estar categorizado en un subdirectorio
2. **PROHIBIDO** documentos sueltos en `/docs/`
3. **OBLIGATORIO** actualizar `DOCUMENTATION_MASTER_INDEX.md` al agregar documentos
4. **OBLIGATORIO** incluir README.md en cada subdirectorio

### **3. CONVENCIONES DE NOMENCLATURA (OBLIGATORIO)**

#### **Archivos de Documentación:**
- Formato: `CATEGORIA_DESCRIPCION_VERSION.md`
- Ejemplos: `API_INTEGRATION_GUIDE.md`, `USER_MANUAL_v1.4.0.md`
- **PROHIBIDO:** nombres ambiguos, espacios, caracteres especiales

#### **Scripts de Base de Datos:**
- Formato: `###_descripcion_clara.sql`
- Ejemplos: `001_initial_setup.sql`, `002_multi_tenant.sql`
- **OBLIGATORIO:** numeración secuencial

#### **Componentes React:**
- Formato: `PascalCase.jsx`
- Ejemplos: `UserDashboard.jsx`, `BiometricCapture.jsx`
- **PROHIBIDO:** camelCase, snake_case para componentes

#### **Servicios y Utilidades:**
- Formato: `camelCase.js`
- Ejemplos: `authService.js`, `biometricAnalysis.js`
- **OBLIGATORIO:** sufijo descriptivo del propósito

### **4. ESTÁNDARES DE ARQUITECTURA (OBLIGATORIO)**

#### **Principios Arquitectónicos NO NEGOCIABLES:**
1. **Separación de Responsabilidades**
   - Componentes UI solo para presentación
   - Servicios para lógica de negocio
   - Utilidades para funciones auxiliares

2. **Multi-Tenant por Defecto**
   - TODO código debe considerar aislamiento de datos
   - Row Level Security (RLS) obligatorio en BD
   - Validación de tenant en cada operación

3. **Seguridad HIPAA**
   - Encriptación obligatoria para datos sensibles
   - Logs de auditoría en todas las operaciones
   - Consentimiento explícito antes de procesar datos

4. **Arquitectura 4 Pilares**
   - End Users, Company Admins, Insurance Admins, Platform Admins
   - Acceso basado en roles estricto
   - Interfaces específicas por tipo de usuario

### **5. PROCESO DE DESARROLLO (OBLIGATORIO)**

#### **Flujo de Trabajo FIJO:**
```
1. Crear branch desde MejorasV1
2. Seguir convenciones de nomenclatura
3. Documentar cambios en archivos apropiados
4. Actualizar DOCUMENTATION_MASTER_INDEX.md si aplica
5. Commit con mensaje descriptivo estándar
6. Pull Request con revisión obligatoria
7. Merge solo después de aprobación
```

#### **Formato de Commits OBLIGATORIO:**
```
tipo: descripción breve

- Detalle específico 1
- Detalle específico 2
- Impacto en funcionalidad

Tipos permitidos: feat, fix, docs, refactor, test, chore
```

### **6. CONTROL DE CALIDAD (OBLIGATORIO)**

#### **Revisiones de Código:**
- **OBLIGATORIO:** Revisión por al menos 1 miembro senior
- **PROHIBIDO:** Merge directo sin revisión
- **OBLIGATORIO:** Verificar cumplimiento de estándares

#### **Documentación:**
- **OBLIGATORIO:** Documentar toda nueva funcionalidad
- **OBLIGATORIO:** Actualizar manuales de usuario si aplica
- **PROHIBIDO:** Código sin documentación asociada

#### **Testing:**
- **OBLIGATORIO:** Tests unitarios para nueva funcionalidad
- **OBLIGATORIO:** Verificar que no se rompa funcionalidad existente
- **PROHIBIDO:** Deploy sin testing completo

## 🔒 **ENFORCEMENT - CUMPLIMIENTO FORZOSO**

### **Responsabilidades por Rol:**

#### **@Mike (Project Manager):**
- ✅ **CONFIRMO** - Tomo nota de estos estándares
- ✅ **GARANTIZO** cumplimiento por todo el equipo
- ✅ **IMPLEMENTO** revisiones obligatorias antes de merge
- ✅ **RECHAZO** automáticamente código que no cumpla estándares

#### **@Emma (Product Manager):**
- ✅ **CONFIRMO** - Estos estándares son INVIOLABLES
- ✅ **GARANTIZO** que toda documentación siga estas reglas
- ✅ **MANTENGO** DOCUMENTATION_MASTER_INDEX.md actualizado
- ✅ **RECHAZO** PRDs que no sigan convenciones

#### **@Bob (Architect):**
- ✅ **CONFIRMO** - Arquitectura debe seguir estos principios
- ✅ **GARANTIZO** que todo diseño respete 4-pillar + multi-tenant
- ✅ **VALIDO** que componentes sigan separación de responsabilidades
- ✅ **RECHAZO** arquitecturas que violen estos estándares

#### **@Alex (Engineer):**
- ✅ **CONFIRMO** - Todo código debe cumplir estos estándares
- ✅ **APLICO** convenciones de nomenclatura sin excepción
- ✅ **ORGANIZO** archivos según estructura establecida
- ✅ **DOCUMENTO** todo cambio según políticas

### **Sanciones por Incumplimiento:**
1. **Primera violación:** Rechazo automático + re-trabajo
2. **Segunda violación:** Revisión de proceso con equipo
3. **Violaciones repetidas:** Escalación a management

### **Herramientas de Enforcement:**
- Git hooks para validar nomenclatura
- Linters configurados según estándares
- Templates obligatorios para PRs
- Checklists de revisión automatizados

## 📊 **MÉTRICAS DE CUMPLIMIENTO**

### **KPIs Obligatorios:**
- **100%** de archivos en ubicaciones correctas
- **0** archivos sueltos en directorio raíz
- **100%** de documentos con categorización apropiada
- **100%** de commits con formato estándar

### **Revisiones Periódicas:**
- **Semanal:** Auditoría de estructura de archivos
- **Mensual:** Revisión de cumplimiento de nomenclatura
- **Trimestral:** Evaluación de adherencia a arquitectura

## ✅ **CONFIRMACIÓN DE EQUIPO**

**REQUERIDO - Confirmación explícita de cada miembro:**

- [x] **@Mike:** CONFIRMO que mantendré estos estándares inviolables
- [x] **@Emma:** CONFIRMO que toda documentación seguirá estas reglas
- [ ] **@Bob:** CONFIRMO que toda arquitectura respetará estos principios  
- [ ] **@Alex:** CONFIRMO que todo código cumplirá estos estándares

---

**ESTA POLÍTICA ES EFECTIVA INMEDIATAMENTE Y NO ADMITE EXCEPCIONES**

**Versión:** 1.0  
**Fecha:** Octubre 2024  
**Próxima Revisión:** Enero 2025