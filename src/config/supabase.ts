import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your_supabase') || 
    supabaseAnonKey.includes('your_supabase')) {
  console.error('❌ SUPABASE CONFIGURATION ERROR ❌');
  console.error('Please update your .env file with actual Supabase credentials:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings > API');
  console.error('4. Copy your Project URL and anon/public key');
  console.error('5. Update the .env file in Frontend folder');
  console.error('6. Restart the dev server (npm run dev)');
  throw new Error('Missing or invalid Supabase environment variables. Check console for details.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
