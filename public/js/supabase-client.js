// Supabase Client Initialization
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Get these from your Supabase project settings → API
const supabaseUrl = 'https://tpvqolkzcbbzlqlzchwc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdnFvbGt6Y2JiemxxbHpjaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjA0MjgsImV4cCI6MjA4MTkzNjQyOH0.AU6ieHN1TSUHgSu7qfvkekvmMySDPJb2zOId4Oy7CeY'

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Make it globally available
window.supabase = supabase

console.log('Supabase initialized:', !!supabase)

export { supabase }