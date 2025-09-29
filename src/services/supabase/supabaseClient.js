import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

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
      'X-Client-Info': 'holocheck-web@1.3.0'
    }
  }
});

// Enable real-time subscriptions
export const enableRealtime = () => {
  return supabase.channel('holocheck-realtime');
};

// Database health check
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return { connected: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { connected: false, error: error.message };
  }
};

export default supabase;