# HoloCheck Database Scripts

Esta carpeta contiene scripts SQL separados para la gestión de la base de datos HoloCheck, siguiendo las mejores prácticas de arquitectura de base de datos y gestión de cambios.

## 📁 Resumen de Scripts

| Script | Propósito | Caso de Uso | Nivel de Riesgo |
|--------|-----------|-------------|------------------|
| `01-database-creation.sql` | Configuración completa de base de datos | Instalaciones nuevas | Bajo |
| `02-database-migration.sql` | Agregar columnas/tablas faltantes | Bases de datos existentes con esquema faltante | Medio |
| `03-database-reset.sql` | Limpiar todos los datos, preservar estructura | Reset de desarrollo/testing | Alto |
| `04-database-rollback.sql` | Revertir cambios de migración | La migración causó problemas | Alto |

## 🚀 Inicio Rápido

### Para Instalaciones Nuevas
```sql
-- Usa esto para configuraciones completamente nuevas de HoloCheck
-- Copia y pega: 01-database-creation.sql
```

### Para Instalaciones Existentes con Columnas Faltantes
```sql
-- Usa esto si obtienes el error "Could not find the 'domain' column"
-- Copia y pega: 02-database-migration.sql
```

## 📋 Guía Detallada de Scripts

### 1. Script de Creación de Base de Datos
**Archivo:** `01-database-creation.sql`
**Propósito:** Configuración completa de base de datos para instalaciones nuevas de HoloCheck
**Prerrequisitos:** Base de datos Supabase vacía
**Crea:** 11 tablas con soporte multi-tenant completo

**Lo que hace:**
- ✅ Crea las 11 tablas requeridas
- ✅ Configura índices apropiados para rendimiento
- ✅ Habilita Row Level Security (RLS)
- ✅ Inserta configuración del sistema por defecto
- ✅ Incluye verificación y confirmación de éxito

**Cuándo usar:**
- Nueva instalación de HoloCheck
- Empezar desde cero
- Quieres asegurar una configuración limpia y completa

### 2. Script de Migración de Base de Datos
**Archivo:** `02-database-migration.sql`
**Propósito:** Agregar columnas y tablas faltantes a instalaciones existentes
**Prerrequisitos:** Base de datos HoloCheck existente con algunas tablas
**Soluciona:** Error "Could not find the 'domain' column"

**Lo que hace:**
- ✅ Agrega columna `domain` faltante a tabla `tenants`
- ✅ Agrega columnas faltantes `subscription_plan`, `settings`, `status`
- ✅ Agrega `employee_count`, `settings` faltantes a `companies`
- ✅ Crea tablas `parameter_categories` y `tenant_parameters`
- ✅ Actualiza datos existentes con valores por defecto
- ✅ Preserva todos los datos existentes

**Cuándo usar:**
- Obtienes error "domain column not found"
- Tienes datos existentes de tenants/companies
- Necesitas actualizar esquema sin perder datos

### 3. Script de Reset de Base de Datos
**Archivo:** `03-database-reset.sql`
**Propósito:** Reset limpio preservando estructura de tablas
**Prerrequisitos:** Base de datos HoloCheck existente
**⚠️ ADVERTENCIA:** Elimina TODOS los datos

**Lo que hace:**
- ❌ Elimina todos los datos de tenant, company, user
- ❌ Limpia todos los datos biométricos y de análisis
- ❌ Remueve todos los logs de auditoría
- ✅ Preserva estructura de tablas e índices
- ✅ Resetea configuración del sistema a valores por defecto
- ✅ Mantiene políticas RLS

**Cuándo usar:**
- Reset de entorno de desarrollo/testing
- Necesitas empezar fresco con la misma estructura
- Limpiar todos los datos pero mantener esquema de base de datos

### 4. Script de Rollback de Base de Datos
**Archivo:** `04-database-rollback.sql`
**Propósito:** Revertir cambios de migración si ocurren problemas
**Prerrequisitos:** Base de datos que ha sido migrada
**⚠️ ADVERTENCIA:** Remueve cambios de migración

**Lo que hace:**
- ❌ Remueve columnas agregadas en migración
- ❌ Elimina tablas de parámetros
- ❌ Remueve índices específicos de migración
- ✅ Crea respaldo temporal de datos esenciales
- ✅ Retorna base de datos a estado pre-migración

**Cuándo usar:**
- La migración causó problemas inesperados
- Necesitas regresar al esquema anterior
- Quieres probar un enfoque de migración diferente

## 🔧 Instrucciones de Ejecución

### Proceso Paso a Paso:

1. **Elige el script correcto** basado en tu situación
2. **Copia todo el script** del archivo apropiado
3. **Abre Supabase Dashboard** → SQL Editor
4. **Pega el script** en el editor
5. **Lee las advertencias de seguridad** en los comentarios del script
6. **Descomenta confirmaciones de seguridad** si es requerido (scripts reset/rollback)
7. **Haz clic en "Run"** para ejecutar
8. **Revisa los mensajes de salida** para confirmación de éxito
9. **Regresa al panel admin de HoloCheck** para verificar resultados

### Características de Seguridad:

- **Verificaciones pre-ejecución:** Scripts verifican prerrequisitos
- **Confirmaciones de seguridad:** Scripts de alto riesgo requieren confirmación explícita
- **Logging detallado:** Todas las operaciones se registran con mensajes de estado
- **Pasos de verificación:** Scripts verifican su propio éxito
- **Capacidad de rollback:** Cambios de migración pueden revertirse si es necesario

## 🔍 Solución de Problemas

### Problemas Comunes:

**"Could not find the 'domain' column"**
- **Solución:** Usa `02-database-migration.sql`
- **Causa:** Columnas faltantes en instalación existente

**Advertencia "Tables already exist"**
- **Solución:** Usa `02-database-migration.sql` en lugar del script de creación
- **Causa:** Intentando crear tablas que ya existen

**El script de migración falla**
- **Solución:** Usa `04-database-rollback.sql` luego prueba script de creación
- **Causa:** Estado de migración corrupto

**El script de reset no se ejecuta**
- **Solución:** Descomenta la línea `SET LOCAL force_reset = 'yes';`
- **Causa:** Verificación de seguridad previniendo pérdida accidental de datos

### Comandos de Verificación:

```sql
-- Verificar conteo de tablas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%tenant%' OR table_name LIKE '%compan%';

-- Verificar columna domain
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'domain';

-- Verificar configuración del sistema
SELECT config_key, config_value FROM system_config;
```

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los mensajes de salida del script** - contienen información detallada de estado
2. **Verifica prerrequisitos** - asegúrate de usar el script correcto para tu situación
3. **Revisa la sección de solución de problemas** arriba
4. **Verifica el panel admin de HoloCheck** - mostrará el estado de las tablas después de la ejecución del script

## 🏗️ Notas de Arquitectura

Estos scripts siguen las mejores prácticas de base de datos:

- **Separación de responsabilidades:** Cada script tiene un propósito único y claro
- **Operaciones idempotentes:** Scripts pueden ejecutarse múltiples veces de forma segura
- **Manejo apropiado de dependencias:** Restricciones de clave foránea respetadas
- **Logging comprensivo:** Mensajes detallados de estado y progreso
- **Mecanismos de seguridad:** Confirmaciones requeridas para operaciones destructivas
- **Verificación incorporada:** Scripts verifican su propio éxito