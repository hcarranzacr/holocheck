import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real Supabase credentials
const hasRealCredentials = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.includes('.supabase.co');

// Create Supabase client with error handling
let supabase = null;

try {
  if (hasRealCredentials) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-HIPAA-Compliant': 'true'
        }
      }
    });
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.warn('⚠️ Supabase credentials not configured - using mock client');
    // Create a mock client for development
    supabase = createMockSupabaseClient();
  }
} catch (error) {
  console.error('❌ Error initializing Supabase client:', error);
  supabase = createMockSupabaseClient();
}

// Mock Supabase client for development without real credentials
function createMockSupabaseClient() {
  return {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      refreshSession: async () => ({ data: null, error: new Error('Supabase not configured') })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: async () => ({ data: null, error: new Error('Supabase not configured') }),
          limit: () => ({ data: [], error: new Error('Supabase not configured') }),
          order: () => ({ data: [], error: new Error('Supabase not configured') })
        }),
        insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ 
          eq: async () => ({ data: null, error: new Error('Supabase not configured') })
        }),
        delete: () => ({ 
          eq: async () => ({ data: null, error: new Error('Supabase not configured') })
        })
      })
    }),
    rpc: async () => ({ data: null, error: new Error('Supabase not configured') })
  };
}

// Health check function
export const checkSupabaseConnection = async () => {
  if (!hasRealCredentials) {
    return {
      status: 'disconnected',
      message: 'Supabase credentials not configured',
      hasCredentials: false
    };
  }

  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error && error.message.includes('relation "user_profiles" does not exist')) {
      return {
        status: 'connected_no_schema',
        message: 'Connected but database schema not set up',
        hasCredentials: true,
        needsSchema: true
      };
    }
    
    if (error) {
      return {
        status: 'error',
        message: error.message,
        hasCredentials: true
      };
    }
    
    return {
      status: 'connected',
      message: 'Supabase connection successful',
      hasCredentials: true
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      hasCredentials: true
    };
  }
};

// Export connection status
export const isSupabaseConfigured = hasRealCredentials;

export { supabase };
export default supabase;