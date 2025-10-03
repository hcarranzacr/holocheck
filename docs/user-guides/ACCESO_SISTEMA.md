# 🔐 **ACCESO AL SISTEMA HOLOCHECK**

## 👥 **CREDENCIALES DE USUARIOS DE PRUEBA**

### **🔧 ADMINISTRADOR DEL SISTEMA**
```
Email: admin@holocheck.com
Password: HoloAdmin2024!
Rol: System Administrator
Permisos: Acceso completo a todas las funciones
```

### **👤 USUARIO REGULAR**
```
Email: user@holocheck.com
Password: HoloUser2024!
Rol: Employee
Permisos: Acceso a análisis biométrico y dashboard personal
```

## 🌐 **URLS DE ACCESO**

| Función | URL | Descripción |
|---------|-----|-------------|
| **Aplicación Principal** | http://localhost:3001/ | Página principal con login |
| **Panel de Administración** | http://localhost:3001/admin | Panel administrativo (solo admin) |
| **Dashboard** | http://localhost:3001/dashboard | Dashboard principal |
| **Portal de Login** | http://localhost:3001/login | Formulario de autenticación |

## 🚀 **PROCESO DE ACCESO**

### **Paso 1: Iniciar la Aplicación**
```bash
cd /workspace/dashboard
pnpm run dev
```

### **Paso 2: Acceder al Sistema**
1. Abrir navegador en `http://localhost:3001/`
2. Hacer clic en "Iniciar Sesión" o ir directamente a `/login`
3. Introducir credenciales (email y contraseña)
4. Hacer clic en "Iniciar Sesión"

### **Paso 3: Navegación por Roles**

**ADMINISTRADOR (`admin@holocheck.com`):**
- ✅ Acceso al panel de administración
- ✅ Gestión de tenants y empresas
- ✅ Configuración del sistema
- ✅ Gestión de usuarios
- ✅ Análisis biométrico completo

**USUARIO REGULAR (`user@holocheck.com`):**
- ✅ Dashboard personal
- ✅ Análisis biométrico individual
- ✅ Historial de análisis
- ❌ Panel de administración (restringido)

## 🔧 **CONFIGURACIÓN REQUERIDA**

### **Variables de Entorno (.env.local)**
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### **Base de Datos**
- ✅ Ejecutar script: `01-database-creation.sql`
- ✅ Verificar 11 tablas creadas
- ✅ Tenant demo configurado
- ✅ Usuarios de prueba creados

## 🛠️ **CREAR USUARIOS (SI NO EXISTEN)**

### **Opción 1: Script Automático**
```bash
cd /workspace/dashboard
node create-test-users.js
```

### **Opción 2: Supabase Dashboard**
1. Ir a Supabase Dashboard → Authentication → Users
2. Hacer clic en "Add User"
3. Crear usuarios con las credenciales indicadas arriba
4. Confirmar email automáticamente

### **Opción 3: Registro Manual**
1. Ir a `http://localhost:3001/`
2. Usar formulario de registro
3. Completar datos requeridos
4. Confirmar registro

## 🔍 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Invalid login credentials"**
- Verificar que los usuarios estén creados en Supabase Auth
- Confirmar que las credenciales sean exactamente las indicadas
- Verificar conexión a Supabase

### **Error: "User profile not found"**
- Verificar que existan registros en tabla `user_profiles`
- Ejecutar script de creación de usuarios
- Verificar que el tenant demo exista

### **Error: "Access denied"**
- Verificar roles en tabla `user_profiles`
- Confirmar políticas RLS en Supabase
- Verificar permisos de usuario

## 📞 **SOPORTE**

Si tienes problemas de acceso:

1. **Verificar Base de Datos:**
   ```sql
   SELECT COUNT(*) FROM tenants;
   SELECT COUNT(*) FROM user_profiles;
   ```

2. **Verificar Usuarios en Supabase:**
   - Dashboard → Authentication → Users
   - Confirmar que existen los 2 usuarios

3. **Verificar Aplicación:**
   - Confirmar que `pnpm run dev` esté ejecutándose
   - Verificar puerto 3001 disponible
   - Revisar consola del navegador para errores

---

## 🎯 **RESUMEN RÁPIDO**

**PARA ACCESO INMEDIATO:**
1. Ir a: http://localhost:3001/
2. Login Admin: `admin@holocheck.com` / `HoloAdmin2024!`
3. Login Usuario: `user@holocheck.com` / `HoloUser2024!`

**¡El sistema está listo para usar!** 🚀