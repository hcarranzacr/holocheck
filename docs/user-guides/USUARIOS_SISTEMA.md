# 🔐 **CREDENCIALES DE ACCESO - SISTEMA HOLOCHECK**

## 📋 **USUARIOS CREADOS EN EL SISTEMA**

### **🏢 TENANT DEMO CREADO:**
- **Nombre:** Demo Insurance Company
- **Dominio:** demo.holocheck.com
- **Slug:** demo-insurance
- **Email de Facturación:** admin@demo.holocheck.com

### **👥 USUARIOS DE ACCESO:**

**IMPORTANTE:** El sistema utiliza **Supabase Authentication**, por lo que los usuarios se crean a través del panel de Supabase Auth, NO directamente en la base de datos.

## 🚀 **CÓMO CREAR USUARIOS DE ACCESO:**

### **Método 1: A través de Supabase Dashboard**
1. Ir a Supabase Dashboard → Authentication → Users
2. Hacer clic en "Add User"
3. Crear usuarios con estos datos:

**USUARIO ADMINISTRADOR:**
- Email: `admin@demo.holocheck.com`
- Password: `HoloCheck2024!`
- Role: `admin`

**USUARIO REGULAR:**
- Email: `user@demo.holocheck.com`
- Password: `Demo2024!`
- Role: `employee`

### **Método 2: A través del Sistema de Registro**
1. Ir a la aplicación: `http://localhost:3001`
2. Usar el formulario de registro
3. Completar datos requeridos
4. Confirmar email (si está configurado)

## 🔑 **CREDENCIALES RECOMENDADAS:**

### **ADMIN:**
```
Email: admin@demo.holocheck.com
Password: HoloCheck2024!
Rol: Administrador del Sistema
Permisos: Acceso completo a todas las funciones
```

### **USUARIO DEMO:**
```
Email: user@demo.holocheck.com
Password: Demo2024!
Rol: Usuario Regular/Empleado
Permisos: Acceso a análisis biométrico y dashboard personal
```

## 🌐 **URLs DE ACCESO:**

- **Aplicación Principal:** http://localhost:3001/
- **Panel de Administración:** http://localhost:3001/admin
- **Portal de Login:** http://localhost:3001/login
- **Dashboard:** http://localhost:3001/dashboard

## ⚙️ **CONFIGURACIÓN REQUERIDA:**

1. **Base de Datos:** Ejecutar script `01-database-creation.sql`
2. **Supabase:** Configurar proyecto y obtener credenciales
3. **Variables de Entorno:** Configurar `.env.local` con:
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

## 🔧 **ROLES DEL SISTEMA:**

- **`admin`** - Administrador completo
- **`insurance_admin`** - Administrador de aseguradora
- **`company_admin`** - Administrador de empresa
- **`employee`** - Usuario empleado
- **`individual`** - Usuario individual

## 📞 **SOPORTE:**

Si los usuarios no funcionan:
1. Verificar que Supabase esté configurado correctamente
2. Confirmar que la base de datos tenga las 11 tablas creadas
3. Revisar que las variables de entorno estén configuradas
4. Crear usuarios manualmente en Supabase Auth si es necesario

---

**Última actualización:** $(date)
**Estado:** Usuarios listos para creación manual en Supabase