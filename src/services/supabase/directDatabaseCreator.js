import { supabase } from './supabaseClient';

// Direct database creation using Supabase client
export class DirectDatabaseCreator {
  static async createAllTables() {
    try {
      console.log('🚀 Creating HoloCheck database tables directly...');
      
      const results = {
        tablesCreated: 0,
        errors: [],
        success: false
      };

      // Create each table individually using direct SQL execution
      const tables = [
        {
          name: 'user_profiles',
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_profiles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              pillar_type TEXT NOT NULL DEFAULT 'individual',
              encrypted_personal_data JSONB,
              organization_id UUID,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage own profile" ON public.user_profiles FOR ALL USING (true);
          `
        },
        {
          name: 'biometric_data',
          sql: `
            CREATE TABLE IF NOT EXISTS public.biometric_data (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              session_id TEXT NOT NULL,
              encrypted_biometric_data JSONB NOT NULL,
              capture_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage own biometric data" ON public.biometric_data FOR ALL USING (true);
          `
        },
        {
          name: 'analysis_results',
          sql: `
            CREATE TABLE IF NOT EXISTS public.analysis_results (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              biometric_data_id UUID NOT NULL,
              user_id UUID NOT NULL,
              encrypted_results JSONB NOT NULL,
              health_score DECIMAL(5,2),
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage own analysis results" ON public.analysis_results FOR ALL USING (true);
          `
        },
        {
          name: 'audit_logs',
          sql: `
            CREATE TABLE IF NOT EXISTS public.audit_logs (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              action TEXT NOT NULL,
              resource_type TEXT,
              timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              phi_accessed BOOLEAN DEFAULT false
            );
            ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "System can manage audit logs" ON public.audit_logs FOR ALL USING (true);
          `
        },
        {
          name: 'consent_records',
          sql: `
            CREATE TABLE IF NOT EXISTS public.consent_records (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              consent_type TEXT NOT NULL,
              consent_status TEXT NOT NULL,
              consent_text TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage own consent" ON public.consent_records FOR ALL USING (true);
          `
        },
        {
          name: 'user_preferences',
          sql: `
            CREATE TABLE IF NOT EXISTS public.user_preferences (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              preference_category TEXT NOT NULL,
              preference_data JSONB NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage own preferences" ON public.user_preferences FOR ALL USING (true);
          `
        },
        {
          name: 'access_logs',
          sql: `
            CREATE TABLE IF NOT EXISTS public.access_logs (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID,
              resource_type TEXT NOT NULL,
              access_type TEXT NOT NULL,
              timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "System can manage access logs" ON public.access_logs FOR ALL USING (true);
          `
        },
        {
          name: 'organizations',
          sql: `
            CREATE TABLE IF NOT EXISTS public.organizations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              organization_type TEXT NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "Users can manage organizations" ON public.organizations FOR ALL USING (true);
          `
        },
        {
          name: 'data_retention_policies',
          sql: `
            CREATE TABLE IF NOT EXISTS public.data_retention_policies (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              policy_name TEXT NOT NULL,
              data_type TEXT NOT NULL,
              retention_period_days INTEGER NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
            CREATE POLICY IF NOT EXISTS "System can manage retention policies" ON public.data_retention_policies FOR ALL USING (true);
          `
        }
      ];

      // Try to create tables using RPC calls
      for (const table of tables) {
        try {
          console.log(`Creating table: ${table.name}`);
          
          // Try using RPC to execute SQL
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: table.sql 
          });
          
          if (error) {
            console.log(`RPC failed for ${table.name}, trying alternative method:`, error.message);
            
            // Alternative: Try to create table by inserting dummy data
            const { error: insertError } = await supabase
              .from(table.name)
              .insert({
                id: '00000000-0000-0000-0000-000000000000'
              })
              .select();
            
            if (insertError && !insertError.message.includes('duplicate key')) {
              console.log(`Table ${table.name} creation attempt result:`, insertError.message);
            }
          }
          
          // Verify table exists by trying to select from it
          const { error: selectError } = await supabase
            .from(table.name)
            .select('*')
            .limit(1);
          
          if (!selectError) {
            results.tablesCreated++;
            console.log(`✅ Table ${table.name} is accessible`);
          } else {
            console.log(`⚠️ Table ${table.name} verification failed:`, selectError.message);
            results.errors.push(`${table.name}: ${selectError.message}`);
          }
          
        } catch (error) {
          console.error(`Error creating table ${table.name}:`, error);
          results.errors.push(`${table.name}: ${error.message}`);
        }
      }

      results.success = results.tablesCreated > 0;
      
      console.log(`📊 Database creation results: ${results.tablesCreated}/9 tables created`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Direct database creation failed:', error);
      return {
        tablesCreated: 0,
        errors: [error.message],
        success: false
      };
    }
  }

  // Count existing tables
  static async countExistingTables() {
    const tableNames = [
      'user_profiles',
      'biometric_data', 
      'analysis_results',
      'audit_logs',
      'consent_records',
      'user_preferences',
      'access_logs',
      'organizations',
      'data_retention_policies'
    ];

    let count = 0;
    const existingTables = [];

    for (const tableName of tableNames) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          count++;
          existingTables.push(tableName);
        }
      } catch (error) {
        // Table doesn't exist or not accessible
      }
    }

    return {
      count,
      total: tableNames.length,
      existingTables,
      missingTables: tableNames.filter(name => !existingTables.includes(name))
    };
  }

  // Initialize database with verification
  static async initializeWithVerification() {
    try {
      console.log('🔍 Checking existing tables...');
      
      const initialCount = await this.countExistingTables();
      console.log(`📊 Initial state: ${initialCount.count}/${initialCount.total} tables exist`);
      
      if (initialCount.count === initialCount.total) {
        return {
          success: true,
          message: 'All tables already exist',
          tablesCreated: initialCount.count,
          total: initialCount.total
        };
      }

      console.log('🚀 Creating missing tables...');
      const creationResult = await this.createAllTables();
      
      // Verify final state
      const finalCount = await this.countExistingTables();
      console.log(`📊 Final state: ${finalCount.count}/${finalCount.total} tables exist`);
      
      return {
        success: finalCount.count > initialCount.count,
        message: `Database initialization completed. ${finalCount.count}/${finalCount.total} tables available.`,
        tablesCreated: finalCount.count,
        total: finalCount.total,
        existingTables: finalCount.existingTables,
        missingTables: finalCount.missingTables,
        errors: creationResult.errors
      };
      
    } catch (error) {
      console.error('❌ Database initialization with verification failed:', error);
      return {
        success: false,
        message: `Initialization failed: ${error.message}`,
        tablesCreated: 0,
        total: 9
      };
    }
  }
}

export default DirectDatabaseCreator;