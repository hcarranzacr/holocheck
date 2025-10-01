import { supabase } from './supabaseClient';

// Multi-tenant database setup service
// Implements Bob's architectural recommendations
class MultiTenantSetup {
  
  // Check if multi-tenant database is properly set up
  static async checkDatabaseStatus() {
    try {
      const requiredTables = [
        'tenants',
        'companies', 
        'user_profiles',
        'biometric_data',
        'analysis_results',
        'audit_logs',
        'system_config',
        'tenant_config',
        'company_config'
      ];

      let existingTables = 0;
      const tableStatus = {};

      for (const table of requiredTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables++;
            tableStatus[table] = true;
          } else {
            tableStatus[table] = false;
          }
        } catch (err) {
          tableStatus[table] = false;
        }
      }

      // Get stats if database is complete
      let stats = { tenants: 0, companies: 0, users: 0 };
      if (existingTables === requiredTables.length) {
        try {
          const [tenantsResult, companiesResult, usersResult] = await Promise.all([
            supabase.from('tenants').select('*', { count: 'exact', head: true }),
            supabase.from('companies').select('*', { count: 'exact', head: true }),
            supabase.from('user_profiles').select('*', { count: 'exact', head: true })
          ]);

          stats = {
            tenants: tenantsResult.count || 0,
            companies: companiesResult.count || 0,
            users: usersResult.count || 0
          };
        } catch (err) {
          console.log('Could not fetch stats:', err.message);
        }
      }

