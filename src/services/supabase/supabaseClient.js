import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development'
});

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error(`
    Missing Supabase configuration. Please ensure you have:
    - VITE_SUPABASE_URL in your .env.local file
    - VITE_SUPABASE_ANON_KEY in your .env.local file
    
    Current values:
    - URL: ${supabaseUrl || 'NOT SET'}
    - Key: ${supabaseAnonKey ? 'SET' : 'NOT SET'}
  `);
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Enable real-time subscriptions
export const enableRealtime = () => {
  return supabase.channel('holocheck-realtime');
};

// Database health check with detailed diagnostics
export const checkConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data: basicTest, error: basicError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (basicError) {
      console.error('❌ Basic connection test failed:', basicError);
      
      // Check if it's a schema issue
      if (basicError.message.includes('relation "user_profiles" does not exist')) {
        return {
          connected: true,
          schemaExists: false,
          error: 'Database connected but schema not created. Please run the SQL scripts.',
          recommendation: 'Execute HoloCheck_Supabase_SQL_Scripts.sql in Supabase SQL Editor'
        };
      }
      
      return {
        connected: false,
        error: basicError.message,
        code: basicError.code
      };
    }
    
    // Test RLS policies
    const { data: rlsTest, error: rlsError } = await supabase.rpc('check_user_permission', {
      required_permission: 'read_own_data'
    });
    
    console.log('✅ Supabase connection successful');
    
    return {
      connected: true,
      schemaExists: true,
      rlsEnabled: !rlsError,
      timestamp: new Date().toISOString(),
      features: {
        basicConnection: true,
        schemaExists: true,
        rlsPolicies: !rlsError,
        realtime: true
      }
    };
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test authentication system
export const testAuthentication = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    return {
      authEnabled: true,
      currentSession: !!session,
      user: session?.user || null,
      error: error?.message || null
    };
  } catch (error) {
    return {
      authEnabled: false,
      error: error.message
    };
  }
};

// Get project info
export const getProjectInfo = () => {
  const url = new URL(supabaseUrl);
  const projectId = url.hostname.split('.')[0];
  
  return {
    projectId,
    url: supabaseUrl,
    region: url.hostname.includes('supabase.co') ? 'Global' : 'Custom',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  };
};

export default supabase;