import { createClient } from '@supabase/supabase-js'

// Your Supabase project credentials
// Project URL is derived from your project reference ID
const SUPABASE_URL = 'https://lkaqliqkpkqlbcxcpsnm.supabase.co'

// Anon public key - safe to use in frontend (row-level security protects your data)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYXFsaXFrcGtxbGJjeGNwc25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMzAwNjcsImV4cCI6MjA5OTkwNjA2N30.24k3E_TJUartLDJa0g0MxG0M1t-38Gm__yJpgUzMcEg'

// Create and export the Supabase client
// This single instance is reused across the entire app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
