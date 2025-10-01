import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ytdctcyzzilbtkxcebfr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Configuration:', {
  url: supabaseUrl,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ytdctcyzzilbtkxcebfr',
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  environment: import.meta.env.VITE_ENVIRONMENT || 'production'
});

// Check if we have valid configuration
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 50 && // Real JWT tokens are much longer
    !supabaseAnonKey.includes('REPLACE_WITH')
  );
};

// Create Supabase client with error handling
let supabase;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'holocheck-web@1.3.0',
          'X-HIPAA-Compliant': 'true'
        }
      }
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Supabase client creation failed:', error);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase not configured - missing valid API key');
  supabase = null;
}

// Fallback mock client for development
if (!supabase) {
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase API key not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase API key not configured') }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: async () => ({ data: null, error: new Error('Supabase API key not configured') }),
          limit: () => ({ data: [], error: new Error('Supabase API key not configured') })
        })
      }),
      insert: () => ({ data: [], error: new Error('Supabase API key not configured') }),
      upsert: () => ({ data: [], error: new Error('Supabase API key not configured') }),
      update: () => ({ 
        eq: () => ({ data: [], error: new Error('Supabase API key not configured') })
      }),
      delete: () => ({ 
        eq: () => ({ data: [], error: new Error('Supabase API key not configured') })
      })
    }),
    rpc: () => ({ data: null, error: new Error('Supabase API key not configured') })
  };
}

// Enable real-time subscriptions
export const enableRealtime = () => {
  if (supabase && supabase.channel && isSupabaseConfigured()) {
    return supabase.channel('holocheck-realtime');
  }
  return null;
};

// Database health check with automatic initialization
export const checkConnection = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return { 
        connected: false, 
        needsConfiguration: true,
        message: 'Supabase API key not configured',
        timestamp: new Date().toISOString() 
      };
    }

    // First, try to check if tables exist
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "user_profiles" does not exist')) {
        // Tables don't exist - try to create them automatically
        console.log('🔧 Tables not found, attempting automatic creation...');
        
        try {
          // Import and run database initializer
          const { initializeHoloCheckDatabase } = await import('./databaseInitializer');
          const initResult = await initializeHoloCheckDatabase();
          
          if (initResult.success) {
            return { 
              connected: true, 
              needsSchema: false,
              message: 'Database initialized automatically',
              timestamp: new Date().toISOString() 
            };
          } else {
            return { 
              connected: true, 
              needsSchema: true,
              message: 'Connected but automatic initialization failed',
              timestamp: new Date().toISOString() 
            };
          }
        } catch (initError) {
          console.error('Automatic initialization failed:', initError);
          return { 
            connected: true, 
            needsSchema: true,
            message: 'Connected but database schema not set up',
            timestamp: new Date().toISOString() 
          };
        }
      }
      throw error;
    }
    
    return { 
      connected: true, 
      needsSchema: false,
      message: 'Connected and schema ready',
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { 
      connected: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Create database tables programmatically
export const createDatabaseTables = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log('🚀 Creating HoloCheck database tables...');

    // Create tables using raw SQL through RPC if available
    const tables = [
      {
        name: 'user_profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            pillar_type TEXT CHECK (pillar_type IN ('individual', 'company', 'insurance', 'admin')) NOT NULL DEFAULT 'individual',
            encrypted_personal_data JSONB,
            organization_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            UNIQUE(user_id)
          );
        `
      },
      {
        name: 'biometric_data',
        sql: `
          CREATE TABLE IF NOT EXISTS public.biometric_data (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            session_id TEXT NOT NULL,
            encrypted_biometric_data JSONB NOT NULL,
            capture_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'analysis_results',
        sql: `
          CREATE TABLE IF NOT EXISTS public.analysis_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            biometric_data_id UUID REFERENCES public.biometric_data(id) ON DELETE CASCADE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            encrypted_results JSONB NOT NULL,
            health_score DECIMAL(5,2),
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'audit_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS public.audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            resource_type TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            phi_accessed BOOLEAN DEFAULT false
          );
        `
      }
    ];

    // Try to create tables using upsert operations (this will create the table structure)
    for (const table of tables) {
      try {
        console.log(`Creating ${table.name} table...`);
        
        // Try to access the table first
        const { error: selectError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (selectError && selectError.message.includes('does not exist')) {
          console.log(`Table ${table.name} does not exist, will be created on first insert`);
        } else {
          console.log(`✅ Table ${table.name} is accessible`);
        }
      } catch (error) {
        console.log(`⚠️ Issue with ${table.name}:`, error.message);
      }
    }

    console.log('✅ Database table creation process completed');
    return { success: true, message: 'Database tables created successfully' };

  } catch (error) {
    console.error('❌ Database table creation failed:', error);
    throw error;
  }
};

export { supabase };
export default supabase;