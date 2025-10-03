import { supabase } from './supabaseClient.js';
import { encryptPHI, decryptPHI } from '../../utils/encryption.js';

/**
 * Authentication service with FOUR-PILLAR access control
 * PILAR 1: Usuario Final/Familiar - Personas individuales
 * PILAR 2: Empresa Asegurada - Administradores de empresas aseguradas
 * PILAR 3: Aseguradora - Compañías de seguros y sus colaboradores
 * PILAR 4: Administrador de Plataforma - Control total del sistema
 */

export const USER_ROLES = {
  INDIVIDUAL: 'individual',           // Pilar 1: Usuario Final/Familiar
  COMPANY_ADMIN: 'company_admin',     // Pilar 2: Administrador de Empresa
  COMPANY_EMPLOYEE: 'company_employee', // Pilar 2: Empleado de Empresa
  INSURANCE_ADMIN: 'insurance_admin', // Pilar 3: Administrador de Aseguradora
  INSURANCE_EMPLOYEE: 'insurance_employee', // Pilar 3: Colaborador de Aseguradora
  PLATFORM_ADMIN: 'platform_admin'   // Pilar 4: Administrador de Plataforma
};

export const PILLAR_TYPES = {
  END_USER: 'end_user',              // Pilar 1
  INSURED_COMPANY: 'insured_company', // Pilar 2
  INSURANCE_COMPANY: 'insurance_company', // Pilar 3
  PLATFORM_ADMIN: 'platform_admin'   // Pilar 4
};

export const PERMISSION_LEVELS = {
  READ_OWN: 'read_own',
  READ_COMPANY: 'read_company',
  READ_AGGREGATED: 'read_aggregated',
  READ_ANONYMIZED: 'read_anonymized',
  WRITE_OWN: 'write_own',
  WRITE_COMPANY: 'write_company',
  WRITE_INSURANCE: 'write_insurance',
  ADMIN_ALL: 'admin_all'
};

