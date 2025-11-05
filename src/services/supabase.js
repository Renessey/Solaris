import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tyliqkzuwqzupuwsosxm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bGlxa3p1d3F6dXB1d3Nvc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODMyMzYsImV4cCI6MjA3NzY1OTIzNn0.rWYhxK9HPOgRdVHO-GXxqKu2W52uBoyNZW2CT-qt_Uk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
