# HOLOCHECK - REDISEÑO DE ARQUITECTURA DE 4 PILARES

## Análisis del Problema Actual

El usuario ha identificado correctamente que la plataforma debe soportar **4 tipos de usuarios distintos** (pilares), pero el sistema actual no refleja claramente esta estructura:

### 4 Pilares Identificados:
1. **Usuario Final/Familiar** - Personas que realizan chequeos biométricos
2. **Empresa Asegurada** - Empresas que contratan seguros para sus empleados
3. **Aseguradora** - Compañías de seguros que venden pólizas (tenants)
4. **Administrador de Plataforma** - Controla tenants y configuración global

## Problemas en la Arquitectura Actual

### 1. Roles de Usuario Insuficientes
```javascript
// ACTUAL - Solo 4 roles básicos
USER_ROLES = {
  INDIVIDUAL: 'individual',
  COMPANY_ADMIN: 'company_admin', 
  INSURANCE_ADMIN: 'insurance_admin',
  SYSTEM_ADMIN: 'system_admin'
}
```

### 2. Estructura de Base de Datos Confusa
- La tabla `user_profiles` mezcla conceptos
- No hay clara separación entre tipos de entidades
- Falta jerarquía clara tenant → company → user

### 3. Configuración Inicial Limitada
- Solo se crean 2 usuarios de prueba
- No representa los 4 pilares claramente
- Falta demostración de flujos completos

## Solución Propuesta - Arquitectura de 4 Pilares

### 1. Redefinición de Roles
```javascript
// NUEVO - 4 pilares claramente definidos
USER_PILLARS = {
  // Pilar 1: Usuario Final/Familiar
  END_USER: 'end_user',
  FAMILY_MEMBER: 'family_member',
  
  // Pilar 2: Empresa Asegurada  
  COMPANY_EMPLOYEE: 'company_employee',
  COMPANY_ADMIN: 'company_admin',
  COMPANY_HR: 'company_hr',
  
  // Pilar 3: Aseguradora (Tenant)
  INSURANCE_AGENT: 'insurance_agent',
  INSURANCE_ADMIN: 'insurance_admin',
  INSURANCE_UNDERWRITER: 'insurance_underwriter',
  
  // Pilar 4: Administrador de Plataforma
  PLATFORM_ADMIN: 'platform_admin',
  PLATFORM_SUPPORT: 'platform_support'
}
```

### 2. Estructura de Datos Mejorada

#### Jerarquía Clara:
```
PLATFORM (Sistema)
├── TENANTS (Aseguradoras - Pilar 3)
│   ├── COMPANIES (Empresas Aseguradas - Pilar 2)
│   │   ├── EMPLOYEES (Usuarios Finales - Pilar 1)
│   │   └── FAMILY_MEMBERS (Familiares - Pilar 1)
│   └── INSURANCE_STAFF (Personal Aseguradora - Pilar 3)
└── PLATFORM_ADMINS (Administradores - Pilar 4)
```

#### Tablas Rediseñadas:
- `platform_admins` - Administradores del sistema (Pilar 4)
- `tenants` - Aseguradoras (Pilar 3)
- `tenant_staff` - Personal de aseguradoras (Pilar 3)
- `companies` - Empresas aseguradas (Pilar 2)
- `company_staff` - Personal de empresas (Pilar 2)
- `end_users` - Usuarios finales y familiares (Pilar 1)

### 3. Configuración Inicial Completa

#### 4 Usuarios de Demostración:
1. **Administrador Plataforma**: `admin@holocheck.com` / `HoloAdmin2024!`
2. **Administrador Aseguradora**: `seguro@demo-insurance.com` / `InsuranceAdmin2024!`
3. **Administrador Empresa**: `empresa@demo-company.com` / `CompanyAdmin2024!`
4. **Usuario Final**: `usuario@demo-family.com` / `EndUser2024!`

## Implementación Requerida

### Fase 1: Rediseño de Base de Datos
- Crear nuevas tablas para separar pilares
- Migrar datos existentes
- Actualizar relaciones y constraints

### Fase 2: Actualización de Autenticación
- Redefinir roles y permisos
- Actualizar AuthService
- Implementar flujos de login específicos

### Fase 3: Interfaces de Usuario Diferenciadas
- Dashboard específico por pilar
- Navegación contextual
- Permisos granulares

### Fase 4: Datos de Demostración
- Crear 4 usuarios representativos
- Configurar tenant, empresa y familia demo
- Poblar con datos de ejemplo

## Beneficios de la Nueva Arquitectura

1. **Claridad Conceptual** - Cada pilar tiene su propósito claro
2. **Escalabilidad** - Fácil agregar nuevos roles dentro de cada pilar
3. **Seguridad** - Aislamiento claro entre niveles
4. **Usabilidad** - Interfaces específicas por tipo de usuario
5. **Mantenimiento** - Código más organizado y comprensible

## Próximos Pasos

1. ¿Aprobar el rediseño de arquitectura de 4 pilares?
2. ¿Proceder con la implementación de nuevas tablas?
3. ¿Crear los 4 usuarios de demostración?
4. ¿Actualizar interfaces de usuario por pilar?