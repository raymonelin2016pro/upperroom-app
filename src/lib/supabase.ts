import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://maooqhfuotddouudwgad.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb29xaGZ1b3RkZG91dWR3Z2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mzg1MTYsImV4cCI6MjA4NTIxNDUxNn0.y679oToq3RmRmX1JDG504Y5INXEYgbjMU6s2L6vipaE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