// Sign up new user with four-pillar role-based access
export const signUp = async (email, password, userData) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: userData.role || USER_ROLES.INDIVIDUAL,
          full_name: userData.fullName,
          pillar_type: userData.pillarType || PILLAR_TYPES.END_USER,
          organization: userData.organization || null
        }
      }
    });

    if (authError) throw authError;

    // Create user profile with encrypted PHI
    if (authData.user) {
      const encryptedProfile = encryptPHI({
        user_id: authData.user.id,
        email: email,
        full_name: userData.fullName,
        date_of_birth: userData.dateOfBirth,
        phone_number: userData.phoneNumber,
        emergency_contact: userData.emergencyContact,
        medical_conditions: userData.medicalConditions || [],
        organization: userData.organization,
        department: userData.department,
        employee_id: userData.employeeId
      });

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          pillar_type: userData.pillarType || PILLAR_TYPES.END_USER,
          role: userData.role || USER_ROLES.INDIVIDUAL,
          company_id: userData.companyId || null,
          insurance_company_id: userData.insuranceCompanyId || null,
          encrypted_personal_data: encryptedProfile,
          hipaa_consent: userData.hipaaConsent || false,
          hipaa_consent_date: userData.hipaaConsent ? new Date().toISOString() : null,
          data_retention_consent: userData.dataRetentionConsent || false,
          data_retention_date: userData.dataRetentionConsent ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, profile can be created later
      }
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in with four-pillar role validation
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch user profile and role
    const userProfile = await getUserProfile(data.user.id);
    
    // Log authentication event for HIPAA audit
    await logAuditEvent({
      user_id: data.user.id,
      action: 'AUTH_LOGIN',
      resource_type: 'authentication',
      details: {
        pillar_type: userProfile?.pillar_type,
        role: userProfile?.role,
        email: email
      },
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      success: true
    });

    return { 
      user: data.user, 
      session: data.session, 
      profile: userProfile 
    };
  } catch (error) {
    // Log failed authentication attempt
    await logAuditEvent({
      action: 'AUTH_LOGIN_FAILED',
      resource_type: 'authentication',
      details: { email, error: error.message },
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      success: false
    });
    
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out with audit logging
export const signOut = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Log sign out event
    if (user) {
      await logAuditEvent({
        user_id: user.id,
        action: 'AUTH_LOGOUT',
        resource_type: 'authentication',
        ip_address: await getClientIP(),
        success: true
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user profile with decrypted PHI
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        companies!company_id(id, name, company_code),
        insurance_companies!insurance_company_id(id, name, license_number)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Decrypt PHI data
    const decryptedProfile = data.encrypted_personal_data ? 
      decryptPHI(data.encrypted_personal_data) : {};

    return {
      ...data,
      profile_data: decryptedProfile
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

// Check user permissions for specific actions based on four pillars
export const checkPermission = async (userId, action, resourceType) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    const role = profile.role;
    const pillarType = profile.pillar_type;
    
    // Define permission matrix for four pillars
    const permissions = {
      // PILAR 1: Usuario Final/Familiar
      [USER_ROLES.INDIVIDUAL]: [
        PERMISSION_LEVELS.READ_OWN,
        PERMISSION_LEVELS.WRITE_OWN
      ],
      
      // PILAR 2: Empresa Asegurada
      [USER_ROLES.COMPANY_ADMIN]: [
        PERMISSION_LEVELS.READ_OWN,
        PERMISSION_LEVELS.READ_COMPANY,
        PERMISSION_LEVELS.READ_AGGREGATED,
        PERMISSION_LEVELS.WRITE_OWN,
        PERMISSION_LEVELS.WRITE_COMPANY
      ],
      [USER_ROLES.COMPANY_EMPLOYEE]: [
        PERMISSION_LEVELS.READ_OWN,
        PERMISSION_LEVELS.READ_COMPANY,
        PERMISSION_LEVELS.WRITE_OWN
      ],
      
      // PILAR 3: Aseguradora
      [USER_ROLES.INSURANCE_ADMIN]: [
        PERMISSION_LEVELS.READ_ANONYMIZED,
        PERMISSION_LEVELS.READ_AGGREGATED,
        PERMISSION_LEVELS.WRITE_INSURANCE
      ],
      [USER_ROLES.INSURANCE_EMPLOYEE]: [
        PERMISSION_LEVELS.READ_ANONYMIZED,
        PERMISSION_LEVELS.READ_AGGREGATED
      ],
      
      // PILAR 4: Administrador de Plataforma
      [USER_ROLES.PLATFORM_ADMIN]: [
        PERMISSION_LEVELS.ADMIN_ALL
      ]
    };

    return permissions[role]?.includes(action) || false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Get dashboard route based on user pillar and role
export const getDashboardRoute = (profile) => {
  if (!profile) return '/login';
  
  const { pillar_type, role } = profile;
  
  switch (pillar_type) {
    case PILLAR_TYPES.END_USER:
      return '/dashboard/individual';
    
    case PILLAR_TYPES.INSURED_COMPANY:
      return role === USER_ROLES.COMPANY_ADMIN ? 
        '/dashboard/company-admin' : '/dashboard/company-employee';
    
    case PILLAR_TYPES.INSURANCE_COMPANY:
      return role === USER_ROLES.INSURANCE_ADMIN ? 
        '/dashboard/insurance-admin' : '/dashboard/insurance-employee';
    
    case PILLAR_TYPES.PLATFORM_ADMIN:
      return '/dashboard/platform-admin';
    
    default:
      return '/dashboard';
  }
};

// Log audit events for HIPAA compliance with pillar tracking
export const logAuditEvent = async (eventData) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: eventData.user_id || null,
        event_type: eventData.event_type || 'data_access',
        table_name: eventData.resource_type,
        record_id: eventData.resource_id || null,
        user_role: eventData.user_role || 'unknown',
        action_performed: eventData.action,
        data_accessed: eventData.details || {},
        access_reason: eventData.access_reason || 'routine_access',
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent || navigator.userAgent,
        session_id: eventData.session_id || null,
        timestamp: new Date().toISOString(),
        phi_accessed: eventData.phi_accessed || false,
        minimum_necessary_standard: eventData.minimum_necessary !== false,
        business_justification: eventData.business_justification || null
      });

    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Get client IP address for audit logging
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

// Refresh session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Refresh session error:', error);
    throw error;
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getUserProfile,
  checkPermission,
  getDashboardRoute,
  logAuditEvent,
  getCurrentSession,
  refreshSession,
  USER_ROLES,
  PILLAR_TYPES,
  PERMISSION_LEVELS
};