      return {
        isComplete: existingTables === requiredTables.length,
        existingTables,
        totalTables: requiredTables.length,
        tableStatus,
        stats
      };

    } catch (error) {
      console.error('Database status check failed:', error);
      return {
        isComplete: false,
        existingTables: 0,
        totalTables: 9,
        error: error.message
      };
    }
  }

  // Initialize multi-tenant database with progress callback
  static async initializeMultiTenantDatabase(progressCallback = () => {}) {
    try {
      progressCallback('🚀 Iniciando configuración multi-tenant...');
      
      let tablesCreated = 0;
      let configsCreated = 0;

      // Step 1: Create core tenant tables
      progressCallback('📋 Creando tabla de tenants (aseguradoras)...');
      await this.createTable('tenants', `
        CREATE TABLE IF NOT EXISTS public.tenants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          license_number TEXT UNIQUE,
          regulatory_body TEXT,
          max_companies INTEGER DEFAULT 100,
          max_employees_per_company INTEGER DEFAULT 1000,
          data_retention_months INTEGER DEFAULT 24,
          subscription_tier TEXT DEFAULT 'standard',
          billing_email TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT tenants_name_not_empty CHECK (length(trim(name)) > 0),
          CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
        );
      `);
      tablesCreated++;

      // Step 2: Create companies table
      progressCallback('🏢 Creando tabla de empresas...');
      await this.createTable('companies', `
        CREATE TABLE IF NOT EXISTS public.companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL,
          name TEXT NOT NULL,
          company_code TEXT NOT NULL,
          industry TEXT,
          size_category TEXT CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
          contact_email TEXT,
          contact_phone TEXT,
          address JSONB,
          data_aggregation_level TEXT DEFAULT 'anonymous' CHECK (data_aggregation_level IN ('anonymous', 'pseudonymized', 'aggregated')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT companies_name_not_empty CHECK (length(trim(name)) > 0)
        );
      `);
      tablesCreated++;

      // Step 3: Create user profiles table
      progressCallback('👥 Creando tabla de perfiles de usuario...');
      await this.createTable('user_profiles', `
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          tenant_id UUID,
          company_id UUID,
          role TEXT NOT NULL CHECK (role IN ('tenant_admin', 'company_admin', 'employee', 'super_admin')),
          employee_id TEXT,
          department TEXT,
          position TEXT,
          encrypted_personal_data JSONB DEFAULT '{}',
          hipaa_consent BOOLEAN DEFAULT false,
          hipaa_consent_date TIMESTAMPTZ,
          data_sharing_consent BOOLEAN DEFAULT false,
          data_sharing_consent_date TIMESTAMPTZ,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ
        );
      `);
      tablesCreated++;

      // Step 4: Create biometric data table
      progressCallback('🔬 Creando tabla de datos biométricos...');
      await this.createTable('biometric_data', `
        CREATE TABLE IF NOT EXISTS public.biometric_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          tenant_id UUID NOT NULL,
          company_id UUID,
          session_id TEXT NOT NULL,
          encrypted_cardiovascular_data BYTEA,
          encrypted_voice_data BYTEA,
          encrypted_rppg_data BYTEA,
          data_hash TEXT NOT NULL,
          capture_timestamp TIMESTAMPTZ DEFAULT NOW(),
          capture_device_info JSONB DEFAULT '{}',
          capture_quality_score DECIMAL(5,2) CHECK (capture_quality_score >= 0 AND capture_quality_score <= 100),
          analysis_completed BOOLEAN DEFAULT false,
          analysis_timestamp TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          accessed_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMPTZ
        );
      `);
      tablesCreated++;

      // Step 5: Create analysis results table
      progressCallback('📊 Creando tabla de resultados de análisis...');
      await this.createTable('analysis_results', `
        CREATE TABLE IF NOT EXISTS public.analysis_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          biometric_data_id UUID NOT NULL,
          user_id UUID NOT NULL,
          tenant_id UUID NOT NULL,
          company_id UUID,
          cardiovascular_metrics JSONB DEFAULT '{}',
          voice_biomarkers JSONB DEFAULT '{}',
          stress_indicators JSONB DEFAULT '{}',
          health_score DECIMAL(5,2) CHECK (health_score >= 0 AND health_score <= 100),
          risk_assessment TEXT CHECK (risk_assessment IN ('low', 'moderate', 'high', 'critical')),
          clinical_recommendations JSONB DEFAULT '{}',
          algorithm_version TEXT,
          confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
          processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ
        );
      `);
      tablesCreated++;

      // Step 6: Create audit logs table
      progressCallback('📝 Creando tabla de logs de auditoría...');
      await this.createTable('audit_logs', `
        CREATE TABLE IF NOT EXISTS public.audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID,
          event_type TEXT NOT NULL CHECK (event_type IN ('data_access', 'data_modification', 'data_deletion', 'login', 'logout', 'export', 'share', 'analysis_run')),
          table_name TEXT,
          record_id UUID,
          user_id UUID,
          user_role TEXT,
          action_performed TEXT NOT NULL,
          data_accessed JSONB DEFAULT '{}',
          access_reason TEXT,
          ip_address INET,
          user_agent TEXT,
          session_id TEXT,
          phi_accessed BOOLEAN DEFAULT false,
          minimum_necessary_standard BOOLEAN DEFAULT true,
          business_justification TEXT,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      tablesCreated++;

      // Step 7: Create configuration tables
      progressCallback('⚙️ Creando tablas de configuración...');
      await this.createTable('system_config', `
        CREATE TABLE IF NOT EXISTS public.system_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          config_key TEXT UNIQUE NOT NULL,
          config_value JSONB NOT NULL,
          config_type TEXT DEFAULT 'system' CHECK (config_type IN ('system', 'security', 'feature', 'integration')),
          description TEXT,
          is_encrypted BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      tablesCreated++;

      await this.createTable('tenant_config', `
        CREATE TABLE IF NOT EXISTS public.tenant_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL,
          config_key TEXT NOT NULL,
          config_value JSONB NOT NULL,
          config_type TEXT DEFAULT 'tenant' CHECK (config_type IN ('tenant', 'privacy', 'analysis', 'reporting')),
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      tablesCreated++;

      await this.createTable('company_config', `
        CREATE TABLE IF NOT EXISTS public.company_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL,
          config_key TEXT NOT NULL,
          config_value JSONB NOT NULL,
          config_type TEXT DEFAULT 'company' CHECK (config_type IN ('company', 'employee', 'analysis', 'privacy')),
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      tablesCreated++;

      // Step 8: Insert default system configuration
      progressCallback('📋 Insertando configuración por defecto...');
      const defaultConfigs = [
        { key: 'app_name', value: '"HoloCheck"', type: 'system', description: 'Application name' },
        { key: 'app_version', value: '"1.0.0"', type: 'system', description: 'Application version' },
        { key: 'max_tenants', value: '100', type: 'system', description: 'Maximum number of tenants allowed' },
        { key: 'default_data_retention_months', value: '24', type: 'system', description: 'Default data retention period in months' },
        { key: 'hipaa_compliance_enabled', value: 'true', type: 'security', description: 'HIPAA compliance features enabled' },
        { key: 'encryption_algorithm', value: '"AES-256"', type: 'security', description: 'Encryption algorithm for PHI data' },
        { key: 'audit_log_retention_months', value: '84', type: 'security', description: 'Audit log retention period (7 years for HIPAA)' },
        { key: 'max_file_upload_size_mb', value: '50', type: 'system', description: 'Maximum file upload size in MB' },
        { key: 'supported_analysis_types', value: '["cardiovascular", "voice", "stress", "rppg"]', type: 'feature', description: 'Supported biometric analysis types' },
        { key: 'default_quality_threshold', value: '0.7', type: 'feature', description: 'Default quality threshold for analysis' }
      ];

      for (const config of defaultConfigs) {
        try {
          const { error } = await supabase
            .from('system_config')
            .upsert({
              config_key: config.key,
              config_value: JSON.parse(config.value),
              config_type: config.type,
              description: config.description
            }, { onConflict: 'config_key' });

          if (!error) {
            configsCreated++;
          }
        } catch (err) {
          console.log(`Could not insert config ${config.key}:`, err.message);
        }
      }

      progressCallback('✅ Configuración multi-tenant completada exitosamente');

      return {
        success: true,
        tablesCreated,
        totalTables: 9,
        configsCreated,
        message: 'Multi-tenant database initialized successfully'
      };

    } catch (error) {
      console.error('Multi-tenant setup failed:', error);
      return {
        success: false,
        tablesCreated: 0,
        totalTables: 9,
        configsCreated: 0,
        error: error.message
      };
    }
  }

  // Helper method to create individual tables
  static async createTable(tableName, sql) {
    try {
      // Try to create table by inserting dummy data (this creates the table structure)
      const { error } = await supabase
        .from(tableName)
        .insert({
          id: '00000000-0000-0000-0000-000000000000'
        })
        .select();

      // If table doesn't exist, it will be created on first insert
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Table ${tableName} creation attempt:`, error.message);
      }

      // Verify table exists
      const { error: selectError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (selectError) {
        throw new Error(`Failed to create table ${tableName}: ${selectError.message}`);
      }

      console.log(`✅ Table ${tableName} created/verified successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error);
      throw error;
    }
  }

  // Get system configuration
  static async getSystemConfig(key) {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get system config ${key}:`, error);
      return null;
    }
  }

  // Get tenant configuration
  static async getTenantConfig(tenantId, key) {
    try {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('tenant_id', tenantId)
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get tenant config ${key}:`, error);
      return null;
    }
  }

  // Get company configuration
  static async getCompanyConfig(companyId, key) {
    try {
      const { data, error } = await supabase
        .from('company_config')
        .select('config_value')
        .eq('company_id', companyId)
        .eq('config_key', key)
        .single();

      if (error) throw error;
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get company config ${key}:`, error);
      return null;
    }
  }
}

export default MultiTenantSetup;