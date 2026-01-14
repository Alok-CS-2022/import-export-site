import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Load from environment variables (set these in your deployment)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
