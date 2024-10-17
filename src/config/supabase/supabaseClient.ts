import { createClient } from '@supabase/supabase-js';

// Make sure to replace these values with your actual Supabase project values
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL; // Ensure this is defined in your .env file
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY; // Ensure this is defined in your .env file

// Check for undefined values
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and API key must be defined in the environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
