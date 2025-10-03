// Tenant Management Service - Multi-tenant Operations
import { supabase } from './supabaseClient';

class TenantManager {
  constructor() {
    this.requiredTables = [
      'tenants',
      'parameter_categories',
      'tenant_parameters',
      'companies', 
      'user_profiles',
      'biometric_data',
      'analysis_results',
      'audit_logs',
      'system_config',
      'tenant_config',
      'company_config'
    ];
  }

  /**
   * Create new tenant with complete setup
   */
  async createTenant(tenantData) {
    try {
      console.log('🏢 Creating new tenant:', tenantData.name);
      
      // Generate slug from name if not provided
      const slug = tenantData.slug || tenantData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // 1. Create tenant record
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: tenantData.name,
          slug: slug,
          domain: tenantData.domain,
          license_number: tenantData.license_number || `LIC-${Date.now()}`,
          regulatory_body: tenantData.regulatory_body || 'General',
          subscription_plan: tenantData.subscription_plan || 'basic',
          billing_email: tenantData.billing_email || tenantData.email,
          settings: tenantData.settings || {},
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Tenant creation error:', tenantError);
        throw tenantError;
      }

      console.log('✅ Tenant record created:', tenant.id);

      // 2. Initialize tenant parameters
      await this.initializeTenantParameters(tenant.id);

      // 3. Create default company for tenant
      if (tenantData.defaultCompany) {
        await this.createDefaultCompany(tenant.id, tenantData.defaultCompany);
      }

      console.log('✅ Tenant created successfully:', tenant.id);
      return { success: true, tenant, message: 'Tenant created successfully' };

    } catch (error) {
      console.error('❌ Error creating tenant:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.details || 'Unknown error during tenant creation'
      };
    }
  }

  /**
   * Reset tenant - Clear all data but keep structure
   */
  async resetTenant(tenantId, options = {}) {
    try {
      console.log('🔄 Resetting tenant:', tenantId);
      
      const resetOperations = [];
      
      // Define tables to clear in order (respecting foreign keys)
      const tablesToClear = [
        'audit_logs',
        'analysis_results', 
        'biometric_data',
        'user_profiles',
        'companies'
      ];

      // Clear data from each table
      for (const table of tablesToClear) {
        if (!options.preserveUsers || table !== 'user_profiles') {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('tenant_id', tenantId);
          
          if (error) throw error;
          resetOperations.push(`Cleared ${table}`);
        }
      }

      // Reset tenant parameters to defaults if requested
      if (options.resetParameters) {
        await this.resetTenantParameters(tenantId);
        resetOperations.push('Reset parameters to defaults');
      }

      // Update tenant status
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ 
          updated_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', tenantId);

      if (updateError) throw updateError;

      console.log('✅ Tenant reset completed:', resetOperations);
      return { 
        success: true, 
        operations: resetOperations,
        message: `Tenant ${tenantId} reset successfully`
      };

    } catch (error) {
      console.error('❌ Error resetting tenant:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize tenant parameters with defaults
   */
  async initializeTenantParameters(tenantId) {
    try {
      console.log('⚙️ Initializing tenant parameters for:', tenantId);

      // Default parameter categories
      const defaultCategories = [
        { name: 'biometric_thresholds', description: 'Biometric analysis thresholds' },
        { name: 'ui_settings', description: 'User interface configurations' },
        { name: 'notification_settings', description: 'Notification preferences' },
        { name: 'security_settings', description: 'Security and privacy settings' },
        { name: 'integration_settings', description: 'Third-party integrations' }
      ];

      // Create parameter categories
      for (const category of defaultCategories) {
        const { error } = await supabase
          .from('parameter_categories')
          .insert({
            tenant_id: tenantId,
            name: category.name,
            description: category.description,
            created_at: new Date().toISOString()
          });
        
        if (error && !error.message.includes('duplicate')) {
          console.warn('Warning creating category:', error.message);
        }
      }

      // Default tenant parameters
      const defaultParameters = [
        // Biometric thresholds
        { category: 'biometric_thresholds', key: 'heart_rate_min', value: '60', type: 'number' },
        { category: 'biometric_thresholds', key: 'heart_rate_max', value: '100', type: 'number' },
        { category: 'biometric_thresholds', key: 'confidence_threshold', value: '0.8', type: 'number' },
        
        // UI settings
        { category: 'ui_settings', key: 'theme', value: 'light', type: 'string' },
        { category: 'ui_settings', key: 'language', value: 'es', type: 'string' },
        { category: 'ui_settings', key: 'dashboard_refresh_interval', value: '30', type: 'number' },
        
        // Notification settings
        { category: 'notification_settings', key: 'email_notifications', value: 'true', type: 'boolean' },
        { category: 'notification_settings', key: 'sms_notifications', value: 'false', type: 'boolean' },
        
        // Security settings
        { category: 'security_settings', key: 'session_timeout', value: '3600', type: 'number' },
        { category: 'security_settings', key: 'require_2fa', value: 'false', type: 'boolean' },
        
        // Integration settings
        { category: 'integration_settings', key: 'anuralogix_enabled', value: 'true', type: 'boolean' },
        { category: 'integration_settings', key: 'openai_enabled', value: 'true', type: 'boolean' }
      ];

      // Insert default parameters
      for (const param of defaultParameters) {
        const { error } = await supabase
          .from('tenant_parameters')
          .insert({
            tenant_id: tenantId,
            category: param.category,
            parameter_key: param.key,
            parameter_value: param.value,
            parameter_type: param.type,
            created_at: new Date().toISOString()
          });
        
        if (error && !error.message.includes('duplicate')) {
          console.warn('Warning creating parameter:', error.message);
        }
      }

      console.log('✅ Tenant parameters initialized');
      return { success: true };

    } catch (error) {
      console.error('❌ Error initializing tenant parameters:', error);
      throw error;
    }
  }

  /**
   * Reset tenant parameters to defaults
   */
  async resetTenantParameters(tenantId) {
    try {
      // Delete existing parameters
      const { error: deleteError } = await supabase
        .from('tenant_parameters')
        .delete()
        .eq('tenant_id', tenantId);

      if (deleteError) throw deleteError;

      // Reinitialize with defaults
      await this.initializeTenantParameters(tenantId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error resetting tenant parameters:', error);
      throw error;
    }
  }

  /**
   * Create default company for tenant
   */
  async createDefaultCompany(tenantId, companyData) {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          tenant_id: tenantId,
          name: companyData.name,
          company_code: companyData.code || 'DEFAULT',
          industry: companyData.industry || 'Healthcare',
          employee_count: companyData.employee_count || 0,
          contact_email: companyData.email || companyData.contact_email,
          settings: companyData.settings || {},
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Default company created:', company.id);
      return company;
    } catch (error) {
      console.error('❌ Error creating default company:', error);
      throw error;
    }
  }

  /**
   * Get tenant configuration and parameters
   */
  async getTenantConfig(tenantId) {
    try {
      // Get tenant info
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Get tenant parameters
      const { data: parameters, error: paramError } = await supabase
        .from('tenant_parameters')
        .select('*')
        .eq('tenant_id', tenantId);

      if (paramError) throw paramError;

      // Get companies count
      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get users count
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      return {
        success: true,
        tenant,
        parameters: parameters || [],
        stats: {
          companies: companiesCount || 0,
          users: usersCount || 0
        }
      };

    } catch (error) {
      console.error('❌ Error getting tenant config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update tenant parameter
   */
  async updateTenantParameter(tenantId, category, key, value, type = 'string') {
    try {
      const { data, error } = await supabase
        .from('tenant_parameters')
        .upsert({
          tenant_id: tenantId,
          category,
          parameter_key: key,
          parameter_value: value,
          parameter_type: type,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      return { success: true, parameter: data[0] };
    } catch (error) {
      console.error('❌ Error updating tenant parameter:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all tenants with stats
   */
  async getAllTenants() {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get stats for each tenant
      const tenantsWithStats = await Promise.all(
        tenants.map(async (tenant) => {
          const { count: companiesCount } = await supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          const { count: usersCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

          return {
            ...tenant,
            stats: {
              companies: companiesCount || 0,
              users: usersCount || 0
            }
          };
        })
      );

      return { success: true, tenants: tenantsWithStats };
    } catch (error) {
      console.error('❌ Error getting all tenants:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete tenant completely
   */
  async deleteTenant(tenantId, confirmation) {
    if (confirmation !== `DELETE_${tenantId}`) {
      return { success: false, error: 'Invalid confirmation code' };
    }

    try {
      console.log('🗑️ Deleting tenant:', tenantId);

      // Delete in reverse order of dependencies
      const tablesToDelete = [
        'audit_logs',
        'analysis_results',
        'biometric_data', 
        'user_profiles',
        'companies',
        'tenant_parameters',
        'parameter_categories',
        'tenant_config'
      ];

      for (const table of tablesToDelete) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('tenant_id', tenantId);
        
        if (error) throw error;
      }

      // Finally delete the tenant itself
      const { error: tenantDeleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (tenantDeleteError) throw tenantDeleteError;

      console.log('✅ Tenant deleted successfully');
      return { success: true, message: 'Tenant deleted successfully' };

    } catch (error) {
      console.error('❌ Error deleting tenant:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new TenantManager();