import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqvmqbwmkzgquncczwza.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xdm1xYndta3pncXVuY2N6d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzE5NjUsImV4cCI6MjA5Mzc0Nzk2NX0.q80jO2iCpWdIIu5b6dfML2xC4EG4rveOeH1fnLHRJlM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)