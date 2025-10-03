/**
 * HOLOCHECK - CREACIÓN DE USUARIOS DE 4 PILARES
 * 
 * Este script crea 4 usuarios de demostración representando cada pilar:
 * 1. Administrador de Plataforma (Pilar 4)
 * 2. Administrador de Aseguradora (Pilar 3) 
 * 3. Administrador de Empresa (Pilar 2)
 * 4. Usuario Final (Pilar 1)
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usar variables de entorno en producción)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

// Cliente con permisos de administrador
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Definición de los 4 usuarios pilares
const PILLAR_USERS = [
  {
    // PILAR 4: Administrador de Plataforma
    pillar: 'platform_admin',
    email: 'admin@holocheck.com',
    password: 'HoloAdmin2024!',
    userData: {
      full_name: 'Administrador Sistema',
      role: 'platform_admin',
      is_super_admin: true,
      permissions: {
        manage_tenants: true,
        manage_system_config: true,
        view_all_data: true,
        manage_platform_users: true
      }
    }
  },
  {
    // PILAR 3: Administrador de Aseguradora
    pillar: 'tenant_staff',
    email: 'seguro@demo-insurance.com',
    password: 'InsuranceAdmin2024!',
    userData: {
      full_name: 'Director Aseguradora Demo',
      role: 'insurance_admin',
      department: 'Administración',
      position: 'Director General',
      permissions: {
        manage_companies: true,
        view_analytics: true,
        manage_policies: true,
        manage_staff: true
      }
    }
  },
  {
    // PILAR 2: Administrador de Empresa
    pillar: 'company_staff',
    email: 'empresa@demo-company.com',
    password: 'CompanyAdmin2024!',
    userData: {
      full_name: 'Gerente RH Demo Corp',
      employee_id: 'EMP-001',
      role: 'company_admin',
      department: 'Recursos Humanos',
      position: 'Gerente de RH',
      permissions: {
        manage_employees: true,
        view_company_analytics: true,
        manage_health_programs: true
      }
    }
  },
  {
    // PILAR 1: Usuario Final
    pillar: 'end_user',
    email: 'usuario@demo-family.com',
    password: 'EndUser2024!',
    userData: {
      full_name: 'Juan Pérez Familia',
      user_type: 'end_user',
      relationship: 'self',
      date_of_birth: '1985-06-15',
      gender: 'male',
      phone: '+52-555-0199',
      hipaa_consent: true,
      data_sharing_consent: true,
      privacy_settings: {
        share_with_family: true,
        share_with_company: true,
        share_with_insurance: false
      }
    }
  }
];

/**
 * Función principal para crear usuarios de los 4 pilares
 */
async function createFourPillarUsers() {
  console.log('🚀 INICIANDO CREACIÓN DE USUARIOS DE 4 PILARES...\n');
  
  try {
    // Obtener IDs de tenant y company demo
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'demo-insurance')
      .single();
    
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('company_code', 'DEMO-CORP')
      .single();
    
    if (!tenant) {
      throw new Error('Demo tenant not found. Run database creation script first.');
    }
    
    if (!company) {
      throw new Error('Demo company not found. Run database creation script first.');
    }
    
    console.log(`✅ Demo tenant ID: ${tenant.id}`);
    console.log(`✅ Demo company ID: ${company.id}\n`);
    
    // Crear cada usuario
    for (const userConfig of PILLAR_USERS) {
      await createPillarUser(userConfig, tenant.id, company.id);
    }
    
    console.log('\n🎉 ¡TODOS LOS USUARIOS DE 4 PILARES CREADOS EXITOSAMENTE!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('=====================================');
    
    PILLAR_USERS.forEach((user, index) => {
      console.log(`${index + 1}. ${user.userData.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Pilar: ${user.pillar}`);
      console.log(`   Rol: ${user.userData.role || user.userData.user_type}`);
      console.log('   -------------------');
    });
    
    console.log('\n🌐 URLs de Acceso:');
    console.log('- Aplicación: http://localhost:3001/');
    console.log('- Admin Panel: http://localhost:3001/admin');
    console.log('\n✨ ¡Sistema listo para usar con los 4 pilares!');
    
  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
    process.exit(1);
  }
}

/**
 * Crear un usuario específico de un pilar
 */
async function createPillarUser(userConfig, tenantId, companyId) {
  const { pillar, email, password, userData } = userConfig;
  
  console.log(`👤 Creando usuario ${pillar}: ${userData.full_name}...`);
  
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        pillar: pillar,
        role: userData.role || userData.user_type
      }
    });
    
    if (authError) throw authError;
    
    console.log(`   ✅ Usuario auth creado: ${authUser.user.id}`);
    
    // 2. Crear perfil en tabla específica del pilar
    let profileData = {
      user_id: authUser.user.id,
      full_name: userData.full_name,
      email: email,
      ...userData
    };
    
    // Agregar IDs específicos según el pilar
    if (pillar === 'tenant_staff' || pillar === 'company_staff' || pillar === 'end_user') {
      profileData.tenant_id = tenantId;
    }
    
    if (pillar === 'company_staff' || (pillar === 'end_user' && userData.user_type === 'end_user')) {
      profileData.company_id = companyId;
    }
    
    // Insertar en tabla correspondiente
    const tableName = pillar === 'platform_admin' ? 'platform_admins' : 
                     pillar === 'tenant_staff' ? 'tenant_staff' :
                     pillar === 'company_staff' ? 'company_staff' : 'end_users';
    
    const { error: profileError } = await supabase
      .from(tableName)
      .insert(profileData);
    
    if (profileError) throw profileError;
    
    console.log(`   ✅ Perfil creado en tabla: ${tableName}`);
    
    // 3. Log de auditoría
    await supabase.from('audit_logs').insert({
      tenant_id: pillar === 'platform_admin' ? null : tenantId,
      event_type: 'USER_CREATED',
      table_name: tableName,
      user_id: authUser.user.id,
      user_role: userData.role || userData.user_type,
      action_performed: `Created ${pillar} user: ${userData.full_name}`,
      data_accessed: { email, pillar, role: userData.role || userData.user_type },
      access_reason: 'Initial system setup',
      phi_accessed: false,
      minimum_necessary_standard: true,
      business_justification: 'Demo user creation for 4-pillar architecture'
    });
    
    console.log(`   ✅ Usuario ${pillar} creado exitosamente\n`);
    
  } catch (error) {
    console.error(`   ❌ Error creando usuario ${pillar}:`, error.message);
    throw error;
  }
}

/**
 * Verificar que las tablas de pilares existen
 */
async function verifyPillarTables() {
  const tables = ['platform_admins', 'tenant_staff', 'company_staff', 'end_users'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      throw new Error(`Table ${table} not found. Run 05-four-pillars-redesign.sql first.`);
    }
  }
  
  console.log('✅ Todas las tablas de pilares verificadas\n');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPillarTables()
    .then(() => createFourPillarUsers())
    .catch(console.error);
}

export { createFourPillarUsers, PILLAR_USERS };