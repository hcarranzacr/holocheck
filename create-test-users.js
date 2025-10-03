/**
 * SCRIPT PARA CREAR USUARIOS DE PRUEBA - HOLOCHECK
 * 
 * Este script crea dos usuarios de prueba en Supabase Auth y sus perfiles correspondientes
 * 
 * CREDENCIALES:
 * - Admin: admin@holocheck.com / HoloAdmin2024!
 * - Usuario: user@holocheck.com / HoloUser2024!
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usar variables de entorno reales)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

// Cliente con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('🚀 INICIANDO CREACIÓN DE USUARIOS DE PRUEBA...');
  
  try {
    // Obtener el tenant demo
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('slug', 'demo-insurance')
      .single();

    if (tenantError || !tenant) {
      console.error('❌ Error: No se encontró el tenant demo. Ejecuta primero el script de base de datos.');
      return;
    }

    console.log('✅ Tenant demo encontrado:', tenant.id);

    // Crear empresa demo para los usuarios
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .upsert({
        tenant_id: tenant.id,
        name: 'Demo Company',
        company_code: 'DEMO-001',
        industry: 'Technology',
        contact_email: 'contact@democompany.com',
        employee_count: 50,
        size_category: 'medium'
      }, { 
        onConflict: 'tenant_id,company_code',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Error creando empresa demo:', companyError);
      return;
    }

    console.log('✅ Empresa demo creada/encontrada:', company.id);

    // USUARIO 1: ADMINISTRADOR
    console.log('\n👤 CREANDO USUARIO ADMINISTRADOR...');
    
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@holocheck.com',
      password: 'HoloAdmin2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador HoloCheck',
        role: 'SYSTEM_ADMIN'
      }
    });

    if (adminError) {
      console.error('❌ Error creando admin:', adminError);
    } else {
      console.log('✅ Usuario admin creado:', adminUser.user.id);

      // Crear perfil de admin
      const { error: adminProfileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: adminUser.user.id,
          tenant_id: tenant.id,
          company_id: company.id,
          role: 'admin',
          employee_id: 'ADMIN-001',
          department: 'Administration',
          position: 'System Administrator',
          hipaa_consent: true,
          data_sharing_consent: true,
          is_active: true
        }, { onConflict: 'user_id' });

      if (adminProfileError) {
        console.error('❌ Error creando perfil admin:', adminProfileError);
      } else {
        console.log('✅ Perfil admin creado exitosamente');
      }
    }

    // USUARIO 2: USUARIO REGULAR
    console.log('\n👤 CREANDO USUARIO REGULAR...');
    
    const { data: regularUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'user@holocheck.com',
      password: 'HoloUser2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario Demo',
        role: 'INDIVIDUAL'
      }
    });

    if (userError) {
      console.error('❌ Error creando usuario:', userError);
    } else {
      console.log('✅ Usuario regular creado:', regularUser.user.id);

      // Crear perfil de usuario regular
      const { error: userProfileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: regularUser.user.id,
          tenant_id: tenant.id,
          company_id: company.id,
          role: 'employee',
          employee_id: 'EMP-001',
          department: 'General',
          position: 'Employee',
          hipaa_consent: true,
          data_sharing_consent: true,
          is_active: true
        }, { onConflict: 'user_id' });

      if (userProfileError) {
        console.error('❌ Error creando perfil usuario:', userProfileError);
      } else {
        console.log('✅ Perfil usuario creado exitosamente');
      }
    }

    console.log('\n🎉 USUARIOS DE PRUEBA CREADOS EXITOSAMENTE!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ ADMINISTRADOR                           │');
    console.log('│ Email: admin@holocheck.com              │');
    console.log('│ Password: HoloAdmin2024!                │');
    console.log('│ Rol: System Administrator               │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ USUARIO REGULAR                         │');
    console.log('│ Email: user@holocheck.com               │');
    console.log('│ Password: HoloUser2024!                 │');
    console.log('│ Rol: Employee                           │');
    console.log('└─────────────────────────────────────────┘');
    console.log('\n🌐 ACCESO AL SISTEMA:');
    console.log('• Aplicación: http://localhost:3001/');
    console.log('• Panel Admin: http://localhost:3001/admin');
    console.log('• Login: http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers();
}

export default createTestUsers;