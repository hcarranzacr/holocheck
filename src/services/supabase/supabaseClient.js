import { createClient } from '@supabase/supabase-js';

// Correct Supabase project configuration
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
      update: () => ({ 
        eq: () => ({ data: [], error: new Error('Supabase API key not configured') })
      }),
      delete: () => ({ 
        eq: () => ({ data: [], error: new Error('Supabase API key not configured') })
      })
    })
  };
}

// Enable real-time subscriptions
export const enableRealtime = () => {
  if (supabase && supabase.channel && isSupabaseConfigured()) {
    return supabase.channel('holocheck-realtime');
  }
  return null;
};

// Database health check
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

    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "user_profiles" does not exist')) {
        return { 
          connected: true, 
          needsSchema: true,
          message: 'Connected but database schema not set up',
          timestamp: new Date().toISOString() 
        };
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

export { supabase };
export default supabase;