import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqrdchumuxznyjwgkxrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcmRjaHVtdXh6bnlqd2dreHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODg5NjQsImV4cCI6MjA0ODQ2NDk2NH0.Toh8QcmExil4Dhe0y7GRRvot-8GGdM_G5oW1UzhVPAE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});